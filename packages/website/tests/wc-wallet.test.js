// Tests for WalletConnect optional-chain session behaviour.
//
// The core WC quirk under test: when a session is established on an
// optional chain (e.g. Sepolia or Gnosis when mainnet is the required
// chain), the EthereumProvider reports eth_accounts = [] even though the
// session has a valid address in provider.accounts and the session namespace.
//
// Every view that called getSigner() internally hit eth_accounts → got [] →
// the provider threw → the promise chain silently died → the UI stayed in a
// "not connected" state despite the wallet being connected.
//
// These tests use wcWalletMockScript() which pre-sets window.WalletConnectProvider
// so wallet.js takes the real WC init path without fetching the actual bundle.

import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { wcWalletMockScript } from './setup/wallet-mock.js';
import { createFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// All tests use Gnosis (100) as the WC session chain — same chain as the
// Anvil fork, so RPC calls land on the right contracts.
const WC_MOCK = wcWalletMockScript({ sessionChainId: 100 });

// Stub Ponder to return null for any question query, triggering RPC fallback.
const PONDER_NULL = route => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({ data: { question: null } }),
});

// Stub Ponder to return empty lists for any account-page query shape.
const PONDER_EMPTY_ACCOUNT = route => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({
    data: {
      questions:  { items: [], pageInfo: { hasNextPage: false } },
      responses:  { items: [], pageInfo: { hasNextPage: false } },
      claims:     { items: [] },
    },
  }),
});

// ── Question page ─────────────────────────────────────────────────────────────
// Before the fix: _setQuestionWallet called getSigner() which hit eth_accounts
// → returned [] for WC optional-chain → getSigner threw → realityRW stayed null
// → buildAnswerForm rendered the "Connect wallet" button instead of "Post answer".
// After the fix: JsonRpcSigner is constructed synchronously from the known
// address, bypassing eth_accounts entirely.

test.describe('WC wallet: question page', () => {
  let fixtures;
  let snap;

  test.beforeAll(async () => { fixtures = await createFixtures(); });
  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  test('shows Post-answer button (not Connect-wallet) for WC optional-chain session', async ({ page }) => {
    await page.addInitScript(WC_MOCK);
    await page.route('**/graphql**', PONDER_NULL);

    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolQuestionId}`
    );
    await page.waitForSelector('.question-state-open', { timeout: 30000 });

    // After the fix: wallet connected → "Post answer" visible, no "Connect wallet"
    await expect(page.locator('.post-answer-button')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.btn-connect')).toHaveCount(0);
  });
});

// ── Account page ──────────────────────────────────────────────────────────────
// Before the fix: onWalletChange in account.js called getSigner() on a
// BrowserProvider wrapping the WC provider.  eth_accounts → [] → getSigner
// threw → setViewAddr was never called → connect-prompt stayed visible.
// The fix uses JsonRpcSigner (no eth_accounts round-trip) and moves
// setViewAddr/updateWalletUI into finally() so it always runs.

test.describe('WC wallet: account page', () => {
  test('shows account content (not connect-prompt) when WC session is active', async ({ page }) => {
    await page.addInitScript(WC_MOCK);
    await page.route('**/graphql**', PONDER_EMPTY_ACCOUNT);

    // Navigate to /account with no address — the page should auto-fill from
    // the connected wallet and show account-content, not the connect-prompt.
    await page.goto(`${WEBSITE_URL}/index.html#!/account`);

    await expect(page.locator('#account-content')).toBeVisible({ timeout: 10000 });
    // connect-prompt must be hidden (display:none set by setViewAddr)
    await expect(page.locator('#connect-prompt')).toHaveCSS('display', 'none');
  });
});

// ── Ask page ──────────────────────────────────────────────────────────────────
// Bug in ask-view.js applyWallet(): async function calls `await getSigner()`
// which hits eth_accounts → [] for WC optional-chain → getSigner throws →
// since applyWallet is called without await, rejection is silently discarded →
// walletNotice.style.display = 'none' is never reached → notice stays visible.
// Fix: replace `await provider.getSigner()` with synchronous JsonRpcSigner.

test.describe('WC wallet: ask page', () => {
  test('hides wallet-notice when WC session is active', async ({ page }) => {
    await page.addInitScript(WC_MOCK);

    await page.goto(`${WEBSITE_URL}/index.html#!/ask`);

    // After wallet connects (via WC session restore), the notice should be
    // hidden.  Before the fix getSigner() throws so it stays visible.
    await expect(page.locator('#ask-wallet-notice')).toHaveCSS('display', 'none', { timeout: 10000 });
  });
});

// ── Template page ─────────────────────────────────────────────────────────────
// Bug in template-view.js applyWallet(): uses ethers v5 API
// `ethers.providers.Web3Provider` which doesn't exist in the v6 bundle →
// TypeError thrown synchronously → walletNotice.style.display = 'none' never
// reached → notice stays visible.  Also missing window.ethereum guard.
// Fix: switch to ethers.BrowserProvider + JsonRpcSigner.

test.describe('WC wallet: template page', () => {
  test('hides wallet-notice when WC session is active', async ({ page }) => {
    await page.addInitScript(WC_MOCK);

    await page.goto(`${WEBSITE_URL}/index.html#!/template`);

    // After wallet connects the notice should be hidden.
    // Before the fix, the ethers v5 API TypeError keeps it visible.
    await expect(page.locator('#wallet-notice')).toHaveCSS('display', 'none', { timeout: 10000 });
  });
});
