import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createCommitRevealSelectFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// Regression test for the winnerBytes bug: when the winning answer on a finalized
// single-select question was submitted via commit-reveal, the old code used the
// commitment hash (a random-looking 32-byte value) as winnerBytes, which resolved
// to an out-of-range option index and displayed no winner.  The fix uses the revealed
// answer instead.
test.describe('finalized commit-reveal single-select: correct winner shown', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createCommitRevealSelectFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForSelector('.finalized-options', { timeout: 30000 });
  }

  test('finalized-options list is shown', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.finalized-options')).toBeVisible();
  });

  test('Dog (commit-reveal winner, index 1) is marked chosen', async ({ page }) => {
    await loadQuestion(page);
    await expect(
      page.locator('.finalized-option-chosen').filter({ hasText: 'Dog' })
    ).toBeVisible();
  });

  test('Cat and Fish are not marked chosen', async ({ page }) => {
    await loadQuestion(page);
    const unchosen = page.locator('.finalized-option:not(.finalized-option-chosen)');
    await expect(unchosen.filter({ hasText: 'Cat' })).toBeVisible();
    await expect(unchosen.filter({ hasText: 'Fish' })).toBeVisible();
  });

  test('exactly one outcome is marked chosen', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.finalized-option-chosen')).toHaveCount(1);
  });
});
