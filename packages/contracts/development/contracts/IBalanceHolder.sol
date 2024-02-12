// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

interface IBalanceHolder {
    event LogWithdraw(address indexed user, uint256 amount);
    function withdraw() external;
    function balanceOf(address) external view returns (uint256);
}
