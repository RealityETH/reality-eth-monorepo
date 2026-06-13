import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createBondEscalationFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

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

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/question.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForSelector('input[name="questionBond"]', { timeout: 30000 });
  }

  // ── Pre-fill ───────────────────────────────────────────────────────────────

  test('bond field is pre-filled with 2x the current bond', async ({ page }) => {
    await loadQuestion(page);
    // Current bond = 0.001 ETH → pre-fill should be 0.002 ETH
    await expect(page.locator('input[name="questionBond"]')).toHaveValue('0.002');
  });

  // ── Keyup validation ───────────────────────────────────────────────────────

  test('typing a bond below minimum shows is-error and min-amount hint', async ({ page }) => {
    await loadQuestion(page);
    const bondField = page.locator('input[name="questionBond"]');

    await bondField.fill('0.001');
    await bondField.dispatchEvent('keyup');

    const bondContainer = page.locator('.input-container--bond');
    await expect(bondContainer).toHaveClass(/is-error/);
    await expect(bondContainer.locator('.min-amount')).toContainText('0.002');
  });

  test('typing the exact minimum clears the error', async ({ page }) => {
    await loadQuestion(page);
    const bondField = page.locator('input[name="questionBond"]');

    await bondField.fill('0.001');
    await bondField.dispatchEvent('keyup');
    await expect(page.locator('.input-container--bond')).toHaveClass(/is-error/);

    await bondField.fill('0.002');
    await bondField.dispatchEvent('keyup');
    await expect(page.locator('.input-container--bond')).not.toHaveClass(/is-error/);
  });

  // ── Submit-time enforcement ────────────────────────────────────────────────

  test('submitting with too-low bond shows is-error and does not send a transaction', async ({ page }) => {
    await loadQuestion(page);

    await page.evaluate(() => {
      window.__txFired = false;
      const orig = window.ethereum.request.bind(window.ethereum);
      window.ethereum.request = async (args) => {
        if (args.method === 'eth_sendTransaction') window.__txFired = true;
        return orig(args);
      };
    });

    await page.locator('select[name="input-answer"]').selectOption('0'); // No
    await page.locator('input[name="questionBond"]').fill('0.001');
    await page.locator('button.post-answer-button').click();

    await expect(page.locator('.input-container--bond')).toHaveClass(/is-error/, { timeout: 5000 });

    const txFired = await page.evaluate(() => window.__txFired);
    expect(txFired).toBe(false);
  });

  // ── Successful escalation ──────────────────────────────────────────────────

  test('submitting with valid bond sends correct calldata', async ({ page }) => {
    await loadQuestion(page);

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

    await page.locator('select[name="input-answer"]').selectOption('0'); // No
    // Bond pre-fill is already 0.002 — just submit
    await page.locator('button.post-answer-button').click();

    const tx = await txPromise;
    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());

    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.questionId);
    expect(decoded.args.max_previous.eq(fixtures.initBond)).toBe(true);
    expect(ethers.BigNumber.from(tx.value).eq(ethers.utils.parseEther('0.002'))).toBe(true);
  });
});
