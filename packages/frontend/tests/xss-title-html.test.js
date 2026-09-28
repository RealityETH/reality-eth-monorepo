import { test, expect } from '@playwright/test';
import { ANVIL_URL } from './setup/anvil.js';
import { walletMockScript } from './setup/wallet-mock.js';
import { CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// Stored-XSS regression guard. A question's JSON is fully attacker-controlled on-chain.
// title_html is a DERIVED, sanitized field the library is meant to PRODUCE — it must never be
// accepted from the input JSON. If it were, a crafted question could smuggle raw HTML straight
// to the title sink (question.js: titleEl.innerHTML = data.qjson.title_html) and run arbitrary
// JS in the reality.eth origin for anyone whose feed includes the entry.
//
// The payload uses `/` as attribute separators because parseQuestionJSON strips spaces
// (data.replace(/ /g,'')) — a space-separated <img> would be neutralised incidentally, so the
// realistic payload (and this test) must survive that.
const QUESTION_ID = '0x' + '77'.repeat(32);
const BOOL_TEMPLATE = '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}';
const PAYLOAD = '<img/src=x/onerror="window.__xss=true">';

function ponderData() {
  return {
    question: {
      templateId: '0', data: 'reviewme', title: 'reviewme', type: 'bool',
      category: null, lang: null, outcomes: null,
      // Attacker smuggles title_html directly into the on-chain question JSON.
      questionJson: JSON.stringify({ title: 'reviewme', type: 'bool', title_html: PAYLOAD }),
      creator: '0x0000000000000000000000000000000000000000',
      arbitrator: '0x0000000000000000000000000000000000000000',
      openingTimestamp: '0', timeout: '86400',
      currentAnswer: null, currentAnswerBond: '0', historyHash: '0x' + '00'.repeat(32),
      minBond: '0', bounty: '0', scheduledFinalizationTimestamp: '0',
      isPendingArbitration: false, arbitrationOccurred: false,
      createdBlock: null, createdLogIndex: null, createdTxHash: null, createdTimestamp: null,
      reopensQuestionId: null,
    },
    responses: { items: [] },
    claims: { items: [] },
    reopeners: { items: [] },
  };
}

test('injected title_html in a question is not rendered as HTML (stored XSS guard)', async ({ page }) => {
  await page.addInitScript(walletMockScript()); // chain 100, reads → anvil
  await page.addInitScript(`try { localStorage.setItem('reality.rpcUrl.100', ${JSON.stringify(ANVIL_URL)}); } catch (e) {}`);
  await page.route('**/graphql**', (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    if ((body.query || '').includes('template(id:')) {
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: { template: { questionText: BOOL_TEMPLATE } } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: ponderData() }) });
  });

  await page.goto(`${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${QUESTION_ID}`);

  // Title renders as text, not HTML.
  const titleEl = page.locator('#question-title');
  await expect(titleEl).toHaveText('reviewme', { timeout: 30000 });

  // The payload must not have been injected as markup, and its onerror must never fire.
  expect(await titleEl.locator('img').count()).toBe(0);
  expect(await page.evaluate(() => window.__xss)).toBeFalsy();
});
