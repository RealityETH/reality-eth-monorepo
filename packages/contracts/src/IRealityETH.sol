// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

/// @dev Superset interface across RealityETH 2.x / 3.x / 4.x. Any given
/// deployed version implements a subset; tests gate calls on feature flags.
/// Signatures taken from the RealityETH-3.0 ABI (plus 3.2 additions).
interface IRealityETH {
    // --- templates / asking ---
    function createTemplate(string calldata content) external returns (uint256);
    function createTemplateAndAskQuestion(
        string calldata content,
        string calldata question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce
    ) external payable returns (bytes32);
    function askQuestion(
        uint256 template_id,
        string calldata question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce
    ) external payable returns (bytes32);
    function askQuestionWithMinBond(
        uint256 template_id,
        string calldata question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce,
        uint256 min_bond
    ) external payable returns (bytes32);
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
    function fundAnswerBounty(bytes32 question_id) external payable;

    // --- answering ---
    function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) external payable;
    function submitAnswerFor(bytes32 question_id, bytes32 answer, uint256 max_previous, address answerer) external payable;
    function submitAnswerCommitment(bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer)
        external
        payable;
    function submitAnswerReveal(bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond) external;

    // --- arbitration ---
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer) external;
    function assignWinnerAndSubmitAnswerByArbitrator(
        bytes32 question_id,
        bytes32 answer,
        address payee_if_wrong,
        bytes32 last_history_hash,
        bytes32 last_answer_or_commitment_id,
        address last_answerer
    ) external;
    function notifyOfArbitrationRequest(bytes32 question_id, address requester, uint256 max_previous) external;
    function cancelArbitration(bytes32 question_id) external;

    // --- fees / claims / balance ---
    function setQuestionFee(uint256 fee) external;
    function claimWinnings(
        bytes32 question_id,
        bytes32[] calldata history_hashes,
        address[] calldata addrs,
        uint256[] calldata bonds,
        bytes32[] calldata answers
    ) external;
    function claimMultipleAndWithdrawBalance(
        bytes32[] calldata question_ids,
        uint256[] calldata lengths,
        bytes32[] calldata hist_hashes,
        address[] calldata addrs,
        uint256[] calldata bonds,
        bytes32[] calldata answers
    ) external;
    function withdraw() external;

    // --- views ---
    function arbitrator_question_fees(address) external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function commitments(bytes32) external view returns (uint32 reveal_ts, bool is_revealed, bytes32 revealed_answer);
    function getArbitrator(bytes32) external view returns (address);
    function getBestAnswer(bytes32) external view returns (bytes32);
    function getBond(bytes32) external view returns (uint256);
    function getBounty(bytes32) external view returns (uint256);
    function getContentHash(bytes32) external view returns (bytes32);
    function getFinalAnswer(bytes32) external view returns (bytes32);
    function getFinalAnswerIfMatches(bytes32, bytes32, address, uint32, uint256) external view returns (bytes32);
    function getFinalizeTS(bytes32) external view returns (uint32);
    function getHistoryHash(bytes32) external view returns (bytes32);
    function getMinBond(bytes32) external view returns (uint256);
    function getOpeningTS(bytes32) external view returns (uint32);
    function getTimeout(bytes32) external view returns (uint32);
    function isFinalized(bytes32) external view returns (bool);
    function isPendingArbitration(bytes32) external view returns (bool);
    function isSettledTooSoon(bytes32) external view returns (bool);
    function question_claims(bytes32) external view returns (address payee, uint256 last_bond, uint256 queued_funds);
    function questions(bytes32)
        external
        view
        returns (
            bytes32 content_hash,
            address arbitrator,
            uint32 opening_ts,
            uint32 timeout,
            uint32 finalize_ts,
            bool is_pending_arbitration,
            uint256 bounty,
            bytes32 best_answer,
            bytes32 history_hash,
            uint256 bond,
            uint256 min_bond
        );
    function reopened_questions(bytes32) external view returns (bytes32);
    function reopener_questions(bytes32) external view returns (bool);
    function resultFor(bytes32) external view returns (bytes32);
    function resultForOnceSettled(bytes32) external view returns (bytes32);
    function template_hashes(uint256) external view returns (bytes32);
    function templates(uint256) external view returns (uint256);
}
