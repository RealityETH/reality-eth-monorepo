// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

/* solhint-disable func-name-mixedcase */
interface IRealityETHCore_Native {
    function askQuestion(uint256 template_id, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) external payable returns (bytes32);
    function askQuestionWithMinBond(uint256 template_id, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond) external payable returns (bytes32);
    function fundAnswerBounty(bytes32 question_id) external payable;
    function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) external payable;
    function submitAnswerFor(bytes32 question_id, bytes32 answer, uint256 max_previous, address answerer) external payable;
}
