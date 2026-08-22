import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createReopenFixtures, createDoubleReopenFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

test.describe('reopen flow', () => {
  test.setTimeout(60000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createReopenFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    // Wait for the reopen container to become visible (question is finalized + reopenable)
    await page.waitForSelector('.reopen-container', { state: 'visible', timeout: 30000 });
  }

  // ── State and UI ───────────────────────────────────────────────────────────

  test('reopen-container is visible for a reopenable question', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.reopen-container')).toBeVisible();
    await expect(page.locator('.reopen-container')).toContainText('answered before the');
  });

  test('reopened-container is hidden for a reopenable question', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.reopened-container')).not.toBeVisible();
  });

  // ── Calldata ───────────────────────────────────────────────────────────────

  test('clicking Reopen sends reopenQuestion with correct reopens_question_id', async ({ page }) => {
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

    await page.locator('.reopen-question-submit').click();
    const tx = await txPromise;

    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());

    const iface = new ethers.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('reopenQuestion');
    expect(decoded.args.reopens_question_id).toBe(fixtures.questionId);
    expect(decoded.args.timeout).toBe(60n);
    expect(decoded.args.min_bond).toBe(0n);
    expect(!tx.value || BigInt(tx.value) === 0n).toBe(true);
  });

  // ── Post-reopen state ──────────────────────────────────────────────────────

  test('original question shows reopened container on fresh load after TX mines', async ({ page }) => {
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

    await page.locator('.reopen-question-submit').click();
    await txHashPromise; // TX mined

    // Navigate back so the page fetches fresh chain data
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    // After reopen TX, the contract sets reopened_questions[original] = new_id,
    // so the page should show the reopened container instead of reopen button
    await page.waitForSelector('.reopened-container', { state: 'visible', timeout: 30000 });
    await expect(page.locator('.reopen-container')).not.toBeVisible();
  });
});

// ── Double-reopen finalization tests ─────────────────────────────────────────
//
// When a question is reopened and the reopener is itself answered "too soon",
// re-opening the original is only valid once the reopener has FINALIZED.
// The dapp must not show the reopen button while the reopener's timeout is
// still counting down.
//
// Fixture layout (see createDoubleReopenFixtures):
//   pendingOriginalId — original finalized too-soon; reopener has 90-day timeout
//                       → reopener finalize_ts ≈ Sep 2026 > browser clock (~Aug 2026)
//                       → NOT yet finalized → reopen button must NOT appear
//   readyOriginalId   — original finalized too-soon; reopener has 60s timeout
//                       → reopener finalize_ts ≈ Jun 2026 < browser clock (~Aug 2026)
//                       → IS finalized → reopen button MUST appear

test.describe('double-reopen finalization', () => {
  test.setTimeout(60000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createDoubleReopenFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadAndWait(page, questionId, waitSelector) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${questionId}`
    );
    await page.waitForSelector(waitSelector, { state: 'visible', timeout: 30000 });
  }

  // "pending" fixture: question was reopened, reopener answered too soon but NOT
  // finalized from the browser — so isReopened=true → .reopened-container shows,
  // and isReopenable=false → .reopen-container must NOT show.
  test('reopen button NOT visible when reopener answered too soon but not yet finalized', async ({ page }) => {
    await loadAndWait(page, fixtures.pendingOriginalId, '.reopened-container');
    await expect(page.locator('.reopen-container')).not.toBeVisible();
  });

  test('reopened-container IS visible when reopener answered too soon but not yet finalized', async ({ page }) => {
    await loadAndWait(page, fixtures.pendingOriginalId, '.reopened-container');
    await expect(page.locator('.reopened-container')).toBeVisible();
  });

  // "ready" fixture: reopener answered too soon AND finalized → isReopenable=true
  test('reopen button IS visible when reopener answered too soon AND finalized', async ({ page }) => {
    await loadAndWait(page, fixtures.readyOriginalId, '.reopen-container');
    await expect(page.locator('.reopen-container')).toBeVisible();
  });
});
