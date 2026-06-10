import { ethers } from 'ethers';
import { createRequire } from 'module';
import { ANVIL_URL, TEST_ACCOUNT } from './anvil.js';

const require = createRequire(import.meta.url);

const REALITY_ETH_ABI = require('../../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');

export const CONTRACTS = {
  realityEth30: '0xE78996A233895bE74a66F451f1019cA9734205cc',
  realityEth32: '0xEb51d9d9717906c981C57af09C4a3449eF30705b',
  klerosArbitrator: '0x29f39de98d750eb77b5fafb31b2837f079fce222',
};

// Template IDs on gnosis — template 0 is bool, template 2 is single-select
export const TEMPLATE = {
  bool: 0,
};

export async function createFixtures() {
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);

  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  // Create a simple bool question with a short timeout for testing
  const timeout = 60; // 60 seconds
  const minBond = ethers.utils.parseEther('0.001');
  const openingTs = 0; // open immediately
  const nonce = 0;
  const question = 'Will this test pass?';

  const tx = await reality.askQuestion(
    TEMPLATE.bool,
    question,
    ethers.constants.AddressZero, // no arbitrator
    timeout,
    openingTs,
    nonce,
    { value: ethers.utils.parseEther('0.001') } // bounty
  );
  const receipt = await tx.wait();

  const logTopic = reality.interface.getEventTopic('LogNewQuestion');
  const log = receipt.logs.find(l => l.topics[0] === logTopic);
  const parsed = reality.interface.parseLog(log);
  const questionId = parsed.args.question_id;

  return {
    boolQuestionId: questionId,
    reality,
    wallet,
    provider,
    timeout,
  };
}
