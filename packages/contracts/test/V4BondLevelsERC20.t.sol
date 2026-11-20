// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_ERC20_v4_0} from "../src/RealityETH_ERC20-4.0.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {IRealityETHErrors} from "../src/interfaces/IRealityETHErrors.sol";
import {AnswerType, Template, BondLevel} from "../src/RealityETHTypes.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

/// Bond-level tests for the ERC20 core (mirrors V4BondLevels.t.sol). `tokens` is the total value sent;
/// the bond and the extra arbitrator fee are derived from it.
contract V4BondLevelsERC20Test is Test {
    RealityETH_ERC20_v4_0 internal rc;
    MockERC20 internal token;
    address internal arb = address(0xA4B);
    uint32 internal constant TIMEOUT = 30;
    uint256 internal constant MIN_BOND = 1000;

    function setUp() public {
        token = new MockERC20();
        rc = new RealityETH_ERC20_v4_0(IERC20(address(token)), address(0));
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

    function _uintTemplate(uint256 minBond) internal pure returns (Template memory) {
        return Template(
            AnswerType.Uint,
            0,
            false,
            false,
            false,
            false,
            false,
            true,
            address(0),
            minBond,
            _one(""),
            _none(),
            "",
            "",
            ""
        );
    }

    // at 200% of minBond -> timeout x2, +10% fee; at 400% -> timeout x3, +20% fee
    function _bondLevels() internal pure returns (BondLevel[] memory c) {
        c = new BondLevel[](2);
        c[0] = BondLevel(200, 200, 10);
        c[1] = BondLevel(400, 300, 20);
    }

    function test_bond_levels_scale_timeout_and_fee() public {
        uint256 id = rc.createTemplate(_uintTemplate(MIN_BOND), _bondLevels());
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
        uint256 t0 = block.timestamp;

        rc.submitAnswerERC20(qid, bytes32(uint256(42)), 0, MIN_BOND); // 100% -> base
        assertEq(rc.questions(qid).bond, MIN_BOND, "bond == value at base");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT, "base timeout");
        assertEq(rc.balanceOf(arb), 0, "no fee at base");

        rc.submitAnswerERC20(qid, bytes32(uint256(43)), 0, 2200); // 220% -> (200,200,10)
        assertEq(rc.questions(qid).bond, 2000, "derived bond = value*100/(100+fee)");
        assertEq(rc.balanceOf(arb), 200, "fee credited to arbitrator");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT * 2, "timeout x2");

        rc.submitAnswerERC20(qid, bytes32(uint256(44)), 0, 4800); // 480% -> (400,300,20)
        assertEq(rc.questions(qid).bond, 4000, "derived bond at level 2");
        assertEq(rc.balanceOf(arb), 200 + 800, "cumulative fees");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT * 3, "timeout x3");
    }

    function test_no_bond_levels_unchanged() public {
        uint256 id = rc.createTemplate(_uintTemplate(MIN_BOND));
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
        uint256 t0 = block.timestamp;
        rc.submitAnswerERC20(qid, bytes32(uint256(1)), 0, 5000);
        assertEq(rc.questions(qid).bond, 5000, "bond == value");
        assertEq(rc.balanceOf(arb), 0, "no fee");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT, "base timeout");
    }

    function test_bond_levels_requires_minbond() public {
        // template with bond levels but minBond left to the asker, who supplies 0
        Template memory t = Template(
            AnswerType.Uint, 0, false, false, false, false, false, false, address(0), 0, _one(""), _none(), "", "", ""
        );
        uint256 id = rc.createTemplate(t, _bondLevels());
        vm.expectRevert(IRealityETHErrors.MinBondRequiredForBondLevels.selector);
        rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
    }

    function test_bond_levels_validation_rejects_bad() public {
        BondLevel[] memory bad = new BondLevel[](1);
        bad[0] = BondLevel(100, 100, 0); // first threshold must be > 100
        vm.expectRevert(IRealityETHErrors.BondLevelsInvalid.selector);
        rc.createTemplate(_uintTemplate(MIN_BOND), bad);
    }
}
