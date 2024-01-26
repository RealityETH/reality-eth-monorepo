// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

// These functions were removed added to reality.eth in version 4.
interface IRealityETHHistoryVerification {
    function isHistoryOfUnfinalizedQuestionValid(bytes32 question_id, bytes32[] memory history_hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers) external view returns (bool);
}
