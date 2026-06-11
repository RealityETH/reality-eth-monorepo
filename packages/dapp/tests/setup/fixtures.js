import { ethers } from 'ethers';
import { createRequire } from 'module';
import { ANVIL_URL, TEST_ACCOUNT, FORK_BLOCK } from './anvil.js';

const require = createRequire(import.meta.url);

const REALITY_ETH_ABI    = require('../../../contracts/abi/solc-0.8.6/RealityETH-3.0.abi.json');
const REALITY_ETH_V21_ABI = require('../../../contracts/abi/solc-0.8.6/RealityETH-2.1.abi.json');

export const CONTRACTS = {
  realityEth21: '0x79e32aE03fb27B07C89c0c568F80287C01ca2E57',
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

export async function createKlerosFixtures() {
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.utils.parseEther('0.001');
  const bond = ethers.utils.parseEther('0.001');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
  // Fork block 46600000 has timestamp Jun 9 2026 (~1780967485).  With a 300-day timeout,
  // finalization_ts ≈ Mar 2027, so isFinalized() returns false at test-run time (~Jun 2026)
  // and the dapp shows the arbitration button.  reality.eth enforces timeout < 365 days.
  const timeout = 300 * 24 * 3600;

  // nonce=3 avoids collision with other fixtures (nonce=0,1,2).
  // Different arbitrator + question text also guarantees a unique question ID.
  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Will this kleros arbitration test pass?',
    CONTRACTS.klerosArbitrator, timeout, 3,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = !ethers.BigNumber.from(existing[0]).eq(0);

  if (!alreadyExists) {
    const tx1 = await reality.askQuestion(
      TEMPLATE.bool, 'Will this kleros arbitration test pass?',
      CONTRACTS.klerosArbitrator, timeout, 0, 3,
      { value: bounty }
    );
    await tx1.wait();

    // Submit an answer so bond > 0 — the dapp requires a non-zero bond before
    // allowing the user to request arbitration.
    const tx2 = await reality.submitAnswer(questionId, YES, 0, { value: bond });
    await tx2.wait();
    // No evm_increaseTime here: the question must remain open (not finalized)
    // so the dapp shows the .arbitration-button.
  }

  return { klerosQuestionId: questionId, bond, bounty, answer: YES };
}

export async function createAnswerTypeFixtures() {
  const DELIMITER = '␟'; // reality.eth question field separator
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);
  const bounty = ethers.utils.parseEther('0.001');
  // No answer submitted in these fixtures, so finalization_ts stays 0 and
  // isFinalized() (which checks browser clock) returns false regardless of timeout.
  const timeout = 60;
  const openingTs = 0;

  async function ensure(templateId, questionText, nonce) {
    const questionId = computeQuestionId(
      templateId, openingTs, questionText,
      ethers.constants.AddressZero, timeout, nonce,
      TEST_ACCOUNT.address, CONTRACTS.realityEth30
    );
    const existing = await reality.questions(questionId);
    if (ethers.BigNumber.from(existing[0]).eq(0)) {
      const tx = await reality.askQuestion(
        templateId, questionText, ethers.constants.AddressZero,
        timeout, openingTs, nonce, { value: bounty }
      );
      await tx.wait();
    }
    return questionId;
  }

  // Outcomes string for select-type templates (2 and 3)
  const OUTCOMES = '"Cat","Dog","Fish"';

  return {
    // nonces 4-8 avoid collision with other fixture functions (0-3)
    boolId:           await ensure(0, 'Answer-types test: bool',                        4),
    uintId:           await ensure(1, 'Answer-types test: uint',                        5),
    singleSelectId:   await ensure(2, `Answer-types test: single-select${DELIMITER}${OUTCOMES}`, 6),
    multipleSelectId: await ensure(3, `Answer-types test: multiple-select${DELIMITER}${OUTCOMES}`, 7),
    datetimeId:       await ensure(4, 'Answer-types test: datetime',                    8),
  };
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

// Creates a question that has ONE existing answer (YES, 0.001 ETH bond) but is
// still OPEN from the browser's perspective.
//
// The key constraint: isFinalized() in the dapp checks `fin * 1000 < Date.now()`.
// After an answer the contract sets finalization_ts = block.timestamp + timeout.
// The fork block is ~2 days in the past relative to the browser clock, so any
// question with timeout < 2 days would already appear finalized.  We use a 90-day
// timeout so finalization_ts = fork_ts + 90d ≈ September 2026 > browser June 2026.
export async function createBondEscalationFixtures() {
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty    = ethers.utils.parseEther('0.001');
  const initBond  = ethers.utils.parseEther('0.001');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const TIMEOUT_90_DAYS = 7776000; // 90 * 24 * 3600

  // nonce=10 — nonces 0-9 on v3.0 are taken by other fixture functions
  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Bond escalation test: bool',
    ethers.constants.AddressZero, TIMEOUT_90_DAYS, 10,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = !ethers.BigNumber.from(existing[0]).eq(0);

  if (!alreadyExists) {
    const tx1 = await reality.askQuestion(
      TEMPLATE.bool, 'Bond escalation test: bool',
      ethers.constants.AddressZero, TIMEOUT_90_DAYS, 0, 10,
      { value: bounty }
    );
    await tx1.wait();
    await (await reality.submitAnswer(questionId, YES, 0, { value: initBond })).wait();
  }

  return { questionId, initBond };
}

// Creates two questions for history display tests:
//   oneAnswerQuestionId  — 1 answer (YES, 0.001 ETH); has-history should NOT be set
//   twoAnswerQuestionId  — 2 answers (YES@0.001, then NO@0.002); has-history SHOULD be set
//
// Both use a 90-day timeout so they appear open from the browser clock (see
// createBondEscalationFixtures for the full reasoning).
export async function createAnswerHistoryFixtures() {
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.utils.parseEther('0.001');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const NO  = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const TIMEOUT_90_DAYS = 7776000;

  // nonces 11 and 12 — nonces 0-10 on v3.0 are already taken
  async function ensureQuestion(text, nonce, submits) {
    const questionId = computeQuestionId(
      TEMPLATE.bool, 0, text,
      ethers.constants.AddressZero, TIMEOUT_90_DAYS, nonce,
      TEST_ACCOUNT.address, CONTRACTS.realityEth30
    );
    const existing = await reality.questions(questionId);
    if (!ethers.BigNumber.from(existing[0]).eq(0)) return questionId; // already exists

    await (await reality.askQuestion(
      TEMPLATE.bool, text, ethers.constants.AddressZero,
      TIMEOUT_90_DAYS, 0, nonce, { value: bounty }
    )).wait();
    for (const { answer, bond, maxPrev } of submits) {
      await (await reality.submitAnswer(
        questionId, answer, maxPrev, { value: bond }
      )).wait();
    }
    return questionId;
  }

  const oneAnswerQuestionId = await ensureQuestion(
    'History test: 1 answer', 11,
    [{ answer: YES, bond: ethers.utils.parseEther('0.001'), maxPrev: 0 }]
  );

  const twoAnswerQuestionId = await ensureQuestion(
    'History test: 2 answers', 12,
    [
      { answer: YES, bond: ethers.utils.parseEther('0.001'), maxPrev: 0 },
      { answer: NO,  bond: ethers.utils.parseEther('0.002'), maxPrev: ethers.utils.parseEther('0.001') },
    ]
  );

  return { oneAnswerQuestionId, twoAnswerQuestionId };
}

// Creates a question whose opening_ts is 30 days in the future from when
// the fixture runs, so isBeforeOpeningDate() returns true in the browser.
export async function createUpcomingQuestionFixtures() {
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.utils.parseEther('0.001');
  // 30 days from now in the test runner's clock — safely after the browser clock
  // no matter when the suite runs, without hard-coding a specific date.
  const openingTs = Math.floor(Date.now() / 1000) + 30 * 86400;

  // nonce=13 — nonces 0-12 on v3.0 are already taken
  const questionId = computeQuestionId(
    TEMPLATE.bool, openingTs, 'Upcoming test: future opening',
    ethers.constants.AddressZero, 60, 13,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  if (ethers.BigNumber.from(existing[0]).eq(0)) {
    await (await reality.askQuestion(
      TEMPLATE.bool, 'Upcoming test: future opening',
      ethers.constants.AddressZero, 60, openingTs, 13,
      { value: bounty }
    )).wait();
  }

  return { questionId, openingTs };
}

// v2.1 question ID uses a shorter packed hash than v3.0 (no min_bond or contract address).
function computeQuestionIdV21(templateId, openingTs, question, arbitrator, timeout, nonce, sender) {
  const contentHash = ethers.utils.solidityKeccak256(
    ['uint256', 'uint32', 'string'],
    [templateId, openingTs, question]
  );
  return ethers.utils.solidityKeccak256(
    ['bytes32', 'address', 'uint32', 'address', 'uint256'],
    [contentHash, arbitrator, timeout, sender, nonce]
  );
}

export async function createVisibilityFixtures() {
  const DELIMITER = '␟'; // U+241F
  const provider = new ethers.providers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.Wallet(TEST_ACCOUNT.privateKey, provider);
  const bounty = ethers.utils.parseEther('0.001');
  const timeout = 60;
  const openingTs = 0;

  // ── v2.1 questions (bool and uint) ──────────────────────────────────────────
  // v2.1 has no "answered too soon" option (requires contract version >= 3).
  // v2.1 also requires a non-zero arbitrator (unlike v3 which accepts address(0)).
  // We use the Kleros proxy address — it's deployed on the fork and satisfies the check.
  // Nonces 0 and 1 on the v2.1 contract; no other fixture uses that contract.
  const realityV21 = new ethers.Contract(CONTRACTS.realityEth21, REALITY_ETH_V21_ABI, wallet);
  const V21_ARBITRATOR = CONTRACTS.klerosArbitrator;

  async function ensureV21(templateId, questionText, nonce) {
    const questionId = computeQuestionIdV21(
      templateId, openingTs, questionText,
      V21_ARBITRATOR, timeout, nonce, TEST_ACCOUNT.address
    );
    const existing = await realityV21.questions(questionId);
    if (ethers.BigNumber.from(existing[0]).eq(0)) {
      const tx = await realityV21.askQuestion(
        templateId, questionText, V21_ARBITRATOR,
        timeout, openingTs, nonce, { value: bounty }
      );
      await tx.wait();
    }
    return questionId;
  }

  const v21BoolId = await ensureV21(0, 'Visibility test: v2.1 bool', 0);
  const v21UintId = await ensureV21(1, 'Visibility test: v2.1 uint', 1);

  // ── v3.0 question with has_invalid:false custom template ─────────────────────
  // The template embeds "has_invalid": false so the dapp hides the invalid option.
  // We use queryFilter on LogNewTemplate to find the template if it already exists,
  // avoiding a duplicate-creation revert on repeated test runs.
  const realityV30 = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);
  const NO_INVALID_TEMPLATE_CONTENT =
    '{"title": "%s", "type": "bool", "has_invalid": false, "category": "%s", "lang": "%s"}';

  let noInvalidTemplateId;
  const existingTemplates = await realityV30.queryFilter(
    realityV30.filters.LogNewTemplate(null, TEST_ACCOUNT.address),
    FORK_BLOCK
  );
  const existing = existingTemplates.find(
    e => e.args.question_text === NO_INVALID_TEMPLATE_CONTENT
  );
  if (existing) {
    noInvalidTemplateId = existing.args.template_id.toNumber();
  } else {
    const tx = await realityV30.createTemplate(NO_INVALID_TEMPLATE_CONTENT);
    const receipt = await tx.wait();
    const logTopic = realityV30.interface.getEventTopic('LogNewTemplate');
    const log = receipt.logs.find(l => l.topics[0] === logTopic);
    noInvalidTemplateId = realityV30.interface.parseLog(log).args.template_id.toNumber();
  }

  // Question text for the 3-placeholder template: title ␟ category ␟ lang
  const noInvalidQuestionText = `Visibility test: has_invalid false${DELIMITER}misc${DELIMITER}en_US`;
  // nonce 9 on v3.0 — nonces 0-8 are already used by other fixture functions
  const noInvalidBoolId = await (async () => {
    const questionId = computeQuestionId(
      noInvalidTemplateId, openingTs, noInvalidQuestionText,
      ethers.constants.AddressZero, timeout, 9,
      TEST_ACCOUNT.address, CONTRACTS.realityEth30
    );
    const existingQ = await realityV30.questions(questionId);
    if (ethers.BigNumber.from(existingQ[0]).eq(0)) {
      const tx = await realityV30.askQuestion(
        noInvalidTemplateId, noInvalidQuestionText, ethers.constants.AddressZero,
        timeout, openingTs, 9, { value: bounty }
      );
      await tx.wait();
    }
    return questionId;
  })();

  return { v21BoolId, v21UintId, noInvalidBoolId };
}
