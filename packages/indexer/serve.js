import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../ponder/.env.local') });

// Cross-package imports from ponder's node_modules (ponder 0.17+)
const PONDER_MODS     = join(__dirname, '../ponder/node_modules');
const PONDER_INNER    = join(PONDER_MODS, 'ponder/node_modules');
const url = (p) => pathToFileURL(p).href;

// Must set namespace before onchainTable is called so tables land in reality.* schema
globalThis.PONDER_NAMESPACE_BUILD = { schema: 'reality' };

const {
  onchainTable, index,
  hex, bigint, integer, text, boolean,
  graphql,
} = await import(url(join(PONDER_MODS, 'ponder/dist/esm/index.js')));

const { buildGraphQLSchema } =
  await import(url(join(PONDER_MODS, 'ponder/dist/esm/graphql/index.js')));

const { drizzle } = await import(url(join(PONDER_INNER, 'drizzle-orm/node-postgres/index.js')));
const { Hono }   = await import(url(join(PONDER_MODS, 'hono/dist/index.js')));
const { cors }   = await import(url(join(PONDER_MODS, 'hono/dist/middleware/cors/index.js')));
const { serve }  = await import(url(join(PONDER_INNER, '@hono/node-server/dist/index.mjs')));

// ── Schema ──────────────────────────────────────────────────────────────────
// Mirrors ponder.schema.ts exactly but targets reality.* tables (written by
// sync.js) instead of ponder's public.{hash}__* tables. Keep in sync with
// ponder.schema.ts when the schema changes.
// globalThis.PONDER_NAMESPACE_BUILD.schema = 'reality' was set above; onchainTable
// reads that global to determine the PostgreSQL schema for each table.

const template = onchainTable(
  'template',
  {
    id:               text().primaryKey(),
    templateId:       bigint().notNull(),
    contract:         hex().notNull(),
    chainId:          integer().notNull(),
    user:             hex().notNull(),
    questionText:     text(),
    createdBlock:     bigint().notNull(),
    createdLogIndex:  bigint().notNull(),
    createdTxHash:    hex().notNull(),
    createdTimestamp: bigint().notNull(),
  },
  (table) => ({
    templateIdIdx: index().on(table.templateId),
    chainIdx:      index().on(table.chainId),
    contractIdx:   index().on(table.contract),
    userIdx:       index().on(table.user),
    createdIdx:    index().on(table.createdTimestamp),
  })
);

const question = onchainTable(
  'question',
  {
    id:                              text().primaryKey(),
    questionId:                      hex().notNull(),
    contract:                        hex().notNull(),
    chainId:                         integer().notNull(),
    templateId:                      bigint().notNull(),
    nonce:                           bigint().notNull(),
    data:                            text().notNull(),
    title:                           text(),
    type:                            text(),
    category:                        text(),
    lang:                            text(),
    outcomes:                        text(),
    questionJson:                    text(),
    creator:                         hex().notNull(),
    arbitrator:                      hex().notNull(),
    openingTimestamp:                bigint().notNull(),
    timeout:                         bigint().notNull(),
    contentHash:                     hex().notNull(),
    currentAnswer:                   hex(),
    currentAnswerBond:               bigint().notNull(),
    currentAnswerBondUsd:            bigint().notNull(),
    currentAnswerTimestamp:          bigint(),
    answerCount:                     integer().notNull(),
    historyHash:                     hex(),
    minBond:                         bigint().notNull(),
    lastBond:                        bigint().notNull(),
    cumulativeBonds:                 bigint().notNull(),
    cumulativeBondsUsd:              bigint().notNull(),
    bounty:                          bigint().notNull(),
    bountyUsd:                       bigint().notNull(),
    isPendingArbitration:            boolean().notNull(),
    arbitrationOccurred:             boolean().notNull(),
    arbitrationRequestedTimestamp:   bigint(),
    arbitrationRequestedBy:          hex(),
    answerFinalizedTimestamp:        bigint(),
    scheduledFinalizationTimestamp:  bigint().notNull(),
    reopensQuestionId:               text(),
    createdBlock:                    bigint().notNull(),
    createdLogIndex:                 bigint().notNull(),
    createdTxHash:                   hex().notNull(),
    createdTimestamp:                bigint().notNull(),
    updatedBlock:                    bigint().notNull(),
    updatedTimestamp:                bigint().notNull(),
  },
  (table) => ({
    creatorIdx:     index().on(table.creator),
    chainIdx:       index().on(table.chainId),
    templateIdx:    index().on(table.templateId),
    arbitratorIdx:  index().on(table.arbitrator),
    categoryIdx:    index().on(table.category),
    contractIdx:    index().on(table.contract),
    arbPendingIdx:  index().on(table.isPendingArbitration),
    aftIdx:         index().on(table.answerFinalizedTimestamp),
    reopenerIdx:    index().on(table.reopensQuestionId),
    updatedIdx:     index().on(table.updatedTimestamp),
    createdIdx:     index().on(table.createdTimestamp),
    finalizeIdx:    index().on(table.scheduledFinalizationTimestamp),
    answerCountIdx: index().on(table.answerCount),
    bondUsdIdx:     index().on(table.currentAnswerBondUsd),
    cBondsUsdIdx:   index().on(table.cumulativeBondsUsd),
  })
);

const response = onchainTable(
  'response',
  {
    id:               text().primaryKey(),
    questionId:       text().notNull(),
    answer:           hex(),
    commitmentHash:   hex(),
    bond:             bigint().notNull(),
    user:             hex().notNull(),
    historyHash:      hex().notNull(),
    isCommitment:     boolean().notNull(),
    isUnrevealed:     boolean().notNull(),
    timestamp:        bigint().notNull(),
    createdBlock:     bigint().notNull(),
    createdLogIndex:  bigint().notNull(),
    createdTxHash:    hex().notNull(),
    revealedBlock:    bigint(),
  },
  (table) => ({
    userIdx:      index().on(table.user),
    questionIdx:  index().on(table.questionId),
    timestampIdx: index().on(table.timestamp),
  })
);

const claim = onchainTable(
  'claim',
  {
    id:               text().primaryKey(),
    questionId:       text().notNull(),
    user:             hex().notNull(),
    amount:           bigint().notNull(),
    createdBlock:     bigint().notNull(),
    createdTimestamp: bigint().notNull(),
  },
  (table) => ({
    userIdx:     index().on(table.user),
    questionIdx: index().on(table.questionId),
  })
);

const schema = { template, question, response, claim };

// ── Database ─────────────────────────────────────────────────────────────────

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { casing: 'snake_case', schema });

// ── GraphQL ───────────────────────────────────────────────────────────────────

// Provide the minimal PONDER_DATABASE interface the graphql() middleware needs.
// wrap() is used by ponder's totalCount implementation — first arg may be an
// options object, last arg is always the callback receiving the db instance.
globalThis.PONDER_DATABASE = {
  readonlyQB: {
    raw: db,
    wrap: (...args) => {
      const cb = typeof args[0] === 'function' ? args[0] : args[1];
      return cb(db);
    },
  },
};

const graphqlMiddleware = graphql({ schema });

// ── HTTP server ───────────────────────────────────────────────────────────────

const app = new Hono();

app.use('*', cors({ origin: '*', maxAge: 86400 }));

app.get('/health', (c) => c.text('', 200));
app.use('/graphql', graphqlMiddleware);
app.use('/', graphqlMiddleware);

const port = parseInt(process.env.PORT ?? '42070', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Serving reality.* via GraphQL on port ${port}`);
});
