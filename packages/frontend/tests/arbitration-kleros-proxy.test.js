import { test, expect } from '@playwright/test';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createKlerosFixtures, createForeignProxyFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// The Kleros foreign proxy really lives on another chain (the home proxy's
// foreignChainId, typically Ethereum mainnet). In tests we simulate it on the same
// anvil fork — the mock bytecode planted at the foreign-proxy address answers
// getDisputeFee / requestArbitration — so we point the frontend's RPC for that chain at
// anvil via a per-chain override. That covers the fee read, the request tx, AND the
// receipt poll (waitForTx uses the foreign chain), with no real network access.
function foreignChainRpcOverrideScript(foreignChainId) {
  return `try { localStorage.setItem('reality.rpcUrl.${foreignChainId}', ${JSON.stringify(ANVIL_URL)}); } catch (e) {}`;
}

test.describe('Kleros foreign-proxy arbitration flow', () => {
  test.setTimeout(60000);

  let snap;
  let fixtures; // { foreignProxyAddr, klerosQuestionId, bond, bounty, answer }

  test.beforeAll(async () => {
    const klerosFixtures = await createKlerosFixtures();
    fixtures = await createForeignProxyFixtures(klerosFixtures);
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page, opts = {}) {
    await setupPage(page, { extraContracts: [fixtures.foreignProxyAddr], asyncChainChanged: opts.asyncChainChanged });
    await page.addInitScript(foreignChainRpcOverrideScript(fixtures.foreignChainId));
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.klerosQuestionId}`
    );
    // Wait until fee is loaded: button exists and is no longer disabled
    await page.waitForFunction(
      () => {
        const btn = document.getElementById('arb-btn');
        return btn && !btn.disabled;
      },
      {}, { timeout: 30000 }
    );
  }

  test('arbitration button shows Kleros fee and chain-switch note', async ({ page }) => {
    await loadQuestion(page);

    const btnText = await page.locator('#arb-btn').textContent();
    expect(btnText).toContain('costs');
    expect(btnText).toContain('ETH');
    expect(btnText).not.toContain('Loading');
    expect(btnText).not.toContain('unavailable');

    const note = await page.locator('#arb-note').textContent();
    expect(note.toLowerCase()).toContain('switch');
  });

  test('arbitration button click sends requestArbitration and confirms', async ({ page }) => {
    await loadQuestion(page);

    await page.click('#arb-btn');

    // The click handler switches to mainnet, sends the TX, waits for receipt,
    // then sets button text to '✓ Done'.
    await page.waitForFunction(
      () => document.getElementById('arb-btn')?.textContent === '✓ Done',
      {}, { timeout: 30000 }
    );

    await expect(page.locator('#arb-btn')).toHaveText('✓ Done');
  });

  // Real wallets emit chainChanged a tick after the switch resolves; wallet.js reloads on
  // chainChanged unless it's an internal switch. If the internal-switch flag is cleared too
  // early, that late event reloads the page mid-flow and the arbitration never completes.
  test('cross-chain switch does not reload the page when chainChanged fires async', async ({ page }) => {
    await loadQuestion(page, { asyncChainChanged: true });

    // Sentinel wiped by a page reload.
    await page.evaluate(() => { window.__noReload = true; });

    await page.click('#arb-btn');

    await page.waitForFunction(
      () => document.getElementById('arb-btn')?.textContent === '✓ Done',
      {}, { timeout: 30000 }
    );
    expect(await page.evaluate(() => window.__noReload === true)).toBe(true);
  });
});
