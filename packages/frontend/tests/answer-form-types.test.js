import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage, walletMockScript } from './setup/wallet-mock.js';
import { createAnswerTypeFixtures, createVisibilityFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

async function loadQuestion(page, contract, questionId) {
  await setupPage(page);
  await page.goto(
    `${WEBSITE_URL}/index.html#!/network/100/question/${contract}-${questionId}`
  );
  await page.waitForSelector('.question-state-open', { timeout: 30000 });
}

// Each question type maps to a different form input.  If the type-detection
// logic (isSelectType / isMulti / isUint / isDatetime) or template parsing
// regresses, users would see the wrong input for their question.
test.describe('answer form: input type per question type', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createAnswerTypeFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  test('bool shows a select with Yes and No options', async ({ page }) => {
    await loadQuestion(page, CONTRACTS.realityEth30, fixtures.boolId);
    const select = page.locator('select[name="input-answer"]');
    await expect(select).toBeVisible();
    await expect(select.locator('option', { hasText: 'Yes' })).toHaveCount(1);
    await expect(select.locator('option', { hasText: 'No' })).toHaveCount(1);
  });

  test('bool v3.0 shows "Answered too soon" and "Invalid" options (sanity check)', async ({ page }) => {
    await loadQuestion(page, CONTRACTS.realityEth30, fixtures.boolId);
    await expect(page.locator('select[name="input-answer"]')).toBeVisible();
    await expect(page.locator('.too-soon-select')).toHaveCount(1);
    await expect(page.locator('.invalid-select')).toHaveCount(1);
  });

  test('single-select shows a select with the named outcomes', async ({ page }) => {
    await loadQuestion(page, CONTRACTS.realityEth30, fixtures.singleSelectId);
    const select = page.locator('select[name="input-answer"]');
    await expect(select).toBeVisible();
    await expect(select.locator('option', { hasText: 'Cat' })).toHaveCount(1);
    await expect(select.locator('option', { hasText: 'Dog' })).toHaveCount(1);
    await expect(select.locator('option', { hasText: 'Fish' })).toHaveCount(1);
  });

  test('multiple-select shows one checkbox per outcome', async ({ page }) => {
    await loadQuestion(page, CONTRACTS.realityEth30, fixtures.multipleSelectId);
    await expect(page.locator('input[type="checkbox"][name="input-answer"]')).toHaveCount(3);
  });

  test('uint shows a number input', async ({ page }) => {
    await loadQuestion(page, CONTRACTS.realityEth30, fixtures.uintId);
    await expect(page.locator('input[type="number"].uint-input')).toBeVisible();
  });

  test('datetime shows a date input', async ({ page }) => {
    await loadQuestion(page, CONTRACTS.realityEth30, fixtures.datetimeId);
    await expect(page.locator('input[type="date"].datetime-input-date')).toBeVisible();
  });
});

// The "Answered too soon" option is only available on v3.0+ contracts.
// The "Invalid" option can be suppressed per-question via has_invalid:false in the template.
// If the version check or template parsing regresses, these options would appear or
// disappear incorrectly, allowing users to submit disallowed answers.
test.describe('answer form: conditional options (v2.1 and has_invalid)', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createVisibilityFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  test('v2.1 bool does not show the "Answered too soon" option', async ({ page }) => {
    await loadQuestion(page, CONTRACTS.realityEth21, fixtures.v21BoolId);
    await expect(page.locator('select[name="input-answer"]')).toBeVisible();
    await expect(page.locator('.too-soon-select')).toHaveCount(0);
  });

  test('has_invalid:false bool does not show the "Invalid" option', async ({ page }) => {
    await loadQuestion(page, CONTRACTS.realityEth30, fixtures.noInvalidBoolId);
    await expect(page.locator('select[name="input-answer"]')).toBeVisible();
    await expect(page.locator('.invalid-select')).toHaveCount(0);
  });
});

// The indexer now stores questionJson (the full output of populatedJSONForTemplate)
// on each question row.  The question page uses parseQuestionJSON(pq.questionJson)
// directly, so has_invalid, decimals, and precision are all correct.
//
// This block mocks a Ponder response that includes questionJson with has_invalid:false
// and verifies the Invalid option is suppressed.
test.describe('answer form: has_invalid:false via Ponder fast-path', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createVisibilityFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  // Simulates the Ponder fast-path: question query returns pre-parsed fields
  // (title, type) so the page builds qjson from those instead of deriving it
  // from the template.  The template query is also mocked and returns the
  // has_invalid:false template — but currently the page never merges
  // has_invalid from the full result back into the partial qjson.
  test('Ponder path: has_invalid:false bool does not show "Invalid" option', async ({ page }) => {
    const NO_INVALID_TEMPLATE =
      '{"title": "%s", "type": "bool", "has_invalid": false, "category": "%s", "lang": "%s"}';
    const questionUrl = `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.noInvalidBoolId}`;

    await page.addInitScript(walletMockScript());
    await page.route('**/graphql**', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      // Secondary fetch: fetchTemplateStr queries template(id: ...) { questionText }
      if ((body.query || '').includes('template(id:')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { template: { questionText: NO_INVALID_TEMPLATE } } }),
        });
      }
      // Primary fetch: question + responses.  Return pre-parsed Ponder fields to
      // trigger the fast-path.  questionJson is what the indexer now stores, so
      // the page can use it directly instead of reconstructing from partial fields.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            question: {
              templateId:                     String(fixtures.noInvalidTemplateId),
              data:                           `Visibility test: has_invalid false␟misc␟en_US`,
              title:                          'Visibility test: has_invalid false',
              type:                           'bool',
              category:                       'misc',
              lang:                           'en_US',
              outcomes:                       null,
              questionJson:                   JSON.stringify({ title: 'Visibility test: has_invalid false', type: 'bool', has_invalid: false, category: 'misc', lang: 'en_US' }),
              arbitrator:                     '0x0000000000000000000000000000000000000000',
              openingTimestamp:               '0',
              timeout:                        '60',
              currentAnswer:                  null,
              currentAnswerBond:              '0',
              minBond:                        '0',
              bounty:                         '1000000000000000000',
              scheduledFinalizationTimestamp: '0',
              isPendingArbitration:           false,
              arbitrationOccurred:            false,
              createdBlock:                   null,
              createdLogIndex:                null,
              createdTxHash:                  null,
              reopensQuestionId:              null,
            },
            responses:  { items: [] },
            claims:     { items: [] },
            reopeners:  { items: [] },
          },
        }),
      });
    });

    await page.goto(questionUrl);
    await page.waitForSelector('.question-state-open', { timeout: 30000 });

    // Before fix: partial qjson has no has_invalid field →
    //   hasInvalidOption() returns true → .invalid-select IS shown → test FAILS.
    // After fix: questionJson from Ponder contains has_invalid:false →
    //   parseQuestionJSON(q.questionJson) returns correct qjson →
    //   hasInvalidOption() returns false → .invalid-select NOT shown → test PASSES.
    await expect(page.locator('select[name="input-answer"]')).toBeVisible();
    await expect(page.locator('.invalid-select')).toHaveCount(0);
  });
});
