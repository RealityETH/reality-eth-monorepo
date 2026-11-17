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
    mapping(uint256 templateId => bytes32 contentHash) public templateHashes;
    mapping(bytes32 questionId => Question question) public questions;
    mapping(bytes32 questionId => Claim claim) public questionClaims;
    mapping(bytes32 reopenedQuestionId => bytes32 replacementQuestionId) public reopenedQuestions;
    mapping(bytes32 questionId => bool isReopener) public reopenerQuestions;

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
        // forge-lint: disable-next-line(block-timestamp, unsafe-typecast) -- safe until 2106
        if (finalizeTs != UNANSWERED && finalizeTs <= uint32(block.timestamp)) revert FinalizationDeadlineMustNotHavePassed();
        uint32 openingTs = questions[questionId].openingTs;
        // forge-lint: disable-next-line(block-timestamp, unsafe-typecast) -- safe until 2106
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
        // forge-lint: disable-next-line(block-timestamp, unsafe-typecast) -- safe until 2106
        if (finalizeTs != UNANSWERED && finalizeTs <= uint32(block.timestamp)) revert FinalizationDeadlineMustNotHavePassed();
        uint32 openingTs = questions[questionId].openingTs;
        // forge-lint: disable-next-line(block-timestamp, unsafe-typecast) -- safe until 2106
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
            if (questions[questionId].bond > maxPrevious) revert BondMustExceedMaxPrevious();
        }
        _;
    }

    /// @notice Constructor, sets up some initial templates
    /// @dev Creates some generalized templates for different question types used in the DApp.
    constructor() {
        createInitialTemplates();
    }

    /// @inheritdoc IRealityETHCore
    function createInitialTemplates() public {
        if (nextTemplateID != 0) revert TemplatesAlreadyCreated();
        /* solhint-disable quotes */
        createTemplate('{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}');
        /* solhint-enable quotes */
    }
    /* solhint-enable quotes */

    /// @inheritdoc IRealityETHCore
    function createTemplate(string memory content) public stateAny returns (uint256) {
        uint256 id = nextTemplateID;
        templates[id] = block.number;
        templateHashes[id] = keccak256(abi.encodePacked(content));
        emit LogNewTemplate(id, msg.sender, content);
        nextTemplateID = id + 1;
        return id;
    }

    /// @inheritdoc IRealityETHCore
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

    /// @inheritdoc IRealityETHCore
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

    /// @inheritdoc IRealityETHCore
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

        questions[questionId].contentHash = contentHash;
        questions[questionId].arbitrator = arbitrator;
        questions[questionId].openingTs = openingTs;
        questions[questionId].timeout = timeout;
        // forge-lint: disable-next-line(unsafe-typecast) -- block.number fits uint64 on any real chain
        questions[questionId].createdBlock = uint64(block.number);

        if (bounty > 0) {
            questions[questionId].bounty = bounty;
            emit LogFundAnswerBounty(questionId, bounty, bounty, msg.sender);
        }

        if (minBond > 0) {
            questions[questionId].minBond = minBond;
            emit LogMinimumBond(questionId, minBond);
        }
    }

    /// @inheritdoc IRealityETHCore
    function fundAnswerBounty(bytes32 questionId) external payable stateOpen(questionId) {
        questions[questionId].bounty = questions[questionId].bounty + msg.value;
        emit LogFundAnswerBounty(questionId, msg.value, questions[questionId].bounty, msg.sender);
    }

    /// @inheritdoc IRealityETHCore
    function submitAnswer(
        bytes32 questionId,
        bytes32 answer,
        uint256 maxPrevious
    ) external payable stateOpen(questionId) bondMustDoubleAndMatchMinimum(questionId, msg.value) previousBondMustNotBeatMaxPrevious(questionId, maxPrevious) {
        _addAnswerToHistory(questionId, answer, msg.sender, msg.value);
        _updateCurrentAnswer(questionId, answer);
    }

    /// @inheritdoc IRealityETHCore
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
        // forge-lint: disable-next-line(unsafe-typecast) -- safe until 2106; timeout capped at 1 year
        questions[questionId].finalizeTs = uint32(block.timestamp) + questions[questionId].timeout;
    }

    // Like _updateCurrentAnswer but without advancing the timeout
    function _updateCurrentAnswerByArbitrator(bytes32 questionId, bytes32 answer) internal {
        questions[questionId].bestAnswer = answer;
        // forge-lint: disable-next-line(unsafe-typecast) -- safe until 2106
        questions[questionId].finalizeTs = uint32(block.timestamp);
    }

    /// @inheritdoc IRealityETHCore
    function notifyOfArbitrationRequest(
        bytes32 questionId,
        address requester,
        uint256 maxPrevious
    ) external onlyArbitrator(questionId) stateOpen(questionId) previousBondMustNotBeatMaxPrevious(questionId, maxPrevious) {
        if (questions[questionId].finalizeTs <= UNANSWERED) revert QuestionMustAlreadyHaveAnAnswerWhenArbitrationIsRequested();
        questions[questionId].isPendingArbitration = true;
        emit LogNotifyOfArbitrationRequest(questionId, requester);
    }

    /// @inheritdoc IRealityETHCore
    function cancelArbitration(bytes32 questionId) external onlyArbitrator(questionId) statePendingArbitration(questionId) {
        questions[questionId].isPendingArbitration = false;
        // forge-lint: disable-next-line(unsafe-typecast) -- safe until 2106; timeout capped at 1 year
        questions[questionId].finalizeTs = uint32(block.timestamp) + questions[questionId].timeout;
        emit LogCancelArbitration(questionId);
    }

    /// @inheritdoc IRealityETHCore
    function submitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address answerer) public onlyArbitrator(questionId) statePendingArbitration(questionId) {
        if (answerer == NULL_ADDRESS) revert AnswererMustBeProvided();
        emit LogFinalize(questionId, answer);

        questions[questionId].isPendingArbitration = false;
        _addAnswerToHistory(questionId, answer, answerer, 0);
        _updateCurrentAnswerByArbitrator(questionId, answer);
    }

    /// @inheritdoc IRealityETHCore
    function assignWinnerAndSubmitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address payeeIfWrong, bytes32 lastHistoryHash, bytes32 lastAnswer, address lastAnswerer) external {
        _verifyHistoryInputOrRevert(questions[questionId].historyHash, lastHistoryHash, lastAnswer, questions[questionId].bond, lastAnswerer);

        address payee = (questions[questionId].bestAnswer == answer) ? lastAnswerer : payeeIfWrong;
        submitAnswerByArbitrator(questionId, answer, payee);
    }

    /// @inheritdoc IRealityETHCore
    function isFinalized(bytes32 questionId) public view returns (bool) {
        uint32 finalizeTs = questions[questionId].finalizeTs;
        // forge-lint: disable-next-line(block-timestamp, unsafe-typecast) -- safe until 2106
        return (!questions[questionId].isPendingArbitration && (finalizeTs > UNANSWERED) && (finalizeTs <= uint32(block.timestamp)));
    }

    /// @inheritdoc IRealityETHCore
    function getFinalAnswer(bytes32 questionId) external view stateFinalized(questionId) returns (bytes32) {
        return questions[questionId].bestAnswer;
    }

    /// @inheritdoc IRealityETHCore
    function resultFor(bytes32 questionId) public view stateFinalized(questionId) returns (bytes32) {
        return questions[questionId].bestAnswer;
    }

    /// @inheritdoc IRealityETHCore
    function isSettledTooSoon(bytes32 questionId) public view returns (bool) {
        return (resultFor(questionId) == UNRESOLVED_ANSWER);
    }

    /// @inheritdoc IRealityETHCore
    function resultForOnceSettled(bytes32 questionId) external view returns (bytes32) {
        bytes32 result = resultFor(questionId);
        if (result == UNRESOLVED_ANSWER) {
            // Try the replacement
            bytes32 replacementId = reopenedQuestions[questionId];
            if (replacementId == bytes32(0x0)) revert QuestionWasSettledTooSoonAndHasNotBeenReopened();
            // We only try one layer down rather than recursing to keep the gas costs predictable
            result = resultFor(replacementId);
            if (result == UNRESOLVED_ANSWER) revert QuestionReplacementWasSettledTooSoonAndHasNotBeenReopened();
        }
        return result;
    }

    /// @inheritdoc IRealityETHCore
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
        if (openingTs != questions[reopensQuestionId].openingTs) revert OpeningTsMismatch();
        if (minBond != questions[reopensQuestionId].minBond) revert MinBondMismatch();

        // If the the question was itself reopening some previous question, you'll have to re-reopen the previous question first.
        // This ensures the bounty can be passed on to the next attempt of the original question.
        if (reopenerQuestions[reopensQuestionId]) revert QuestionIsAlreadyReopeningAPreviousQuestion();

        // A question can only be reopened once, unless the reopening was also settled too soon in which case it can be replaced
        bytes32 existingReopenQuestionId = reopenedQuestions[reopensQuestionId];

        // Normally when we reopen a question we will take its bounty and pass it on to the reopened version.
        bytes32 takeBountyFromQuestionId = reopensQuestionId;
        // If the question has already been reopened but was again settled too soon, we can transfer its bounty to the next attempt.
        if (existingReopenQuestionId != bytes32(0)) {
            if (!isSettledTooSoon(existingReopenQuestionId)) revert QuestionHasAlreadyBeenReopened();
            // We'll overwrite the reopening with our new question and move the bounty.
            // Once that's done we'll detach the failed reopener and you'll be able to reopen that too if you really want, but without the bounty.
            reopenerQuestions[existingReopenQuestionId] = false;
            takeBountyFromQuestionId = existingReopenQuestionId;
        }

        bytes32 questionId = askQuestionWithMinBond(templateId, question, arbitrator, timeout, openingTs, nonce, minBond);

        reopenedQuestions[reopensQuestionId] = questionId;
        reopenerQuestions[questionId] = true;

        questions[questionId].bounty = questions[takeBountyFromQuestionId].bounty + questions[questionId].bounty;
        questions[takeBountyFromQuestionId].bounty = 0;

        emit LogReopenQuestion(questionId, reopensQuestionId);

        return questionId;
    }

    /// @inheritdoc IRealityETHCore
    function getFinalAnswerIfMatches(bytes32 questionId, bytes32 contentHash, address arbitrator, uint32 minTimeout, uint256 minBond) external view stateFinalized(questionId) returns (bytes32) {
        if (contentHash != questions[questionId].contentHash) revert ContentHashMustMatch();
        if (arbitrator != questions[questionId].arbitrator) revert ArbitratorMustMatch();
        if (minTimeout > questions[questionId].timeout) revert TimeoutMustBeLongEnough();
        if (minBond > questions[questionId].bond) revert BondMustBeHighEnough();
        return questions[questionId].bestAnswer;
    }

    /// @inheritdoc IRealityETHCore
    function claimWinnings(bytes32 questionId, bytes32[] memory historyHashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers) public stateFinalized(questionId) {
        if (historyHashes.length == 0) revert AtLeastOneHistoryHashEntryMustBeProvided();

        // These are only set if we split our claim over multiple transactions.
        address payee = questionClaims[questionId].payee;
        uint256 lastBond = questionClaims[questionId].lastBond;
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

            questionClaims[questionId].payee = payee;
            questionClaims[questionId].lastBond = lastBond;
        } else {
            // There is nothing left below us so the payee can keep what remains
            _payPayee(questionId, payee, queuedFunds + lastBond);
            delete questionClaims[questionId];
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

    /// @inheritdoc IRealityETHCore
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
        uint256 i = 0;
        for (uint256 qi = 0; qi < questionIds.length; qi++) {
            bytes32 qid = questionIds[qi];
            uint256 ln = lengths[qi];
            bytes32[] memory hh = new bytes32[](ln);
            address[] memory ad = new address[](ln);
            uint256[] memory bo = new uint256[](ln);
            bytes32[] memory an = new bytes32[](ln);
            for (uint256 j = 0; j < ln; j++) {
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

    /// @inheritdoc IRealityETHCore
    function getContentHash(bytes32 questionId) public view returns (bytes32) {
        return questions[questionId].contentHash;
    }

    /// @inheritdoc IRealityETHCore
    function getArbitrator(bytes32 questionId) public view returns (address) {
        return questions[questionId].arbitrator;
    }

    /// @inheritdoc IRealityETHCore
    function getOpeningTS(bytes32 questionId) public view returns (uint32) {
        return questions[questionId].openingTs;
    }

    /// @inheritdoc IRealityETHCore
    function getTimeout(bytes32 questionId) public view returns (uint32) {
        return questions[questionId].timeout;
    }

    /// @inheritdoc IRealityETHCore
    function getFinalizeTS(bytes32 questionId) public view returns (uint32) {
        return questions[questionId].finalizeTs;
    }

    /// @inheritdoc IRealityETHCore
    function isPendingArbitration(bytes32 questionId) public view returns (bool) {
        return questions[questionId].isPendingArbitration;
    }

    /// @inheritdoc IRealityETHCore
    function getBounty(bytes32 questionId) public view returns (uint256) {
        return questions[questionId].bounty;
    }

    /// @inheritdoc IRealityETHCore
    function getBestAnswer(bytes32 questionId) public view returns (bytes32) {
        return questions[questionId].bestAnswer;
    }

    /// @inheritdoc IRealityETHCore
    function getHistoryHash(bytes32 questionId) public view returns (bytes32) {
        return questions[questionId].historyHash;
    }

    /// @inheritdoc IRealityETHCore
    function getBond(bytes32 questionId) public view returns (uint256) {
        return questions[questionId].bond;
    }

    /// @inheritdoc IRealityETHCore
    function getMinBond(bytes32 questionId) public view returns (uint256) {
        return questions[questionId].minBond;
    }
}
