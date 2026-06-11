import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createReopenFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

// Reopen flow (v3.0+):
//   1. A question finalized with the "Answered Too Soon" sentinel gets the
//      `reopenable` CSS class and a visible reopen-container.
//   2. Clicking Reopen calls reopenQuestion() with the original question's
//      parameters and sets reopens_question_id to the original ID.
//   3. After the TX confirms and the dapp refreshes (~6-10 s), the original
//      question window loses `reopenable` and gains `reopened`.

test.describe('reopen flow', () => {
  // Allow for TX mining + the dapp's built-in 6 s post-confirm delay + refetch
  test.setTimeout(60000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createReopenFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  // Load the finalized too-soon question and wait until the dapp has fetched
  // the reopener-question data (which is what triggers the `reopenable` class).
  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win &&
        win.classList.contains('question-state-finalized') &&
        win.classList.contains('reopenable');
    }, {}, { timeout: 30000 });
    return page.locator('.rcbrowser--qa-detail:not(.template-item)');
  }

  // ── State and UI ───────────────────────────────────────────────────────────

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

  // ── Calldata ───────────────────────────────────────────────────────────────

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
    // The new question reopens the original
    expect(decoded.args.reopens_question_id).toBe(fixtures.questionId);
    // Inherits the same timeout as the original question (60 s)
    expect(decoded.args.timeout).toBe(60);
    // No min_bond was set on the original
    expect(decoded.args.min_bond.eq(0)).toBe(true);
    // No bounty attached to the reopen call itself (value field absent or zero)
    expect(!tx.value || ethers.BigNumber.from(tx.value).eq(0)).toBe(true);
  });

  // ── Post-reopen state ──────────────────────────────────────────────────────

  test('original question shows reopened class on fresh load after TX mines', async ({ page }) => {
    const win = await loadQuestion(page);

    // Capture the TX so we know it landed before we reload the page.
    // The dapp also does an async in-place refresh (with a 6 s delay), but
    // re-navigating is more reliable under test conditions.
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
    await txHashPromise; // TX mined (Anvil auto-mines)

    // Navigate back to the same question URL so the dapp fetches fresh data.
    // The contract now has reopened_questions(original_id) set, so on reload
    // the dapp will call isReopenable() → false → addClass('reopened').
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForFunction(() => {
      const w = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return w &&
        w.classList.contains('question-state-finalized') &&
        w.classList.contains('reopened');
    }, {}, { timeout: 30000 });

    const freshWin = page.locator('.rcbrowser--qa-detail:not(.template-item)');
    await expect(freshWin).not.toHaveClass(/reopenable/);
    await expect(freshWin.locator('.reopened-container')).toBeVisible();
  });
});
