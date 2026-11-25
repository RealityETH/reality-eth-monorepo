// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import "./interfaces/IOwned.sol";

contract Owned is IOwned {
    address public owner;

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /// @inheritdoc IOwned
    function transferOwnership(address newOwner) external onlyOwner {
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
