import { test, expect } from '@playwright/test';
import { snapshot, revert, ANVIL_URL } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createKlerosFixtures, createForeignProxyFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// getDisputeFee(bytes32) selector → 0.001 ETH (1e15 wei), ABI-encoded as uint256
const MOCK_FEE_RESULT = '0x' + '0'.repeat(50) + '038d7ea4c68000';
// eth_call to the foreign proxy via the foreign chain's JsonRpcProvider (Alchemy/mainnet).
// The page.route handler returns these mock responses so tests never hit the real mainnet.
async function mockForeignChainRpc(page) {
  await page.route('**alchemy.com/**', (route, request) => {
    let body;
    try { body = JSON.parse(request.postData() || '{}'); } catch { body = {}; }
    const method = body.method;
    let result;
    if      (method === 'eth_chainId')   result = '0x1';
    else if (method === 'eth_getLogs')   result = [];
    else if (method === 'eth_blockNumber') result = '0x1000000';
    else if (method === 'eth_getBlockByNumber') result = null;
    else if (method === 'eth_call') {
      const calldata = body.params?.[0]?.data || '';
      // getDisputeFee(bytes32) → 0.001 ETH
      if (calldata.startsWith('0xa22352e2')) result = MOCK_FEE_RESULT;
      // arbitrationIDToDisputeExists(uint256) → false
      else if (calldata.startsWith('0x68cb30f5')) result = '0x' + '0'.repeat(64);
      else result = '0x';
    }
    else result = '0x';
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ jsonrpc: '2.0', id: body.id ?? 1, result }),
    });
  });
}

test.describe('Kleros foreign-proxy arbitration flow', () => {
  test.setTimeout(60000);

  let snap;
  let fixtures; // { foreignProxyAddr, klerosQuestionId, bond, bounty, answer }

  test.beforeAll(async () => {
    const klerosFixtures = await createKlerosFixtures();
    fixtures = await createForeignProxyFixtures(klerosFixtures);
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadQuestion(page) {
    await setupPage(page, { extraContracts: [fixtures.foreignProxyAddr] });
    await mockForeignChainRpc(page);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.klerosQuestionId}`
    );
    // Wait until fee is loaded: button exists and is no longer disabled
    await page.waitForFunction(
      () => {
        const btn = document.getElementById('arb-btn');
        return btn && !btn.disabled;
      },
      {}, { timeout: 30000 }
    );
  }

  test('arbitration button shows Kleros fee and chain-switch note', async ({ page }) => {
    await loadQuestion(page);

    const btnText = await page.locator('#arb-btn').textContent();
    expect(btnText).toContain('costs');
    expect(btnText).toContain('ETH');
    expect(btnText).not.toContain('Loading');
    expect(btnText).not.toContain('unavailable');

    const note = await page.locator('#arb-note').textContent();
    expect(note.toLowerCase()).toContain('switch');
  });

  test('arbitration button click sends requestArbitration and confirms', async ({ page }) => {
    await loadQuestion(page);

    await page.click('#arb-btn');

    // The click handler switches to mainnet, sends the TX, waits for receipt,
    // then sets button text to '✓ Done'.
    await page.waitForFunction(
      () => document.getElementById('arb-btn')?.textContent === '✓ Done',
      {}, { timeout: 30000 }
    );

    await expect(page.locator('#arb-btn')).toHaveText('✓ Done');
  });
});
