import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createKlerosFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// The arbitration section only renders when a non-self arbitrator is set AND a
// non-zero bond exists AND the question is open AND a wallet is connected AND
// arbitration is not already pending.  A regression in any of these conditions
// (e.g. isSelfArbitrator() returning true for a real arbitrator) silently hides
// the section.
test.describe('arbitration section: Kleros arbitrator', () => {
  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createKlerosFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.klerosQuestionId}`
    );
    // renderArbitrationSection fires after contractsMetaPromise resolves — wait
    // for the button itself rather than question-state-open to avoid a race.
    await page.waitForSelector('.arb-btn', { timeout: 30000 });
  }

  test('arbitration section is visible', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('#arbitration-section')).toBeVisible();
  });

  test('arbitration section shows the dispute prompt', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('#arbitration-section')).toContainText('Dispute the current answer');
  });

  test('arbitration button is present', async ({ page }) => {
    await loadQuestion(page);
    await expect(page.locator('.arb-btn')).toBeVisible();
  });
});
