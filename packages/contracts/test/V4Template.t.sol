// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_v4_0} from "../src/RealityETH-4.0.sol";
import {IRealityETHErrors} from "../src/interfaces/IRealityETHErrors.sol";
import {AnswerType, Template} from "../src/RealityETHTypes.sol";

/// New-ABI tests for the v4 structured template system: createTemplate(Template),
/// string[] params, ask-time string[] outcomes, and on-chain answer validation.
/// Deploys the source directly; the version-matrix harness (RealityETHBase)
/// predates this ABI and does not cover it.
contract V4TemplateTest is Test {
    RealityETH_v4_0 internal rc;
    address internal arb = address(0xA4B);

    bytes32 internal constant INVALID = bytes32(type(uint256).max); // 0xff..ff
    bytes32 internal constant TOO_SOON = bytes32(type(uint256).max - 1); // 0xff..fe

    function setUp() public {
        rc = new RealityETH_v4_0();
        vm.deal(address(this), 100 ether);
    }

    function _one(string memory s) internal pure returns (string[] memory a) {
        a = new string[](1);
        a[0] = s;
    }

    function _none() internal pure returns (string[] memory) {
        return new string[](0);
    }

    function _rgb() internal pure returns (string[] memory a) {
        a = new string[](3);
        a[0] = "Red";
        a[1] = "Green";
        a[2] = "Blue";
    }

    function _selectTemplate(AnswerType at, string[] memory presetOutcomes) internal pure returns (Template memory) {
        return
            Template(
                at, 0, false, false, false, false, false, false, address(0), 0, _one(""), presetOutcomes, "", "", ""
            );
    }

    // ---- default templates --------------------------------------------------

    function test_default_templates() public view {
        assertEq(uint256(rc.getTemplate(0).answerType), uint256(AnswerType.Bool));
        assertEq(uint256(rc.getTemplate(1).answerType), uint256(AnswerType.Uint));
        assertEq(uint256(rc.getTemplate(1).decimals), 18);
        assertEq(uint256(rc.getTemplate(2).answerType), uint256(AnswerType.Datetime));
    }

    function test_getTemplate_out_of_range_reverts() public {
        vm.expectRevert(IRealityETHErrors.TemplateMustExist.selector);
        rc.getTemplate(3);
    }

    // ---- asking -------------------------------------------------------------

    function test_ask_stores_template_and_block() public {
        bytes32 qid = rc.askQuestion(0, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        assertEq(uint256(rc.questions(qid).templateId), 0);
        assertEq(uint256(rc.questions(qid).createdBlock), block.number);
        assertEq(uint256(rc.questions(qid).outcomeCount), 0);
    }

    function test_ask_unknown_template_reverts() public {
        vm.expectRevert(IRealityETHErrors.TemplateMustExist.selector);
        rc.askQuestion(99, _one("Nope"), _none(), arb, 30, 0, 0);
    }

    // ---- answer validation --------------------------------------------------

    function test_bool_answer_validation() public {
        bytes32 qid = rc.askQuestion(0, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        rc.submitAnswer{value: 1}(qid, bytes32(uint256(1)), 0); // in-range
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswer{value: 2}(qid, bytes32(uint256(2)), 0); // out of {0,1}
    }

    function test_invalid_allowed_too_soon_gated() public {
        bytes32 qid = rc.askQuestion(0, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        rc.submitAnswer{value: 1}(qid, INVALID, 0); // always acceptable
        // bool default has hasAnsweredTooSoon = false, so the sentinel is banned
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswer{value: 2}(qid, TOO_SOON, 0);
    }

    // outcomes supplied at ask time
    function test_single_select_ask_time_outcomes() public {
        uint256 id = rc.createTemplate(_selectTemplate(AnswerType.SingleSelect, _none()));
        bytes32 qid = rc.askQuestion(id, _one("Favourite colour?"), _rgb(), arb, 30, 0, 0);
        assertEq(uint256(rc.questions(qid).outcomeCount), 3);
        rc.submitAnswer{value: 1}(qid, bytes32(uint256(2)), 0); // index 2 = Blue
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswer{value: 2}(qid, bytes32(uint256(3)), 0); // no such outcome
    }

    // outcomes preset in the template (gas-saving default), asker passes none
    function test_single_select_template_default_outcomes() public {
        uint256 id = rc.createTemplate(_selectTemplate(AnswerType.SingleSelect, _rgb()));
        bytes32 qid = rc.askQuestion(id, _one("Favourite colour?"), _none(), arb, 30, 0, 0);
        assertEq(uint256(rc.questions(qid).outcomeCount), 3);
        rc.submitAnswer{value: 1}(qid, bytes32(uint256(0)), 0); // Red
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswer{value: 2}(qid, bytes32(uint256(3)), 0);
    }

    // ---- ask-time outcome validation ---------------------------------------

    function test_ask_outcomes_rejected_for_nonselect() public {
        vm.expectRevert(IRealityETHErrors.OutcomesInvalid.selector);
        rc.askQuestion(0, _one("Will it rain?"), _rgb(), arb, 30, 0, 0); // bool + outcomes
    }

    function test_ask_outcomes_required_for_select() public {
        uint256 id = rc.createTemplate(_selectTemplate(AnswerType.SingleSelect, _none()));
        vm.expectRevert(IRealityETHErrors.OutcomesInvalid.selector);
        rc.askQuestion(id, _one("Colour?"), _none(), arb, 30, 0, 0); // select, none supplied, none preset
    }

    function test_ask_outcomes_rejected_when_template_presets() public {
        uint256 id = rc.createTemplate(_selectTemplate(AnswerType.SingleSelect, _rgb()));
        vm.expectRevert(IRealityETHErrors.OutcomesInvalid.selector);
        rc.askQuestion(id, _one("Colour?"), _rgb(), arb, 30, 0, 0); // can't supply when preset
    }

    // ---- template validation ------------------------------------------------

    function test_template_validation_rejects_bad() public {
        string[] memory none = _none();
        // decimals set on a non-Uint type
        vm.expectRevert(IRealityETHErrors.TemplateDecimalsInvalid.selector);
        rc.createTemplate(
            Template(
                AnswerType.Bool, 5, false, false, false, false, false, false, address(0), 0, _one(""), none, "", "", ""
            )
        );
        // outcomes on a non-select template
        vm.expectRevert(IRealityETHErrors.TemplateOutcomesInvalid.selector);
        rc.createTemplate(
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
                _one(""),
                _rgb(),
                "",
                "",
                ""
            )
        );
        // preset value on a field flagged unused (hasLang=false but lang set)
        vm.expectRevert(IRealityETHErrors.TemplateFieldInvalid.selector);
        rc.createTemplate(
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
                _one(""),
                none,
                "",
                "",
                "en"
            )
        );
        // empty title
        vm.expectRevert(IRealityETHErrors.TemplateTitleRequired.selector);
        rc.createTemplate(
            Template(
                AnswerType.Bool, 0, false, false, false, false, false, false, address(0), 0, none, none, "", "", ""
            )
        );
    }

    // a select template with no preset outcomes is now valid (asker supplies per question)
    function test_select_template_without_outcomes_is_valid() public {
        uint256 id = rc.createTemplate(_selectTemplate(AnswerType.SingleSelect, _none()));
        assertEq(uint256(rc.getTemplate(id).answerType), uint256(AnswerType.SingleSelect));
        assertEq(rc.getTemplate(id).outcomes.length, 0);
    }

    // ---- arbitrator: template default vs ask-time override ------------------

    function _boolTemplate(bool arbFromTpl, address arbitrator, bool minBondFromTpl, uint256 minBond)
        internal
        pure
        returns (Template memory)
    {
        return Template(
            AnswerType.Bool,
            0,
            false,
            false,
            false,
            false,
            arbFromTpl,
            minBondFromTpl,
            arbitrator,
            minBond,
            _one(""),
            _none(),
            "",
            "",
            ""
        );
    }

    function test_arbitrator_from_template_not_stored() public {
        uint256 id = rc.createTemplate(_boolTemplate(true, arb, false, 0));
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), address(0), 30, 0, 0); // inherit arbitrator
        assertEq(rc.getArbitrator(qid), arb); // effective = template's
        assertEq(rc.questions(qid).arbitrator, address(0)); // per-question slot left unwritten
    }

    function test_arbitrator_from_template_authorizes() public {
        uint256 id = rc.createTemplate(_boolTemplate(true, arb, false, 0));
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), address(0), 30, 0, 0);
        rc.submitAnswer{value: 1}(qid, bytes32(uint256(1)), 0);
        // onlyArbitrator resolves via the template, so the template arbitrator can drive arbitration
        vm.prank(arb);
        rc.notifyOfArbitrationRequest(qid, address(this), 0);
        vm.prank(arb);
        rc.submitAnswerByArbitrator(qid, bytes32(uint256(0)), address(this));
        assertEq(rc.getFinalAnswer(qid), bytes32(uint256(0)));
    }

    function test_arbitrator_asker_supplied_is_stored() public {
        uint256 id = rc.createTemplate(_boolTemplate(false, address(0), false, 0)); // template leaves it open
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), arb, 30, 0, 0);
        assertEq(rc.getArbitrator(qid), arb);
        assertEq(rc.questions(qid).arbitrator, arb); // stored per-question
    }

    function test_arbitrator_override_conflict_reverts() public {
        uint256 id = rc.createTemplate(_boolTemplate(true, arb, false, 0));
        vm.expectRevert(IRealityETHErrors.OverrideNotAllowed.selector);
        rc.askQuestion(id, _one("Q?"), _none(), address(0xBEEF), 30, 0, 0); // can't override a fixed arbitrator
    }

    // ---- minBond: template default vs ask-time override ---------------------

    function test_minbond_from_template_enforced_not_stored() public {
        uint256 id = rc.createTemplate(_boolTemplate(true, arb, true, 1000));
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), address(0), 30, 0, 0); // inherit minBond
        assertEq(rc.getMinBond(qid), 1000); // effective = template's
        assertEq(rc.questions(qid).minBond, 0); // per-question slot left unwritten
        // the template minBond is enforced on the first answer
        vm.expectRevert(IRealityETHErrors.BondMustExceedTheMinimum.selector);
        rc.submitAnswer{value: 999}(qid, bytes32(uint256(1)), 0);
        rc.submitAnswer{value: 1000}(qid, bytes32(uint256(1)), 0); // meets the minimum
    }

    function test_minbond_override_conflict_reverts() public {
        uint256 id = rc.createTemplate(_boolTemplate(true, arb, true, 1000));
        vm.expectRevert(IRealityETHErrors.OverrideNotAllowed.selector);
        rc.askQuestionWithMinBond(id, _one("Q?"), _none(), address(0), 30, 0, 0, 5); // can't override a fixed minBond
    }

    // the flags let a template FIX a field to zero (which plain 0=inherit could not express)

    function test_template_can_fix_arbitrator_to_zero() public {
        // arbitratorFromTemplate = true with arbitrator == address(0): "no arbitrator, and nobody may add one"
        uint256 id = rc.createTemplate(_boolTemplate(true, address(0), false, 0));
        vm.expectRevert(IRealityETHErrors.OverrideNotAllowed.selector);
        rc.askQuestion(id, _one("Q?"), _none(), arb, 30, 0, 0); // asker may not supply one
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), address(0), 30, 0, 0);
        assertEq(rc.getArbitrator(qid), address(0));
    }

    function test_template_can_fix_minbond_to_zero() public {
        // minBondFromTemplate = true with minBond == 0: "no minimum bond, and the asker may not set one"
        uint256 id = rc.createTemplate(_boolTemplate(false, arb, true, 0));
        vm.expectRevert(IRealityETHErrors.OverrideNotAllowed.selector);
        rc.askQuestionWithMinBond(id, _one("Q?"), _none(), arb, 30, 0, 0, 5); // asker may not set a minimum
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), arb, 30, 0, 0);
        assertEq(rc.getMinBond(qid), 0);
    }
}
