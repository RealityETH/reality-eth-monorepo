#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { getConfig, resolveChain, getChainRpc, parseQuestionArg } from './lib/config.js';
import { searchQuestions, findQuestion } from './lib/graphql.js';
import { getQuestionState, encodeAnswer, decodeAnswer, parseQuestionJson, submitAnswer, claimWinnings, calculateBond } from './lib/rpc.js';

const TOOLS = [
  {
    name: 'list_questions',
    description: 'Search for questions on reality.eth. Returns open questions by default. Filter by chain, category, or keyword.',
    inputSchema: {
      type: 'object',
      properties: {
        chain:     { type: 'string', description: 'Chain name (e.g. "gnosis", "base", "ethereum") or chain ID. Leave empty to search all chains.' },
        category:  { type: 'string', description: 'Category filter, e.g. "politics", "sports", "crypto"' },
        keyword:   { type: 'string', description: 'Keyword to search in question title' },
        open_only: { type: 'boolean', description: 'Only return questions that have not yet been finalized (default: true)' },
        limit:     { type: 'number', description: 'Max results to return (default: 10, max: 50)' },
      },
    },
  },
  {
    name: 'get_question',
    description: 'Get full details for a single reality.eth question, including the current answer, bond, and answer history.',
    inputSchema: {
      type: 'object',
      required: ['question_id'],
      properties: {
        question_id: { type: 'string', description: 'Question identifier: either "{contractAddress}-{questionId}" (from the URL) or a bare 32-byte hex question ID' },
        chain:       { type: 'string', description: 'Chain name or ID — required when question_id is a bare 32-byte hex string' },
      },
    },
  },
  {
    name: 'submit_answer',
    description: 'Submit an answer to an open reality.eth question. Requires REALITY_ETH_PRIVATE_KEY to be set. Bond is auto-calculated as double the current bond (or the minimum bond if unanswered).',
    inputSchema: {
      type: 'object',
      required: ['question_id', 'chain', 'answer'],
      properties: {
        question_id: { type: 'string', description: 'Question identifier: "{contractAddress}-{questionId}"' },
        chain:       { type: 'string', description: 'Chain name or ID' },
        answer:      { type: 'string', description: 'Human-readable answer. For yes/no: "yes" or "no". For multiple choice: the option text. For numbers: the value. Use "INVALID" to mark invalid.' },
        bond_eth:    { type: 'number', description: 'Bond to post in ETH/native token. Auto-calculated if omitted.' },
      },
    },
  },
  {
    name: 'claim_winnings',
    description: 'Claim winnings from a finalized reality.eth question where you gave the final correct answer. Requires REALITY_ETH_PRIVATE_KEY to be set.',
    inputSchema: {
      type: 'object',
      required: ['question_id', 'chain'],
      properties: {
        question_id: { type: 'string', description: 'Question identifier: "{contractAddress}-{questionId}"' },
        chain:       { type: 'string', description: 'Chain name or ID' },
      },
    },
  },
];

function formatQuestion(q, responses) {
  const out = {
    id:                 q.id,
    chain:              q.chainId,
    contract:           q.contract,
    question_id:        q.questionId,
    title:              q.title,
    type:               q.type,
    category:           q.category,
    creator:            q.creator,
    arbitrator:         q.arbitrator,
    opening_timestamp:  q.openingTimestamp,
    timeout_seconds:    q.timeout,
    min_bond_wei:       q.minBond,
    bounty_wei:         q.bounty,
    current_answer_raw: q.currentAnswer,
    current_bond_wei:   q.currentAnswerBond,
    finalization_time:  q.scheduledFinalizationTimestamp,
    is_finalized:       !!q.answerFinalizedTimestamp,
    is_pending_arbitration: q.isPendingArbitration,
  };

  if (q.questionJson) {
    try {
      const qjson = JSON.parse(q.questionJson);
      out.outcomes = qjson.outcomes || null;
      if (q.currentAnswer) {
        out.current_answer = decodeAnswer(q.currentAnswer, qjson);
      }
    } catch { /* ignore */ }
  }

  if (responses?.length) {
    out.answer_count = responses.length;
    out.answer_history = responses.map(r => ({
      answer: r.answer,
      bond:   r.bond,
      user:   r.user,
      timestamp: r.timestamp,
    }));
  }

  return out;
}

async function handleListQuestions(args, config) {
  const chainId = args.chain ? resolveChain(args.chain, config.chainsConfig).chainId : undefined;
  const questions = await searchQuestions(config.indexerUrl, {
    chainId,
    category:  args.category,
    openOnly:  args.open_only !== false,
    keyword:   args.keyword,
    limit:     args.limit,
  });
  if (!questions.length) return 'No questions found matching your criteria.';
  return JSON.stringify(questions.map(q => formatQuestion(q, null)), null, 2);
}

async function handleGetQuestion(args, config) {
  const parsed = parseQuestionArg(args.question_id);
  let chainId;
  if (args.chain) chainId = resolveChain(args.chain, config.chainsConfig).chainId;
  const { question, responses } = await findQuestion(config.indexerUrl, { ...parsed, chainId });
  if (!question) return 'Question not found in the indexer.';
  return JSON.stringify(formatQuestion(question, responses), null, 2);
}

async function handleSubmitAnswer(args, config) {
  if (!config.privateKey) throw new Error('REALITY_ETH_PRIVATE_KEY is not set');

  const parsed = parseQuestionArg(args.question_id);
  if (!parsed.contract) throw new Error('question_id must include the contract address: "{contractAddress}-{questionId}"');

  const chain = resolveChain(args.chain, config.chainsConfig);
  const rpcUrl = getChainRpc(chain.chainId, config.chainsConfig);

  // Get current question state and template for answer encoding
  const { question } = await findQuestion(config.indexerUrl, { ...parsed, chainId: chain.chainId });
  if (!question) throw new Error('Question not found in the indexer');

  let qjson;
  if (question.questionJson) {
    qjson = JSON.parse(question.questionJson);
  } else {
    throw new Error('Question JSON not available — cannot encode answer');
  }

  const answerBytes32 = encodeAnswer(args.answer, qjson);

  let bond;
  if (args.bond_eth != null) {
    bond = BigInt(Math.round(args.bond_eth * 1e18));
  } else {
    const state = await getQuestionState(rpcUrl, parsed.contract, parsed.questionId);
    bond = calculateBond(state.bond, state.min_bond || question.minBond);
    if (bond === 0n) bond = BigInt(question.minBond || 0);
  }

  const txHash = await submitAnswer(rpcUrl, config.privateKey, parsed.contract, parsed.questionId, answerBytes32, bond);
  return JSON.stringify({ tx_hash: txHash, answer: args.answer, bond_wei: bond.toString() });
}

async function handleClaimWinnings(args, config) {
  if (!config.privateKey) throw new Error('REALITY_ETH_PRIVATE_KEY is not set');

  const parsed = parseQuestionArg(args.question_id);
  if (!parsed.contract) throw new Error('question_id must include the contract address: "{contractAddress}-{questionId}"');

  const chain = resolveChain(args.chain, config.chainsConfig);
  const rpcUrl = getChainRpc(chain.chainId, config.chainsConfig);

  const { question, responses } = await findQuestion(config.indexerUrl, { ...parsed, chainId: chain.chainId });
  if (!question) throw new Error('Question not found in the indexer');
  if (!question.answerFinalizedTimestamp) throw new Error('Question is not yet finalized');
  if (!responses.length) throw new Error('No answer history found for this question');

  const txHash = await claimWinnings(rpcUrl, config.privateKey, parsed.contract, parsed.questionId, responses);
  return JSON.stringify({ tx_hash: txHash });
}

const server = new Server(
  { name: 'reality-eth', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const config = getConfig();
  try {
    let result;
    if      (name === 'list_questions')  result = await handleListQuestions(args, config);
    else if (name === 'get_question')    result = await handleGetQuestion(args, config);
    else if (name === 'submit_answer')   result = await handleSubmitAnswer(args, config);
    else if (name === 'claim_winnings')  result = await handleClaimWinnings(args, config);
    else throw new Error(`Unknown tool: ${name}`);
    return { content: [{ type: 'text', text: result }] };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
