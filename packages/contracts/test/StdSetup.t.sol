// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHBase} from "./RealityETHBase.t.sol";
import {MockArbitrator} from "./mocks/MockArbitrator.sol";

/// Standard fixture mirroring the Python `setUp` (ETH variant): an arbitrator
/// with a 100-wei question fee, and one open question "my question" (template 0,
/// timeout 30) asked with 1100 wei so the resulting bounty is 1000.
abstract contract RealityETHStd is RealityETHBase {
    MockArbitrator internal arb;
    bytes32 internal question_id;

    uint32 internal constant TIMEOUT = 30;
    uint256 internal constant QUESTION_FEE = 100;

    function setUp() public virtual override {
        super.setUp();
        // ETH fixture, v3+ only for now. ERC20 variants and the pre-v3 struct/id
        // layout need their own plumbing (tracked separately); skip cleanly.
        if (isERC20 || versionNum < 30) {
            vm.skip(true);
            return;
        }

        arb = new MockArbitrator();
        arb.setRealitio(address(rc));
        arb.setDisputeFee(10000000000000000);
        arb.setQuestionFee(QUESTION_FEE);

        question_id = rc.askQuestion{value: 1100}(0, "my question", address(arb), TIMEOUT, 0, 0);

        // mirror the sanity asserts in the Python setUp
        (, address arbitrator,, uint32 timeout, uint32 finalizeTs,, uint256 bounty,,,,) = rc.questions(question_id);
        assertEq(arbitrator, address(arb), "arbitrator");
        assertEq(uint256(timeout), uint256(TIMEOUT), "timeout");
        assertEq(uint256(finalizeTs), 0, "finalize ts should start at 0");
        assertEq(bounty, 1000, "bounty should be 1000 after the 100 fee");
    }
}
