// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

interface IArbitratorCrowdFundable {
    function arbitration_bounties ( bytes32 ) external view returns ( uint256 );
}
