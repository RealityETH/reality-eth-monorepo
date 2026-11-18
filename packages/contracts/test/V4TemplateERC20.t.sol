// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_ERC20_v4_0} from "../src/RealityETH_ERC20-4.0.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {IRealityETHErrors} from "../src/interfaces/IRealityETHErrors.sol";
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
        rc = new RealityETH_ERC20_v4_0();
        token = new MockERC20();
        rc.setToken(IERC20(address(token)));
        token.mint(address(this), 1_000_000 ether);
        token.approve(address(rc), type(uint256).max);
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

    // ---- defaults + basic asking ------------------------------------------

    function test_default_templates() public view {
        assertEq(uint256(rc.getTemplate(0).answerType), uint256(AnswerType.Bool));
        assertEq(uint256(rc.getTemplate(1).answerType), uint256(AnswerType.Uint));
        assertEq(uint256(rc.getTemplate(2).answerType), uint256(AnswerType.Datetime));
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

    function test_invalid_allowed_too_soon_gated() public {
        bytes32 qid = rc.askQuestion(0, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        rc.submitAnswerERC20(qid, INVALID, 0, 1);
        vm.expectRevert(IRealityETHErrors.AnswerNotAllowedForTemplate.selector);
        rc.submitAnswerERC20(qid, TOO_SOON, 0, 2);
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
    }
}
