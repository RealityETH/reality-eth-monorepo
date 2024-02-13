// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETHCore_Common} from "./IRealityETHCore_Common.sol";
import {IRealityETHCore_Native} from "./IRealityETHCore_Native.sol";

// Features removed in v4
import {IRealityETHCommitReveal} from "./IRealityETHCommitReveal.sol";
import {IRealityETHCreateTemplateAndAskQuestion} from "./IRealityETHCreateTemplateAndAskQuestion.sol";

/* solhint-disable func-name-mixedcase */

interface IRealityETH is IRealityETHCore_Common, IRealityETHCore_Native, IRealityETHCommitReveal, IRealityETHCreateTemplateAndAskQuestion {}
