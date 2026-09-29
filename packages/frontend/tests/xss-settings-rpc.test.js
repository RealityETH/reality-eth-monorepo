import { test, expect } from '@playwright/test';
import { WEBSITE_URL } from './setup/website-server.js';

// The saved per-chain RPC override URL is user-editable and was a target of the
// localStorage-poisoning XSS. When the RPC settings panel renders it into an input value
// attribute, it must be HTML-escaped so a crafted value can't break out of the attribute.
test('malicious saved RPC URL is escaped in the settings panel', async ({ page }) => {
  const PAYLOAD = '"><img src=x onerror="window.__xss=true">';
  await page.addInitScript((payload) => {
    // Opt out of the one-time storage reset so the seeded value survives to the panel render.
    localStorage.setItem('reality.storage.generation', '2');
    localStorage.setItem('reality.rpcUrl.100', payload);
  }, PAYLOAD);

  await page.goto(`${WEBSITE_URL}/index.html#!/browse`);

  // Open the RPC settings panel for chain 100 programmatically (normally via the #ind-rpc chip).
  await page.evaluate(() => {
    const el = document.createElement('span');
    document.body.appendChild(el);
    window.RealitySettings.attachRpcPanel(el, 100);
    el.click();
  });

  await page.waitForSelector('.sp-panel #sp-chain-list input[data-chain="100"]', { timeout: 10000 });

  // No <img> injected into the panel, and the payload never executed.
  expect(await page.locator('.sp-panel img').count()).toBe(0);
  expect(await page.evaluate(() => window.__xss)).toBeFalsy();
  // The payload survives only as a literal (escaped) input value.
  const val = await page.locator('.sp-panel #sp-chain-list input[data-chain="100"]').inputValue();
  expect(val).toContain('<img');
});
