// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETHCore} from "./interfaces/IRealityETHCore.sol";
import {BalanceHolder} from "./BalanceHolder.sol";
import {AnswerType, Template, BondLevel} from "./RealityETHTypes.sol";

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

    // Upper bound for a Uint template's decimals. 63 is a round 6-bit cap, far above any realistic
    // precision (the default is 18) and well under the point a uint256 answer stops being able to
    // represent whole units (10**78 > 2**256).
    uint8 private constant MAX_DECIMALS = 63;

    // Fees that would otherwise be burned (the bond-claim fee, and the bond-level fee when there is no
    // arbitrator) are credited here instead; address(0) keeps the old burn behaviour. Set at creation.
    address public immutable treasury;

    uint256 private nextTemplateID = 0;
    mapping(uint256 templateId => Template template) internal templateRegistry;
    // Per-template bond levels (empty for most templates). Kept in its own mapping rather than
    // inlined into Template so adding the feature doesn't churn every Template literal; it is still
    // strictly per-template (set atomically in createTemplate(template, levels)), not a shared registry.
    mapping(uint256 templateId => BondLevel[] levels) internal templateBondLevels;
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

    modifier previousBondMustNotBeatMaxPrevious(bytes32 questionId, uint256 maxPrevious) {
        if (maxPrevious > 0) {
            if (_questions[questionId].bond > maxPrevious) revert BondMustExceedMaxPrevious();
        }
        _;
    }

    /// @notice Constructor, sets up some initial templates
    /// @dev Creates some generalized templates for different question types used in the DApp.
    constructor(address _treasury) {
        treasury = _treasury;
        createInitialTemplates();
    }

    /// @inheritdoc IRealityETHCore
    function createInitialTemplates() public {
        if (nextTemplateID != 0) revert TemplatesAlreadyCreated();
        // Generalized defaults: 0 bool, 1 uint, 2 single-select, 3 multiple-select, 4 datetime
        // (the historical reality.eth ids) and 5 assertion (new in v4): the asker
        // supplies the whole title via params[0] (a single "" interpolation slot). The
        // select types carry no preset outcomes here, so the asker supplies them per
        // question at ask time. Every default declares English (lang "en").
        string[] memory titleOnly = new string[](1); // one "" interpolation slot
        string[] memory noOutcomes = new string[](0);
        createTemplate(
            Template(
                AnswerType.Bool,
                0,
                true,
                false,
                false,
                true,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                "en"
            )
        );
        createTemplate(
            Template(
                AnswerType.Uint,
                18,
                true,
                false,
                false,
                true,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                "en"
            )
        );
        createTemplate(
            Template(
                AnswerType.SingleSelect,
                0,
                true,
                false,
                false,
                true,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                "en"
            )
        );
        createTemplate(
            Template(
                AnswerType.MultipleSelect,
                0,
                true,
                false,
                false,
                true,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                "en"
            )
        );
        createTemplate(
            Template(
                AnswerType.Datetime,
                0,
                true,
                false,
                false,
                true,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                "en"
            )
        );
        createTemplate(
            Template(
                AnswerType.Assertion,
                0,
                true,
                false,
                false,
                true,
                false,
                false,
                address(0),
                0,
                titleOnly,
                noOutcomes,
                "",
                "",
                "en"
            )
        );
    }

    /// @inheritdoc IRealityETHCore
    function createTemplate(Template memory template) public stateAny returns (uint256) {
        return _createTemplate(template);
    }

    function _createTemplate(Template memory template) internal returns (uint256 id) {
        _validateTemplate(template);
        id = nextTemplateID;
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
    function createTemplate(Template memory template, BondLevel[] calldata levels)
        public
        stateAny
        returns (uint256 id)
    {
        id = _createTemplate(template);
        _validateBondLevels(levels);
        // Copy element-by-element: the legacy codegen can't assign a calldata struct array to storage.
        BondLevel[] storage stored = templateBondLevels[id];
        for (uint256 i = 0; i < levels.length; i++) {
            stored.push(levels[i]);
        }
        return id;
    }

    /// @inheritdoc IRealityETHCore
    function getTemplateBondLevels(uint256 templateId) external view returns (BondLevel[] memory) {
        return templateBondLevels[templateId];
    }

    /// @inheritdoc IRealityETHCore
    function getBondLevels(bytes32 questionId) external view returns (BondLevel[] memory out) {
        BondLevel[] storage levels = templateBondLevels[_questions[questionId].templateId];
        out = new BondLevel[](levels.length + 1);
        out[0] = BondLevel(100, 100, 0); // the implicit base level at minBond
        for (uint256 i = 0; i < levels.length; i++) {
            out[i + 1] = levels[i];
        }
        return out;
    }

    /// @inheritdoc IRealityETHCore
    function getTemplateForQuestion(bytes32 questionId) external view returns (Template memory) {
        return templateRegistry[_questions[questionId].templateId];
    }

    /// @inheritdoc IRealityETHCore
    function getBondSettingsForValue(bytes32 questionId, uint256 value)
        external
        view
        returns (uint256 bond, uint256 fee, uint256 timeoutPct, uint32 effectiveTimeout)
    {
        (bond, fee, timeoutPct) = _applyBondLevels(questionId, value);
        effectiveTimeout = _effectiveTimeout(questionId, timeoutPct);
        return (bond, fee, timeoutPct, effectiveTimeout);
    }

    /// @inheritdoc IRealityETHCore
    function getAnswerFeeForBond(bytes32 questionId, uint256 targetBond) external view returns (uint256 fee) {
        BondLevel[] storage levels = templateBondLevels[_questions[questionId].templateId];
        if (levels.length == 0) {
            return 0; // no fee
        }
        // Tiers are keyed on the bond, so the fee is a direct lookup: find the highest level whose
        // threshold (a percentage of minBond) the target bond reaches, and take that level's fee of the
        // bond. Send targetBond + fee to post a bond of exactly targetBond.
        uint256 minBond = _minBondOf(questionId);
        uint256 feePct = 0;
        uint256 n = levels.length;
        for (uint256 i = 0; i < n; i++) {
            if (targetBond * 100 >= minBond * levels[i].bondThresholdPct) {
                feePct = levels[i].feePct;
            } else {
                break;
            }
        }
        return targetBond * feePct / 100;
    }

    // Validate bond levels: <=255 points; thresholds strictly increasing and above the
    // implicit 100% point; timeouts non-decreasing and at least 100%; fee at most 100%.
    function _validateBondLevels(BondLevel[] calldata levels) internal pure {
        uint256 n = levels.length;
        if (n > 255) revert BondLevelsInvalid();
        uint32 prevThreshold = 100; // implicit first level is [100, 100, 0] at minBond
        uint16 prevTimeout = 100;
        uint8 prevFee = 0;
        for (uint256 i = 0; i < n; i++) {
            if (levels[i].bondThresholdPct <= prevThreshold) revert BondLevelsInvalid();
            if (levels[i].timeoutPct < prevTimeout) revert BondLevelsInvalid();
            // fees must not decrease: tiers are keyed on the bond, so a higher bond must not pay less
            if (levels[i].feePct < prevFee) revert BondLevelsInvalid();
            if (levels[i].feePct > 100) revert BondLevelsInvalid();
            prevThreshold = levels[i].bondThresholdPct;
            prevTimeout = levels[i].timeoutPct;
            prevFee = levels[i].feePct;
        }
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
        if (template.answerType == AnswerType.Uint) {
            if (template.decimals > MAX_DECIMALS) revert TemplateDecimalsInvalid();
        } else if (template.decimals != 0) {
            revert TemplateDecimalsInvalid();
        }
        // tri-state: a field flagged unused must not carry a preset string
        if (!template.hasDescription && bytes(template.description).length != 0) revert TemplateFieldInvalid();
        if (!template.hasCategory && bytes(template.category).length != 0) revert TemplateFieldInvalid();
        if (!template.hasLang && bytes(template.lang).length != 0) revert TemplateFieldInvalid();
    }

    // Resolve the effective outcome count for a question: the template's preset outcomes if it has any,
    // otherwise the asker-supplied `outcomes`. Non-select templates must get no outcomes. Returns 0 for
    // non-select types. The strings themselves live only in the content hash and event; the count is what
    // answer validation needs on-chain.
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

    // The number of interpolation slots in a template's title: each empty-string entry in titleParts
    // is a slot the asker fills with one param. Templates are small, so the scan is cheap.
    function _titleSlotCount(uint256 templateId) internal view returns (uint256 slots) {
        string[] storage parts = templateRegistry[templateId].titleParts;
        uint256 n = parts.length;
        for (uint256 i = 0; i < n; i++) {
            if (bytes(parts[i]).length == 0) slots++;
        }
        return slots;
    }

    // Effective arbitrator for a new question: the template's if it fixes one, else the ask-time
    // override. Reverts if the template fixes it and the asker also supplied one.
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

    // Read the effective arbitrator of an existing question: the template's when the template fixes it
    // (arbitratorFromTemplate), otherwise the per-question value (which is only written when the asker supplied one).
    function _arbitratorOf(bytes32 questionId) internal view returns (address) {
        Template storage t = templateRegistry[_questions[questionId].templateId];
        return t.arbitratorFromTemplate ? t.arbitrator : _questions[questionId].arbitrator;
    }

    // Read the effective minBond of an existing question: the template's when the template fixes it
    // (minBondFromTemplate), otherwise the per-question value.
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
        // The asker must supply exactly one param per interpolation slot in the template title.
        if (params.length != _titleSlotCount(templateId)) revert ParamsLengthMismatch();

        // Resolve template defaults vs ask-time overrides (revert if the template fixes a field the asker also sent).
        arbitrator = _effectiveArbitrator(templateRegistry[templateId], arbitrator);
        minBond = _effectiveMinBond(templateRegistry[templateId], minBond);
        // Bond levels measure thresholds as a percentage of minBond, so it needs a positive one.
        if (templateBondLevels[templateId].length != 0 && minBond == 0) revert MinBondRequiredForBondLevels();

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
            arbitrator,
            timeout,
            minBond,
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

    // Validate a user-submitted answer against the question's template. Arbitrator
    // answers (submitAnswerByArbitrator) bypass this: the arbitrator adjudicates.
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
        } else if (at == AnswerType.Assertion) {
            // only "true"; INVALID and (if enabled) too-soon were already accepted above
            if (uint256(answer) != 1) revert AnswerNotAllowedForTemplate();
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
        previousBondMustNotBeatMaxPrevious(questionId, maxPrevious)
    {
        _submitAnswer(questionId, answer, msg.sender);
    }

    /// @inheritdoc IRealityETHCore
    function submitAnswerFor(bytes32 questionId, bytes32 answer, uint256 maxPrevious, address answerer)
        external
        payable
        stateOpen(questionId)
        previousBondMustNotBeatMaxPrevious(questionId, maxPrevious)
    {
        if (answerer == NULL_ADDRESS) {
            revert AnswererMustBeNonZero();
        }
        _submitAnswer(questionId, answer, answerer);
    }

    // Shared answer path: resolve the bond levels (bond + fee + timeout multiplier) from the
    // value sent, enforce the bond rules on the derived bond, validate the answer, record it with the
    // levels-scaled timeout, and credit any extra fee to the arbitrator.
    function _submitAnswer(bytes32 questionId, bytes32 answer, address answerer) internal {
        (uint256 bond, uint256 fee, uint256 timeoutPct) = _applyBondLevels(questionId, msg.value);
        _requireBondValid(questionId, bond);
        _validateAnswer(questionId, answer);
        _addAnswerToHistory(questionId, answer, answerer, bond);
        _updateCurrentAnswer(questionId, answer, _effectiveTimeout(questionId, timeoutPct));
        if (fee > 0) {
            // fee goes to the arbitrator; when there is no arbitrator (0x0) it goes to the treasury
            // instead (a 0x0 treasury then burns it, as before)
            address arbitrator = _arbitratorOf(questionId);
            address recipient = arbitrator == NULL_ADDRESS ? treasury : arbitrator;
            balanceOf[recipient] = balanceOf[recipient] + fee;
            emit LogBondLevelFeePaid(questionId, recipient, fee);
        }
    }

    // Split the value sent into a bond and an extra arbitrator fee per the template's levels, and report
    // the timeout multiplier for the applicable level. No bond levels => (value, 0, 100%). The tier is keyed
    // on the resulting bond (see below); the fee is taken on top, so bond = value*100/(100+feePct) and
    // fee = value - bond (they sum back exactly).
    function _applyBondLevels(bytes32 questionId, uint256 value)
        internal
        view
        returns (uint256 bond, uint256 fee, uint256 timeoutPct)
    {
        BondLevel[] storage levels = templateBondLevels[_questions[questionId].templateId];
        if (levels.length == 0) {
            return (value, 0, 100);
        }
        // Tiers are keyed on the resulting bond (as a percentage of minBond), with the fee phasing in
        // across each threshold. Within a tier the bond climbs with the value; at a threshold it holds
        // (a plateau) while the extra fee ramps from the lower tier's rate up to this tier's rate, then
        // climbs again -- so the recorded bond is a continuous, non-decreasing function of the value.
        uint256 minBond = _minBondOf(questionId); // > 0 guaranteed for bond levels at ask time
        uint256 feePct = 0;
        timeoutPct = 100; // implicit first level [100, 100, 0]
        uint256 n = levels.length;
        for (uint256 i = 0; i < n; i++) {
            // threshold scaled by 100 so it compares against value * 10000 without dividing first
            uint256 threshold = minBond * levels[i].bondThresholdPct;
            // Below this threshold at the current (lower) fee? Then the bond belongs in the current tier.
            if (value * 10000 < threshold * (100 + feePct)) break;
            // Reached it, but not enough value to also cover this level's fee on the threshold? Plateau:
            // pin the bond at the threshold and take the remainder as the (partial) fee.
            if (value * 10000 < threshold * (100 + levels[i].feePct)) {
                bond = threshold / 100;
                fee = value - bond;
                return (bond, fee, levels[i].timeoutPct);
            }
            // Past the plateau: this level's fee is fully covered, so adopt it and keep climbing.
            feePct = levels[i].feePct;
            timeoutPct = levels[i].timeoutPct;
        }
        bond = value * 100 / (100 + feePct);
        fee = value - bond;
        return (bond, fee, timeoutPct);
    }

    // The base timeout scaled by the bond level's percentage, clamped to 365 days (so finalizeTs can't
    // overflow uint32). timeoutPct >= 100 always, so this never rounds below the base.
    function _effectiveTimeout(bytes32 questionId, uint256 timeoutPct) internal view returns (uint32) {
        uint256 eff = uint256(_questions[questionId].timeout) * timeoutPct / 100;
        if (eff > 365 days) eff = 365 days;
        // forge-lint: disable-next-line(unsafe-typecast) -- clamped to 365 days, well within uint32
        return uint32(eff);
    }

    // Bond rules on the (levels-derived) bond: positive, and >= minBond on the first answer or at least
    // double the previous bond thereafter. Replaces the bondMustDoubleAndMatchMinimum modifier.
    function _requireBondValid(bytes32 questionId, uint256 bond) internal view {
        if (bond == 0) revert BondMustBePositive();
        uint256 currentBond = _questions[questionId].bond;
        if (currentBond == 0) {
            if (bond < _minBondOf(questionId)) revert BondMustExceedTheMinimum();
        } else {
            if (bond < (currentBond * 2)) revert BondMustBeDoubleAtLeastPreviousBond();
        }
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

    function _updateCurrentAnswer(bytes32 questionId, bytes32 answer, uint32 effectiveTimeout) internal {
        _questions[questionId].bestAnswer = answer;
        // forge-lint: disable-next-line(unsafe-typecast) -- safe until 2106; effectiveTimeout clamped to 1 year
        _questions[questionId].finalizeTs = uint32(block.timestamp) + effectiveTimeout;
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
        if (contentHash != _questions[questionId].contentHash) revert ContentHashMismatch();
        if (arbitrator != _arbitratorOf(questionId)) revert ArbitratorMismatch();
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

            // Take a fraction of all bonds except the final one and credit it to the treasury (a 0x0
            // treasury leaves it in the contract, ie burned, as before). This creates a cost to
            // increasing your own bond, which could be used to delay resolution maliciously.
            if (lastBond != _questions[questionId].bond) {
                uint256 claimFee = lastBond / BOND_CLAIM_FEE_PROPORTION;
                lastBond = lastBond - claimFee;
                balanceOf[treasury] = balanceOf[treasury] + claimFee;
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
