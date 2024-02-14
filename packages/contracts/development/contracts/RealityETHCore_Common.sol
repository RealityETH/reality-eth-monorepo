// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import {IRealityETHCore_Common} from "./IRealityETHCore_Common.sol";
import {IRealityETHHistoryVerification} from "./IRealityETHHistoryVerification.sol";

// solhint-disable-next-line contract-name-camelcase
abstract contract RealityETHCore_Common is IRealityETHCore_Common, IRealityETHHistoryVerification {
    // Proportion withheld when you claim an earlier bond.
    uint256 private constant BOND_CLAIM_FEE_PROPORTION = 40; // One 40th ie 2.5%

    uint256 private nextTemplateID = 0;
    mapping(uint256 => uint256) public templates;
    mapping(uint256 => bytes32) public template_hashes;
    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => Claim) public question_claims;
    mapping(address => uint256) public arbitrator_question_fees;

    mapping(address => uint256) public balanceOf;

    modifier onlyArbitrator(bytes32 question_id) {
        if (msg.sender != questions[question_id].arbitrator) revert MsgSenderMustBeArbitrator();
        _;
    }

    modifier stateAny() {
        _;
    }

    // noop modifer provided for the convenience of inheriter contracts that want to freeze us
    modifier notFrozen() virtual {
        _;
    }

    // noop modifer provided for the convenience of inheriter contracts that want to lock down question asking
    modifier onlyPermittedQuestioner() virtual {
        _;
    }

    modifier stateNotCreated(bytes32 question_id) {
        if (questions[question_id].timeout != 0) revert QuestionMustNotExist();
        _;
    }

    modifier stateOpen(bytes32 question_id) {
        if (questions[question_id].timeout == 0) revert QuestionMustExist();
        if (questions[question_id].is_pending_arbitration) revert QuestionMustNotBePendingArbitration();
        uint32 finalize_ts = questions[question_id].finalize_ts;
        if (finalize_ts != 0 && finalize_ts <= uint32(block.timestamp)) revert FinalizationDeadlineMustNotHavePassed();
        uint32 opening_ts = questions[question_id].opening_ts;
        if (opening_ts != 0 && opening_ts > uint32(block.timestamp)) revert OpeningDateMustHavePassed();
        _;
    }

    modifier statePendingArbitration(bytes32 question_id) {
        if (!questions[question_id].is_pending_arbitration) revert QuestionMustBePendingArbitration();
        _;
    }

    modifier stateOpenOrPendingArbitration(bytes32 question_id) {
        if (questions[question_id].timeout == 0) revert QuestionMustExist();
        uint32 finalize_ts = questions[question_id].finalize_ts;
        if (finalize_ts != 0 && finalize_ts <= uint32(block.timestamp)) revert FinalizationDealineMustNotHavePassed();
        uint32 opening_ts = questions[question_id].opening_ts;
        if (opening_ts != 0 && opening_ts > uint32(block.timestamp)) revert OpeningDateMustHavePassed();
        _;
    }

    modifier stateFinalized(bytes32 question_id) {
        if (!isFinalized(question_id)) revert QuestionMustBeFinalized();
        _;
    }

    modifier bondMustDoubleAndMatchMinimum(bytes32 question_id, uint256 tokens) {
        if (tokens == 0) revert BondMustBePositive();
        uint256 current_bond = questions[question_id].bond;
        if (current_bond == 0) {
            if (tokens < (questions[question_id].min_bond)) revert BondMustExceedTheMinimum();
        } else {
            if (tokens < (current_bond * 2)) revert BondMustBeDoubleAtLeastPreviousBond();
        }
        _;
    }

    modifier previousBondMustNotBeatMaxPrevious(bytes32 question_id, uint256 max_previous) {
        if (max_previous > 0) {
            if (questions[question_id].bond > max_previous) revert BondMustExceedMax_Previous();
        }
        _;
    }

    /* solhint-disable quotes */
    /// @notice Constructor, sets up some initial templates
    /// @dev Creates some generalized templates for different question types used in the DApp.
    constructor() {
        createTemplate('{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}');
        createTemplate('{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}');
    }
    /* solhint-enable quotes */

    /// @notice Function for arbitrator to set an optional per-question fee.
    /// @dev The per-question fee, charged when a question is asked, is intended as an anti-spam measure.
    /// @param fee The fee to be charged by the arbitrator when a question is asked
    function setQuestionFee(uint256 fee) external stateAny notFrozen {
        arbitrator_question_fees[msg.sender] = fee;
        emit LogSetQuestionFee(msg.sender, fee);
    }

    /// @notice Create a reusable template, which should be a JSON document.
    /// Placeholders should use gettext() syntax, eg %s.
    /// @dev Template data is only stored in the event logs, but its block number is kept in contract storage.
    /// @param content The template content
    /// @return The ID of the newly-created template, which is created sequentially.
    function createTemplate(string memory content) public stateAny notFrozen returns (uint256) {
        uint256 id = nextTemplateID;
        templates[id] = block.number;
        template_hashes[id] = keccak256(abi.encodePacked(content));
        emit LogNewTemplate(id, msg.sender, content);
        nextTemplateID = id + 1;
        return id;
    }

    function _askQuestion(
        bytes32 question_id,
        bytes32 content_hash,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 min_bond,
        uint256 tokens
    ) internal stateNotCreated(question_id) notFrozen onlyPermittedQuestioner {
        // A timeout of 0 makes no sense, and we will use this to check existence
        if (timeout == 0) revert TimeoutMustBePositive();
        if (timeout >= 365 days) revert TimeoutMustBeLessThan365Days();

        uint256 bounty = tokens;

        // The arbitrator can set a fee for asking a question.
        // This is intended as an anti-spam defence.
        // The fee is waived if the arbitrator is asking the question.
        // This allows them to set an impossibly high fee and make users proxy the question through them.
        // This would allow more sophisticated pricing, question whitelisting etc.
        if (arbitrator != address(0) && msg.sender != arbitrator) {
            uint256 question_fee = arbitrator_question_fees[arbitrator];
            if (bounty < question_fee) revert TokensProvidedMustCoverQuestionFee();
            bounty = bounty - question_fee;
            balanceOf[arbitrator] = balanceOf[arbitrator] + question_fee;
        }

        questions[question_id].content_hash = content_hash;
        questions[question_id].arbitrator = arbitrator;
        questions[question_id].opening_ts = opening_ts;
        questions[question_id].timeout = timeout;

        if (bounty > 0) {
            questions[question_id].bounty = bounty;
            emit LogFundAnswerBounty(question_id, bounty, bounty, msg.sender);
        }

        if (min_bond > 0) {
            questions[question_id].min_bond = min_bond;
            emit LogMinimumBond(question_id, min_bond);
        }
    }

    function _addAnswerToHistory(bytes32 question_id, bytes32 answer, address answerer, uint256 bond) internal {
        bytes32 new_history_hash = keccak256(abi.encodePacked(questions[question_id].history_hash, answer, bond, answerer, false));

        // Update the current bond level, if there's a bond (ie anything except arbitration)
        if (bond > 0) {
            questions[question_id].bond = bond;
        }
        questions[question_id].history_hash = new_history_hash;

        emit LogNewAnswer(answer, question_id, new_history_hash, answerer, bond, block.timestamp, false);
    }

    function _updateCurrentAnswer(bytes32 question_id, bytes32 answer) internal {
        questions[question_id].best_answer = answer;
        questions[question_id].finalize_ts = uint32(block.timestamp) + questions[question_id].timeout;
    }

    // Like _updateCurrentAnswer but without advancing the timeout
    function _updateCurrentAnswerByArbitrator(bytes32 question_id, bytes32 answer) internal {
        questions[question_id].best_answer = answer;
        questions[question_id].finalize_ts = uint32(block.timestamp);
    }

    /// @notice Notify the contract that the arbitrator has been paid for a question, freezing it pending their decision.
    /// @dev The arbitrator contract is trusted to only call this if they've been paid, and tell us who paid them.
    /// @param question_id The ID of the question
    /// @param requester The account that requested arbitration
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    function notifyOfArbitrationRequest(
        bytes32 question_id,
        address requester,
        uint256 max_previous
    ) external onlyArbitrator(question_id) stateOpen(question_id) previousBondMustNotBeatMaxPrevious(question_id, max_previous) notFrozen {
        if (questions[question_id].finalize_ts <= 0) revert QuestionMustAlreadyHaveAnAnswerWhenArbitrationIsRequested();
        questions[question_id].is_pending_arbitration = true;
        emit LogNotifyOfArbitrationRequest(question_id, requester);
    }

    /// @notice Cancel a previously-requested arbitration and extend the timeout
    /// @dev Useful when doing arbitration across chains that can't be requested atomically
    /// @param question_id The ID of the question
    function cancelArbitration(bytes32 question_id) external onlyArbitrator(question_id) statePendingArbitration(question_id) notFrozen {
        questions[question_id].is_pending_arbitration = false;
        questions[question_id].finalize_ts = uint32(block.timestamp) + questions[question_id].timeout;
        emit LogCancelArbitration(question_id);
    }

    /// @notice Submit the answer for a question, for use by the arbitrator.
    /// @dev Doesn't require (or allow) a bond.
    /// If the current final answer is correct, the account should be whoever submitted it.
    /// If the current final answer is wrong, the account should be whoever paid for arbitration.
    /// However, the answerer stipulations are not enforced by the contract.
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param answerer The account credited with this answer for the purpose of bond claims
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer) public onlyArbitrator(question_id) statePendingArbitration(question_id) notFrozen {
        if (answerer == address(0)) revert AnswererMustBeProvided();
        emit LogFinalize(question_id, answer);

        questions[question_id].is_pending_arbitration = false;
        _addAnswerToHistory(question_id, answer, answerer, 0);
        _updateCurrentAnswerByArbitrator(question_id, answer);
    }

    /// @notice Submit the answer for a question, for use by the arbitrator, working out the appropriate winner based on the last answer details.
    /// @dev Doesn't require (or allow) a bond.
    /// @param question_id The ID of the question
    /// @param answer The answer, encoded into bytes32
    /// @param payee_if_wrong The account to by credited as winner if the last answer given is wrong, usually the account that paid the arbitrator
    /// @param last_history_hash The history hash before the final one
    /// @param last_answer The last answer given
    /// @param last_answerer The address that supplied the last answer
    function assignWinnerAndSubmitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address payee_if_wrong, bytes32 last_history_hash, bytes32 last_answer, address last_answerer) external notFrozen {
        if (!_isHistoryInputValidForHash(questions[question_id].history_hash, last_history_hash, last_answer, questions[question_id].bond, last_answerer)) {
            revert HistoryInputProvidedDidNotMatchTheExpectedHash();
        }

        address payee = (questions[question_id].best_answer == answer) ? last_answerer : payee_if_wrong;
        submitAnswerByArbitrator(question_id, answer, payee);
    }

    /// @notice Report whether the answer to the specified question is finalized
    /// @param question_id The ID of the question
    /// @return Return true if finalized
    function isFinalized(bytes32 question_id) public view virtual returns (bool) {
        uint32 finalize_ts = questions[question_id].finalize_ts;
        return (!questions[question_id].is_pending_arbitration && (finalize_ts > 0) && (finalize_ts <= uint32(block.timestamp)));
    }

    /// @notice (Deprecated) Return the final answer to the specified question, or revert if there isn't one
    /// @param question_id The ID of the question
    /// @return The answer formatted as a bytes32
    function getFinalAnswer(bytes32 question_id) external view stateFinalized(question_id) returns (bytes32) {
        return questions[question_id].best_answer;
    }

    /// @notice Return the final answer to the specified question, or revert if there isn't one
    /// @param question_id The ID of the question
    /// @return The answer formatted as a bytes32
    function resultFor(bytes32 question_id) public view stateFinalized(question_id) returns (bytes32) {
        return questions[question_id].best_answer;
    }

    /// @notice Return the final answer to the specified question, provided it matches the specified criteria.
    /// @dev Reverts if the question is not finalized, or if it does not match the specified criteria.
    /// @param question_id The ID of the question
    /// @param content_hash The hash of the question content (template ID + opening time + question parameter string)
    /// @param arbitrator The arbitrator chosen for the question (regardless of whether they are asked to arbitrate)
    /// @param min_timeout The timeout set in the initial question settings must be this high or higher
    /// @param min_bond The bond sent with the final answer must be this high or higher
    /// @return The answer formatted as a bytes32
    function getFinalAnswerIfMatches(bytes32 question_id, bytes32 content_hash, address arbitrator, uint32 min_timeout, uint256 min_bond) external view stateFinalized(question_id) returns (bytes32) {
        if (content_hash != questions[question_id].content_hash) revert ContentHashMustMatch();
        if (arbitrator != questions[question_id].arbitrator) revert ArbitratorMustMatch();
        if (min_timeout > questions[question_id].timeout) revert TimeoutMustBeLongEnough();
        if (min_bond > questions[question_id].bond) revert BondMustBeHighEnough();
        return questions[question_id].best_answer;
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
    /// @param addrs Last-to-first, the address of each answerer
    /// @param bonds Last-to-first, the bond supplied with each answer
    /// @param answers Last-to-first, each answer supplied
    function claimWinnings(bytes32 question_id, bytes32[] memory history_hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers) public stateFinalized(question_id) notFrozen {
        if (history_hashes.length == 0) revert AtLeastOneHistoryHashEntryMustBeProvided();

        // These are only set if we split our claim over multiple transactions.
        address payee = question_claims[question_id].payee;
        uint256 last_bond = question_claims[question_id].last_bond;
        uint256 queued_funds = 0;

        // Starts as the hash of the final answer submitted. It'll be cleared when we're done.
        // If we're splitting the claim over multiple transactions, it'll be the hash where we left off last time
        bytes32 last_history_hash = questions[question_id].history_hash;

        bytes32 best_answer = questions[question_id].best_answer;

        uint256 i;
        for (i = 0; i < history_hashes.length; i++) {
            if (!_isHistoryInputValidForHash(last_history_hash, history_hashes[i], answers[i], bonds[i], addrs[i])) {
                revert HistoryInputProvidedDidNotMatchTheExpectedHash();
            }

            queued_funds = queued_funds + last_bond;
            (queued_funds, payee) = _processHistoryItem(question_id, best_answer, queued_funds, payee, addrs[i], bonds[i], answers[i]);

            // Line the bond up for next time, when it will be added to somebody's queued_funds
            last_bond = bonds[i];

            // Burn (just leave in contract balance) a fraction of all bonds except the final one.
            // This creates a cost to increasing your own bond, which could be used to delay resolution maliciously
            if (last_bond != questions[question_id].bond) {
                last_bond = last_bond - last_bond / BOND_CLAIM_FEE_PROPORTION;
            }

            last_history_hash = history_hashes[i];
        }

        if (last_history_hash != bytes32(0)) {
            // We haven't yet got to the null hash (1st answer), ie the caller didn't supply the full answer chain.
            // Persist the details so we can pick up later where we left off later.

            // Pay out the latest payee, only keeping back last_bond which the next may have a claim on
            _payPayee(question_id, payee, queued_funds);

            question_claims[question_id].payee = payee;
            question_claims[question_id].last_bond = last_bond;
        } else {
            // There is nothing left below us so the payee can keep what remains
            _payPayee(question_id, payee, queued_funds + last_bond);
            delete question_claims[question_id];
        }

        questions[question_id].history_hash = last_history_hash;
    }

    function _payPayee(bytes32 question_id, address payee, uint256 value) internal {
        balanceOf[payee] = balanceOf[payee] + value;
        emit LogClaim(question_id, payee, value);
    }

    function _isHistoryInputValidForHash(bytes32 last_history_hash, bytes32 history_hash, bytes32 answer, uint256 bond, address addr) internal pure returns (bool) {
        return (last_history_hash == keccak256(abi.encodePacked(history_hash, answer, bond, addr, false)));
    }

    // The answered-too-soon version will override this with (answer != UNRESOLVED_ANSWER)
    function _isBountyPayableOnAnswer(bytes32) internal pure virtual returns (bool) {
        return true;
    }

    function _processHistoryItem(bytes32 question_id, bytes32 best_answer, uint256 queued_funds, address payee, address addr, uint256 bond, bytes32 answer) internal returns (uint256, address) {
        if (answer == best_answer) {
            if (payee == address(0)) {
                // The entry is for the first payee we come to, ie the winner.
                // They get the question bounty.
                payee = addr;

                if (questions[question_id].bounty > 0 && _isBountyPayableOnAnswer(best_answer)) {
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
    /// @param addrs In a single list for all supplied questions, the address of each answerer
    /// @param bonds In a single list for all supplied questions, the bond supplied with each answer
    /// @param answers In a single list for all supplied questions, each answer supplied
    function claimMultipleAndWithdrawBalance(
        bytes32[] memory question_ids,
        uint256[] memory lengths,
        bytes32[] memory hist_hashes,
        address[] memory addrs,
        uint256[] memory bonds,
        bytes32[] memory answers
    )
        public
        stateAny
        notFrozen // The finalization checks are done in the claimWinnings function
    {
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

    /// @notice Returns true if the supplied history is valid
    /// @dev Caller must provide the answer history, in reverse order back to the item they want to check
    /// @dev Not necessarily the entire history
    /// @dev Useful for freezing an action once a bond is paid for a particular answer, without waiting for resolution
    /// @dev Cannot be used after the question is finalized
    /// @param question_id The ID of the question
    /// @param history_hashes Second-last-to-first, the hash of each history entry. (Final one should be empty).
    /// @param addrs Last-to-first, the address of each answerer
    /// @param bonds Last-to-first, the bond supplied with each answer
    /// @param answers Last-to-first, each answer supplied
    function isHistoryOfUnfinalizedQuestionValid(
        bytes32 question_id,
        bytes32[] memory history_hashes,
        address[] memory addrs,
        uint256[] memory bonds,
        bytes32[] memory answers
    ) external view stateOpenOrPendingArbitration(question_id) returns (bool) {
        bytes32 last_history_hash = questions[question_id].history_hash;

        uint256 hist_len = history_hashes.length;
        // Check for uneven length entries to make sure we validate all the inputs
        if (addrs.length != hist_len || bonds.length != hist_len || answers.length != hist_len) {
            return false;
        }

        for (uint256 i = 0; i < hist_len; i++) {
            if (!_isHistoryInputValidForHash(last_history_hash, history_hashes[i], answers[i], bonds[i], addrs[i])) {
                return false;
            }
            last_history_hash = history_hashes[i];
        }
        return true;
    }

    function withdraw() public virtual {}

    /// @notice Returns the questions's content hash, identifying the question content
    /// @param question_id The ID of the question
    function getContentHash(bytes32 question_id) public view returns (bytes32) {
        return questions[question_id].content_hash;
    }

    /// @notice Returns the arbitrator address for the question
    /// @param question_id The ID of the question
    function getArbitrator(bytes32 question_id) public view returns (address) {
        return questions[question_id].arbitrator;
    }

    /// @notice Returns the timestamp when the question can first be answered
    /// @param question_id The ID of the question
    function getOpeningTS(bytes32 question_id) public view returns (uint32) {
        return questions[question_id].opening_ts;
    }

    /// @notice Returns the timeout in seconds used after each answer
    /// @param question_id The ID of the question
    function getTimeout(bytes32 question_id) public view returns (uint32) {
        return questions[question_id].timeout;
    }

    /// @notice Returns the timestamp at which the question will be/was finalized
    /// @param question_id The ID of the question
    function getFinalizeTS(bytes32 question_id) public view returns (uint32) {
        return questions[question_id].finalize_ts;
    }

    /// @notice Returns whether the question is pending arbitration
    /// @param question_id The ID of the question
    function isPendingArbitration(bytes32 question_id) public view returns (bool) {
        return questions[question_id].is_pending_arbitration;
    }

    /// @notice Returns the current total unclaimed bounty
    /// @dev Set back to zero once the bounty has been claimed
    /// @param question_id The ID of the question
    function getBounty(bytes32 question_id) public view returns (uint256) {
        return questions[question_id].bounty;
    }

    /// @notice Returns the current best answer
    /// @param question_id The ID of the question
    function getBestAnswer(bytes32 question_id) public view returns (bytes32) {
        return questions[question_id].best_answer;
    }

    /// @notice Returns the history hash of the question
    /// @param question_id The ID of the question
    /// @dev Updated on each answer, then rewound as each is claimed
    function getHistoryHash(bytes32 question_id) public view returns (bytes32) {
        return questions[question_id].history_hash;
    }

    /// @notice Returns the highest bond posted so far for a question
    /// @param question_id The ID of the question
    function getBond(bytes32 question_id) public view returns (uint256) {
        return questions[question_id].bond;
    }

    /// @notice Returns the minimum bond that can answer the question
    /// @param question_id The ID of the question
    function getMinBond(bytes32 question_id) public view returns (uint256) {
        return questions[question_id].min_bond;
    }
}
