import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerHistoryFixtures, CONTRACTS } from './setup/fixtures.js';
import { QUESTION_URL } from './setup/question-server.js';

test.describe('q: answer history display', () => {
  test.setTimeout(45000);
  let snap;
  let fixtures;

  test.beforeAll(async () => { fixtures = await createAnswerHistoryFixtures(); });
  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page, questionId) {
    await setupPage(page);
    await page.goto(`${QUESTION_URL}/question.html?contract=${CONTRACTS.realityEth30}&question=${questionId}&network=100`);
    await page.waitForFunction(
      () => document.getElementById('question-page')?.classList.contains('question-state-open'),
      {}, { timeout: 30000 }
    );
    return page.locator('#question-page');
  }

  test('has-history is absent when question has only 1 answer', async ({ page }) => {
    await loadQuestion(page, fixtures.oneAnswerQuestionId);
    await expect(page.locator('#question-page.has-history')).not.toBeAttached();
  });

  test('has-history is set when question has 2 answers', async ({ page }) => {
    await loadQuestion(page, fixtures.twoAnswerQuestionId);
    await expect(page.locator('#question-page.has-history')).toBeVisible();
  });

  test('exactly one history item appears for a 2-answer question', async ({ page }) => {
    const win = await loadQuestion(page, fixtures.twoAnswerQuestionId);
    await expect(win.locator('.answered-history-item:not(.template-item)')).toHaveCount(1);
  });

  test('history item shows the earlier answer text and bond', async ({ page }) => {
    const win = await loadQuestion(page, fixtures.twoAnswerQuestionId);
    const histItem = win.locator('.answered-history-item:not(.template-item)').first();
    await expect(histItem.locator('.current-answer')).toContainText('Yes');
    await expect(histItem.locator('.answer-bond-value')).toContainText('0.001');
  });

  test('current answer section shows the latest answer', async ({ page }) => {
    const win = await loadQuestion(page, fixtures.twoAnswerQuestionId);
    await expect(win.locator('.current-answer-container .current-answer')).toContainText('No');
    await expect(win.locator('.current-answer-container .answer-bond-value')).toContainText('0.002');
  });
});
