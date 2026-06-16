import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerHistoryFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// The answered-history-container is gated behind the has-history class on #question-page.
// renderHistory() adds has-history only when n >= 2. A regression that adds it
// unconditionally would show an empty history section for single-answer questions.
test.describe('answer history: has-history class gating', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createAnswerHistoryFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page, questionId) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/question.html#!/network/100/question/${CONTRACTS.realityEth30}-${questionId}`
    );
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
  }

  test('single-answer question does not get has-history class', async ({ page }) => {
    await loadQuestion(page, fixtures.oneAnswerQuestionId);
    await expect(page.locator('#question-page')).not.toHaveClass(/has-history/);
  });

  test('two-answer question gets has-history class', async ({ page }) => {
    await loadQuestion(page, fixtures.twoAnswerQuestionId);
    await expect(page.locator('#question-page')).toHaveClass(/has-history/);
  });

  test('two-answer question shows the history container', async ({ page }) => {
    await loadQuestion(page, fixtures.twoAnswerQuestionId);
    await expect(page.locator('.answered-history-container')).toBeVisible();
  });

  test('two-answer question shows a history entry for the earlier answer', async ({ page }) => {
    await loadQuestion(page, fixtures.twoAnswerQuestionId);
    await page.waitForSelector('.answered-history-item', { timeout: 5000 });
    await expect(
      page.locator('.answered-history-container .answered-history-item')
    ).toBeVisible();
  });
});
