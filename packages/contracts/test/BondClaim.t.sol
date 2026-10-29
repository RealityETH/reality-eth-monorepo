// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from tests/python/test.py — bond claiming (payout accounting).
contract BondClaimTest is RealityETHStd {
    modifier onlyCommitReveal() {
        if (!commitRevealSupported) {
            vm.skip(true);
            return;
        }
        _;
    }

    function _claim(bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) internal {
        rc.claimWinnings(question_id, hs, ad, bo, an);
    }

    function test_bond_claim_same_person_repeating_self() public {
        address sdr = makeAddr("sdr");
        _submit(question_id, 1001, 0, 20, sdr);
        _submit(question_id, 1001, 20, 40, sdr);
        _submit(question_id, 1001, 40, 80, sdr);
        _submit(question_id, 1001, 80, 160, sdr);
        _submit(question_id, 1001, 160, 320, sdr);
        _submit(question_id, 1001, 320, 640, sdr);
        _advanceClock(33);
        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        _claim(hs, ad, bo, an);
        assertEq(
            rc.balanceOf(sdr),
            640 + _subFee(320) + _subFee(160) + _subFee(80) + _subFee(40) + _subFee(20) + 1000
        );
    }

    function test_bond_claim_same_person_contradicting_self() public {
        address k3 = makeAddr("k3");
        _submit(question_id, 1001, 0, 20, k3);
        _submit(question_id, 1002, 20, 40, k3);
        _submit(question_id, 1001, 40, 80, k3);
        _submit(question_id, 1004, 80, 160, k3);
        _submit(question_id, 1003, 160, 320, k3);
        _submit(question_id, 1001, 320, 640, k3);
        _advanceClock(33);
        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        _claim(hs, ad, bo, an);
        assertEq(
            rc.balanceOf(k3),
            640 + _subFee(320) + _subFee(160) + _subFee(80) + _subFee(40) + _subFee(20) + 1000
        );
    }

    function test_bond_claim_arbitration_existing_none() public {
        uint256 fee = arb.getDisputeFee(question_id);
        vm.expectRevert(); // no answer yet => arbitration request fails
        arb.requestArbitration{value: fee}(question_id, 0);
    }

    function test_bond_claim_arbitration_existing_final() public {
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");
        _submit(question_id, 1001, 0, 2, k4);
        _submit(question_id, 1002, 2, 4, k3);
        _submit(question_id, 1002, 4, 8, k3);
        _submit(question_id, 1001, 8, 16, k4);

        uint256 fee = arb.getDisputeFee(question_id);
        arb.requestArbitration{value: fee}(question_id, 0);

        bytes32 histHash = _histHash(question_id);
        arb.submitAnswerByArbitrator(question_id, _answer(1001), k4);

        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) =
            _buildClaim(histHash, 0, _answer(1001), k4);
        _claim(hs, ad, bo, an);
        assertEq(rc.balanceOf(k4), 16 + 8 + 4 + 2 + 1000);
    }

    function test_bond_claim_split_over_transactions() public {
        address k4 = makeAddr("k4");
        _submit(question_id, 1001, 0, 2, k4);
        _submit(question_id, 1002, 2, 4, k4);
        _submit(question_id, 1002, 4, 8, k4);
        _submit(question_id, 1001, 8, 16, k4);
        _advanceClock(33);

        (bytes32[] memory h1, address[] memory a1, uint256[] memory b1, bytes32[] memory an1) = _claimSlice(0, 2);
        _claim(h1, a1, b1, an1);
        assertEq(rc.balanceOf(k4), 16 + 1000);

        (bytes32[] memory h2, address[] memory a2, uint256[] memory b2, bytes32[] memory an2) = _claimSlice(2, 4);
        _claim(h2, a2, b2, an2);
        assertEq(rc.balanceOf(k4), 16 + 8 + 4 + 2 + 1000);
    }

    function test_bond_claim_after_reveal_fail() public onlyCommitReveal {
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5");
        address k6 = makeAddr("k6");

        _submit(question_id, 1002, 0, 1, k3);
        _submit(question_id, 1001, 1, 2, k5);
        _submit(question_id, 1003, 2, 4, k4);
        _submit(question_id, 1002, 4, 8, k6);
        _submitCommit(question_id, 1004, 8, 16, k5); // never revealed
        _submitCommit(question_id, 1002, 16, 32, k4); // never revealed

        _advanceClock(33);
        (bytes32[] memory hs, address[] memory ad, uint256[] memory bo, bytes32[] memory an) = _buildClaimNoArb();
        _claim(hs, ad, bo, an);
        assertEq(rc.balanceOf(k6), 32 + 16 + 8 + 4 + 2 - 1 + 1000);
        assertEq(rc.balanceOf(k3), 1 + 1);
    }

    function test_bond_claim_split_over_transactions_payee_later() public {
        address k2 = makeAddr("k2");
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5");
        address k6 = makeAddr("k6");

        _submit(question_id, 1002, 0, 1, k3);
        _submit(question_id, 1001, 1, 2, k5);
        _submit(question_id, 1003, 2, 4, k4);
        _submit(question_id, 1002, 4, 8, k6);
        _submit(question_id, 1004, 8, 16, k5);
        _submit(question_id, 1002, 16, 32, k2);
        _advanceClock(33);

        (bytes32[] memory h1, address[] memory a1, uint256[] memory b1, bytes32[] memory an1) = _claimSlice(0, 2);
        _claim(h1, a1, b1, an1);
        (bytes32[] memory h2, address[] memory a2, uint256[] memory b2, bytes32[] memory an2) = _claimSlice(2, 6);
        _claim(h2, a2, b2, an2);

        assertEq(rc.balanceOf(k2), 32 + 16 - 8 + 1000);
        assertEq(rc.balanceOf(k6), 8 + 8 + 4 + 2 - 1);
        assertEq(rc.balanceOf(k3), 1 + 1);
    }

    function test_bond_claim_split_over_transactions_payee_later_unrevealed_commit() public onlyCommitReveal {
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5");
        address k6 = makeAddr("k6");

        _submit(question_id, 1002, 0, 1, k3);
        _submit(question_id, 1001, 1, 2, k5);
        _submit(question_id, 1003, 2, 4, k4);
        _submit(question_id, 1002, 4, 8, k6);
        _submitCommit(question_id, 1004, 8, 16, k5); // never revealed
        _submitCommit(question_id, 1002, 16, 32, k4); // never revealed
        _advanceClock(33);

        (bytes32[] memory h1, address[] memory a1, uint256[] memory b1, bytes32[] memory an1) = _claimSlice(0, 2);
        _claim(h1, a1, b1, an1);
        (bytes32[] memory h2, address[] memory a2, uint256[] memory b2, bytes32[] memory an2) = _claimSlice(2, 6);
        _claim(h2, a2, b2, an2);

        assertEq(rc.balanceOf(k6), 32 + 16 + 8 + 4 + 2 - 1 + 1000);
        assertEq(rc.balanceOf(k3), 1 + 1);
    }
}
