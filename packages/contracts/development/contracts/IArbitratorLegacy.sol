// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import "./IRealityETH.sol";

interface IArbitratorLegacy {
    function realitycheck() external view returns (IRealityETH);
}
