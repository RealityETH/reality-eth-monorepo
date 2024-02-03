// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import {IRealityETHReopenable} from "./IRealityETHReopenable.sol";
import {RealityETH_v4_0} from "./RealityETH-4.0.sol";

/*
* This version of reality.eth provides the ability to answer a question as "answered too soon", allowing it to be reopened.
* This is useful when you want to ask a question but you don't know when the answer will be available.
* You can set the settlement time at the earliest date it may be available, then if someone answers it too soon, it can be answered at such then later reopened.
* NB In v3 of reality.eth this feature was built in and there was no way to turn it off. 
* From v4, we ship two versions: RealityETH without it, and RealityETHReopenable with it.
*/

// solhint-disable-next-line contract-name-camelcase
contract RealityETHReopenable_v4_0 is IRealityETHReopenable, RealityETH_v4_0 {
    // Special value representing a question that was answered too soon.
    // bytes32(-2). By convention we use bytes32(-1) for "invalid", although the contract does not handle this.
    bytes32 private constant UNRESOLVED_ANSWER = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe;

    mapping(bytes32 => bytes32) public reopened_questions;
    mapping(bytes32 => bool) public reopener_questions;

    function _isBountyPayableOnAnswer(bytes32 answer) internal pure override returns (bool) {
        return (answer != UNRESOLVED_ANSWER);
    }

    /// @notice Returns whether the question was answered before it had an answer, ie resolved to UNRESOLVED_ANSWER
    /// @param question_id The ID of the question
    function isSettledTooSoon(bytes32 question_id) public view returns (bool) {
        return (resultFor(question_id) == UNRESOLVED_ANSWER);
    }

    /// @notice Like resultFor(), but errors out if settled too soon, or returns the result of a replacement if it was reopened at the right time and settled
    /// @param question_id The ID of the question
    function resultForOnceSettled(bytes32 question_id) external view returns (bytes32) {
        bytes32 result = resultFor(question_id);
        if (result == UNRESOLVED_ANSWER) {
            // Try the replacement
            bytes32 replacement_id = reopened_questions[question_id];
            if (replacement_id == bytes32(0x0)) revert QuestionWasSettledTooSoonAndHasNotBeenReopened();
            // We only try one layer down rather than recursing to keep the gas costs predictable
            result = resultFor(replacement_id);
            if (result == UNRESOLVED_ANSWER) revert QuestionReplacementWasSettledTooSoonAndHasNotBeenReopened();
        }
        return result;
    }

    /// @notice Asks a new question reopening a previously-asked question that was settled too soon
    /// @dev A special version of askQuestion() that replaces a previous question that was settled too soon
    /// @param template_id The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param opening_ts If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @param min_bond The minimum bond that can be used to provide the first answer.
    /// @param reopens_question_id The ID of the question this reopens
    /// @return The ID of the newly-created question, created deterministically.
    function reopenQuestion(
        uint256 template_id,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce,
        uint256 min_bond,
        bytes32 reopens_question_id
    )
        public
        payable
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        if (!isSettledTooSoon(reopens_question_id)) revert YouCanOnlyReopenQuestionsThatResolvedAsSettledTooSoon();

        bytes32 content_hash = keccak256(abi.encodePacked(template_id, opening_ts, question));

        // A reopening must exactly match the original question, except for the nonce and the creator
        if (content_hash != questions[reopens_question_id].content_hash) revert ContentHashMismatch();
        if (arbitrator != questions[reopens_question_id].arbitrator) revert ArbitratorMismatch();
        if (timeout != questions[reopens_question_id].timeout) revert TimeoutMismatch();
        if (opening_ts != questions[reopens_question_id].opening_ts) revert Opening_TsMismatch();
        if (min_bond != questions[reopens_question_id].min_bond) revert Min_BondMismatch();

        // If the the question was itself reopening some previous question, you'll have to re-reopen the previous question first.
        // This ensures the bounty can be passed on to the next attempt of the original question.
        if (reopener_questions[reopens_question_id]) revert QuestionIsAlreadyReopeningAPreviousQuestion();

        // A question can only be reopened once, unless the reopening was also settled too soon in which case it can be replaced
        bytes32 existing_reopen_question_id = reopened_questions[reopens_question_id];

        // Normally when we reopen a question we will take its bounty and pass it on to the reopened version.
        bytes32 take_bounty_from_question_id = reopens_question_id;
        // If the question has already been reopened but was again settled too soon, we can transfer its bounty to the next attempt.
        if (existing_reopen_question_id != bytes32(0)) {
            if (!isSettledTooSoon(existing_reopen_question_id)) revert QuestionHasAlreadyBeenReopened();
            // We'll overwrite the reopening with our new question and move the bounty.
            // Once that's done we'll detach the failed reopener and you'll be able to reopen that too if you really want, but without the bounty.
            reopener_questions[existing_reopen_question_id] = false;
            take_bounty_from_question_id = existing_reopen_question_id;
        }

        bytes32 question_id = askQuestionWithMinBond(template_id, question, arbitrator, timeout, opening_ts, nonce, min_bond);

        reopened_questions[reopens_question_id] = question_id;
        reopener_questions[question_id] = true;

        questions[question_id].bounty = questions[take_bounty_from_question_id].bounty + questions[question_id].bounty;
        questions[take_bounty_from_question_id].bounty = 0;

        emit LogReopenQuestion(question_id, reopens_question_id);

        return question_id;
    }
}
