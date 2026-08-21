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

test.describe('ask page: v3.2 description validation and submission', () => {
  let snap;

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  test('submitting without description shows validation error', async ({ page }) => {
    await loadAskPage(page);
    await page.locator('#ask-version-select').selectOption('RealityETH-3.2');

    await page.locator('#question-body').fill('Will this test pass?');
    // Leave description empty
    await page.locator('#question-arbitrator').selectOption('self');
    await page.locator('#ask-submit-btn').click();

    await expect(page.locator('#ask-form #field-description')).toHaveClass(/is-error/);
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
