import { test, expect } from '@playwright/test';
import { walletMockScript } from './setup/wallet-mock.js';
import { CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// The arbitration fee is a live eth_call the indexer can't provide. When it fails we must
// distinguish "the arbitrator doesn't implement it" (a revert — CALL_EXCEPTION/BAD_DATA)
// from "the RPC node is unreachable" (anything else) and only flag the RPC indicator for
// the latter. These tests drive both by serving the question from the indexer and forcing
// the fee read through the public readProvider (wallet parked on a different chain).
const QUESTION_ID = '0x' + '22'.repeat(32);
const ARB = '0x000000000000000000000000000000000000dEaD'; // no code → getDisputeFee returns BAD_DATA
const BOOL_TEMPLATE = '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}';

function ponderData(arbitrator) {
  return {
    question: {
      templateId: '0', data: 'Arb fee RPC test', title: 'Arb fee RPC test', type: 'bool',
      category: null, lang: null, outcomes: null,
      questionJson: JSON.stringify({ title: 'Arb fee RPC test', type: 'bool' }),
      creator: '0x0000000000000000000000000000000000000000',
      arbitrator,
      openingTimestamp: '0', timeout: '86400',
      currentAnswer: '0x' + '0'.repeat(63) + '1', currentAnswerBond: '1000000000000000',
      historyHash: '0x' + 'cd'.repeat(32),
      minBond: '0', bounty: '0',
      scheduledFinalizationTimestamp: '4102444800', // year 2100 → answered but not finalized
      isPendingArbitration: false, arbitrationOccurred: false,
      createdBlock: null, createdLogIndex: null, createdTxHash: null, createdTimestamp: null,
      reopensQuestionId: null,
    },
    responses: { items: [] },
    claims: { items: [] },
    reopeners: { items: [] },
  };
}

async function loadArbQuestion(page, { deadRpc }) {
  // Wallet parked on chain 1 (not the question's chain 100) so reads use the public
  // readProvider rather than the wallet — lets us control the read RPC's health directly.
  await page.addInitScript(walletMockScript({ chainId: '0x1' }));
  if (deadRpc) {
    await page.addInitScript(`try { localStorage.setItem('reality.rpcUrl.100', 'http://127.0.0.1:1'); } catch (e) {}`);
  }
  await page.route('**/graphql**', (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    if ((body.query || '').includes('template(id:')) {
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: { template: { questionText: BOOL_TEMPLATE } } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: ponderData(ARB) }) });
  });
  await page.goto(`${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${QUESTION_ID}`);
  await page.waitForSelector('#arb-btn', { timeout: 30000 });
}

test.describe('arbitration fee: RPC-down vs unsupported-arbitrator', () => {
  test('unsupported arbitrator on a healthy RPC → no RPC flag', async ({ page }) => {
    await loadArbQuestion(page, { deadRpc: false });
    // getDisputeFee reverts (BAD_DATA) on a reachable node → arbitrator problem, not RPC.
    await expect(page.locator('#arb-btn')).toContainText('arbitrator may not be responding', { timeout: 30000 });
    await expect(page.locator('#ind-rpc')).not.toHaveClass(/offline/);
  });

  test('unreachable RPC → RPC flag + network message', async ({ page }) => {
    await loadArbQuestion(page, { deadRpc: true });
    await expect(page.locator('#arb-btn')).toContainText('network/RPC error', { timeout: 30000 });
    await expect(page.locator('#ind-rpc')).toHaveClass(/offline/);
  });
});
