// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.4;

interface IBalanceHolder {
    /// @notice The native-value transfer in withdraw() failed
    error WithdrawFailed();

    function withdraw() external;
    function balanceOf(address) external view returns (uint256);
}
