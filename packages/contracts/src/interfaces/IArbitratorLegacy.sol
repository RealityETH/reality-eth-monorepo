// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETH} from "./IRealityETH.sol";

interface IArbitratorLegacy {
    /// @notice Returns the Realitio contract address - deprecated in favour of realitio()
    function realitycheck() external view returns (IRealityETH);
}
