import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createBondEscalationFixtures, createAnswerTypeFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// #answer-banner starts with display:none and is only shown when n > 0 answer
// events exist (renderStatusCard sets display:'' for n > 0, never touches it for
// n == 0).  The banner also shows the correct label from bytes32ToLabel.  A
// regression in the event count check or the label lookup would either show an
// empty banner for answered questions or show a banner for unanswered ones.
test.describe('answer banner: visibility and content', () => {
  let snap;
  let answeredFixtures;
  let unansweredFixtures;

  test.beforeAll(async () => {
    answeredFixtures  = await createBondEscalationFixtures();
    unansweredFixtures = await createAnswerTypeFixtures();
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

  test('answered question: banner is visible', async ({ page }) => {
    await loadQuestion(page, answeredFixtures.questionId);
    // renderStatusCard runs synchronously before the first await, so by the
    // time question-state-open is observed the banner is already populated.
    await expect(page.locator('#answer-banner')).toBeVisible();
  });

  test('answered question: banner shows "Current answer" heading', async ({ page }) => {
    await loadQuestion(page, answeredFixtures.questionId);
    await expect(page.locator('#answer-banner')).toContainText('Current answer');
  });

  test('answered question: banner shows the correct answer label', async ({ page }) => {
    await loadQuestion(page, answeredFixtures.questionId);
    // createBondEscalationFixtures submits YES — banner value must show "Yes"
    await expect(page.locator('.answer-banner-value')).toContainText('Yes');
  });

  test('answered question: banner carries the yes color class', async ({ page }) => {
    await loadQuestion(page, answeredFixtures.questionId);
    await expect(page.locator('.answer-banner-yes')).toBeVisible();
  });

  test('unanswered question: banner is not shown', async ({ page }) => {
    await loadQuestion(page, unansweredFixtures.boolId);
    // No answer events — renderStatusCard never calls banner.style.display = ''
    await expect(page.locator('#answer-banner')).not.toBeVisible();
  });
});
