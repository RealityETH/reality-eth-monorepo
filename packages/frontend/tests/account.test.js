import { test, expect } from '@playwright/test';
import { snapshot, revert, FORK_BLOCK, ANVIL_URL } from './setup/anvil.js';
import { walletMockScript } from './setup/wallet-mock.js';
import { createAccountTemplateFixtures } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

const TEST_ADDRESS = '0x68154ea682f95bf582b80dd6453fa401737491dc';

test.describe('account page', () => {
  test('loads without JS errors for a known address', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    // Stub out Ponder — return empty lists for every query shape the page issues.
    // A single merged response works because each caller only reads its own field.
    await page.route('**/graphql**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            questions:  { items: [] },
            responses:  { items: [] },
            claims:     { items: [] },
          },
        })
      })
    );

    await page.goto(`${WEBSITE_URL}/index.html#!/account/${TEST_ADDRESS}`);

    // "No questions asked yet" confirms the page finished rendering without crashing
    await expect(page.locator('#asked-loading')).toContainText('No questions asked yet', { timeout: 10000 });

    // No JS errors (filter out benign favicon 404s)
    const realErrors = errors.filter(e => !e.includes('favicon'));
    expect(realErrors).toHaveLength(0);
  });
});

test.describe('account page: template resolution from RPC', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createAccountTemplateFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  test('shows resolved title (not raw ␟-encoded text) for RPC-fetched question', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Inject wallet mock (connects as TEST_ACCOUNT on chain 100 / Anvil fork)
    await page.addInitScript(walletMockScript());

    // Ponder returns 500 → page falls back to RPC scan
    await page.route('**/graphql**', route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    );

    // Navigate to #!/account with NO address so onWalletChange sets it.
    // This guarantees walletChainId=100 is set before runAccount computes chainsToScan.
    await page.goto(`${WEBSITE_URL}/index.html#!/account`);

    // The wallet connects, detects chain 100, sets the view address, and triggers
    // the RPC scan. Wait for the question title to appear in the asked list.
    const titleLocator = page.locator('#asked-list .q-item-title', { hasText: fixtures.title });
    await expect(titleLocator).toBeVisible({ timeout: 60000 });

    // Verify the title is the resolved form, not raw ␟-encoded data.
    // The raw form would contain the ␟ separator character (U+241F).
    const titleText = await titleLocator.textContent();
    expect(titleText).toBe(fixtures.title);
    expect(titleText).not.toContain('␟');

    // The [account-template] error log fires when template resolution throws.
    const templateErrors = consoleErrors.filter(e => e.includes('[account-template]'));
    expect(templateErrors).toHaveLength(0);
  });

  test('uses configured RPC instead of browser wallet when useBrowserRpc is disabled', async ({ page }) => {
    // Pre-set localStorage before any page scripts run: disable browser wallet for reads,
    // point chain 100's RPC directly at Anvil.
    await page.addInitScript(`
      (function() {
        localStorage.setItem('reality.useBrowserRpc', 'false');
        localStorage.setItem('reality.rpcUrl.100', ${JSON.stringify(ANVIL_URL)});
      })();
    `);

    // Standard wallet mock provides eth_accounts / eth_chainId for wallet detection.
    await page.addInitScript(walletMockScript());

    // Override the wallet's eth_getLogs and eth_call to throw — if account.js
    // routes reads through the browser wallet despite useBrowserRpc=false, the
    // scan will fail and no question will appear.
    await page.addInitScript(`
      (function() {
        const origRequest = window.ethereum.request.bind(window.ethereum);
        window.ethereum.request = async function({ method, params = [] }) {
          if (method === 'eth_getLogs' || method === 'eth_call') {
            throw new Error('Browser wallet must not be used for reads when useBrowserRpc is false');
          }
          return origRequest({ method, params });
        };
      })();
    `);

    // Ponder returns 500 → page falls back to RPC scan.
    await page.route('**/graphql**', route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    );

    await page.goto(`${WEBSITE_URL}/index.html#!/account`);

    // The configured RPC (ANVIL_URL) is used for the scan; the question should appear.
    const titleLocator = page.locator('#asked-list .q-item-title', { hasText: fixtures.title });
    await expect(titleLocator).toBeVisible({ timeout: 60000 });
  });
});
