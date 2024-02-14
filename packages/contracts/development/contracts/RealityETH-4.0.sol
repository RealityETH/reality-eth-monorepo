// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import {RealityETHCore_Common} from "./RealityETHCore_Common.sol";
import {IRealityETHCore_Native} from "./IRealityETHCore_Native.sol";

// solhint-disable-next-line contract-name-camelcase
contract RealityETH_v4_0 is RealityETHCore_Common, IRealityETHCore_Native {
    /// @notice Ask a new question and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param template_id The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param opening_ts If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestion(
        uint256 template_id,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce
    )
        public
        payable
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        if (templates[template_id] == 0) revert TemplateMustExist();

        bytes32 content_hash = keccak256(abi.encodePacked(template_id, opening_ts, question));
        bytes32 question_id = keccak256(abi.encodePacked(content_hash, arbitrator, timeout, uint256(0), address(this), msg.sender, nonce));

        // We emit this event here because _askQuestion doesn't need to know the unhashed question. Other events are emitted by _askQuestion.
        emit LogNewQuestion(question_id, msg.sender, template_id, question, content_hash, arbitrator, timeout, opening_ts, nonce, block.timestamp);
        _askQuestion(question_id, content_hash, arbitrator, timeout, opening_ts, 0, msg.value);

        return question_id;
    }

    /// @notice Ask a new question and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param template_id The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param opening_ts If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @param min_bond The minimum bond that may be used for an answer.
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestionWithMinBond(
        uint256 template_id,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce,
        uint256 min_bond
    )
        public
        payable
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        if (templates[template_id] == 0) revert TemplateMustExist();

        bytes32 content_hash = keccak256(abi.encodePacked(template_id, opening_ts, question));
        bytes32 question_id = keccak256(abi.encodePacked(content_hash, arbitrator, timeout, min_bond, address(this), msg.sender, nonce));

        // We emit this event here because _askQuestion doesn't need to know the unhashed question.
        // Other events are emitted by _askQuestion.
        emit LogNewQuestion(question_id, msg.sender, template_id, question, content_hash, arbitrator, timeout, opening_ts, nonce, block.timestamp);
        _askQuestion(question_id, content_hash, arbitrator, timeout, opening_ts, min_bond, msg.value);

        return question_id;
    }

    /// @notice Add funds to the bounty for a question
    /// @dev Add bounty funds after the initial question creation. Can be done any time until the question is finalized.
    /// @param question_id The ID of the question you wish to fund
    function fundAnswerBounty(bytes32 question_id) external payable stateOpen(question_id) notFrozen {
        questions[question_id].bounty = questions[question_id].bounty + msg.value;
        emit LogFundAnswerBounty(question_id, msg.value, questions[question_id].bounty, msg.sender);
    }

    /// @notice Submit an answer for a question.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    function submitAnswer(
        bytes32 question_id,
        bytes32 answer,
        uint256 max_previous
    ) external payable stateOpen(question_id) bondMustDoubleAndMatchMinimum(question_id, msg.value) previousBondMustNotBeatMaxPrevious(question_id, max_previous) notFrozen {
        _addAnswerToHistory(question_id, answer, msg.sender, msg.value);
        _updateCurrentAnswer(question_id, answer);
    }

    /// @notice Submit an answer for a question, crediting it to the specified account.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param answerer The account to which the answer should be credited
    function submitAnswerFor(
        bytes32 question_id,
        bytes32 answer,
        uint256 max_previous,
        address answerer
    ) external payable stateOpen(question_id) bondMustDoubleAndMatchMinimum(question_id, msg.value) previousBondMustNotBeatMaxPrevious(question_id, max_previous) notFrozen {
        if (answerer == address(0)) revert AnswererMustBeNonZero();
        _addAnswerToHistory(question_id, answer, answerer, msg.value);
        _updateCurrentAnswer(question_id, answer);
    }

    function withdraw() public override notFrozen {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        payable(msg.sender).transfer(bal);
        emit LogWithdraw(msg.sender, bal);
    }
}
