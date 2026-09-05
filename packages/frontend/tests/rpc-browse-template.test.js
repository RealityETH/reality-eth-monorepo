/**
 * rpc-browse-template.test.js
 *
 * Verifies that question titles are correctly resolved from templates on the
 * rpc-browse page, covering all three resolution paths:
 *
 *  1. Builtin template (IDs 0–4) — resolved from the in-memory builtins map,
 *     no network call needed.
 *
 *  2. Bundled custom template — resolved from window.RealityBundledTemplates,
 *     also without an on-chain fetch.
 *
 *  3. On-chain custom template — not in the bundle, so prefetchTemplates() must
 *     call templates(id) then getLogs to retrieve the text from the chain.
 *
 * The tests run against an Anvil fork of chain 100 (Gnosis).  Chain 100's RPC
 * is overridden to point at Anvil via localStorage before the page loads.
 * The website-templates.js asset is intercepted and replaced per-test so the
 * bundle contents are fully controlled.
 */

import { test, expect } from '@playwright/test';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { createRpcBrowseTemplateFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';
import { TEST_ACCOUNT } from './setup/anvil.js';

test.describe('rpc-browse: template resolution', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createRpcBrowseTemplateFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  // Navigates to #!/rpc-browse, selects chain 100, fills the creator filter
  // with the test account address, and clicks Scan.
  // bundleContent is the JS body for website-templates.js — pass null to let
  // the real file load (fine for the builtin test where the bundle is irrelevant).
  async function scanRpcBrowse(page, bundleContent) {
    await page.addInitScript(`
      localStorage.setItem('reality.rpcUrl.100', ${JSON.stringify(ANVIL_URL)});
    `);

    await page.route('**/website-templates.js**', route => route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: bundleContent,
    }));

    await page.goto(`${WEBSITE_URL}/index.html#!/rpc-browse`);
    await page.locator('#rb-chain-pills button', { hasText: 'Gnosis' }).click();
    await page.locator('#rb-creator').fill(TEST_ACCOUNT.address);
    await page.locator('#rb-scan-btn').click();
  }

  // ── Test 1: Builtin template (template ID 0, bool) ───────────────────────────
  // Template 0 is hard-coded in the builtins map; the question text is
  // ␟-separated ("title␟category␟lang").  prefetchTemplates() skips the network
  // and reads the builtin directly.
  test('builtin template: title extracted from ␟-encoded question text', async ({ page }) => {
    // Empty bundle — proves the builtin map alone is sufficient.
    await scanRpcBrowse(page, 'window.RealityBundledTemplates = {};');

    await expect(
      page.locator('.rb-title-link', { hasText: fixtures.builtinTitle })
    ).toBeVisible({ timeout: 30000 });
  });

  // ── Test 2: Custom template resolved from the shipped bundle ────────────────
  // Injects a bundle that includes the fixture's custom template.
  // prefetchTemplates() finds it in window.RealityBundledTemplates and returns
  // the title without making any on-chain getLogs call.
  test('custom template from bundle: title resolved without on-chain fetch', async ({ page }) => {
    const bundle = {
      '100': {
        [CONTRACTS.realityEth30.toLowerCase()]: {
          [String(fixtures.customTemplateId)]: fixtures.customTemplateText,
        },
      },
    };
    await scanRpcBrowse(page, `window.RealityBundledTemplates = ${JSON.stringify(bundle)};`);

    // Track whether the page issued any eth_getLogs for the LogNewTemplate topic.
    const LOG_NEW_TEMPLATE_TOPIC =
      '0x57d2c3e8c8cfc4723e12f887e83dd3a6c2fd5c36f39a3e4b87f3024a33efa8e0';
    let templateLogFetchCount = 0;
    await page.route('**', async route => {
      const body = route.request().postData();
      if (body) {
        try {
          const parsed = JSON.parse(body);
          const rpcBody = Array.isArray(parsed) ? parsed[0] : parsed;
          if (rpcBody?.method === 'eth_getLogs') {
            const topics = rpcBody.params?.[0]?.topics;
            if (Array.isArray(topics) && topics[0] === LOG_NEW_TEMPLATE_TOPIC) {
              templateLogFetchCount++;
            }
          }
        } catch { /* not JSON, ignore */ }
      }
      await route.continue();
    });

    await expect(
      page.locator('.rb-title-link', { hasText: fixtures.customTitle })
    ).toBeVisible({ timeout: 30000 });

    expect(templateLogFetchCount).toBe(0);
  });

  // ── Test 3: Custom template fetched from chain ───────────────────────────────
  // Bundle is empty — the custom template is not in the builtins either.
  // prefetchTemplates() must call templates(id) to get the creation block,
  // then getLogs on that block to retrieve the template text.
  test('custom template on-chain fetch: title resolved from chain when not in bundle', async ({ page }) => {
    await scanRpcBrowse(page, 'window.RealityBundledTemplates = {};');

    await expect(
      page.locator('.rb-title-link', { hasText: fixtures.customTitle })
    ).toBeVisible({ timeout: 30000 });
  });
});
