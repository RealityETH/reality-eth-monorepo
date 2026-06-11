import { test, expect } from '@playwright/test';
import { ethers } from 'ethers';
import { snapshot, revert, ANVIL_URL, TEST_ACCOUNT } from './setup/anvil.js';
import { setupPage } from './setup/wallet-mock.js';
import { createKlerosFixtures, CONTRACTS } from './setup/fixtures.js';
import { DAPP_URL } from './setup/dapp-server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const REALITY_ETH_ABI = require('../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';

test.describe('kleros proxy arbitration', () => {
  // Archive fetches for proxy metadata + 2 mining steps in the ruling test
  test.setTimeout(120000);

  let snap;
  let fixtures;

  test.beforeAll(async () => {
    fixtures = await createKlerosFixtures();
  });

  test.beforeEach(async () => {
    snap = await snapshot();
  });

  test.afterEach(async () => {
    await revert(snap);
    snap = await snapshot();
  });

  async function loadQuestion(page) {
    await setupPage(page);
    await page.goto(
      `${DAPP_URL}/#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.klerosQuestionId}`
    );

    // Wait for question detail to appear in open (not finalized) state
    await page.waitForFunction(() => {
      const win = document.querySelector('.rcbrowser--qa-detail:not(.template-item)');
      return win && win.classList.contains('question-state-open');
    }, {}, { timeout: 30000 });

    // Wait for the foreign-proxy arbitration button to be fully populated.
    // The dapp reads foreignProxy() and foreignChainId() from the proxy contract
    // (asynchronously after getDisputeFee fails) and stores them as data-attributes.
    // Until data-foreign-proxy is set, clicking produces no TX.
    await page.waitForFunction(() => {
      const btn = document.querySelector(
        '.rcbrowser--qa-detail:not(.template-item) .arbitration-button-foreign-proxy'
      );
      return btn &&
        !btn.classList.contains('unpopulated') &&
        btn.getAttribute('data-foreign-proxy');
    }, {}, { timeout: 60000 });
  }

  test('foreign-proxy URL carries correct question and chain params', async ({ page }) => {
    await loadQuestion(page);

    // Intercept window.open so we can inspect the URL without actually spawning a window.
    const urlPromise = page.evaluate(() =>
      new Promise(resolve => {
        const orig = window.open.bind(window);
        window.open = (url, ...rest) => {
          resolve(url);
          return orig(url, ...rest);
        };
      })
    );

    await page.click(
      '.rcbrowser--qa-detail:not(.template-item) .arbitration-button-foreign-proxy:not(.unpopulated)'
    );

    const proxyUrl = await urlPromise;

    // URL shape: index.html#!/foreign-proxy/<url-encoded JSON>
    expect(proxyUrl).toMatch(/^index\.html#!\/foreign-proxy\//);

    const encoded = proxyUrl.replace(/^index\.html#!\/foreign-proxy\//, '');
    const params = JSON.parse(decodeURIComponent(encoded));

    // The encoded object is the full question_detail with two extra fields:
    //   network_id  — the foreign chain ID (e.g. 1 for Ethereum mainnet)
    //   foreign_proxy — the proxy address on the foreign chain
    expect(params.question_id).toBe(fixtures.klerosQuestionId);
    expect(params.network_id).toBeTruthy();         // non-zero chain ID
    expect(params.foreign_proxy).toBeTruthy();      // address on the foreign chain
    // Bond must be non-zero so the user has something to claim on resolution
    const bond = ethers.BigNumber.from(params.bond);
    expect(bond.gt(0)).toBe(true);
  });

  test('arbitration ruling reaches correct answer on chain', async () => {
    const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
    const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, provider);

    // Give the proxy ETH for gas (it may have none on the fork)
    await provider.send('anvil_setBalance', [
      CONTRACTS.klerosArbitrator,
      ethers.utils.hexValue(ethers.utils.parseEther('1')),
    ]);

    await provider.send('anvil_impersonateAccount', [CONTRACTS.klerosArbitrator]);
    const proxySigner = provider.getSigner(CONTRACTS.klerosArbitrator);
    const realityAsProxy = reality.connect(proxySigner);

    // Step 1: mark question pending arbitration.
    // In the real cross-chain flow, the foreign-chain proxy calls this after the
    // Kleros court on the home chain acknowledges the dispute creation.
    const tx1 = await realityAsProxy.notifyOfArbitrationRequest(
      fixtures.klerosQuestionId,
      TEST_ACCOUNT.address, // requester
      0,                    // max_previous=0: skip front-running guard in tests
    );
    await tx1.wait();

    expect(await reality.isPendingArbitration(fixtures.klerosQuestionId)).toBe(true);

    // Step 2: deliver the ruling — proxy declares YES the winner
    const tx2 = await realityAsProxy.submitAnswerByArbitrator(
      fixtures.klerosQuestionId,
      YES,
      TEST_ACCOUNT.address, // answerer who wins the bond
    );
    await tx2.wait();

    await provider.send('anvil_stopImpersonatingAccount', [CONTRACTS.klerosArbitrator]);

    const bestAnswer = await reality.getBestAnswer(fixtures.klerosQuestionId);
    expect(bestAnswer).toBe(YES);
  });
});
