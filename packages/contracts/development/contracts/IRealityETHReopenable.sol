// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

// These functions were removed from IRealityETH in version 4.
interface IRealityETHReopenable {
    event LogReopenQuestion(bytes32 indexed question_id, bytes32 indexed reopened_question_id);
    function isSettledTooSoon(bytes32 question_id) external view returns (bool);
    function resultForOnceSettled(bytes32 question_id) external view returns (bytes32);
    function reopened_questions(bytes32) external view returns (bytes32);
    function reopener_questions(bytes32) external view returns (bool);
    function reopenQuestion(
        uint256 template_id,
        string calldata question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce,
        uint256 min_bond,
        bytes32 reopens_question_id
    ) external payable returns (bytes32);
}
