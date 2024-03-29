// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETHCore} from "./IRealityETHCore.sol";
import {IRealityETHCommitReveal} from "./IRealityETHCommitReveal.sol";

/* solhint-disable func-name-mixedcase */

interface IRealityETH is IRealityETHCore, IRealityETHCommitReveal {}
