// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {IBalanceHolder_ERC20} from "./interfaces/IBalanceHolder_ERC20.sol";

contract BalanceHolder_ERC20 is IBalanceHolder_ERC20 {
    IERC20 public token;

    mapping(address account => uint256 balance) public balanceOf;

    event LogWithdraw(address indexed user, uint256 amount);

    /// @inheritdoc IBalanceHolder_ERC20
    function withdraw() public {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        if (!token.transfer(msg.sender, bal)) revert TokenTransferFailed();
        emit LogWithdraw(msg.sender, bal);
    }
}
