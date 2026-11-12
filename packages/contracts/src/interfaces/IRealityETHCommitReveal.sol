// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

// These functions were removed from IRealityETH in version 4.
interface IRealityETHCommitReveal {
    // Stored in a mapping indexed by commitmentId, a hash of commitment hash, question, bond.
    struct Commitment {
        uint32 revealTs;
        bool isRevealed;
        bytes32 revealedAnswer;
    }
    event LogAnswerReveal(bytes32 indexed questionId, address indexed user, bytes32 indexed answerHash, bytes32 answer, uint256 nonce, uint256 bond);
    function commitments(bytes32) external view returns (uint32 revealTs, bool isRevealed, bytes32 revealedAnswer);
    function submitAnswerCommitment(bytes32 questionId, bytes32 answerHash, uint256 maxPrevious, address _answerer) external payable;
    function submitAnswerReveal(bytes32 questionId, bytes32 answer, uint256 nonce, uint256 bond) external;
}
