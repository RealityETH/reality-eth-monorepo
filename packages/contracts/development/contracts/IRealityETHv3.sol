// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import './IRealityETH.sol';
import './IRealityETHCommitReveal.sol';

// Legacy IRealityETH used up until version 3.
interface IRealityETHv3 is IRealityETH, IRealityETHCommitReveal {
}
