pragma solidity ^0.4.6;

contract CallerAPI {
    function __factcheck_callback(bytes32 question_id, bytes32 question_answer); 
}

contract ArbitratorAPI {
    function getFee(bytes32 question_id) constant returns (uint256); 
}

contract RealityCheck {

    // To make it hard for us to forget to set one of these, every non-constant function should specify:
    //    actorArbitrator or actorAnyone
    //    stateNotCreated or stateOpen or statePendingArbitration or stateFinalized or stateAny
    //    internal or external or public

    modifier actorAnyone() {
        _;
    }

    modifier stateAny() {
        _;
    }

    modifier actorArbitrator(bytes32 question_id) {
        require(msg.sender == questions[question_id].arbitrator);
        _;
    }

    modifier stateOpen(bytes32 question_id) {
        require(questions[question_id].step_delay > 0); // Check existence
        uint256 finalization_ts = questions[question_id].finalization_ts;
        require(finalization_ts == 0 || finalization_ts > now);
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

    modifier bondMustDouble(bytes32 question_id, uint256 max_previous) {

        require(msg.value > 0); 

        uint256 bond_to_beat = questions[question_id].bond;

        // You can specify that you don't want to beat a bond bigger than x
        require(max_previous == 0 || bond_to_beat <= max_previous);

        // You have to double the bond every time
        require(msg.value >= (bond_to_beat * 2));

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
        bool is_commitment,
        bytes32 evidence_ipfs
    );

    event LogAnswerReveal(
        bytes32 indexed question_id, 
        bytes32 answer_hash, 
        address indexed answerer, 
        uint256 nonce, 
        uint256 bond
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

    // Only used when claiming more bonds than fits into a transaction
    // Will probably never actually be used.
    // Stored in a mapping indexed by question_id.
    struct Claim {
        address payee;
        uint256 last_bond;
        uint256 take;
    }

    // Stored in a mapping indexed by commitment_id, which hashes the commitment hash and the sender.
    struct Commitment {
        // Deadline for the reveal.
        // Will use a magic number of 1 to mean "revealed".
        uint256 deadline_ts; 
        bytes32 revealed_answer;
    }

    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => Claim) question_claims;
    mapping(bytes32 => Commitment) public commitments;

    // Arbitration requests should be unusual, so to save gas don't assign space in the Question struct
    mapping(bytes32 => uint256) public arbitration_bounties;

    // question => ctrct => gas => bounty
    mapping(bytes32=>mapping(address=>mapping(uint256=>uint256))) public callback_requests; 

    function askQuestion(bytes32 question_ipfs, address arbitrator, uint256 step_delay) 
        actorAnyone()
        //stateNotCreated: See inline check below
        external
    payable returns (bytes32) {

        // A step delay of 0 makes no sense, and we will use this to check existence
        require(step_delay > 0); 

        bytes32 question_id = keccak256(question_ipfs, arbitrator, step_delay);

        // Should not already exist (equivalent to stateNotCreated)
        // If you legitimately want to ask the same question again, use a nonce or timestamp in the question json
        require(questions[question_id].step_delay ==  0); // Check existence

        questions[question_id].arbitrator = arbitrator;
        questions[question_id].step_delay = step_delay;
        questions[question_id].question_ipfs = question_ipfs;
        questions[question_id].bounty = msg.value;

        LogNewQuestion( question_id, msg.sender, arbitrator, step_delay, question_ipfs, now);

        return question_id;

    }

    // Predict the ID for a given question
    function getQuestionID(bytes32 question_ipfs, address arbitrator, uint256 step_delay) 
        constant 
        external
    returns (bytes32) {
        return keccak256(question_ipfs, arbitrator, step_delay);
    }

    function fundCallbackRequest(bytes32 question_id, address client_ctrct, uint256 gas) 
        actorAnyone()
        stateAny() 
        external
        // You can make a callback request before question registration, or repeat a previous one
        // If your calling contract expects only one, it should handle the duplication check itself.
    payable {
        callback_requests[question_id][client_ctrct][gas] += msg.value;
        LogFundCallbackRequest(question_id, client_ctrct, msg.sender, gas, msg.value);
    }


    function _addAnswer(bytes32 question_id, bytes32 answer, address answerer, uint256 bond, bytes32 evidence_ipfs, bool is_commitment, uint256 finalization_ts) 
        internal
    returns (bytes32)
    {

        bytes32 new_state = keccak256(questions[question_id].history_hash, answer, bond, answerer);

        questions[question_id].bond = bond;
        questions[question_id].history_hash = new_state;

        if (!is_commitment) {
            // For a commit-reveal, we leave these until the reveal
            questions[question_id].best_answer = answer;
            questions[question_id].finalization_ts = finalization_ts;
        }

        LogNewAnswer(
            answer,
            question_id,
            new_state,
            answerer,
            bond,
            now,
            is_commitment,
            evidence_ipfs
        );

        return answer;

    }

    // TODO: Delete this before release, you shouldn't use it.
    // Just using it for now while we make sure we calculate the hash right in python and javascript
    function calculateCommitmentHash(bytes32 answer, uint256 nonce) 
        constant 
        public
    returns (bytes32)
    {
        return keccak256(answer, nonce);
    }

    function submitAnswerCommitment(bytes32 question_id, bytes32 answer_hash, bytes32 evidence_ipfs, uint256 max_previous) 
        actorAnyone() 
        stateOpen(question_id)
        bondMustDouble(question_id, max_previous)
        external
    payable returns (bytes32) {

        bytes32 commitment_id = keccak256(question_id, answer_hash, msg.value);

        // You can only use the same commitment once.
        // If you want to submit the same answer again, use a new nonce.
        require(commitments[commitment_id].deadline_ts == 0);

        uint256 step_delay = questions[question_id].step_delay;
        commitments[commitment_id].deadline_ts = now + (step_delay/8);

        return _addAnswer(question_id, answer_hash, msg.sender, msg.value, evidence_ipfs, true, 0);

    }

    // NB The bond is the amount you sent in submitAnswerCommitment.
    // This is used to recreate the history hash so we can check whether your answer is still current.
    function submitAnswerReveal(bytes32 question_id, bytes32 answer, uint256 nonce, bytes32 history_hash, uint256 bond) 
        actorAnyone() // Let anyone do the reveal if they know the nonce. Clients may want to offload this to a service.
        stateOpen(question_id)
        external
    {

        bytes32 answer_hash = keccak256(answer, nonce);

        // The question ID + bond will uniquely identify the answer.
        bytes32 commitment_id = keccak256(question_id, answer_hash, bond);

        uint256 deadline_ts = commitments[commitment_id].deadline_ts;
        require(deadline_ts > 1); // Commitment must exist, and not be in already-answered state
        require(deadline_ts > now); 

        commitments[commitment_id].deadline_ts = 1;
        commitments[commitment_id].revealed_answer = answer;

        if (bond == questions[question_id].bond) {
            questions[question_id].best_answer = answer;
            questions[question_id].finalization_ts = now + questions[question_id].step_delay;
        }

        LogAnswerReveal(question_id, answer_hash, msg.sender, nonce, bond);

    }

    function submitAnswer(bytes32 question_id, bytes32 answer, bytes32 evidence_ipfs, uint256 max_previous) 
        actorAnyone()
        stateOpen(question_id)
        external
        bondMustDouble(question_id, max_previous)
    payable returns (bytes32) {

        uint256 finalization_ts = now + questions[question_id].step_delay;
        return _addAnswer(question_id, answer, msg.sender, msg.value, evidence_ipfs, false, finalization_ts);

    }

    // Used if the arbitrator has been asked to arbitrate but no correct answer is supplied
    // Allows the arbitrator to submit the correct answer themselves
    // The arbitrator doesn't need to send a bond.
    // NB They are trusted not to leave the top answer, but change the answerer
    // If they do this, they break the assumption that if you have the right answer, you get paid out of the higher person's bond.
    // TODO: Should we require that they send the previous data, and actually enforce this condition?
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer, bytes32 evidence_ipfs) 
        actorArbitrator(question_id)
        statePendingArbitration(question_id)
        external
    returns (bytes32) {

        require(answerer != 0x0);

        uint256 finalization_ts = now - 1;

        balances[msg.sender] = balances[msg.sender] + arbitration_bounties[question_id];
        delete arbitration_bounties[question_id];

        LogFinalize(question_id, answer);

        return _addAnswer(question_id, answer, answerer, uint256(0), evidence_ipfs, false, finalization_ts);

    }

    function isFinalized(bytes32 question_id) 
        constant
        public
    returns (bool) {
        uint256 finalization_ts = questions[question_id].finalization_ts;
        // 0, 1, 2 are magic numbers meaning "unanswered, unanswered pending arbitration, answered pending arbitration"
        return ( (finalization_ts > 2) && (finalization_ts < now) );
    }

    function getFinalAnswer(bytes32 question_id) 
        stateFinalized(question_id)
        external
    returns (bytes32) {
        return questions[question_id].best_answer;
    }

    // Assigns the winnings (bounty and bonds) to the people who gave the final accepted answer.
    // The caller must provide the answer history, in reverse order.
    //
    // The first answer is authenticated by checking against the stored history_hash.
    // One of the inputs to history_hash is the history_hash before it, so we use that to authenticate the next entry, etc
    // Once we get to an empty hash we'll know we're done and there are no more answers.
    //
    // Usually you would call the whole thing in a single transaction.
    // But in theory the chain of answers can be arbitrarily long, so you may run out of gas.
    // If you only supply part of the then chain the data we need to carry on later will be stored.
    //
    function claimWinnings(bytes32 question_id, bytes32[] history_hashes, address[] addrs, uint256[] bonds, bytes32[] answers) 
        actorAnyone() // Doesn't matter who calls it, it only pays the winner(s).
        stateFinalized(question_id)
        public 
    {

        // The following are usually 0 / null.
        // They are only set if we split our claim over multiple transactions.
        uint256 last_bond = question_claims[question_id].last_bond; // The last bond we saw. This hasn't been spent yet.
        address payee = question_claims[question_id].payee; // The person with the highest correct answer, working back down.
        uint256 take = question_claims[question_id].take; // Money we can pay out

        bytes32 best_answer = questions[question_id].best_answer;

        // History entries should have been sent from last to first.
        // We work up the chain and assign bonds to the person who gave the right answer
        // However, if someone gave our answer before they did, we make them the payee for subsequent (lower) bonds
        // They also get the equivalent (x1) of their bond from the higher-up right-answerer
        // We won't know that we have to pay them until we get to their entry.
        // So we don't pay out the bond added at x until we have looked at x-1

        // Usually the final hash. It'll be cleared when we're done.
        // If we're splitting the claim over multiple transactions, it'll be the hash where we left off last time
        bytes32 last_history_hash = questions[question_id].history_hash;

        uint256 i;
        for (i=0; i<history_hashes.length; i++) {

            require(last_history_hash == keccak256(history_hashes[i], answers[i], bonds[i], addrs[i]));

            take += last_bond; 
            assert(take >= last_bond);

            if (commitments[keccak256(question_id, answers[i], bonds[i])].deadline_ts == 1) {
                answers[i] = commitments[keccak256(question_id, answers[i], bonds[i])].revealed_answer;
                delete commitments[keccak256(question_id, answers[i], bonds[i])];
            }

            if (answers[i] == best_answer) {

                if (payee == 0x0) {

                    // The highest right answer

                    payee = addrs[i];
                    take += questions[question_id].bounty;
                    questions[question_id].bounty = 0;

                } else if (addrs[i] != payee) {

                    // Answerer has changed, ie we found someone lower down who needs to be paid

                    // The lower answerer will take over receiving bonds from higher answerer.
                    // They should also be paid the equivalent of their bond. 
                    // (This is our arbitrary rule, to give consistent right-answerers a defence against high-rollers.)

                    // Normally there should be enough (x2) from the higher user's last_bond to pay the lower user.
                    // There's an edge case involving weird arbitrator behaviour where there may not a higher bond.
                    // If we hit that, just pay them as much as we've got, which is 0...

                    uint256 payment = 0;
                    if (last_bond >= bonds[i]) {
                        payment = bonds[i];
                    } else {
                        payment = last_bond;
                    }

                    assert(take >= last_bond);
                    assert(take >= payment);

                    // Settle up with the old payee
                    take -= payment;
                    balances[payee] += take;
                    take = 0;

                    // Now start take again for the new payee
                    payee = addrs[i];
                    take = payment;

                }

            } 

            // Line the bond up for next time, when it will be added to somebody's take
            last_bond = bonds[i];
            last_history_hash = history_hashes[i];

        }
                 
        if (last_history_hash == "") {
            // There is nothing left below us so we can keep what remains
            take += last_bond;
            balances[payee] += take;
            delete question_claims[question_id];
        } else {
            // We haven't yet got to the null hash (1st answer), so store the details to pick up later
            question_claims[question_id].payee = payee;
            question_claims[question_id].last_bond = last_bond;

            // If we're still waiting for the winner, we have to persist their winnings.
            // These will remain in the pool until they submit enough history to tell use who they are.
            // Otherwise we can go ahead and pay them out, only keeping back last_bond
            if (payee == 0x0) {
                question_claims[question_id].take = take;
            } else {
                balances[payee] += take;
                question_claims[question_id].take = 0;
            }
        }

        questions[question_id].history_hash = last_history_hash;

        LogClaimBond(question_id, best_answer, payee, take);

    }

    // Convenience function to claim for multiple questions in one go.
    // question_ids are the question_ids, lengths are the number of history items for each.
    // The rest of the arguments are all the history item arrays stuck together
    function claimMultipleAndWithdrawBalance(bytes32[] question_ids, uint256[] lengths, bytes32[] hist_hashes, address[] addrs, uint256[] bonds, bytes32[] answers) 
        actorAnyone() // Anyone can call this as it just reassigns the bounty, then they withdraw their own balance
        stateAny() // The finalization checks are done in the claimWinnings function
        public
    {
        
        uint256 qi;
        uint256 i;
        for(qi=0; qi<question_ids.length; qi++) {
            bytes32 qid = question_ids[qi];
            uint256 l = lengths[qi];
            bytes32[] memory hh = new bytes32[](l);
            address[] memory ad = new address[](l);
            uint256[] memory bo = new uint256[](l);
            bytes32[] memory an = new bytes32[](l);
            uint256 j;
            for(j=0; j<l; j++) {
                hh[j] = hist_hashes[i];
                ad[j] = addrs[i];
                bo[j] = bonds[i];
                an[j] = answers[i];
                i++;
            }
            claimWinnings(qid, hh, ad, bo, an);
        }

    }

    function fundAnswerBounty(bytes32 question_id) 
        actorAnyone()
        stateOpen(question_id)
        external
    payable {
        questions[question_id].bounty += msg.value;
        LogFundAnswerBounty(question_id, msg.value, questions[question_id].bounty, msg.sender);
    }

    // Sends money to the arbitration bounty last_bond
    // Returns true if enough was paid to trigger arbitration
    // Once triggered, only the arbitrator can finalize
    // This may take longer than the normal step_delay
    function requestArbitration(bytes32 question_id) 
        actorAnyone()
        stateOpen(question_id)
        external
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
        actorAnyone()
        stateFinalized(question_id)
        external
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
        actorAnyone() // Only withdraws your own balance 
        stateAny() // You can always withdraw your balance
        public
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
        constant 
        external
    returns (uint256 balance) {
        return balances[_owner];
    }

} 
