import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage, setupPageWithStalePonder } from './setup/wallet-mock.js';
import { createClaimFixtures, createClaimedYesFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';
import { TEST_ACCOUNT } from './setup/anvil.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

// The claim test uses the question view rather than account.html.
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
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.claimQuestionId}`
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

    const iface = new ethers.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data });

    expect(decoded.name).toBe('claimMultipleAndWithdrawBalance');
    expect(decoded.args.question_ids[0]).toBe(fixtures.claimQuestionId);
    expect(Number(decoded.args.lengths[0])).toBe(1);
    expect(decoded.args.answers[0]).toBe(fixtures.answer);
    expect(decoded.args.addrs[0].toLowerCase()).toBe(
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    );
    expect(decoded.args.bonds[0]).toBe(fixtures.bond);
    // Single answer: oldest prev hash is zero
    expect(decoded.args.hist_hashes[0]).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  test('balance increases after claim', async ({ page }) => {
    const provider = new ethers.JsonRpcProvider(ANVIL_URL);
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
      if (balanceAfter > balanceBefore) break;
      await new Promise(r => setTimeout(r, 500));
    }

    // Should receive bond (0.001) + bounty (0.001) = 0.002 ETH, minus gas
    const increase = balanceAfter - balanceBefore;
    expect(increase > ethers.parseEther('0.001')).toBe(true);
  });
});

// ── Indexer path: claim state determined from ponder claim records ─────────────

const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';

// Build a ponder data payload for the claim fixtures question.
// includeClaim: whether to include a claim record (simulates distributed state).
function makeClaimPonderData(questionId, bondStr, includeClaim) {
  return {
    question: {
      templateId: '0',
      data: 'Will this claim test pass?',
      title: 'Will this claim test pass?',
      type: 'bool',
      category: '',
      lang: 'en_US',
      outcomes: null,
      questionJson: null,
      creator: TEST_ACCOUNT.address.toLowerCase(),
      arbitrator: ethers.ZeroAddress.toLowerCase(),
      openingTimestamp: '0',
      timeout: '60',
      currentAnswer: YES,
      currentAnswerBond: bondStr,
      minBond: '0',
      bounty: ethers.parseEther('0.001').toString(),
      scheduledFinalizationTimestamp: '1',  // far in the past → isFinalized() = true
      arbitrationOccurred: false,
      isPendingArbitration: false,
      createdBlock: '1',
      createdLogIndex: '0',
      createdTxHash: '0x' + '00'.repeat(32),
      reopensQuestionId: null,
    },
    responses: {
      items: [{
        answer: YES,
        commitmentHash: null,
        bond: bondStr,
        user: TEST_ACCOUNT.address.toLowerCase(),
        historyHash: '0x' + 'ab'.repeat(32),  // any non-zero value; check skipped for finalized+events
        isCommitment: false,
        isUnrevealed: false,
        timestamp: '1',
        createdBlock: '1',
        createdLogIndex: '0',
        createdTxHash: '0x' + '00'.repeat(32),
        revealedBlock: null,
        revealedTxHash: null,
      }],
    },
    claims: {
      items: includeClaim ? [{
        user: TEST_ACCOUNT.address.toLowerCase(),
        amount: bondStr,
        createdTxHash: '0x' + 'cc'.repeat(32),
        createdTimestamp: '1700000000',
      }] : [],
    },
    reopeners: { items: [] },
  };
}

test.describe('claim section: indexer path', () => {
  let fixtures;
  let snap;

  test.beforeAll(async () => {
    fixtures = await createClaimFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  test('shows distributed note when indexer has claim records', async ({ page }) => {
    const ponderData = makeClaimPonderData(fixtures.claimQuestionId, fixtures.bond.toString(), true);
    await setupPageWithStalePonder(page, ponderData);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.claimQuestionId}`
    );
    await page.waitForSelector('.claim-distributed', { state: 'visible', timeout: 30000 });
    await expect(page.locator('.claim-distributed')).toContainText('✓ Bonds distributed');
    await expect(page.locator('.claim-section')).not.toBeVisible();
  });

  test('shows claim button when indexer has no claim records', async ({ page }) => {
    const ponderData = makeClaimPonderData(fixtures.claimQuestionId, fixtures.bond.toString(), false);
    await setupPageWithStalePonder(page, ponderData);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.claimQuestionId}`
    );
    await page.waitForSelector('.claim-section .claim-button', { state: 'visible', timeout: 30000 });
    await expect(page.locator('.claim-section')).toBeVisible();
    await expect(page.locator('.claim-distributed')).not.toBeVisible();
  });
});

// ── RPC path: claim state determined from on-chain getHistoryHash ─────────────

test.describe('claim section: RPC path (no indexer)', () => {
  let fixtures;
  let snap;

  test.beforeAll(async () => {
    fixtures = await createClaimedYesFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  test('shows distributed note when on-chain history_hash is zero', async ({ page }) => {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForSelector('.claim-distributed', { state: 'visible', timeout: 30000 });
    await expect(page.locator('.claim-distributed')).toContainText('✓ Bonds distributed');
    await expect(page.locator('.claim-section')).not.toBeVisible();
  });
});
