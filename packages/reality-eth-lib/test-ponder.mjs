/**
 * Verify reality-eth-lib functions against Ponder's indexed question data.
 *
 * Tests:
 *   1. contentHash(templateId, openingTimestamp, data) === ponder.contentHash
 *   2. populatedJSONForTemplate(templateText, data).title === ponder.title
 *   3. populatedJSONForTemplate(templateText, data).type  === ponder.type
 *   4. questionID v3 round-trip (when min_bond=0 and contract is known)
 */

import * as lib from './dist/cjs/formatters/question.js';
import * as tmpl from './dist/cjs/formatters/template.js';

const PONDER_URL = 'http://localhost:42069/graphql';
const PAGE_SIZE = 100;

// --- GraphQL helpers --------------------------------------------------------

async function gql(query) {
    const res = await fetch(PONDER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    return json.data;
}

async function* paginate(queryFn, pageSize = PAGE_SIZE) {
    let cursor = null;
    while (true) {
        const after = cursor ? `, after: "${cursor}"` : '';
        const data = await gql(queryFn(pageSize, after));
        const result = data[Object.keys(data)[0]];
        yield* result.items;
        if (!result.pageInfo.hasNextPage) break;
        cursor = result.pageInfo.endCursor;
    }
}

// --- Template cache ---------------------------------------------------------

const templateCache = new Map(); // key: `${chainId}-${contract}-${templateId}` -> questionText

async function loadAllTemplates() {
    const gen = paginate((limit, after) => `{
        templates(limit: ${limit}${after}) {
            pageInfo { hasNextPage endCursor }
            items { id templateId chainId contract questionText }
        }
    }`);
    for await (const t of gen) {
        templateCache.set(t.id, t.questionText);
    }
    console.log(`Loaded ${templateCache.size} templates from Ponder.`);
}

// Get template text: prefer Ponder DB, fall back to built-in (ids 0-4)
function getTemplateText(chainId, contract, templateId) {
    const key = `${chainId}-${contract}-${templateId}`;
    if (templateCache.has(key)) return templateCache.get(key);
    // Fall back to built-in templates (ids 0-4 same across all contracts)
    const builtin = tmpl.preloadedTemplateContents();
    return builtin[String(templateId)] ?? null;
}

// --- Counters ---------------------------------------------------------------

const stats = {
    total: 0,
    contentHashOk: 0,
    contentHashFail: 0,
    parseOk: 0,
    parseTitleMismatch: 0,
    parseTypeMismatch: 0,
    parseNullType: 0,
    qidOk: 0,
    qidFail: 0,
    qidSkip: 0,
    templateMissing: 0,
};

const failures = {
    contentHash: [],
    title: [],
    type: [],
    qid: [],
};
const MAX_FAILURES = 5; // cap how many we print per category

// --- Main test logic --------------------------------------------------------

async function testQuestion(q) {
    stats.total++;

    const templateId = Number(q.templateId);
    const templateText = getTemplateText(q.chainId, q.contract, templateId);

    // 1. contentHash
    try {
        const computed = lib.contentHash(templateId, q.openingTimestamp, q.data);
        if (computed.toLowerCase() === q.contentHash.toLowerCase()) {
            stats.contentHashOk++;
        } else {
            stats.contentHashFail++;
            if (failures.contentHash.length < MAX_FAILURES) {
                failures.contentHash.push({
                    id: q.id, computed, stored: q.contentHash,
                });
            }
        }
    } catch (e) {
        stats.contentHashFail++;
        if (failures.contentHash.length < MAX_FAILURES) {
            failures.contentHash.push({ id: q.id, error: e.message });
        }
    }

    // 2. populatedJSONForTemplate vs Ponder's parsed title/type
    if (templateText) {
        try {
            const parsed = lib.populatedJSONForTemplate(templateText, q.data);

            // Title comparison (only if Ponder has one)
            if (q.title != null) {
                const libTitle = parsed.title ?? '';
                if (libTitle === q.title) {
                    stats.parseOk++;
                } else {
                    stats.parseTitleMismatch++;
                    if (failures.title.length < MAX_FAILURES) {
                        failures.title.push({
                            id: q.id,
                            libTitle,
                            ponderTitle: q.title,
                            templateId,
                            data: q.data.substring(0, 80),
                        });
                    }
                }
            }

            // Type comparison
            if (q.type != null) {
                if (parsed.type === q.type) {
                    // ok (counted above)
                } else {
                    stats.parseTypeMismatch++;
                    if (failures.type.length < MAX_FAILURES) {
                        failures.type.push({
                            id: q.id,
                            libType: parsed.type,
                            ponderType: q.type,
                            templateId,
                        });
                    }
                }
            } else {
                stats.parseNullType++;
            }
        } catch (e) {
            // parsing threw — count as title mismatch
            stats.parseTitleMismatch++;
        }
    } else {
        stats.templateMissing++;
    }

    // 3. questionID v3 round-trip (use min_bond=0x0 as default)
    // We know contract and creator from Ponder, and nonce is now stored.
    const contract = q.contract;
    const version = contract.toLowerCase().includes('3_2') ? '3.2' : '3.0';
    // Only test if nonce is available and it's a v3 question
    if (q.nonce != null) {
        try {
            const computed_qid = lib.questionID(
                templateId,
                q.data,
                q.arbitrator,
                q.timeout,
                q.openingTimestamp,
                q.creator,
                q.nonce,
                '0x0',   // min_bond default (0 for most questions)
                contract,
                version
            );
            if (computed_qid.toLowerCase() === q.questionId.toLowerCase()) {
                stats.qidOk++;
            } else {
                stats.qidFail++;
                if (failures.qid.length < MAX_FAILURES) {
                    failures.qid.push({
                        id: q.id,
                        computed: computed_qid,
                        stored: q.questionId,
                        note: 'may have non-zero min_bond',
                    });
                }
            }
        } catch (e) {
            stats.qidFail++;
            if (failures.qid.length < MAX_FAILURES) {
                failures.qid.push({ id: q.id, error: e.message });
            }
        }
    } else {
        stats.qidSkip++;
    }
}

// --- Entry point ------------------------------------------------------------

async function main() {
    console.log('Loading templates...');
    await loadAllTemplates();

    console.log('Testing questions...');
    let count = 0;

    const gen = paginate((limit, after) => `{
        questions(limit: ${limit}${after}, orderBy: "createdTimestamp", orderDirection: "asc") {
            pageInfo { hasNextPage endCursor }
            items {
                id questionId nonce data title type
                templateId contentHash contract chainId
                creator arbitrator openingTimestamp timeout
            }
        }
    }`);

    for await (const q of gen) {
        await testQuestion(q);
        count++;
        if (count % 500 === 0) {
            process.stdout.write(`  processed ${count}...\r`);
        }
    }

    console.log(`\n\n=== Results (${stats.total} questions) ===`);
    console.log(`contentHash: ${stats.contentHashOk} ok, ${stats.contentHashFail} fail`);
    console.log(`title parse: ${stats.parseOk} ok, ${stats.parseTitleMismatch} mismatch, ${stats.parseNullType} null-type (malformed template), ${stats.templateMissing} template-missing`);
    console.log(`type parse:  ${stats.parseTypeMismatch} mismatch`);
    console.log(`questionID:  ${stats.qidOk} ok, ${stats.qidFail} fail (may have non-zero min_bond), ${stats.qidSkip} skipped`);

    if (failures.contentHash.length) {
        console.log('\ncontentHash failures (sample):');
        failures.contentHash.forEach(f => console.log(' ', JSON.stringify(f)));
    }
    if (failures.title.length) {
        console.log('\ntitle mismatches (sample):');
        failures.title.forEach(f => console.log(' ', JSON.stringify(f)));
    }
    if (failures.type.length) {
        console.log('\ntype mismatches (sample):');
        failures.type.forEach(f => console.log(' ', JSON.stringify(f)));
    }
    if (failures.qid.length) {
        console.log('\nquestionID failures (sample):');
        failures.qid.forEach(f => console.log(' ', JSON.stringify(f)));
    }
}

main().catch(e => { console.error(e); process.exit(1); });
