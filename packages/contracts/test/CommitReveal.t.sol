// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from tests/python/test.py — commit-reveal answering
/// (skipped on 4.0, which removed commit-reveal).
contract CommitRevealTest is RealityETHStd {
    modifier onlyCommitReveal() {
        if (!commitRevealSupported) {
            vm.skip(true);
            return;
        }
        _;
    }

    function test_answer_reveal_calculation() public onlyCommitReveal {
        bytes32 h = _answerHash(_answer(1003), 94989);
        assertEq(h, 0x23e796d2bf4f5f890b1242934a636f4802aadd480b6f83c754d2bd5920f78845);
    }

    function test_answer_commit_normal() public onlyCommitReveal {
        address k3 = makeAddr("k3");
        uint256 nonce = _submitCommit(question_id, 1002, 0, 1, k3);
        bytes32 commitmentId = _lastAnswer();

        (uint32 revealTs, bool isRevealed,) = rc.commitments(commitmentId);
        assertTrue(revealTs > 0);
        assertTrue(revealTs > block.timestamp);
        assertFalse(isRevealed);

        vm.expectRevert(); // no final answer while the commitment is unrevealed
        rc.getFinalAnswer(question_id);

        _reveal(question_id, 1002, nonce, 1, k3);

        (, bool isRevealed2, bytes32 revealedAnswer) = rc.commitments(commitmentId);
        assertTrue(isRevealed2);
        assertEq(revealedAnswer, _answer(1002));

        _advanceClock(33);
        assertEq(uint256(_q(question_id).bestAnswer), 1002);

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        rc.claimWinnings(question_id, hs, ad, bo, an);
        assertEq(rc.balanceOf(k3), 1001); // bond 1 + bounty 1000
    }

    function test_answer_commit_skip_sender() public onlyCommitReveal {
        address k3 = makeAddr("k3");
        uint256 nonce = _submitCommitAs(question_id, 1002, 0, 1, k3, address(0));

        vm.expectRevert();
        rc.getFinalAnswer(question_id);

        _reveal(question_id, 1002, nonce, 1, k3);
        _advanceClock(33);

        assertEq(uint256(rc.getFinalAnswer(question_id)), 1002);

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        rc.claimWinnings(question_id, hs, ad, bo, an);
        assertEq(rc.balanceOf(k3), 1001);
    }

    function test_answer_no_answer_no_commit() public onlyCommitReveal {
        address k3 = makeAddr("k3");
        uint256 nonce = _submitCommit(question_id, 1002, 0, 1, k3);

        vm.expectRevert();
        rc.getFinalAnswer(question_id);

        _reveal(question_id, 1002, nonce, 1, k3);
        _advanceClock(33);

        assertEq(uint256(rc.getFinalAnswer(question_id)), 1002);

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        rc.claimWinnings(question_id, hs, ad, bo, an);
        assertEq(rc.balanceOf(k3), 1001);
    }

    function test_answer_commit_expired() public onlyCommitReveal {
        address k3 = makeAddr("k3");
        uint256 nonce = _submitCommit(question_id, 1002, 0, 1, k3);

        _advanceClock(5); // past the reveal window (timeout/8 ~= 3s for timeout 30)
        vm.expectRevert();
        _reveal(question_id, 1002, nonce, 1, k3);
    }

    function test_answer_commit_with_arbitration_pending() public onlyCommitReveal {
        address k3 = makeAddr("k3");
        uint256 nonce = _submitCommit(question_id, 1002, 0, 1, k3);
        uint256 fee = arb.getDisputeFee(question_id);

        if (settledTooSoonSupported) {
            // 3.0+: arbitration cannot be requested while the only answer is an
            // unrevealed commitment. Reveal first, then it works.
            vm.expectRevert();
            arb.requestArbitration{value: fee}(question_id, 0);
            _reveal(question_id, 1002, nonce, 1, k3);
            arb.requestArbitration{value: fee}(question_id, 0);
        } else {
            // pre-3.0: arbitration on an unrevealed commit is allowed; revealing
            // still works afterwards.
            arb.requestArbitration{value: fee}(question_id, 0);
            _reveal(question_id, 1002, nonce, 1, k3);
        }
        assertTrue(_q(question_id).isPendingArbitration);
    }
}
