import { test, expect } from '@playwright/test';
import { walletMockScript } from './setup/wallet-mock.js';
import { CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// The contract info page derives its feature list from the contract version, comparing
// a numeric version (parsed from the version key) against each feature's threshold.
// If the version extraction regresses, the wrong features are listed for a contract.
async function loadContract(page, address) {
  await page.addInitScript(walletMockScript());
  await page.goto(`${WEBSITE_URL}/index.html#!/network/100/contract/${address}`);
  await page.waitForSelector('#cv-content', { state: 'visible', timeout: 30000 });
}

test.describe('contract view: version feature list', () => {
  test('v3.2 lists template hash verification (a v3.2-only feature)', async ({ page }) => {
    await loadContract(page, CONTRACTS.realityEth32);
    const features = page.locator('.feature-list');
    await expect(features).toContainText('Template hash verification');
    await expect(features).toContainText('Minimum bond enforcement');
  });

  test('v3.0 lists min-bond but not the v3.2 template hash feature', async ({ page }) => {
    await loadContract(page, CONTRACTS.realityEth30);
    const features = page.locator('.feature-list');
    await expect(features).toContainText('Minimum bond enforcement');
    await expect(features).not.toContainText('Template hash verification');
  });

  test('v2.1 shows the basic (no min-bond) note instead of a feature list', async ({ page }) => {
    await loadContract(page, CONTRACTS.realityEth21);
    await expect(page.locator('.feature-list')).toHaveCount(0);
    await expect(page.getByText('Basic reality.eth')).toBeVisible();
  });
});
