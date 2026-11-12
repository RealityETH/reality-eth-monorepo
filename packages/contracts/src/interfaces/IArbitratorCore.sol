// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETH} from "./IRealityETH.sol";

interface IArbitratorCore {
    event LogRequestArbitration(bytes32 indexed questionId, uint256 feePaid, address requester, uint256 remaining);

    /// @notice Return the dispute fee for the specified question. 0 indicates that we won't arbitrate it.
    /// @param questionId The question in question
    /// @dev Uses a general default, but can be over-ridden on a question-by-question basis.
    function getDisputeFee(bytes32 questionId) external view returns (uint256);
    function metadata() external view returns (string memory);
    function realitio() external view returns (IRealityETH);
    /// @notice Request arbitration, freezing the question until we send submitAnswerByArbitrator
    /// @dev The bounty can be paid only in part, in which case the last person to pay will be considered the payer
    /// Will trigger an error if the notification fails, eg because the question has already been finalized
    /// @param questionId The question in question
    /// @param maxPrevious If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    function requestArbitration(bytes32 questionId, uint256 maxPrevious) external payable returns (bool);
}
