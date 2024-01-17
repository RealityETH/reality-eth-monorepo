// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import './BalanceHolder_ERC20.sol';
import './IRealityETH_ERC20.sol';
import './RealityETH_common-3.0.sol';

contract RealityETH_ERC20_v3_0 is RealityETH_common_v3_0, BalanceHolder_ERC20 {

    /// @notice Set the address of the ERC20 token that will be used for bonds.
    /// @dev Should not be used with ERC20-like token contracts that implement callbacks like ERC777 that could cause re-entrancy issues
    /// @param _token The ERC20 token that will be used for bonds.
    function setToken(IERC20 _token) 
    public
    {
        require(token == IERC20(address(0x0)), "Token can only be initialized once");
        token = _token;
    }

    /// @notice Create a new reusable template and use it to ask a question
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param content The template content
    /// @param question A string containing the parameters that will be passed into the template to make the question
    /// @param arbitrator The arbitration contract that will have the final word on the answer if there is a dispute
    /// @param timeout How long the contract should wait after the answer is changed before finalizing on that answer
    /// @param opening_ts If set, the earliest time it should be possible to answer the question.
    /// @param nonce A user-specified nonce used in the question ID. Change it to repeat a question.
    /// @return The ID of the newly-created template, which is created sequentially.
    function createTemplateAndAskQuestion(
        string memory content, 
        string memory question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce 
    ) 
        // stateNotCreated is enforced by the internal _askQuestion
    public returns (bytes32) {
        uint256 template_id = createTemplate(content);
        return askQuestion(template_id, question, arbitrator, timeout, opening_ts, nonce);
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
    function askQuestion(uint256 template_id, string memory question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) 
        // stateNotCreated is enforced by the internal _askQuestion
    public returns (bytes32) {

        require(templates[template_id] > 0, "template must exist");

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
    function askQuestionERC20(uint256 template_id, string memory question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 tokens) 
        // stateNotCreated is enforced by the internal _askQuestion
    public returns (bytes32) {

        _deductTokensOrRevert(tokens);

        require(templates[template_id] > 0, "template must exist");

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
    function askQuestionWithMinBondERC20(uint256 template_id, string memory question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond, uint256 tokens) 
        // stateNotCreated is enforced by the internal _askQuestion
    public returns (bytes32) {

        _deductTokensOrRevert(tokens);

        require(templates[template_id] > 0, "template must exist");

        bytes32 content_hash = keccak256(abi.encodePacked(template_id, opening_ts, question));
        bytes32 question_id = keccak256(abi.encodePacked(content_hash, arbitrator, timeout, min_bond, address(this), msg.sender, nonce));

        // We emit this event here because _askQuestion doesn't need to know the unhashed question.
        // Other events are emitted by _askQuestion.
        emit LogNewQuestion(question_id, msg.sender, template_id, question, content_hash, arbitrator, timeout, opening_ts, nonce, block.timestamp);
        _askQuestion(question_id, content_hash, arbitrator, timeout, opening_ts, min_bond, tokens);

        return question_id;
    }

    function _deductTokensOrRevert(uint256 tokens) 
    internal {
 
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
        require(token.transferFrom(msg.sender, address(this), tokens), "Transfer of tokens failed, insufficient approved balance?");
        return;

    }

    /// @notice Add funds to the bounty for a question
    /// @dev Add bounty funds after the initial question creation. Can be done any time until the question is finalized.
    /// @param question_id The ID of the question you wish to fund
    /// @param tokens The number of tokens to fund
    function fundAnswerBountyERC20(bytes32 question_id, uint256 tokens) 
        stateOpen(question_id)
    external {
        _deductTokensOrRevert(tokens);
        questions[question_id].bounty = questions[question_id].bounty + tokens;
        emit LogFundAnswerBounty(question_id, tokens, questions[question_id].bounty, msg.sender);
    }

    /// @notice Submit an answer for a question.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// May be subject to front-running attacks; Substitute submitAnswerCommitment()->submitAnswerReveal() to prevent them.
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param tokens The amount of tokens to submit
    function submitAnswerERC20(bytes32 question_id, bytes32 answer, uint256 max_previous, uint256 tokens) 
        stateOpen(question_id)
        bondMustDoubleAndMatchMinimum(question_id, tokens)
        previousBondMustNotBeatMaxPrevious(question_id, max_previous)
    external {
        _deductTokensOrRevert(tokens);
        _addAnswerToHistory(question_id, answer, msg.sender, tokens, false);
        _updateCurrentAnswer(question_id, answer);
    }

    /// @notice Submit an answer for a question, crediting it to the specified account.
    /// @dev Adds the answer to the history and updates the current "best" answer.
    /// May be subject to front-running attacks; Substitute submitAnswerCommitment()->submitAnswerReveal() to prevent them.
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param answerer The account to which the answer should be credited
    /// @param tokens Number of tokens sent
    function submitAnswerForERC20(bytes32 question_id, bytes32 answer, uint256 max_previous, address answerer, uint256 tokens)
        stateOpen(question_id)
        bondMustDoubleAndMatchMinimum(question_id, tokens)
        previousBondMustNotBeatMaxPrevious(question_id, max_previous)
    external {
        _deductTokensOrRevert(tokens);
        require(answerer != NULL_ADDRESS, "answerer must be non-zero");
        _addAnswerToHistory(question_id, answer, answerer, tokens, false);
        _updateCurrentAnswer(question_id, answer);
    }

    /// @notice Submit the hash of an answer, laying your claim to that answer if you reveal it in a subsequent transaction.
    /// @dev Creates a hash, commitment_id, uniquely identifying this answer, to this question, with this bond.
    /// The commitment_id is stored in the answer history where the answer would normally go.
    /// Does not update the current best answer - this is left to the later submitAnswerReveal() transaction.
    /// @param question_id The ID of the question
    /// @param answer_hash The hash of your answer, plus a nonce that you will later reveal
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    /// @param _answerer If specified, the address to be given as the question answerer. Defaults to the sender.
    /// @param tokens Number of tokens sent
    /// @dev Specifying the answerer is useful if you want to delegate the commit-and-reveal to a third-party.
    function submitAnswerCommitmentERC20(bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer, uint256 tokens) 
        stateOpen(question_id)
        bondMustDoubleAndMatchMinimum(question_id, tokens)
        previousBondMustNotBeatMaxPrevious(question_id, max_previous)
    external {

        _deductTokensOrRevert(tokens);

        bytes32 commitment_id = keccak256(abi.encodePacked(question_id, answer_hash, tokens));
        address answerer = (_answerer == NULL_ADDRESS) ? msg.sender : _answerer;

        _storeCommitment(question_id, commitment_id);
        _addAnswerToHistory(question_id, commitment_id, answerer, tokens, true);

    }

    /// @notice Submit the answer whose hash you sent in a previous submitAnswerCommitment() transaction
    /// @dev Checks the parameters supplied recreate an existing commitment, and stores the revealed answer
    /// Updates the current answer unless someone has since supplied a new answer with a higher bond
    /// msg.sender is intentionally not restricted to the user who originally sent the commitment; 
    /// For example, the user may want to provide the answer+nonce to a third-party service and let them send the tx
    /// NB If we are pending arbitration, it will be up to the arbitrator to wait and see any outstanding reveal is sent
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded as bytes32
    /// @param nonce The nonce that, combined with the answer, recreates the answer_hash you gave in submitAnswerCommitment()
    /// @param bond The bond that you paid in your submitAnswerCommitment() transaction
    function submitAnswerReveal(bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond) 
        stateOpenOrPendingArbitration(question_id)
    external {

        bytes32 answer_hash = keccak256(abi.encodePacked(answer, nonce));
        bytes32 commitment_id = keccak256(abi.encodePacked(question_id, answer_hash, bond));

        require(!commitments[commitment_id].is_revealed, "commitment must not have been revealed yet");
        require(commitments[commitment_id].reveal_ts > uint32(block.timestamp), "reveal deadline must not have passed");

        commitments[commitment_id].revealed_answer = answer;
        commitments[commitment_id].is_revealed = true;

        if (bond == questions[question_id].bond) {
            _updateCurrentAnswer(question_id, answer);
        }

        emit LogAnswerReveal(question_id, msg.sender, answer_hash, answer, nonce, bond);

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
    /// @param tokens The number of tokens you want to use as an additional question reward for the reopened question.
    /// @return The ID of the newly-created question, created deterministically.
    function reopenQuestionERC20(uint256 template_id, string memory question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond, bytes32 reopens_question_id, uint256 tokens)
        // stateNotCreated is enforced by the internal _askQuestion
    public returns (bytes32) {

        // _deductTokensOrRevert will be called when we call askQuestionWithMinBondERC20

        require(isSettledTooSoon(reopens_question_id), "You can only reopen questions that resolved as settled too soon");

        bytes32 content_hash = keccak256(abi.encodePacked(template_id, opening_ts, question));

        // A reopening must exactly match the original question, except for the nonce and the creator
        require(content_hash == questions[reopens_question_id].content_hash, "content hash mismatch");
        require(arbitrator == questions[reopens_question_id].arbitrator, "arbitrator mismatch");
        require(timeout == questions[reopens_question_id].timeout, "timeout mismatch");
        require(opening_ts == questions[reopens_question_id].opening_ts , "opening_ts mismatch");
        require(min_bond == questions[reopens_question_id].min_bond, "min_bond mismatch");

        // If the the question was itself reopening some previous question, you'll have to re-reopen the previous question first.
        // This ensures the bounty can be passed on to the next attempt of the original question.
        require(!reopener_questions[reopens_question_id], "Question is already reopening a previous question");

        // A question can only be reopened once, unless the reopening was also settled too soon in which case it can be replaced
        bytes32 existing_reopen_question_id = reopened_questions[reopens_question_id];

        // Normally when we reopen a question we will take its bounty and pass it on to the reopened version.
        bytes32 take_bounty_from_question_id = reopens_question_id;
        // If the question has already been reopened but was again settled too soon, we can transfer its bounty to the next attempt.
        if (existing_reopen_question_id != bytes32(0)) {
            require(isSettledTooSoon(existing_reopen_question_id), "Question has already been reopened");
            // We'll overwrite the reopening with our new question and move the bounty.
            // Once that's done we'll detach the failed reopener and you'll be able to reopen that too if you really want, but without the bounty.
            reopener_questions[existing_reopen_question_id] = false;
            take_bounty_from_question_id = existing_reopen_question_id;
        }

        bytes32 question_id = askQuestionWithMinBondERC20(template_id, question, arbitrator, timeout, opening_ts, nonce, min_bond, tokens);

        reopened_questions[reopens_question_id] = question_id;
        reopener_questions[question_id] = true;

        questions[question_id].bounty = questions[take_bounty_from_question_id].bounty + questions[question_id].bounty;
        questions[take_bounty_from_question_id].bounty = 0;

        emit LogReopenQuestion(question_id, reopens_question_id);

        return question_id;
    }

    /// @notice Assigns the winnings (bounty and bonds) to everyone who gave the accepted answer
    /// Caller must provide the answer history, in reverse order
    /// @dev Works up the chain and assign bonds to the person who gave the right answer
    /// If someone gave the winning answer earlier, they must get paid from the higher bond
    /// That means we can't pay out the bond added at n until we have looked at n-1
    /// The first answer is authenticated by checking against the stored history_hash.
    /// One of the inputs to history_hash is the history_hash before it, so we use that to authenticate the next entry, etc
    /// Once we get to a null hash we'll know we're done and there are no more answers.
    /// Usually you would call the whole thing in a single transaction, but if not then the data is persisted to pick up later.
    /// @param question_id The ID of the question
    /// @param history_hashes Second-last-to-first, the hash of each history entry. (Final one should be empty).
    /// @param addrs Last-to-first, the address of each answerer or commitment sender
    /// @param bonds Last-to-first, the bond supplied with each answer or commitment
    /// @param answers Last-to-first, each answer supplied, or commitment ID if the answer was supplied with commit->reveal
    function claimWinnings(
        bytes32 question_id, 
        bytes32[] memory history_hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers
    ) 
        stateFinalized(question_id)
    public {

        require(history_hashes.length > 0, "at least one history hash entry must be provided");

        // These are only set if we split our claim over multiple transactions.
        address payee = question_claims[question_id].payee; 
        uint256 last_bond = question_claims[question_id].last_bond; 
        uint256 queued_funds = question_claims[question_id].queued_funds; 

        // Starts as the hash of the final answer submitted. It'll be cleared when we're done.
        // If we're splitting the claim over multiple transactions, it'll be the hash where we left off last time
        bytes32 last_history_hash = questions[question_id].history_hash;

        bytes32 best_answer = questions[question_id].best_answer;

        uint256 i;
        for (i = 0; i < history_hashes.length; i++) {
        
            // Check input against the history hash, and see which of 2 possible values of is_commitment fits.
            bool is_commitment = _verifyHistoryInputOrRevert(last_history_hash, history_hashes[i], answers[i], bonds[i], addrs[i]);
            
            queued_funds = queued_funds + last_bond; 
            (queued_funds, payee) = _processHistoryItem(
                question_id, best_answer, queued_funds, payee, 
                addrs[i], bonds[i], answers[i], is_commitment);
 
            // Line the bond up for next time, when it will be added to somebody's queued_funds
            last_bond = bonds[i];

            // Burn (just leave in contract balance) a fraction of all bonds except the final one.
            // This creates a cost to increasing your own bond, which could be used to delay resolution maliciously
            if (last_bond != questions[question_id].bond) {
                last_bond = last_bond - last_bond / BOND_CLAIM_FEE_PROPORTION;
            }

            last_history_hash = history_hashes[i];

        }
 
        if (last_history_hash != NULL_HASH) {
            // We haven't yet got to the null hash (1st answer), ie the caller didn't supply the full answer chain.
            // Persist the details so we can pick up later where we left off later.

            // If we know who to pay we can go ahead and pay them out, only keeping back last_bond
            // (We always know who to pay unless all we saw were unrevealed commits)
            if (payee != NULL_ADDRESS) {
                _payPayee(question_id, payee, queued_funds);
                queued_funds = 0;
            }

            question_claims[question_id].payee = payee;
            question_claims[question_id].last_bond = last_bond;
            question_claims[question_id].queued_funds = queued_funds;
        } else {
            // There is nothing left below us so the payee can keep what remains
            _payPayee(question_id, payee, queued_funds + last_bond);
            delete question_claims[question_id];
        }

        questions[question_id].history_hash = last_history_hash;

    }

    function _payPayee(bytes32 question_id, address payee, uint256 value) 
    internal {
        balanceOf[payee] = balanceOf[payee] + value;
        emit LogClaim(question_id, payee, value);
    }

    function _processHistoryItem(
        bytes32 question_id, bytes32 best_answer, 
        uint256 queued_funds, address payee, 
        address addr, uint256 bond, bytes32 answer, bool is_commitment
    )
    internal returns (uint256, address) {

        // For commit-and-reveal, the answer history holds the commitment ID instead of the answer.
        // We look at the referenced commitment ID and switch in the actual answer.
        if (is_commitment) {
            bytes32 commitment_id = answer;
            // If it's a commit but it hasn't been revealed, it will always be considered wrong.
            if (!commitments[commitment_id].is_revealed) {
                delete commitments[commitment_id];
                return (queued_funds, payee);
            } else {
                answer = commitments[commitment_id].revealed_answer;
                delete commitments[commitment_id];
            }
        }

        if (answer == best_answer) {

            if (payee == NULL_ADDRESS) {

                // The entry is for the first payee we come to, ie the winner.
                // They get the question bounty.
                payee = addr;

                if (best_answer != UNRESOLVED_ANSWER && questions[question_id].bounty > 0) {
                    _payPayee(question_id, payee, questions[question_id].bounty);
                    questions[question_id].bounty = 0;
                }

            } else if (addr != payee) {

                // Answerer has changed, ie we found someone lower down who needs to be paid

                // The lower answerer will take over receiving bonds from higher answerer.
                // They should also be paid the takeover fee, which is set at a rate equivalent to their bond. 
                // (This is our arbitrary rule, to give consistent right-answerers a defence against high-rollers.)

                // There should be enough for the fee, but if not, take what we have.
                // There's an edge case involving weird arbitrator behaviour where we may be short.
                uint256 answer_takeover_fee = (queued_funds >= bond) ? bond : queued_funds;
                // Settle up with the old (higher-bonded) payee
                _payPayee(question_id, payee, queued_funds - answer_takeover_fee);

                // Now start queued_funds again for the new (lower-bonded) payee
                payee = addr;
                queued_funds = answer_takeover_fee;

            }

        }

        return (queued_funds, payee);

    }

    /// @notice Convenience function to assign bounties/bonds for multiple questions in one go, then withdraw all your funds.
    /// Caller must provide the answer history for each question, in reverse order
    /// @dev Can be called by anyone to assign bonds/bounties, but funds are only withdrawn for the user making the call.
    /// @param question_ids The IDs of the questions you want to claim for
    /// @param lengths The number of history entries you will supply for each question ID
    /// @param hist_hashes In a single list for all supplied questions, the hash of each history entry.
    /// @param addrs In a single list for all supplied questions, the address of each answerer or commitment sender
    /// @param bonds In a single list for all supplied questions, the bond supplied with each answer or commitment
    /// @param answers In a single list for all supplied questions, each answer supplied, or commitment ID 
    function claimMultipleAndWithdrawBalance(
        bytes32[] memory question_ids, uint256[] memory lengths, 
        bytes32[] memory hist_hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers
    ) 
        stateAny() // The finalization checks are done in the claimWinnings function
    public {
        
        uint256 qi;
        uint256 i;
        for (qi = 0; qi < question_ids.length; qi++) {
            bytes32 qid = question_ids[qi];
            uint256 ln = lengths[qi];
            bytes32[] memory hh = new bytes32[](ln);
            address[] memory ad = new address[](ln);
            uint256[] memory bo = new uint256[](ln);
            bytes32[] memory an = new bytes32[](ln);
            uint256 j;
            for (j = 0; j < ln; j++) {
                hh[j] = hist_hashes[i];
                ad[j] = addrs[i];
                bo[j] = bonds[i];
                an[j] = answers[i];
                i++;
            }
            claimWinnings(qid, hh, ad, bo, an);
        }
        withdraw();
    }

}
