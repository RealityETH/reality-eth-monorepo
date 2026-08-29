import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createExpiredCommitFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// The question has a 21-day timeout. The reveal deadline (timeout/8 ≈ 2.6 days after
// the fork block ~Jun 9) is already past relative to the browser clock (~Jun 16), so
// "pending reveal · deadline passed" should NOT appear in the answer banner.
// The answer history entry should still show "reveal deadline passed" in its submeta.
test.describe('commit-reveal display: expired reveal deadline', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createExpiredCommitFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    // Wait until renderHistory has populated the current-answer-container
    await page.waitForFunction(() => {
      const c = document.querySelector('.current-answer-container');
      return c && c.querySelector('.bond-submeta');
    }, { timeout: 30000 });
  }

  test('banner does not show "deadline passed" badge when reveal deadline has expired', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('#answer-banner')).not.toContainText('deadline passed');
  });

  test('answer history submeta shows "reveal deadline passed" for the unrevealed commitment', async ({ page }) => {
    await loadQuestion(page);
    await expect(
      page.locator('.current-answer-container .bond-submeta')
    ).toContainText('reveal deadline passed');
  });
});
