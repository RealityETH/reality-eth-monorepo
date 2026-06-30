import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { createFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

// ── WalletConnect mock ─────────────────────────────────────────────────────
// Injects window.WalletConnectProvider *before* wallet.js runs so the lazy-
// load path is exercised without loading the real 2 MB bundle.  The mock
// EthereumProvider behaves identically to the injected-wallet mock except it
// is created via EthereumProvider.init() + .connect() rather than being
// present as window.ethereum at page load.

import { walletMockScript } from './setup/wallet-mock.js';
import { TEST_ACCOUNT, FORK_BLOCK } from './setup/anvil.js';

const WC_SESSION_KEY = 'reality-eth-wc-mock-session';

function wcMockScript({ chainId = '0x64', rpcUrl = ANVIL_URL, hasSession = false } = {}) {
  // Build the underlying EIP-1193 provider string (same as walletMockScript)
  // but don't assign it to window.ethereum — that's wallet.js's job after
  // EthereumProvider.init() + .connect() are called.
  return `
(function() {
  ${walletMockScript({ chainId, rpcUrl })}   // assigns window.ethereum as side-effect
  const realEth = window.ethereum;
  delete window.ethereum;                    // remove it; WC path must set it

  const SESSION_KEY = ${JSON.stringify(WC_SESSION_KEY)};
  // Session persists across location.reload() via localStorage (mirrors real WC behaviour)
  const hasExistingSession = ${hasSession} || !!localStorage.getItem(SESSION_KEY);
  // wallet.js only tries initWC if there is a cached address; pre-seed it here.
  if (hasExistingSession && !localStorage.getItem('reality-eth-wallet')) {
    localStorage.setItem('reality-eth-wallet', ${JSON.stringify(TEST_ACCOUNT.address.toLowerCase())});
  }

  let _initCalled = false;
  let _connectCalled = false;
  const _handlers = {};

  const mockProvider = {
    accounts: hasExistingSession ? [${JSON.stringify(TEST_ACCOUNT.address)}] : [],
    session: hasExistingSession ? { topic: 'mock-session' } : null,
    connect: async function() {
      _connectCalled = true;
      this.session = { topic: 'mock-session' };
      this.accounts = [${JSON.stringify(TEST_ACCOUNT.address)}];
      localStorage.setItem(SESSION_KEY, '1');
    },
    disconnect: async function() {
      this.session = null;
      localStorage.removeItem(SESSION_KEY);
      (_handlers['disconnect'] || []).forEach(h => h());
    },
    on: function(event, handler) {
      if (!_handlers[event]) _handlers[event] = [];
      _handlers[event].push(handler);
      if (realEth.on) realEth.on(event, handler);
    },
    request: function(args) { return realEth.request(args); },
  };

  window.WalletConnectProvider = {
    EthereumProvider: {
      init: async function(_opts) {
        _initCalled = true;
        return mockProvider;
      },
    },
  };

  window.__wcMock = {
    get initCalled()    { return _initCalled; },
    get connectCalled() { return _connectCalled; },
    get session()       { return mockProvider.session; },
    triggerDisconnect() { mockProvider.disconnect(); },
  };
})();
`;
}

async function setupWCPage(page, opts = {}) {
  await page.addInitScript(wcMockScript(opts));
  await page.route('**/graphql**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { question: null } }),
    })
  );
  // Prevent the real walletconnect.js bundle from loading (not needed with mock)
  await page.route('**/walletconnect.js', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: '/* mock — WalletConnectProvider already injected */',
  }));
  // Without window.ethereum at page load, question.js falls back to the public
  // gnosis RPC. Proxy it to local anvil so test fixtures are reachable.
  // Pattern uses trailing * (no slash) to match bare-host POST requests too.
  await page.route('https://rpc.gnosischain.com*', async route => {
    const body = route.request().postData();
    try {
      const resp = await fetch(ANVIL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const text = await resp.text();
      await route.fulfill({ status: 200, contentType: 'application/json', body: text });
    } catch {
      await route.abort();
    }
  });
}

test.describe('WalletConnect flow', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createFixtures();
  });

  test.beforeEach(async () => {
    snap = await snapshot();
  });

  test.afterEach(async () => {
    await revert(snap);
  });

  async function loadQuestion(page) {
    await setupWCPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolQuestionId}`
    );
  }

  test('connect button triggers WalletConnect when no injected wallet', async ({ page }) => {
    await loadQuestion(page);

    // No window.ethereum at page load → wallet button should be visible and unlabelled
    const walletBtn = page.locator('#wallet-btn');
    await expect(walletBtn).toBeVisible();
    await expect(walletBtn).toHaveText('Connect wallet');

    // Clicking Connect should call EthereumProvider.init() and .connect()
    await walletBtn.click();

    const initCalled = await page.evaluate(() => window.__wcMock.initCalled);
    const connectCalled = await page.evaluate(() => window.__wcMock.connectCalled);
    expect(initCalled).toBe(true);
    expect(connectCalled).toBe(true);
  });

  test('wallet button shows address after WalletConnect connects', async ({ page }) => {
    await loadQuestion(page);

    await page.locator('#wallet-btn').click();

    // After connect(), wallet.js calls onChange(addr) → button text becomes short address
    const walletBtn = page.locator('#wallet-btn');
    await expect(walletBtn).not.toHaveText('Connect wallet', { timeout: 5000 });
    const text = await walletBtn.innerText();
    expect(text).toMatch(/^0x[0-9a-f]{4}…[0-9a-f]{4}$/i);
  });

  test('window.ethereum is set after WalletConnect connects', async ({ page }) => {
    await loadQuestion(page);
    await page.locator('#wallet-btn').click();
    // wallet.js assigns window.ethereum = provider after connect
    await page.waitForFunction(() => !!window.ethereum, { timeout: 5000 });
    const hasEthereum = await page.evaluate(() => typeof window.ethereum?.request === 'function');
    expect(hasEthereum).toBe(true);
  });

  test('answer form appears and submits via WalletConnect provider', async ({ page }) => {
    // Use hasSession=true so wallet.js restores the WC session before main() runs,
    // meaning walletAddr is set when the answer form is built.
    await setupWCPage(page, { hasSession: true });
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolQuestionId}`
    );

    // With an active WC session, initWallet restores window.ethereum before main()
    // so the answer form (not locked state) should render.
    await page.waitForSelector('input[name="questionBond"]', { timeout: 30000 });

    // Intercept the transaction sent through the WC-backed provider
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

    await page.locator('select[name="input-answer"]').selectOption('1'); // Yes
    await page.locator('.post-answer-button').click();

    const tx = await txPromise;
    expect(tx.to.toLowerCase()).toBe(CONTRACTS.realityEth30.toLowerCase());
    expect(tx.data).toMatch(/^0x/);
  });

  test('disconnect clears wallet state', async ({ page }) => {
    await loadQuestion(page);

    await page.locator('#wallet-btn').click();
    await page.waitForFunction(() => !!window.ethereum, { timeout: 5000 });

    // Simulate WalletConnect disconnect event
    await page.evaluate(() => window.__wcMock.triggerDisconnect());

    // wallet.js hears 'disconnect', clears cache, calls onChange(null)
    const walletBtn = page.locator('#wallet-btn');
    await expect(walletBtn).toHaveText('Connect wallet', { timeout: 5000 });
  });
});
