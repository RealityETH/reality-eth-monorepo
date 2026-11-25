// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHBase} from "./RealityETHBase.t.sol";

/// Minimal proof that the parametrized bytecode-deploy harness works:
/// deploy the committed creation bytecode for the selected version, then
/// exercise a state-changing call and a view through the interface.
contract SmokeTest is RealityETHBase {
    function test_bytecode_deployed() public view {
        assertGt(address(rc).code.length, 0, "contract has no runtime code");
    }

    function test_create_template_and_ask() public {
        uint256 templateId = rc.createTemplate('{"title": "%s", "type": "bool"}');
        assertGt(templateId, 0, "template id should be > 0");

        uint32 timeout = 30;
        // Use a non-null arbitrator so the smoke passes on every version
        // (null arbitrators are a 3.0+ feature; covered in a gated test later).
        address arbitrator = address(0xA11CE);
        bytes32 questionId =
            rc.askQuestion(templateId, "Is the sky blue?", arbitrator, timeout, uint32(0), 0);
        assertTrue(questionId != bytes32(0), "question id should be non-zero");

        assertEq(uint256(rc.getTimeout(questionId)), uint256(timeout), "timeout mismatch");
        assertEq(rc.getArbitrator(questionId), arbitrator, "arbitrator mismatch");
        assertFalse(rc.isFinalized(questionId), "fresh question should not be finalized");
    }

    function test_version_configured() public view {
        assertGt(versionNum, 0, "version not configured");
    }
}
