// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IBalanceHolder} from "./interfaces/IBalanceHolder.sol";

contract BalanceHolder is IBalanceHolder {
    mapping(address account => uint256 balance) public balanceOf;

    event LogWithdraw(address indexed user, uint256 amount);

    /// @inheritdoc IBalanceHolder
    function withdraw() public {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        payable(msg.sender).transfer(bal);
        emit LogWithdraw(msg.sender, bal);
    }
}
