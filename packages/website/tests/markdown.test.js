import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage, walletMockScript } from './setup/wallet-mock.js';
import { createMarkdownFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// Markdown titles must render as HTML on the question page.  The rendering path
// uses qjson.title_html (set by the lib's bundled marked+DOMPurify) rather than
// re-rendering from window globals.
//
// Two separate code paths lead to qjson:
//   RPC path  — always calls populateTemplate(templateStr, data), so title_html
//               is set correctly.
//   Ponder path — uses pre-parsed Ponder fields (title, type, …) and must also
//               call fetchTemplateStr+populateTemplate to derive format/title_html.
//               A regression here leaves raw ** asterisks visible to users.
test.describe('markdown title rendering', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createMarkdownFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); });

  function questionUrl() {
    return `${WEBSITE_URL}/question.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`;
  }

  async function loadViaRpc(page) {
    await setupPage(page); // graphql → null → triggers RPC fallback
    await page.goto(questionUrl());
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
  }

  async function loadViaPonder(page) {
    await page.addInitScript(walletMockScript());

    // Simulate the Ponder path: question query returns pre-parsed fields; the
    // secondary template query (from fetchTemplateStr) returns the raw template.
    await page.route('**/graphql**', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      if ((body.query || '').includes('template(id:')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { template: { questionText: fixtures.markdownTemplate } } }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            question: {
              templateId:                     String(fixtures.templateId),
              data:                           fixtures.questionText,
              title:                          'Will **bold text** render correctly?',
              type:                           'bool',
              category:                       'misc',
              lang:                           'en_US',
              outcomes:                       null,
              arbitrator:                     '0x0000000000000000000000000000000000000000',
              openingTimestamp:               '0',
              timeout:                        '60',
              currentAnswer:                  null,
              currentAnswerBond:              '0',
              minBond:                        '0',
              bounty:                         '1000000000000000',
              scheduledFinalizationTimestamp: '0',
              isPendingArbitration:           false,
              arbitrationOccurred:            false,
              createdBlock:                   null,
              createdLogIndex:                null,
              createdTxHash:                  null,
              reopensQuestionId:              null,
            },
            responses: { items: [] },
            reopeners: { items: [] },
          },
        }),
      });
    });

    await page.goto(questionUrl());
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
  }

  test('RPC: markdown title gets q-text-md class', async ({ page }) => {
    await loadViaRpc(page);
    await expect(page.locator('#question-title')).toHaveClass(/q-text-md/);
  });

  test('RPC: bold syntax renders as <strong>', async ({ page }) => {
    await loadViaRpc(page);
    await expect(page.locator('#question-title strong')).toBeVisible();
  });

  test('RPC: raw ** asterisks are not present in title', async ({ page }) => {
    await loadViaRpc(page);
    await expect(page.locator('#question-title')).not.toContainText('**');
  });

  test('Ponder: markdown title gets q-text-md class', async ({ page }) => {
    await loadViaPonder(page);
    await expect(page.locator('#question-title')).toHaveClass(/q-text-md/);
  });

  test('Ponder: bold syntax renders as <strong>', async ({ page }) => {
    await loadViaPonder(page);
    await expect(page.locator('#question-title strong')).toBeVisible();
  });

  test('Ponder: raw ** asterisks are not present in title', async ({ page }) => {
    await loadViaPonder(page);
    await expect(page.locator('#question-title')).not.toContainText('**');
  });
});
