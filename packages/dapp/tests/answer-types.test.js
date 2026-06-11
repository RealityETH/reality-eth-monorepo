import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerTypeFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

const INVALID    = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const TOO_SOON   = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
const BOND       = '0.001';

test.describe('answer types', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createAnswerTypeFixtures();
  });

  test.beforeEach(async () => {
    snap = await snapshot();
  });

  test.afterEach(async () => {
    await revert(snap);
    snap = await snapshot();
  });

  // Navigate to a question and wait until its answer form is ready.
  async function loadQuestion(page, questionId) {
    await setupPage(page);
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${questionId}`
    );
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-open');
    }, {}, { timeout: 30000 });
  }

  // Intercept the eth_sendTransaction call and return the tx params AFTER the tx
  // mines (so evm_revert in afterEach cannot race the pending request).
  function interceptSendTx(page) {
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

  // Decode the `submitAnswer` call from raw tx params and return the answer arg.
  function decodeAnswer(tx) {
    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('submitAnswer');
    return decoded.args.answer;
  }

  async function submitWith(page, locatorFn) {
    const win = page.locator('.rcbrowser--qa-detail:not(.template-item)');
    const txPromise = interceptSendTx(page);
    await locatorFn(win);
    await win.locator('input[name="questionBond"]').fill(BOND);
    await win.locator('input.post-answer-button').click();
    return decodeAnswer(await txPromise);
  }

  // -------------------------------------------------------------------------
  // Question type encoding
  // -------------------------------------------------------------------------

  test('single-select: option index is encoded directly', async ({ page }) => {
    await loadQuestion(page, fixtures.singleSelectId);
    const answer = await submitWith(page, async (win) => {
      // Select "Dog" (index 1) from the dropdown
      await win.locator('select[name="input-answer"]').selectOption('1');
    });
    expect(answer).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
  });

  test('multiple-select: checked options produce correct bitmask', async ({ page }) => {
    await loadQuestion(page, fixtures.multipleSelectId);
    const answer = await submitWith(page, async (win) => {
      // Check "Cat" (value 0) and "Fish" (value 2) → bitmask 0b101 = 5
      await win.locator('input[name="input-answer"][value="0"]').check();
      await win.locator('input[name="input-answer"][value="2"]').check();
    });
    expect(answer).toBe('0x0000000000000000000000000000000000000000000000000000000000000005');
  });

  test('uint: numeric input is scaled by template decimals', async ({ page }) => {
    await loadQuestion(page, fixtures.uintId);
    const answer = await submitWith(page, async (win) => {
      await win.locator('input[name="input-answer"]').fill('42');
    });
    // Template 1 has decimals: 18, so "42" → 42 × 10^18
    const expected = ethers.utils.hexZeroPad(ethers.utils.parseEther('42').toHexString(), 32);
    expect(answer).toBe(expected);
  });

  test('datetime: date string is converted to unix timestamp', async ({ page }) => {
    await loadQuestion(page, fixtures.datetimeId);

    // The jQuery UI datepicker is attached to the date input. Playwright's
    // locator-based fill() opens the calendar popup and its focus/blur lifecycle
    // interferes with the submit handler.  Set values via plain DOM to avoid it.
    const txPromise = interceptSendTx(page);
    await page.evaluate(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      win.querySelector('input.datetime-input-date').value = '2026-01-01';
      win.querySelector('input[name="questionBond"]').value = '0.001';
      win.querySelector('input.post-answer-button').dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      );
    });
    const answer = decodeAnswer(await txPromise);

    // ISO date-only strings are UTC midnight per spec.
    const ts = Math.floor(new Date('2026-01-01').getTime() / 1000);
    const expected = ethers.utils.hexZeroPad(ethers.BigNumber.from(ts).toHexString(), 32);
    expect(answer).toBe(expected);
  });

  // -------------------------------------------------------------------------
  // Invalid / answered-too-soon — tested across both UI mechanisms:
  //
  //   Select-type questions (bool, single-select): special values appear as
  //   <option> entries in the dropdown.
  //
  //   Non-select types (uint, int, datetime, multiple-select): a link below
  //   the input toggles a data-attribute that the form handler reads.
  // -------------------------------------------------------------------------

  test('bool: selecting Invalid option sends 0xffff...', async ({ page }) => {
    await loadQuestion(page, fixtures.boolId);
    const answer = await submitWith(page, async (win) => {
      await win.locator('select[name="input-answer"]').selectOption(INVALID);
    });
    expect(answer).toBe(INVALID);
  });

  test('bool: selecting Answered Too Soon option sends 0xfffe...', async ({ page }) => {
    await loadQuestion(page, fixtures.boolId);
    const answer = await submitWith(page, async (win) => {
      await win.locator('select[name="input-answer"]').selectOption(TOO_SOON);
    });
    expect(answer).toBe(TOO_SOON);
  });

  test('uint: clicking invalid link sends 0xffff...', async ({ page }) => {
    await loadQuestion(page, fixtures.uintId);
    const answer = await submitWith(page, async (win) => {
      await win.locator('.invalid-switch-container a.invalid-text-link').click();
    });
    expect(answer).toBe(INVALID);
  });

  test('uint: clicking too-soon link sends 0xfffe...', async ({ page }) => {
    await loadQuestion(page, fixtures.uintId);
    const answer = await submitWith(page, async (win) => {
      await win.locator('.too-soon-switch-container a.too-soon-text-link').click();
    });
    expect(answer).toBe(TOO_SOON);
  });
});
