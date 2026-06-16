import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createClaimFixtures, createFinalizedSelectFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// Wait for the question page to finish rendering RPC data for a finalized question.
// question-state-finalized is added to the page element after data loads.
async function loadFinalizedQuestion(page, questionId) {
  await setupPage(page);
  await page.goto(
    `${WEBSITE_URL}/question.html#!/network/100/question/${CONTRACTS.realityEth30}-${questionId}`
  );
  await page.waitForSelector('.question-state-finalized', { timeout: 30000 });
}

test.describe('finalized bool: ANSWER card hidden', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createClaimFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  test('answer form container is removed for a finalized bool question', async ({ page }) => {
    await loadFinalizedQuestion(page, fixtures.claimQuestionId);
    expect(await page.locator('#answer-form-container').count()).toBe(0);
  });
});

test.describe('finalized single-select: options list shown', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createFinalizedSelectFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await loadFinalizedQuestion(page, fixtures.questionId);
    await page.waitForSelector('.finalized-options', { timeout: 5000 });
  }

  test('finalized-options list is shown', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.finalized-options')).toBeVisible();
  });

  test('winning outcome is marked chosen', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.finalized-option-chosen')).toContainText('Dog');
  });

  test('losing outcomes are not marked chosen', async ({ page }) => {
    await loadQuestion(page);
    const unchosen = page.locator('.finalized-option:not(.finalized-option-chosen)');
    await expect(unchosen.filter({ hasText: 'Cat' })).toBeVisible();
    await expect(unchosen.filter({ hasText: 'Fish' })).toBeVisible();
  });
});
