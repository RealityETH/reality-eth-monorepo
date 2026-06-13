import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

test.describe('submit answer', () => {
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
    await page.goto(
      `${WEBSITE_URL}/question.html?network=100&contract=${CONTRACTS.realityEth30}&question=${fixtures.boolQuestionId}`
    );
    // Wait for the answer form to be rendered (question is open)
    await page.waitForSelector('input[name="questionBond"]', { timeout: 30000 });
  }

  test('calldata is correct for yes answer', async ({ page }) => {
    await loadQuestion(page);

    // Resolve AFTER orig(args) mines the TX so evm_revert in afterEach cannot race
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

    await page.locator('select[name="input-answer"]').selectOption('1');
    await page.locator('input[name="questionBond"]').fill('0.002');
    await page.locator('button.post-answer-button').click();

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

    await page.locator('select[name="input-answer"]').selectOption('1');
    await page.locator('input[name="questionBond"]').fill('0.002');
    await page.locator('button.post-answer-button').click();
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
