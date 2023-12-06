// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

import './IArbitratorCoreMinimal.sol';

interface IArbitratorCoreRecommended is IArbitratorCoreMinimal {
  function metadata (  ) external view returns ( string memory );
}
