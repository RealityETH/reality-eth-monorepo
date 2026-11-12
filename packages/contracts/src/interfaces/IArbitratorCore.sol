// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETH} from "./IRealityETH.sol";

interface IArbitratorCore {
    event LogRequestArbitration(bytes32 indexed questionId, uint256 feePaid, address requester, uint256 remaining);

    function getDisputeFee(bytes32 questionId) external view returns (uint256);
    function metadata() external view returns (string memory);
    function realitio() external view returns (IRealityETH);
    function requestArbitration(bytes32 questionId, uint256 maxPrevious) external payable returns (bool);
}
