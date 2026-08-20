import { test, expect } from '@playwright/test';
import { snapshot, revert, FORK_BLOCK } from './setup/anvil.js';
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
});
