pragma solidity ^0.4.6;

contract CallerAPI {
    function __factcheck_callback(bytes32 question_id, bytes32 question_answer); 
}

contract ArbitratorAPI {
    function getFee(bytes32 question_id) constant returns (uint256); 
}

contract RealityCheck {

    mapping (address => uint256) balances;

    event LogNewQuestion(
        bytes32 indexed question_id,
        address indexed questioner, 
        address indexed arbitrator, 
        uint256 step_delay,
        string question_text,
        uint256 created
    );

    event LogNewAnswer(
        bytes32 indexed answer,
        bytes32 indexed question_id,
        address indexed answerer,
        uint256 bond,
        uint256 ts,
        bytes32 evidence_sha256
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
        address requester
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
        address answerer;
        uint256 bond;
    }

    struct Question {
        uint256 last_changed_ts;

        // Identity fields - if these are the same, it's a duplicate
        address arbitrator;
        uint256 step_delay;
        string question_text;

        // Mutable data
        uint256 bounty;
        bool is_arbitration_paid_for;
        bool is_finalized;
        bytes32 best_answer;
        mapping(bytes32 => Answer) answers; // answer to answer ownership details
    }

    mapping(bytes32 => Question) public questions;

    // This isn't normally used, so to save gas don't normally assign space in the Question struct
    mapping(bytes32 => uint256) public arbitration_bounties;

    // question => ctrct => gas => bounty
    mapping(bytes32=>mapping(address=>mapping(uint256=>uint256))) public callback_requests; 

    function askQuestion(string question_text, address arbitrator, uint256 step_delay) payable returns (bytes32) {

        bytes32 question_id = keccak256(question_text, arbitrator, step_delay);

        // Should not already exist
        // If you legitimately want to ask the same question again, use a nonce or timestamp in the question json
        require(questions[question_id].last_changed_ts == 0);

        bytes32 NULL_BYTES;
        questions[question_id] = Question(
            now,
            arbitrator,
            step_delay,
            question_text,
            msg.value,
            false,
            false,
            NULL_BYTES 
        );

        LogNewQuestion( question_id, msg.sender, arbitrator, step_delay, question_text, now);

        return question_id;

    }

    // Predict the ID for a given question
    function getQuestionID(string question_text, address arbitrator, uint256 step_delay) constant returns (bytes32) {
        return keccak256(question_text, arbitrator, step_delay);
    }

    function fundCallbackRequest(bytes32 question_id, address client_ctrct, uint256 gas) payable {
        require(questions[question_id].last_changed_ts > 0); // Check existence
        callback_requests[question_id][client_ctrct][gas] += msg.value;
        LogFundCallbackRequest(question_id, client_ctrct, msg.sender, gas, msg.value);
    }

    function submitAnswer(bytes32 question_id, bytes32 answer, bytes32 evidence_sha256) payable returns (bytes32) {

        require(!questions[question_id].is_finalized);

        uint256 remaining_val = msg.value;
        bytes32 old_best_answer = questions[question_id].best_answer;

        if (msg.sender != questions[question_id].arbitrator) {

            require(!questions[question_id].is_arbitration_paid_for);
            require(msg.value > 0); 

            // Once the delay has past you can no longer change it, you have to finalize
            require( (questions[question_id].last_changed_ts + questions[question_id].step_delay) > now);

        }

        address NULL_ADDRESS;
        address previous_answerer = questions[question_id].answers[answer].answerer;
        
        // If the answer you submit is already submitted, you have to pay its owner their bond 
        // They also get their original bond back
        if (previous_answerer == msg.sender) {

            // Credit your previous bond to the remaining value
            remaining_val += questions[question_id].answers[answer].bond;

        } else if (previous_answerer != NULL_ADDRESS) { 

            uint256 previous_bond = questions[question_id].answers[answer].bond;
            remaining_val = remaining_val - previous_bond;

            // The previous answerer ends up with twice their bond.
            // Half comes from the new answerer, half is their original bond back
            balances[previous_answerer] += previous_bond + previous_bond;

        } 

        // You have to double every time
        require(remaining_val >= (questions[question_id].answers[old_best_answer].bond * 2));

        questions[question_id].answers[answer] = Answer(
            msg.sender,
            remaining_val
        );

        LogNewAnswer(
            answer,
            question_id,
            msg.sender,
            msg.value,
            now,
            evidence_sha256
        );

        questions[question_id].best_answer = answer;
        questions[question_id].last_changed_ts = now;

        if (msg.sender == questions[question_id].arbitrator) {
            finalizeByArbitrator(question_id, answer);
        }
        
        return answer;

    }

    function getFinalAnswer(bytes32 question_id) constant returns (bytes32) {
        require(questions[question_id].is_finalized);
        return questions[question_id].best_answer;
    }

    function isFinalized(bytes32 question_id) constant returns (bool) {
        return questions[question_id].is_finalized;
    }

    function isArbitrationPaidFor(bytes32 question_id) constant returns (bool) {
        return questions[question_id].is_arbitration_paid_for;
    }

    function getEarliestFinalizationTS(bytes32 question_id) constant returns (uint256) {
        return (questions[question_id].last_changed_ts + questions[question_id].step_delay);
    }

    function finalize(bytes32 question_id) {

        bytes32 best_answer = questions[question_id].best_answer;

        address NULL_ADDRESS;
        require(questions[question_id].answers[best_answer].answerer != NULL_ADDRESS);
        
        require(!questions[question_id].is_finalized);

        require(now >= (questions[question_id].last_changed_ts + questions[question_id].step_delay) );
        require(!questions[question_id].is_arbitration_paid_for);

        questions[question_id].is_finalized = true;

        LogFinalize(question_id, best_answer);

    }

    function finalizeByArbitrator(bytes32 question_id, bytes32 answer) {

        require(msg.sender == questions[question_id].arbitrator); 
        require(!questions[question_id].is_finalized);

        questions[question_id].best_answer = answer;
        questions[question_id].is_finalized = true;

        balances[msg.sender] = balances[msg.sender] + arbitration_bounties[question_id];
        arbitration_bounties[question_id] = 0;

        LogFinalize(question_id, answer);

    }

    // Assigns the bond for a particular answer to either:
    // ...the original answerer, if they had the final answer
    // ...or the highest-bonded person with the right answer, if they were wrong
    function claimBond(bytes32 question_id, bytes32 answer) {

        require(questions[question_id].is_finalized);
        
        bytes32 best_answer = questions[question_id].best_answer;

        // The bond goes to whoever had the correct answer
        address payee = questions[question_id].answers[best_answer].answerer;

        uint256 bond = questions[question_id].answers[answer].bond;

        LogClaimBond(question_id, answer, payee, bond);

        balances[payee] += bond;

        // We no longer need answer data except for the best answer.
        // (We may still need the best answer because there may be other unclaimed bonds)
        if (answer == best_answer) {
            questions[question_id].answers[answer].bond = 0;
        } else {
            delete questions[question_id].answers[answer];
        }

    }

    function claimBounty(bytes32 question_id) {

        require(questions[question_id].is_finalized);

        bytes32 best_answer = questions[question_id].best_answer;

        address payee = questions[question_id].answers[best_answer].answerer;
        uint256 bounty = questions[question_id].bounty;

        LogClaimBounty(question_id, payee, bounty);

        balances[payee] += bounty;
        questions[question_id].bounty = 0;

    }

    // Convenience function to claim multiple bounties and bonds in 1 go
    // bond_question_ids are the question ids you want to claim for
    // bond_answers are the answers you want to claim for
    // TODO: This could probably be more efficient, as some checks are being duplicated
    function claimMultipleAndWithdrawBalance(bytes32[] bounty_question_ids, bytes32[] bond_question_ids, bytes32[] bond_answers) returns (bool withdrawal_completed) {
        
        require(bond_question_ids.length == bond_answers.length);

        uint256 i;
        for(i=0; i<bounty_question_ids.length; i++) {
            claimBounty(bounty_question_ids[i]);
        }

        for(i=0; i<bond_question_ids.length; i++) {
            claimBond(bond_question_ids[i], bond_answers[i]);
        }

        return msg.sender.send(balances[msg.sender]);

    }

    function fundAnswerBounty(bytes32 question_id) payable {
        require(questions[question_id].last_changed_ts > 0); 
        require(!questions[question_id].is_finalized);
        questions[question_id].bounty += msg.value;

        LogFundAnswerBounty(question_id, msg.value, questions[question_id].bounty, msg.sender);
    }

    // Sends money to the arbitration bounty pool
    // Returns true if enough was paid to trigger arbitration
    // Once triggered, only the arbitrator can finalize
    // This may take longer than the normal step_delay
    function requestArbitration(bytes32 question_id) payable returns (bool) {

        uint256 arbitration_fee = ArbitratorAPI(questions[question_id].arbitrator).getFee(question_id);

        require(questions[question_id].last_changed_ts > 0);
        require(!questions[question_id].is_finalized);

        arbitration_bounties[question_id] += msg.value;

        if (arbitration_bounties[question_id] >= arbitration_fee) {
            questions[question_id].is_arbitration_paid_for = true;
            return true;
        }

        LogRequestArbitration(question_id, msg.value, msg.sender);

        return false;

    }

    function sendCallback(bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty) returns (bool) {

        // By default we return false if there is no bounty, because it has probably already been taken.
        // You can override this behaviour with the no_bounty flag
        if (!no_bounty && (callback_requests[question_id][client_ctrct][gas] == 0)) {
            return false;
        }

        require(questions[question_id].is_finalized);
        bytes32 best_answer = questions[question_id].best_answer;

        require(msg.gas >= gas);

        // We call the callback with the low-level call() interface
        // We don't care if it errors out or not:
        // This is the responsibility of the requestor.

        // Call signature argument hard-codes the result of:
        // bytes4(bytes32(sha3("__factcheck_callback(bytes32,bytes32)"))
        bool callback_result = client_ctrct.call.gas(gas)(0xbc8a3697, question_id, best_answer); 

        delete callback_requests[question_id][client_ctrct][gas];
        balances[msg.sender] += callback_requests[question_id][client_ctrct][gas];

        LogSendCallback(question_id, client_ctrct, msg.sender, gas, msg.value, callback_result);

        return callback_result;

    }

    function withdraw(uint256 _value) returns (bool success) {
        uint256 orig_bal = balances[msg.sender];
        require(orig_bal >= _value);
        uint256 new_bal = balances[msg.sender] - _value;

        // Overflow shouldn't be possible here but check anyhow
        require(orig_bal > new_bal); 

        balances[msg.sender] = new_bal;
        msg.sender.transfer(_value);
        return true;
    }

    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

} 
