// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.4;

import {IRealityETH} from "./IRealityETH.sol";

interface IArbitratorLegacy {
    /// @notice Returns the Realitio contract address - deprecated in favour of realitio()
    /// @return The RealityETH contract address
    function realitycheck() external view returns (IRealityETH);
}
