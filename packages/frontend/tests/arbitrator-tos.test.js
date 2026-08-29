import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createTOSFixtures, createFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

test.describe('arbitrator TOS link', () => {
  let snap;
  let tosFixtures;
  let baseFixtures;

  test.beforeAll(async () => {
    // Sequential — both use TEST_ACCOUNT; parallel NonceManagers collide on first run
    tosFixtures  = await createTOSFixtures();
    baseFixtures = await createFixtures();
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
});
