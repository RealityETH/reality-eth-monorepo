import { test, expect } from '@playwright/test';
import { walletMockScript } from './setup/wallet-mock.js';
import { TEST_ACCOUNT } from './setup/anvil.js';
import { WEBSITE_URL } from './setup/website-server.js';

// On reload with a cached injected wallet, the header button shows the address and must
// disconnect on click — not open the connect chooser. Regression guard for the boot
// ordering where the default connect handler was set AFTER initWallet, clobbering the
// disconnect handler that initWallet had wired for the cached address.
test('reload with cached injected wallet: clicking the address disconnects, not chooser', async ({ page }) => {
  const addr = TEST_ACCOUNT.address.toLowerCase();
  await page.addInitScript(walletMockScript()); // injected wallet, eth_accounts → TEST_ACCOUNT
  await page.addInitScript(`try { localStorage.setItem('reality-eth-wallet', ${JSON.stringify(addr)}); } catch (e) {}`);
  await page.route('**/graphql**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: { question: null } }) }));

  await page.goto(`${WEBSITE_URL}/index.html#!/browse`);

  const btn = page.locator('#wallet-btn');
  await expect(btn).toHaveClass(/connected/);            // shows the cached address
  await btn.click();
  // Correct behavior: disconnect → button reverts to "Connect wallet".
  // Buggy behavior: onclick is connect → the chooser opens and the button keeps the address.
  await expect(btn).toHaveText('Connect wallet', { timeout: 5000 });
});
