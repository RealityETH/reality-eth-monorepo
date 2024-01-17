// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import './IBalanceHolder_common.sol';

abstract contract BalanceHolder_common is IBalanceHolder_common {

    mapping(address => uint256) public balanceOf;

    event LogWithdraw(
        address indexed user,
        uint256 amount
    );

}
