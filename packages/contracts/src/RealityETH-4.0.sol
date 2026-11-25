// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETHCore} from "./interfaces/IRealityETHCore.sol";
import {BalanceHolder} from "./BalanceHolder.sol";
import {AnswerType, Template} from "./RealityETHTypes.sol";

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

    // Special value representing an invalid question. bytes32(-1). Always an acceptable answer.
    bytes32 private constant INVALID = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    uint256 private nextTemplateID = 0;
    mapping(uint256 templateId => Template template) internal templateRegistry;
    // internal + explicit struct getter below: the flat auto-getter would return
    // too many stack slots for the legacy codegen as the struct grows.
    mapping(bytes32 questionId => Question question) internal _questions;
    mapping(bytes32 questionId => Claim claim) public questionClaims;
    mapping(bytes32 reopenedQuestionId => bytes32 replacementQuestionId) public reopenedQuestions;
    mapping(bytes32 questionId => bool isReopener) public reopenerQuestions;

    modifier onlyArbitrator(bytes32 questionId) {
        if (msg.sender != _arbitratorOf(questionId)) revert MsgSenderMustBeArbitrator();
        _;
    }

    modifier stateAny() {
        _;
    }

    modifier stateNotCreated(bytes32 questionId) {
        if (_questions[questionId].timeout != 0) revert QuestionMustNotExist();
        _;
    }

    modifier stateOpen(bytes32 questionId) {
        if (_questions[questionId].timeout == 0) revert QuestionMustExist();
        if (_questions[questionId].isPendingArbitration) revert QuestionMustNotBePendingArbitration();
        uint32 finalizeTs = _questions[questionId].finalizeTs;
        // forge-lint: disable-next-line(block-timestamp, unsafe-typecast) -- safe until 2106
        if (finalizeTs != UNANSWERED && finalizeTs <= uint32(block.timestamp)) {
            revert FinalizationDeadlineMustNotHavePassed();
        }
        uint32 openingTs = _questions[questionId].openingTs;
        // forge-lint: disable-next-line(block-timestamp, unsafe-typecast) -- safe until 2106
        if (openingTs != 0 && openingTs > uint32(block.timestamp)) revert OpeningDateMustHavePassed();
        _;
    }

    modifier statePendingArbitration(bytes32 questionId) {
        if (!_questions[questionId].isPendingArbitration) revert QuestionMustBePendingArbitration();
        _;
    }

    modifier stateOpenOrPendingArbitration(bytes32 questionId) {
        if (_questions[questionId].timeout == 0) revert QuestionMustExist();
        uint32 finalizeTs = _questions[questionId].finalizeTs;
        // forge-lint: disable-next-line(block-timestamp, unsafe-typecast) -- safe until 2106
        if (finalizeTs != UNANSWERED && finalizeTs <= uint32(block.timestamp)) {
            revert FinalizationDeadlineMustNotHavePassed();
        }
        uint32 openingTs = _questions[questionId].openingTs;
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
        uint256 currentBond = _questions[questionId].bond;
        if (currentBond == 0) {
            if (tokens < _minBondOf(questionId)) revert BondMustExceedTheMinimum();
        } else {
            if (tokens < (currentBond * 2)) revert BondMustBeDoubleAtLeastPreviousBond();
        }
        _;
    }

    modifier previousBondMustNotBeatMaxPrevious(bytes32 questionId, uint256 maxPrevious) {
        if (maxPrevious > 0) {
            if (_questions[questionId].bond > maxPrevious) revert BondMustExceedMaxPrevious();
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
        // Generalized defaults: the asker supplies the whole title via params[0]
        // (a single "" interpolation slot). Select types carry concrete outcomes,
        // so they are registered per-use with createTemplate rather than as a
        // generalized default.
        string[] memory titleOnly = new string[](1); // one "" interpolation slot
        string[] memory noOutcomes = new string[](0);
        createTemplate(
            Template(
                AnswerType.Bool,
                0,
                false,
                false,
                false,
                false,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                ""
            )
        );
        createTemplate(
            Template(
                AnswerType.Uint,
                18,
                false,
                false,
                false,
                false,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                ""
            )
        );
        createTemplate(
            Template(
                AnswerType.Datetime,
                0,
                false,
                false,
                false,
                false,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                ""
            )
        );
    }

    /// @inheritdoc IRealityETHCore
    function createTemplate(Template memory template) public stateAny returns (uint256) {
        _validateTemplate(template);
        uint256 id = nextTemplateID;
        templateRegistry[id] = template;
        emit LogNewTemplate(id, msg.sender);
        nextTemplateID = id + 1;
        return id;
    }

    /// @inheritdoc IRealityETHCore
    function getTemplate(uint256 templateId) external view returns (Template memory) {
        if (templateId >= nextTemplateID) revert TemplateMustExist();
        return templateRegistry[templateId];
    }

    /// @inheritdoc IRealityETHCore
    function questions(bytes32 questionId) external view returns (Question memory) {
        return _questions[questionId];
    }

    function _validateTemplate(Template memory template) internal pure {
        if (template.titleParts.length == 0) revert TemplateTitleRequired();
        bool isSelect =
            template.answerType == AnswerType.SingleSelect || template.answerType == AnswerType.MultipleSelect;
        if (isSelect) {
            // Outcomes are optional in the template: an empty set means the asker supplies them per question;
            // a non-empty set (<=256) is a gas-saving default shared by every question on this template.
            if (template.outcomes.length > 256) revert TemplateOutcomesInvalid();
        } else if (template.outcomes.length != 0) {
            revert TemplateOutcomesInvalid();
        }
        if (template.answerType != AnswerType.Uint && template.decimals != 0) revert TemplateDecimalsInvalid();
        // tri-state: a field flagged unused must not carry a preset string
        if (!template.hasDescription && bytes(template.description).length != 0) revert TemplateFieldInvalid();
        if (!template.hasCategory && bytes(template.category).length != 0) revert TemplateFieldInvalid();
        if (!template.hasLang && bytes(template.lang).length != 0) revert TemplateFieldInvalid();
    }

    // We store the number of outcomes so we can sanity-check the answers.
    // Outcomes can be set in either the template or the question depending on template settings.
    function _resolveOutcomeCount(uint256 templateId, string[] memory outcomes) internal view returns (uint256) {
        Template storage t = templateRegistry[templateId];
        bool isSelect = t.answerType == AnswerType.SingleSelect || t.answerType == AnswerType.MultipleSelect;
        if (!isSelect) {
            if (outcomes.length != 0) revert OutcomesInvalid();
            return 0;
        }
        if (t.outcomes.length != 0) {
            // template presets the outcomes; the asker must not also supply them
            if (outcomes.length != 0) revert OutcomesInvalid();
            return t.outcomes.length;
        }
        if (outcomes.length == 0 || outcomes.length > 256) revert OutcomesInvalid();
        return outcomes.length;
    }

    // Arbitrator for a new question, fixed by template or supplied per-question.
    // Reverts if the template fixed it but the asker also supplied it.
    function _effectiveArbitrator(Template storage t, address supplied) internal view returns (address) {
        if (t.arbitratorFromTemplate) {
            if (supplied != address(0)) revert OverrideNotAllowed();
            return t.arbitrator;
        }
        return supplied;
    }

    // Effective minBond for a new question: the template's if it fixes one, else the ask-time override.
    function _effectiveMinBond(Template storage t, uint256 supplied) internal view returns (uint256) {
        if (t.minBondFromTemplate) {
            if (supplied != 0) revert OverrideNotAllowed();
            return t.minBond;
        }
        return supplied;
    }

    // Arbitrator for an existing question, fixed by template or supplied per-question.
    function _arbitratorOf(bytes32 questionId) internal view returns (address) {
        Template storage t = templateRegistry[_questions[questionId].templateId];
        return t.arbitratorFromTemplate ? t.arbitrator : _questions[questionId].arbitrator;
    }

    // minBond for an existing question, fixed by template or supplied per-question.
    function _minBondOf(bytes32 questionId) internal view returns (uint256) {
        Template storage t = templateRegistry[_questions[questionId].templateId];
        return t.minBondFromTemplate ? t.minBond : _questions[questionId].minBond;
    }

    /// @inheritdoc IRealityETHCore
    function createTemplateAndAskQuestion(
        Template memory template,
        string[] memory params,
        string[] memory outcomes,
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
        uint256 templateId = createTemplate(template);
        return askQuestionWithMinBond(templateId, params, outcomes, arbitrator, timeout, openingTs, nonce, 0);
    }

    /// @inheritdoc IRealityETHCore
    function askQuestion(
        uint256 templateId,
        string[] memory params,
        string[] memory outcomes,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce
    )
        external
        payable
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        return askQuestionWithMinBond(templateId, params, outcomes, arbitrator, timeout, openingTs, nonce, 0);
    }

    /// @inheritdoc IRealityETHCore
    function askQuestionWithMinBond(
        uint256 templateId,
        string[] memory params,
        string[] memory outcomes,
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
        if (templateId >= nextTemplateID) revert TemplateMustExist();

        // Resolve template defaults vs ask-time overrides (revert if the template fixes a field the asker also sent).
        arbitrator = _effectiveArbitrator(templateRegistry[templateId], arbitrator);
        minBond = _effectiveMinBond(templateRegistry[templateId], minBond);

        // abi.encode (not encodePacked): params/outcomes are dynamic string[], which packed encoding cannot represent unambiguously.
        bytes32 contentHash = keccak256(abi.encode(templateId, openingTs, params, outcomes));
        bytes32 questionId =
            keccak256(abi.encodePacked(contentHash, arbitrator, timeout, minBond, address(this), msg.sender, nonce));

        _askQuestion(questionId, templateId, contentHash, timeout, openingTs, msg.value);

        // Store the overridable fields on the question only when the template did NOT fix them (the asker
        // supplied them). When the template fixes a field, the question slot stays zero and reads fall back
        // to the template, saving a cold SSTORE. Scoped so these temporaries free before the emit below.
        {
            Template storage t = templateRegistry[templateId];
            if (!t.arbitratorFromTemplate && arbitrator != address(0)) {
                _questions[questionId].arbitrator = arbitrator;
            }
            if (!t.minBondFromTemplate && minBond != 0) {
                _questions[questionId].minBond = minBond;
                emit LogMinimumBond(questionId, minBond);
            }
            // Reverts unless the template/outcomes combination is valid; 0 for non-select types.
            uint256 outcomeCount = _resolveOutcomeCount(templateId, outcomes);
            if (outcomeCount != 0) {
                // forge-lint: disable-next-line(unsafe-typecast) -- outcome count is capped at 256
                _questions[questionId].outcomeCount = uint16(outcomeCount);
            }
        }

        // The stored question keeps only the content hash, so the raw params/outcomes go in the event.
        emit LogNewQuestion(
            questionId,
            msg.sender,
            templateId,
            params,
            outcomes,
            contentHash,
            arbitrator,
            timeout,
            openingTs,
            nonce,
            block.timestamp
        );

        return questionId;
    }

    function _askQuestion(
        bytes32 questionId,
        uint256 templateId,
        bytes32 contentHash,
        uint32 timeout,
        uint32 openingTs,
        uint256 tokens
    ) internal stateNotCreated(questionId) {
        // A timeout of 0 makes no sense, and we will use this to check existence
        if (timeout == 0) revert TimeoutMustBePositive();
        if (timeout >= 365 days) revert TimeoutMustBeLessThan365Days();

        // todo: replacement arbitration fee goes here

        _questions[questionId].contentHash = contentHash;
        _questions[questionId].openingTs = openingTs;
        _questions[questionId].timeout = timeout;
        // forge-lint: disable-next-line(unsafe-typecast) -- template ids are sequential and fit uint64
        _questions[questionId].templateId = uint64(templateId);
        // forge-lint: disable-next-line(unsafe-typecast) -- block.number fits uint64 on any real chain
        _questions[questionId].createdBlock = uint64(block.number);

        if (tokens > 0) {
            _questions[questionId].bounty = tokens;
            emit LogFundAnswerBounty(questionId, tokens, tokens, msg.sender);
        }
    }

    // Validate an answer against the question's template. Applied to every answer,
    // including arbitrator rulings (submitAnswerByArbitrator).
    function _validateAnswer(bytes32 questionId, bytes32 answer) internal view {
        // INVALID (0xff..ff) is always acceptable.
        if (answer == INVALID) {
            return;
        }
        Question storage q = _questions[questionId];
        Template storage t = templateRegistry[q.templateId];
        // ANSWERED_TOO_SOON (0xff..fe) is a valid sentinel only when the template opts in.
        if (answer == UNRESOLVED_ANSWER) {
            if (!t.hasAnsweredTooSoon) revert AnswerNotAllowedForTemplate();
            return;
        }
        AnswerType at = t.answerType;
        if (at == AnswerType.Bool) {
            if (uint256(answer) > 1) revert AnswerNotAllowedForTemplate();
        } else if (at == AnswerType.SingleSelect) {
            if (uint256(answer) >= q.outcomeCount) revert AnswerNotAllowedForTemplate();
        } else if (at == AnswerType.MultipleSelect) {
            uint256 n = q.outcomeCount;
            // every set bit must index an outcome; reject any bit at or above n
            if (n < 256 && (uint256(answer) >> n) != 0) revert AnswerNotAllowedForTemplate();
        }
        // Uint / Datetime / Hash accept any bytes32.
    }

    /// @inheritdoc IRealityETHCore
    function fundAnswerBounty(bytes32 questionId) external payable stateOpen(questionId) {
        _questions[questionId].bounty = _questions[questionId].bounty + msg.value;
        emit LogFundAnswerBounty(questionId, msg.value, _questions[questionId].bounty, msg.sender);
    }

    /// @inheritdoc IRealityETHCore
    function submitAnswer(bytes32 questionId, bytes32 answer, uint256 maxPrevious)
        external
        payable
        stateOpen(questionId)
        bondMustDoubleAndMatchMinimum(questionId, msg.value)
        previousBondMustNotBeatMaxPrevious(questionId, maxPrevious)
    {
        _validateAnswer(questionId, answer);
        _addAnswerToHistory(questionId, answer, msg.sender, msg.value);
        _updateCurrentAnswer(questionId, answer);
    }

    /// @inheritdoc IRealityETHCore
    function submitAnswerFor(bytes32 questionId, bytes32 answer, uint256 maxPrevious, address answerer)
        external
        payable
        stateOpen(questionId)
        bondMustDoubleAndMatchMinimum(questionId, msg.value)
        previousBondMustNotBeatMaxPrevious(questionId, maxPrevious)
    {
        if (answerer == NULL_ADDRESS) {
            revert AnswererMustBeNonZero();
        }
        _validateAnswer(questionId, answer);
        _addAnswerToHistory(questionId, answer, answerer, msg.value);
        _updateCurrentAnswer(questionId, answer);
    }

    function _addAnswerToHistory(bytes32 questionId, bytes32 answer, address answerer, uint256 bond) internal {
        bytes32 newHistoryHash =
            keccak256(abi.encodePacked(_questions[questionId].historyHash, answer, bond, answerer, false));

        // Update the current bond level, if there's a bond (ie anything except arbitration)
        if (bond > 0) {
            _questions[questionId].bond = bond;
        }
        _questions[questionId].historyHash = newHistoryHash;

        emit LogNewAnswer(answer, questionId, newHistoryHash, answerer, bond, block.timestamp, false);
    }

    function _updateCurrentAnswer(bytes32 questionId, bytes32 answer) internal {
        _questions[questionId].bestAnswer = answer;
        // forge-lint: disable-next-line(unsafe-typecast) -- safe until 2106; timeout capped at 1 year
        _questions[questionId].finalizeTs = uint32(block.timestamp) + _questions[questionId].timeout;
    }

    // Like _updateCurrentAnswer but without advancing the timeout
    function _updateCurrentAnswerByArbitrator(bytes32 questionId, bytes32 answer) internal {
        _questions[questionId].bestAnswer = answer;
        // forge-lint: disable-next-line(unsafe-typecast) -- safe until 2106
        _questions[questionId].finalizeTs = uint32(block.timestamp);
    }

    /// @inheritdoc IRealityETHCore
    function notifyOfArbitrationRequest(bytes32 questionId, address requester, uint256 maxPrevious)
        external
        onlyArbitrator(questionId)
        stateOpen(questionId)
        previousBondMustNotBeatMaxPrevious(questionId, maxPrevious)
    {
        if (_questions[questionId].finalizeTs <= UNANSWERED) {
            revert QuestionMustAlreadyHaveAnAnswerWhenArbitrationIsRequested();
        }
        _questions[questionId].isPendingArbitration = true;
        emit LogNotifyOfArbitrationRequest(questionId, requester);
    }

    /// @inheritdoc IRealityETHCore
    function cancelArbitration(bytes32 questionId)
        external
        onlyArbitrator(questionId)
        statePendingArbitration(questionId)
    {
        _questions[questionId].isPendingArbitration = false;
        // forge-lint: disable-next-line(unsafe-typecast) -- safe until 2106; timeout capped at 1 year
        _questions[questionId].finalizeTs = uint32(block.timestamp) + _questions[questionId].timeout;
        emit LogCancelArbitration(questionId);
    }

    /// @inheritdoc IRealityETHCore
    function submitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address answerer)
        public
        onlyArbitrator(questionId)
        statePendingArbitration(questionId)
    {
        if (answerer == NULL_ADDRESS) revert AnswererMustBeProvided();
        _validateAnswer(questionId, answer);
        emit LogFinalize(questionId, answer);

        _questions[questionId].isPendingArbitration = false;
        _addAnswerToHistory(questionId, answer, answerer, 0);
        _updateCurrentAnswerByArbitrator(questionId, answer);
    }

    /// @inheritdoc IRealityETHCore
    function assignWinnerAndSubmitAnswerByArbitrator(
        bytes32 questionId,
        bytes32 answer,
        address payeeIfWrong,
        bytes32 lastHistoryHash,
        bytes32 lastAnswer,
        address lastAnswerer
    ) external {
        _verifyHistoryInputOrRevert(
            _questions[questionId].historyHash, lastHistoryHash, lastAnswer, _questions[questionId].bond, lastAnswerer
        );

        address payee = (_questions[questionId].bestAnswer == answer) ? lastAnswerer : payeeIfWrong;
        submitAnswerByArbitrator(questionId, answer, payee);
    }

    /// @inheritdoc IRealityETHCore
    function isFinalized(bytes32 questionId) public view returns (bool) {
        uint32 finalizeTs = _questions[questionId].finalizeTs;
        // forge-lint: disable-next-line(unsafe-typecast) -- block.timestamp fits uint32 until 2106
        uint32 nowTs = uint32(block.timestamp);
        return !_questions[questionId].isPendingArbitration && finalizeTs > UNANSWERED && finalizeTs <= nowTs;
    }

    /// @inheritdoc IRealityETHCore
    function getFinalAnswer(bytes32 questionId) external view stateFinalized(questionId) returns (bytes32) {
        return _questions[questionId].bestAnswer;
    }

    /// @inheritdoc IRealityETHCore
    function resultFor(bytes32 questionId) public view stateFinalized(questionId) returns (bytes32) {
        return _questions[questionId].bestAnswer;
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
        string[] memory params,
        string[] memory outcomes,
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

        bytes32 contentHash = keccak256(abi.encode(templateId, openingTs, params, outcomes));

        // A reopening must exactly match the original question, except for the nonce and the creator
        if (contentHash != _questions[reopensQuestionId].contentHash) revert ContentHashMismatch();
        if (arbitrator != _questions[reopensQuestionId].arbitrator) revert ArbitratorMismatch();
        if (timeout != _questions[reopensQuestionId].timeout) revert TimeoutMismatch();
        if (openingTs != _questions[reopensQuestionId].openingTs) revert OpeningTsMismatch();
        if (minBond != _questions[reopensQuestionId].minBond) revert MinBondMismatch();

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

        bytes32 questionId =
            askQuestionWithMinBond(templateId, params, outcomes, arbitrator, timeout, openingTs, nonce, minBond);

        reopenedQuestions[reopensQuestionId] = questionId;
        reopenerQuestions[questionId] = true;

        _questions[questionId].bounty = _questions[takeBountyFromQuestionId].bounty + _questions[questionId].bounty;
        _questions[takeBountyFromQuestionId].bounty = 0;

        emit LogReopenQuestion(questionId, reopensQuestionId);

        return questionId;
    }

    /// @inheritdoc IRealityETHCore
    function getFinalAnswerIfMatches(
        bytes32 questionId,
        bytes32 contentHash,
        address arbitrator,
        uint32 minTimeout,
        uint256 minBond
    ) external view stateFinalized(questionId) returns (bytes32) {
        if (contentHash != _questions[questionId].contentHash) revert ContentHashMustMatch();
        if (arbitrator != _arbitratorOf(questionId)) revert ArbitratorMustMatch();
        if (minTimeout > _questions[questionId].timeout) revert TimeoutMustBeLongEnough();
        if (minBond > _questions[questionId].bond) revert BondMustBeHighEnough();
        return _questions[questionId].bestAnswer;
    }

    /// @inheritdoc IRealityETHCore
    function claimWinnings(
        bytes32 questionId,
        bytes32[] memory historyHashes,
        address[] memory addrs,
        uint256[] memory bonds,
        bytes32[] memory answers
    ) public stateFinalized(questionId) {
        if (historyHashes.length == 0) revert AtLeastOneHistoryHashEntryMustBeProvided();

        // These are only set if we split our claim over multiple transactions.
        address payee = questionClaims[questionId].payee;
        uint256 lastBond = questionClaims[questionId].lastBond;
        uint256 queuedFunds = 0;

        // Starts as the hash of the final answer submitted. It'll be cleared when we're done.
        // If we're splitting the claim over multiple transactions, it'll be the hash where we left off last time
        bytes32 lastHistoryHash = _questions[questionId].historyHash;

        bytes32 bestAnswer = _questions[questionId].bestAnswer;

        uint256 i;
        for (i = 0; i < historyHashes.length; i++) {
            _verifyHistoryInputOrRevert(lastHistoryHash, historyHashes[i], answers[i], bonds[i], addrs[i]);

            queuedFunds = queuedFunds + lastBond;
            (queuedFunds, payee) =
                _processHistoryItem(questionId, bestAnswer, queuedFunds, payee, addrs[i], bonds[i], answers[i]);

            // Line the bond up for next time, when it will be added to somebody's queuedFunds
            lastBond = bonds[i];

            // Burn (just leave in contract balance) a fraction of all bonds except the final one.
            // This creates a cost to increasing your own bond, which could be used to delay resolution maliciously
            if (lastBond != _questions[questionId].bond) {
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

        _questions[questionId].historyHash = lastHistoryHash;
    }

    function _payPayee(bytes32 questionId, address payee, uint256 value) internal {
        balanceOf[payee] = balanceOf[payee] + value;
        emit LogClaim(questionId, payee, value);
    }

    function _verifyHistoryInputOrRevert(
        bytes32 lastHistoryHash,
        bytes32 historyHash,
        bytes32 answer,
        uint256 bond,
        address addr
    ) internal pure {
        if (lastHistoryHash != keccak256(abi.encodePacked(historyHash, answer, bond, addr, false))) {
            revert HistoryInputProvidedDidNotMatchTheExpectedHash();
        }
    }

    function _processHistoryItem(
        bytes32 questionId,
        bytes32 bestAnswer,
        uint256 queuedFunds,
        address payee,
        address addr,
        uint256 bond,
        bytes32 answer
    ) internal returns (uint256, address) {
        if (answer == bestAnswer) {
            if (payee == NULL_ADDRESS) {
                // The entry is for the first payee we come to, ie the winner.
                // They get the question bounty.
                payee = addr;

                if (bestAnswer != UNRESOLVED_ANSWER && _questions[questionId].bounty > 0) {
                    _payPayee(questionId, payee, _questions[questionId].bounty);
                    _questions[questionId].bounty = 0;
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
        return _questions[questionId].contentHash;
    }

    /// @inheritdoc IRealityETHCore
    function getArbitrator(bytes32 questionId) public view returns (address) {
        return _arbitratorOf(questionId);
    }

    /// @inheritdoc IRealityETHCore
    function getOpeningTS(bytes32 questionId) public view returns (uint32) {
        return _questions[questionId].openingTs;
    }

    /// @inheritdoc IRealityETHCore
    function getTimeout(bytes32 questionId) public view returns (uint32) {
        return _questions[questionId].timeout;
    }

    /// @inheritdoc IRealityETHCore
    function getFinalizeTS(bytes32 questionId) public view returns (uint32) {
        return _questions[questionId].finalizeTs;
    }

    /// @inheritdoc IRealityETHCore
    function isPendingArbitration(bytes32 questionId) public view returns (bool) {
        return _questions[questionId].isPendingArbitration;
    }

    /// @inheritdoc IRealityETHCore
    function getBounty(bytes32 questionId) public view returns (uint256) {
        return _questions[questionId].bounty;
    }

    /// @inheritdoc IRealityETHCore
    function getBestAnswer(bytes32 questionId) public view returns (bytes32) {
        return _questions[questionId].bestAnswer;
    }

    /// @inheritdoc IRealityETHCore
    function getHistoryHash(bytes32 questionId) public view returns (bytes32) {
        return _questions[questionId].historyHash;
    }

    /// @inheritdoc IRealityETHCore
    function getBond(bytes32 questionId) public view returns (uint256) {
        return _questions[questionId].bond;
    }

    /// @inheritdoc IRealityETHCore
    function getMinBond(bytes32 questionId) public view returns (uint256) {
        return _minBondOf(questionId);
    }
}
