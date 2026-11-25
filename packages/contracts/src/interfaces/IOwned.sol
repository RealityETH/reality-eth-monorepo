// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

interface IOwned {
    /// @notice Emitted when ownership is transferred, including the initial
    /// assignment at construction (from the zero address).
    /// @param previousOwner The owner before the transfer (zero at construction)
    /// @param newOwner The owner after the transfer
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @notice The caller must be the owner
    error MsgSenderMustBeOwner();

    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;
}
