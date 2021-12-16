// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

import './IERC20.sol';

interface IBalanceHolder_ERC20 {
  function withdraw (  ) external;
  function balanceOf ( address ) external view returns ( uint256 );
  function token ( ) external view returns ( IERC20 );
}
