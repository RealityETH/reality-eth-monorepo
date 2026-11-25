// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from tests/python/test.py — reopening "answered too soon" questions
/// and the associated bond/bounty accounting (3.0+).
contract ReopenTest is RealityETHStd {
    modifier onlyReopen() {
        if (!reopenSupported) {
            vm.skip(true);
            return;
        }
        _;
    }

    function _oneClaim(address who, uint256 bond, bytes32 ans) internal {
        bytes32[] memory hs = new bytes32[](1);
        hs[0] = bytes32(0);
        address[] memory ad = new address[](1);
        ad[0] = who;
        uint256[] memory bo = new uint256[](1);
        bo[0] = bond;
        bytes32[] memory an = new bytes32[](1);
        an[0] = ans;
        rc.claimWinnings(question_id, hs, ad, bo, an);
    }

    function test_reopen_question() public onlyReopen {
        address k0 = address(this);
        uint256 TOO_SOON = type(uint256).max - 1; // ANSWERED_TOO_SOON as a uint

        _submit(question_id, TOO_SOON, 0, 3, k0);
        _advanceClock(33);

        assertEq(rc.resultFor(question_id), ANSWERED_TOO_SOON);
        assertTrue(rc.isSettledTooSoon(question_id));
        vm.expectRevert();
        rc.resultForOnceSettled(question_id);

        assertEq(rc.balanceOf(k0), 0);
        _oneClaim(k0, 3, ANSWERED_TOO_SOON);
        assertEq(rc.balanceOf(k0), 3, "winner gets their bond back but no bounty");

        assertEq(rc.reopened_questions(question_id), bytes32(0));
        assertEq(_q(question_id).bounty, 1000);

        // details differ from the original question
        _reopenRevert(k0, 0, "not my question", address(arb), 30, 0, 1, 0, question_id, 123);

        bytes32 reopenId = _questionId(0, "my question", address(arb), 30, 0, 1, k0, 0);
        _reopen(k0, 0, "my question", address(arb), 30, 0, 1, 0, question_id, 123);
        assertEq(rc.reopened_questions(question_id), reopenId);

        assertEq(_q(question_id).bounty, 0, "bounty leaves the reopened question");
        assertEq(_q(reopenId).bounty, 1000 + 123 - 100);

        // can't reopen the same one twice (even with a different nonce)
        _reopenRevert(k0, 0, "my question", address(arb), 30, 0, 1, 0, question_id, 123);
        _reopenRevert(k0, 0, "my question", address(arb), 30, 0, 2, 0, question_id, 123);

        _submit(reopenId, TOO_SOON, 0, 3, k0);
        _advanceClock(33);
        assertEq(rc.getFinalAnswer(reopenId), ANSWERED_TOO_SOON);

        // a reopen can't itself be reopened until its parent is reopened again
        _reopenRevert(k0, 0, "my question", address(arb), 30, 0, 4, 0, reopenId, 123);

        uint256 preReopenBounty = _q(reopenId).bounty;

        bytes32 reopenId2 = _questionId(0, "my question", address(arb), 30, 0, 2, k0, 0);
        _reopen(k0, 0, "my question", address(arb), 30, 0, 2, 0, question_id, 543);

        assertEq(_q(reopenId).bounty, 0, "reopening moves the bounty to the new question");
        assertEq(_q(reopenId2).bounty, preReopenBounty + 543 - 100);
        assertEq(rc.reopened_questions(question_id), reopenId2);

        // now the parent is reopened again, the child can be reopened
        _reopen(k0, 0, "my question", address(arb), 30, 0, 4, 0, reopenId, 123);

        _submit(reopenId2, 432, 0, 3, k0);
        _advanceClock(33);
        assertEq(uint256(rc.getFinalAnswer(reopenId2)), 432);
        assertFalse(rc.isSettledTooSoon(reopenId2));
        assertEq(uint256(rc.resultForOnceSettled(question_id)), 432);
    }

    function test_too_soon_bounty() public onlyReopen {
        address k3 = makeAddr("k3");
        address k5 = makeAddr("k5");
        _submit(question_id, 1001, 0, 2, k3);
        _submit(question_id, 1001, 2, 4, k3);
        _submit(question_id, 1001, 4, 8, k3);
        _submit(question_id, 1001, 8, 16, k3);
        _submit(question_id, 1001, 16, 32, k3);
        _submit(question_id, type(uint256).max - 1, 32, 64, k3); // ANSWERED_TOO_SOON
        uint256 claimable = 64 + _subFee(32) + _subFee(16) + _subFee(8) + _subFee(4) + _subFee(2); // no bounty

        _advanceClock(33);
        assertEq(rc.getFinalAnswer(question_id), ANSWERED_TOO_SOON);
        assertEq(rc.balanceOf(k3), 0);

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        bytes32[] memory qids = new bytes32[](1);
        qids[0] = question_id;
        uint256[] memory lengths = new uint256[](1);
        lengths[0] = 6;
        vm.prank(k5);
        rc.claimMultipleAndWithdrawBalance(qids, lengths, hs, ad, bo, an);
        assertEq(rc.balanceOf(k3), claimable);
    }

    function test_too_soon_bonds_under_unrevealed_commit() public onlyReopen {
        if (!commitRevealSupported) {
            vm.skip(true);
            return;
        }
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5");
        _submit(question_id, 1001, 0, 200, k3);
        _submit(question_id, 1001, 200, 400, k3);
        _submit(question_id, 1001, 400, 800, k3);
        _submit(question_id, 1001, 800, 1600, k3);
        _submit(question_id, 1001, 1600, 3200, k3);
        _submit(question_id, type(uint256).max - 1, 3200, 6400, k3); // ANSWERED_TOO_SOON
        _submitCommit(question_id, 1001, 6400, 12800, k4); // submitted but never revealed
        uint256 claimable = 12800 + _subFee(6400) + _subFee(3200) + _subFee(1600) + _subFee(800) + _subFee(400)
            + _subFee(200); // no bounty

        _advanceClock(33);
        assertEq(rc.getFinalAnswer(question_id), ANSWERED_TOO_SOON);
        assertEq(rc.balanceOf(k3), 0);

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        bytes32[] memory qids = new bytes32[](1);
        qids[0] = question_id;
        uint256[] memory lengths = new uint256[](1);
        lengths[0] = 7;
        vm.prank(k5);
        rc.claimMultipleAndWithdrawBalance(qids, lengths, hs, ad, bo, an);
        assertEq(rc.balanceOf(k3), claimable);
    }
}
