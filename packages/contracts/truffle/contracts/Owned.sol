pragma solidity ^0.4.25;

import './IOwned.sol';

contract Owned is IOwned {
    address public owner;

    constructor() 
    public {
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
