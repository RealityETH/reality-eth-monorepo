import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createFixtures, CONTRACTS } from './setup/fixtures.js';
import { QUESTION_URL } from './setup/question-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

test.describe('q: submit answer', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createFixtures();
  });

  test.beforeEach(async () => {
    snap = await snapshot();
  });

  test.afterEach(async () => {
    await revert(snap);
    snap = await snapshot();
  });

  async function loadQuestion(page) {
    await setupPage(page);
    const url = `${QUESTION_URL}/question.html?contract=${CONTRACTS.realityEth30}&question=${fixtures.boolQuestionId}&network=100`;
    await page.goto(url);
    await page.waitForFunction(
      () => document.getElementById('question-page')?.classList.contains('question-state-open'),
      {}, { timeout: 30000 }
    );
    await page.waitForSelector('#question-page select[name="input-answer"]', { timeout: 15000 });
    return page.locator('#question-page');
  }

  test('calldata is correct for yes answer', async ({ page }) => {
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

    const win = page.locator('#question-page');
    await win.locator('select[name="input-answer"]').selectOption('1');
    await win.locator('input[name="questionBond"]').fill('0.002');
    await win.locator('button.post-answer-button').click();

    const tx = await txPromise;

    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());

    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.boolQuestionId);
    expect(decoded.args.answer).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
    expect(ethers.BigNumber.from(tx.value).eq(ethers.utils.parseEther('0.002'))).toBe(true);
  });

  test('submitted answer appears on chain', async ({ page }) => {
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

    const win = page.locator('#question-page');
    await win.locator('select[name="input-answer"]').selectOption('1');
    await win.locator('input[name="questionBond"]').fill('0.002');
    await win.locator('button.post-answer-button').click();
    await txHashPromise;

    const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
    const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, provider);
    const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
    let bestAnswer = ethers.constants.HashZero;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      try {
        bestAnswer = await reality.getBestAnswer(fixtures.boolQuestionId);
        if (bestAnswer === YES) break;
      } catch (_) {}
      await new Promise(r => setTimeout(r, 500));
    }
    expect(bestAnswer).toBe(YES);
  });
});
