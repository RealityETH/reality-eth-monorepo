// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import {IERC20} from "./IERC20.sol";
import {IRealityETHCore_ERC20} from "./IRealityETHCore_ERC20.sol";

import {RealityETHCore_Common} from "./RealityETHCore_Common.sol";

// solhint-disable-next-line contract-name-camelcase
contract RealityETH_ERC20_v4_0 is RealityETHCore_Common, IRealityETHCore_ERC20 {
    IERC20 public token;

    /// @notice Set the address of the ERC20 token that will be used for bonds.
    /// @dev Should not be used with ERC20-like token contracts that implement callbacks like ERC777 that could cause re-entrancy issues
    /// @param _token The ERC20 token that will be used for bonds.
    function setToken(IERC20 _token) public {
        if (token != IERC20(address(0x0))) revert TokenCanOnlyBeInitializedOnce();
        token = _token;
    }

    /// @notice Ask a new question without a bounty and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @dev Calling without the token param will only work if there is no arbitrator-set question fee.
    /// @dev This has the same function signature as askQuestion() in the non-ERC20 version, which is optionally payable.
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
        _askQuestion(question_id, content_hash, arbitrator, timeout, opening_ts, 0, 0);

        return question_id;
    }

    /// @notice Ask a new question with a bounty and return the ID
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param template_id The ID number of the template the question will use
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param opening_ts If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @param tokens The combined initial question bounty and question fee
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestionERC20(
        uint256 template_id,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce,
        uint256 tokens
    )
        public
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        _deductTokensOrRevert(tokens);

        if (templates[template_id] == 0) revert TemplateMustExist();

        bytes32 content_hash = keccak256(abi.encodePacked(template_id, opening_ts, question));
        bytes32 question_id = keccak256(abi.encodePacked(content_hash, arbitrator, timeout, uint256(0), address(this), msg.sender, nonce));

        // We emit this event here because _askQuestion doesn't need to know the unhashed question. Other events are emitted by _askQuestion.
        emit LogNewQuestion(question_id, msg.sender, template_id, question, content_hash, arbitrator, timeout, opening_ts, nonce, block.timestamp);
        _askQuestion(question_id, content_hash, arbitrator, timeout, opening_ts, 0, tokens);

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
    /// @param tokens Number of tokens sent
    /// @return The ID of the newly-created question, created deterministically.
    function askQuestionWithMinBondERC20(
        uint256 template_id,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce,
        uint256 min_bond,
        uint256 tokens
    )
        public
        returns (
            // stateNotCreated is enforced by the internal _askQuestion
            bytes32
        )
    {
        _deductTokensOrRevert(tokens);

        if (templates[template_id] == 0) revert TemplateMustExist();

        bytes32 content_hash = keccak256(abi.encodePacked(template_id, opening_ts, question));
        bytes32 question_id = keccak256(abi.encodePacked(content_hash, arbitrator, timeout, min_bond, address(this), msg.sender, nonce));

        // We emit this event here because _askQuestion doesn't need to know the unhashed question.
        // Other events are emitted by _askQuestion.
        emit LogNewQuestion(question_id, msg.sender, template_id, question, content_hash, arbitrator, timeout, opening_ts, nonce, block.timestamp);
        _askQuestion(question_id, content_hash, arbitrator, timeout, opening_ts, min_bond, tokens);

        return question_id;
    }

    function _deductTokensOrRevert(uint256 tokens) internal {
        if (tokens == 0) {
            return;
        }

        uint256 bal = balanceOf[msg.sender];

        // Deduct any tokens you have in your internal balance first
        if (bal > 0) {
            if (bal >= tokens) {
                balanceOf[msg.sender] = bal - tokens;
                return;
            } else {
                tokens = tokens - bal;
                balanceOf[msg.sender] = 0;
            }
        }
        // Now we need to charge the rest from
        if (!token.transferFrom(msg.sender, address(this), tokens)) revert TransferOfTokensFailedInsufficientApprovedBalance();
        return;
    }

    /// @notice Add funds to the bounty for a question
    /// @dev Add bounty funds after the initial question creation. Can be done any time until the question is finalized.
    /// @param question_id The ID of the question you wish to fund
    /// @param tokens The number of tokens to fund
    function fundAnswerBountyERC20(bytes32 question_id, uint256 tokens) external stateOpen(question_id) notFrozen {
        _deductTokensOrRevert(tokens);
        questions[question_id].bounty = questions[question_id].bounty + tokens;
        emit LogFundAnswerBounty(question_id, tokens, questions[question_id].bounty, msg.sender);
    }

    /// @notice Submit an answer for a question.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param tokens The amount of tokens to submit
    function submitAnswerERC20(
        bytes32 question_id,
        bytes32 answer,
        uint256 max_previous,
        uint256 tokens
    ) external stateOpen(question_id) bondMustDoubleAndMatchMinimum(question_id, tokens) previousBondMustNotBeatMaxPrevious(question_id, max_previous) notFrozen {
        _deductTokensOrRevert(tokens);
        _addAnswerToHistory(question_id, answer, msg.sender, tokens);
        _updateCurrentAnswer(question_id, answer);
    }

    /// @notice Submit an answer for a question, crediting it to the specified account.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param answerer The account to which the answer should be credited
    /// @param tokens Number of tokens sent
    function submitAnswerForERC20(
        bytes32 question_id,
        bytes32 answer,
        uint256 max_previous,
        address answerer,
        uint256 tokens
    ) external stateOpen(question_id) bondMustDoubleAndMatchMinimum(question_id, tokens) previousBondMustNotBeatMaxPrevious(question_id, max_previous) notFrozen {
        _deductTokensOrRevert(tokens);
        if (answerer == address(0)) revert AnswererMustBeNonZero();
        _addAnswerToHistory(question_id, answer, answerer, tokens);
        _updateCurrentAnswer(question_id, answer);
    }

    function withdraw() public override notFrozen {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        require(token.transfer(msg.sender, bal));
        emit LogWithdraw(msg.sender, bal);
    }
}
