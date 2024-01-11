// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import './IRealityETH_ERC20.sol';
import './IRealityETHCommitReveal_ERC20.sol';

// Legacy IRealityETH_ERC20 used up until version 3.
interface IRealityETH_ERC20v3 is IRealityETH_ERC20, IRealityETHCommitReveal_ERC20 {
}
