// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.4;

import {IERC20} from "./IERC20.sol";

interface IArbitratorManagement {
    event LogSetRealitio(address realitio);

    event LogSetDisputeFee(uint256 fee);

    event LogSetCustomDisputeFee(bytes32 indexed questionId, uint256 fee);

    /// @notice Set the Reality Check contract address
    /// @param addr The address of the Reality Check contract
    function setRealitio(address addr) external;
    /// @notice Set the default fee
    /// @param fee The default fee amount
    function setDisputeFee(uint256 fee) external;
    /// @notice Set a custom fee for this particular question
    /// @param questionId The question in question
    /// @param fee The fee amount
    function setCustomDisputeFee(bytes32 questionId, uint256 fee) external;
    /// @notice Submit the arbitrator's answer to a question.
    /// @param questionId The question in question
    /// @param answer The answer
    /// @param answerer The answerer. If arbitration changed the answer, it should be the payer. If not, the old answerer.
    function submitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address answerer) external;
    /// @notice Withdraw any accumulated ETH fees to the specified address
    /// @param addr The address to which the balance should be sent
    function withdraw(address addr) external;
    /// @notice Withdraw any accumulated token fees to the specified address
    /// @param addr The address to which the balance should be sent
    /// @dev Only needed when the Realitio contract uses an ERC20 token, in which case the arbitrator's
    /// accrued fees (e.g. bond-tier fees) are held in that token rather than in ETH.
    function withdrawERC20(IERC20 _token, address addr) external;
    /// @notice Pull the arbitrator's accrued balance from the Realitio contract into this contract
    /// @dev Funds can then be liberated from this contract with our withdraw() function
    /// @dev This works in the same way whether the realitio contract is using ETH or an ERC20 token
    function callWithdraw() external;
    /// @notice Set a metadata string, expected to be JSON, containing things like arbitrator TOS address
    function setMetaData(string memory _metadata) external;
}
