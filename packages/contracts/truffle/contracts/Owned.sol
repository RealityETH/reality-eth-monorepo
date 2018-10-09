pragma solidity ^0.4.18;


contract Owned {
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
    public {
        owner = newOwner;
    }
}
