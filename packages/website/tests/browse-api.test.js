/**
 * browse-api.test.js
 *
 * API contract tests for the browse GraphQL endpoint.
 * These run against the live indexer (no Anvil, no wallet) and define the
 * behaviour any replacement implementation (SQL views etc.) must preserve.
 *
 * Run with:
 *   npx playwright test --config api.config.js browse-api.test.js
 *
 * PONDER_URL env var overrides the default endpoint (http://localhost:42070).
 */

import { test, expect } from '@playwright/test';

const PONDER = process.env.PONDER_URL || 'http://localhost:42070';

async function gql(request, query) {
  const res = await request.post(`${PONDER}/graphql`, {
    data: { query },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// ── sanity ───────────────────────────────────────────────────────────────────

test('indexer is reachable and has questions', async ({ request }) => {
  const data = await gql(request, `{
    questions(limit: 1) { pageInfo { hasNextPage } }
  }`);
  expect(data.questions.pageInfo.hasNextPage).toBe(true);
});

// ── field invariants ─────────────────────────────────────────────────────────

test('answered questions have scheduledFinalizationTimestamp > 0', async ({ request }) => {
  const data = await gql(request, `{
    questions(limit: 100, where: { lastBond_gt: "0" }) {
      items { lastBond scheduledFinalizationTimestamp }
    }
  }`);
  expect(data.questions.items.length).toBeGreaterThan(0);
  for (const q of data.questions.items) {
    expect(BigInt(q.scheduledFinalizationTimestamp)).toBeGreaterThan(0n);
  }
});

test('unanswered questions have scheduledFinalizationTimestamp of 0', async ({ request }) => {
  const data = await gql(request, `{
    questions(limit: 100, where: { lastBond: "0" }) {
      items { lastBond scheduledFinalizationTimestamp }
    }
  }`);
  expect(data.questions.items.length).toBeGreaterThan(0);
  for (const q of data.questions.items) {
    expect(q.scheduledFinalizationTimestamp).toBe('0');
  }
});

test('currentAnswerBond equals lastBond', async ({ request }) => {
  // Both are set from the same LogNewAnswer event; they must stay in sync.
  const data = await gql(request, `{
    questions(limit: 100, where: { lastBond_gt: "0" }) {
      items { lastBond currentAnswerBond }
    }
  }`);
  expect(data.questions.items.length).toBeGreaterThan(0);
  for (const q of data.questions.items) {
    expect(q.currentAnswerBond).toBe(q.lastBond);
  }
});

test('answered questions have a non-null currentAnswer', async ({ request }) => {
  // A small fraction may be unrevealed commitments; allow up to 5% null.
  const data = await gql(request, `{
    questions(limit: 100, where: { lastBond_gt: "0" }) {
      items { id lastBond currentAnswer }
    }
  }`);
  expect(data.questions.items.length).toBeGreaterThan(0);
  const nullCount = data.questions.items.filter(q => q.currentAnswer == null).length;
  expect(nullCount / data.questions.items.length).toBeLessThan(0.05);
});

// ── filters ───────────────────────────────────────────────────────────────────

test('open filter returns only open questions', async ({ request }) => {
  const now = String(Math.floor(Date.now() / 1000));
  const data = await gql(request, `{
    questions(limit: 100, where: {
      isPendingArbitration: false,
      OR: [
        { scheduledFinalizationTimestamp_gt: "${now}" },
        { scheduledFinalizationTimestamp: "0" }
      ]
    }) {
      items { scheduledFinalizationTimestamp isPendingArbitration }
    }
  }`);
  expect(data.questions.items.length).toBeGreaterThan(0);
  const nowBig = BigInt(now);
  for (const q of data.questions.items) {
    expect(q.isPendingArbitration).toBe(false);
    const sft = BigInt(q.scheduledFinalizationTimestamp);
    expect(sft === 0n || sft > nowBig).toBe(true);
  }
});

test('isPendingArbitration filter returns only matching questions', async ({ request }) => {
  const data = await gql(request, `{
    questions(limit: 20, where: { isPendingArbitration: true }) {
      items { id isPendingArbitration }
    }
  }`);
  // May legitimately return zero results; if any exist they must all match.
  for (const q of data.questions.items) {
    expect(q.isPendingArbitration).toBe(true);
  }
});

test('chain filter returns only questions for that chain', async ({ request }) => {
  for (const chainId of [1, 100, 137]) {
    const data = await gql(request, `{
      questions(limit: 50, where: { chainId: ${chainId} }) {
        items { chainId }
      }
    }`);
    expect(data.questions.items.length).toBeGreaterThan(0);
    for (const q of data.questions.items) {
      expect(q.chainId).toBe(chainId);
    }
  }
});

// ── sort order ────────────────────────────────────────────────────────────────

test('bond sort returns questions in non-increasing lastBond order', async ({ request }) => {
  const data = await gql(request, `{
    questions(limit: 100, orderBy: "lastBond", orderDirection: "desc") {
      items { lastBond }
    }
  }`);
  expect(data.questions.items.length).toBeGreaterThan(1);
  const bonds = data.questions.items.map(q => BigInt(q.lastBond));
  for (let i = 1; i < bonds.length; i++) {
    expect(bonds[i]).toBeLessThanOrEqual(bonds[i - 1]);
  }
});

test('closing sort returns answered questions in ascending scheduledFinalizationTimestamp order', async ({ request }) => {
  const data = await gql(request, `{
    questions(
      limit: 100,
      orderBy: "scheduledFinalizationTimestamp",
      orderDirection: "asc",
      where: { lastBond_gt: "0" }
    ) {
      items { scheduledFinalizationTimestamp }
    }
  }`);
  expect(data.questions.items.length).toBeGreaterThan(1);
  const sfts = data.questions.items.map(q => BigInt(q.scheduledFinalizationTimestamp));
  for (let i = 1; i < sfts.length; i++) {
    expect(sfts[i]).toBeGreaterThanOrEqual(sfts[i - 1]);
  }
});

test('newest sort returns questions in descending createdTimestamp order', async ({ request }) => {
  const data = await gql(request, `{
    questions(limit: 100, orderBy: "createdTimestamp", orderDirection: "desc") {
      items { createdTimestamp }
    }
  }`);
  expect(data.questions.items.length).toBeGreaterThan(1);
  const ts = data.questions.items.map(q => BigInt(q.createdTimestamp));
  for (let i = 1; i < ts.length; i++) {
    expect(ts[i]).toBeLessThanOrEqual(ts[i - 1]);
  }
});

// ── pagination ────────────────────────────────────────────────────────────────

test('cursor pagination returns non-overlapping pages', async ({ request }) => {
  const page1 = await gql(request, `{
    questions(limit: 10, orderBy: "createdTimestamp", orderDirection: "desc") {
      items { id }
      pageInfo { hasNextPage endCursor }
    }
  }`);
  expect(page1.questions.pageInfo.hasNextPage).toBe(true);
  const cursor = page1.questions.pageInfo.endCursor;
  const ids1 = new Set(page1.questions.items.map(q => q.id));

  const page2 = await gql(request, `{
    questions(limit: 10, orderBy: "createdTimestamp", orderDirection: "desc", after: "${cursor}") {
      items { id }
    }
  }`);
  for (const q of page2.questions.items) {
    expect(ids1.has(q.id)).toBe(false);
  }
});
