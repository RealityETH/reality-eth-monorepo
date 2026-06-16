import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createUpcomingQuestionFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// Questions with a future opening_ts show a "not yet open" notice in the answer
// slot instead of the bond input.  If isBeforeOpening() or the buildAnswerForm
// before-open branch breaks, users would see a broken or missing form.
test.describe('upcoming question: before opening date', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createUpcomingQuestionFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/question.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
  }

  test('shows a "not yet open" notice in the answer slot', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.before-opening')).toBeVisible();
    await expect(page.locator('.before-opening')).toContainText('not yet open');
  });

  test('does not show the bond input', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.bond-input-field')).toHaveCount(0);
  });

  test('does not show the post answer button', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.post-answer-button')).toHaveCount(0);
  });
});
