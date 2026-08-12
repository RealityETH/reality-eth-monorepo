import { onchainTable, index } from "@ponder/core";

export const template = onchainTable(
  "template",
  (p) => ({
    // `${chainId}-${contract}-${templateId}`
    id: p.text().primaryKey(),
    templateId: p.bigint().notNull(),
    contract: p.hex().notNull(),
    chainId: p.integer().notNull(),
    user: p.hex().notNull(),
    questionText: p.text(),
    createdBlock: p.bigint().notNull(),
    createdLogIndex: p.bigint().notNull(),
    createdTxHash: p.hex().notNull(),
    createdTimestamp: p.bigint().notNull(),
  }),
  (table) => ({
    templateIdIdx:   index().on(table.templateId),
    chainIdx:        index().on(table.chainId),
    contractIdx:     index().on(table.contract),
    userIdx:         index().on(table.user),
    createdIdx:      index().on(table.createdTimestamp),
  })
);

export const question = onchainTable(
  "question",
  (p) => ({
    // `${contract}-${questionId}` — matches the URL format used everywhere
    id: p.text().primaryKey(),
    questionId: p.hex().notNull(),
    contract: p.hex().notNull(),
    chainId: p.integer().notNull(),

    templateId: p.bigint().notNull(),
    nonce: p.bigint().notNull(),

    // Raw question content string from the event
    data: p.text().notNull(),
    // Parsed from data
    title: p.text(),
    type: p.text(),       // bool | uint | single-choice | multiple-choice | datetime
    category: p.text(),
    lang: p.text(),
    outcomes: p.text(),   // JSON-stringified array for choice questions
    questionJson: p.text(), // Full JSON from populatedJSONForTemplate — used by clients to avoid re-parsing

    // Address that called askQuestion — indexed for grouping by integration
    creator: p.hex().notNull(),
    arbitrator: p.hex().notNull(),
    openingTimestamp: p.bigint().notNull(),
    timeout: p.bigint().notNull(),
    contentHash: p.hex().notNull(),

    // Current answer state — updated on each LogNewAnswer
    currentAnswer: p.hex(),
    currentAnswerBond: p.bigint().notNull(),
    currentAnswerTimestamp: p.bigint(),
    historyHash: p.hex(),

    minBond: p.bigint().notNull(),
    lastBond: p.bigint().notNull(),
    cumulativeBonds: p.bigint().notNull(),
    bounty: p.bigint().notNull(),

    isPendingArbitration: p.boolean().notNull(),
    arbitrationOccurred: p.boolean().notNull(),
    arbitrationRequestedTimestamp: p.bigint(),
    arbitrationRequestedBy: p.hex(),

    answerFinalizedTimestamp: p.bigint(),
    // After latest answer: currentAnswerTimestamp + timeout. Updated per answer.
    scheduledFinalizationTimestamp: p.bigint().notNull(),

    // ID of the question this one reopens (if any)
    reopensQuestionId: p.text(),

    createdBlock: p.bigint().notNull(),
    createdLogIndex: p.bigint().notNull(),
    createdTxHash: p.hex().notNull(),
    createdTimestamp: p.bigint().notNull(),
    updatedBlock: p.bigint().notNull(),
    updatedTimestamp: p.bigint().notNull(),
  }),
  (table) => ({
    creatorIdx:      index().on(table.creator),
    chainIdx:        index().on(table.chainId),
    templateIdx:     index().on(table.templateId),
    arbitratorIdx:   index().on(table.arbitrator),
    categoryIdx:     index().on(table.category),
    contractIdx:     index().on(table.contract),
    arbPendingIdx:   index().on(table.isPendingArbitration),
    reopenerIdx:     index().on(table.reopensQuestionId),
    updatedIdx:      index().on(table.updatedTimestamp),
    createdIdx:      index().on(table.createdTimestamp),
    finalizeIdx:     index().on(table.scheduledFinalizationTimestamp),
  })
);

export const response = onchainTable(
  "response",
  (p) => ({
    // `${contract}-${questionId}-${txHash}-${logIndex}`
    id: p.text().primaryKey(),
    // References question.id
    questionId: p.text().notNull(),

    answer: p.hex(),
    commitmentHash: p.hex(),
    bond: p.bigint().notNull(),
    user: p.hex().notNull(),
    // Running history hash after this response — lets the client verify
    // a server-supplied history against a single getQuestion() RPC call
    historyHash: p.hex().notNull(),

    isCommitment: p.boolean().notNull(),
    isUnrevealed: p.boolean().notNull(),

    timestamp: p.bigint().notNull(),
    createdBlock: p.bigint().notNull(),
    createdLogIndex: p.bigint().notNull(),
    createdTxHash: p.hex().notNull(),
    revealedBlock: p.bigint(),
  }),
  (table) => ({
    userIdx:       index().on(table.user),
    questionIdx:   index().on(table.questionId),
    timestampIdx:  index().on(table.timestamp),
  })
);

export const claim = onchainTable(
  "claim",
  (p) => ({
    id: p.text().primaryKey(),
    questionId: p.text().notNull(),
    user: p.hex().notNull(),
    amount: p.bigint().notNull(),
    createdBlock: p.bigint().notNull(),
    createdTimestamp: p.bigint().notNull(),
  }),
  (table) => ({
    userIdx:       index().on(table.user),
    questionIdx:   index().on(table.questionId),
  })
);
