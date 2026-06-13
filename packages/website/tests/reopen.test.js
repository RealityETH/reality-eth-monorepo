import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createReopenFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

test.describe('reopen flow', () => {
  test.setTimeout(60000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createReopenFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/question.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    // Wait for the reopen container to become visible (question is finalized + reopenable)
    await page.waitForSelector('.reopen-container', { state: 'visible', timeout: 30000 });
  }

  // ── State and UI ───────────────────────────────────────────────────────────

  test('reopen-container is visible for a reopenable question', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.reopen-container')).toBeVisible();
    await expect(page.locator('.reopen-container')).toContainText('answered when it was too soon');
  });

  test('reopened-container is hidden for a reopenable question', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.reopened-container')).not.toBeVisible();
  });

  // ── Calldata ───────────────────────────────────────────────────────────────

  test('clicking Reopen sends reopenQuestion with correct reopens_question_id', async ({ page }) => {
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

    await page.locator('.reopen-question-submit').click();
    const tx = await txPromise;

    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());

    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('reopenQuestion');
    expect(decoded.args.reopens_question_id).toBe(fixtures.questionId);
    expect(decoded.args.timeout).toBe(60);
    expect(decoded.args.min_bond.eq(0)).toBe(true);
    expect(!tx.value || ethers.BigNumber.from(tx.value).eq(0)).toBe(true);
  });

  // ── Post-reopen state ──────────────────────────────────────────────────────

  test('original question shows reopened container on fresh load after TX mines', async ({ page }) => {
    await loadQuestion(page);

    const txHashPromise = page.evaluate(() =>
      new Promise(resolve => {
        const orig = window.ethereum.request.bind(window.ethereum);
        window.ethereum.request = async (args) => {
          const result = await orig(args);
          if (args.method === 'eth_sendTransaction') resolve(result);
          return result;
        };
      })
    );

    await page.locator('.reopen-question-submit').click();
    await txHashPromise; // TX mined

    // Navigate back so the page fetches fresh chain data
    await page.goto(
      `${WEBSITE_URL}/question.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    // After reopen TX, the contract sets reopened_questions[original] = new_id,
    // so the page should show the reopened container instead of reopen button
    await page.waitForSelector('.reopened-container', { state: 'visible', timeout: 30000 });
    await expect(page.locator('.reopen-container')).not.toBeVisible();
  });
});
