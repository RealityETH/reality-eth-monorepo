import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createUpcomingQuestionFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

// A question with opening_ts in the future is "not yet open for answers".
// The dapp still sets question-state-open on the window (it's not finalized),
// but makeSelectAnswerInput() inserts the .answer-form-container.before-opening
// form instead of the type-specific one.  That form contains no submit button.

test.describe('upcoming (not yet open) question', () => {
  test.setTimeout(45000);

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
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    // Before-opening questions still get question-state-open (non-finalized)
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-open');
    }, {}, { timeout: 30000 });
    return page.locator('.rcbrowser--qa-detail:not(.template-item)');
  }

  // ── State ──────────────────────────────────────────────────────────────────

  test('question-state-open is set; question is not finalized', async ({ page }) => {
    await loadQuestion(page);
    await expect(
      page.locator('.rcbrowser--qa-detail.question-state-open:not(.template-item)')
    ).toBeVisible();
    await expect(
      page.locator('.rcbrowser--qa-detail.question-state-finalized:not(.template-item)')
    ).not.toBeAttached();
  });

  // ── Before-opening form ────────────────────────────────────────────────────

  test('before-opening form is shown with "not yet open" message', async ({ page }) => {
    const win = await loadQuestion(page);
    // makeSelectAnswerInput clones .answer-form-container.before-opening and
    // adds is-open / removes template-item when the question has a future opening_ts
    const form = win.locator('.answer-form-container.before-opening.is-open');
    await expect(form).toBeVisible();
    await expect(form).toContainText('not yet open for answers');
  });

  test('opening time label is present in the before-opening form', async ({ page }) => {
    const win = await loadQuestion(page);
    const form = win.locator('.answer-form-container.before-opening.is-open');
    await expect(form.locator('.opening-time-label')).toBeVisible();
  });

  // ── No submit button ───────────────────────────────────────────────────────

  test('answer submit button is absent for a before-opening question', async ({ page }) => {
    const win = await loadQuestion(page);
    // The before-opening form has no post-answer-button; the type-specific form
    // (which would have one) is not inserted at all.
    await expect(win.locator('input.post-answer-button')).not.toBeAttached();
  });
});
