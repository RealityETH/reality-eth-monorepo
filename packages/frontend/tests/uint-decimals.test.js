import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createUintDecimalsFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

async function loadQuestion(page, questionId) {
  await setupPage(page);
  await page.goto(
    `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${questionId}`
  );
  await page.waitForSelector('.question-state-open', { timeout: 30000 });
}

// Intercept the outgoing sendTransaction call and resolve with its params.
function interceptTx(page) {
  return page.evaluate(() =>
    new Promise(resolve => {
      const orig = window.ethereum.request.bind(window.ethereum);
      window.ethereum.request = async (args) => {
        const result = await orig(args);
        if (args.method === 'eth_sendTransaction') resolve(args.params[0]);
        return result;
      };
    })
  );
}

// The primary regression: when Ponder supplies pre-parsed fields (title, type) the
// page was hardcoding decimals=18 for all uint questions.  A template with
// "decimals": 2 and on-chain answer 350 should display "3.5", not 350 / 10^18.
//
// Also covered: the symmetric encoding direction — the form must use the template's
// declared decimals when encoding a typed value as bytes32 for submitAnswer.
test.describe('uint decimals: answer display from template', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createUintDecimalsFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  // Core regression: decimals=2, on-chain stored value is 350 → must show "3.5".
  // Before the fix this displayed something like "0.00000000000000035" because
  // qjson.decimals was hardcoded to 18 instead of reading the template JSON.
  test('decimals=2: answer 350 displays as "3.5"', async ({ page }) => {
    await loadQuestion(page, fixtures.dec2AnsweredId);
    await expect(page.locator('.answer-banner-value')).toContainText('3.5');
  });

  // Confirm the fix doesn't over-apply: a template with decimals=0 should show
  // the raw integer, not divide by any power of ten.
  test('decimals=0: answer 42 displays as "42"', async ({ page }) => {
    await loadQuestion(page, fixtures.dec0AnsweredId);
    await expect(page.locator('.answer-banner-value')).toContainText('42');
  });
});

// Encoding: when the user types a value and submits, answerToBytes32 must use
// the template's declared decimals (not hardcoded 18).
// If decimals=2 were ignored and 18 used, typing "3.5" would call
// parseUnits("3.5", 18) = 3.5×10^18 instead of parseUnits("3.5", 2) = 350.
test.describe('uint decimals: answer submission encoding', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createUintDecimalsFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  test('decimals=2: typing "3.5" encodes as bytes32(350) = 0x15e', async ({ page }) => {
    await loadQuestion(page, fixtures.dec2OpenId);
    await page.waitForSelector('input[name="questionBond"]', { timeout: 10000 });
    const txPromise = interceptTx(page);

    await page.locator('input.uint-input').fill('3.5');
    await page.locator('button.post-answer-button').click();

    const tx = await txPromise;
    const iface = new ethers.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });

    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.dec2OpenId);
    expect(decoded.args.answer).toBe(
      '0x000000000000000000000000000000000000000000000000000000000000015e'
    );
  });

  test('decimals=0: typing "42" encodes as bytes32(42) = 0x2a', async ({ page }) => {
    await loadQuestion(page, fixtures.dec0OpenId);
    await page.waitForSelector('input[name="questionBond"]', { timeout: 10000 });
    const txPromise = interceptTx(page);

    await page.locator('input.uint-input').fill('42');
    await page.locator('button.post-answer-button').click();

    const tx = await txPromise;
    const iface = new ethers.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });

    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.dec0OpenId);
    expect(decoded.args.answer).toBe(
      '0x000000000000000000000000000000000000000000000000000000000000002a'
    );
  });
});
