import { test, expect } from '@playwright/test';
import { WEBSITE_URL } from './setup/website-server.js';

// A real contract address from generated/contracts.json — chain 1 (Ethereum)
const CHAIN_1_CONTRACT = '0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47';
const FAKE_QUESTION_BYTES32 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';

test.describe('notifications view', () => {
  test('renders without JS errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.route('**/graphql**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { questions: { items: [] }, responses: { items: [] } } }),
      })
    );

    await page.goto(`${WEBSITE_URL}/index.html#!/notifications`);
    await expect(page.locator('#notif-list')).toBeVisible({ timeout: 10000 });

    const realErrors = errors.filter(e => !e.includes('favicon'));
    expect(realErrors).toHaveLength(0);
  });

  test('notification link uses chainId stored in notification', async ({ page }) => {
    await page.route('**/graphql**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { questions: { items: [] }, responses: { items: [] } } }),
      })
    );

    await page.goto(`${WEBSITE_URL}/index.html`);
    await page.waitForFunction(() => typeof window.RealityWatches?.addNotification === 'function');

    const compoundId = `${CHAIN_1_CONTRACT}-${FAKE_QUESTION_BYTES32}`;
    await page.evaluate(async ({ compoundId }) => {
      await window.RealityWatches.addNotification({
        id:         'test-notif-chainid',
        questionId: compoundId,
        chainId:    1,
        type:       'new_answer',
        title:      'Test Question',
        detail:     'New answer posted',
        timestamp:  Math.floor(Date.now() / 1000),
      });
    }, { compoundId });

    await page.evaluate(() => { location.hash = '#!/notifications'; });
    await expect(page.locator('#notif-list .notif-item')).toBeVisible({ timeout: 10000 });

    const href = await page.locator('#notif-list .notif-item a').first().getAttribute('href');
    expect(href).toBe(`#!/network/1/question/${compoundId}`);
  });

  test('notification link resolves chainId from contracts.json when not stored', async ({ page }) => {
    await page.route('**/graphql**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { questions: { items: [] }, responses: { items: [] } } }),
      })
    );

    await page.goto(`${WEBSITE_URL}/index.html`);
    await page.waitForFunction(() => typeof window.RealityWatches?.addNotification === 'function');

    // Store notification WITHOUT chainId — simulates old notifications or the original bug
    const compoundId = `${CHAIN_1_CONTRACT}-${FAKE_QUESTION_BYTES32}`;
    await page.evaluate(async ({ compoundId }) => {
      await window.RealityWatches.addNotification({
        id:         'test-notif-lookup',
        questionId: compoundId,
        // no chainId — should be looked up from contracts.json
        type:       'finalized',
        title:      'Resolved Question',
        detail:     'Question finalized',
        timestamp:  Math.floor(Date.now() / 1000),
      });
    }, { compoundId });

    await page.evaluate(() => { location.hash = '#!/notifications'; });
    await expect(page.locator('#notif-list .notif-item')).toBeVisible({ timeout: 10000 });

    // Contract 0x325a2e0f... is on chain 1 in generated/contracts.json
    const href = await page.locator('#notif-list .notif-item a').first().getAttribute('href');
    expect(href).toBe(`#!/network/1/question/${compoundId}`);
    expect(href).not.toContain('unknown');
  });
});
