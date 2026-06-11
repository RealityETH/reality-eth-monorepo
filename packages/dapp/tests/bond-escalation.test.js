import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createBondEscalationFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

test.describe('bond escalation', () => {
  test.setTimeout(45000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createBondEscalationFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  // Load the open, already-answered question and wait for the answer form to appear.
  // Returns a locator scoped to the (non-template) question window.
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

  test('bond field is pre-filled with 2x the current bond', async ({ page }) => {
    const win = await loadQuestion(page);
    // Current bond = 0.001 ETH → pre-fill should be 0.002 ETH
    const bondField = win.locator('input[name="questionBond"]');
    await expect(bondField).toHaveValue('0.002');
  });

  // ── Keyup validation ───────────────────────────────────────────────────────

  test('typing a bond below minimum shows is-error and min-amount hint', async ({ page }) => {
    const win = await loadQuestion(page);
    const bondField = win.locator('input[name="questionBond"]');

    // Clear the field and type a value below the 0.002 minimum
    await bondField.fill('0.001');
    await bondField.dispatchEvent('keyup');

    const bondContainer = win.locator('.input-container--bond');
    await expect(bondContainer).toHaveClass(/is-error/);
    await expect(bondContainer.locator('.min-amount')).toContainText('0.002');
  });

  test('typing the exact minimum clears the error', async ({ page }) => {
    const win = await loadQuestion(page);
    const bondField = win.locator('input[name="questionBond"]');

    // First trigger an error...
    await bondField.fill('0.001');
    await bondField.dispatchEvent('keyup');
    await expect(win.locator('.input-container--bond')).toHaveClass(/is-error/);

    // ...then correct it
    await bondField.fill('0.002');
    await bondField.dispatchEvent('keyup');
    await expect(win.locator('.input-container--bond')).not.toHaveClass(/is-error/);
  });

  // ── Submit-time enforcement ────────────────────────────────────────────────

  test('submitting with too-low bond shows is-error and does not send a transaction', async ({ page }) => {
    const win = await loadQuestion(page);

    // Track whether any eth_sendTransaction is fired
    await page.evaluate(() => {
      window.__txFired = false;
      const orig = window.ethereum.request.bind(window.ethereum);
      window.ethereum.request = async (args) => {
        if (args.method === 'eth_sendTransaction') window.__txFired = true;
        return orig(args);
      };
    });

    // Answer must be selected first — without it the dapp rejects at answer
    // validation before even reaching the bond check.
    await win.locator('select[name="input-answer"]').selectOption('0'); // No
    const bondField = win.locator('input[name="questionBond"]');
    await bondField.fill('0.001');
    // Do NOT trigger keyup — let submit-time validation handle it
    await win.locator('input.post-answer-button').click();

    // Error container should now show
    await expect(win.locator('.input-container--bond')).toHaveClass(/is-error/, { timeout: 5000 });

    // No transaction should have been sent
    const txFired = await page.evaluate(() => window.__txFired);
    expect(txFired).toBe(false);
  });

  // ── Successful escalation ──────────────────────────────────────────────────

  test('submitting with valid bond sends correct calldata', async ({ page }) => {
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

    await win.locator('select[name="input-answer"]').selectOption('0'); // No
    // Bond pre-fill is already 0.002 — just submit
    await win.locator('input.post-answer-button').click();

    const tx = await txPromise;
    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());

    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.questionId);
    // max_previous is set to the current best bond (0.001 ETH) as a front-run guard
    expect(decoded.args.max_previous.eq(fixtures.initBond)).toBe(true);
    // ETH sent = the new bond (0.002 ETH)
    expect(ethers.BigNumber.from(tx.value).eq(ethers.utils.parseEther('0.002'))).toBe(true);
  });
});
