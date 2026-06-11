import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createCommitRevealFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';

test.describe('commit-reveal', () => {
  // Two sequential transactions (commitment must confirm before reveal fires),
  // so this suite needs more runway than the default 60s.
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
    // The /commit/1 hash param sets USE_COMMIT_REVEAL=true in the dapp
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolQuestionId}/commit/1`
    );

    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-open');
    }, {}, { timeout: 30000 });

    await page.waitForSelector(
      '.rcbrowser--qa-detail:not(.template-item) select[name="input-answer"]',
      { timeout: 15000 }
    );
  }

  test('calldata is correct for commitment and reveal', async ({ page }) => {
    await loadQuestion(page);

    // Set up interceptor via awaited evaluate to guarantee it runs before any form interaction.
    // Transactions are stored on window so waitForFunction can poll for them.
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

    const win = page.locator('.rcbrowser--qa-detail:not(.template-item)');
    await win.locator('select[name="input-answer"]').selectOption('1');
    await win.locator('input[name="questionBond"]').fill('0.002');
    await win.locator('input.post-answer-button').click();

    // Reveal fires only after commitment confirms — poll until both txs are captured
    await page.waitForFunction(() => window.__capturedTxs.length >= 2, { timeout: 90000 });
    const txs = await page.evaluate(() => window.__capturedTxs);

    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);

    // --- First tx: submitAnswerCommitment ---
    const commitTx = txs[0].params;
    expect(commitTx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());
    const commitDecoded = iface.parseTransaction({ data: commitTx.data, value: commitTx.value });
    expect(commitDecoded.name).toBe('submitAnswerCommitment');
    expect(commitDecoded.args.question_id).toBe(fixtures.boolQuestionId);
    // Bond is sent as ETH value in the commitment
    expect(ethers.BigNumber.from(commitTx.value).eq(ethers.utils.parseEther('0.002'))).toBe(true);

    // --- Second tx: submitAnswerReveal ---
    const revealTx = txs[1].params;
    expect(revealTx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());
    const revealDecoded = iface.parseTransaction({ data: revealTx.data });
    expect(revealDecoded.name).toBe('submitAnswerReveal');
    expect(revealDecoded.args.question_id).toBe(fixtures.boolQuestionId);
    expect(revealDecoded.args.answer).toBe(YES);
    expect(revealDecoded.args.bond.eq(ethers.utils.parseEther('0.002'))).toBe(true);

    // Cross-check: the answer_hash committed must equal keccak256(answer, nonce)
    // Both answer (bytes32) and nonce (uint256) are packed as uint256 in answerHash()
    const expectedHash = ethers.utils.solidityKeccak256(
      ['uint256', 'uint256'],
      [revealDecoded.args.answer, revealDecoded.args.nonce]
    );
    expect(commitDecoded.args.answer_hash).toBe(expectedHash);
  });

  test('revealed answer appears on chain', async ({ page }) => {
    const consoleMsgs = [];
    page.on('console', msg => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));

    await loadQuestion(page);

    await page.evaluate(() => {
      window.__capturedTxs = [];
      const orig = window.ethereum.request.bind(window.ethereum);
      window.ethereum.request = async (args) => {
        const result = await orig(args);
        if (args.method === 'eth_sendTransaction') {
          window.__capturedTxs.push({ method: args.method, hash: result });
        }
        return result;
      };
    });

    const win = page.locator('.rcbrowser--qa-detail:not(.template-item)');
    await win.locator('select[name="input-answer"]').selectOption('1');
    await win.locator('input[name="questionBond"]').fill('0.002');
    await win.locator('input.post-answer-button').click();

    // The commit-reveal flow: submitAnswerCommitment must confirm before the dapp
    // fires submitAnswerReveal.  We don't use waitForTransaction(hash) here because
    // eth_getTransactionReceipt is routed through anvil which, under archive
    // rate-limiting (429), propagates the error back to Node.js.  Instead we poll
    // getBestAnswer — all storage it reads was written locally, so no archive fetch.
    const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
    const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, provider);

    let bestAnswer = ethers.constants.HashZero;
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
      try {
        bestAnswer = await reality.getBestAnswer(fixtures.boolQuestionId);
        if (bestAnswer === YES) break;
      } catch (_) {
        // transient 429 or network error — retry
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    if (bestAnswer !== YES) {
      const diag = await page.evaluate(() => ({
        capturedTxs: window.__capturedTxs,
      }));
      console.log('[test2] FAILED — capturedTxs:', JSON.stringify(diag.capturedTxs));
      console.log('[test2] console msgs:', consoleMsgs.slice(-40).join('\n'));
    }

    expect(bestAnswer).toBe(YES);
  });
});
