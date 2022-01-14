// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

import './IArbitrator.sol';
import './IERC20.sol';
import './IOwned.sol';

interface IArbitrator {
  function foreignProxy() external returns (address);
  function foreignChainId() external returns (uint256);
}
