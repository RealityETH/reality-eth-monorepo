// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

// Features removed in v4
import {IRealityETHCore_ERC20} from "./IRealityETHCore_ERC20.sol";
import {IRealityETHCommitReveal_ERC20} from "./IRealityETHCommitReveal_ERC20.sol";
import {IRealityETHCreateTemplateAndAskQuestion} from "./IRealityETHCreateTemplateAndAskQuestion.sol";

/* solhint-disable func-name-mixedcase */

interface IRealityETH_ERC20 is IRealityETHCore_ERC20, IRealityETHCommitReveal_ERC20, IRealityETHCreateTemplateAndAskQuestion {}
