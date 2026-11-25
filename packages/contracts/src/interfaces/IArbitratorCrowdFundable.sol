// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.4;

interface IArbitratorCrowdFundable {
    /* solhint-disable func-name-mixedcase */
    function arbitrationBounties(bytes32) external view returns (uint256);
}
