// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IBalanceHolder} from "./IBalanceHolder.sol";
import {IRealityETHErrors} from "./IRealityETHErrors.sol";

/* solhint-disable func-name-mixedcase */

interface IRealityETHCore is IBalanceHolder, IRealityETHErrors {
    event LogCancelArbitration(bytes32 indexed questionId);
    event LogClaim(bytes32 indexed questionId, address indexed user, uint256 amount);
    event LogFinalize(bytes32 indexed questionId, bytes32 indexed answer);
    event LogFundAnswerBounty(bytes32 indexed questionId, uint256 bountyAdded, uint256 bounty, address indexed user);
    event LogMinimumBond(bytes32 indexed questionId, uint256 minBond);
    event LogNewAnswer(bytes32 answer, bytes32 indexed questionId, bytes32 historyHash, address indexed user, uint256 bond, uint256 ts, bool isCommitment);
    event LogNewQuestion(
        bytes32 indexed questionId,
        address indexed user,
        uint256 templateId,
        string question,
        bytes32 indexed contentHash,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 created
    );
    event LogNewTemplate(uint256 indexed templateId, address indexed user, string questionText);
    event LogNotifyOfArbitrationRequest(bytes32 indexed questionId, address indexed user);
    event LogReopenQuestion(bytes32 indexed questionId, bytes32 indexed reopenedQuestionId);
    event LogSetQuestionFee(address arbitrator, uint256 amount);

    struct Question {
        bytes32 contentHash;
        address arbitrator;
        uint32 openingTs;
        uint32 timeout;
        uint32 finalizeTs;
        bool isPendingArbitration;
        uint256 bounty;
        bytes32 bestAnswer;
        bytes32 historyHash;
        uint256 bond;
        uint256 minBond;
    }

    // Only used when claiming more bonds than fits into a transaction
    // Stored in a mapping indexed by questionId.
    struct Claim {
        address payee;
        uint256 lastBond;
        uint256 queuedFunds; // Only used on v3 or lower (related to commit-reveal)
    }

    function assignWinnerAndSubmitAnswerByArbitrator(
        bytes32 questionId,
        bytes32 answer,
        address payeeIfWrong,
        bytes32 lastHistoryHash,
        bytes32 lastAnswerOrCommitmentId,
        address lastAnswerer
    ) external;
    function cancelArbitration(bytes32 questionId) external;
    function claimMultipleAndWithdrawBalance(
        bytes32[] calldata questionIds,
        uint256[] calldata lengths,
        bytes32[] calldata histHashes,
        address[] calldata addrs,
        uint256[] calldata bonds,
        bytes32[] calldata answers
    ) external;
    function claimWinnings(bytes32 questionId, bytes32[] calldata historyHashes, address[] calldata addrs, uint256[] calldata bonds, bytes32[] calldata answers) external;
    function createTemplate(string calldata content) external returns (uint256);
    function notifyOfArbitrationRequest(bytes32 questionId, address requester, uint256 maxPrevious) external;
    function setQuestionFee(uint256 fee) external;
    function submitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address answerer) external;
    function askQuestion(uint256 templateId, string calldata question, address arbitrator, uint32 timeout, uint32 openingTs, uint256 nonce) external payable returns (bytes32);
    function askQuestionWithMinBond(uint256 templateId, string calldata question, address arbitrator, uint32 timeout, uint32 openingTs, uint256 nonce, uint256 minBond) external payable returns (bytes32);
    function createTemplateAndAskQuestion(string calldata content, string calldata question, address arbitrator, uint32 timeout, uint32 openingTs, uint256 nonce) external payable returns (bytes32);
    function fundAnswerBounty(bytes32 questionId) external payable;
    function reopenQuestion(
        uint256 templateId,
        string calldata question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond,
        bytes32 reopensQuestionId
    ) external payable returns (bytes32);
    function submitAnswer(bytes32 questionId, bytes32 answer, uint256 maxPrevious) external payable;
    function submitAnswerFor(bytes32 questionId, bytes32 answer, uint256 maxPrevious, address answerer) external payable;
    function arbitrator_question_fees(address) external view returns (uint256);
    function getArbitrator(bytes32 questionId) external view returns (address);
    function getBestAnswer(bytes32 questionId) external view returns (bytes32);
    function getBond(bytes32 questionId) external view returns (uint256);
    function getBounty(bytes32 questionId) external view returns (uint256);
    function getContentHash(bytes32 questionId) external view returns (bytes32);
    function getFinalAnswer(bytes32 questionId) external view returns (bytes32);
    function getFinalAnswerIfMatches(bytes32 questionId, bytes32 contentHash, address arbitrator, uint32 minTimeout, uint256 minBond) external view returns (bytes32);
    function getFinalizeTS(bytes32 questionId) external view returns (uint32);
    function getHistoryHash(bytes32 questionId) external view returns (bytes32);
    function getMinBond(bytes32 questionId) external view returns (uint256);
    function getOpeningTS(bytes32 questionId) external view returns (uint32);
    function getTimeout(bytes32 questionId) external view returns (uint32);
    function isFinalized(bytes32 questionId) external view returns (bool);
    function isPendingArbitration(bytes32 questionId) external view returns (bool);
    function isSettledTooSoon(bytes32 questionId) external view returns (bool);
    function question_claims(bytes32) external view returns (address payee, uint256 lastBond, uint256 queuedFunds);
    function questions(
        bytes32
    )
        external
        view
        returns (
            bytes32 contentHash,
            address arbitrator,
            uint32 openingTs,
            uint32 timeout,
            uint32 finalizeTs,
            bool isPendingArbitration,
            uint256 bounty,
            bytes32 bestAnswer,
            bytes32 historyHash,
            uint256 bond,
            uint256 minBond
        );
    function reopened_questions(bytes32) external view returns (bytes32);
    function reopener_questions(bytes32) external view returns (bool);
    function resultFor(bytes32 questionId) external view returns (bytes32);
    function resultForOnceSettled(bytes32 questionId) external view returns (bytes32);
    function template_hashes(uint256) external view returns (bytes32);
    function templates(uint256) external view returns (uint256);
}
