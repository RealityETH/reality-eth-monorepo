import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerTypeFixtures, createVisibilityFixtures, CONTRACTS } from './setup/fixtures.js';
import { QUESTION_URL } from './setup/question-server.js';

test.describe('q: invalid and answered-too-soon option visibility', () => {
  test.setTimeout(45000);
  let snap;
  let answerFixtures;
  let visFixtures;

  test.beforeAll(async () => {
    answerFixtures = await createAnswerTypeFixtures();
    visFixtures = await createVisibilityFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page, contractAddr, questionId) {
    await setupPage(page);
    await page.goto(`${QUESTION_URL}/question.html?contract=${contractAddr}&question=${questionId}&network=100`);
    await page.waitForFunction(
      () => document.getElementById('question-page')?.classList.contains('question-state-open'),
      {}, { timeout: 30000 }
    );
    return page.locator('#question-page');
  }

  test('v3.0 bool: invalid and answered-too-soon options appear in dropdown', async ({ page }) => {
    const win = await loadQuestion(page, CONTRACTS.realityEth30, answerFixtures.boolId);
    await expect(win.locator('option.invalid-select')).toHaveCount(1);
    await expect(win.locator('option.too-soon-select')).toHaveCount(1);
  });

  test('v2.1 bool: invalid option present, answered-too-soon option absent', async ({ page }) => {
    const win = await loadQuestion(page, CONTRACTS.realityEth21, visFixtures.v21BoolId);
    await expect(win.locator('option.invalid-select')).toHaveCount(1);
    await expect(win.locator('option.too-soon-select')).toHaveCount(0);
  });

  test('v3.0 bool with has_invalid:false template: invalid option absent, answered-too-soon present', async ({ page }) => {
    const win = await loadQuestion(page, CONTRACTS.realityEth30, visFixtures.noInvalidBoolId);
    await expect(win.locator('option.invalid-select')).toHaveCount(0);
    await expect(win.locator('option.too-soon-select')).toHaveCount(1);
  });

  test('v3.0 uint: invalid and answered-too-soon switches are visible', async ({ page }) => {
    const win = await loadQuestion(page, CONTRACTS.realityEth30, answerFixtures.uintId);
    await expect(win.locator('.invalid-switch-container')).toBeVisible();
    await expect(win.locator('.too-soon-switch-container')).toBeVisible();
  });

  test('v2.1 uint: invalid switch visible, answered-too-soon switch hidden', async ({ page }) => {
    const win = await loadQuestion(page, CONTRACTS.realityEth21, visFixtures.v21UintId);
    await expect(win.locator('.invalid-switch-container')).toBeVisible();
    await expect(win.locator('.too-soon-switch-container')).toBeHidden();
  });
});
