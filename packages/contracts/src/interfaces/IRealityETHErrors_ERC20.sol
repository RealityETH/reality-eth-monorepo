// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETHErrors} from "./IRealityETHErrors.sol";

// solhint-disable-next-line contract-name-camelcase
interface IRealityETHErrors_ERC20 is IRealityETHErrors {
    /// @notice Token can only be initialized once
    error TokenCanOnlyBeInitializedOnce();
    /// @notice Transfer of tokens failed, insufficient approved balance?
    error TransferOfTokensFailedInsufficientApprovedBalance();
}
