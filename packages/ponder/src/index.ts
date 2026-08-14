import { ponder } from "ponder:registry";
import { question, response, template, claim } from "ponder:schema";
import { populatedJSONForTemplate, resolveTemplateText, stripNullBytes } from "./lib/parseQuestion";
import { bondToUsdBigInt } from "./lib/bondToUsd";
import { keccak256, encodePacked } from "viem";

function cqId(contract: `0x${string}`, questionId: `0x${string}`): string {
  return `${contract.toLowerCase()}-${questionId}`;
}

function templateKey(
  chainId: number,
  contract: `0x${string}`,
  templateIdNum: bigint
): string {
  return `${chainId}-${contract.toLowerCase()}-${templateIdNum}`;
}

// All contract variants share the same event interface.
// v3.2-specific events (LogCancelArbitration) are handled separately below.
for (const name of [
  "RealityETH_v3_2",
  "RealityETH_v3_0",
  "RealityETH_ERC20_sepolia",
] as const) {

  // ── Templates ────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogNewTemplate`, async ({ event, context }) => {
    const { template_id, user, question_text } = event.args;
    const { db, chain } = context;

    await db
      .insert(template)
      .values({
        id: templateKey(chain.id, event.log.address, template_id),
        templateId: template_id,
        contract: event.log.address,
        chainId: chain.id,
        user,
        questionText: stripNullBytes(question_text),
        createdBlock: event.block.number,
        createdLogIndex: BigInt(event.log.logIndex),
        createdTxHash: event.transaction.hash,
        createdTimestamp: event.block.timestamp,
      })
      .onConflictDoNothing();
  });

  // ── Questions ─────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogNewQuestion`, async ({ event, context }) => {
    const {
      question_id,
      user,
      template_id,
      question: questionData,
      content_hash,
      arbitrator,
      timeout,
      opening_ts,
      nonce,
    } = event.args;
    const { db, chain } = context;

    const id = cqId(event.log.address, question_id);
    const cleanData = stripNullBytes(questionData);

    const storedTemplate = await db.find(template, {
      id: templateKey(chain.id, event.log.address, template_id),
    });
    const templateText = resolveTemplateText(template_id, storedTemplate?.questionText);
    const parsed = populatedJSONForTemplate(templateText, cleanData);

    await db
      .insert(question)
      .values({
        id,
        questionId: question_id,
        contract: event.log.address,
        chainId: chain.id,
        templateId: template_id,
        nonce,
        data: cleanData,
        title: parsed.title,
        type: parsed.type,
        category: parsed.category,
        lang: parsed.lang,
        outcomes: parsed.outcomes,
        questionJson: parsed.questionJson,
        creator: user,
        arbitrator,
        openingTimestamp: BigInt(opening_ts),
        timeout: BigInt(timeout),
        contentHash: content_hash,
        currentAnswerBond: 0n,
        currentAnswerBondUsd: 0n,
        minBond: 0n,
        lastBond: 0n,
        cumulativeBonds: 0n,
        cumulativeBondsUsd: 0n,
        bounty: 0n,
        bountyUsd: 0n,
        isPendingArbitration: false,
        arbitrationOccurred: false,
        scheduledFinalizationTimestamp: 0n,
        createdBlock: event.block.number,
        createdLogIndex: BigInt(event.log.logIndex),
        createdTxHash: event.transaction.hash,
        createdTimestamp: event.block.timestamp,
        updatedBlock: event.block.number,
        updatedTimestamp: event.block.timestamp,
      })
      .onConflictDoNothing();
  });

  // ── Answers ───────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogNewAnswer`, async ({ event, context }) => {
    const { answer, question_id, history_hash, user, bond, ts, is_commitment } = event.args;
    const { db, chain } = context;
    const qId = cqId(event.log.address, question_id);
    const bondUsd = bondToUsdBigInt(bond, event.log.address, chain.id);

    await db
      .insert(response)
      .values({
        id: is_commitment
          ? `${qId}-${answer}`
          : `${qId}-${event.transaction.hash}-${event.log.logIndex}`,
        questionId: qId,
        answer: is_commitment ? undefined : answer,
        commitmentHash: is_commitment ? answer : undefined,
        bond,
        user,
        historyHash: history_hash,
        isCommitment: is_commitment,
        isUnrevealed: is_commitment,
        timestamp: ts,
        createdBlock: event.block.number,
        createdLogIndex: BigInt(event.log.logIndex),
        createdTxHash: event.transaction.hash,
      })
      .onConflictDoNothing();

    await db.update(question, { id: qId }).set((row) => ({
      ...(is_commitment ? {} : { currentAnswer: answer }),
      currentAnswerBond: bond,
      currentAnswerBondUsd: bondUsd,
      currentAnswerTimestamp: ts,
      historyHash: history_hash,
      lastBond: bond,
      cumulativeBonds: row.cumulativeBonds + bond,
      cumulativeBondsUsd: row.cumulativeBondsUsd + bondUsd,
      scheduledFinalizationTimestamp: ts + row.timeout,
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    }));
  });

  // ── Answer reveals ────────────────────────────────────────────────────────

  ponder.on(`${name}:LogAnswerReveal`, async ({ event, context }) => {
    const { question_id, answer_hash, answer, bond } = event.args;
    const { db } = context;
    const qId = cqId(event.log.address, question_id);

    const commitment_id = keccak256(encodePacked(
      ['bytes32', 'bytes32', 'uint256'],
      [question_id, answer_hash, bond],
    ));
    await db
      .update(response, { id: `${qId}-${commitment_id}` })
      .set({ answer, isUnrevealed: false });

    await db.update(question, { id: qId }).set({
      currentAnswer: answer,
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });

  // ── Minimum bond ──────────────────────────────────────────────────────────

  ponder.on(`${name}:LogMinimumBond`, async ({ event, context }) => {
    const { question_id, min_bond } = event.args;
    await context.db.update(question, { id: cqId(event.log.address, question_id) })
      .set({ minBond: min_bond });
  });

  // ── Arbitration ───────────────────────────────────────────────────────────

  ponder.on(`${name}:LogNotifyOfArbitrationRequest`, async ({ event, context }) => {
    const { question_id, user } = event.args;
    await context.db.update(question, { id: cqId(event.log.address, question_id) }).set({
      isPendingArbitration: true,
      arbitrationRequestedTimestamp: event.block.timestamp,
      arbitrationRequestedBy: user,
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });

  ponder.on(`${name}:LogFinalize`, async ({ event, context }) => {
    const { question_id, answer } = event.args;
    await context.db.update(question, { id: cqId(event.log.address, question_id) }).set({
      currentAnswer: answer,
      answerFinalizedTimestamp: event.block.timestamp,
      isPendingArbitration: false,
      arbitrationOccurred: true,
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });

  // ── Bounty ────────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogFundAnswerBounty`, async ({ event, context }) => {
    const { question_id, bounty } = event.args;
    const bountyUsd = bondToUsdBigInt(bounty, event.log.address, context.chain.id);
    await context.db.update(question, { id: cqId(event.log.address, question_id) }).set({
      bounty,
      bountyUsd,
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });

  // ── Claims ────────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogClaim`, async ({ event, context }) => {
    const { question_id, user, amount } = event.args;
    const qId = cqId(event.log.address, question_id);
    await context.db
      .insert(claim)
      .values({
        id: `${qId}-${event.transaction.hash}-${event.log.logIndex}`,
        questionId: qId,
        user,
        amount,
        createdBlock: event.block.number,
        createdTimestamp: event.block.timestamp,
      })
      .onConflictDoNothing();
  });

  // ── Reopen ────────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogReopenQuestion`, async ({ event, context }) => {
    const { question_id, reopened_question_id } = event.args;
    await context.db.update(question, { id: cqId(event.log.address, question_id) }).set({
      reopensQuestionId: cqId(event.log.address, reopened_question_id),
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });
}

// ── v3.2-only events ───────────────────────────────────────────────────────

ponder.on("RealityETH_v3_2:LogCancelArbitration", async ({ event, context }) => {
  const { question_id } = event.args;
  await context.db.update(question, { id: cqId(event.log.address, question_id) }).set({
    isPendingArbitration: false,
    arbitrationRequestedTimestamp: null,
    arbitrationRequestedBy: null,
    updatedBlock: event.block.number,
    updatedTimestamp: event.block.timestamp,
  });
});
