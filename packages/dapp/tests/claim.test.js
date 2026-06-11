import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createClaimFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

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

  // Selector for the Claim All button in the My Account window, specific to the v3.0 contract.
  // The template element (.contract-claim-section-template) is always first in DOM order and
  // always has display:none — so we must target the specific contract section, not the generic
  // '.answer-claim-button.claim-all' which Playwright picks up first as invisible.
  const claimAllSelector = `#your-question-answer-window .contract-claim-section[data-contract="${CONTRACTS.realityEth30.toLowerCase()}"] .answer-claim-button.claim-all`;

  async function loadAndOpenClaim(page) {
    await setupPage(page);
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.claimQuestionId}`
    );

    // Wait for the question to be fully loaded (triggers CSS showing answer form/state)
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && (
        win.classList.contains('question-state-open') ||
        win.classList.contains('question-state-finalized')
      );
    }, {}, { timeout: 30000 });

    // Open My Account window
    await page.click('#your-qa-button');
    await page.waitForSelector('#your-question-answer-window.is-open', { timeout: 10000 });

    // Wait for the Claim All button to become visible (updateClaimableDisplay must run)
    await page.waitForSelector(claimAllSelector, { state: 'visible', timeout: 30000 });
  }

  test('calldata is correct for claim', async ({ page }) => {
    await loadAndOpenClaim(page);

    // Resolve AFTER orig(args) mines the TX so that by the time Node.js receives
    // the promise value, the TX is definitely mined.  If we resolved before mining
    // (the naive pattern), evm_revert in afterEach can race the pending fetch and
    // sometimes run first, letting the TX mine on the restored state (hist_hash → 0).
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

    await page.click(claimAllSelector);

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
    // Single answer: history hash chain terminates with 0x0
    expect(decoded.args.hist_hashes[0]).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    );
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

    // Re-assert visibility: the dapp's background polling can briefly re-hide
    // the claim button after the initial display, then show it again once the
    // contract's balanceOf resolves on the reverted fork. Wait for it to settle.
    await page.waitForSelector(claimAllSelector, { state: 'visible', timeout: 15000 });
    await page.click(claimAllSelector);

    // Wait for tx to be submitted, then poll getBalance until it increases.
    // We avoid provider.waitForTransaction(hash) here because that method calls
    // eth_getTransactionReceipt which routes through anvil; if the tx isn't mined
    // yet, anvil falls back to the archive and gets a 429 under rate-limiting.
    // eth_getBalance for a local account never hits the archive.
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
