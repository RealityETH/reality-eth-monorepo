import { readFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const chainsConfig = require('../generated/chains-config.json');

export const DEFAULT_INDEXER_URL = 'https://indexer.reality.gwei.name/graphql';

export function getConfig() {
  return {
    privateKey:  process.env.REALITY_ETH_PRIVATE_KEY || null,
    indexerUrl:  process.env.REALITY_ETH_INDEXER_URL || DEFAULT_INDEXER_URL,
    chainsConfig,
  };
}

export function resolveChain(chainArg, chainsConfig) {
  if (!chainArg) return null;
  const s = String(chainArg).toLowerCase().trim();
  for (const [id, chain] of Object.entries(chainsConfig.chains)) {
    if (id === s || chain.shortName?.toLowerCase() === s || chain.name?.toLowerCase() === s) {
      return { chainId: parseInt(id), ...chain };
    }
  }
  throw new Error(`Unknown chain: "${chainArg}". Use a chain name (e.g. "gnosis", "base") or chain ID.`);
}

export function getChainRpc(chainId, chainsConfig) {
  const rpcEnv = process.env[`REALITY_ETH_RPC_URL_${chainId}`];
  if (rpcEnv) return rpcEnv;
  const chain = chainsConfig.chains[String(chainId)];
  if (!chain?.rpcUrls?.length) throw new Error(`No RPC URL for chain ${chainId}`);
  return chain.rpcUrls[0];
}

export function parseQuestionArg(questionArg) {
  // Accepts "{contract}-{questionId}" or bare 32-byte hex questionId
  const parts = String(questionArg).split('-');
  if (parts.length === 2 && parts[0].startsWith('0x') && parts[1].startsWith('0x')) {
    return { contract: parts[0].toLowerCase(), questionId: parts[1].toLowerCase() };
  }
  if (questionArg.startsWith('0x') && questionArg.length === 66) {
    return { contract: null, questionId: questionArg.toLowerCase() };
  }
  throw new Error('question_id must be "{contractAddress}-{questionId}" or a 32-byte hex string');
}
