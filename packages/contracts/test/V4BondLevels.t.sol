// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_v4_0} from "../src/RealityETH-4.0.sol";
import {IRealityETHErrors} from "../src/interfaces/IRealityETHErrors.sol";
import {AnswerType, Template, BondLevel} from "../src/RealityETHTypes.sol";

/// Tests for the per-template bond levels on the ETH core: tiered timeout scaling and the
/// extra arbitrator fee (bond + fee derived from the value sent), plus validation guards.
contract V4BondLevelsTest is Test {
    RealityETH_v4_0 internal rc;
    address internal arb = address(0xA4B);
    uint32 internal constant TIMEOUT = 30;
    uint256 internal constant MIN_BOND = 1000;

    function setUp() public {
        rc = new RealityETH_v4_0();
        vm.deal(address(this), 1_000_000 ether);
    }

    function _one(string memory s) internal pure returns (string[] memory a) {
        a = new string[](1);
        a[0] = s;
    }

    function _none() internal pure returns (string[] memory) {
        return new string[](0);
    }

    // Uint template (freeform answers) with minBond fixed to MIN_BOND; arbitrator supplied per question.
    function _uintTemplate() internal pure returns (Template memory) {
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
            MIN_BOND,
            _one(""),
            _none(),
            "",
            "",
            ""
        );
    }

    // Levels: at 200% of minBond -> timeout x2, +10% fee; at 400% -> timeout x3, +20% fee.
    function _bondLevels() internal pure returns (BondLevel[] memory c) {
        c = new BondLevel[](2);
        c[0] = BondLevel(200, 200, 10);
        c[1] = BondLevel(400, 300, 20);
    }

    function _askWithBondLevels() internal returns (bytes32) {
        uint256 id = rc.createTemplateWithBondLevels(_uintTemplate(), _bondLevels());
        return rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
    }

    function test_bond_levels_scale_timeout_and_fee() public {
        bytes32 qid = _askWithBondLevels();
        uint256 t0 = block.timestamp;

        // First answer at exactly minBond (100% -> implicit [100,100,0]): no fee, base timeout.
        rc.submitAnswer{value: MIN_BOND}(qid, bytes32(uint256(42)), 0);
        assertEq(rc.questions(qid).bond, MIN_BOND, "bond == value at the base tier");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT, "base timeout");
        assertEq(rc.balanceOf(arb), 0, "no fee at the base tier");

        // Second answer: send 2200 -> 220% of minBond -> tier (200,200,10). fee 10% on top, so
        // bond = 2200*100/110 = 2000, fee = 200, timeout x2.
        rc.submitAnswer{value: 2200}(qid, bytes32(uint256(43)), 0);
        assertEq(rc.questions(qid).bond, 2000, "derived bond = value*100/(100+fee)");
        assertEq(rc.balanceOf(arb), 200, "fee credited to arbitrator");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT * 2, "timeout x2");

        // Third answer: send 4800 -> 480% -> tier (400,300,20). bond = 4800*100/120 = 4000 (doubles
        // 2000), fee = 800, timeout x3.
        rc.submitAnswer{value: 4800}(qid, bytes32(uint256(44)), 0);
        assertEq(rc.questions(qid).bond, 4000, "derived bond at tier 2");
        assertEq(rc.balanceOf(arb), 200 + 800, "cumulative fees");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT * 3, "timeout x3");
    }

    // No bond levels => value is the bond, no fee, base timeout (unchanged behaviour).
    function test_no_bond_levels_unchanged() public {
        uint256 id = rc.createTemplate(_uintTemplate());
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
        uint256 t0 = block.timestamp;
        rc.submitAnswer{value: 5000}(qid, bytes32(uint256(1)), 0);
        assertEq(rc.questions(qid).bond, 5000, "bond == value");
        assertEq(rc.balanceOf(arb), 0, "no fee");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT, "base timeout");
    }

    // Bond levels need a positive minBond (thresholds are a percentage of it).
    function test_bond_levels_requires_minbond() public {
        // template with bond levels but minBond left to the asker, who supplies 0
        Template memory t = Template(
            AnswerType.Uint, 0, false, false, false, false, false, false, address(0), 0, _one(""), _none(), "", "", ""
        );
        uint256 id = rc.createTemplateWithBondLevels(t, _bondLevels());
        vm.expectRevert(IRealityETHErrors.MinBondRequiredForBondLevels.selector);
        rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0); // minBond 0
    }

    // ---- levels validation --------------------------------------------------

    function _rejectsBondLevels(BondLevel[] memory c) internal {
        vm.expectRevert(IRealityETHErrors.BondLevelsInvalid.selector);
        rc.createTemplateWithBondLevels(_uintTemplate(), c);
    }

    function test_bond_levels_validation_rejects_bad() public {
        // first threshold must be > 100
        BondLevel[] memory a = new BondLevel[](1);
        a[0] = BondLevel(100, 100, 0);
        _rejectsBondLevels(a);

        // thresholds must strictly increase
        BondLevel[] memory b = new BondLevel[](2);
        b[0] = BondLevel(200, 200, 0);
        b[1] = BondLevel(200, 300, 0);
        _rejectsBondLevels(b);

        // timeouts must not decrease
        BondLevel[] memory c = new BondLevel[](2);
        c[0] = BondLevel(200, 200, 0);
        c[1] = BondLevel(400, 150, 0);
        _rejectsBondLevels(c);

        // fee must be <= 100
        BondLevel[] memory d = new BondLevel[](1);
        d[0] = BondLevel(200, 200, 101);
        _rejectsBondLevels(d);
    }

    // Over-large multipliers are clamped to one year rather than rejected.
    function test_timeout_clamped_to_one_year() public {
        BondLevel[] memory c = new BondLevel[](1);
        c[0] = BondLevel(200, 60000, 0); // 600x a 30s base would be 5 hours... use a big base to exceed a year
        uint256 id = rc.createTemplateWithBondLevels(
            Template(
                AnswerType.Uint,
                0,
                false,
                false,
                false,
                false,
                false,
                true,
                address(0),
                MIN_BOND,
                _one(""),
                _none(),
                "",
                "",
                ""
            ),
            c
        );
        // base timeout 100 days; x600 would be 60000 days, clamped to 365.
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), arb, uint32(100 days), 0, 0);
        uint256 t0 = block.timestamp;
        rc.submitAnswer{value: 2 * MIN_BOND}(qid, bytes32(uint256(1)), 0); // 200% -> the big-multiplier tier
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + 365 days, "clamped to one year");
    }
}
