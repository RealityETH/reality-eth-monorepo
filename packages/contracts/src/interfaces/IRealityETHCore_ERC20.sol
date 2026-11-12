// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IBalanceHolder_ERC20} from "./IBalanceHolder_ERC20.sol";
import {IERC20} from "./IERC20.sol";
import {IRealityETHErrors_ERC20} from "./IRealityETHErrors_ERC20.sol";

/* solhint-disable func-name-mixedcase */

// solhint-disable-next-line contract-name-camelcase
interface IRealityETHCore_ERC20 is IBalanceHolder_ERC20, IRealityETHErrors_ERC20 {
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

    /// @notice Ask a new question without a bounty and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @dev Calling without the token param will only work if there is no arbitrator-set question fee.
    /// @dev This has the same function signature as askQuestion() in the non-ERC20 version, which is optionally payable.
    /// @param templateId The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestion(uint256 templateId, string calldata question, address arbitrator, uint32 timeout, uint32 openingTs, uint256 nonce) external returns (bytes32);
    /// @notice Ask a new question with a bounty and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param templateId The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @param tokens The combined initial question bounty and question fee
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestionERC20(uint256 templateId, string calldata question, address arbitrator, uint32 timeout, uint32 openingTs, uint256 nonce, uint256 tokens) external returns (bytes32);
    /// @notice Ask a new question and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param templateId The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @param minBond The minimum bond that may be used for an answer.
    /// @param tokens Number of tokens sent
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestionWithMinBondERC20(
        uint256 templateId,
        string calldata question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond,
        uint256 tokens
    ) external returns (bytes32);
    /// @notice Submit the answer for a question, for use by the arbitrator, working out the appropriate winner based on the last answer details.
    /// @dev Doesn't require (or allow) a bond.
    /// @param questionId The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param payeeIfWrong The account to by credited as winner if the last answer given is wrong, usually the account that paid the arbitrator
    /// @param lastHistoryHash The history hash before the final one
    /// @param lastAnswer The last answer given
    /// @param lastAnswerer The address that supplied the last answer
    function assignWinnerAndSubmitAnswerByArbitrator(
        bytes32 questionId,
        bytes32 answer,
        address payeeIfWrong,
        bytes32 lastHistoryHash,
        bytes32 lastAnswer,
        address lastAnswerer
    ) external;
    /// @notice Cancel a previously-requested arbitration and extend the timeout
    /// @dev Useful when doing arbitration across chains that can't be requested atomically
    /// @param questionId The ID of the question
    function cancelArbitration(bytes32 questionId) external;
    /// @notice Convenience function to assign bounties/bonds for multiple questions in one go, then withdraw all your funds.
    /// Caller must provide the answer history for each question, in reverse order
    /// @dev Can be called by anyone to assign bonds/bounties, but funds are only withdrawn for the user making the call.
    /// @param questionIds The IDs of the questions you want to claim for
    /// @param lengths The number of history entries you will supply for each question ID
    /// @param histHashes In a single list for all supplied questions, the hash of each history entry.
    /// @param addrs In a single list for all supplied questions, the address of each answerer
    /// @param bonds In a single list for all supplied questions, the bond supplied with each answer
    /// @param answers In a single list for all supplied questions, each answer supplied
    function claimMultipleAndWithdrawBalance(
        bytes32[] calldata questionIds,
        uint256[] calldata lengths,
        bytes32[] calldata histHashes,
        address[] calldata addrs,
        uint256[] calldata bonds,
        bytes32[] calldata answers
    ) external;
    /// @notice Assigns the winnings (bounty and bonds) to everyone who gave the accepted answer
    /// Caller must provide the answer history, in reverse order
    /// @dev Works up the chain and assign bonds to the person who gave the right answer
    /// If someone gave the winning answer earlier, they must get paid from the higher bond
    /// That means we can't pay out the bond added at n until we have looked at n-1
    /// The first answer is authenticated by checking against the stored historyHash.
    /// One of the inputs to historyHash is the historyHash before it, so we use that to authenticate the next entry, etc
    /// Once we get to a null hash we'll know we're done and there are no more answers.
    /// Usually you would call the whole thing in a single transaction, but if not then the data is persisted to pick up later.
    /// @param questionId The ID of the question
    /// @param historyHashes Second-last-to-first, the hash of each history entry. (Final one should be empty).
    /// @param addrs Last-to-first, the address of each answerer
    /// @param bonds Last-to-first, the bond supplied with each answer
    /// @param answers Last-to-first, each answer supplied
    function claimWinnings(bytes32 questionId, bytes32[] calldata historyHashes, address[] calldata addrs, uint256[] calldata bonds, bytes32[] calldata answers) external;
    /// @notice Create a reusable template, which should be a JSON document.
    /// Placeholders should use gettext() syntax, eg %s.
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param content The template content
    /// @return The ID of the newly-created template, which is created sequentially.
    function createTemplate(string calldata content) external returns (uint256);
    /// @notice Create a new reusable template and use it to ask a question
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param content The template content
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @return The ID of the newly-created template, which is created sequentially.
    function createTemplateAndAskQuestion(string calldata content, string calldata question, address arbitrator, uint32 timeout, uint32 openingTs, uint256 nonce) external returns (bytes32);
    /// @notice Add funds to the bounty for a question
    /// @dev Add bounty funds after the initial question creation. Can be done any time until the question is finalized.
    /// @param questionId The ID of the question you wish to fund
    /// @param tokens The number of tokens to fund
    function fundAnswerBountyERC20(bytes32 questionId, uint256 tokens) external;
    /// @notice Notify the contract that the arbitrator has been paid for a question, freezing it pending their decision.
    /// @dev The arbitrator contract is trusted to only call this if they've been paid, and tell us who paid them.
    /// @param questionId The ID of the question
    /// @param requester The account that requested arbitration
    /// @param maxPrevious If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    function notifyOfArbitrationRequest(bytes32 questionId, address requester, uint256 maxPrevious) external;
    /// @notice Asks a new question reopening a previously-asked question that was settled too soon
    /// @dev A special version of askQuestion() that replaces a previous question that was settled too soon
    /// @param templateId The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param openingTs If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @param minBond The minimum bond that can be used to provide the first answer.
    /// @param reopensQuestionId The ID of the question this reopens
    /// @param tokens The number of tokens you want to use as an additional question reward for the reopened question.
    /// @return The ID of the newly-created question, created deterministically.
    function reopenQuestionERC20(
        uint256 templateId,
        string calldata question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond,
        bytes32 reopensQuestionId,
        uint256 tokens
    ) external returns (bytes32);
    /// @notice Function for arbitrator to set an optional per-question fee.
    /// @dev The per-question fee, charged when a question is asked, is intended as an anti-spam measure.
    /// @param fee The fee to be charged by the arbitrator when a question is asked
    function setQuestionFee(uint256 fee) external;
    /// @notice Set the address of the ERC20 token that will be used for bonds.
    /// @dev Should not be used with ERC20-like token contracts that implement callbacks like ERC777 that could cause re-entrancy issues
    /// @param _token The ERC20 token that will be used for bonds.
    function setToken(IERC20 _token) external;
    /// @notice Submit the answer for a question, for use by the arbitrator.
    /// @dev Doesn't require (or allow) a bond.
    /// If the current final answer is correct, the account should be whoever submitted it.
    /// If the current final answer is wrong, the account should be whoever paid for arbitration.
    /// However, the answerer stipulations are not enforced by the contract.
    /// @param questionId The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param answerer The account credited with this answer for the purpose of bond claims
    function submitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address answerer) external;
    /// @notice Submit an answer for a question.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// @param questionId The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param maxPrevious If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param tokens The amount of tokens to submit
    function submitAnswerERC20(bytes32 questionId, bytes32 answer, uint256 maxPrevious, uint256 tokens) external;
    /// @notice Submit an answer for a question, crediting it to the specified account.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// @param questionId The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param maxPrevious If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param answerer The account to which the answer should be credited
    /// @param tokens Number of tokens sent
    function submitAnswerForERC20(bytes32 questionId, bytes32 answer, uint256 maxPrevious, address answerer, uint256 tokens) external;
    function arbitratorQuestionFees(address) external view returns (uint256);
    /// @notice Returns the arbitrator address for the question
    /// @param questionId The ID of the question
    function getArbitrator(bytes32 questionId) external view returns (address);
    /// @notice Returns the current best answer
    /// @param questionId The ID of the question
    function getBestAnswer(bytes32 questionId) external view returns (bytes32);
    /// @notice Returns the highest bond posted so far for a question
    /// @param questionId The ID of the question
    function getBond(bytes32 questionId) external view returns (uint256);
    /// @notice Returns the current total unclaimed bounty
    /// @dev Set back to zero once the bounty has been claimed
    /// @param questionId The ID of the question
    function getBounty(bytes32 questionId) external view returns (uint256);
    /// @notice Returns the questions's content hash, identifying the question content
    /// @param questionId The ID of the question
    function getContentHash(bytes32 questionId) external view returns (bytes32);
    /// @notice (Deprecated) Return the final answer to the specified question, or revert if there isn't one
    /// @param questionId The ID of the question
    /// @return The answer formatted as a bytes32
    function getFinalAnswer(bytes32 questionId) external view returns (bytes32);
    /// @notice Return the final answer to the specified question, provided it matches the specified criteria.
    /// @dev Reverts if the question is not finalized, or if it does not match the specified criteria.
    /// @param questionId The ID of the question
    /// @param contentHash The hash of the question content (template ID + opening time + question parameter string)
    /// @param arbitrator The arbitrator chosen for the question (regardless of whether they are asked to arbitrate)
    /// @param minTimeout The timeout set in the initial question settings must be this high or higher
    /// @param minBond The bond sent with the final answer must be this high or higher
    /// @return The answer formatted as a bytes32
    function getFinalAnswerIfMatches(bytes32 questionId, bytes32 contentHash, address arbitrator, uint32 minTimeout, uint256 minBond) external view returns (bytes32);
    /// @notice Returns the timestamp at which the question will be/was finalized
    /// @param questionId The ID of the question
    function getFinalizeTS(bytes32 questionId) external view returns (uint32);
    /// @notice Returns the history hash of the question
    /// @param questionId The ID of the question
    /// @dev Updated on each answer, then rewound as each is claimed
    function getHistoryHash(bytes32 questionId) external view returns (bytes32);
    /// @notice Returns the minimum bond that can answer the question
    /// @param questionId The ID of the question
    function getMinBond(bytes32 questionId) external view returns (uint256);
    /// @notice Returns the timestamp when the question can first be answered
    /// @param questionId The ID of the question
    function getOpeningTS(bytes32 questionId) external view returns (uint32);
    /// @notice Returns the timeout in seconds used after each answer
    /// @param questionId The ID of the question
    function getTimeout(bytes32 questionId) external view returns (uint32);
    /// @notice Report whether the answer to the specified question is finalized
    /// @param questionId The ID of the question
    /// @return Return true if finalized
    function isFinalized(bytes32 questionId) external view returns (bool);
    /// @notice Returns whether the question is pending arbitration
    /// @param questionId The ID of the question
    function isPendingArbitration(bytes32 questionId) external view returns (bool);
    /// @notice Returns whether the question was answered before it had an answer, ie resolved to UNRESOLVED_ANSWER
    /// @param questionId The ID of the question
    function isSettledTooSoon(bytes32 questionId) external view returns (bool);
    function questionClaims(bytes32) external view returns (address payee, uint256 lastBond, uint256 queuedFunds);
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
    function reopenedQuestions(bytes32) external view returns (bytes32);
    function reopenerQuestions(bytes32) external view returns (bool);
    /// @notice Return the final answer to the specified question, or revert if there isn't one
    /// @param questionId The ID of the question
    /// @return The answer formatted as a bytes32
    function resultFor(bytes32 questionId) external view returns (bytes32);
    /// @notice Like resultFor(), but errors out if settled too soon, or returns the result of a replacement if it was reopened at the right time and settled
    /// @param questionId The ID of the question
    function resultForOnceSettled(bytes32 questionId) external view returns (bytes32);
    function templateHashes(uint256) external view returns (bytes32);
    function templates(uint256) external view returns (uint256);
}
