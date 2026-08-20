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
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));

  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const timeout = 60;
  const openingTs = 0;
  const nonce = 0;
  const question = 'Will this test pass?';

  // nonce=0 — deterministically compute the ID so we can guard against re-creation
  // on stale Anvil instances (same pattern as all other createXxxFixtures functions).
  const questionId = computeQuestionId(
    TEMPLATE.bool, openingTs, question,
    ethers.ZeroAddress, timeout, nonce,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  if (!alreadyExists) {
    const tx = await reality.askQuestion(
      TEMPLATE.bool, question,
      ethers.ZeroAddress, timeout, openingTs, nonce,
      { value: ethers.parseEther('0.001') }
    );
    await tx.wait();
  }

  return {
    boolQuestionId: questionId,
    reality,
    wallet,
    provider,
    timeout,
  };
}

// Compute reality.eth v3.0 question ID deterministically (matches contract logic).
// minBond defaults to 0 (askQuestion); pass a BigNumber for askQuestionWithMinBond.
function computeQuestionId(templateId, openingTs, question, arbitrator, timeout, nonce, sender, contractAddress, minBond = 0) {
  const contentHash = ethers.solidityPackedKeccak256(
    ['uint256', 'uint32', 'string'],
    [templateId, openingTs, question]
  );
  return ethers.solidityPackedKeccak256(
    ['bytes32', 'address', 'uint32', 'uint256', 'address', 'address', 'uint256'],
    [contentHash, arbitrator, timeout, minBond, contractAddress, sender, nonce]
  );
}

export async function createCommitRevealFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  // nonce=2 avoids collision with createFixtures (nonce=0) and createClaimFixtures (nonce=1)
  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Will this test pass?',
    ethers.ZeroAddress, 60, 2,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  if (!alreadyExists) {
    const tx = await reality.askQuestion(
      TEMPLATE.bool, 'Will this test pass?',
      ethers.ZeroAddress, 60, 0, 2,
      { value: ethers.parseEther('0.001') }
    );
    await tx.wait();
  }

  return { boolQuestionId: questionId };
}

export async function createKlerosFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond = ethers.parseEther('0.001');
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
  const alreadyExists = BigInt(existing[0]) !== 0n;

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
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);
  const bounty = ethers.parseEther('0.001');
  // No answer submitted in these fixtures, so finalization_ts stays 0 and
  // isFinalized() (which checks browser clock) returns false regardless of timeout.
  const timeout = 60;
  const openingTs = 0;

  async function ensure(templateId, questionText, nonce) {
    const questionId = computeQuestionId(
      templateId, openingTs, questionText,
      ethers.ZeroAddress, timeout, nonce,
      TEST_ACCOUNT.address, CONTRACTS.realityEth30
    );
    const existing = await reality.questions(questionId);
    if (BigInt(existing[0]) === 0n) {
      const tx = await reality.askQuestion(
        templateId, questionText, ethers.ZeroAddress,
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
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond = ethers.parseEther('0.001');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';

  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Will this claim test pass?',
    ethers.ZeroAddress, 60, 1,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  // Only create if not already on-chain (beforeAll may run twice on worker restart)
  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n; // content_hash != 0

  if (!alreadyExists) {
    const tx1 = await reality.askQuestion(
      TEMPLATE.bool, 'Will this claim test pass?',
      ethers.ZeroAddress, 60, 0, 1,
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
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty    = ethers.parseEther('0.001');
  const initBond  = ethers.parseEther('0.001');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const TIMEOUT_90_DAYS = 7776000; // 90 * 24 * 3600

  // nonce=10 — nonces 0-9 on v3.0 are taken by other fixture functions
  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Bond escalation test: bool',
    ethers.ZeroAddress, TIMEOUT_90_DAYS, 10,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  if (!alreadyExists) {
    const tx1 = await reality.askQuestion(
      TEMPLATE.bool, 'Bond escalation test: bool',
      ethers.ZeroAddress, TIMEOUT_90_DAYS, 0, 10,
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
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const NO  = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const TIMEOUT_90_DAYS = 7776000;

  // nonces 11 and 12 — nonces 0-10 on v3.0 are already taken
  async function ensureQuestion(text, nonce, submits) {
    const questionId = computeQuestionId(
      TEMPLATE.bool, 0, text,
      ethers.ZeroAddress, TIMEOUT_90_DAYS, nonce,
      TEST_ACCOUNT.address, CONTRACTS.realityEth30
    );
    const existing = await reality.questions(questionId);
    if (BigInt(existing[0]) !== 0n) return questionId; // already exists

    await (await reality.askQuestion(
      TEMPLATE.bool, text, ethers.ZeroAddress,
      TIMEOUT_90_DAYS, 0, nonce, { value: bounty }
    )).wait();
    for (const { answer, bond, maxPrev } of submits) {
      await (await reality.submitAnswer(
        questionId, answer, maxPrev, { value: bond, gasLimit: 300000n }
      )).wait();
    }
    return questionId;
  }

  const oneAnswerQuestionId = await ensureQuestion(
    'History test: 1 answer', 11,
    [{ answer: YES, bond: ethers.parseEther('0.001'), maxPrev: 0 }]
  );

  const twoAnswerQuestionId = await ensureQuestion(
    'History test: 2 answers', 12,
    [
      { answer: YES, bond: ethers.parseEther('0.001'), maxPrev: 0 },
      { answer: NO,  bond: ethers.parseEther('0.002'), maxPrev: ethers.parseEther('0.001') },
    ]
  );

  return { oneAnswerQuestionId, twoAnswerQuestionId };
}

// Creates a question whose opening_ts is 30 days in the future from when
// the fixture runs, so isBeforeOpeningDate() returns true in the browser.
export async function createUpcomingQuestionFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  // 30 days from now in the test runner's clock — safely after the browser clock
  // no matter when the suite runs, without hard-coding a specific date.
  const openingTs = Math.floor(Date.now() / 1000) + 30 * 86400;

  // nonce=13 — nonces 0-12 on v3.0 are already taken
  const questionId = computeQuestionId(
    TEMPLATE.bool, openingTs, 'Upcoming test: future opening',
    ethers.ZeroAddress, 60, 13,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  if (BigInt(existing[0]) === 0n) {
    await (await reality.askQuestion(
      TEMPLATE.bool, 'Upcoming test: future opening',
      ethers.ZeroAddress, 60, openingTs, 13,
      { value: bounty }
    )).wait();
  }

  return { questionId, openingTs };
}

// Creates an unanswered v3.0 bool question with min_bond = 0.002 ETH.
// Used to test that the dapp pre-fills the bond field with min_bond and that
// keyup validation enforces the floor even with no current best bond.
export async function createMinBondFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty  = ethers.parseEther('0.001');
  const minBond = ethers.parseEther('0.002');
  const TIMEOUT_90_DAYS = 7776000; // 90 * 24 * 3600

  // nonce=14 — nonces 0-13 on v3.0 are already taken
  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Min bond test: bool',
    ethers.ZeroAddress, TIMEOUT_90_DAYS, 14,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30, minBond
  );

  const existing = await reality.questions(questionId);
  if (BigInt(existing[0]) === 0n) {
    await (await reality.askQuestionWithMinBond(
      TEMPLATE.bool, 'Min bond test: bool',
      ethers.ZeroAddress, TIMEOUT_90_DAYS, 0, 14, minBond,
      { value: bounty }
    )).wait();
  }

  return { questionId, minBond };
}

// Creates a v3.0 bool question finalized with "Answered Too Soon" so the dapp
// classifies it as reopenable.  The 60s timeout combined with the fork block
// timestamp (~June 9 2026) ensures isFinalized() returns true against the
// browser clock (~June 11 2026) immediately on page load.
export async function createReopenFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond   = ethers.parseEther('0.001');
  // bytes32(uint(-2)) — the "Answered Too Soon" sentinel value
  const ANSWERED_TOO_SOON = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';

  // nonce=15 — nonces 0-14 on v3.0 are already taken
  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Reopen test: bool',
    ethers.ZeroAddress, 60, 15,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  if (!alreadyExists) {
    await (await reality.askQuestion(
      TEMPLATE.bool, 'Reopen test: bool',
      ethers.ZeroAddress, 60, 0, 15,
      { value: bounty }
    )).wait();

    await (await reality.submitAnswer(
      questionId, ANSWERED_TOO_SOON, 0, { value: bond }
    )).wait();

    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);
  }

  return { questionId };
}

// v2.1 question ID uses a shorter packed hash than v3.0 (no min_bond or contract address).
function computeQuestionIdV21(templateId, openingTs, question, arbitrator, timeout, nonce, sender) {
  const contentHash = ethers.solidityPackedKeccak256(
    ['uint256', 'uint32', 'string'],
    [templateId, openingTs, question]
  );
  return ethers.solidityPackedKeccak256(
    ['bytes32', 'address', 'uint32', 'address', 'uint256'],
    [contentHash, arbitrator, timeout, sender, nonce]
  );
}

export async function createVisibilityFixtures() {
  const DELIMITER = '␟'; // U+241F
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const bounty = ethers.parseEther('0.001');
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
    if (BigInt(existing[0]) === 0n) {
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
    noInvalidTemplateId = Number(existing.args.template_id);
  } else {
    const tx = await realityV30.createTemplate(NO_INVALID_TEMPLATE_CONTENT);
    const receipt = await tx.wait();
    const logTopic = realityV30.interface.getEvent('LogNewTemplate').topicHash;
    const log = receipt.logs.find(l => l.topics[0] === logTopic);
    noInvalidTemplateId = Number(realityV30.interface.parseLog(log).args.template_id);
  }

  // Question text for the 3-placeholder template: title ␟ category ␟ lang
  const noInvalidQuestionText = `Visibility test: has_invalid false${DELIMITER}misc${DELIMITER}en_US`;
  // nonce 9 on v3.0 — nonces 0-8 are already used by other fixture functions
  const noInvalidBoolId = await (async () => {
    const questionId = computeQuestionId(
      noInvalidTemplateId, openingTs, noInvalidQuestionText,
      ethers.ZeroAddress, timeout, 9,
      TEST_ACCOUNT.address, CONTRACTS.realityEth30
    );
    const existingQ = await realityV30.questions(questionId);
    if (BigInt(existingQ[0]) === 0n) {
      const tx = await realityV30.askQuestion(
        noInvalidTemplateId, noInvalidQuestionText, ethers.ZeroAddress,
        timeout, openingTs, 9, { value: bounty }
      );
      await tx.wait();
    }
    return questionId;
  })();

  return { v21BoolId, v21UintId, noInvalidBoolId, noInvalidTemplateId };
}

// Creates a finalized single-select question with outcomes "Cat", "Dog", "Fish"
// where the submitted answer is "Dog" (index 1).  Used to verify the finalized
// options list is displayed with the winning outcome marked.
// nonce=16 — nonces 0-15 on v3.0 are taken by other fixture functions.
export async function createFinalizedSelectFixtures() {
  const DELIMITER = '␟'; // U+241F
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond   = ethers.parseEther('0.001');
  const timeout = 60;
  const OUTCOMES = '"Cat","Dog","Fish"';
  const questionText = `Finalized select test: single-select${DELIMITER}${OUTCOMES}`;
  // bytes32(1) = index 1 = "Dog"
  const DOG = '0x0000000000000000000000000000000000000000000000000000000000000001';

  const questionId = computeQuestionId(
    2, 0, questionText,
    ethers.ZeroAddress, timeout, 16,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  if (BigInt(existing[0]) === 0n) {
    await (await reality.askQuestion(
      2, questionText, ethers.ZeroAddress, timeout, 0, 16, { value: bounty }
    )).wait();
    await (await reality.submitAnswer(questionId, DOG, 0, { value: bond })).wait();
    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);
  }

  return { questionId, answer: DOG };
}

// Creates a finalized multiple-select question with outcomes "Cat", "Dog", "Fish"
// where Cat (index 0) and Fish (index 2) are selected (bitmask = 0b101 = 5).
// Used to verify the bitmask-based winner marking in the finalized options list.
// nonce=18 — nonces 0-17 on v3.0 are taken by other fixture functions.
export async function createFinalizedMultiSelectFixtures() {
  const DELIMITER = '␟'; // U+241F
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond   = ethers.parseEther('0.001');
  const timeout = 60;
  const OUTCOMES = '"Cat","Dog","Fish"';
  const questionText = `Finalized multi-select test: multiple-select${DELIMITER}${OUTCOMES}`;
  // Bitmask: bit 0 (Cat) + bit 2 (Fish) = 0b101 = 5
  const CAT_AND_FISH = '0x0000000000000000000000000000000000000000000000000000000000000005';

  const questionId = computeQuestionId(
    3, 0, questionText,
    ethers.ZeroAddress, timeout, 18,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  if (BigInt(existing[0]) === 0n) {
    await (await reality.askQuestion(
      3, questionText, ethers.ZeroAddress, timeout, 0, 18, { value: bounty }
    )).wait();
    await (await reality.submitAnswer(questionId, CAT_AND_FISH, 0, { value: bond })).wait();
    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);
  }

  return { questionId, answer: CAT_AND_FISH };
}

// Creates a custom markdown-format bool question.  The title contains **bold**
// syntax so tests can assert that <strong> is present (rendered) rather than
// raw ** asterisks (not rendered).
// nonce=19 — nonces 0-18 on v3.0 are taken by other fixture functions.
export async function createMarkdownFixtures() {
  const DELIMITER = '␟';
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const timeout = 60;
  const openingTs = 0;

  const MARKDOWN_TEMPLATE =
    '{"title": "%s", "type": "bool", "format": "text/markdown", "category": "%s", "lang": "%s"}';

  // Find or create the markdown template (idempotent across test runs)
  let templateId;
  const existingTemplates = await reality.queryFilter(
    reality.filters.LogNewTemplate(null, TEST_ACCOUNT.address),
    FORK_BLOCK
  );
  const existingTpl = existingTemplates.find(e => e.args.question_text === MARKDOWN_TEMPLATE);
  if (existingTpl) {
    templateId = Number(existingTpl.args.template_id);
  } else {
    const tx = await reality.createTemplate(MARKDOWN_TEMPLATE);
    const receipt = await tx.wait();
    const logTopic = reality.interface.getEvent('LogNewTemplate').topicHash;
    const log = receipt.logs.find(l => l.topics[0] === logTopic);
    templateId = Number(reality.interface.parseLog(log).args.template_id);
  }

  const questionText = `Will **bold text** render correctly?${DELIMITER}misc${DELIMITER}en_US`;
  const questionId = computeQuestionId(
    templateId, openingTs, questionText,
    ethers.ZeroAddress, timeout, 19,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existingQ = await reality.questions(questionId);
  if (BigInt(existingQ[0]) === 0n) {
    await (await reality.askQuestion(
      templateId, questionText, ethers.ZeroAddress,
      timeout, openingTs, 19, { value: bounty }
    )).wait();
  }

  return { questionId, templateId, questionText, markdownTemplate: MARKDOWN_TEMPLATE };
}

// Creates a bool question (21-day timeout) with a single unrevealed commitment.
// The reveal deadline is timeout/8 ≈ 2.6 days after the fork block (Jun 9 2026),
// which is already past relative to the browser clock (~Jun 16 2026).  The question
// itself appears open because finalization_ts = fork_ts + 21 days ≈ Jun 30.
// Used to verify "pending reveal · deadline passed" is suppressed from the banner.
// nonce=17 — nonces 0-16 on v3.0 are taken by other fixture functions.
export async function createExpiredCommitFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const TIMEOUT_21_DAYS = 21 * 24 * 3600;
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const commitNonce = 99999n;
  const commitmentHash = ethers.solidityPackedKeccak256(
    ['uint256', 'uint256'], [YES, commitNonce]
  );

  const questionId = computeQuestionId(
    0, 0, 'Commit-reveal display test: expired commit',
    ethers.ZeroAddress, TIMEOUT_21_DAYS, 17,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  if (BigInt(existing[0]) === 0n) {
    await (await reality.askQuestion(
      0, 'Commit-reveal display test: expired commit',
      ethers.ZeroAddress, TIMEOUT_21_DAYS, 0, 17,
      { value: ethers.parseEther('0.001') }
    )).wait();
    await (await reality.submitAnswerCommitment(
      questionId, commitmentHash, 0, ethers.ZeroAddress,
      { value: ethers.parseEther('0.001') }
    )).wait();
  }

  return { questionId };
}

// Creates four uint questions using custom templates with non-standard decimal counts.
// Two questions have submitted answers (for display tests) and two are unanswered
// (for calldata/encoding tests, so the form doesn't require a doubled bond).
//
// Display tests:
//   dec2AnsweredId  — decimals=2, answer=350 → display "3.5"  (the bug: was 350/10^18)
//   dec0AnsweredId  — decimals=0, answer=42  → display "42"
// Calldata tests (no existing answer, so min bond = question bounty):
//   dec2OpenId      — decimals=2, no answer  → typing "3.5" encodes as bytes32(350)
//   dec0OpenId      — decimals=0, no answer  → typing "42"  encodes as bytes32(42)
//
// nonces 20–23 — nonces 0–19 on v3.0 are taken by other fixture functions.
export async function createUintDecimalsFixtures() {
  const DELIMITER = '␟';
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty  = ethers.parseEther('0.001');
  const bond    = ethers.parseEther('0.001');
  // Answered questions need a long timeout so finalize_ts (fork + timeout) is
  // still in the future relative to the browser clock, matching the pattern used
  // by createBondEscalationFixtures.  Open (unanswered) questions can use 60s.
  const TIMEOUT_90_DAYS = 7776000;
  const timeout = 60;
  const openingTs = 0;

  const DECIMALS2_TEMPLATE = '{"title": "%s", "type": "uint", "decimals": 2, "category": "%s", "lang": "%s"}';
  const DECIMALS0_TEMPLATE = '{"title": "%s", "type": "uint", "decimals": 0, "category": "%s", "lang": "%s"}';

  // Find-or-create a template (idempotent across test runs on the same fork).
  const existingTemplates = await reality.queryFilter(
    reality.filters.LogNewTemplate(null, TEST_ACCOUNT.address),
    FORK_BLOCK
  );
  async function findOrCreateTemplate(content) {
    const hit = existingTemplates.find(e => e.args.question_text === content);
    if (hit) return Number(hit.args.template_id);
    const tx = await reality.createTemplate(content);
    const receipt = await tx.wait();
    const logTopic = reality.interface.getEvent('LogNewTemplate').topicHash;
    const log = receipt.logs.find(l => l.topics[0] === logTopic);
    return Number(reality.interface.parseLog(log).args.template_id);
  }

  const dec2TemplateId = await findOrCreateTemplate(DECIMALS2_TEMPLATE);
  const dec0TemplateId = await findOrCreateTemplate(DECIMALS0_TEMPLATE);

  // 350 as bytes32 = "3.5" when decimals=2; 42 as bytes32 = "42" when decimals=0.
  const ANSWER_350 = '0x000000000000000000000000000000000000000000000000000000000000015e';
  const ANSWER_42  = '0x000000000000000000000000000000000000000000000000000000000000002a';

  function makeId(templateId, questionText, nonce, t) {
    return computeQuestionId(
      templateId, openingTs, questionText,
      ethers.ZeroAddress, t, nonce,
      TEST_ACCOUNT.address, CONTRACTS.realityEth30
    );
  }

  const text2Answered = `Decimals display test: 2 decimal places${DELIMITER}misc${DELIMITER}en_US`;
  const text0Answered = `Decimals display test: 0 decimal places${DELIMITER}misc${DELIMITER}en_US`;
  const text2Open     = `Decimals calldata test: 2 decimal places${DELIMITER}misc${DELIMITER}en_US`;
  const text0Open     = `Decimals calldata test: 0 decimal places${DELIMITER}misc${DELIMITER}en_US`;

  // Answered questions use 90-day timeout so finalize_ts (fork_ts + 90 days) is
  // still in the future relative to the browser clock — same pattern as createBondEscalationFixtures.
  const dec2AnsweredId = makeId(dec2TemplateId, text2Answered, 20, TIMEOUT_90_DAYS);
  const dec0AnsweredId = makeId(dec0TemplateId, text0Answered, 21, TIMEOUT_90_DAYS);
  const dec2OpenId     = makeId(dec2TemplateId, text2Open,     22, timeout);
  const dec0OpenId     = makeId(dec0TemplateId, text0Open,     23, timeout);

  async function ensureQuestion(templateId, questionText, nonce, questionId, t, answer) {
    const existing = await reality.questions(questionId);
    if (BigInt(existing[0]) !== 0n) return; // already on-chain
    await (await reality.askQuestion(
      templateId, questionText, ethers.ZeroAddress,
      t, openingTs, nonce, { value: bounty }
    )).wait();
    if (answer) {
      await (await reality.submitAnswer(questionId, answer, 0, { value: bond })).wait();
    }
  }

  await ensureQuestion(dec2TemplateId, text2Answered, 20, dec2AnsweredId, TIMEOUT_90_DAYS, ANSWER_350);
  await ensureQuestion(dec0TemplateId, text0Answered, 21, dec0AnsweredId, TIMEOUT_90_DAYS, ANSWER_42);
  await ensureQuestion(dec2TemplateId, text2Open,     22, dec2OpenId,     timeout,         null);
  await ensureQuestion(dec0TemplateId, text0Open,     23, dec0OpenId,     timeout,         null);

  return { dec2AnsweredId, dec0AnsweredId, dec2OpenId, dec0OpenId };
}

// Creates a bool question that is answered YES and finalized on-chain, but returns
// stale Ponder data (question creation known, answer events not indexed).
// Used to test that verifyWithRpc fills the gap when the indexer lags.
// nonce=25 — nonces 0–24 on v3.0 are taken by other fixture functions.
export async function createPonderLagFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond   = ethers.parseEther('0.001');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const timeout = 60;

  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Indexer lag test: answered but not indexed',
    ethers.ZeroAddress, timeout, 25,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  let createdBlock;
  if (!alreadyExists) {
    const receipt1 = await (await reality.askQuestion(
      TEMPLATE.bool, 'Indexer lag test: answered but not indexed',
      ethers.ZeroAddress, timeout, 0, 25,
      { value: bounty }
    )).wait();
    createdBlock = receipt1.blockNumber;
    await (await reality.submitAnswer(questionId, YES, 0, { value: bond })).wait();
    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);
  } else {
    const creationEvents = await reality.queryFilter(
      reality.filters.LogNewQuestion(questionId), FORK_BLOCK
    );
    createdBlock = creationEvents[0]?.blockNumber ?? FORK_BLOCK + 1;
  }

  const stalePonderData = {
    question: {
      templateId: '0',
      data: 'Indexer lag test: answered but not indexed',
      title: 'Indexer lag test: answered but not indexed',
      type: 'bool',
      category: '',
      lang: 'en_US',
      outcomes: null,
      creator: TEST_ACCOUNT.address.toLowerCase(),
      arbitrator: ethers.ZeroAddress.toLowerCase(),
      openingTimestamp: '0',
      timeout: String(timeout),
      currentAnswer: null,
      currentAnswerBond: '0',
      minBond: '0',
      bounty: bounty.toString(),
      scheduledFinalizationTimestamp: '0',
      arbitrationOccurred: false,
      isPendingArbitration: false,
      createdBlock: String(createdBlock),
      createdLogIndex: '0',
      createdTxHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      reopensQuestionId: null,
    },
    responses: { items: [] },
    claims:    { items: [] },
    reopeners: { items: [] },
  };

  return { questionId, stalePonderData };
}

// Creates an open bool question with 2 YES answers at escalating bonds (0.001 then 0.002)
// where Ponder's stale data only has the first answer indexed.
// The best_answer is the same bytes32 value in both Ponder and on-chain, so the
// bestAnswer comparison in verifyWithRpc won't trigger — only the historyHash mismatch
// (which now sets needsEventFetch) will catch the discrepancy.
// nonce=26 — nonces 0–25 on v3.0 are taken by other fixture functions.
export async function createPartialIndexerLagFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty    = ethers.parseEther('0.001');
  const bond1     = ethers.parseEther('0.001');
  const bond2     = ethers.parseEther('0.002');
  const YES = '0x0000000000000000000000000000000000000000000000000000000000000001';
  // 90-day timeout keeps the question open from the browser clock so the
  // historyHash check runs (it skips finalized questions).
  const TIMEOUT_90_DAYS = 7776000;

  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Partial indexer lag test: same answer re-escalated',
    ethers.ZeroAddress, TIMEOUT_90_DAYS, 26,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  let createdBlock, firstAnswerBlock, firstAnswerTs;
  if (!alreadyExists) {
    const receipt1 = await (await reality.askQuestion(
      TEMPLATE.bool, 'Partial indexer lag test: same answer re-escalated',
      ethers.ZeroAddress, TIMEOUT_90_DAYS, 0, 26,
      { value: bounty }
    )).wait();
    createdBlock = receipt1.blockNumber;

    const receipt2 = await (await reality.submitAnswer(questionId, YES, 0, { value: bond1 })).wait();
    firstAnswerBlock = receipt2.blockNumber;
    const block2 = await provider.getBlock(receipt2.blockNumber);
    firstAnswerTs = block2.timestamp;

    await (await reality.submitAnswer(questionId, YES, bond1, { value: bond2 })).wait();
  } else {
    const creationEvents = await reality.queryFilter(
      reality.filters.LogNewQuestion(questionId), FORK_BLOCK
    );
    createdBlock = creationEvents[0]?.blockNumber ?? FORK_BLOCK + 1;
    const answerEvents = await reality.queryFilter(
      reality.filters.LogNewAnswer(null, questionId), FORK_BLOCK
    );
    firstAnswerBlock = answerEvents[0]?.blockNumber ?? createdBlock + 1;
    const blk = await provider.getBlock(firstAnswerBlock);
    firstAnswerTs = blk?.timestamp ?? 0;
  }

  // historyHash for a single YES answer — what the stale Ponder would have computed
  const firstHistoryHash = ethers.solidityPackedKeccak256(
    ['bytes32', 'bytes32', 'uint256', 'address', 'bool'],
    [ethers.ZeroHash, YES, bond1, TEST_ACCOUNT.address, false]
  );

  // Stale Ponder: knows about question and first answer, but not the second.
  const stalePonderData = {
    question: {
      templateId: '0',
      data: 'Partial indexer lag test: same answer re-escalated',
      title: 'Partial indexer lag test: same answer re-escalated',
      type: 'bool',
      category: '',
      lang: 'en_US',
      outcomes: null,
      creator: TEST_ACCOUNT.address.toLowerCase(),
      arbitrator: ethers.ZeroAddress.toLowerCase(),
      openingTimestamp: '0',
      timeout: String(TIMEOUT_90_DAYS),
      currentAnswer: YES,
      currentAnswerBond: bond1.toString(),
      minBond: '0',
      bounty: bounty.toString(),
      scheduledFinalizationTimestamp: String(firstAnswerTs + TIMEOUT_90_DAYS),
      arbitrationOccurred: false,
      isPendingArbitration: false,
      createdBlock: String(createdBlock),
      createdLogIndex: '0',
      createdTxHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      reopensQuestionId: null,
    },
    responses: {
      items: [{
        answer: YES,
        commitmentHash: null,
        bond: bond1.toString(),
        user: TEST_ACCOUNT.address.toLowerCase(),
        historyHash: firstHistoryHash,
        isCommitment: false,
        isUnrevealed: false,
        timestamp: String(firstAnswerTs),
        createdBlock: String(firstAnswerBlock),
        createdLogIndex: '0',
        createdTxHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      }],
    },
    claims:    { items: [] },
    reopeners: { items: [] },
  };

  return { questionId, stalePonderData, bond1, bond2 };
}

// Creates a finalized bool question answered "No" (bytes32(0) = ZERO_HASH) where
// Ponder's stale data has 0 response events.  This is the hardest indexer-lag case:
// best_answer === ZERO_HASH is indistinguishable from "unanswered" by value alone,
// so the standard bestAnswer mismatch check won't fire — only historyHash catches it.
// nonce=27 — nonces 0–26 on v3.0 are taken by other fixture functions.
export async function createNoAnswerLagFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond   = ethers.parseEther('0.001');
  const NO     = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const timeout = 60;

  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Indexer lag test: No answer not indexed',
    ethers.ZeroAddress, timeout, 27,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  let createdBlock;
  if (!alreadyExists) {
    const receipt1 = await (await reality.askQuestion(
      TEMPLATE.bool, 'Indexer lag test: No answer not indexed',
      ethers.ZeroAddress, timeout, 0, 27,
      { value: bounty }
    )).wait();
    createdBlock = receipt1.blockNumber;
    await (await reality.submitAnswer(questionId, NO, 0, { value: bond })).wait();
    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);
  } else {
    const creationEvents = await reality.queryFilter(
      reality.filters.LogNewQuestion(questionId), FORK_BLOCK
    );
    createdBlock = creationEvents[0]?.blockNumber ?? FORK_BLOCK + 1;
  }

  const stalePonderData = {
    question: {
      templateId: '0',
      data: 'Indexer lag test: No answer not indexed',
      title: 'Indexer lag test: No answer not indexed',
      type: 'bool',
      category: '',
      lang: 'en_US',
      outcomes: null,
      creator: TEST_ACCOUNT.address.toLowerCase(),
      arbitrator: ethers.ZeroAddress.toLowerCase(),
      openingTimestamp: '0',
      timeout: String(timeout),
      currentAnswer: null,
      currentAnswerBond: '0',
      minBond: '0',
      bounty: bounty.toString(),
      scheduledFinalizationTimestamp: '0',
      arbitrationOccurred: false,
      isPendingArbitration: false,
      createdBlock: String(createdBlock),
      createdLogIndex: '0',
      createdTxHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      reopensQuestionId: null,
    },
    responses: { items: [] },
    claims:    { items: [] },
    reopeners: { items: [] },
  };

  return { questionId, stalePonderData };
}

// Creates a bool question answered "No" (bytes32(0)) that has been FULLY CLAIMED,
// so history_hash is rewound to ZERO_HASH by claimWinnings.  With Ponder returning
// 0 events, the historyHash check sees computed=ZERO_HASH vs onchain=ZERO_HASH → match,
// so it can't detect the lag.  Only bond > 0 reveals that an answer exists.
// nonce=28 — nonces 0–27 on v3.0 are taken by other fixture functions.
export async function createClaimedNoAnswerLagFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond   = ethers.parseEther('0.001');
  const NO     = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const timeout = 60;

  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Indexer lag test: claimed No answer not indexed',
    ethers.ZeroAddress, timeout, 28,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  let createdBlock;
  if (!alreadyExists) {
    const receipt1 = await (await reality.askQuestion(
      TEMPLATE.bool, 'Indexer lag test: claimed No answer not indexed',
      ethers.ZeroAddress, timeout, 0, 28,
      { value: bounty }
    )).wait();
    createdBlock = receipt1.blockNumber;

    await (await reality.submitAnswer(questionId, NO, 0, { value: bond })).wait();
    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);

    // Call claimWinnings to rewind history_hash to ZERO_HASH.
    // For a single answer, the array has one entry: the history before it (ZERO_HASH = empty chain).
    await (await reality.claimWinnings(
      questionId,
      [ethers.ZeroHash],           // history_hash before the only answer = initial = ZERO_HASH
      [TEST_ACCOUNT.address],      // the answerer
      [bond],                       // the bond submitted
      [NO]                         // the answer = "No" = bytes32(0)
    )).wait();
  } else {
    const creationEvents = await reality.queryFilter(
      reality.filters.LogNewQuestion(questionId), FORK_BLOCK
    );
    createdBlock = creationEvents[0]?.blockNumber ?? FORK_BLOCK + 1;
  }

  const stalePonderData = {
    question: {
      templateId: '0',
      data: 'Indexer lag test: claimed No answer not indexed',
      title: 'Indexer lag test: claimed No answer not indexed',
      type: 'bool',
      category: '',
      lang: 'en_US',
      outcomes: null,
      creator: TEST_ACCOUNT.address.toLowerCase(),
      arbitrator: ethers.ZeroAddress.toLowerCase(),
      openingTimestamp: '0',
      timeout: String(timeout),
      currentAnswer: null,
      currentAnswerBond: '0',
      minBond: '0',
      bounty: bounty.toString(),
      scheduledFinalizationTimestamp: '0',
      arbitrationOccurred: false,
      isPendingArbitration: false,
      createdBlock: String(createdBlock),
      createdLogIndex: '0',
      createdTxHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      reopensQuestionId: null,
    },
    responses: { items: [] },
    claims:    { items: [] },
    reopeners: { items: [] },
  };

  return { questionId, stalePonderData };
}

// Creates a bool question answered "No" (bytes32(0)) via commit-reveal that has been FULLY CLAIMED.
// Like createClaimedNoAnswerLagFixtures, but the answer was submitted as a commitment rather than
// a plain submitAnswer.  After claiming, history_hash = ZERO_HASH and bond > 0, but the only
// LogNewAnswer event has is_commitment=true and answer=commitment_id (not the revealed "No").
// Verifies that the background fetch resolves commits via commitments() before rendering.
// nonce=29 — nonces 0–28 on v3.0 are taken by other fixture functions.
export async function createClaimedCommitRevealNoAnswerLagFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond   = ethers.parseEther('0.001');
  const NO         = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const commitNonce = 54321n;
  const timeout = 60;

  // answer_hash = keccak256(answer, nonce) — passed to submitAnswerCommitment
  const answerHash = ethers.solidityPackedKeccak256(['bytes32', 'uint256'], [NO, commitNonce]);

  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'Indexer lag test: claimed commit-reveal No answer not indexed',
    ethers.ZeroAddress, timeout, 29,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  // commitment_id = keccak256(question_id, answer_hash, bond) — stored in history, emitted in LogNewAnswer
  const commitmentId = ethers.solidityPackedKeccak256(
    ['bytes32', 'bytes32', 'uint256'],
    [questionId, answerHash, bond]
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  let createdBlock;
  if (!alreadyExists) {
    const receipt1 = await (await reality.askQuestion(
      TEMPLATE.bool, 'Indexer lag test: claimed commit-reveal No answer not indexed',
      ethers.ZeroAddress, timeout, 0, 29,
      { value: bounty }
    )).wait();
    createdBlock = receipt1.blockNumber;

    await (await reality.submitAnswerCommitment(questionId, answerHash, 0, ethers.ZeroAddress, { value: bond })).wait();
    await (await reality.submitAnswerReveal(questionId, NO, commitNonce, bond)).wait();
    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);

    // claimWinnings: answers array for a commit entry must contain the commitment_id, not the revealed answer
    await (await reality.claimWinnings(
      questionId,
      [ethers.ZeroHash],          // history_hash before the only entry = ZERO_HASH (empty chain)
      [TEST_ACCOUNT.address],     // the answerer
      [bond],                      // the bond submitted
      [commitmentId]              // the commitment_id stored in history (not the revealed answer)
    )).wait();
  } else {
    const creationEvents = await reality.queryFilter(
      reality.filters.LogNewQuestion(questionId), FORK_BLOCK
    );
    createdBlock = creationEvents[0]?.blockNumber ?? FORK_BLOCK + 1;
  }

  const stalePonderData = {
    question: {
      templateId: '0',
      data: 'Indexer lag test: claimed commit-reveal No answer not indexed',
      title: 'Indexer lag test: claimed commit-reveal No answer not indexed',
      type: 'bool',
      category: '',
      lang: 'en_US',
      outcomes: null,
      creator: TEST_ACCOUNT.address.toLowerCase(),
      arbitrator: ethers.ZeroAddress.toLowerCase(),
      openingTimestamp: '0',
      timeout: String(timeout),
      currentAnswer: null,
      currentAnswerBond: '0',
      minBond: '0',
      bounty: bounty.toString(),
      scheduledFinalizationTimestamp: '0',
      arbitrationOccurred: false,
      isPendingArbitration: false,
      createdBlock: String(createdBlock),
      createdLogIndex: '0',
      createdTxHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      reopensQuestionId: null,
    },
    responses: { items: [] },
    claims:    { items: [] },
    reopeners: { items: [] },
  };

  return { questionId, stalePonderData };
}

// Creates a finalized single-select question where the winning answer ("Dog", index 1)
// was submitted via commit-reveal rather than a plain submitAnswer.
// Used to verify the winnerBytes fix: the revealed answer (not the commitment hash)
// must be used to identify the winning option in the finalized options list.
// nonce=24 — nonces 0–23 on v3.0 are taken by other fixture functions.
export async function createCommitRevealSelectFixtures() {
  const DELIMITER = '␟';
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const bounty = ethers.parseEther('0.001');
  const bond   = ethers.parseEther('0.001');
  const timeout = 60;
  const OUTCOMES = '"Cat","Dog","Fish"';
  const questionText = `Finalized commit-reveal select test: single-select${DELIMITER}${OUTCOMES}`;

  // Answer: index 1 = "Dog" = bytes32(1)
  const DOG = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const commitNonce = 42424242n;
  const commitmentHash = ethers.solidityPackedKeccak256(
    ['uint256', 'uint256'], [BigInt(DOG), commitNonce]
  );

  const questionId = computeQuestionId(
    2, 0, questionText,
    ethers.ZeroAddress, timeout, 24,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  if (BigInt(existing[0]) === 0n) {
    await (await reality.askQuestion(
      2, questionText, ethers.ZeroAddress, timeout, 0, 24, { value: bounty }
    )).wait();
    await (await reality.submitAnswerCommitment(
      questionId, commitmentHash, 0, ethers.ZeroAddress, { value: bond }
    )).wait();
    await (await reality.submitAnswerReveal(questionId, DOG, commitNonce, bond)).wait();
    await provider.send('evm_increaseTime', [70]);
    await provider.send('evm_mine', []);
  }

  return { questionId, answer: DOG };
}

// Creates a bool question whose text is properly ␟-encoded so that template
// resolution is meaningful.  Used to verify the account page resolves templates
// from RPC logs and shows the title part only (not the raw encoded string).
// nonce=0 on v3.2 — first fixture to use that contract.
export async function createDescriptionFixtures() {
  const DELIMITER = '␟';
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth32, REALITY_ETH_ABI, wallet);

  const title = 'Description display test question';
  const description = 'This is the description of the question, shown below the title.';
  const questionText = `${title}${DELIMITER}${description}${DELIMITER}en`;

  const questionId = computeQuestionId(
    0, 0, questionText,
    ethers.ZeroAddress, 60, 0,
    TEST_ACCOUNT.address, CONTRACTS.realityEth32
  );

  const existing = await reality.questions(questionId);
  if (BigInt(existing[0]) === 0n) {
    await (await reality.askQuestion(
      0, questionText,
      ethers.ZeroAddress, 60, 0, 0,
      { value: ethers.parseEther('0.001') }
    )).wait();
  }

  return { questionId, title, description, contract: CONTRACTS.realityEth32 };
}

// nonce=30 — nonces 0–29 on v3.0 are taken by other fixture functions.
export async function createAccountTemplateFixtures() {
  const DELIMITER = '␟';
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const title = 'Account template resolution check';
  const questionText = `${title}${DELIMITER}crypto${DELIMITER}en`;

  const questionId = computeQuestionId(
    0, 0, questionText,
    ethers.ZeroAddress, 60, 30,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  const alreadyExists = BigInt(existing[0]) !== 0n;

  if (!alreadyExists) {
    await (await reality.askQuestion(
      0, questionText,
      ethers.ZeroAddress, 60, 0, 30,
      { value: ethers.parseEther('0.001') }
    )).wait();
  }

  return { questionId, title, contract: CONTRACTS.realityEth30 };
}

// Creates a question with a mock arbitrator that returns TOS metadata.
// The mock is deployed via anvil_setCode so no Solidity compilation is needed.
// nonce=31 — nonces 0–30 on v3.0 are taken by other fixture functions.
export async function createTOSFixtures() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  const wallet = new ethers.NonceManager(new ethers.Wallet(TEST_ACCOUNT.privateKey, provider));
  const reality = new ethers.Contract(CONTRACTS.realityEth30, REALITY_ETH_ABI, wallet);

  const MOCK_ARB_ADDR = '0x1234567890123456789012345678901234567890';
  const TOS_META = '{"tos":"ipfs://QmTestTOSHash"}';

  // Build EVM runtime bytecode that unconditionally returns ABI-encoded TOS_META
  // for any call (no function selector dispatch needed for tests).
  const returnData = ethers.AbiCoder.defaultAbiCoder().encode(['string'], [TOS_META]);
  // returnData: 3 × 32-byte words (offset header, length, string bytes)
  const words = [
    returnData.slice(2, 66),    // word0: offset = 32
    returnData.slice(66, 130),  // word1: string length
    returnData.slice(130, 194), // word2: string bytes, right-padded
  ];
  // PUSH32 each word into memory, then RETURN 96 bytes from offset 0
  const bytecode = '0x' + [
    '7f', words[0], '6000', '52', // PUSH32 word0, PUSH1 0x00, MSTORE
    '7f', words[1], '6020', '52', // PUSH32 word1, PUSH1 0x20, MSTORE
    '7f', words[2], '6040', '52', // PUSH32 word2, PUSH1 0x40, MSTORE
    '6060', '6000', 'f3',          // PUSH1 0x60(96), PUSH1 0x00, RETURN
  ].join('');

  await provider.send('anvil_setCode', [MOCK_ARB_ADDR, bytecode]);

  const TIMEOUT_90_DAYS = 7776000;
  const questionId = computeQuestionId(
    TEMPLATE.bool, 0, 'TOS test: arbitrator with terms of service',
    MOCK_ARB_ADDR, TIMEOUT_90_DAYS, 31,
    TEST_ACCOUNT.address, CONTRACTS.realityEth30
  );

  const existing = await reality.questions(questionId);
  if (BigInt(existing[0]) === 0n) {
    await (await reality.askQuestion(
      TEMPLATE.bool, 'TOS test: arbitrator with terms of service',
      MOCK_ARB_ADDR, TIMEOUT_90_DAYS, 0, 31,
      { value: ethers.parseEther('0.001') }
    )).wait();
  }

  return {
    questionId,
    arbAddr: MOCK_ARB_ADDR,
    expectedTosUrl: 'https://ipfs.io/ipfs/QmTestTOSHash',
  };
}
