import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, setAutomine, mineBlocks } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerTypeFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';
import { ANVIL_URL } from './setup/anvil.js';

test.describe('optimistic answer UX', () => {
  test.setTimeout(60000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createAnswerTypeFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => {
    await setAutomine(true);  // always restore automine, even if a test fails mid-flight
    await revert(snap);
    snap = await snapshot();
  });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolId}`
    );
    // Wait for the answer form to appear (open question, wallet connected)
    await page.waitForSelector('.post-answer-button', { state: 'visible', timeout: 30000 });
  }

  async function selectYesAndFillBond(page) {
    await page.selectOption('select[name="input-answer"]', '1');  // Yes
    await page.fill('.bond-input-field', '0.001');
  }

  // ── Test 1: optimistic "pending" entry appears before block mines ─────────────

  test('answer entry appears with pending tag before block mines', async ({ page }) => {
    await loadQuestion(page);
    await selectYesAndFillBond(page);

    await setAutomine(false);

    // Intercept eth_sendTransaction so we know the exact moment the TX hits the
    // mempool (and onSubmitted has fired — the optimistic entry is rendered).
    const txSent = page.evaluate(() =>
      new Promise(resolve => {
        const orig = window.ethereum.request.bind(window.ethereum);
        window.ethereum.request = async (args) => {
          const result = await orig(args);
          if (args.method === 'eth_sendTransaction') resolve(result);
          return result;
        };
      })
    );

    await page.locator('.post-answer-button').click();
    await txSent;

    // The banner title should say "Pending answer" and show a pulsing "pending" badge.
    // Two badges appear: one in #answer-banner, one in the bond list.
    await page.waitForSelector('.bond-tag.tag-pending', { state: 'visible', timeout: 5000 });
    await expect(page.locator('#answer-banner .card-title')).toContainText('Pending answer');
    await expect(page.locator('.bond-tag.tag-pending').first()).toBeVisible();

    // Mine the block so cleanup/revert can proceed cleanly
    await mineBlocks(1);
  });

  // ── Test 2: entry transitions to "current" tag after block mines ─────────────

  test('pending entry becomes confirmed (tag-current) after block mines', async ({ page }) => {
    await loadQuestion(page);
    await selectYesAndFillBond(page);

    await setAutomine(false);

    const txSent = page.evaluate(() =>
      new Promise(resolve => {
        const orig = window.ethereum.request.bind(window.ethereum);
        window.ethereum.request = async (args) => {
          const result = await orig(args);
          if (args.method === 'eth_sendTransaction') resolve(result);
          return result;
        };
      })
    );

    await page.locator('.post-answer-button').click();
    await txSent;

    // Confirm pending is visible
    await page.waitForSelector('.bond-tag.tag-pending', { state: 'visible', timeout: 5000 });

    // Mine the block — this triggers waitForTx to resolve and onConfirmed to fire
    await mineBlocks(1);
    await setAutomine(true);

    // The pending tag should be replaced by the real "current" tag.
    // Banner title is "Current answer" if timeout hasn't elapsed yet, or "Final answer"
    // if it has (fork block is Jun 2026 so 60s-timeout questions finalize immediately
    // from the Aug 2026 browser clock).  Either state means the pending UX is gone.
    await page.waitForSelector('.bond-tag.tag-current', { state: 'visible', timeout: 15000 });
    await expect(page.locator('.bond-tag.tag-pending')).not.toBeVisible();
    await expect(page.locator('.bond-tag.tag-current')).toBeVisible();
    await expect(page.locator('#answer-banner .card-title')).toContainText(/Current answer|Final answer/);
    await expect(page.locator('.current-answer-container .bond-answer-label')).toContainText('Yes');
  });

  // ── Test 3: page is not reloaded after confirmation ──────────────────────────

  test('page is not reloaded after answer is confirmed', async ({ page }) => {
    await loadQuestion(page);
    await selectYesAndFillBond(page);

    // Plant a flag that will not survive a location.reload()
    await page.evaluate(() => { window.__noReload = true; });

    await page.locator('.post-answer-button').click();

    // Wait for the TX to confirm and the entry to become "current"
    await page.waitForSelector('.bond-tag.tag-current', { state: 'visible', timeout: 30000 });

    const survived = await page.evaluate(() => window.__noReload);
    expect(survived).toBe(true);
  });

  // ── Test 4: confirmed entry persists after a forced re-render ─────────────────
  //
  // After the TX confirms, calling _renderDynamic() (triggered via wallet disconnect)
  // must not wipe the confirmed answer entry — the data model was updated from the
  // receipt, so renderHistory re-draws the correct state from data.answerEvents.

  test('confirmed answer entry persists after wallet-triggered re-render', async ({ page }) => {
    await loadQuestion(page);
    await selectYesAndFillBond(page);

    await page.locator('.post-answer-button').click();
    await page.waitForSelector('.bond-tag.tag-current', { state: 'visible', timeout: 30000 });

    // Simulate wallet disconnect: null !== walletAddr → addrChanged=true →
    // lastFormState=null → _renderDynamic() → renderHistory(data) re-runs.
    await page.evaluate(() => window._setQuestionWallet?.(null));

    // History is rendered from data.answerEvents (updated from the receipt),
    // so the confirmed entry must still be there.
    await expect(page.locator('.current-answer-container .bond-answer-label')).toBeVisible();
    await expect(page.locator('.current-answer-container .bond-answer-label')).toContainText('Yes');
    await expect(page.locator('.bond-tag.tag-current')).toBeVisible();
  });
});
