import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createMinBondFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

// min_bond questions (created via askQuestionWithMinBond) impose a bond floor
// independent of the escalation multiplier.  For a fresh question with no
// previous answers the effective minimum is min_bond itself, not 2 * current_bond
// (which would be 0).
//
// Note: the submit-time bond check in rpc.js only validates `bond >= current_bond * 2`.
// For a fresh question current_bond = 0, so that check is always satisfied — the
// min_bond floor is only enforced via keyup validation and the pre-fill.

test.describe('min_bond enforcement', () => {
  test.setTimeout(45000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createMinBondFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-open');
    }, {}, { timeout: 30000 });
    await page.waitForSelector(
      '.rcbrowser--qa-detail:not(.template-item) select[name="input-answer"]',
      { timeout: 15000 }
    );
    return page.locator('.rcbrowser--qa-detail:not(.template-item)');
  }

  // ── Pre-fill ───────────────────────────────────────────────────────────────

  test('bond field is pre-filled with min_bond for an unanswered min_bond question', async ({ page }) => {
    const win = await loadQuestion(page);
    // With no current best bond, the dapp uses min_bond as the pre-fill base:
    //   bond = min_bond.div(2)  →  pre-fill = bond.mul(2) = min_bond = 0.002
    await expect(win.locator('input[name="questionBond"]')).toHaveValue('0.002');
  });

  // ── Keyup validation ───────────────────────────────────────────────────────

  test('typing below min_bond shows is-error with the correct minimum', async ({ page }) => {
    const win = await loadQuestion(page);
    const bondField = win.locator('input[name="questionBond"]');

    await bondField.fill('0.001');
    await bondField.dispatchEvent('keyup');

    const container = win.locator('.input-container--bond');
    await expect(container).toHaveClass(/is-error/);
    await expect(container.locator('.min-amount')).toContainText('0.002');
  });

  test('typing exactly min_bond clears the error', async ({ page }) => {
    const win = await loadQuestion(page);
    const bondField = win.locator('input[name="questionBond"]');

    // Trigger an error first...
    await bondField.fill('0.001');
    await bondField.dispatchEvent('keyup');
    await expect(win.locator('.input-container--bond')).toHaveClass(/is-error/);

    // ...then correct it
    await bondField.fill('0.002');
    await bondField.dispatchEvent('keyup');
    await expect(win.locator('.input-container--bond')).not.toHaveClass(/is-error/);
  });

  // ── Successful first answer at min_bond ────────────────────────────────────

  test('submitting at min_bond sends correct calldata with max_previous = 0', async ({ page }) => {
    const win = await loadQuestion(page);

    const txPromise = page.evaluate(() =>
      new Promise(resolve => {
        const orig = window.ethereum.request.bind(window.ethereum);
        window.ethereum.request = async (args) => {
          const result = await orig(args);
          if (args.method === 'eth_sendTransaction') resolve(args.params[0]);
          return result;
        };
      })
    );

    await win.locator('select[name="input-answer"]').selectOption('1'); // Yes
    // Bond pre-fill is already 0.002 — submit without editing
    await win.locator('input.post-answer-button').click();

    const tx = await txPromise;
    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());

    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.questionId);
    // No previous answer → max_previous = 0
    expect(decoded.args.max_previous.eq(0)).toBe(true);
    // ETH value = min_bond
    expect(ethers.BigNumber.from(tx.value).eq(fixtures.minBond)).toBe(true);
  });
});
