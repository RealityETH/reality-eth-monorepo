import { ethers } from 'ethers';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { answerToBytes32, bytes32ToString, populatedJSONForTemplate } = require(
  '../../../packages/reality-eth-lib/dist/cjs/formatters/question.js'
);

// Minimal ABIs — enough for the operations we perform
const REALITY_ETH_ABI = [
  'function questions(bytes32) view returns (bytes32 content_hash, address arbitrator, uint32 opening_ts, uint32 timeout, uint32 finalize_ts, bool is_pending_arbitration, uint256 bounty, bytes32 best_answer, bytes32 history_hash, uint256 bond, uint256 min_bond)',
  'function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) payable',
  'function claimWinnings(bytes32 question_id, bytes32[] history_hashes, address[] addrs, uint256[] bonds, bytes32[] answers)',
];

const ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000';

export function getProvider(rpcUrl) {
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function getWallet(privateKey, rpcUrl) {
  return new ethers.Wallet(privateKey, getProvider(rpcUrl));
}

export async function getQuestionState(rpcUrl, contractAddress, questionId) {
  const provider = getProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, REALITY_ETH_ABI, provider);
  try {
    const r = await contract.questions(questionId);
    return {
      best_answer:          r[7],
      history_hash:         r[8],
      bond:                 r[9],
      min_bond:             r[10] ?? 0n,
      is_pending_arbitration: r[5],
      finalize_ts:          r[4],
    };
  } catch {
    // v2.x contracts don't have min_bond — retry with shorter tuple
    const v2abi = ['function questions(bytes32) view returns (bytes32, address, uint32, uint32, uint32, bool, uint256, bytes32, bytes32, uint256)'];
    const c2 = new ethers.Contract(contractAddress, v2abi, provider);
    const r = await c2.questions(questionId);
    return {
      best_answer:            r[7],
      history_hash:           r[8],
      bond:                   r[9],
      min_bond:               0n,
      is_pending_arbitration: r[5],
      finalize_ts:            r[4],
    };
  }
}

export function encodeAnswer(answer, qjson) {
  return answerToBytes32(answer, qjson);
}

export function decodeAnswer(bytes32, qjson) {
  return bytes32ToString(bytes32, qjson);
}

export function parseQuestionJson(template, data) {
  try { return populatedJSONForTemplate(template, data); }
  catch { return null; }
}

export async function submitAnswer(rpcUrl, privateKey, contractAddress, questionId, answerBytes32, bond) {
  const wallet = getWallet(privateKey, rpcUrl);
  const contract = new ethers.Contract(contractAddress, REALITY_ETH_ABI, wallet);
  const tx = await contract.submitAnswer(questionId, answerBytes32, 0, { value: bond });
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function claimWinnings(rpcUrl, privateKey, contractAddress, questionId, responses) {
  // responses must be in reverse chronological order (newest first)
  const sorted = [...responses].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const history_hashes = sorted.map(r => r.historyHash);
  const addrs          = sorted.map(r => r.user);
  const bonds          = sorted.map(r => BigInt(r.bond));
  const answers        = sorted.map(r => r.answer || ZERO);

  // The first history_hash should be the one *before* the oldest answer — ZERO for the first ever
  // Actually claim_winnings needs history_hashes shifted: hash[i] is the hash *before* answer[i]
  // The indexer stores the hash *after* each response, so we need the previous hash for each entry
  // Re-order: for each response[i], its "previous hash" is response[i+1].historyHash (or ZERO for last)
  const prev_hashes = sorted.map((_, i) =>
    i + 1 < sorted.length ? sorted[i + 1].historyHash : ZERO
  );

  const wallet = getWallet(privateKey, rpcUrl);
  const contract = new ethers.Contract(contractAddress, REALITY_ETH_ABI, wallet);
  const tx = await contract.claimWinnings(questionId, prev_hashes, addrs, bonds, answers);
  const receipt = await tx.wait();
  return receipt.hash;
}

export function calculateBond(currentBond, minBond) {
  const cur = BigInt(currentBond || 0);
  const min = BigInt(minBond || 0);
  const doubled = cur * 2n;
  return doubled > min ? doubled : min;
}
