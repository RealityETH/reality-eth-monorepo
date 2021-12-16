// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

import './IOwned.sol';

contract Owned is IOwned {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) 
        onlyOwner 
    external {
        owner = newOwner;
    }
}
