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

// Compute reality.eth v3.0 question ID deterministically (matches contract logic)
function computeQuestionId(templateId, openingTs, question, arbitrator, timeout, nonce, sender, contractAddress) {
  const contentHash = ethers.utils.solidityKeccak256(
    ['uint256', 'uint32', 'string'],
    [templateId, openingTs, question]
  );
  return ethers.utils.solidityKeccak256(
    ['bytes32', 'address', 'uint32', 'uint256', 'address', 'address', 'uint256'],
    [contentHash, arbitrator, timeout, 0, contractAddress, sender, nonce]
  );
}

export async function createCommitRevealFixtures() {
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  // nonce=2 avoids collision with createFixtures (nonce=0) and createClaimFixtures (nonce=1)
  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Will this test pass?',
    ethers.constants.AddressZero, 60, 2,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = !ethers.BigNumber.from(existing[0]).eq(0);

  if (!alreadyExists) {
    const tx = await reality.askQuestion(
      TEMPLATE.bool, 'Will this test pass?',
      ethers.constants.AddressZero, 60, 0, 2,
      { value: ethers.utils.parseEther('0.001') }
    );
    await tx.wait();
  }

  return { boolQuestionId: questionId };
}

export async function createClaimFixtures() {
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.utils.parseEther('0.001');
  const bond = ethers.utils.parseEther('0.001');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';

  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Will this claim test pass?',
    ethers.constants.AddressZero, 60, 1,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  // Only create if not already on-chain (beforeAll may run twice on worker restart)
  const existing = await reality.questions(questionId);
  const alreadyExists = !ethers.BigNumber.from(existing[0]).eq(0); // content_hash != 0

  if (!alreadyExists) {
    const tx1 = await reality.askQuestion(
      TEMPLATE.bool, 'Will this claim test pass?',
      ethers.constants.AddressZero, 60, 0, 1,
      { value: bounty }
    );
    await tx1.wait();

    // Submit YES answer
    await (await reality.submitAnswer(questionId, YES, 0, { value: bond })).wait();

    // Advance past the 60s timeout so the question is finalized
    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);
  }

  return { claimQuestionId: questionId, bond, bounty, answer: YES };
}
