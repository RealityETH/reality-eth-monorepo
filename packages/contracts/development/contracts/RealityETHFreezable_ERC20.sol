// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import {RealityETH_ERC20_v4_0} from "./RealityETH_ERC20-4.0.sol";

/*
 * This version of reality.eth provides the ability to freeze the entire contract.
 * This is intended to be extended by the forkable reality.eth required by Backstop.
 * It may be used for other purposes, but will need additional functionality to manage the permission for the freeze function.
 */

// solhint-disable-next-line contract-name-camelcase
abstract contract RealityETHFreezable_ERC20 is RealityETH_ERC20_v4_0 {
    /// @notice msg.sender must be arbitrator
    error ContractIsFrozen();

    // The timestamp when the contract was frozen.
    uint32 public freeze_ts;

    modifier notFrozen() override {
        if (freeze_ts > 0) revert ContractIsFrozen();
        _;
    }

    /// @notice Report whether the answer to the specified question is finalized
    /// @param question_id The ID of the question
    /// @return Return true if finalized
    function isFinalized(bytes32 question_id) public view override returns (bool) {
        // Nothing that finalizes after the freeze is finalized.
        if (freeze_ts > 0 && questions[question_id].finalize_ts >= freeze_ts) {
            return false;
        }

        // Questions that were queried before the freeze can be queried even after the freeze.
        // However other operations such as claiming rewards are frozen by the notFrozen modifier.
        return super.isFinalized(question_id);
    }
}
