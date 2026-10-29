// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from tests/python/test.py — core question lifecycle
/// (no commit-reveal, no arbitration).
contract CoreTest is RealityETHStd {
    function test_fund_increase() public {
        rc.fundAnswerBounty{value: 500}(question_id);
        (,,,,,, uint256 bounty,,,,) = rc.questions(question_id);
        assertEq(bounty, 1500);
    }

    function test_no_response_finalization() public {
        assertFalse(rc.isFinalized(question_id));
        _advanceClock(33);
        assertFalse(rc.isFinalized(question_id)); // no answer => never final
    }

    function test_simple_response_finalization() public {
        rc.submitAnswer{value: 1}(question_id, _answer(12345), 0);
        _advanceClock(33);
        (,,,,,,, bytes32 best,,,) = rc.questions(question_id);
        assertEq(uint256(best), 12345);
        assertTrue(rc.isFinalized(question_id));
        assertEq(uint256(rc.getFinalAnswer(question_id)), 12345);
    }

    function test_content_hash() public view {
        bytes32 expect = _contentHash(0, 0, "my question");
        (bytes32 ch,,,,,,,,,,) = rc.questions(question_id);
        assertEq(ch, expect);
    }

    function test_earliest_finalization_ts() public {
        rc.submitAnswer{value: 10}(question_id, _answer(54321), 0);
        (,,,, uint32 ts1,,,,,,) = rc.questions(question_id);
        _advanceClock(1);
        rc.submitAnswer{value: 20}(question_id, _answer(54321), 0);
        (,,,, uint32 ts2,,,,, uint256 bond,) = rc.questions(question_id);
        assertEq(bond, 20);
        assertGt(ts2, ts1, "submitting an answer advances the finalization timestamp");
    }

    function test_conflicting_response_finalization() public {
        rc.submitAnswer{value: 1}(question_id, _answer(12345), 0);
        rc.submitAnswer{value: 10}(question_id, _answer(54321), 0);
        _advanceClock(33);
        assertTrue(rc.isFinalized(question_id));
        assertEq(uint256(rc.getFinalAnswer(question_id)), 54321);
    }

    function test_get_final_answer_if_match() public {
        bytes32 expectCh = _contentHash(0, 0, "my question");
        bytes32 wrongCh = _contentHash(0, 0, "not my question");
        address wrongArb = address(0x2222);

        rc.submitAnswer{value: 1}(question_id, _answer(12345), 0);

        // not finalized yet
        vm.expectRevert();
        rc.getFinalAnswerIfMatches(question_id, expectCh, address(arb), 0, 25);

        _advanceClock(33);

        vm.expectRevert(); // wrong arbitrator
        rc.getFinalAnswerIfMatches(question_id, expectCh, wrongArb, 0, 25);

        vm.expectRevert(); // wrong content hash
        rc.getFinalAnswerIfMatches(question_id, wrongCh, address(arb), 0, 25);

        vm.expectRevert(); // min_bond too high
        rc.getFinalAnswerIfMatches(question_id, expectCh, address(arb), 25, 99999999999);

        vm.expectRevert(); // min_timeout too high
        rc.getFinalAnswerIfMatches(question_id, expectCh, address(arb), 1893459661, 25);

        bytes32 ans = rc.getFinalAnswerIfMatches(question_id, expectCh, address(arb), 0, 0);
        assertEq(uint256(ans), 12345);
    }
}
