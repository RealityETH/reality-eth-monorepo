// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

/*
This interface describes the Arbitrator contract originally deployed and managed by the reality.eth team. See below for the various parts it comprises.
For the minimal interface that will be able to interact with the reality.eth UI as an arbitrator, use IArbitratorCore.
*/

import {IArbitratorCore} from "./IArbitratorCore.sol";

// This provides management functionality to handle ownership, set fees etc.
import {IArbitratorManagement} from "./IArbitratorManagement.sol";

// This provides the old function realitycheck(), replaced by realitio().
import {IArbitratorLegacy} from "./IArbitratorLegacy.sol";

// This provides a function for querying the status of crowd-funded arbitration.
import {IArbitratorCrowdFundable} from "./IArbitratorCrowdFundable.sol";

// Errors (from v4)
import {IArbitratorErrors} from "./IArbitratorErrors.sol";

/* solhint-disable no-empty-blocks */
interface IArbitrator is IArbitratorCore, IArbitratorLegacy, IArbitratorManagement, IArbitratorCrowdFundable, IArbitratorErrors {}
