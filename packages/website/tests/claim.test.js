import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createClaimFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

// The claim test uses question.html rather than account.html.
// A finalized question shows a "Claim & withdraw" button in the right column
// when the connected wallet has a winning answer — using RPC event data, no Ponder needed.
test.describe('claim winnings', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createClaimFixtures();
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
      `${WEBSITE_URL}/question.html?network=100&contract=${CONTRACTS.realityEth30}&question=${fixtures.claimQuestionId}`
    );
    // Wait for the claim button to appear in the finalized question's right column
    await page.waitForSelector('.claim-section .claim-button', { state: 'visible', timeout: 30000 });
  }

  test('calldata is correct for claim', async ({ page }) => {
    await loadQuestion(page);

    // Resolve AFTER orig(args) so the TX is mined before afterEach evm_revert runs
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

    await page.locator('.claim-section .claim-button').click();

    const tx = await txPromise;
    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());

    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data });

    expect(decoded.name).toBe('claimMultipleAndWithdrawBalance');
    expect(decoded.args.question_ids[0]).toBe(fixtures.claimQuestionId);
    expect(decoded.args.lengths[0].toNumber()).toBe(1);
    expect(decoded.args.answers[0]).toBe(fixtures.answer);
    expect(decoded.args.addrs[0].toLowerCase()).toBe(
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    );
    expect(decoded.args.bonds[0].eq(fixtures.bond)).toBe(true);
    // Single answer: oldest prev hash is zero
    expect(decoded.args.hist_hashes[0]).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  test('balance increases after claim', async ({ page }) => {
    const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
    const balanceBefore = await provider.getBalance('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

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

    await page.locator('.claim-section .claim-button').click();
    await txHashPromise;

    let balanceAfter = balanceBefore;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      balanceAfter = await provider.getBalance('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      if (balanceAfter.gt(balanceBefore)) break;
      await new Promise(r => setTimeout(r, 500));
    }

    // Should receive bond (0.001) + bounty (0.001) = 0.002 ETH, minus gas
    const increase = balanceAfter.sub(balanceBefore);
    expect(increase.gt(ethers.utils.parseEther('0.001'))).toBe(true);
  });
});
