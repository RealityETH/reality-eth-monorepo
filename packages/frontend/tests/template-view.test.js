import { test, expect } from '@playwright/test';
import { walletMockScript } from './setup/wallet-mock.js';
import { WEBSITE_URL } from './setup/website-server.js';

// The template page's version dropdown is ordered by the same priority list as the ask
// page, keyed on the version number extracted from each version key. On Gnosis the XDAI
// contracts (2.1/3.0/3.2) should list as 3.0, 3.2, 2.1.
test.describe('template page: version select ordering', () => {
  test('versions are listed in priority order (3.0, 3.2, 2.1)', async ({ page }) => {
    await page.addInitScript(walletMockScript());
    await page.route('**/graphql**', route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    );
    await page.goto(`${WEBSITE_URL}/index.html#!/template`);
    await page.waitForFunction(
      () => document.querySelectorAll('#tc-version-select option').length > 0,
      { timeout: 15000 }
    );
    const values = await page.locator('#tc-version-select option')
      .evaluateAll(opts => opts.map(o => o.value));
    expect(values).toEqual(['RealityETH-3.0', 'RealityETH-3.2', 'RealityETH-2.1']);
  });
});
