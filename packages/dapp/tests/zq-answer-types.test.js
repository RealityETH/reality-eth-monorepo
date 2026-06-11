import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createAnswerTypeFixtures, CONTRACTS } from './setup/fixtures.js';
import { QUESTION_URL } from './setup/question-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

const INVALID  = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const TOO_SOON = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
const BOND = '0.001';

test.describe('q: answer types', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => { fixtures = await createAnswerTypeFixtures(); });
  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page, questionId) {
    await setupPage(page);
    await page.goto(`${QUESTION_URL}/question.html?contract=${CONTRACTS.realityEth30}&question=${questionId}&network=100`);
    await page.waitForFunction(
      () => document.getElementById('question-page')?.classList.contains('question-state-open'),
      {}, { timeout: 30000 }
    );
  }

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

  function decodeAnswer(tx) {
    const iface = new ethers.utils.Interface(REALITY_ETH_ABI);
    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
    expect(decoded.name).toBe('submitAnswer');
    return decoded.args.answer;
  }

  async function submitWith(page, locatorFn) {
    const win = page.locator('#question-page');
    const txPromise = interceptSendTx(page);
    await locatorFn(win);
    await win.locator('input[name="questionBond"]').fill(BOND);
    await win.locator('button.post-answer-button').click();
    return decodeAnswer(await txPromise);
  }

  test('single-select: option index is encoded directly', async ({ page }) => {
    await loadQuestion(page, fixtures.singleSelectId);
    const answer = await submitWith(page, async (win) => {
      await win.locator('select[name="input-answer"]').selectOption('1');
    });
    expect(answer).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
  });

  test('multiple-select: checked options produce correct bitmask', async ({ page }) => {
    await loadQuestion(page, fixtures.multipleSelectId);
    const answer = await submitWith(page, async (win) => {
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
    const expected = ethers.utils.hexZeroPad(ethers.utils.parseEther('42').toHexString(), 32);
    expect(answer).toBe(expected);
  });

  test('datetime: date string is converted to unix timestamp', async ({ page }) => {
    await loadQuestion(page, fixtures.datetimeId);
    const txPromise = interceptSendTx(page);
    await page.evaluate(() => {
      const qp = document.getElementById('question-page');
      qp.querySelector('input.datetime-input-date').value = '2026-01-01';
      qp.querySelector('input[name="questionBond"]').value = '0.001';
      qp.querySelector('button.post-answer-button').dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      );
    });
    const answer = decodeAnswer(await txPromise);
    const ts = Math.floor(new Date('2026-01-01').getTime() / 1000);
    const expected = ethers.utils.hexZeroPad(ethers.BigNumber.from(ts).toHexString(), 32);
    expect(answer).toBe(expected);
  });

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
