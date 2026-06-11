import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerTypeFixtures, createVisibilityFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

// The dapp controls invalid/too-soon visibility via two separate mechanisms:
//
//  Select-type questions (bool, single-select):
//    The <option class="invalid-select"> and <option class="too-soon-select"> elements
//    are removed from the DOM during form setup when the option is not supported.
//
//  Non-select types (uint, datetime, multiple-select):
//    .invalid-switch-container and .too-soon-switch-container are always in the DOM
//    but hidden by default (display:none).  The question window gains the CSS classes
//    has-invalid-option / has-too-soon-option when the option applies, which makes
//    the containers visible.
//
// Rules:
//   - "Invalid" is shown by default; hidden only when the template has has_invalid:false.
//   - "Answered too soon" requires contract version >= 3 (v2.1 never shows it).

test.describe('invalid and answered-too-soon option visibility', () => {
  test.setTimeout(45000);

  let snap;
  let answerFixtures;   // v3.0 bool and uint question IDs
  let visFixtures;      // v2.1 questions + has_invalid:false question

  test.beforeAll(async () => {
    answerFixtures = await createAnswerTypeFixtures();
    visFixtures = await createVisibilityFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page, contractAddr, questionId) {
    await setupPage(page);
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${contractAddr}-${questionId}`
    );
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-open');
    }, {}, { timeout: 30000 });
    // Return a locator scoped to the (non-template) question window.
    return page.locator('.rcbrowser--qa-detail:not(.template-item)');
  }

  // ── Select-type (bool dropdown) ──────────────────────────────────────────────

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

  // ── Non-select type (uint link/switch) ───────────────────────────────────────

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
