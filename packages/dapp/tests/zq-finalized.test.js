import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createClaimFixtures, CONTRACTS } from './setup/fixtures.js';
import { QUESTION_URL } from './setup/question-server.js';

test.describe('q: finalized question display', () => {
  test.setTimeout(45000);
  let snap;
  let fixtures;

  test.beforeAll(async () => { fixtures = await createClaimFixtures(); });
  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadFinalized(page) {
    await setupPage(page);
    await page.goto(`${QUESTION_URL}/question.html?contract=${CONTRACTS.realityEth30}&question=${fixtures.claimQuestionId}&network=100`);
    await page.waitForFunction(
      () => document.getElementById('question-page')?.classList.contains('question-state-finalized'),
      {}, { timeout: 30000 }
    );
    return page.locator('#question-page');
  }

  test('question-state-finalized is set; question-state-open is not', async ({ page }) => {
    await loadFinalized(page);
    await expect(page.locator('#question-page.question-state-finalized')).toBeVisible();
    await expect(page.locator('#question-page.question-state-open')).not.toBeAttached();
  });

  test('winning answer is displayed as "Yes"', async ({ page }) => {
    const win = await loadFinalized(page);
    await expect(win.locator('.current-answer-container .current-answer')).toContainText('Yes');
  });

  test('answer submit form is not visible for a finalized question', async ({ page }) => {
    const win = await loadFinalized(page);
    await expect(win.locator('button.post-answer-button')).toBeHidden();
  });
});
