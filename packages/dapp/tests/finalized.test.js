import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createClaimFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

test.describe('finalized question display', () => {
  test.setTimeout(45000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createClaimFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  // Load a finalized question and wait until the dapp settles on the finalized
  // state.  Returns a locator scoped to the (non-template) question window.
  //
  // Note: isFinalized() in the dapp uses the browser clock, not chain time.
  // The fork block is from June 9 2026; our fixture's finalization_ts is that
  // timestamp + 60 s, which is well in the past, so the dapp immediately
  // classifies the question as finalized without needing evm_increaseTime.
  async function loadFinalized(page) {
    await setupPage(page);
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.claimQuestionId}`
    );
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-finalized');
    }, {}, { timeout: 30000 });
    return page.locator('.rcbrowser--qa-detail:not(.template-item)');
  }

  // ── State classes ──────────────────────────────────────────────────────────

  test('question-state-finalized is set; question-state-open is not', async ({ page }) => {
    await loadFinalized(page);
    const win = page.locator('.rcbrowser--qa-detail.question-state-finalized:not(.template-item)');
    await expect(win).toBeVisible();
    await expect(
      page.locator('.rcbrowser--qa-detail.question-state-open:not(.template-item)')
    ).not.toBeAttached();
  });

  // ── Winning answer text ────────────────────────────────────────────────────

  test('winning answer is displayed as "Yes"', async ({ page }) => {
    const win = await loadFinalized(page);
    // The dapp calls rc_question.getAnswerString(question_json, best_answer)
    // and writes the result into .current-answer inside .current-answer-container.
    await expect(win.locator('.current-answer-container .current-answer')).toContainText('Yes');
  });

  // ── Answer form is hidden ──────────────────────────────────────────────────

  test('answer submit form is not visible for a finalized question', async ({ page }) => {
    const win = await loadFinalized(page);
    // CSS controlled by question-state-finalized — the submit button should be
    // hidden, not removed from the DOM.
    await expect(win.locator('input.post-answer-button')).toBeHidden();
  });
});
