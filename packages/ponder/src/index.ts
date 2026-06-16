import { ponder } from "@/generated";
import { question, response, template, claim } from "../ponder.schema";
import { populatedJSONForTemplate, resolveTemplateText, stripNullBytes } from "./lib/parseQuestion";
import { eq, sql, and } from "drizzle-orm";
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

// Ponder 0.7 internally converts db.update() to INSERT...ON CONFLICT DO UPDATE,
// which fails with "cannot affect row a second time" when two events for the same
// entity land in the same batch. Using db.sql (raw drizzle) bypasses this.
function qUpdate(db: any, qId: string, fields: Record<string, unknown>) {
  return db.sql
    .update(question)
    .set(fields)
    .where(eq(question.id, qId));
}

// Contract names active in ponder.config.ts — add "RealityETH_v2" when that contract
// is enabled in the config.
for (const name of ["RealityETH_v3_2", "RealityETH_v3_0"] as const) {

  // ── Templates ────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogNewTemplate`, async ({ event, context }) => {
    const { template_id, user, question_text } = event.args;
    const { db, network } = context;

    await db
      .insert(template)
      .values({
        id: templateKey(network.chainId, event.log.address, template_id),
        templateId: template_id,
        contract: event.log.address,
        chainId: network.chainId,
        user,
        questionText: stripNullBytes(question_text),
        createdBlock: event.block.number,
        createdLogIndex: BigInt(event.log.logIndex),
        createdTxHash: event.log.transactionHash,
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
    const { db, network } = context;

    const id = cqId(event.log.address, question_id);
    // Raw RPC data may contain null bytes that break UTF-8 storage.
    const cleanData = stripNullBytes(questionData);

    // Look up the template to resolve the question type, category, lang, outcomes.
    // Built-in templates (0–4) are always available; custom templates are in the DB.
    const storedTemplate = await db.find(template, {
      id: templateKey(network.chainId, event.log.address, template_id),
    });
    const templateText = resolveTemplateText(template_id, storedTemplate?.questionText);
    const parsed = populatedJSONForTemplate(templateText, cleanData);

    await db
      .insert(question)
      .values({
        id,
        questionId: question_id,
        contract: event.log.address,
        chainId: network.chainId,
        templateId: template_id,
        nonce,
        data: cleanData,
        title: parsed.title,
        type: parsed.type,
        category: parsed.category,
        lang: parsed.lang,
        outcomes: parsed.outcomes,
        creator: user,
        arbitrator,
        openingTimestamp: BigInt(opening_ts),
        timeout: BigInt(timeout),
        contentHash: content_hash,
        currentAnswerBond: 0n,
        minBond: 0n,
        lastBond: 0n,
        cumulativeBonds: 0n,
        bounty: 0n,
        isPendingArbitration: false,
        arbitrationOccurred: false,
        scheduledFinalizationTimestamp: 0n,
        createdBlock: event.block.number,
        createdLogIndex: BigInt(event.log.logIndex),
        createdTxHash: event.log.transactionHash,
        createdTimestamp: event.block.timestamp,
        updatedBlock: event.block.number,
        updatedTimestamp: event.block.timestamp,
      })
      .onConflictDoNothing();
  });

  // ── Answers ───────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogNewAnswer`, async ({ event, context }) => {
    const { answer, question_id, history_hash, user, bond, ts, is_commitment } =
      event.args;
    const { db } = context;
    const qId = cqId(event.log.address, question_id);

    await db
      .insert(response)
      .values({
        // Commitments use the commitment hash in the ID so the reveal handler
        // can look up by id (text) rather than by the hex commitmentHash column.
        id: is_commitment
          ? `${qId}-${answer}`
          : `${qId}-${event.log.transactionHash}-${event.log.logIndex}`,
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
        createdTxHash: event.log.transactionHash,
      })
      .onConflictDoNothing();

    await qUpdate(db, qId, {
      ...(is_commitment ? {} : { currentAnswer: answer }),
      currentAnswerBond: bond,
      currentAnswerTimestamp: ts,
      historyHash: history_hash,
      lastBond: bond,
      cumulativeBonds: sql`${question.cumulativeBonds} + ${bond}`,
      scheduledFinalizationTimestamp: sql`${ts} + ${question.timeout}`,
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });

  // ── Answer reveals ────────────────────────────────────────────────────────

  ponder.on(`${name}:LogAnswerReveal`, async ({ event, context }) => {
    const { question_id, answer_hash, answer, bond } = event.args;
    const { db } = context;
    const qId = cqId(event.log.address, question_id);

    // The commitment record ID uses the commitment_id, which the contract derives as
    // keccak256(question_id, answer_hash, bond). LogAnswerReveal.answer_hash is only
    // keccak256(answer, nonce) — we must recompute commitment_id to look up the record.
    const commitment_id = keccak256(encodePacked(
      ['bytes32', 'bytes32', 'uint256'],
      [question_id, answer_hash, bond],
    ));
    await db.sql
      .update(response)
      .set({ answer, isUnrevealed: false })
      .where(eq(response.id, `${qId}-${commitment_id}`));

    await qUpdate(db, qId, {
      currentAnswer: answer,
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });

  // ── Minimum bond ──────────────────────────────────────────────────────────

  ponder.on(`${name}:LogMinimumBond`, async ({ event, context }) => {
    const { question_id, min_bond } = event.args;
    const { db } = context;

    await qUpdate(db, cqId(event.log.address, question_id), { minBond: min_bond });
  });

  // ── Arbitration ───────────────────────────────────────────────────────────

  ponder.on(
    `${name}:LogNotifyOfArbitrationRequest`,
    async ({ event, context }) => {
      const { question_id, user } = event.args;
      const { db } = context;

      await qUpdate(db, cqId(event.log.address, question_id), {
        isPendingArbitration: true,
        arbitrationRequestedTimestamp: event.block.timestamp,
        arbitrationRequestedBy: user,
        updatedBlock: event.block.number,
        updatedTimestamp: event.block.timestamp,
      });
    }
  );

  ponder.on(`${name}:LogFinalize`, async ({ event, context }) => {
    const { question_id, answer } = event.args;
    const { db } = context;

    await qUpdate(db, cqId(event.log.address, question_id), {
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
    // `bounty` is the new running total after this addition; use it directly.
    const { question_id, bounty } = event.args;
    const { db } = context;

    await qUpdate(db, cqId(event.log.address, question_id), {
      bounty,
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });

  // ── Claims ────────────────────────────────────────────────────────────────

  ponder.on(`${name}:LogClaim`, async ({ event, context }) => {
    const { question_id, user, amount } = event.args;
    const { db } = context;
    const qId = cqId(event.log.address, question_id);

    await db
      .insert(claim)
      .values({
        id: `${qId}-${event.log.transactionHash}-${event.log.logIndex}`,
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
    const { db } = context;

    // question_id is the new question; reopened_question_id is what it reopens
    await qUpdate(db, cqId(event.log.address, question_id), {
      reopensQuestionId: cqId(event.log.address, reopened_question_id),
      updatedBlock: event.block.number,
      updatedTimestamp: event.block.timestamp,
    });
  });
}

// ── v3.2-only events ───────────────────────────────────────────────────────

ponder.on("RealityETH_v3_2:LogCancelArbitration", async ({ event, context }) => {
  const { question_id } = event.args;
  const { db } = context;

  await qUpdate(db, cqId(event.log.address, question_id), {
    isPendingArbitration: false,
    arbitrationRequestedTimestamp: null,
    arbitrationRequestedBy: null,
    updatedBlock: event.block.number,
    updatedTimestamp: event.block.timestamp,
  });
});
