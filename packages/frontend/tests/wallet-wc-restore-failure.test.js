import { test, expect } from '@playwright/test';
import { walletMockScript } from './setup/wallet-mock.js';
import { TEST_ACCOUNT } from './setup/anvil.js';
import { WEBSITE_URL } from './setup/website-server.js';

// If the app thinks WalletConnect was used last (wc flag set) but restoring it throws
// (relay/bundle hiccup), initWallet must not strand the injected wallet — it hides
// window.ethereum before the restore attempt, so a throw that skipped the restore left
// window.ethereum undefined ("connected" header, but nothing works / can't reconnect).
test('WC restore failure does not strand the injected wallet', async ({ page }) => {
  // An injected wallet is present...
  await page.addInitScript(walletMockScript());
  // ...but the app believes WC was used last, and WC restore throws.
  await page.addInitScript(`
    try {
      localStorage.setItem('reality-eth-wc-session', '1');
      localStorage.setItem('reality-eth-wallet', ${JSON.stringify(TEST_ACCOUNT.address.toLowerCase())});
    } catch (e) {}
    window.WalletConnectProvider = {
      EthereumProvider: { init: async () => { throw new Error('relay down'); } },
    };
  `);
  await page.route('**/graphql**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: { question: null } }) }));

  await page.goto(`${WEBSITE_URL}/index.html#!/browse`);

  // initWallet should catch the WC throw and restore the injected wallet, so it's usable.
  await page.waitForFunction(
    () => !!window.ethereum && window.ethereum.isMetaMask === true,
    {}, { timeout: 15000 }
  );
  const chainId = await page.evaluate(() => window.ethereum.request({ method: 'eth_chainId' }));
  expect(chainId).toBe('0x64');
});

// A stale WC cache (flag + address in localStorage) with no live session and no injected
// wallet must not leave the header claiming "connected". initWallet shows the cached
// address optimistically, then — once the WC check cleanly finds no session — should
// correct the header to disconnected rather than lying.
test('stale WC cache with no live session clears the header on load', async ({ page }) => {
  await page.addInitScript(`
    try {
      localStorage.setItem('reality-eth-wc-session', '1');
      localStorage.setItem('reality-eth-wallet', '0x1234567890123456789012345678901234567890');
    } catch (e) {}
    // WC restore resolves cleanly with NO session (session expired). No injected wallet.
    window.WalletConnectProvider = {
      EthereumProvider: { init: async () => ({ session: undefined, on() {}, request: async () => null }) },
    };
  `);
  await page.route('**/graphql**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: { question: null } }) }));

  await page.goto(`${WEBSITE_URL}/index.html#!/browse`);

  // Optimistically shows the cached address first, then corrects to "Connect wallet".
  await expect(page.locator('#wallet-btn')).toHaveText('Connect wallet', { timeout: 15000 });
  await expect(page.locator('#wallet-btn')).not.toHaveClass(/connected/);
});
