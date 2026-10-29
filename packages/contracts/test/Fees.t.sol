// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from tests/python/test.py — question fees, minimum bond, arbitrator
/// admin (metadata / registered wallet), null arbitrator, and gas checks.
contract FeesTest is RealityETHStd {
    function test_question_fee_withdrawal() public {
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5");
        address k7 = makeAddr("k7");

        uint256 startBal = rc.balanceOf(address(arb)); // 100 from setUp
        arb.setQuestionFee(321);

        vm.deal(k4, 1 ether);
        vm.prank(k4);
        rc.askQuestion{value: 1000}(0, "my question 3", address(arb), 10, 0, 0);
        vm.deal(k5, 1 ether);
        vm.prank(k5);
        rc.askQuestion{value: 2000}(0, "my question 4", address(arb), 10, 0, 0);

        assertEq(rc.balanceOf(address(arb)) - startBal, 321 * 2);

        uint256 startArb = address(arb).balance;
        vm.prank(k7);
        arb.callWithdraw();
        assertEq(address(arb).balance - startArb, 100 + 321 * 2);
        assertEq(rc.balanceOf(address(arb)), 0);
    }

    function test_question_fees() public {
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5"); // treated as an (EOA) arbitrator here

        vm.prank(k5);
        rc.setQuestionFee(123);

        vm.deal(k4, 1 ether);
        vm.prank(k4);
        vm.expectRevert(); // 122 < 123 fee
        rc.askQuestion{value: 122}(0, "my question 2", k5, 10, 0, 0);

        vm.prank(k4);
        bytes32 q2 = rc.askQuestion{value: 126}(0, "my question 2", k5, 10, 0, 0);
        (,,,,,, uint256 b2,,,,) = rc.questions(q2);
        assertEq(b2, 126 - 123, "bounty is what's left after the fee");

        vm.deal(k5, 1 ether);
        vm.prank(k5);
        bytes32 q3 = rc.askQuestion{value: 122}(0, "my question 3", k5, 10, 0, 0);
        (,,,,,, uint256 b3,,,,) = rc.questions(q3);
        assertEq(b3, 122, "arbitrator isn't charged their own fee");
    }

    function test_minimum_bond() public {
        if (!minBondSupported) {
            vm.skip(true);
            return;
        }
        bytes32 qid = rc.askQuestionWithMinBond{value: 1100}(0, "my question 2", address(arb), 10, 0, 0, 1000);
        (,,,,,,,,,, uint256 minBond) = rc.questions(qid);
        assertEq(minBond, 1000);

        vm.expectRevert(); // below the minimum bond
        rc.submitAnswer{value: 0}(qid, _answer(123), 0);
        vm.expectRevert();
        rc.submitAnswer{value: 999}(qid, _answer(1234), 0);

        rc.submitAnswer{value: 1000}(qid, _answer(12345), 0);
        (,,,,,,, bytes32 best,,,) = rc.questions(qid);
        assertEq(uint256(best), 12345);
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

        vm.deal(k4, 1 ether);
        vm.prank(k4);
        rc.askQuestion{value: 1000}(0, "my question 3", address(arb), 10, 0, 0);
        vm.deal(k5, 1 ether);
        vm.prank(k5);
        rc.askQuestion{value: 2000}(0, "my question 4", address(arb), 10, 0, 0);
        assertEq(rc.balanceOf(address(arb)) - startBal, 321 * 2);

        vm.expectRevert(); // no registered wallet yet
        arb.withdrawToRegisteredWallet();

        vm.expectRevert(); // non-owner
        vm.prank(k2);
        arb.updateRegisteredWallet(w8);

        arb.updateRegisteredWallet(w8);

        uint256 startW = w8.balance;
        vm.prank(k7);
        arb.callWithdraw();
        vm.prank(k4);
        arb.withdrawToRegisteredWallet();
        assertEq(w8.balance - startW, 100 + 321 + 321);
        assertEq(rc.balanceOf(address(arb)), 0);
    }

    function test_null_arbitrator_permitted() public {
        address k2 = makeAddr("k2");
        vm.deal(k2, 1 ether);
        vm.prank(k2);
        rc.askQuestion{value: 1000}(0, "my question 3", address(0), 10, 0, 0);
    }

    // NB: absolute thresholds differ from the Python harness — forge's
    // gasleft()-delta at the call site includes calldata/CALL overhead rather
    // than tx base gas. Bounds are calibrated for forge; the meaningful property
    // (the second answer is cheaper than the first) is asserted directly.
    function test_ask_question_gas() public {
        uint256 g = gasleft();
        rc.askQuestion{value: 1100}(0, "my question 2", address(arb), 10, 0, 0);
        g = g - gasleft();
        assertLt(g, 140000);
    }

    function test_answer_question_gas() public {
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
