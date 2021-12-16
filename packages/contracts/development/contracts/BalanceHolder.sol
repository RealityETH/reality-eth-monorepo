// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

import './IBalanceHolder.sol';

contract BalanceHolder is IBalanceHolder {

    mapping(address => uint256) public balanceOf;

    event LogWithdraw(
        address indexed user,
        uint256 amount
    );

    function withdraw() 
    public {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        payable(msg.sender).transfer(bal);
        emit LogWithdraw(msg.sender, bal);
    }

}
