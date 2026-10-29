// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHStd} from "./StdSetup.t.sol";

/// Ported from tests/python/test.py — assorted tests.
contract MiscTest is RealityETHStd {
    function test_arbitrator_fee_received() public view {
        // the 100-wei question fee from setUp is credited to the arbitrator
        assertEq(rc.balanceOf(address(arb)), 100);
    }

    function test_min_payment_with_bond_param() public {
        address k3 = makeAddr("k3");
        address k4 = makeAddr("k4");
        address k5 = makeAddr("k5");
        // the escalating bonds must all be accepted (max_previous gates the last)
        _submit(question_id, 12345, 0, 1, makeAddr("k0"));
        _submit(question_id, 10001, 0, 2, k3);
        _submit(question_id, 10002, 0, 5, k4);
        _submit(question_id, 10002, 5, 27, k5);
    }
}
