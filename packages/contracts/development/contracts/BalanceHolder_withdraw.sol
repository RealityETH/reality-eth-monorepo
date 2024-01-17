// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import './BalanceHolder_common.sol';
import './IBalanceHolder_withdraw.sol';

abstract contract BalanceHolder_withdraw is BalanceHolder_common, IBalanceHolder_withdraw {

    function withdraw() 
    public {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        payable(msg.sender).transfer(bal);
        emit LogWithdraw(msg.sender, bal);
    }

}
