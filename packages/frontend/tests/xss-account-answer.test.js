import { test, expect } from '@playwright/test';
import { WEBSITE_URL } from './setup/website-server.js';

// Stored-XSS regression guard for the account page. For select-type questions, the answer
// label is the attacker-controlled OUTCOME string (via getAnswerString). The "asked" list
// rendered it into innerHTML; it must be HTML-escaped.
const TEST_ADDRESS = '0x68154ea682f95bf582b80dd6453fa401737491dc';
const PAYLOAD = '<img/src=x/onerror="window.__xss=true">';

test('malicious select-answer outcome is escaped on the account page (asked list)', async ({ page }) => {
  const nowSec = Math.floor(Date.now() / 1000);
  const maliciousQ = {
    id: '0xe78996a233895be74a66f451f1019ca9734205cc-0x' + '11'.repeat(32),
    chainId: 100,
    creator: TEST_ADDRESS,
    title: 'Pick one',
    type: 'single-select',
    category: null, lang: null,
    currentAnswer: '0x' + '0'.repeat(63) + '1',   // index 1 → the malicious outcome
    currentAnswerBond: '1000000000000000',
    bounty: '0',
    answerFinalizedTimestamp: String(nowSec - 3600),  // in the past → finalized
    isPendingArbitration: false,
    questionJson: JSON.stringify({
      title: 'Pick one', type: 'single-select', outcomes: ['Safe', PAYLOAD],
    }),
    createdTimestamp: String(nowSec - 7200),
  };

  // Each account query reads its own field from this merged response.
  await page.route('**/graphql**', route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: {
        questions: { items: [maliciousQ], pageInfo: { hasNextPage: false } },
        responses: { items: [] },
        claims:    { items: [] },
      } }),
    })
  );

  await page.goto(`${WEBSITE_URL}/index.html#!/account/${TEST_ADDRESS}`);

  // The asked list rendered the question (and its answer pill).
  await expect(page.locator('#asked-list')).toContainText('Pick one', { timeout: 15000 });

  // The outcome must be inert: no <img> injected, onerror never fired, and the payload
  // appears only as escaped text inside the answer pill.
  expect(await page.locator('#asked-list img').count()).toBe(0);
  expect(await page.evaluate(() => window.__xss)).toBeFalsy();
  await expect(page.locator('#asked-list .ans-pill')).toContainText('<img', { timeout: 5000 });
});
