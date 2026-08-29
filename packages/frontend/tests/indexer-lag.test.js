import { test, expect } from '@playwright/test';
import { snapshot, revert } from './setup/anvil.js';
import { setupPageWithStalePonder } from './setup/wallet-mock.js';
import { createPonderLagFixtures, createPartialIndexerLagFixtures, createNoAnswerLagFixtures, createClaimedNoAnswerLagFixtures, createClaimedCommitRevealNoAnswerLagFixtures, CONTRACTS } from './setup/fixtures.js';
import { WEBSITE_URL } from './setup/website-server.js';

// Scenario: Ponder has indexed the question creation but not the answer events.
// verifyWithRpc should read the on-chain struct, synthesise a placeholder answer
// entry, and fire a background queryFilter to replace it with real event data.

test.describe('indexer lag: RPC fills missing answer events', () => {
  let fixtures;
  let snap;

  test.beforeAll(async () => {
    fixtures = await createPonderLagFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadLagQuestion(page) {
    await setupPageWithStalePonder(page, fixtures.stalePonderData);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    // Wait for Ponder data to render (stale: no answer, finalizeTS=0 → open state)
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
  }

  test('status updates to finalized after RPC verification', async ({ page }) => {
    await loadLagQuestion(page);
    // verifyWithRpc reads the struct, finds non-zero best_answer, updates finalizeTS,
    // and calls renderStatusCard — which renders .timer-val.finalized
    await page.waitForSelector('.timer-val.finalized', { timeout: 30000 });
    await expect(page.locator('.timer-val.finalized')).toBeVisible();
  });

  test('answer entry appears in history after background log fetch', async ({ page }) => {
    await loadLagQuestion(page);
    // Background queryFilterRobust fetches real LogNewAnswer events and re-renders
    await page.waitForSelector('.current-answer-container .bond-answer-label', { timeout: 30000 });
    await expect(page.locator('.current-answer-container .bond-answer-label')).toBeVisible();
  });

  test('answer label shows Yes for the submitted answer', async ({ page }) => {
    await loadLagQuestion(page);
    await page.waitForSelector('.current-answer-container .bond-answer-label', { timeout: 30000 });
    await expect(page.locator('.current-answer-container .bond-answer-label')).toContainText('Yes');
  });
});

// Scenario: question answered "No" (bytes32(0)) — same value as the "unanswered" sentinel.
// The bestAnswer mismatch check can't detect this because ZERO_HASH looks like no answer.
// Only the historyHash check catches it; the fix is to run historyHash even when finalized
// if Ponder has zero events (a non-zero on-chain hash unambiguously means indexer lag).
test.describe('indexer lag: finalized "No" answer not indexed', () => {
  let fixtures;
  let snap;

  test.beforeAll(async () => {
    fixtures = await createNoAnswerLagFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadNoQuestion(page) {
    await setupPageWithStalePonder(page, fixtures.stalePonderData);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
  }

  test('status updates to finalized after RPC verification', async ({ page }) => {
    await loadNoQuestion(page);
    await page.waitForSelector('.timer-val.finalized', { timeout: 30000 });
    await expect(page.locator('.timer-val.finalized')).toBeVisible();
  });

  test('answer entry appears after background log fetch', async ({ page }) => {
    await loadNoQuestion(page);
    await page.waitForSelector('.current-answer-container .bond-answer-label', { timeout: 30000 });
    await expect(page.locator('.current-answer-container .bond-answer-label')).toBeVisible();
  });

  test('answer label shows No for the submitted answer', async ({ page }) => {
    await loadNoQuestion(page);
    await page.waitForSelector('.current-answer-container .bond-answer-label', { timeout: 30000 });
    await expect(page.locator('.current-answer-container .bond-answer-label')).toContainText('No');
  });
});

// Scenario: question answered "No" (bytes32(0)) AND fully claimed via claimWinnings.
// After claiming, history_hash is rewound to ZERO_HASH.  Computed ZERO_HASH (from 0
// Ponder events) matches onchain ZERO_HASH, so the historyHash check sees match=true.
// bestAnswer is also ZERO_HASH.  Only bond > 0 reveals the answer exists.
test.describe('indexer lag: fully claimed "No" answer not indexed', () => {
  let fixtures;
  let snap;

  test.beforeAll(async () => {
    fixtures = await createClaimedNoAnswerLagFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadClaimedNoQuestion(page) {
    await setupPageWithStalePonder(page, fixtures.stalePonderData);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
  }

  test('status updates to finalized after RPC verification', async ({ page }) => {
    await loadClaimedNoQuestion(page);
    await page.waitForSelector('.timer-val.finalized', { timeout: 30000 });
    await expect(page.locator('.timer-val.finalized')).toBeVisible();
  });

  test('answer entry appears after background log fetch', async ({ page }) => {
    await loadClaimedNoQuestion(page);
    await page.waitForSelector('.current-answer-container .bond-answer-label', { timeout: 30000 });
    await expect(page.locator('.current-answer-container .bond-answer-label')).toBeVisible();
  });

  test('answer label shows No for the submitted answer', async ({ page }) => {
    await loadClaimedNoQuestion(page);
    await page.waitForSelector('.current-answer-container .bond-answer-label', { timeout: 30000 });
    await expect(page.locator('.current-answer-container .bond-answer-label')).toContainText('No');
  });
});

// Scenario: "No" answered via commit-reveal, fully claimed.
// Only ONE LogNewAnswer event exists (the commit; is_commitment=true, answer=commitment_id).
// After claiming, history_hash=ZERO_HASH, bond>0 triggers the catch-all in verifyWithRpc.
// The background fetch finds the commit event and must call commitments() to get the
// revealed "No" answer — otherwise currentAnswer is set to the raw commitment_id.
test.describe('indexer lag: fully claimed commit-reveal "No" answer not indexed', () => {
  let fixtures;
  let snap;

  test.beforeAll(async () => {
    fixtures = await createClaimedCommitRevealNoAnswerLagFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadClaimedCommitRevealNoQuestion(page) {
    await setupPageWithStalePonder(page, fixtures.stalePonderData);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
  }

  test('status updates to finalized after RPC verification', async ({ page }) => {
    await loadClaimedCommitRevealNoQuestion(page);
    await page.waitForSelector('.timer-val.finalized', { timeout: 30000 });
    await expect(page.locator('.timer-val.finalized')).toBeVisible();
  });

  test('answer entry appears after background log fetch', async ({ page }) => {
    await loadClaimedCommitRevealNoQuestion(page);
    await page.waitForSelector('.current-answer-container .bond-answer-label', { timeout: 30000 });
    await expect(page.locator('.current-answer-container .bond-answer-label')).toBeVisible();
  });

  test('answer label shows No for the commit-revealed answer', async ({ page }) => {
    await loadClaimedCommitRevealNoQuestion(page);
    // Wait specifically for the label to resolve to "No" — the background fetch passes through
    // a "Commitment" intermediate state while commitments() is pending, so we need a longer
    // window that covers the full async resolution cycle.
    await page.waitForFunction(() => {
      const el = document.querySelector('.current-answer-container .bond-answer-label');
      return el && el.textContent.includes('No');
    }, { timeout: 30000 });
  });
});

// Scenario: Ponder has the question and its FIRST answer, but the second answer
// (same YES value, higher bond) hasn't been indexed yet.  The bestAnswer from
// the RPC struct matches Ponder's last event, so the bestAnswer comparison in
// verifyWithRpc won't fire.  Only the historyHash mismatch catches the gap and
// sets needsEventFetch, triggering a background log fetch to complete the history.
test.describe('indexer lag: partial history — same answer re-escalated', () => {
  let fixtures;
  let snap;

  test.beforeAll(async () => {
    fixtures = await createPartialIndexerLagFixtures();
  });

  test.beforeEach(async () => { snap = await snapshot(); });
  test.afterEach(async () => { await revert(snap); snap = await snapshot(); });

  async function loadPartialQuestion(page) {
    await setupPageWithStalePonder(page, fixtures.stalePonderData);
    await page.goto(
      `${WEBSITE_URL}/index.html#!/network/100/question/${CONTRACTS.realityEth30}-${fixtures.questionId}`
    );
    // Ponder says question is open with 1 answer — wait for that initial render
    await page.waitForSelector('.question-state-open', { timeout: 30000 });
    await page.waitForSelector('.current-answer-container .bond-answer-label', { timeout: 10000 });
  }

  test('history section appears after background fetch adds the second answer', async ({ page }) => {
    await loadPartialQuestion(page);
    // Initially only 1 answer (no history section); after fetch 2 answers → has-history
    await page.waitForSelector('#question-page.has-history', { timeout: 30000 });
    await expect(page.locator('.answered-history-container .answered-history-item')).toBeVisible();
  });

  test('bond updates to the higher on-chain value after RPC verification', async ({ page }) => {
    await loadPartialQuestion(page);
    // RPC struct returns bond2 (0.002 ETH); renderStatusCard updates the display
    await page.waitForFunction(
      () => document.querySelector('.answer-bond-value')?.textContent?.includes('0.002'),
      { timeout: 30000 }
    );
    const bondText = await page.locator('.current-answer-container .answer-bond-value').first().textContent();
    expect(bondText).toContain('0.002');
  });
});
