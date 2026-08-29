import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createDescriptionFixtures, createFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

test.describe('question page: description field', () => {
  let snap;
  let descFixtures;
  let v30Fixtures;

  test.beforeAll(async () => {
    [descFixtures, v30Fixtures] = await Promise.all([
      createDescriptionFixtures(),
      createFixtures(),
    ]);
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  test('shows description below the title for a v3.2 question', async ({ page }) => {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${descFixtures.contract}-${descFixtures.questionId}`
    );
    await page.waitForSelector('#question-title:not(:empty)', { timeout: 30000 });

    const descEl = page.locator('#question-description-display');
    await expect(descEl).toBeVisible({ timeout: 10000 });
    await expect(descEl).toHaveText(descFixtures.description);
  });

  test('description element is hidden for a v3.0 question', async ({ page }) => {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${v30Fixtures.boolQuestionId}`
    );
    await page.waitForSelector('#question-title:not(:empty)', { timeout: 30000 });

    await expect(page.locator('#question-description-display')).toBeHidden();
  });
});
