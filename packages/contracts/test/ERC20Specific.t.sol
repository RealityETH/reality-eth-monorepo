// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from the ERC20-only paths in test.py / test_erc20.py — token
/// balance/approval/deduction behaviour. Skipped for the ETH family.
contract ERC20SpecificTest is RealityETHStd {
    modifier onlyERC20() {
        if (!isERC20) {
            vm.skip(true);
            return;
        }
        _;
    }

    // give `acct` an internal RealityETH balance of `amt` (Python _setup_balance)
    function _setupBalance(address acct, uint256 amt) internal {
        uint256 fee = QUESTION_FEE;
        uint256 bond = 1;
        uint256 startBal = rc.balanceOf(acct);
        bytes32 qid = _ask(acct, 0, "my question _setup_balance", address(arb), 30, 0, 0, amt + fee - bond);
        _submit(qid, 1002, 0, bond, acct);
        _advanceClock(33);
        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        rc.claimWinnings(qid, hs, ad, bo, an);
        assertEq(rc.balanceOf(acct) - startBal, amt);
    }

    function test_token_deductions_no_balance() public onlyERC20 {
        address k3 = makeAddr("k3d");
        assertEq(token.balanceOf(k3), 0);

        vm.expectRevert(); // no tokens
        vm.prank(k3);
        rc.submitAnswerERC20(question_id, _answer(12345), 0, 1000);

        token.mint(k3, 500);
        vm.prank(k3);
        token.approve(address(rc), 500);
        vm.expectRevert(); // 500 < 1000
        vm.prank(k3);
        rc.submitAnswerERC20(question_id, _answer(12345), 0, 1000);

        token.mint(k3, 501);
        vm.prank(k3);
        token.approve(address(rc), 1001);
        assertEq(token.balanceOf(k3), 1001);

        vm.prank(k3);
        rc.submitAnswerERC20(question_id, _answer(12345), 0, 1000);
        assertEq(token.balanceOf(k3), 1);
    }

    function test_token_deductions_with_existing_balance() public onlyERC20 {
        address k3 = makeAddr("k3e");
        _setupBalance(k3, 1000);
        assertEq(rc.balanceOf(k3), 1000);

        // enough internal balance => deduct from the balance, leave tokens alone
        vm.prank(k3);
        rc.submitAnswerERC20(question_id, _answer(12345), 0, 1);
        assertEq(rc.balanceOf(k3), 999);

        // only 500 approved, 999 internal => 2000 fails
        token.mint(k3, 500);
        vm.prank(k3);
        token.approve(address(rc), 500);
        uint256 startT = token.balanceOf(k3);
        vm.expectRevert();
        vm.prank(k3);
        rc.submitAnswerERC20(question_id, _answer(12345), 0, 2000);

        // consume the remaining 999 internal + 1 from tokens
        vm.prank(k3);
        rc.submitAnswerERC20(question_id, _answer(12345), 0, 1000);
        assertEq(rc.balanceOf(k3), 0);
        assertEq(token.balanceOf(k3), startT - 1);
    }

    function test_non_erc_ask_question_id() public onlyERC20 {
        // ERC20 contracts also expose a plain askQuestion (no bounty). With a
        // question fee set it must fail; once the fee is zero it succeeds.
        bytes32 expectedId = _questionId(0, "my question x", address(arb), 30, 0, 0, address(this), 0);

        vm.expectRevert();
        rc.askQuestion(0, "my question x", address(arb), 30, 0, 0);
        (, address arbBefore,,,,,,,,,) = rc.questions(expectedId);
        assertEq(arbBefore, address(0));

        arb.setQuestionFee(0);
        rc.askQuestion(0, "my question x", address(arb), 30, 0, 0);
        (, address arbAfter,,,,,,,,,) = rc.questions(expectedId);
        assertTrue(arbAfter != address(0), "question exists at the expected id");
    }
}
