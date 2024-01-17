// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import './IBalanceHolder_common.sol';
import './IBalanceHolder_withdraw.sol';

interface IBalanceHolder is IBalanceHolder_common, IBalanceHolder_withdraw {
}
