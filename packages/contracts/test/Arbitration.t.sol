// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from tests/python/test.py — arbitration (non commit-reveal).
contract ArbitrationTest is RealityETHStd {
    function test_arbitrator_answering_answered() public {
        _submit(question_id, 12345, 0, 1, address(this));

        vm.expectRevert(); // arbitrator cannot answer an un-requested question
        arb.submitAnswerByArbitrator(question_id, _answer(123456), address(this));

        vm.expectRevert(); // only the arbitrator can notify
        rc.notifyOfArbitrationRequest(question_id, address(this), 0);

        assertFalse(rc.isFinalized(question_id));

        uint256 fee = arb.getDisputeFee(question_id);
        arb.requestArbitration{value: fee}(question_id, 0);
        (,,,,, bool pending,,,,,) = rc.questions(question_id);
        assertTrue(pending, "is_pending_arbitration set");

        arb.submitAnswerByArbitrator(question_id, _answer(123456), address(this));
        assertTrue(rc.isFinalized(question_id));
        assertEq(uint256(rc.getFinalAnswer(question_id)), 123456);
        (,,,,,,,,, uint256 bond,) = rc.questions(question_id);
        assertTrue(bond != 0);
    }

    function test_arbitrator_answering_unanswered() public {
        vm.expectRevert();
        arb.submitAnswerByArbitrator(question_id, _answer(123456), address(arb));

        assertFalse(rc.isFinalized(question_id));
        (,,,,,,,,, uint256 bond,) = rc.questions(question_id);
        assertEq(bond, 0);

        uint256 fee = arb.getDisputeFee(question_id);
        // Requesting arbitration on an unanswered question must not leave it
        // pending (whether it reverts is version-dependent).
        try arb.requestArbitration{value: fee}(question_id, 0) {} catch {}
        (,,,,, bool pending,,,,,) = rc.questions(question_id);
        assertFalse(pending);
    }

    function test_arbitrator_cancel() public {
        _submit(question_id, 12345, 0, 1, address(this));

        vm.expectRevert();
        arb.submitAnswerByArbitrator(question_id, _answer(123456), address(this));

        vm.expectRevert(); // cannot cancel arbitration that was never requested
        arb.cancelArbitration(question_id);

        assertFalse(rc.isFinalized(question_id));

        uint256 fee = arb.getDisputeFee(question_id);
        arb.requestArbitration{value: fee}(question_id, 0);
        (,,,,, bool pending,,,,,) = rc.questions(question_id);
        assertTrue(pending);

        vm.expectRevert(); // only the arbitrator can cancel
        rc.cancelArbitration(question_id);

        uint256 cancelledTs = block.timestamp;
        arb.cancelArbitration(question_id);
        assertFalse(rc.isFinalized(question_id));

        vm.expectRevert(); // cannot cancel again (no longer pending)
        arb.cancelArbitration(question_id);

        (,,,, uint32 finalizeTs, bool pending2,,,,,) = rc.questions(question_id);
        assertFalse(pending2, "pending cleared after cancel");
        assertEq(uint256(finalizeTs), cancelledTs + 30, "cancel extends the timeout");

        // answering + re-requesting works again
        _submit(question_id, 54321, 0, 2, address(this));
        arb.requestArbitration{value: fee}(question_id, 0);
    }

    function test_set_dispute_fee() public {
        arb.setDisputeFee(0);
        vm.expectRevert(); // fee of 0 => arbitration can never be requested
        arb.requestArbitration{value: 0}(question_id, 0);

        arb.setDisputeFee(123);
        assertEq(arb.getDisputeFee(question_id), 123);

        arb.setCustomDisputeFee(question_id, 23);
        assertEq(arb.getDisputeFee(question_id), 23);

        arb.setCustomDisputeFee(question_id, 0);
        assertEq(arb.getDisputeFee(question_id), 123);
    }

    function test_arbitration_max_previous() public {
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");
        _submit(question_id, 1001, 0, 2, k4);
        _submit(question_id, 1002, 2, 4, k3);

        uint256 fee = arb.getDisputeFee(question_id);
        vm.expectRevert(); // max_previous 2 < current bond 4
        arb.requestArbitration{value: fee}(question_id, 2);

        arb.requestArbitration{value: fee}(question_id, 4);
    }

    function test_arbitrator_answering_assigning_answerer_right() public {
        address k2 = makeAddr("k2");
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");

        _submit(question_id, 1001, 0, 2, k4);
        _submit(question_id, 1002, 2, 4, k3);
        _submit(question_id, 1002, 4, 8, k3);
        _submit(question_id, 1001, 8, 16, k4);

        uint256 fee = arb.getDisputeFee(question_id);
        vm.deal(k2, fee);
        vm.prank(k2);
        arb.requestArbitration{value: fee}(question_id, 0);

        bytes32 arbAnswer = _answer(1001);
        bytes32 histHash = _histHash(question_id);

        vm.expectRevert(); // only the arbitrator may assign
        rc.assignWinnerAndSubmitAnswerByArbitrator(
            question_id, arbAnswer, k2, _lastHistBefore(), _lastAnswer(), _lastAddr()
        );

        arb.assignWinnerAndSubmitAnswerByArbitrator(
            question_id, arbAnswer, k2, _lastHistBefore(), _lastAnswer(), _lastAddr()
        );

        (bytes32[] memory hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers) =
            _buildClaim(histHash, 0, arbAnswer, k4);
        rc.claimWinnings(question_id, hashes, addrs, bonds, answers);

        assertEq(
            rc.balanceOf(k4),
            2 + _subFee(4) + _subFee(8) + _subFee(16) + 1000,
            "last correct answerer takes it all"
        );
    }

    function test_arbitrator_answering_assigning_answerer_wrong() public {
        address k2 = makeAddr("k2");
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");

        _submit(question_id, 1001, 0, 2, k4);
        _submit(question_id, 1002, 2, 4, k3);
        _submit(question_id, 1002, 4, 8, k3);
        _submit(question_id, 1001, 8, 16, k4);

        uint256 fee = arb.getDisputeFee(question_id);
        vm.deal(k2, fee);
        vm.prank(k2);
        arb.requestArbitration{value: fee}(question_id, 0);

        bytes32 arbAnswer = _answer(123456); // not any submitted answer => "wrong"
        bytes32 histHash = _histHash(question_id);

        arb.assignWinnerAndSubmitAnswerByArbitrator(
            question_id, arbAnswer, k2, _lastHistBefore(), _lastAnswer(), _lastAddr()
        );

        (bytes32[] memory hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers) =
            _buildClaim(histHash, 0, arbAnswer, k2);
        rc.claimWinnings(question_id, hashes, addrs, bonds, answers);

        assertEq(
            rc.balanceOf(k2),
            2 + _subFee(4) + _subFee(8) + _subFee(16) + 1000,
            "arbitration payer takes it all for a wrong answer"
        );
    }

    modifier onlyCommitReveal() {
        if (!commitRevealSupported) {
            vm.skip(true);
            return;
        }
        _;
    }

    function test_arbitrator_answering_assigning_answerer_right_commit() public onlyCommitReveal {
        address k2 = makeAddr("k2");
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");

        _submit(question_id, 1001, 0, 2, k4);
        _submit(question_id, 1002, 2, 4, k3);
        _submit(question_id, 1002, 4, 8, k3);
        uint256 nonce = _submitCommit(question_id, 1001, 8, 16, k4);
        _reveal(question_id, 1001, nonce, 16, k4);

        uint256 fee = arb.getDisputeFee(question_id);
        vm.deal(k2, fee);
        vm.prank(k2);
        arb.requestArbitration{value: fee}(question_id, 0);

        bytes32 arbAnswer = _answer(1001);
        bytes32 histHash = _histHash(question_id);
        arb.assignWinnerAndSubmitAnswerByArbitrator(
            question_id, arbAnswer, k2, _lastHistBefore(), _lastAnswer(), _lastAddr()
        );

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) =
            _buildClaim(histHash, 0, arbAnswer, k4);
        rc.claimWinnings(question_id, hs, ad, bo, an);
        assertEq(rc.balanceOf(k4), 2 + _subFee(4) + _subFee(8) + _subFee(16) + 1000);
    }

    function test_arbitrator_answering_assigning_answerer_wrong_commit() public onlyCommitReveal {
        address k2 = makeAddr("k2");
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");

        _submit(question_id, 1001, 0, 2, k4);
        _submit(question_id, 1002, 2, 4, k3);
        _submit(question_id, 1002, 4, 8, k3);
        uint256 nonce = _submitCommit(question_id, 1001, 8, 16, k4);
        _reveal(question_id, 1001, nonce, 16, k4);

        uint256 fee = arb.getDisputeFee(question_id);
        vm.deal(k2, fee);
        vm.prank(k2);
        arb.requestArbitration{value: fee}(question_id, 0);

        bytes32 arbAnswer = _answer(98765); // wrong
        bytes32 histHash = _histHash(question_id);
        arb.assignWinnerAndSubmitAnswerByArbitrator(
            question_id, arbAnswer, k2, _lastHistBefore(), _lastAnswer(), _lastAddr()
        );

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) =
            _buildClaim(histHash, 0, arbAnswer, k2);
        rc.claimWinnings(question_id, hs, ad, bo, an);
        assertEq(rc.balanceOf(k2), 2 + _subFee(4) + _subFee(8) + _subFee(16) + 1000);
    }

    function test_arbitrator_answering_assigning_answerer_unrevealed_commit() public onlyCommitReveal {
        address k2 = makeAddr("k2");
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");

        _submit(question_id, 1001, 0, 2, k4);
        _submit(question_id, 1002, 2, 4, k3);
        _submit(question_id, 1002, 4, 8, k3);
        _submitCommit(question_id, 0, 8, 16, k4); // left unrevealed

        uint256 fee = arb.getDisputeFee(question_id);
        vm.deal(k2, fee);
        vm.prank(k2);
        arb.requestArbitration{value: fee}(question_id, 0);

        bytes32 arbAnswer = _answer(0);
        bytes32 histHash = _histHash(question_id);

        // arbitration can't assign until the commit's reveal window has passed
        vm.expectRevert();
        arb.assignWinnerAndSubmitAnswerByArbitrator(
            question_id, arbAnswer, k2, _lastHistBefore(), _lastAnswer(), _lastAddr()
        );

        _advanceClock(10);
        arb.assignWinnerAndSubmitAnswerByArbitrator(
            question_id, arbAnswer, k2, _lastHistBefore(), _lastAnswer(), _lastAddr()
        );

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) =
            _buildClaim(histHash, 0, arbAnswer, k2);
        rc.claimWinnings(question_id, hs, ad, bo, an);
        assertEq(rc.balanceOf(k2), 2 + _subFee(4) + _subFee(8) + _subFee(16) + 1000);
    }

    function test_arbitrator_answering_single_unrevealed_commit() public onlyCommitReveal {
        address k4 = makeAddr("k4");
        uint256 nonce = _submitCommit(question_id, 1001, 0, 2, k4);

        uint256 fee = arb.getDisputeFee(question_id);

        vm.expectRevert(); // single unrevealed commit => cannot request arbitration
        arb.requestArbitration{value: fee}(question_id, 0);

        _reveal(question_id, 1001, nonce, 2, k4);
        arb.requestArbitration{value: fee}(question_id, 0); // now allowed
    }
}
