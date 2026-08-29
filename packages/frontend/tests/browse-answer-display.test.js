/**
 * browse-answer-display.test.js
 *
 * Regression tests for answer display in browse cards.
 *
 * Root cause: formatAnswer() in index.html calls
 *   parseQuestionJSON(q.data)
 * where q.data is the raw question string (e.g. "Will this happen?"),
 * NOT the full template-populated JSON.  parseQuestionJSON fails to parse
 * it and returns { type: 'broken-question' }, so getAnswerString() falls
 * through the type switch and returns '' for every type except Invalid
 * (which is detected before the switch via the 0xff…ff sentinel).
 *
 * Fix (Option A): store the computed questionJson in the indexer and call
 *   parseQuestionJSON(q.questionJson)
 * instead.
 *
 * These tests will FAIL until that fix is applied.
 */

import { test, expect } from '@playwright/test';
import { WEBSITE_URL } from './setup/website-server.js';

const BOOL_YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
const BOOL_NO  = '0x0000000000000000000000000000000000000000000000000000000000000000';
// bytes32(350): answer that should display as '3.5' with decimals=2
const UINT_350 = '0x000000000000000000000000000000000000000000000000000000000000015e';

const CONTRACT = '0xe78996a233895be74a66f451f1019ca9734205cc';
const CHAIN_ID = 100;

function makeQuestion(overrides = {}) {
  const q = {
    id:                             `${CONTRACT}-0x000000000000000000000000000000000000000000000000000000000000abcd`,
    title:                          'Will this test pass?',
    data:                           'Will this test pass?',
    type:                           'bool',
    category:                       'misc',
    chainId:                        CHAIN_ID,
    contract:                       CONTRACT,
    creator:                        '0x0000000000000000000000000000000000000001',
    templateId:                     '0',
    currentAnswer:                  BOOL_YES,
    currentAnswerBond:              '1000000000000000000',
    isPendingArbitration:           false,
    answerFinalizedTimestamp:       '0',
    scheduledFinalizationTimestamp: '9999999999',
    openingTimestamp:               '0',
    updatedTimestamp:               '0',
    createdTimestamp:               '0',
    lastBond:                       '1000000000000000000',
    minBond:                        '0',
    bounty:                         '1000000000000000000',
    timeout:                        '86400',
    arbitrator:                     '0x0000000000000000000000000000000000000000',
    outcomes:                       null,
    ...overrides,
  };
  // Simulate what the indexer now stores: the full pre-computed JSON.
  // Callers that need specific fields (e.g. decimals for uint) pass questionJson explicitly.
  if (!('questionJson' in q)) {
    q.questionJson = JSON.stringify({
      title:       q.title,
      type:        q.type,
      has_invalid: true,
      category:    q.category,
      lang:        'en_US',
    });
  }
  return q;
}

async function loadBrowsePage(page, questions) {
  // Clear the browse cache so stale localStorage data doesn't mask the bug.
  await page.addInitScript(() => localStorage.removeItem('reality-eth-browse-q'));

  await page.route('**/graphql**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        questions: {
          items: questions,
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    }),
  }));

  await page.goto(`${WEBSITE_URL}/index.html#/browse`);
  await page.waitForSelector('.q-card', { timeout: 10000 });
}

test.describe('browse card answer display', () => {
  test('bool: Yes answer is shown, not blank', async ({ page }) => {
    await loadBrowsePage(page, [makeQuestion({ currentAnswer: BOOL_YES })]);
    // Before fix: formatAnswer returns null (parseQuestionJSON of raw string fails)
    // → no .answer-val element rendered at all.
    await expect(page.locator('.q-answer-side .answer-val')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.q-answer-side .answer-val')).toContainText('Yes');
  });

  test('bool: No answer is shown, not blank', async ({ page }) => {
    await loadBrowsePage(page, [makeQuestion({ currentAnswer: BOOL_NO })]);
    await expect(page.locator('.q-answer-side .answer-val')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.q-answer-side .answer-val')).toContainText('No');
  });

  test('uint with decimals: answer is shown as decimal, not blank', async ({ page }) => {
    // questionJson is what the indexer will supply after the Option A fix.
    // Before the fix it is ignored; after the fix it drives formatAnswer.
    const questionJson = JSON.stringify({
      title: 'What is the price?',
      type: 'uint',
      decimals: 2,
      category: 'misc',
      lang: 'en_US',
      format: 'text/plain',
    });
    await loadBrowsePage(page, [makeQuestion({
      title:         'What is the price?',
      data:          'What is the price?',
      type:          'uint',
      currentAnswer: UINT_350,
      // After the fix, formatAnswer reads this field.
      // Before the fix it reads q.data instead, which is not valid JSON.
      questionJson,
    })]);
    // Before fix: parseQuestionJSON('What is the price?') → broken →
    //   getAnswerString returns '' → formatAnswer returns null → no .answer-val.
    // After fix: parseQuestionJSON(questionJson) → {type:'uint', decimals:2} →
    //   getAnswerString returns '3.5' → shown.
    await expect(page.locator('.q-answer-side .answer-val')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.q-answer-side .answer-val')).toContainText('3.5');
  });

  test('Invalid answer is still shown (sentinel check must survive the fix)', async ({ page }) => {
    const INVALID = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    await loadBrowsePage(page, [makeQuestion({ currentAnswer: INVALID })]);
    // Invalid is detected before the type switch in getAnswerString, so it
    // works even with the broken qjson — this test ensures the fix doesn't
    // break the one thing that was already working.
    await expect(page.locator('.q-answer-side .answer-val')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.q-answer-side .answer-val')).toContainText('Invalid');
  });
});
