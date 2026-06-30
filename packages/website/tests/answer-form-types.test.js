import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
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
