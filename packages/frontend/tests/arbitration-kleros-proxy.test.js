import { test, expect } from '@playwright/test';
import { snapshot, revert, ANVIL_URL, TEST_ACCOUNT } from './setup/anvil.js';
import { setupPage, setupPageWithStalePonder, walletMockScript } from './setup/wallet-mock.js';
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

  // When the fee read fails on the foreign chain, the RPC indicator must name the foreign
  // endpoint (the genuinely broken one), not the question chain's RPC.
  test('cross-chain fee failure records the foreign chain RPC, not the question chain', async ({ page }) => {
    await setupPage(page, { extraContracts: [fixtures.foreignProxyAddr] });
    // Question chain stays healthy (anvil); point the FOREIGN chain RPC at a dead endpoint.
    await page.addInitScript(
      `try { localStorage.setItem('reality.rpcUrl.' + ${fixtures.foreignChainId}, 'http://127.0.0.1:1'); } catch (e) {}`
    );
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.klerosQuestionId}`
    );

    await expect(page.locator('#ind-rpc')).toHaveClass(/offline/, { timeout: 30000 });
    const ds = await page.locator('#ind-rpc').evaluate((el) => ({ url: el.dataset.rpcUrl, chain: el.dataset.rpcChain }));
    expect(ds.url).toBe('http://127.0.0.1:1');   // the foreign RPC, not the Gnosis one
    expect(ds.chain).not.toBe('Gnosis');          // labelled with the foreign chain
  });

  // The pending-arbitration refine-notice scans the foreign proxy for ArbitrationRequested
  // events. An unbounded queryFilter (fromBlock 0) is rejected by public RPCs, so the scan
  // must start from a bounded block derived from the arbitration-requested timestamp. We
  // point the foreign chain at a mock RPC and assert the eth_getLogs it issues is bounded.
  test('pending Kleros refine-notice bounds the ArbitrationRequested log scan', async ({ page }) => {
    const FOREIGN_RPC = 'https://mock-foreign.reality-test.local/rpc';
    let logsFromBlock = null;

    const reqTs = Math.floor(Date.now() / 1000) - 3600; // requested ~1h ago
    const q = {
      templateId: '0', data: 'Pending Kleros arbitration', title: 'Pending Kleros arbitration',
      type: 'bool', category: '', lang: 'en_US', outcomes: null,
      creator: TEST_ACCOUNT.address.toLowerCase(),
      arbitrator: CONTRACTS.klerosArbitrator,
      openingTimestamp: '0', timeout: '86400',
      currentAnswer: '0x' + '0'.repeat(63) + '1', currentAnswerBond: '1000000000000000',
      minBond: '0', bounty: '0', scheduledFinalizationTimestamp: '0',
      arbitrationOccurred: false, isPendingArbitration: true,
      arbitrationRequestedTimestamp: String(reqTs),
      createdBlock: '1', createdLogIndex: '0',
      createdTxHash: '0x' + '0'.repeat(64), reopensQuestionId: null,
    };

    await setupPageWithStalePonder(page, {
      question: q, responses: { items: [] }, claims: { items: [] }, reopeners: { items: [] },
    });
    await page.addInitScript(
      `try { localStorage.setItem('reality.rpcUrl.' + ${fixtures.foreignChainId}, ${JSON.stringify(FOREIGN_RPC)}); } catch (e) {}`
    );

    // Mock the foreign RPC: recent head, no existing dispute (eth_call → false), capture getLogs.
    await page.route(/mock-foreign\.reality-test\.local/, async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      const handle = (req) => {
        switch (req.method) {
          case 'eth_blockNumber': return { jsonrpc: '2.0', id: req.id, result: '0x1312d00' }; // 20,000,000
          case 'eth_chainId':     return { jsonrpc: '2.0', id: req.id, result: '0x' + Number(fixtures.foreignChainId).toString(16) };
          case 'eth_getLogs':     logsFromBlock = req.params?.[0]?.fromBlock; return { jsonrpc: '2.0', id: req.id, result: [] };
          case 'eth_call':        return { jsonrpc: '2.0', id: req.id, result: '0x' + '0'.repeat(64) }; // disputeExists=false
          default:                return { jsonrpc: '2.0', id: req.id, result: null };
        }
      };
      const resp = Array.isArray(body) ? body.map(handle) : handle(body);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) });
    });

    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.klerosQuestionId}`
    );

    await expect(page.locator('#arb-pending-notice')).toBeVisible({ timeout: 30000 });
    await expect.poll(() => logsFromBlock, { timeout: 30000 }).not.toBeNull();

    // Bounded: not a full-history scan from genesis.
    expect(logsFromBlock).not.toBe('0x0');
    expect(parseInt(logsFromBlock, 16)).toBeGreaterThan(0);
  });

  // With no wallet connected the button becomes "Connect wallet", so the fee (previously only
  // shown on the request button) must move into the note above it.
  test('arbitration fee is shown in the note when no wallet is connected', async ({ page }) => {
    // Wallet present but not authorized (eth_accounts → []), so the page loads disconnected.
    await page.addInitScript(walletMockScript({ connected: false, extraContracts: [fixtures.foreignProxyAddr] }));
    await page.route('**/graphql**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { question: null } }) }));
    await page.addInitScript(foreignChainRpcOverrideScript(fixtures.foreignChainId));

    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.klerosQuestionId}`
    );

    // Disconnected → connect affordance, not the request button.
    await expect(page.locator('#arbitration-section .btn-connect')).toHaveText('Connect wallet', { timeout: 30000 });
    expect(await page.locator('#arb-btn').count()).toBe(0);

    // The fee is visible in the note above the button.
    const note = await page.locator('#arb-note').textContent();
    expect(note).toMatch(/arbitration fee is/i);
    expect(note).toContain('ETH');
  });
});
