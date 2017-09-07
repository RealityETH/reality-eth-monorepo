pragma solidity ^0.4.6;
/*
To make it hard for us to forget to set one of these, every non-constant function should specify:
* actorArbitrator or actorAnyone
* stateNotCreated or stateOpen or statePendingArbitration or stateFinalized or stateAny
* internal or external or public

Things that take answers should specify
* bondMustDouble or BondMustBeZero

Any number that may be used in arithmetic not from a trusted source like now or msg.value
...should be prefixed US_ for UnSafe until explicitly bounds-checked.
*/

contract RealityCheck {

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

    modifier bondMustDouble(bytes32 question_id, uint256 US_max_previous) {

        require(msg.value > 0); 

        uint256 bond_to_beat = questions[question_id].bond;

        // You can specify that you don't want to beat a bond bigger than x
        require(US_max_previous == 0 || bond_to_beat <= US_max_previous);

        // You have to double the bond every time
        require(msg.value >= (bond_to_beat * 2));

        _;

    }

    modifier bondMustBeZero() {
        require(msg.value == 0);
        _;
    }


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
        bool is_commitment
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

    event LogNotifyOfArbitrationRequest(
        bytes32 indexed question_id
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

    // Stored in a mapping indexed by commitment_id, which hashes the commitment hash and the sender.
    struct Commitment {
        // Deadline for the reveal.
        // Will use a magic number of 1 to mean "revealed".
        uint256 deadline_ts; 
        bytes32 revealed_answer;
    }

    // Only used when claiming more bonds than fits into a transaction
    // Stored in a mapping indexed by question_id.
    struct Claim {
        address payee;
        uint256 last_bond;
        uint256 take;
    }

    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => Claim) question_claims;
    mapping(bytes32 => Commitment) public commitments;
    mapping(address => uint256) public balanceOf;

    function askQuestion(bytes32 question_ipfs, address arbitrator, uint256 US_step_delay) 
        actorAnyone()
        //stateNotCreated: See inline check below
        external
    payable returns (bytes32) {

        // A step delay of 0 makes no sense, and we will use this to check existence
        require(US_step_delay > 0); 
        require(US_step_delay < 365 days); 
        uint256 step_delay = US_step_delay;

        bytes32 question_id = keccak256(question_ipfs, arbitrator, US_step_delay);

        require(questions[question_id].step_delay ==  0); // Check existence (stateNotCreated)

        questions[question_id].arbitrator = arbitrator;
        questions[question_id].step_delay = step_delay;
        questions[question_id].question_ipfs = question_ipfs;
        questions[question_id].bounty = msg.value;

        LogNewQuestion( question_id, msg.sender, arbitrator, step_delay, question_ipfs, now);

        return question_id;

    }

    // Normally the bounty is paid on question creation, but if you like you can add to it later.
    function fundAnswerBounty(bytes32 question_id) 
        actorAnyone()
        stateOpen(question_id)
        external
    payable {
        questions[question_id].bounty += msg.value;
        LogFundAnswerBounty(question_id, msg.value, questions[question_id].bounty, msg.sender);
    }

    // Predict the ID for a given question
    function getQuestionID(bytes32 question_ipfs, address arbitrator, uint256 US_step_delay) 
        constant 
        external
    returns (bytes32) {
        return keccak256(question_ipfs, arbitrator, US_step_delay);
    }

    function _addAnswer(bytes32 question_id, bytes32 answer, address answerer, uint256 bond, bool is_commitment, uint256 finalization_ts) 
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
            is_commitment
        );

        return answer;

    }

    function submitAnswer(bytes32 question_id, bytes32 answer, uint256 US_max_previous) 
        actorAnyone()
        stateOpen(question_id)
        external
        bondMustDouble(question_id, US_max_previous)
    payable returns (bytes32) {

        uint256 finalization_ts = now + questions[question_id].step_delay;
        return _addAnswer(question_id, answer, msg.sender, msg.value, false, finalization_ts);

    }

    // If you're worried about front-running, you can use submitAnswerCommitment then submitAnswerReveal instead of submitAnswer.
    // The result is the same assuming you reveal. If you don't reveal in time, we just assume you're wrong. 
    function submitAnswerCommitment(bytes32 question_id, bytes32 answer_hash, uint256 US_max_previous) 
        actorAnyone() 
        stateOpen(question_id)
        bondMustDouble(question_id, US_max_previous)
        external
    payable returns (bytes32) {

        bytes32 commitment_id = keccak256(question_id, answer_hash, msg.value);

        // You can only use the same commitment once.
        require(commitments[commitment_id].deadline_ts == 0);

        uint256 step_delay = questions[question_id].step_delay;
        commitments[commitment_id].deadline_ts = now + (step_delay/8);

        return _addAnswer(question_id, answer_hash, msg.sender, msg.value, true, 0);

    }

    // NB The bond is the amount you sent in submitAnswerCommitment.
    // Since the bond must always increase, we can use this to confirm whether you still have the top answer.
    function submitAnswerReveal(bytes32 question_id, bytes32 answer, uint256 nonce, uint256 US_bond) 
        actorAnyone() // Let anyone do the reveal if they know the nonce. Clients may want to offload this to a service.
        stateOpen(question_id)
        external
    {

        bytes32 answer_hash = keccak256(answer, nonce);

        // The question ID + bond will uniquely identify the commitment.
        bytes32 commitment_id = keccak256(question_id, answer_hash, US_bond);

        uint256 deadline_ts = commitments[commitment_id].deadline_ts;
        require(deadline_ts > 1); // Commitment must exist, and not be in already-answered state
        require(deadline_ts > now); 

        commitments[commitment_id].deadline_ts = 1;
        commitments[commitment_id].revealed_answer = answer;

        if (US_bond == questions[question_id].bond) {
            questions[question_id].best_answer = answer;
            questions[question_id].finalization_ts = now + questions[question_id].step_delay;
        }

        LogAnswerReveal(question_id, answer_hash, msg.sender, nonce, US_bond);

    }

    function notifyOfArbitrationRequest(bytes32 question_id) 
        actorArbitrator(question_id)
        stateOpen(question_id)
    returns (bool) {

        if (questions[question_id].finalization_ts == 0) {
            questions[question_id].finalization_ts = 1;
        } else {
            questions[question_id].finalization_ts = 2;
        }
        LogNotifyOfArbitrationRequest(question_id);

    }

    // Answer sent by the arbitrator contract, without a bond.
    // It will be added to the history, with their opinion on who gave it last. (We don't check.)
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer) 
        actorArbitrator(question_id)
        statePendingArbitration(question_id)
        bondMustBeZero
        external
    returns (bytes32) {

        require(answerer != 0x0);
        uint256 finalization_ts = now - 1;
        LogFinalize(question_id, answer);

        return _addAnswer(question_id, answer, answerer, uint256(0), false, finalization_ts);

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
    // We work up the chain and assign bonds to the person who gave the right answer
    // If someone gave the winning answer earlier, they must get paid from the higher bond
    // So we don't pay out the bond added at n until we have looked at n-1
    //
    // The first answer is authenticated by checking against the stored history_hash.
    // One of the inputs to history_hash is the history_hash before it, so we use that to authenticate the next entry, etc
    // Once we get to a null hash we'll know we're done and there are no more answers.
    //
    // Usually you would call the whole thing in a single transaction.
    // But in theory the chain of answers can be arbitrarily long, so you may run out of gas.
    // If you only supply part of chain then the data we need to carry on later will be stored:
    // Question holds the history_hash. It'll be zeroed once everything has been claimed.
    // The rest goes in a dedicated struct, which is only set if you split the claim over multiple transactions.
    //
    function claimWinnings(bytes32 question_id, bytes32[] history_hashes, address[] addrs, uint256[] US_bonds, bytes32[] answers) 
        actorAnyone() // Doesn't matter who calls it, it assigns funds the winner(s) regardless.
        stateFinalized(question_id)
        public 
    {

        // These are only set if we split our claim over multiple transactions.
        address payee = question_claims[question_id].payee; // The person with the highest correct answer, working back down.
        uint256 last_bond = question_claims[question_id].last_bond; // The last bond we saw. Some of this may be owed to the next guy up.
        uint256 take = question_claims[question_id].take; // Money we can pay out.

        // Starts as the hash of the final answer submitted. It'll be cleared when we're done.
        // If we're splitting the claim over multiple transactions, it'll be the hash where we left off last time
        bytes32 last_history_hash = questions[question_id].history_hash;

        bytes32 best_answer = questions[question_id].best_answer;

        uint256 i;
        for (i=0; i<history_hashes.length; i++) {

            // The hash comes from the Question struct, and the rest is checked against the hash.
            // So we can be sure that the data here is what was sent in submitAnswer().
            require(last_history_hash == keccak256(history_hashes[i], answers[i], US_bonds[i], addrs[i]));

            take += last_bond; 
            assert(take >= last_bond);

            if (commitments[keccak256(question_id, answers[i], US_bonds[i])].deadline_ts == 1) {
                answers[i] = commitments[keccak256(question_id, answers[i], US_bonds[i])].revealed_answer;
                delete commitments[keccak256(question_id, answers[i], US_bonds[i])];
            }

            if (answers[i] == best_answer) {

                if (payee == 0x0) {

                    // The highest right answer, they get the question bounty.
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
                    if (last_bond >= US_bonds[i]) {
                        payment = US_bonds[i];
                    } else {
                        payment = last_bond;
                    }

                    assert(take >= last_bond);
                    assert(take >= payment);

                    // Settle up with the old payee
                    take -= payment;
                    balanceOf[payee] += take;
                    take = 0;

                    // Now start take again for the new payee
                    payee = addrs[i];
                    take = payment;

                }

            } 

            // Line the bond up for next time, when it will be added to somebody's take
            last_bond = US_bonds[i];
            last_history_hash = history_hashes[i];

        }
                 
        if (last_history_hash == "") {
            // There is nothing left below us so we can keep what remains
            take += last_bond;
            balanceOf[payee] += take;
            delete question_claims[question_id];
        } else {
            // We haven't yet got to the null hash (1st answer), so store the details to pick up later
            question_claims[question_id].payee = payee;
            question_claims[question_id].last_bond = last_bond;

            // If we're still waiting for the winner, we have to persist their winnings.
            // These will remain in the pool until they submit enough history to tell use who they are.
            // If we have the winner we can go ahead and pay them out, only keeping back last_bond
            if (payee == 0x0) {
                question_claims[question_id].take = take;
            } else {
                balanceOf[payee] += take;
                question_claims[question_id].take = 0;
            }
        }

        questions[question_id].history_hash = last_history_hash;

        LogClaimBond(question_id, best_answer, payee, take);

    }

    // Convenience function to claim for multiple questions in one go.
    // question_ids are the question_ids, lengths are the number of history items for each.
    // The rest of the arguments are all the history item arrays stuck together
    function claimMultipleAndWithdrawBalance(bytes32[] question_ids, uint256[] lengths, bytes32[] hist_hashes, address[] addrs, uint256[] US_bonds, bytes32[] answers) 
        actorAnyone() // Anyone can call this as it just reassigns the bounty to whoever should have it, then they withdraw their own balance
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
                bo[j] = US_bonds[i];
                an[j] = answers[i];
                i++;
            }
            claimWinnings(qid, hh, ad, bo, an);
        }
        withdraw();
    }

    function withdraw() 
        actorAnyone() // Only withdraws your own balance 
        stateAny() // You can always withdraw your balance
        public
    {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        msg.sender.transfer(bal);
    }


    //////////////////
    // TODO: Delete this before release, you shouldn't use it.
    // Just using it for now while we make sure we calculate the hash right in python and javascript
    function calculateCommitmentHash(bytes32 answer, uint256 nonce) 
        constant 
        public
    returns (bytes32)
    {
        return keccak256(answer, nonce);
    }

}
