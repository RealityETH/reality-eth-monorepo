#!/usr/bin/env node
// Queries Ponder GraphQL and prints one representative URL per (type, state) combo.
// Usage: node scripts/list-sample-question-urls.js [--html] [graphql-url] [base-url]
//
// Defaults:
//   graphql-url  https://dev2.edochan.com/graphql
//   base-url     https://dev2.edochan.com/packages/website/webroot/index.html

const args    = process.argv.slice(2);
const HTML    = args.includes('--html');
const posArgs = args.filter(a => !a.startsWith('--'));
const GRAPHQL = posArgs[0] || 'https://dev2.edochan.com/graphql';
const BASE    = posArgs[1] || 'https://dev2.edochan.com/packages/website/webroot/index.html';

// sections: [{ title, entries: [{ label, url, sub?: { label, url } }] }]
const sections = [];
function addSection(title) {
  const s = { title, entries: [] };
  sections.push(s);
  return s;
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function render() {
  if (HTML) {
    const rows = sections.flatMap(s => [
      `<tr><th colspan="2">${esc(s.title)}</th></tr>`,
      ...s.entries.map(e => {
        const main = `<a href="${esc(e.url)}" target="_blank">${esc(e.label)}</a>`;
        const sub  = e.sub
          ? `<br><span class="sub">↳ <a href="${esc(e.sub.url)}" target="_blank">${esc(e.sub.label)}</a></span>`
          : '';
        return `<tr><td>${main}${sub}</td><td><a class="raw" href="${esc(e.url)}" target="_blank">↗</a></td></tr>`;
      }),
    ]).join('\n');
    console.log(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Question samples</title>
<style>
  body { font: 14px/1.5 system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #222; color: #fff; text-align: left; padding: 6px 10px; font-size: 12px; letter-spacing: .05em; }
  td { padding: 6px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  a { color: #1a6fc4; }
  a.raw { color: #999; font-size: 12px; white-space: nowrap; }
  .sub { font-size: 12px; color: #555; }
  .sub a { color: #555; }
</style>
</head>
<body>
<table>
${rows}
</table>
</body>
</html>`);
  } else {
    for (const s of sections) {
      console.log(`\n── ${s.title} ──`);
      for (const e of s.entries) {
        console.log(e.label);
        console.log(`  ${e.url}`);
        if (e.sub) {
          console.log(`  ${e.sub.label}`);
          console.log(`    ${e.sub.url}`);
        }
      }
    }
  }
}

const STATE_ORDER = ['not-open', 'open-unanswered', 'open-answered', 'arbitration', 'finalized'];
const TYPE_ORDER  = ['bool', 'single-select', 'multiple-select', 'uint', 'datetime', 'hash'];

async function fetchPage(after) {
  const cursor = after ? `, after: "${after}"` : '';
  const body = JSON.stringify({ query: `{
    questions(limit: 1000${cursor}, orderBy: "createdTimestamp", orderDirection: "desc") {
      items {
        id
        chainId
        type
        title
        openingTimestamp
        scheduledFinalizationTimestamp
        currentAnswer
        isPendingArbitration
        arbitrationOccurred
      }
      pageInfo { endCursor hasNextPage }
    }
  }` });

  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.questions;
}

function classify(q, now) {
  const ot  = Number(q.openingTimestamp);
  const sft = Number(q.scheduledFinalizationTimestamp);
  const ca  = q.currentAnswer;

  if (q.isPendingArbitration) return 'arbitration';
  if (sft > 0 && sft < now)   return 'finalized';
  if (sft > 0 && sft >= now)  return 'open-answered';  // answered, timer running
  if (ot > now)               return 'not-open';
  if (ca)                     return 'open-answered';   // answered but sft not set yet (edge case)
  return 'open-unanswered';
}

// ── Commit-reveal helpers ──────────────────────────────────────────────────────

async function gql(query) {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// Returns { reopeners: Map<id, reopenerId>, originals: Set<id> }
// reopeners: questions that reopen another question (have reopensQuestionId set)
// originals: the questions being reopened
async function fetchReopenerQuestionIds() {
  const reopeners = new Map(); // reopenerId -> originalId
  const originals = new Set();
  let after = null;
  while (true) {
    const cursor = after ? `, after: "${after}"` : '';
    const data = await gql(`{
      questions(where:{reopensQuestionId_contains:"0x"}, limit:1000${cursor}) {
        items { id reopensQuestionId }
        pageInfo { endCursor hasNextPage }
      }
    }`);
    for (const q of data.questions.items) {
      reopeners.set(q.id, q.reopensQuestionId);
      originals.add(q.reopensQuestionId);
    }
    if (!data.questions.pageInfo.hasNextPage) break;
    after = data.questions.pageInfo.endCursor;
  }
  return { reopeners, originals };
}

// Returns { unrevealed: Set<questionId>, revealed: Set<questionId> }
// A question can appear in both if it has a mix of revealed and unrevealed commits.
async function fetchCommitRevealQuestionIds() {
  const unrevealed = new Set();
  const revealed   = new Set();

  for (const isUnrevealed of [true, false]) {
    let after = null;
    while (true) {
      const cursor = after ? `, after: "${after}"` : '';
      const data = await gql(`{
        responses(where:{isCommitment:true,isUnrevealed:${isUnrevealed}}, limit:1000${cursor}) {
          items { questionId }
          pageInfo { endCursor hasNextPage }
        }
      }`);
      for (const r of data.responses.items) {
        (isUnrevealed ? unrevealed : revealed).add(r.questionId);
      }
      if (!data.responses.pageInfo.hasNextPage) break;
      after = data.responses.pageInfo.endCursor;
    }
  }
  return { unrevealed, revealed };
}

async function fetchQuestionsByIds(ids) {
  // Ponder doesn't support id_in filtering, so batch as individual queries
  // using GraphQL aliases — chunk to avoid huge requests.
  const CHUNK = 30;
  const idArr = [...ids];
  const result = {};
  for (let i = 0; i < idArr.length; i += CHUNK) {
    const chunk = idArr.slice(i, i + CHUNK);
    const aliases = chunk.map((id, j) =>
      `q${i + j}: question(id: ${JSON.stringify(id)}) { id chainId type title openingTimestamp scheduledFinalizationTimestamp currentAnswer isPendingArbitration }`
    ).join('\n');
    const data = await gql(`{ ${aliases} }`);
    for (const q of Object.values(data)) {
      if (q) result[q.id] = q;
    }
  }
  return result;
}

async function main() {
  const now = Math.floor(Date.now() / 1000);
  // bucket[type][state] = question
  const bucket = {};
  let after = null;
  let page  = 0;

  console.error('Fetching questions from Ponder…');

  while (true) {
    const result = await fetchPage(after);
    const items  = result.items;
    page++;
    process.stderr.write(`  page ${page}: ${items.length} questions\r`);

    for (const q of items) {
      const type  = q.type || 'unknown';
      const state = classify(q, now);
      if (!bucket[type])        bucket[type] = {};
      if (!bucket[type][state]) bucket[type][state] = q;
    }

    if (!result.pageInfo.hasNextPage) break;
    after = result.pageInfo.endCursor;

    // Stop early if we have every wanted (type, state) pair
    const allFound = TYPE_ORDER.every(t =>
      STATE_ORDER.every(s => bucket[t]?.[s])
    );
    if (allFound) { process.stderr.write('\n  (all combos found, stopping early)\n'); break; }
  }

  process.stderr.write('\n');

  // Collect results grouped by state
  const allTypes  = [...new Set([...TYPE_ORDER, ...Object.keys(bucket)])];

  for (const state of STATE_ORDER) {
    const entries = [];
    for (const type of allTypes) {
      const q = bucket[type]?.[state];
      if (!q) continue;
      entries.push({
        label: `[${type}] ${(q.title || q.id).slice(0, 80)}`,
        url:   `${BASE}#!/network/${q.chainId}/question/${q.id}`,
      });
    }
    if (entries.length) {
      const s = addSection(state.toUpperCase());
      s.entries = entries;
    }
  }

  // Unexpected types
  const extraTypes = Object.keys(bucket).filter(t => !TYPE_ORDER.includes(t));
  if (extraTypes.length) {
    const s = addSection('OTHER TYPES');
    for (const type of extraTypes) {
      for (const state of Object.keys(bucket[type])) {
        const q = bucket[type][state];
        s.entries.push({
          label: `[${type}/${state}] ${(q.title || q.id).slice(0, 80)}`,
          url:   `${BASE}#!/network/${q.chainId}/question/${q.id}`,
        });
      }
    }
  }

  // ── Reopener/reopened section ──────────────────────────────────────────────
  console.error('Fetching reopener question IDs…');
  const { reopeners, originals } = await fetchReopenerQuestionIds();
  console.error(`  ${reopeners.size} reopener questions, ${originals.size} original questions`);

  if (reopeners.size > 0) {
    console.error('Fetching reopener/original question details…');
    const allReopenIds = new Set([...reopeners.keys(), ...originals]);
    const reopenQuestions = await fetchQuestionsByIds(allReopenIds);

    const reopenerBucket = {};
    const originalBucket = {};
    for (const [id, q] of Object.entries(reopenQuestions)) {
      const type = q.type || 'unknown';
      if (reopeners.has(id) && !reopenerBucket[type]) reopenerBucket[type] = q;
      if (originals.has(id) && !originalBucket[type]) originalBucket[type] = q;
    }

    const sr = addSection('REOPENER (this question reopens another)');
    for (const [type, q] of Object.entries(reopenerBucket)) {
      const origQ = reopenQuestions[reopeners.get(q.id)];
      sr.entries.push({
        label: `[${type}] ${(q.title || q.id).slice(0, 80)}`,
        url:   `${BASE}#!/network/${q.chainId}/question/${q.id}`,
        sub:   origQ ? {
          label: `reopens: [${origQ.type || 'unknown'}] ${(origQ.title || origQ.id).slice(0, 60)}`,
          url:   `${BASE}#!/network/${origQ.chainId}/question/${origQ.id}`,
        } : undefined,
      });
    }

    const so = addSection('REOPENED (this question has been reopened)');
    for (const [type, q] of Object.entries(originalBucket)) {
      so.entries.push({
        label: `[${type}] ${(q.title || q.id).slice(0, 80)}`,
        url:   `${BASE}#!/network/${q.chainId}/question/${q.id}`,
      });
    }
  }

  // ── Commit-reveal section ──────────────────────────────────────────────────
  console.error('Fetching commit-reveal question IDs…');
  const { unrevealed, revealed } = await fetchCommitRevealQuestionIds();
  const allCrIds = new Set([...unrevealed, ...revealed]);
  console.error(`  ${unrevealed.size} with unrevealed commits, ${revealed.size} with revealed commits`);

  if (allCrIds.size > 0) {
    console.error('Fetching commit-reveal question details…');
    const crQuestions = await fetchQuestionsByIds(allCrIds);

    const crBucket = {};
    function crAdd(crState, q) {
      const type = q.type || 'unknown';
      if (!crBucket[crState]) crBucket[crState] = {};
      if (!crBucket[crState][type]) crBucket[crState][type] = q;
    }
    for (const [id, q] of Object.entries(crQuestions)) {
      const sft = Number(q.scheduledFinalizationTimestamp);
      if (unrevealed.has(id)) crAdd('commit-unrevealed', q);
      if (revealed.has(id))   crAdd(sft > 0 && sft < now ? 'commit-revealed-finalized' : 'commit-revealed-open', q);
    }

    const CR_LABELS = {
      'commit-unrevealed':         'COMMIT-REVEAL — committed, not yet revealed',
      'commit-revealed-open':      'COMMIT-REVEAL — revealed, still open',
      'commit-revealed-finalized': 'COMMIT-REVEAL — revealed, finalized',
    };
    for (const [crState, title] of Object.entries(CR_LABELS)) {
      if (!crBucket[crState]) continue;
      const s = addSection(title.toUpperCase());
      for (const [type, q] of Object.entries(crBucket[crState])) {
        s.entries.push({
          label: `[${type}] ${(q.title || q.id).slice(0, 80)}`,
          url:   `${BASE}#!/network/${q.chainId}/question/${q.id}`,
        });
      }
    }
  }

  render();
}

main().catch(err => { console.error(err); process.exit(1); });
