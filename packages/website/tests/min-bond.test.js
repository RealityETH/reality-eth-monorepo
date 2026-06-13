import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createMinBondFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

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
      `${WEBSITE_URL}/question.html?network=100&contract=${CONTRACTS.realityEth30}&question=${fixtures.questionId}`
    );
    await page.waitForSelector('input[name="questionBond"]', { timeout: 30000 });
  }

  // ── Pre-fill ───────────────────────────────────────────────────────────────

  test('bond field is pre-filled with min_bond for an unanswered min_bond question', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('input[name="questionBond"]')).toHaveValue('0.002');
  });

  // ── Keyup validation ───────────────────────────────────────────────────────

  test('typing below min_bond shows is-error with the correct minimum', async ({ page }) => {
    await loadQuestion(page);
    const bondField = page.locator('input[name="questionBond"]');

    await bondField.fill('0.001');
    await bondField.dispatchEvent('keyup');

    const container = page.locator('.input-container--bond');
    await expect(container).toHaveClass(/is-error/);
    await expect(container.locator('.min-amount')).toContainText('0.002');
  });

  test('typing exactly min_bond clears the error', async ({ page }) => {
    await loadQuestion(page);
    const bondField = page.locator('input[name="questionBond"]');

    await bondField.fill('0.001');
    await bondField.dispatchEvent('keyup');
    await expect(page.locator('.input-container--bond')).toHaveClass(/is-error/);

    await bondField.fill('0.002');
    await bondField.dispatchEvent('keyup');
    await expect(page.locator('.input-container--bond')).not.toHaveClass(/is-error/);
  });

  // ── Successful first answer at min_bond ────────────────────────────────────

  test('submitting at min_bond sends correct calldata with max_previous = 0', async ({ page }) => {
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

    await page.locator('select[name="input-answer"]').selectOption('1'); // Yes
    await page.locator('button.post-answer-button').click();

    const tx = await txPromise;
    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());

    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.questionId);
    expect(decoded.args.max_previous.eq(0)).toBe(true);
    expect(ethers.BigNumber.from(tx.value).eq(fixtures.minBond)).toBe(true);
  });
});
