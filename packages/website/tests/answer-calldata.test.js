import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerTypeFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

// Intercept eth_sendTransaction AFTER it resolves so afterEach evm_revert does
// not race with a pending transaction (same pattern as submit-answer.test.js).
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

// The single-select and multiple-select answer types use different code paths to
// encode the user's choice as a bytes32.  For single-select, index 0 ("Cat")
// encodes as bytes32(0) — identical to the NO answer for bool questions; if the
// type is not checked, the wrong encoding would be silently used.  For
// multiple-select, the bitmask aggregation (mask |= 1 << index) must produce the
// correct value.
test.describe('answer calldata: single-select and multiple-select', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createAnswerTypeFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page, questionId) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${questionId}`
    );
    await page.waitForSelector('input[name="questionBond"]', { timeout: 30000 });
  }

  test('single-select: selecting Cat (index 0) encodes as bytes32(0)', async ({ page }) => {
    await loadQuestion(page, fixtures.singleSelectId);
    const txPromise = interceptTx(page);

    // Cat is index 0 — the same bit pattern as NO for bool; must not be confused
    await page.locator('select[name="input-answer"]').selectOption('0');
    await page.locator('button.post-answer-button').click();

    const tx = await txPromise;
    const iface = new ethers.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });

    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.singleSelectId);
    expect(decoded.args.answer).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  test('single-select: selecting Dog (index 1) encodes as bytes32(1)', async ({ page }) => {
    await loadQuestion(page, fixtures.singleSelectId);
    const txPromise = interceptTx(page);

    await page.locator('select[name="input-answer"]').selectOption('1');
    await page.locator('button.post-answer-button').click();

    const tx = await txPromise;
    const iface = new ethers.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });

    expect(decoded.args.answer).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000001'
    );
  });

  test('multiple-select: Cat (bit 0) + Fish (bit 2) encodes as bytes32(5)', async ({ page }) => {
    await loadQuestion(page, fixtures.multipleSelectId);
    const txPromise = interceptTx(page);

    // Cat = bit 0, Dog = bit 1, Fish = bit 2 → mask = 0b101 = 5
    await page.check('input[type="checkbox"][name="input-answer"][value="0"]');
    await page.check('input[type="checkbox"][name="input-answer"][value="2"]');
    await page.locator('button.post-answer-button').click();

    const tx = await txPromise;
    const iface = new ethers.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });

    expect(decoded.name).toBe('submitAnswer');
    expect(decoded.args.question_id).toBe(fixtures.multipleSelectId);
    expect(decoded.args.answer).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000005'
    );
  });

  test('multiple-select: only Dog (bit 1) encodes as bytes32(2)', async ({ page }) => {
    await loadQuestion(page, fixtures.multipleSelectId);
    const txPromise = interceptTx(page);

    // Dog alone = bit 1 = 2
    await page.check('input[type="checkbox"][name="input-answer"][value="1"]');
    await page.locator('button.post-answer-button').click();

    const tx = await txPromise;
    const iface = new ethers.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });

    expect(decoded.args.answer).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000002'
    );
  });
});
