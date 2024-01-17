// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import './IERC20.sol';
import './IBalanceHolder_common.sol';

interface IBalanceHolder_ERC20 is IBalanceHolder_common {
  function withdraw (  ) external;
  function token ( ) external view returns ( IERC20 );
}
