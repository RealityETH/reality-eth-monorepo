import { test, expect } from '@playwright/test';
import { WEBSITE_URL } from './setup/website-server.js';

const TEST_ADDRESS = '0x68154ea682f95bf582b80dd6453fa401737491dc';

test.describe('account page', () => {
  test('loads without JS errors for a known address', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    // Stub out Ponder — return empty lists for every query shape the page issues.
    // A single merged response works because each caller only reads its own field.
    await page.route('**/graphql**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            questions:  { items: [] },
            responses:  { items: [] },
            claims:     { items: [] },
          },
        }),
      })
    );

    await page.goto(`${WEBSITE_URL}/index.html#!/account/${TEST_ADDRESS}`);

    // "No questions asked yet" confirms the page finished rendering without crashing
    await expect(page.locator('#asked-loading')).toContainText('No questions asked yet', { timeout: 10000 });

    // No JS errors (filter out benign favicon 404s)
    const realErrors = errors.filter(e => !e.includes('favicon'));
    expect(realErrors).toHaveLength(0);
  });
});
