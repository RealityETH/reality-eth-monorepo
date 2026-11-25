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
        // Use call rather than transfer: the 2300-gas stipend of transfer() would make withdraw() revert
        // for recipients whose receive()/fallback costs more (e.g. a multisig wallet), stranding their
        // balance. Safe against reentrancy -- the balance is zeroed first (CEI) and withdraw() is the only
        // function that sends native value, so a re-entrant call sees a zero balance.
        (bool ok,) = payable(msg.sender).call{value: bal}("");
        if (!ok) revert WithdrawFailed();
        emit LogWithdraw(msg.sender, bal);
    }
}
