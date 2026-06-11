import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createClaimFixtures, CONTRACTS } from './setup/fixtures.js';
import { QUESTION_URL } from './setup/question-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

// The claim button lives inside the finalized question page.
// When the connected wallet has winnings to claim, a claim section is shown.
const claimBtnSelector = '#question-page .claim-section button.claim-button';

test.describe('q: claim winnings', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => { fixtures = await createClaimFixtures(); });
  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadAndOpenClaim(page) {
    await setupPage(page);
    await page.goto(`${QUESTION_URL}/question.html?contract=${CONTRACTS.realityEth30}&question=${fixtures.claimQuestionId}&network=100`);
    await page.waitForFunction(
      () => document.getElementById('question-page')?.classList.contains('question-state-finalized'),
      {}, { timeout: 30000 }
    );
    await page.waitForSelector(claimBtnSelector, { state: 'visible', timeout: 30000 });
  }

  test('calldata is correct for claim', async ({ page }) => {
    await loadAndOpenClaim(page);
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
    await page.waitForSelector(claimBtnSelector, { state: 'visible', timeout: 15000 });
    await page.click(claimBtnSelector);
    const tx = await txPromise;
    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());
    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data });
    expect(decoded.name).toBe('claimMultipleAndWithdrawBalance');
    expect(decoded.args.question_ids[0]).toBe(fixtures.claimQuestionId);
    expect(decoded.args.lengths[0].toNumber()).toBe(1);
    expect(decoded.args.answers[0]).toBe(fixtures.answer);
    expect(decoded.args.addrs[0].toLowerCase()).toBe('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
    expect(decoded.args.bonds[0].eq(fixtures.bond)).toBe(true);
    expect(decoded.args.hist_hashes[0]).toBe('0x0000000000000000000000000000000000000000000000000000000000000000');
  });

  test('balance increases after claim', async ({ page }) => {
    const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
    const balanceBefore = await provider.getBalance('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    await loadAndOpenClaim(page);
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
    await page.waitForSelector(claimBtnSelector, { state: 'visible', timeout: 15000 });
    await page.click(claimBtnSelector);
    await txHashPromise;
    let balanceAfter = balanceBefore;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      balanceAfter = await provider.getBalance('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      if (balanceAfter.gt(balanceBefore)) break;
      await new Promise(r => setTimeout(r, 500));
    }
    const increase = balanceAfter.sub(balanceBefore);
    expect(increase.gt(ethers.utils.parseEther('0.001'))).toBe(true);
  });
});
