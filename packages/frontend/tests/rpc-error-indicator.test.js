import { test, expect } from '@playwright/test';
import { FORK_BLOCK } from './setup/anvil.js';
import { walletMockScript } from './setup/wallet-mock.js';
import { createAnswerTypeFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// A "calls work, logs fail" RPC (walletMockScript failLogs) should light the RPC
// indicator ONLY when the log reads are load-bearing — i.e. when the indexer is down and
// the page is being built from on-chain events. When the indexer is healthy, the only
// getLogs are best-effort (cache-warming), so the indicator must stay clean.
const BOOL_TEMPLATE = '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}';

test.describe('RPC error indicator: load-bearing vs best-effort log failures', () => {
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createAnswerTypeFixtures();
  });

  test('indexer healthy + failing getLogs does NOT flag the RPC indicator', async ({ page }) => {
    await page.addInitScript(walletMockScript({ failLogs: true }));

    // Serve the question from the indexer so the page renders without needing logs.
    // createdBlock is set so the background cache-warming actually attempts a getLogs
    // (which fails) — proving that best-effort failure stays silent.
    const ponderData = {
      question: {
        templateId: '0',
        data: 'Answer-types test: bool',
        title: 'Answer-types test: bool',
        type: 'bool', category: null, lang: null, outcomes: null,
        questionJson: JSON.stringify({ title: 'Answer-types test: bool', type: 'bool' }),
        creator: '0x0000000000000000000000000000000000000000',
        arbitrator: '0x0000000000000000000000000000000000000000',
        openingTimestamp: '0', timeout: '60',
        currentAnswer: null, currentAnswerBond: '0', historyHash: null,
        minBond: '0', bounty: '1000000000000000',
        scheduledFinalizationTimestamp: '0',
        isPendingArbitration: false, arbitrationOccurred: false,
        createdBlock: String(FORK_BLOCK + 1), createdLogIndex: '0',
        createdTxHash: '0x' + '00'.repeat(32), createdTimestamp: '0',
        reopensQuestionId: null,
      },
      responses: { items: [] },
      claims: { items: [] },
      reopeners: { items: [] },
    };

    await page.route('**/graphql**', (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      if ((body.query || '').includes('template(id:')) {
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: { template: { questionText: BOOL_TEMPLATE } } }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: ponderData }) });
    });

    await page.goto(`${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolId}`);
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
    // Wait for background RPC verification (which triggers the failing cache-warm getLogs) to finish.
    await page.waitForSelector('.data-ind-group.verified', { timeout: 30000 });

    await expect(page.locator('#ind-rpc')).not.toHaveClass(/offline/);
  });

  test('indexer down + failing getLogs DOES flag the RPC indicator', async ({ page }) => {
    await page.addInitScript(walletMockScript({ failLogs: true }));
    // Indexer returns no question → page falls back to building from on-chain events,
    // where getLogs is load-bearing. eth_call still works (struct read succeeds).
    await page.route('**/graphql**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: { question: null } }) }));

    await page.goto(`${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolId}`);

    await expect(page.locator('#ind-rpc')).toHaveClass(/offline/, { timeout: 30000 });
  });

  test('indexer down + failing eth_call (logs OK) flags via the fallback struct read', async ({ page }) => {
    // A node that serves getLogs but fails eth_call — the fallback's load-bearing
    // questions() struct read must flag the indicator on its own. Wallet parked off-chain
    // so reads go through the public readProvider (JsonRpcProvider), where a transport
    // failure is distinguishable from a revert.
    await page.addInitScript(walletMockScript({ chainId: '0x1' }));
    await page.route('**/graphql**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: { question: null } }) }));
    // Fail eth_call at the RPC transport; let everything else (incl. eth_getLogs) through.
    await page.route(/127\.0\.0\.1:18545/, async (route) => {
      let body = {};
      try { body = JSON.parse(route.request().postData() || '{}'); } catch {}
      const methods = Array.isArray(body) ? body.map((b) => b.method) : [body.method];
      if (methods.includes('eth_call')) {
        return route.fulfill({ status: 502, contentType: 'text/plain', body: 'bad gateway' });
      }
      return route.continue();
    });

    await page.goto(`${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolId}`);

    await expect(page.locator('#ind-rpc')).toHaveClass(/offline/, { timeout: 30000 });
  });

  test('RPC settings popup shows the error message, not just the icon colour', async ({ page }) => {
    await page.addInitScript(walletMockScript({ failLogs: true }));
    await page.route('**/graphql**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: { question: null } }) }));

    await page.goto(`${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.boolId}`);
    await expect(page.locator('#ind-rpc')).toHaveClass(/offline/, { timeout: 30000 });

    await page.locator('#ind-rpc').click();
    const err = page.locator('.sp-panel .sp-error-msg');
    await expect(err).toBeVisible();
    await expect(err).toContainText('RPC error');
  });
});
