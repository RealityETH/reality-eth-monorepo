pragma solidity ^0.4.6;

contract CallerAPI {
    function __factcheck_callback(bytes32 question_id, bytes32 question_answer); 
}

contract ArbitratorAPI {
    function getFee(bytes32 question_id) constant returns (uint256); 
}

contract RealityCheck {

    // To make it hard for us to forget to set one of these, every non-constant function should specify:
    //    actorArbitrator or //actorAnyone
    //    stateNotCreated or stateOpen or statePendingArbitration or stateFinalized or //stateAny

    modifier actorArbitrator(bytes32 question_id) {
        require(msg.sender == questions[question_id].arbitrator);
        _;
    }

    modifier stateOpen(bytes32 question_id) {
        require(questions[question_id].step_delay > 0); // Check existence
        uint256 finalization_ts = questions[question_id].finalization_ts;
        require(finalization_ts != 1 && finalization_ts != 2); // arbitration pending
        require(!isFinalized(question_id));
        _;
    }

    modifier statePendingArbitration(bytes32 question_id) {
        uint256 finalization_ts = questions[question_id].finalization_ts;
        require(questions[question_id].finalization_ts == 1 || questions[question_id].finalization_ts == 2);
        _;
    }

    modifier stateFinalized(bytes32 question_id) {
        require(isFinalized(question_id));
        _;
    }


    mapping (address => uint256) balances;

    event LogNewQuestion(
        bytes32 indexed question_id,
        address indexed questioner, 
        address indexed arbitrator, 
        uint256 step_delay,
        bytes32 question_ipfs,
        uint256 created
    );

    event LogNewAnswer(
        bytes32 indexed answer,
        bytes32 indexed question_id,
        bytes32 history_hash,
        address indexed answerer,
        uint256 bond,
        uint256 ts,
        bytes32 evidence_ipfs
    );

    event LogFundAnswerBounty(
        bytes32 indexed question_id,
        uint256 bounty_added,
        uint256 bounty,
        address funder
    );

    event LogRequestArbitration(
        bytes32 indexed question_id,
        uint256 fee_paid,
        address requester,
        uint256 remaining
    );

    event LogFinalize(
        bytes32 indexed question_id,
        bytes32 indexed answer
    );

    event LogClaimBounty(
        bytes32 indexed question_id,
        address indexed receiver,
        uint256 amount
    );

    event LogClaimBond(
        bytes32 indexed question_id,
        bytes32 indexed answer,
        address indexed receiver,
        uint256 amount
    );

    event LogFundCallbackRequest(
        bytes32 indexed question_id,
        address indexed ctrct,
        address indexed caller,
        uint256 gas,
        uint256 bounty
    );

    event LogSendCallback(
        bytes32 indexed question_id,
        address indexed ctrct,
        address indexed caller,
        uint256 gas,
        uint256 bounty,
        bool callback_result
    );

    struct Answer{
        bytes32 answer;
        address answerer;
        uint256 bond;
    }

    struct Question {
        uint256 finalization_ts; // Special magic values: 0 for unanswered, 1 for pending arbitration

        // Identity fields - if these are the same, it's a duplicate
        address arbitrator;
        uint256 step_delay;
        bytes32 question_ipfs;

        // Mutable data
        uint256 bounty;
        bytes32 best_answer;
        uint256 bond;
        bytes32 history_hash;
    }

    mapping(bytes32 => Question) public questions;

    // Arbitration requests should be unusual, so to save gas don't assign space in the Question struct
    mapping(bytes32 => uint256) public arbitration_bounties;

    // question => ctrct => gas => bounty
    mapping(bytes32=>mapping(address=>mapping(uint256=>uint256))) public callback_requests; 

    function askQuestion(bytes32 question_ipfs, address arbitrator, uint256 step_delay) 
        // actorAnyone
        // stateNotCreated: See inline check below
    payable returns (bytes32) {

        // A step delay of 0 makes no sense, and we will use this to check existence
        require(step_delay > 0); 

        bytes32 question_id = keccak256(question_ipfs, arbitrator, step_delay);

        // Should not already exist (equivalent to stateNotCreated)
        // If you legitimately want to ask the same question again, use a nonce or timestamp in the question json
        require(questions[question_id].step_delay ==  0); // Check existence

        questions[question_id].finalization_ts = 0;
        questions[question_id].arbitrator = arbitrator;
        questions[question_id].step_delay = step_delay;
        questions[question_id].question_ipfs = question_ipfs;
        questions[question_id].bounty = msg.value;

        LogNewQuestion( question_id, msg.sender, arbitrator, step_delay, question_ipfs, now);

        return question_id;

    }

    /*
    function getAnswer(bytes32 question_id, bytes32 answer) 
    constant returns (address answerer, uint256 bond) {
        return (questions[question_id].answers[answer].answerer, questions[question_id].answers[answer].bond); 
    }
    */

    // Predict the ID for a given question
    function getQuestionID(bytes32 question_ipfs, address arbitrator, uint256 step_delay) 
    constant returns (bytes32) {
        return keccak256(question_ipfs, arbitrator, step_delay);
    }

    function fundCallbackRequest(bytes32 question_id, address client_ctrct, uint256 gas) 
        //actorAnyone(question_id)
        //stateAny(question_id) 
        // You can make a callback request before question registration, or repeat a previous one
        // If your calling contract expects only one, it should handle the duplication check itself.
    payable {
        callback_requests[question_id][client_ctrct][gas] += msg.value;
        LogFundCallbackRequest(question_id, client_ctrct, msg.sender, gas, msg.value);
    }

    /*
    // TODO: Write tests for this
    function getMinimumBondForAnswer(bytes32 question_id, bytes32 answer, address answerer) 
    constant returns (uint256) {

        // The bond we have to beat
        bytes32 old_best_answer = questions[question_id].best_answer;
        uint256 old_bond = questions[question_id].answers[old_best_answer].bond;

        // The address that previously gave the answer you intend to give
        address previous_answerer = questions[question_id].answers[answer].answerer;

        address NULL_ADDRESS;
        if (previous_answerer == NULL_ADDRESS) {
            return old_bond * 2;
        }
        
        uint256 previous_bond = questions[question_id].answers[answer].bond;
        if (previous_answerer == answerer) {
            return (old_bond * 2) - previous_bond;
        } else {
            return (old_bond * 2) + previous_bond;
        }
    }
    */

    function submitAnswer(bytes32 question_id, bytes32 answer, bytes32 evidence_ipfs, uint256 max_previous) 
        //actorAnyone(question_id)
        stateOpen(question_id)
    payable returns (bytes32) {

        uint256 bond_to_beat = questions[question_id].bond;

        // You can specify that you don't want to beat a bond bigger than x
        require(max_previous == 0 || bond_to_beat <= max_previous);

        //require(msg.value > 0); 

        // You have to double the bond every time
        require(msg.value >= (bond_to_beat * 2));

        bytes32 new_state = keccak256(questions[question_id].history_hash, msg.sender, msg.value, answer);

        questions[question_id].bond = msg.value;
        questions[question_id].history_hash = new_state;
        questions[question_id].best_answer = answer;
        questions[question_id].finalization_ts = now + questions[question_id].step_delay;

        LogNewAnswer(
            answer,
            question_id,
            new_state,
            msg.sender,
            msg.value,
            now,
            evidence_ipfs
        );

        return answer;

    }

    // Used if the arbitrator has been asked to arbitrate but no correct answer is supplied
    // Allows the arbitrator to submit the correct answer themselves
    // The arbitrator doesn't need to send a bond.
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, bytes32 evidence_ipfs) 
        actorArbitrator(question_id)
        statePendingArbitration(question_id)
    returns (bytes32) {

        // TODO: Put this logic back in
        // If the answer is already there, just go ahead and finalize on it
        // If this is a new answer, submit it first with a bond of zero
        // This will allow us to claim the other bonds

        bytes32 new_state = keccak256(questions[question_id].history_hash, msg.sender, 0, answer);

        LogNewAnswer(
            answer,
            question_id,
            new_state,
            msg.sender,
            0,
            now,
            evidence_ipfs
        );

        questions[question_id].best_answer = answer;
        questions[question_id].history_hash = new_state;

        // Set this to 1 second ago so that "did we finalize" checks will immediately pass
        questions[question_id].finalization_ts = now - 1;

        balances[msg.sender] = balances[msg.sender] + arbitration_bounties[question_id];
        delete arbitration_bounties[question_id];

        LogFinalize(question_id, answer);
        
        return answer;

    }

    function isFinalized(bytes32 question_id) 
    returns (bool) {
        uint256 finalization_ts = questions[question_id].finalization_ts;
        // 0, 1, 2 are magic numbers meaning "unanswered, unanswered pending arbitration, answered pending arbitration"
        return ( (finalization_ts > 2) && (finalization_ts < now) );
    }

    function getFinalAnswer(bytes32 question_id) 
        stateFinalized(question_id)
    returns (bytes32) {
        return questions[question_id].best_answer;
    }

    function isArbitrationPaidFor(bytes32 question_id) 
    constant returns (bool) {
        uint256 finalization_ts = questions[question_id].finalization_ts;
        return ( (finalization_ts == 2) || (finalization_ts == 1) );
    }

    function getEarliestFinalizationTS(bytes32 question_id) 
    constant returns (uint256) {
        return questions[question_id].finalization_ts;
    }

    struct Claim {
        address payee;
        uint256 last_bond;
    }

    mapping(bytes32 => Claim) question_claims;
    
    function claimWinnings(bytes32 question_id, bytes32[] history_hashes, address[] addrs, uint256[] bonds, bytes32[] answers) 
        // actorAnyone(question_id)
        stateFinalized(question_id)
    {

        uint256 take = 0; // Money we can pay out
        uint256 last_bond = 0; // The amount of bond 1 slot higher than the one we are considering
        address payee;

        bytes32 best_answer = questions[question_id].best_answer;

        uint256 i;
        uint256 bounty = questions[question_id].bounty;

        // Arguments should have been sent from last to first, taking the bonds as we go.
        // However, if someone gave our answer before we did, they need to get their bond back from our total.
        // We won't know that until we get to their entry.
        // So we don't pay out the bond added at x until we have looked at the one before

        // This is usually the final hash
        // However, in theory the list may be too long to handle in one go
        // In that case it may be the hash where we left off
        bytes32 last_history_hash = questions[question_id].history_hash;

        for (i=0; i<history_hashes.length; i++) {

            require(last_history_hash == keccak256(history_hashes[i], addrs[i], bonds[i], answers[i]));

            if (answers[i] == best_answer) {

                // If the payee has changed, pay out the last guy then change to the new payee
                if (addrs[i] != payee) {

                    // Assign the payee what they are owed from the last_bond, which will equal their bond
                    // Give any money remaining in the last_bond to the old payee

                    if (last_bond == 0) {
                        // First time
                        if (bounty > 0) {
                            take += bounty;
                            bounty = 0;
                            questions[question_id].bounty = 0;
                        }
                    } else {
                        // New payee. 
                        // There should already be enough from the higher bond to pay them.
                        // TODO: Think what happens here if the issue was settled by the arbitrator
                        // TODO: Think what happens if the right answer came from a commit-and-reveal

                        // First settle up with the old payee.
                        // They get whatever is left in last_bond, minus what we have to pay to the new guy
                        assert(last_bond > bonds[i]);
                        take += last_bond - bonds[i]; // Cash in anything left in the last_bond
                        balances[payee] += take;

                        // Now start take again for the new payee
                        take = bonds[i]; // This comes from the higher payee
                    }

                    payee = addrs[i];

                } 

            } else {

                // If it's a previous bond, just take it
                take += last_bond; 

            }

            // Line the bond up for next time, when it will be added to somebody's take
            last_bond = bonds[i];
            last_history_hash = history_hashes[i];

        }

        // All done, keep anything left in the last_bond
        // TODO: handle if there is still more
        take += last_bond;

        balances[payee] += take;
        LogClaimBond(question_id, best_answer, payee, take);

    }


    /*
    function totalClaimable(address claimer, bytes32[] bounty_question_ids, bytes32[] bond_question_ids, bytes32[] bond_answers) 
    constant
        //actorAnyone(...) // Anyone can call this as it just reassigns the bounty, then they withdraw their own balance
        //stateAny(...) // The finalization checks should be done in the claimBounty and claimWinnings functions
    returns (uint256) {
        
        require(bond_question_ids.length == bond_answers.length);
        uint256 ttl;

        uint256 i;
        address payee;
        bytes32 best_answer;
        bytes32 question_id;
        for(i=0; i<bounty_question_ids.length; i++) {
            question_id = bounty_question_ids[i];
            best_answer = questions[question_id].best_answer;
            payee = questions[question_id].answers[best_answer].answerer;
            if (payee == claimer) {
                ttl += questions[question_id].bounty;
            }
        }

        for(i=0; i<bond_question_ids.length; i++) {
            question_id = bond_question_ids[i];
            best_answer = questions[question_id].best_answer;
            payee = questions[question_id].answers[best_answer].answerer;
            if (payee == claimer) {
                ttl += questions[question_id].answers[bond_answers[i]].bond;
            }
        }

        return ttl;

    }
    */



    /*
    // Convenience function to claim multiple bounties and bonds in 1 go
    // bond_question_ids are the question ids you want to claim for
    // bond_answers are the answers you want to claim for
    // TODO: This could probably be more efficient, as some checks are being duplicated
    function claimMultipleAndWithdrawBalance(bytes32[] bounty_question_ids, bytes32[] bond_question_ids, bytes32[] bond_answers) 
        //actorAnyone(...) // Anyone can call this as it just reassigns the bounty, then they withdraw their own balance
        //stateAny(...) // The finalization checks should be done in the claimBounty and claimWinnings functions
    returns (bool withdrawal_completed) {
        
        require(bond_question_ids.length == bond_answers.length);

        uint256 i;
        for(i=0; i<bounty_question_ids.length; i++) {
            claimBounty(bounty_question_ids[i]);
        }

        for(i=0; i<bond_question_ids.length; i++) {
            claimWinnings(bond_question_ids[i], bond_answers[i]);
        }

        return msg.sender.send(balances[msg.sender]);

    }
    */

    function fundAnswerBounty(bytes32 question_id) 
        // actorAnyone(question_id)
        stateOpen(question_id)
    payable {
        questions[question_id].bounty += msg.value;
        LogFundAnswerBounty(question_id, msg.value, questions[question_id].bounty, msg.sender);
    }

    // Sends money to the arbitration bounty last_bond
    // Returns true if enough was paid to trigger arbitration
    // Once triggered, only the arbitrator can finalize
    // This may take longer than the normal step_delay
    function requestArbitration(bytes32 question_id) 
        // actorAnyone(question_id)
        stateOpen(question_id)
    payable returns (bool) {

        uint256 arbitration_fee = ArbitratorAPI(questions[question_id].arbitrator).getFee(question_id);

        arbitration_bounties[question_id] += msg.value;
        uint256 paid = arbitration_bounties[question_id];

        if (paid >= arbitration_fee) {
            // It's useful for the UI to be able to differentiate between "answered" and "unanswered"
            // So assign a different magic number for each
            if (questions[question_id].finalization_ts == 0) {
                questions[question_id].finalization_ts = 1;
            } else {
                questions[question_id].finalization_ts = 2;
            }
            LogRequestArbitration(question_id, msg.value, msg.sender, 0);
            return true;
        } else {
            LogRequestArbitration(question_id, msg.value, msg.sender, arbitration_fee - paid);
            return false;
        }

    }

    function sendCallback(bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty) 
        // actorAnyone(question_id)
        stateFinalized(question_id)
    returns (bool) {

        // By default we return false if there is no bounty, because it has probably already been taken.
        // You can override this behaviour with the no_bounty flag
        if (!no_bounty && (callback_requests[question_id][client_ctrct][gas] == 0)) {
            return false;
        }

        bytes32 best_answer = questions[question_id].best_answer;

        require(msg.gas >= gas);

        // We call the callback with the low-level call() interface
        // We don't care if it errors out or not:
        // This is the responsibility of the requestor.

        // Call signature argument hard-codes the result of:
        // bytes4(bytes32(sha3("__factcheck_callback(bytes32,bytes32)"))
        bool callback_result = client_ctrct.call.gas(gas)(0xbc8a3697, question_id, best_answer); 

        uint256 bounty = callback_requests[question_id][client_ctrct][gas];

        delete callback_requests[question_id][client_ctrct][gas];
        balances[msg.sender] += bounty;

        LogSendCallback(question_id, client_ctrct, msg.sender, gas, bounty, callback_result);

        return callback_result;

    }

    function withdraw(uint256 _value) 
        //actorAnyone: Only withdraws your own balance 
        //stateAny: You can always withdraw your balance
    returns (bool success) {
        uint256 orig_bal = balances[msg.sender];
        require(orig_bal >= _value);
        uint256 new_bal = balances[msg.sender] - _value;

        // Overflow shouldn't be possible here but check anyhow
        require(orig_bal > new_bal); 

        balances[msg.sender] = new_bal;
        msg.sender.transfer(_value);
        return true;
    }

    function balanceOf(address _owner) 
    constant returns (uint256 balance) {
        return balances[_owner];
    }

} 
