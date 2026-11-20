// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_ERC20_v4_0} from "../src/RealityETH_ERC20-4.0.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {IRealityETHErrors} from "../src/interfaces/IRealityETHErrors.sol";
import {IRealityETHErrors_ERC20} from "../src/interfaces/IRealityETHErrors_ERC20.sol";
import {AnswerType, Template} from "../src/RealityETHTypes.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

/// New-ABI tests for the v4 structured template system on the ERC20 core: mirrors
/// V4Template.t.sol (which covers the ETH core) with token-amount ask/answer variants.
contract V4TemplateERC20Test is Test {
    RealityETH_ERC20_v4_0 internal rc;
    MockERC20 internal token;
    address internal arb = address(0xA4B);

    bytes32 internal constant INVALID = bytes32(type(uint256).max); // 0xff..ff
    bytes32 internal constant TOO_SOON = bytes32(type(uint256).max - 1); // 0xff..fe

    function setUp() public {
        token = new MockERC20();
        rc = new RealityETH_ERC20_v4_0(IERC20(address(token)), address(0));
        token.mint(address(this), 1_000_000 ether);
        token.approve(address(rc), type(uint256).max);
    }

    // ---- token initialization ----------------------------------------------

    // Constructor path: setUp deployed rc with the token, so it is wired and a second set reverts.
    function test_token_set_in_constructor() public view {
        assertEq(address(rc.token()), address(token), "token set via constructor");
    }

    function test_setToken_reverts_once_set() public {
        vm.expectRevert(IRealityETHErrors_ERC20.TokenCanOnlyBeInitializedOnce.selector);
        rc.setToken(IERC20(address(token)));
    }

    // Deferred path (used by clones): construct with the zero address, then set once via setToken.
    function test_token_set_via_setToken_when_deferred() public {
        RealityETH_ERC20_v4_0 rc2 = new RealityETH_ERC20_v4_0(IERC20(address(0)), address(0));
        assertEq(address(rc2.token()), address(0), "token deferred at construction");
        rc2.setToken(IERC20(address(token)));
        assertEq(address(rc2.token()), address(token), "token set via setToken");
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

    function _selectTemplate(string[] memory presetOutcomes) internal pure returns (Template memory) {
        return Template(
            AnswerType.SingleSelect,
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
            presetOutcomes,
            "",
            "",
            ""
        );
    }

    function _assertionTemplate(bool tooSoon) internal pure returns (Template memory) {
        return Template(
            AnswerType.Assertion,
            0,
            tooSoon,
            false,
            false,
            false,
            false,
            false,
            address(0),
            0,
            _one(""),
            _none(),
            "",
            "",
            ""
        );
    }

    function test_assertion_answer_validation() public {
        uint256 id = rc.createTemplate(_assertionTemplate(true));
        bytes32 qid = rc.askQuestion(id, _one("Did it happen?"), _none(), arb, 30, 0, 0);
        // 0 ("no") is not a valid answer
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswerERC20(qid, bytes32(uint256(0)), 0, 1);
        // only 1 ("true") is accepted
        rc.submitAnswerERC20(qid, bytes32(uint256(1)), 0, 1);
        assertEq(rc.questions(qid).bond, 1, "true recorded");
        // the universal sentinels are accepted (too-soon flag on)
        rc.submitAnswerERC20(qid, INVALID, 0, 2);
        rc.submitAnswerERC20(qid, TOO_SOON, 0, 4);
    }

    // ---- defaults + basic asking ------------------------------------------

    function test_default_templates() public view {
        assertEq(uint256(rc.getTemplate(0).answerType), uint256(AnswerType.Bool));
        assertEq(uint256(rc.getTemplate(1).answerType), uint256(AnswerType.Uint));
        assertEq(uint256(rc.getTemplate(2).answerType), uint256(AnswerType.SingleSelect));
        assertEq(uint256(rc.getTemplate(3).answerType), uint256(AnswerType.MultipleSelect));
        assertEq(uint256(rc.getTemplate(4).answerType), uint256(AnswerType.Datetime));
        assertEq(uint256(rc.getTemplate(5).answerType), uint256(AnswerType.Assertion));
        assertTrue(rc.getTemplate(0).hasAnsweredTooSoon, "defaults opt into the too-soon sentinel");
        assertTrue(rc.getTemplate(0).hasLang, "defaults declare a language");
        assertEq(rc.getTemplate(0).lang, "en", "defaults declare English");
    }

    // a title with two interpolation slots: ["Will ", "", " beat ", "", "?"]
    function _twoSlotTemplate() internal pure returns (Template memory) {
        string[] memory parts = new string[](5);
        parts[0] = "Will ";
        parts[1] = "";
        parts[2] = " beat ";
        parts[3] = "";
        parts[4] = "?";
        return Template(
            AnswerType.Uint, 0, false, false, false, false, false, false, address(0), 0, parts, _none(), "", "", ""
        );
    }

    function test_params_must_match_title_slots() public {
        vm.expectRevert(IRealityETHErrors.ParamsLengthMismatch.selector);
        rc.askQuestion(0, _none(), _none(), arb, 30, 0, 0); // 0 params for template 0's single slot

        string[] memory two = new string[](2);
        two[0] = "Alice";
        two[1] = "Bob";
        uint256 id = rc.createTemplate(_twoSlotTemplate());
        bytes32 qid = rc.askQuestion(id, two, _none(), arb, 30, 0, 0); // two slots, two params
        assertTrue(qid != bytes32(0));
        vm.expectRevert(IRealityETHErrors.ParamsLengthMismatch.selector);
        rc.askQuestion(id, _one("Alice"), _none(), arb, 30, 0, 0); // one param for two slots
    }

    function test_ask_stores_template_block_count() public {
        bytes32 qid = rc.askQuestion(0, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        assertEq(uint256(rc.questions(qid).templateId), 0);
        assertEq(uint256(rc.questions(qid).createdBlock), block.number);
        assertEq(uint256(rc.questions(qid).outcomeCount), 0);
        assertEq(rc.getArbitrator(qid), arb);
    }

    // ---- answer validation -------------------------------------------------

    function test_bool_answer_validation() public {
        bytes32 qid = rc.askQuestion(0, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        rc.submitAnswerERC20(qid, bytes32(uint256(1)), 0, 1);
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswerERC20(qid, bytes32(uint256(2)), 0, 2);
    }

    function test_invalid_and_too_soon_allowed_on_default() public {
        bytes32 qid = rc.askQuestion(0, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        rc.submitAnswerERC20(qid, INVALID, 0, 1);
        // default opts into hasAnsweredTooSoon, so the too-soon sentinel is accepted
        rc.submitAnswerERC20(qid, TOO_SOON, 0, 2);
        assertEq(rc.questions(qid).bond, 2, "too-soon sentinel recorded as the answer");
    }

    function test_too_soon_banned_when_template_opts_out() public {
        // a custom template with hasAnsweredTooSoon = false still bans the sentinel
        Template memory t = Template(
            AnswerType.Bool, 0, false, false, false, false, false, false, address(0), 0, _one(""), _none(), "", "", ""
        );
        uint256 id = rc.createTemplate(t);
        bytes32 qid = rc.askQuestion(id, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswerERC20(qid, TOO_SOON, 0, 1);
    }

    function test_single_select_ask_time_outcomes() public {
        uint256 id = rc.createTemplate(_selectTemplate(_none()));
        bytes32 qid = rc.askQuestion(id, _one("Colour?"), _rgb(), arb, 30, 0, 0);
        assertEq(uint256(rc.questions(qid).outcomeCount), 3);
        rc.submitAnswerERC20(qid, bytes32(uint256(2)), 0, 1); // Blue
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswerERC20(qid, bytes32(uint256(3)), 0, 2);
    }

    // ---- arbitrator / minBond from template --------------------------------

    function test_arbitrator_from_template_not_stored() public {
        uint256 id = rc.createTemplate(_boolTemplate(true, arb, false, 0));
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), address(0), 30, 0, 0);
        assertEq(rc.getArbitrator(qid), arb);
        assertEq(rc.questions(qid).arbitrator, address(0)); // left unwritten
    }

    function test_arbitrator_override_conflict_reverts() public {
        uint256 id = rc.createTemplate(_boolTemplate(true, arb, false, 0));
        vm.expectRevert(IRealityETHErrors.OverrideNotAllowed.selector);
        rc.askQuestion(id, _one("Q?"), _none(), address(0xBEEF), 30, 0, 0);
    }

    function test_minbond_from_template_enforced() public {
        uint256 id = rc.createTemplate(_boolTemplate(true, arb, true, 1000));
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), address(0), 30, 0, 0);
        assertEq(rc.getMinBond(qid), 1000);
        assertEq(rc.questions(qid).minBond, 0); // left unwritten
        vm.expectRevert(IRealityETHErrors.BondMustExceedTheMinimum.selector);
        rc.submitAnswerERC20(qid, bytes32(uint256(1)), 0, 999);
        rc.submitAnswerERC20(qid, bytes32(uint256(1)), 0, 1000);
    }

    function test_template_can_fix_minbond_to_zero() public {
        uint256 id = rc.createTemplate(_boolTemplate(false, arb, true, 0));
        vm.expectRevert(IRealityETHErrors.OverrideNotAllowed.selector);
        rc.askQuestionWithMinBondERC20(id, _one("Q?"), _none(), arb, 30, 0, 0, 5, 0);
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), arb, 30, 0, 0);
        assertEq(rc.getMinBond(qid), 0);
    }

    // ---- template validation -----------------------------------------------

    function test_template_validation_rejects_bad() public {
        vm.expectRevert(IRealityETHErrors.TemplateDecimalsInvalid.selector);
        rc.createTemplate(
            Template(
                AnswerType.Bool,
                5,
                false,
                false,
                false,
                false,
                false,
                false,
                address(0),
                0,
                _one(""),
                _none(),
                "",
                "",
                ""
            )
        );
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
        // decimals above the max (63) on a Uint type
        vm.expectRevert(IRealityETHErrors.TemplateDecimalsInvalid.selector);
        rc.createTemplate(
            Template(
                AnswerType.Uint,
                64,
                false,
                false,
                false,
                false,
                false,
                false,
                address(0),
                0,
                _one(""),
                _none(),
                "",
                "",
                ""
            )
        );
    }
}
