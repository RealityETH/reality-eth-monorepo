pragma solidity ^0.4.18;

import './IERC20.sol';

contract BalanceHolder {

    IERC20 public token;

    mapping(address => uint256) public balanceOf;

    event LogWithdraw(
        address indexed user,
        uint256 amount
    );

    function withdraw() 
    public {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        require(token.transfer(msg.sender, bal));
        emit LogWithdraw(msg.sender, bal);
    }

}
