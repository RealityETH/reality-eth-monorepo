// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from tests/python/test.py — question fees, minimum bond, arbitrator
/// admin (metadata / registered wallet), null arbitrator, and gas checks.
/// Runs against both ETH and ERC20.
contract FeesTest is RealityETHStd {
    function test_question_fee_withdrawal() public {
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5");
        address k7 = makeAddr("k7");

        uint256 startBal = rc.balanceOf(address(arb)); // 100 from setUp
        arb.setQuestionFee(321);

        _ask(k4, 0, "my question 3", address(arb), 10, 0, 0, 1000);
        _ask(k5, 0, "my question 4", address(arb), 10, 0, 0, 2000);
        assertEq(rc.balanceOf(address(arb)) - startBal, 321 * 2);

        uint256 startArb = _extBalance(address(arb));
        vm.prank(k7);
        arb.callWithdraw();
        assertEq(_extBalance(address(arb)) - startArb, 100 + 321 * 2);
        assertEq(rc.balanceOf(address(arb)), 0);
    }

    function test_question_fees() public {
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5"); // treated as an (EOA) arbitrator here

        vm.prank(k5);
        rc.setQuestionFee(123);

        _askRevert(k4, 0, "my question 2", k5, 10, 0, 0, 122); // 122 < 123 fee

        bytes32 q2 = _ask(k4, 0, "my question 2", k5, 10, 0, 0, 126);
        assertEq(_q(q2).bounty, 126 - 123, "bounty is what's left after the fee");

        bytes32 q3 = _ask(k5, 0, "my question 3", k5, 10, 0, 0, 122);
        assertEq(_q(q3).bounty, 122, "arbitrator isn't charged their own fee");
    }

    function test_minimum_bond() public {
        if (!minBondSupported) {
            vm.skip(true);
            return;
        }
        bytes32 qid = _askMinBond(address(this), 0, "my question 2", address(arb), 10, 0, 0, 1000, 1100);
        assertEq(_q(qid).minBond, 1000);

        _submitRevert(qid, 123, 0, 0); // below the minimum bond
        _submitRevert(qid, 1234, 0, 999);

        _submit(qid, 12345, 0, 1000, address(this));
        assertEq(uint256(_q(qid).bestAnswer), 12345);
    }

    function test_arbitrator_metadata() public {
        address k1 = makeAddr("k1");
        assertEq(arb.metadata(), "");

        vm.expectRevert(); // non-owner
        vm.prank(k1);
        arb.setMetaData("oink");

        arb.setMetaData("oink"); // owner is this test contract
        assertEq(arb.metadata(), "oink");
    }

    function test_arbitrator_registered_wallet() public {
        address k2 = makeAddr("k2");
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5");
        address k7 = makeAddr("k7");
        address w8 = makeAddr("w8");

        uint256 startBal = rc.balanceOf(address(arb));
        arb.setQuestionFee(321);

        _ask(k4, 0, "my question 3", address(arb), 10, 0, 0, 1000);
        _ask(k5, 0, "my question 4", address(arb), 10, 0, 0, 2000);
        assertEq(rc.balanceOf(address(arb)) - startBal, 321 * 2);

        vm.expectRevert(); // no registered wallet yet
        arb.withdrawToRegisteredWallet();

        vm.expectRevert(); // non-owner
        vm.prank(k2);
        arb.updateRegisteredWallet(w8);

        arb.updateRegisteredWallet(w8);

        // Python skips the registered-wallet withdrawal path for ERC20
        if (isERC20) return;

        uint256 startW = w8.balance;
        vm.prank(k7);
        arb.callWithdraw();
        vm.prank(k4);
        arb.withdrawToRegisteredWallet();
        assertEq(w8.balance - startW, 100 + 321 + 321);
        assertEq(rc.balanceOf(address(arb)), 0);
    }

    function test_null_arbitrator_permitted() public {
        if (versionNum < 30) {
            vm.skip(true); // null arbitrators were only permitted from 3.0
            return;
        }
        address k2 = makeAddr("k2");
        _ask(k2, 0, "my question 3", address(0), 10, 0, 0, 1000);
    }

    // NB: absolute thresholds are forge-calibrated (gasleft()-delta at the call
    // site, not tx-base), per payment type. The meaningful property (the second
    // answer is cheaper than the first) is asserted directly.
    function test_ask_question_gas() public {
        if (isERC20) {
            token.mint(address(this), 1100);
            token.approve(address(rc), type(uint256).max);
            uint256 g = gasleft();
            rc.askQuestionERC20(0, "my question 2", address(arb), 10, 0, 0, 1100);
            g = g - gasleft();
            assertLt(g, 200000);
        } else {
            uint256 g = gasleft();
            rc.askQuestion{value: 1100}(0, "my question 2", address(arb), 10, 0, 0);
            g = g - gasleft();
            assertLt(g, 140000);
        }
    }

    function test_answer_question_gas() public {
        if (isERC20) {
            token.mint(address(this), 10);
            token.approve(address(rc), type(uint256).max);
            uint256 g = gasleft();
            rc.submitAnswerERC20(question_id, _answer(12345), 0, 1);
            g = g - gasleft();
            assertLt(g, 200000);
            uint256 g2 = gasleft();
            rc.submitAnswerERC20(question_id, _answer(12346), 0, 2);
            g2 = g2 - gasleft();
            assertLt(g2, g, "the second answer should be cheaper than the first");
        } else {
            uint256 g = gasleft();
            rc.submitAnswer{value: 1}(question_id, _answer(12345), 0);
            g = g - gasleft();
            assertLt(g, 130000);
            uint256 g2 = gasleft();
            rc.submitAnswer{value: 2}(question_id, _answer(12346), 0);
            g2 = g2 - gasleft();
            assertLt(g2, g, "the second answer should be cheaper than the first");
        }
    }
}
