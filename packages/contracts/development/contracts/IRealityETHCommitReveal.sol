// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

// These functions were removed from IRealityETH in version 4.
interface IRealityETHCommitReveal {
    // Stored in a mapping indexed by commitment_id, a hash of commitment hash, question, bond.
    struct Commitment {
        uint32 reveal_ts;
        bool is_revealed;
        bytes32 revealed_answer;
    }
    event LogAnswerReveal (bytes32 indexed question_id, address indexed user, bytes32 indexed answer_hash, bytes32 answer, uint256 nonce, uint256 bond);
    function commitments (bytes32) external view returns (uint32 reveal_ts, bool is_revealed, bytes32 revealed_answer);
    function submitAnswerCommitment (bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer) external payable;
    function submitAnswerReveal (bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond) external;
}
