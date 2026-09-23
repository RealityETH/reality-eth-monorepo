import { test, expect } from '@playwright/test';
import { walletMockScript } from './setup/wallet-mock.js';
import { TEST_ACCOUNT } from './setup/anvil.js';
import { CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// ── Bug #1: buildArbitrationForm referenced `isHash` without declaring it ──────
//
// The hash answer type was ported into buildAnswerForm (which declares
// `const isHash = ...`) and buildArbitrationForm (which did NOT). For a hash-type
// question under arbitration, clicking "Arbitrate" evaluated the `else if (isHash)`
// branch and threw a ReferenceError, so the ruling form never rendered.
//
// We drive this via a mocked Ponder response so we can put a hash-type question
// into the pending-arbitration state with a non-self arbitrator (the only state
// in which the "Arbitrate" link appears).
test.describe('arbitration form: hash-type question', () => {
  const QUESTION_ID = '0x' + '11'.repeat(32);
  const ARBITRATOR  = '0x00000000000000000000000000000000000abcde'; // non-zero, non-self
  const HASH_ANSWER = '0x' + 'ab'.repeat(32);
  const HASH_TEMPLATE = '{"title": "%s", "type": "hash", "category": "%s", "lang": "%s"}';

  async function mockHashQuestion(page) {
    await page.addInitScript(walletMockScript());
    await page.route('**/graphql**', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      // Secondary fetch: fetchTemplateStr for markdown title rendering.
      if ((body.query || '').includes('template(id:')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { template: { questionText: HASH_TEMPLATE } } }),
        });
      }
      // Primary fetch: a hash-type question that is pending arbitration.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            question: {
              templateId:                     '5',
              data:                           'Hash arbitration test',
              title:                          'Hash arbitration test',
              type:                           'hash',
              category:                       'misc',
              lang:                           'en_US',
              outcomes:                       null,
              questionJson:                   JSON.stringify({ title: 'Hash arbitration test', type: 'hash', category: 'misc', lang: 'en_US' }),
              creator:                        TEST_ACCOUNT.address,
              arbitrator:                     ARBITRATOR,
              openingTimestamp:               '0',
              timeout:                        '86400',
              currentAnswer:                  HASH_ANSWER,
              currentAnswerBond:              '1000000000000000',
              historyHash:                    '0x' + 'cd'.repeat(32),
              minBond:                        '0',
              bounty:                         '0',
              scheduledFinalizationTimestamp: '0',
              isPendingArbitration:           true,
              arbitrationOccurred:            false,
              createdBlock:                   null,
              createdLogIndex:                null,
              createdTxHash:                  null,
              createdTimestamp:               null,
              reopensQuestionId:              null,
            },
            responses: { items: [{
              answer:         HASH_ANSWER,
              commitmentHash: null,
              bond:           '1000000000000000',
              user:           TEST_ACCOUNT.address,
              historyHash:    '0x' + 'cd'.repeat(32),
              isCommitment:   false,
              isUnrevealed:   false,
              timestamp:      '1780000000',
              createdBlock:   null,
              createdLogIndex: null,
              createdTxHash:  null,
            }] },
            claims:    { items: [] },
            reopeners: { items: [] },
          },
        }),
      });
    });

    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth32}-${QUESTION_ID}`
    );
  }

  test('clicking "Arbitrate" renders the ruling form with a hash input', async ({ page }) => {
    await mockHashQuestion(page);

    // Pending-arbitration notice + Arbitrate link appear once a wallet is connected.
    const arbLink = page.locator('.arb-rule-link');
    await expect(arbLink).toBeVisible({ timeout: 30000 });

    await arbLink.click();

    // Before the fix this threw a ReferenceError (isHash undefined) and the form
    // never appeared. After the fix the hash ruling form renders.
    await expect(page.locator('.arb-ruling-form')).toBeVisible();
    await expect(page.locator('.arb-ruling-form .hash-input')).toBeVisible();
  });
});

// ── Bug #2: hash answer type gating on the ask page ───────────────────────────
//
// Whether the "Hash" answer type is offered is a version feature-detection
// question owned by @reality.eth/contracts (versionHasFeature(ver, 'hash-type'),
// exposed to the frontend as window.RealityContracts). The ask page must defer to
// it rather than hand-rolling its own version parsing.
const ASK_URL = `${WEBSITE_URL}/index.html#!/ask`;

async function loadAskPage(page) {
  await page.addInitScript(walletMockScript());
  await page.route('**/graphql**', route =>
    route.fulfill({ status: 500, body: 'Internal Server Error' })
  );
  await page.goto(ASK_URL);
  await page.waitForFunction(
    () => document.getElementById('question-arbitrator')?.options.length > 0,
    { timeout: 15000 }
  );
}

test.describe('ask page: hash answer type gating', () => {
  test('the shared version helpers are exposed to the frontend', async ({ page }) => {
    await loadAskPage(page);
    const support = await page.evaluate(() => {
      const rc = window.RealityContracts;
      return {
        hasFeatureFn:  typeof rc?.versionHasFeature === 'function',
        fromKeyFn:     typeof rc?.versionNumberFromKey === 'function',
        // versionHasFeature is strict — it wants a bare "major.minor" number.
        v32:           rc?.versionHasFeature('3.2', 'hash-type'),
        v30:           rc?.versionHasFeature('3.0', 'hash-type'),
        // versionNumberFromKey extracts the bare number from a contract-version key.
        keyPlain:      rc?.versionNumberFromKey('RealityETH-3.2'),
        keyErc20:      rc?.versionNumberFromKey('RealityETH_ERC20-3.0'),
        keyBare:       rc?.versionNumberFromKey('2.1'),
        // Composed: key → number → feature (the pattern the frontend uses).
        composedMinBond30: rc?.versionHasFeature(rc.versionNumberFromKey('RealityETH-3.0'), 'min-bond'),
        composedMinBond21: rc?.versionHasFeature(rc.versionNumberFromKey('RealityETH-2.1'), 'min-bond'),
      };
    });
    expect(support.hasFeatureFn).toBe(true);
    expect(support.fromKeyFn).toBe(true);
    expect(support.v32).toBe(true);
    expect(support.v30).toBe(false);
    expect(support.keyPlain).toBe('3.2');
    expect(support.keyErc20).toBe('3.0');
    expect(support.keyBare).toBe('2.1');
    expect(support.composedMinBond30).toBe(true);
    expect(support.composedMinBond21).toBe(false);
  });

  test('v3.0 (default on Gnosis) disables the Hash option', async ({ page }) => {
    await loadAskPage(page);
    await expect(page.locator('#type-option-hash')).toBeDisabled();
  });

  test('switching to v3.2 enables the Hash option', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#ask-version-select').selectOption('RealityETH-3.2');
    await expect(page.locator('#type-option-hash')).toBeEnabled();
  });

  test('switching back to v3.0 disables the Hash option again', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#ask-version-select').selectOption('RealityETH-3.2');
    await expect(page.locator('#type-option-hash')).toBeEnabled();
    await page.locator('#ask-version-select').selectOption('RealityETH-3.0');
    await expect(page.locator('#type-option-hash')).toBeDisabled();
  });
});
