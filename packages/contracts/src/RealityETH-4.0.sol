// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETHCore} from "./interfaces/IRealityETHCore.sol";
import {BalanceHolder} from "./BalanceHolder.sol";

// solhint-disable-next-line contract-name-camelcase
contract RealityETH_v4_0 is BalanceHolder, IRealityETHCore {
    address private constant NULL_ADDRESS = address(0);

    // History hash when no history is created, or history has been cleared
    bytes32 private constant NULL_HASH = bytes32(0);

    // An unitinalized finalizeTs for a question will indicate an unanswered question.
    uint32 private constant UNANSWERED = 0;

    // Proportion withheld when you claim an earlier bond.
    uint256 private constant BOND_CLAIM_FEE_PROPORTION = 40; // One 40th ie 2.5%

    // Special value representing a question that was answered too soon.
    // bytes32(-2). By convention we use bytes32(-1) for "invalid", although the contract does not handle this.
    bytes32 private constant UNRESOLVED_ANSWER = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe;

    uint256 private nextTemplateID = 0;
    mapping(uint256 templateId => uint256 createdBlock) public templates;
    mapping(uint256 templateId => bytes32 contentHash) public template_hashes;
    mapping(bytes32 questionId => Question question) public questions;
    mapping(bytes32 questionId => Claim claim) public question_claims;
    mapping(address arbitrator => uint256 fee) public arbitrator_question_fees;
    mapping(bytes32 reopenedQuestionId => bytes32 replacementQuestionId) public reopened_questions;
    mapping(bytes32 questionId => bool isReopener) public reopener_questions;

    modifier onlyArbitrator(bytes32 questionId) {
        if (msg.sender != questions[questionId].arbitrator) revert MsgSenderMustBeArbitrator();
        _;
    }

    modifier stateAny() {
        _;
    }

    modifier stateNotCreated(bytes32 questionId) {
        if (questions[questionId].timeout != 0) revert QuestionMustNotExist();
        _;
    }

    modifier stateOpen(bytes32 questionId) {
        if (questions[questionId].timeout == 0) revert QuestionMustExist();
        if (questions[questionId].isPendingArbitration) revert QuestionMustNotBePendingArbitration();
        uint32 finalizeTs = questions[questionId].finalizeTs;
        if (finalizeTs != UNANSWERED && finalizeTs <= uint32(block.timestamp)) revert FinalizationDeadlineMustNotHavePassed();
        uint32 openingTs = questions[questionId].openingTs;
        if (openingTs != 0 && openingTs > uint32(block.timestamp)) revert OpeningDateMustHavePassed();
        _;
    }

    modifier statePendingArbitration(bytes32 questionId) {
        if (!questions[questionId].isPendingArbitration) revert QuestionMustBePendingArbitration();
        _;
    }

    modifier stateOpenOrPendingArbitration(bytes32 questionId) {
        if (questions[questionId].timeout == 0) revert QuestionMustExist();
        uint32 finalizeTs = questions[questionId].finalizeTs;
        if (finalizeTs != UNANSWERED && finalizeTs <= uint32(block.timestamp)) revert FinalizationDealineMustNotHavePassed();
        uint32 openingTs = questions[questionId].openingTs;
        if (openingTs != 0 && openingTs > uint32(block.timestamp)) revert OpeningDateMustHavePassed();
        _;
    }

    modifier stateFinalized(bytes32 questionId) {
        if (!isFinalized(questionId)) revert QuestionMustBeFinalized();
        _;
    }

    modifier bondMustDoubleAndMatchMinimum(bytes32 questionId, uint256 tokens) {
        if (tokens == 0) revert BondMustBePositive();
        uint256 currentBond = questions[questionId].bond;
        if (currentBond == 0) {
            if (tokens < (questions[questionId].minBond)) revert BondMustExceedTheMinimum();
        } else {
            if (tokens < (currentBond * 2)) revert BondMustBeDoubleAtLeastPreviousBond();
        }
        _;
    }

    modifier previousBondMustNotBeatMaxPrevious(bytes32 questionId, uint256 maxPrevious) {
        if (maxPrevious > 0) {
            if (questions[questionId].bond > maxPrevious) revert BondMustExceedMax_Previous();
        }
        _;
    }

    /* solhint-disable quotes */
    /// @notice Constructor, sets up some initial templates
    /// @dev Creates some generalized templates for different question types used in the DApp.
    constructor() {
        createTemplate('{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}');
    }
    /* solhint-enable quotes */

    /// @notice Function for arbitrator to set an optional per-question fee.
    /// @dev The per-question fee, charged when a question is asked, is intended as an anti-spam measure.
    /// @param fee The fee to be charged by the arbitrator when a question is asked
    function setQuestionFee(uint256 fee) external stateAny {
        arbitrator_question_fees[msg.sender] = fee;
        emit LogSetQuestionFee(msg.sender, fee);
    }

    /// @notice Create a reusable template, which should be a JSON document.
    /// Placeholders should use gettext() syntax, eg %s.
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param content The template content
    /// @return The ID of the newly-created template, which is created sequentially.
    function createTemplate(string memory content) public stateAny returns (uint256) {
        uint256 id = nextTemplateID;
        templates[id] = block.number;
        template_hashes[id] = keccak256(abi.encodePacked(content));
        emit LogNewTemplate(id, msg.sender, content);
        nextTemplateID = id + 1;
        return id;
    }

    /// @notice Create a new reusable template and use it to ask a question
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param content The template content
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @return The ID of the newly-created template, which is created sequentially.
    function createTemplateAndAskQuestion(
        string memory content,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce
    )
        public
        payable
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        uint256 templateId = createTemplate(content);
        return askQuestion(templateId, question, arbitrator, timeout, openingTs, nonce);
    }

    /// @notice Ask a new question and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param templateId The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestion(
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce
    )
        public
        payable
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        if (templates[templateId] == 0) revert TemplateMustExist();

        bytes32 contentHash = keccak256(abi.encodePacked(templateId, openingTs, question));
        bytes32 questionId = keccak256(abi.encodePacked(contentHash, arbitrator, timeout, uint256(0), address(this), msg.sender, nonce));

        // We emit this event here because _askQuestion doesn't need to know the unhashed question. Other events are emitted by _askQuestion.
        emit LogNewQuestion(questionId, msg.sender, templateId, question, contentHash, arbitrator, timeout, openingTs, nonce, block.timestamp);
        _askQuestion(questionId, contentHash, arbitrator, timeout, openingTs, 0, msg.value);

        return questionId;
    }

    /// @notice Ask a new question and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param templateId The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @param minBond The minimum bond that may be used for an answer.
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestionWithMinBond(
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond
    )
        public
        payable
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        if (templates[templateId] == 0) revert TemplateMustExist();

        bytes32 contentHash = keccak256(abi.encodePacked(templateId, openingTs, question));
        bytes32 questionId = keccak256(abi.encodePacked(contentHash, arbitrator, timeout, minBond, address(this), msg.sender, nonce));

        // We emit this event here because _askQuestion doesn't need to know the unhashed question.
        // Other events are emitted by _askQuestion.
        emit LogNewQuestion(questionId, msg.sender, templateId, question, contentHash, arbitrator, timeout, openingTs, nonce, block.timestamp);
        _askQuestion(questionId, contentHash, arbitrator, timeout, openingTs, minBond, msg.value);

        return questionId;
    }

    function _askQuestion(bytes32 questionId, bytes32 contentHash, address arbitrator, uint32 timeout, uint32 openingTs, uint256 minBond, uint256 tokens) internal stateNotCreated(questionId) {
        // A timeout of 0 makes no sense, and we will use this to check existence
        if (timeout == 0) revert TimeoutMustBePositive();
        if (timeout >= 365 days) revert TimeoutMustBeLessThan365Days();

        uint256 bounty = tokens;

        // The arbitrator can set a fee for asking a question.
        // This is intended as an anti-spam defence.
        // The fee is waived if the arbitrator is asking the question.
        // This allows them to set an impossibly high fee and make users proxy the question through them.
        // This would allow more sophisticated pricing, question whitelisting etc.
        if (arbitrator != NULL_ADDRESS && msg.sender != arbitrator) {
            uint256 questionFee = arbitrator_question_fees[arbitrator];
            if (bounty < questionFee) revert TokensProvidedMustCoverQuestionFee();
            bounty = bounty - questionFee;
            balanceOf[arbitrator] = balanceOf[arbitrator] + questionFee;
        }

        questions[questionId].contentHash = contentHash;
        questions[questionId].arbitrator = arbitrator;
        questions[questionId].openingTs = openingTs;
        questions[questionId].timeout = timeout;

        if (bounty > 0) {
            questions[questionId].bounty = bounty;
            emit LogFundAnswerBounty(questionId, bounty, bounty, msg.sender);
        }

        if (minBond > 0) {
            questions[questionId].minBond = minBond;
            emit LogMinimumBond(questionId, minBond);
        }
    }

    /// @notice Add funds to the bounty for a question
    /// @dev Add bounty funds after the initial question creation. Can be done any time until the question is finalized.
    /// @param questionId The ID of the question you wish to fund
    function fundAnswerBounty(bytes32 questionId) external payable stateOpen(questionId) {
        questions[questionId].bounty = questions[questionId].bounty + msg.value;
        emit LogFundAnswerBounty(questionId, msg.value, questions[questionId].bounty, msg.sender);
    }

    /// @notice Submit an answer for a question.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// @param questionId The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param maxPrevious If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    function submitAnswer(
        bytes32 questionId,
        bytes32 answer,
        uint256 maxPrevious
    ) external payable stateOpen(questionId) bondMustDoubleAndMatchMinimum(questionId, msg.value) previousBondMustNotBeatMaxPrevious(questionId, maxPrevious) {
        _addAnswerToHistory(questionId, answer, msg.sender, msg.value);
        _updateCurrentAnswer(questionId, answer);
    }

    /// @notice Submit an answer for a question, crediting it to the specified account.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// @param questionId The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param maxPrevious If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param answerer The account to which the answer should be credited
    function submitAnswerFor(
        bytes32 questionId,
        bytes32 answer,
        uint256 maxPrevious,
        address answerer
    ) external payable stateOpen(questionId) bondMustDoubleAndMatchMinimum(questionId, msg.value) previousBondMustNotBeatMaxPrevious(questionId, maxPrevious) {
        if (answerer == NULL_ADDRESS) revert AnswererMustBeNonZero();
        _addAnswerToHistory(questionId, answer, answerer, msg.value);
        _updateCurrentAnswer(questionId, answer);
    }

    function _addAnswerToHistory(bytes32 questionId, bytes32 answer, address answerer, uint256 bond) internal {
        bytes32 newHistoryHash = keccak256(abi.encodePacked(questions[questionId].historyHash, answer, bond, answerer, false));

        // Update the current bond level, if there's a bond (ie anything except arbitration)
        if (bond > 0) {
            questions[questionId].bond = bond;
        }
        questions[questionId].historyHash = newHistoryHash;

        emit LogNewAnswer(answer, questionId, newHistoryHash, answerer, bond, block.timestamp, false);
    }

    function _updateCurrentAnswer(bytes32 questionId, bytes32 answer) internal {
        questions[questionId].bestAnswer = answer;
        questions[questionId].finalizeTs = uint32(block.timestamp) + questions[questionId].timeout;
    }

    // Like _updateCurrentAnswer but without advancing the timeout
    function _updateCurrentAnswerByArbitrator(bytes32 questionId, bytes32 answer) internal {
        questions[questionId].bestAnswer = answer;
        questions[questionId].finalizeTs = uint32(block.timestamp);
    }

    /// @notice Notify the contract that the arbitrator has been paid for a question, freezing it pending their decision.
    /// @dev The arbitrator contract is trusted to only call this if they've been paid, and tell us who paid them.
    /// @param questionId The ID of the question
    /// @param requester The account that requested arbitration
    /// @param maxPrevious If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    function notifyOfArbitrationRequest(
        bytes32 questionId,
        address requester,
        uint256 maxPrevious
    ) external onlyArbitrator(questionId) stateOpen(questionId) previousBondMustNotBeatMaxPrevious(questionId, maxPrevious) {
        if (questions[questionId].finalizeTs <= UNANSWERED) revert QuestionMustAlreadyHaveAnAnswerWhenArbitrationIsRequested();
        questions[questionId].isPendingArbitration = true;
        emit LogNotifyOfArbitrationRequest(questionId, requester);
    }

    /// @notice Cancel a previously-requested arbitration and extend the timeout
    /// @dev Useful when doing arbitration across chains that can't be requested atomically
    /// @param questionId The ID of the question
    function cancelArbitration(bytes32 questionId) external onlyArbitrator(questionId) statePendingArbitration(questionId) {
        questions[questionId].isPendingArbitration = false;
        questions[questionId].finalizeTs = uint32(block.timestamp) + questions[questionId].timeout;
        emit LogCancelArbitration(questionId);
    }

    /// @notice Submit the answer for a question, for use by the arbitrator.
    /// @dev Doesn't require (or allow) a bond.
    /// If the current final answer is correct, the account should be whoever submitted it.
    /// If the current final answer is wrong, the account should be whoever paid for arbitration.
    /// However, the answerer stipulations are not enforced by the contract.
    /// @param questionId The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param answerer The account credited with this answer for the purpose of bond claims
    function submitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address answerer) public onlyArbitrator(questionId) statePendingArbitration(questionId) {
        if (answerer == NULL_ADDRESS) revert AnswererMustBeProvided();
        emit LogFinalize(questionId, answer);

        questions[questionId].isPendingArbitration = false;
        _addAnswerToHistory(questionId, answer, answerer, 0);
        _updateCurrentAnswerByArbitrator(questionId, answer);
    }

    /// @notice Submit the answer for a question, for use by the arbitrator, working out the appropriate winner based on the last answer details.
    /// @dev Doesn't require (or allow) a bond.
    /// @param questionId The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param payeeIfWrong The account to by credited as winner if the last answer given is wrong, usually the account that paid the arbitrator
    /// @param lastHistoryHash The history hash before the final one
    /// @param lastAnswer The last answer given
    /// @param lastAnswerer The address that supplied the last answer
    function assignWinnerAndSubmitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address payeeIfWrong, bytes32 lastHistoryHash, bytes32 lastAnswer, address lastAnswerer) external {
        _verifyHistoryInputOrRevert(questions[questionId].historyHash, lastHistoryHash, lastAnswer, questions[questionId].bond, lastAnswerer);

        address payee = (questions[questionId].bestAnswer == answer) ? lastAnswerer : payeeIfWrong;
        submitAnswerByArbitrator(questionId, answer, payee);
    }

    /// @notice Report whether the answer to the specified question is finalized
    /// @param questionId The ID of the question
    /// @return Return true if finalized
    function isFinalized(bytes32 questionId) public view returns (bool) {
        uint32 finalizeTs = questions[questionId].finalizeTs;
        return (!questions[questionId].isPendingArbitration && (finalizeTs > UNANSWERED) && (finalizeTs <= uint32(block.timestamp)));
    }

    /// @notice (Deprecated) Return the final answer to the specified question, or revert if there isn't one
    /// @param questionId The ID of the question
    /// @return The answer formatted as a bytes32
    function getFinalAnswer(bytes32 questionId) external view stateFinalized(questionId) returns (bytes32) {
        return questions[questionId].bestAnswer;
    }

    /// @notice Return the final answer to the specified question, or revert if there isn't one
    /// @param questionId The ID of the question
    /// @return The answer formatted as a bytes32
    function resultFor(bytes32 questionId) public view stateFinalized(questionId) returns (bytes32) {
        return questions[questionId].bestAnswer;
    }

    /// @notice Returns whether the question was answered before it had an answer, ie resolved to UNRESOLVED_ANSWER
    /// @param questionId The ID of the question
    function isSettledTooSoon(bytes32 questionId) public view returns (bool) {
        return (resultFor(questionId) == UNRESOLVED_ANSWER);
    }

    /// @notice Like resultFor(), but errors out if settled too soon, or returns the result of a replacement if it was reopened at the right time and settled
    /// @param questionId The ID of the question
    function resultForOnceSettled(bytes32 questionId) external view returns (bytes32) {
        bytes32 result = resultFor(questionId);
        if (result == UNRESOLVED_ANSWER) {
            // Try the replacement
            bytes32 replacementId = reopened_questions[questionId];
            if (replacementId == bytes32(0x0)) revert QuestionWasSettledTooSoonAndHasNotBeenReopened();
            // We only try one layer down rather than recursing to keep the gas costs predictable
            result = resultFor(replacementId);
            if (result == UNRESOLVED_ANSWER) revert QuestionReplacementWasSettledTooSoonAndHasNotBeenReopened();
        }
        return result;
    }

    /// @notice Asks a new question reopening a previously-asked question that was settled too soon
    /// @dev A special version of askQuestion() that replaces a previous question that was settled too soon
    /// @param templateId The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @param minBond The minimum bond that can be used to provide the first answer.
    /// @param reopensQuestionId The ID of the question this reopens
    /// @return The ID of the newly-created question, created deterministically.
    function reopenQuestion(
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond,
        bytes32 reopensQuestionId
    )
        public
        payable
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        if (!isSettledTooSoon(reopensQuestionId)) revert YouCanOnlyReopenQuestionsThatResolvedAsSettledTooSoon();

        bytes32 contentHash = keccak256(abi.encodePacked(templateId, openingTs, question));

        // A reopening must exactly match the original question, except for the nonce and the creator
        if (contentHash != questions[reopensQuestionId].contentHash) revert ContentHashMismatch();
        if (arbitrator != questions[reopensQuestionId].arbitrator) revert ArbitratorMismatch();
        if (timeout != questions[reopensQuestionId].timeout) revert TimeoutMismatch();
        if (openingTs != questions[reopensQuestionId].openingTs) revert Opening_TsMismatch();
        if (minBond != questions[reopensQuestionId].minBond) revert Min_BondMismatch();

        // If the the question was itself reopening some previous question, you'll have to re-reopen the previous question first.
        // This ensures the bounty can be passed on to the next attempt of the original question.
        if (reopener_questions[reopensQuestionId]) revert QuestionIsAlreadyReopeningAPreviousQuestion();

        // A question can only be reopened once, unless the reopening was also settled too soon in which case it can be replaced
        bytes32 existingReopenQuestionId = reopened_questions[reopensQuestionId];

        // Normally when we reopen a question we will take its bounty and pass it on to the reopened version.
        bytes32 takeBountyFromQuestionId = reopensQuestionId;
        // If the question has already been reopened but was again settled too soon, we can transfer its bounty to the next attempt.
        if (existingReopenQuestionId != bytes32(0)) {
            if (!isSettledTooSoon(existingReopenQuestionId)) revert QuestionHasAlreadyBeenReopened();
            // We'll overwrite the reopening with our new question and move the bounty.
            // Once that's done we'll detach the failed reopener and you'll be able to reopen that too if you really want, but without the bounty.
            reopener_questions[existingReopenQuestionId] = false;
            takeBountyFromQuestionId = existingReopenQuestionId;
        }

        bytes32 questionId = askQuestionWithMinBond(templateId, question, arbitrator, timeout, openingTs, nonce, minBond);

        reopened_questions[reopensQuestionId] = questionId;
        reopener_questions[questionId] = true;

        questions[questionId].bounty = questions[takeBountyFromQuestionId].bounty + questions[questionId].bounty;
        questions[takeBountyFromQuestionId].bounty = 0;

        emit LogReopenQuestion(questionId, reopensQuestionId);

        return questionId;
    }

    /// @notice Return the final answer to the specified question, provided it matches the specified criteria.
    /// @dev Reverts if the question is not finalized, or if it does not match the specified criteria.
    /// @param questionId The ID of the question
    /// @param contentHash The hash of the question content (template ID + opening time + question parameter string)
    /// @param arbitrator The arbitrator chosen for the question (regardless of whether they are asked to arbitrate)
    /// @param minTimeout The timeout set in the initial question settings must be this high or higher
    /// @param minBond The bond sent with the final answer must be this high or higher
    /// @return The answer formatted as a bytes32
    function getFinalAnswerIfMatches(bytes32 questionId, bytes32 contentHash, address arbitrator, uint32 minTimeout, uint256 minBond) external view stateFinalized(questionId) returns (bytes32) {
        if (contentHash != questions[questionId].contentHash) revert ContentHashMustMatch();
        if (arbitrator != questions[questionId].arbitrator) revert ArbitratorMustMatch();
        if (minTimeout > questions[questionId].timeout) revert TimeoutMustBeLongEnough();
        if (minBond > questions[questionId].bond) revert BondMustBeHighEnough();
        return questions[questionId].bestAnswer;
    }

    /// @notice Assigns the winnings (bounty and bonds) to everyone who gave the accepted answer
    /// Caller must provide the answer history, in reverse order
    /// @dev Works up the chain and assign bonds to the person who gave the right answer
    /// If someone gave the winning answer earlier, they must get paid from the higher bond
    /// That means we can't pay out the bond added at n until we have looked at n-1
    /// The first answer is authenticated by checking against the stored historyHash.
    /// One of the inputs to historyHash is the historyHash before it, so we use that to authenticate the next entry, etc
    /// Once we get to a null hash we'll know we're done and there are no more answers.
    /// Usually you would call the whole thing in a single transaction, but if not then the data is persisted to pick up later.
    /// @param questionId The ID of the question
    /// @param historyHashes Second-last-to-first, the hash of each history entry. (Final one should be empty).
    /// @param addrs Last-to-first, the address of each answerer
    /// @param bonds Last-to-first, the bond supplied with each answer
    /// @param answers Last-to-first, each answer supplied
    function claimWinnings(bytes32 questionId, bytes32[] memory historyHashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers) public stateFinalized(questionId) {
        if (historyHashes.length == 0) revert AtLeastOneHistoryHashEntryMustBeProvided();

        // These are only set if we split our claim over multiple transactions.
        address payee = question_claims[questionId].payee;
        uint256 lastBond = question_claims[questionId].lastBond;
        uint256 queuedFunds = 0;

        // Starts as the hash of the final answer submitted. It'll be cleared when we're done.
        // If we're splitting the claim over multiple transactions, it'll be the hash where we left off last time
        bytes32 lastHistoryHash = questions[questionId].historyHash;

        bytes32 bestAnswer = questions[questionId].bestAnswer;

        uint256 i;
        for (i = 0; i < historyHashes.length; i++) {
            _verifyHistoryInputOrRevert(lastHistoryHash, historyHashes[i], answers[i], bonds[i], addrs[i]);

            queuedFunds = queuedFunds + lastBond;
            (queuedFunds, payee) = _processHistoryItem(questionId, bestAnswer, queuedFunds, payee, addrs[i], bonds[i], answers[i]);

            // Line the bond up for next time, when it will be added to somebody's queuedFunds
            lastBond = bonds[i];

            // Burn (just leave in contract balance) a fraction of all bonds except the final one.
            // This creates a cost to increasing your own bond, which could be used to delay resolution maliciously
            if (lastBond != questions[questionId].bond) {
                lastBond = lastBond - lastBond / BOND_CLAIM_FEE_PROPORTION;
            }

            lastHistoryHash = historyHashes[i];
        }

        if (lastHistoryHash != NULL_HASH) {
            // We haven't yet got to the null hash (1st answer), ie the caller didn't supply the full answer chain.
            // Persist the details so we can pick up later where we left off later.

            // Pay out the latest payee, only keeping back lastBond which the next may have a claim on
            _payPayee(questionId, payee, queuedFunds);

            question_claims[questionId].payee = payee;
            question_claims[questionId].lastBond = lastBond;
        } else {
            // There is nothing left below us so the payee can keep what remains
            _payPayee(questionId, payee, queuedFunds + lastBond);
            delete question_claims[questionId];
        }

        questions[questionId].historyHash = lastHistoryHash;
    }

    function _payPayee(bytes32 questionId, address payee, uint256 value) internal {
        balanceOf[payee] = balanceOf[payee] + value;
        emit LogClaim(questionId, payee, value);
    }

    function _verifyHistoryInputOrRevert(bytes32 lastHistoryHash, bytes32 historyHash, bytes32 answer, uint256 bond, address addr) internal pure {
        if (lastHistoryHash != keccak256(abi.encodePacked(historyHash, answer, bond, addr, false))) {
            revert HistoryInputProvidedDidNotMatchTheExpectedHash();
        }
    }

    function _processHistoryItem(bytes32 questionId, bytes32 bestAnswer, uint256 queuedFunds, address payee, address addr, uint256 bond, bytes32 answer) internal returns (uint256, address) {
        if (answer == bestAnswer) {
            if (payee == NULL_ADDRESS) {
                // The entry is for the first payee we come to, ie the winner.
                // They get the question bounty.
                payee = addr;

                if (bestAnswer != UNRESOLVED_ANSWER && questions[questionId].bounty > 0) {
                    _payPayee(questionId, payee, questions[questionId].bounty);
                    questions[questionId].bounty = 0;
                }
            } else if (addr != payee) {
                // Answerer has changed, ie we found someone lower down who needs to be paid

                // The lower answerer will take over receiving bonds from higher answerer.
                // They should also be paid the takeover fee, which is set at a rate equivalent to their bond.
                // (This is our arbitrary rule, to give consistent right-answerers a defence against high-rollers.)

                // There should be enough for the fee, but if not, take what we have.
                // There's an edge case involving weird arbitrator behaviour where we may be short.
                uint256 answerTakeoverFee = (queuedFunds >= bond) ? bond : queuedFunds;
                // Settle up with the old (higher-bonded) payee
                _payPayee(questionId, payee, queuedFunds - answerTakeoverFee);

                // Now start queuedFunds again for the new (lower-bonded) payee
                payee = addr;
                queuedFunds = answerTakeoverFee;
            }
        }

        return (queuedFunds, payee);
    }

    /// @notice Convenience function to assign bounties/bonds for multiple questions in one go, then withdraw all your funds.
    /// Caller must provide the answer history for each question, in reverse order
    /// @dev Can be called by anyone to assign bonds/bounties, but funds are only withdrawn for the user making the call.
    /// @param questionIds The IDs of the questions you want to claim for
    /// @param lengths The number of history entries you will supply for each question ID
    /// @param histHashes In a single list for all supplied questions, the hash of each history entry.
    /// @param addrs In a single list for all supplied questions, the address of each answerer
    /// @param bonds In a single list for all supplied questions, the bond supplied with each answer
    /// @param answers In a single list for all supplied questions, each answer supplied
    function claimMultipleAndWithdrawBalance(
        bytes32[] memory questionIds,
        uint256[] memory lengths,
        bytes32[] memory histHashes,
        address[] memory addrs,
        uint256[] memory bonds,
        bytes32[] memory answers
    )
        public
        stateAny // The finalization checks are done in the claimWinnings function
    {
        uint256 qi;
        uint256 i;
        for (qi = 0; qi < questionIds.length; qi++) {
            bytes32 qid = questionIds[qi];
            uint256 ln = lengths[qi];
            bytes32[] memory hh = new bytes32[](ln);
            address[] memory ad = new address[](ln);
            uint256[] memory bo = new uint256[](ln);
            bytes32[] memory an = new bytes32[](ln);
            uint256 j;
            for (j = 0; j < ln; j++) {
                hh[j] = histHashes[i];
                ad[j] = addrs[i];
                bo[j] = bonds[i];
                an[j] = answers[i];
                i++;
            }
            claimWinnings(qid, hh, ad, bo, an);
        }
        withdraw();
    }

    /// @notice Returns the questions's content hash, identifying the question content
    /// @param questionId The ID of the question
    function getContentHash(bytes32 questionId) public view returns (bytes32) {
        return questions[questionId].contentHash;
    }

    /// @notice Returns the arbitrator address for the question
    /// @param questionId The ID of the question
    function getArbitrator(bytes32 questionId) public view returns (address) {
        return questions[questionId].arbitrator;
    }

    /// @notice Returns the timestamp when the question can first be answered
    /// @param questionId The ID of the question
    function getOpeningTS(bytes32 questionId) public view returns (uint32) {
        return questions[questionId].openingTs;
    }

    /// @notice Returns the timeout in seconds used after each answer
    /// @param questionId The ID of the question
    function getTimeout(bytes32 questionId) public view returns (uint32) {
        return questions[questionId].timeout;
    }

    /// @notice Returns the timestamp at which the question will be/was finalized
    /// @param questionId The ID of the question
    function getFinalizeTS(bytes32 questionId) public view returns (uint32) {
        return questions[questionId].finalizeTs;
    }

    /// @notice Returns whether the question is pending arbitration
    /// @param questionId The ID of the question
    function isPendingArbitration(bytes32 questionId) public view returns (bool) {
        return questions[questionId].isPendingArbitration;
    }

    /// @notice Returns the current total unclaimed bounty
    /// @dev Set back to zero once the bounty has been claimed
    /// @param questionId The ID of the question
    function getBounty(bytes32 questionId) public view returns (uint256) {
        return questions[questionId].bounty;
    }

    /// @notice Returns the current best answer
    /// @param questionId The ID of the question
    function getBestAnswer(bytes32 questionId) public view returns (bytes32) {
        return questions[questionId].bestAnswer;
    }

    /// @notice Returns the history hash of the question
    /// @param questionId The ID of the question
    /// @dev Updated on each answer, then rewound as each is claimed
    function getHistoryHash(bytes32 questionId) public view returns (bytes32) {
        return questions[questionId].historyHash;
    }

    /// @notice Returns the highest bond posted so far for a question
    /// @param questionId The ID of the question
    function getBond(bytes32 questionId) public view returns (uint256) {
        return questions[questionId].bond;
    }

    /// @notice Returns the minimum bond that can answer the question
    /// @param questionId The ID of the question
    function getMinBond(bytes32 questionId) public view returns (uint256) {
        return questions[questionId].minBond;
    }
}
