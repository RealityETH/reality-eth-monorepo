import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { walletMockScript } from './setup/wallet-mock.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_32_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.2.abi.json');

const ASK_URL = `${WEBSITE_URL}/index.html#!/ask`;

// Navigate to the ask page and wait until the arbitrator select is populated
// (a proxy for the contract/chain setup being complete).
async function loadAskPage(page) {
  await page.addInitScript(walletMockScript());
  await page.route('**/graphql**', route =>
    route.fulfill({ status: 500, body: 'Internal Server Error' })
  );
  await page.goto(ASK_URL);
  // Arbitrator select is populated by applyTokenVersion — wait for it.
  await page.waitForFunction(
    () => document.getElementById('question-arbitrator')?.options.length > 0,
    { timeout: 15000 }
  );
}

test.describe('ask page: template field visibility', () => {
  test('v3.0 (default on Gnosis) shows category dropdown, hides description textarea', async ({ page }) => {
    await loadAskPage(page);

    await expect(page.locator('#ask-form #field-category')).toBeVisible();
    await expect(page.locator('#ask-form #field-description')).toBeHidden();
  });

  test('switching to v3.2 shows description textarea, hides category dropdown', async ({ page }) => {
    await loadAskPage(page);

    await page.locator('#ask-version-select').selectOption('RealityETH-3.2');

    await expect(page.locator('#ask-form #field-description')).toBeVisible();
    await expect(page.locator('#ask-form #field-category')).toBeHidden();
  });

  test('switching back to v3.0 after v3.2 restores category, hides description', async ({ page }) => {
    await loadAskPage(page);

    await page.locator('#ask-version-select').selectOption('RealityETH-3.2');
    await expect(page.locator('#ask-form #field-description')).toBeVisible();

    await page.locator('#ask-version-select').selectOption('RealityETH-3.0');
    await expect(page.locator('#ask-form #field-category')).toBeVisible();
    await expect(page.locator('#ask-form #question-category')).toBeVisible();
    await expect(page.locator('#ask-form #field-description')).toBeHidden();
  });
});

// The minimum-bond field is only supported on v3.0+ contracts (askQuestionWithMinBond).
// The ask page enables/disables it via the version feature check; if that regresses,
// users on v2.1 could enter a min bond that the contract can't honour, or users on
// v3.0+ could be blocked from setting one.
// The version dropdown is ordered by a priority list, keyed on the version number
// extracted from each version key. On Gnosis the XDAI contracts are 2.1/3.0/3.2 and
// should list as 3.0, 3.2, 2.1 (3.0 preferred, legacy 2.1 last).
test.describe('ask page: version select ordering', () => {
  test('versions are listed in priority order (3.0, 3.2, 2.1)', async ({ page }) => {
    await loadAskPage(page);
    const values = await page.locator('#ask-version-select option')
      .evaluateAll(opts => opts.map(o => o.value));
    expect(values).toEqual(['RealityETH-3.0', 'RealityETH-3.2', 'RealityETH-2.1']);
  });
});

test.describe('ask page: min-bond field gating', () => {
  test('v3.0 (default on Gnosis) enables the minimum-bond field', async ({ page }) => {
    await loadAskPage(page);
    await expect(page.locator('#question-minbond')).toBeEnabled();
  });

  test('switching to v2.1 disables the minimum-bond field', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#ask-version-select').selectOption('RealityETH-2.1');
    await expect(page.locator('#question-minbond')).toBeDisabled();
  });

  test('switching back to v3.0 re-enables the minimum-bond field', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#ask-version-select').selectOption('RealityETH-2.1');
    await expect(page.locator('#question-minbond')).toBeDisabled();
    await page.locator('#ask-version-select').selectOption('RealityETH-3.0');
    await expect(page.locator('#question-minbond')).toBeEnabled();
  });
});

test.describe('ask page: answer options UI', () => {
  test('switching to single-select shows answer options section', async ({ page }) => {
    await loadAskPage(page);
    await expect(page.locator('#answer-options')).toBeHidden();

    await page.locator('#question-type').selectOption('single-select');
    await expect(page.locator('#answer-options')).toBeVisible();
  });

  test('Add another option button appends a new row', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#question-type').selectOption('single-select');

    const rows = page.locator('#answer-options .answer-option-row');
    await expect(rows).toHaveCount(2);

    await page.locator('#answer-options .add-option-btn').click();
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(2).locator('input')).toHaveAttribute('placeholder', 'Option C');
  });

  test('X button on third row removes it; X buttons on two-row minimum are disabled', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#question-type').selectOption('single-select');

    // Initial two rows: X buttons disabled (can't go below minimum)
    const removeButtons = page.locator('#answer-options .remove-option');
    await expect(removeButtons.nth(0)).toBeDisabled();
    await expect(removeButtons.nth(1)).toBeDisabled();

    // Add a third row — its X button must be enabled
    await page.locator('#answer-options .add-option-btn').click();
    const rows = page.locator('#answer-options .answer-option-row');
    await expect(rows).toHaveCount(3);
    const thirdRemove = rows.nth(2).locator('.remove-option');
    await expect(thirdRemove).toBeEnabled();

    // Click it — back to two rows
    await thirdRemove.click();
    await expect(rows).toHaveCount(2);
  });
});

test.describe('ask page: v3.2 description validation and submission', () => {
  let snap;

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  test('submitting without description is allowed (description is optional)', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#ask-version-select').selectOption('RealityETH-3.2');

    await page.locator('#question-body').fill('Will this test pass?');
    // Leave description empty
    await page.locator('#question-arbitrator').selectOption('self');
    await page.locator('#ask-submit-btn').click();

    await expect(page.locator('#ask-form #field-description')).not.toHaveClass(/is-error/);
  });

  test('v3.2 submission encodes description in the question text', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#ask-version-select').selectOption('RealityETH-3.2');

    const title = 'Will this test pass?';
    const description = 'A test question for automated testing';
    const DELIMITER = '␟'; // U+241F

    await page.locator('#question-body').fill(title);
    await page.locator('#question-description').fill(description);
    await page.locator('#question-arbitrator').selectOption('self');

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

    await page.locator('#ask-submit-btn').click();

    const tx = await txPromise;
    const iface = new ethers.Interface(REALITY_ETH_32_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value ?? '0x0' });

    expect(decoded.name).toMatch(/^askQuestion/);

    const questionText = decoded.args.question;
    const parts = questionText.split(DELIMITER);
    expect(parts[0]).toBe(title);
    expect(parts[1]).toBe(description);
    expect(questionText).not.toContain('Select category');
    expect(questionText).not.toContain('arts');
  });
});
