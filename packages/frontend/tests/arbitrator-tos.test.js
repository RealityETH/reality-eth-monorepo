import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createTOSFixtures, createMaliciousTOSFixtures, createFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

test.describe('arbitrator TOS link', () => {
  let snap;
  let tosFixtures;
  let baseFixtures;
  let evilTosFixtures;

  test.beforeAll(async () => {
    // Sequential — both use TEST_ACCOUNT; parallel NonceManagers collide on first run
    tosFixtures  = await createTOSFixtures();
    baseFixtures = await createFixtures();
    evilTosFixtures = await createMaliciousTOSFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  async function loadQuestion(page, questionId) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${questionId}`
    );
    await page.waitForSelector('#question-title:not(:empty)', { timeout: 30000 });
  }

  test('TOS link is visible for arbitrator with terms of service', async ({ page }) => {
    await loadQuestion(page, tosFixtures.questionId);
    const tosEl = page.locator('#arb-tos-question');
    await expect(tosEl).toBeVisible({ timeout: 15000 });
  });

  test('TOS link href points to IPFS gateway URL', async ({ page }) => {
    await loadQuestion(page, tosFixtures.questionId);
    await expect(page.locator('#arb-tos-question')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#arb-tos-question-link')).toHaveAttribute(
      'href', tosFixtures.expectedTosUrl
    );
  });

  test('TOS link is hidden for question with no arbitrator', async ({ page }) => {
    await loadQuestion(page, baseFixtures.boolQuestionId);
    // Give enough time for renderArbitratorTOS to run (it resolves quickly for zero address)
    await page.waitForTimeout(2000);
    await expect(page.locator('#arb-tos-question')).toBeHidden();
  });

  // A malicious arbitrator whose metadata tos is a javascript: URL must never become a
  // clickable link (would be click-to-XSS). The frontend only allows http(s) schemes.
  test('javascript: TOS URL is refused, not rendered as a link', async ({ page }) => {
    await loadQuestion(page, evilTosFixtures.questionId);
    await page.waitForTimeout(2000); // let renderArbitratorTOS resolve
    await expect(page.locator('#arb-tos-question')).toBeHidden();
    // And if the element ever shows, its href must not carry a javascript: scheme.
    const href = await page.locator('#arb-tos-question-link').getAttribute('href');
    expect((href || '').toLowerCase()).not.toContain('javascript:');
  });
});
