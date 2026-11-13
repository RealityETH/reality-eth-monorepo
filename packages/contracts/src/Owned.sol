// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IOwned} from "./interfaces/IOwned.sol";

contract Owned is IOwned {
    address public owner;

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert MsgSenderMustBeOwner();
        _;
    }

    /// @inheritdoc IOwned
    // forge-lint: disable-next-line(missing-zero-check) -- burning ownership (newOwner == address(0)) is permitted
    function transferOwnership(address newOwner) external onlyOwner {
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
