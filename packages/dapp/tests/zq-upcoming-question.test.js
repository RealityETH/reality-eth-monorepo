import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createUpcomingQuestionFixtures, CONTRACTS } from './setup/fixtures.js';
import { QUESTION_URL } from './setup/question-server.js';

test.describe('q: upcoming (not yet open) question', () => {
  test.setTimeout(45000);
  let snap;
  let fixtures;

  test.beforeAll(async () => { fixtures = await createUpcomingQuestionFixtures(); });
  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(`${QUESTION_URL}/question.html?contract=${CONTRACTS.realityEth30}&question=${fixtures.questionId}&network=100`);
    await page.waitForFunction(
      () => document.getElementById('question-page')?.classList.contains('question-state-open'),
      {}, { timeout: 30000 }
    );
    return page.locator('#question-page');
  }

  test('question-state-open is set; question is not finalized', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('#question-page.question-state-open')).toBeVisible();
    await expect(page.locator('#question-page.question-state-finalized')).not.toBeAttached();
  });

  test('before-opening form is shown with "not yet open" message', async ({ page }) => {
    const win = await loadQuestion(page);
    const form = win.locator('.answer-form-container.before-opening.is-open');
    await expect(form).toBeVisible();
    await expect(form).toContainText('not yet open for answers');
  });

  test('opening time label is present in the before-opening form', async ({ page }) => {
    const win = await loadQuestion(page);
    const form = win.locator('.answer-form-container.before-opening.is-open');
    await expect(form.locator('.opening-time-label')).toBeVisible();
  });

  test('answer submit button is absent for a before-opening question', async ({ page }) => {
    const win = await loadQuestion(page);
    await expect(win.locator('button.post-answer-button')).not.toBeAttached();
  });
});
