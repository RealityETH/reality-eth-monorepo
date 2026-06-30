import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createCommitRevealFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';

test.describe('commit-reveal', () => {
  // Two sequential transactions (commitment must confirm before reveal fires)
  test.setTimeout(120000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createCommitRevealFixtures();
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
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolQuestionId}`
    );
    await page.waitForSelector('input[name="questionBond"]', { timeout: 30000 });
  }

  test('calldata is correct for commitment and reveal', async ({ page }) => {
    await loadQuestion(page);

    await page.evaluate(() => {
      window.__capturedTxs = [];
      const orig = window.ethereum.request.bind(window.ethereum);
      window.ethereum.request = async (args) => {
        const result = await orig(args);
        if (args.method === 'eth_sendTransaction') {
          window.__capturedTxs.push({ params: args.params[0], hash: result });
        }
        return result;
      };
    });

    // Enable commit-reveal via the checkbox
    await page.locator('.cr-toggle input[type="checkbox"]').check();
    await page.locator('select[name="input-answer"]').selectOption('1');
    await page.locator('input[name="questionBond"]').fill('0.002');
    await page.locator('button.post-answer-button').click();

    // Reveal fires only after commitment confirms — poll until both txs are captured
    await page.waitForFunction(() => window.__capturedTxs.length >= 2, { timeout: 90000 });
    const txs = await page.evaluate(() => window.__capturedTxs);

    const iface = new ethers.Interface(REALITY_ETH_ABI);

    // --- First tx: submitAnswerCommitment ---
    const commitTx = txs[0].params;
    expect(commitTx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());
    const commitDecoded = iface.parseTransaction({ data: commitTx.data, value: commitTx.value });
    expect(commitDecoded.name).toBe('submitAnswerCommitment');
    expect(commitDecoded.args.question_id).toBe(fixtures.boolQuestionId);
    expect(BigInt(commitTx.value)).toBe(ethers.parseEther('0.002'));

    // --- Second tx: submitAnswerReveal ---
    const revealTx = txs[1].params;
    expect(revealTx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());
    const revealDecoded = iface.parseTransaction({ data: revealTx.data });
    expect(revealDecoded.name).toBe('submitAnswerReveal');
    expect(revealDecoded.args.question_id).toBe(fixtures.boolQuestionId);
    expect(revealDecoded.args.answer).toBe(YES);
    expect(revealDecoded.args.bond).toBe(ethers.parseEther('0.002'));

    // Cross-check: the committed hash must equal keccak256(answer, nonce)
    const expectedHash = ethers.solidityPackedKeccak256(
      ['uint256', 'uint256'],
      [revealDecoded.args.answer, revealDecoded.args.nonce]
    );
    expect(commitDecoded.args.answer_hash).toBe(expectedHash);
  });

  test('revealed answer appears on chain', async ({ page }) => {
    await loadQuestion(page);

    await page.evaluate(() => {
      window.__capturedTxs = [];
      const orig = window.ethereum.request.bind(window.ethereum);
      window.ethereum.request = async (args) => {
        const result = await orig(args);
        if (args.method === 'eth_sendTransaction') {
          window.__capturedTxs.push({ hash: result });
        }
        return result;
      };
    });

    await page.locator('.cr-toggle input[type="checkbox"]').check();
    await page.locator('select[name="input-answer"]').selectOption('1');
    await page.locator('input[name="questionBond"]').fill('0.002');
    await page.locator('button.post-answer-button').click();

    const provider = new ethers.JsonRpcProvider(ANVIL_URL);
    const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, provider);

    let bestAnswer = ethers.ZeroHash;
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
      try {
        bestAnswer = await reality.getBestAnswer(fixtures.boolQuestionId);
        if (bestAnswer === YES) break;
      } catch (_) {}
      await new Promise(r => setTimeout(r, 1000));
    }
    expect(bestAnswer).toBe(YES);
  });
});
