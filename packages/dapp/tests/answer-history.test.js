import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerHistoryFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

// The dapp sets `has-history` on the question window when there are 2 or more
// answers in the history (plain questions; commit-reveal follows its own rule).
// Earlier answers are rendered as `.answered-history-item:not(.template-item)`
// inside `.answered-history-container`; each item has `.current-answer` and
// `.answer-bond-value` populated from the on-chain history.

test.describe('answer history display', () => {
  test.setTimeout(45000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createAnswerHistoryFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page, questionId) {
    await setupPage(page);
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${questionId}`
    );
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-open');
    }, {}, { timeout: 30000 });
    return page.locator('.rcbrowser--qa-detail:not(.template-item)');
  }

  // ── has-history flag ───────────────────────────────────────────────────────

  test('has-history is absent when question has only 1 answer', async ({ page }) => {
    await loadQuestion(page, fixtures.oneAnswerQuestionId);
    await expect(
      page.locator('.rcbrowser--qa-detail.has-history:not(.template-item)')
    ).not.toBeAttached();
  });

  test('has-history is set when question has 2 answers', async ({ page }) => {
    await loadQuestion(page, fixtures.twoAnswerQuestionId);
    await expect(
      page.locator('.rcbrowser--qa-detail.has-history:not(.template-item)')
    ).toBeVisible();
  });

  // ── History list contents ──────────────────────────────────────────────────

  test('exactly one history item appears for a 2-answer question', async ({ page }) => {
    const win = await loadQuestion(page, fixtures.twoAnswerQuestionId);
    // The template item is always present; real items have no template-item class.
    await expect(
      win.locator('.answered-history-item:not(.template-item)')
    ).toHaveCount(1);
  });

  test('history item shows the earlier answer text and bond', async ({ page }) => {
    const win = await loadQuestion(page, fixtures.twoAnswerQuestionId);
    const histItem = win.locator('.answered-history-item:not(.template-item)').first();
    // First answer was YES at 0.001 ETH; it gets pushed into history when NO overrides it
    await expect(histItem.locator('.current-answer')).toContainText('Yes');
    await expect(histItem.locator('.answer-bond-value')).toContainText('0.001');
  });

  test('current answer section shows the latest answer', async ({ page }) => {
    const win = await loadQuestion(page, fixtures.twoAnswerQuestionId);
    // The NO answer (0.002 ETH) is the current best answer
    await expect(win.locator('.current-answer-container .current-answer')).toContainText('No');
    await expect(win.locator('.current-answer-container .answer-bond-value')).toContainText('0.002');
  });
});
