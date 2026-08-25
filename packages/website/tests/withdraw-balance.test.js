import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL, TEST_ACCOUNT } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createClaimedYesFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// createClaimedYesFixtures calls claimWinnings (NOT claimMultipleAndWithdrawBalance),
// so the winnings land in balanceOf[TEST_ACCOUNT] on the reality.eth contract rather
// than being sent directly.  The withdraw button should appear for the connected wallet.

const ACCOUNT_URL = `${WEBSITE_URL}/index.html#!/account/${TEST_ACCOUNT.address}`;

test.describe('withdraw balance button', () => {
  let snap;

  test.beforeAll(async () => {
    await createClaimedYesFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  test('shows withdraw button when balanceOf is non-zero', async ({ page }) => {
    await setupPage(page);
    await page.goto(ACCOUNT_URL);
    await page.waitForSelector('.btn-withdraw', { state: 'visible', timeout: 30000 });
    await expect(page.locator('.btn-withdraw')).toHaveText(/^Withdraw \d/);
  });

  test('withdraw button completes and disappears', async ({ page }) => {
    await setupPage(page);
    await page.goto(ACCOUNT_URL);
    await page.waitForSelector('.btn-withdraw', { state: 'visible', timeout: 30000 });

    const provider = new ethers.JsonRpcProvider(ANVIL_URL);
    const balanceBefore = await provider.getBalance(TEST_ACCOUNT.address);

    await page.locator('.btn-withdraw').click();

    // Button goes through pending states then disappears
    await page.waitForSelector('.btn-withdraw', { state: 'detached', timeout: 30000 });

    const balanceAfter = await provider.getBalance(TEST_ACCOUNT.address);
    expect(balanceAfter > balanceBefore).toBe(true);
  });
});
