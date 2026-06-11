import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createReopenFixtures, CONTRACTS } from './setup/fixtures.js';
import { QUESTION_URL } from './setup/question-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

test.describe('q: reopen flow', () => {
  test.setTimeout(60000);
  let snap;
  let fixtures;

  test.beforeAll(async () => { fixtures = await createReopenFixtures(); });
  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(`${QUESTION_URL}/question.html?contract=${CONTRACTS.realityEth30}&question=${fixtures.questionId}&network=100`);
    await page.waitForFunction(
      () => {
        const qp = document.getElementById('question-page');
        return qp?.classList.contains('question-state-finalized') && qp?.classList.contains('reopenable');
      },
      {}, { timeout: 30000 }
    );
    return page.locator('#question-page');
  }

  test('question-state-finalized and reopenable are both set', async ({ page }) => {
    const win = await loadQuestion(page);
    await expect(win).toHaveClass(/question-state-finalized/);
    await expect(win).toHaveClass(/reopenable/);
  });

  test('reopen-container is visible for a reopenable question', async ({ page }) => {
    const win = await loadQuestion(page);
    await expect(win.locator('.reopen-container')).toBeVisible();
    await expect(win.locator('.reopen-container')).toContainText('answered when it was too soon');
  });

  test('clicking Reopen sends reopenQuestion with correct reopens_question_id', async ({ page }) => {
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
    await win.locator('.reopen-question-submit').click();
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

  test('original question shows reopened class on fresh load after TX mines', async ({ page }) => {
    const win = await loadQuestion(page);
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
    await win.locator('.reopen-question-submit').click();
    await txHashPromise;
    await page.goto(`${QUESTION_URL}/question.html?contract=${CONTRACTS.realityEth30}&question=${fixtures.questionId}&network=100`);
    await page.waitForFunction(
      () => {
        const qp = document.getElementById('question-page');
        return qp?.classList.contains('question-state-finalized') && qp?.classList.contains('reopened');
      },
      {}, { timeout: 30000 }
    );
    const freshWin = page.locator('#question-page');
    await expect(freshWin).not.toHaveClass(/reopenable/);
    await expect(freshWin.locator('.reopened-container')).toBeVisible();
  });
});
