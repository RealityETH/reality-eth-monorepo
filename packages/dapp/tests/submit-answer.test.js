import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { walletMockScript } from './setup/wallet-mock.js';
import { createFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

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
    // Re-snapshot so the next test starts from the same state (evm_revert consumes the snapshot)
    snap = await snapshot();
  });

  async function loadQuestion(page) {
    await page.addInitScript(walletMockScript());
    await page.context().addCookies([
      { name: 'graph', value: '0', domain: 'localhost', path: '/' },
    ]);
    await page.goto(`${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolQuestionId}`);

    // Wait for the question window to open and for the dapp to set question-state-open
    // (which triggers the CSS that makes the answer form visible)
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-open');
    }, {}, { timeout: 30000 });

    // Wait for the answer form select to be visible inside the live question window
    await page.waitForSelector('.rcbrowser--qa-detail:not(.template-item) select[name="input-answer"]', { timeout: 15000 });
  }

  test('calldata is correct for yes answer', async ({ page }) => {
    await loadQuestion(page);

    const txPromise = page.evaluate(() =>
      new Promise(resolve => {
        const orig = window.ethereum.request.bind(window.ethereum);
        window.ethereum.request = async (args) => {
          if (args.method === 'eth_sendTransaction') resolve(args.params[0]);
          return orig(args);
        };
      })
    );

    const win = page.locator('.rcbrowser--qa-detail:not(.template-item)');
    await win.locator('select[name="input-answer"]').selectOption('1');
    await win.locator('input[name="questionBond"]').fill('0.002');
    await win.locator('input.post-answer-button').click();

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

    const win = page.locator('.rcbrowser--qa-detail:not(.template-item)');
    await win.locator('select[name="input-answer"]').selectOption('1');
    await win.locator('input[name="questionBond"]').fill('0.002');
    await win.locator('input.post-answer-button').click();
    const txHash = await txHashPromise;

    const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
    const receipt = await provider.waitForTransaction(txHash);
    expect(receipt.status).toBe(1);

    const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, provider);
    const bestAnswer = await reality.getBestAnswer(fixtures.boolQuestionId);
    expect(bestAnswer).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
  });
});
