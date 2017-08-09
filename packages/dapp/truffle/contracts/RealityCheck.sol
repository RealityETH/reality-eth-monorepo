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
        bytes32 indexed answer_id,
        bytes32 indexed question_id,
        bytes32 answer,
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
        address requester,
        uint256 remaining
    );

    event LogFinalize(
        bytes32 indexed question_id,
        bytes32 answer_id,
        bytes32 answer
    );

    event LogClaimBounty(
        bytes32 indexed answer_id,
        address indexed receiver,
        uint256 amount
    );

    event LogClaimBond(
        bytes32 indexed question_id,
        address indexed receiver,
        uint256 amount
    );

    struct Answer{
        bytes32 question_id;
        bytes32 answer;
        address answerer;
        uint256 bond;
        bytes32 evidence_sha256;
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
        bytes32 best_answer_id;
    }

    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => Answer) public answers;

    mapping(bytes32 => uint256) public arbitration_bounties;

    // question => ctrct => gas => bounty
    mapping(bytes32=>mapping(address=>mapping(uint256=>uint256))) public callback_requests; 

    function askQuestion(string question_text, address arbitrator, uint256 step_delay) payable returns (bytes32) {

        bytes32 question_id = keccak256(question_text, arbitrator, step_delay);
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

    function getQuestionID(string question_text, address arbitrator, uint256 step_delay) constant returns (bytes32) {
        return keccak256(question_text, arbitrator, step_delay);
    }

    function fundCallbackRequest(bytes32 question_id, address client_ctrct, uint256 gas) payable {
        require(questions[question_id].last_changed_ts > 0); // Check existence
        callback_requests[question_id][client_ctrct][gas] += msg.value;
    }

    function getAnswerID(bytes32 question_id, address sender, uint256 amount) constant returns (bytes32) {
        return keccak256(question_id, sender, amount);
    }

    function submitAnswer(bytes32 question_id, bytes32 answer, bytes32 evidence_sha256) payable returns (bytes32) {

        require(!questions[question_id].is_finalized);

        if (msg.sender != questions[question_id].arbitrator) {

            require(!questions[question_id].is_arbitration_paid_for);

            bytes32 NULL_BYTES;
            bytes32 best_answer_id = questions[question_id].best_answer_id;

            if (best_answer_id != NULL_BYTES) {
                require(msg.value > 0); 
                // You have to double every time
                require(msg.value >= (answers[best_answer_id].bond * 2));
                // Once the delay has past you can no longer change it, you have to finalize
                require( (questions[question_id].last_changed_ts + questions[question_id].step_delay) > now);
            }

        }

        bytes32 answer_id = keccak256(question_id, msg.sender, msg.value);

        answers[answer_id] = Answer(
            question_id,
            answer,
            msg.sender,
            msg.value,
            evidence_sha256
        );

        LogNewAnswer(
            answer_id,
            question_id,
            answer,
            msg.sender,
            msg.value,
            now,
            evidence_sha256
        );

        questions[question_id].best_answer_id = answer_id;
        questions[question_id].last_changed_ts = now;

        if (msg.sender == questions[question_id].arbitrator) {
            finalizeByArbitrator(answer_id);
        }

        return answer_id;

    }

    function getFinalAnswer(bytes32 question_id) constant returns (bytes32) {
        bytes32 best_answer_id = questions[question_id].best_answer_id;
        require(questions[question_id].is_finalized);
        return answers[best_answer_id].answer;
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

        bytes32 NULL_BYTES;
        require(questions[question_id].best_answer_id != NULL_BYTES);
        
        require(!questions[question_id].is_finalized);

        bytes32 best_answer_id = questions[question_id].best_answer_id;

        require(now >= (questions[question_id].last_changed_ts + questions[question_id].step_delay) );
        require(!questions[question_id].is_arbitration_paid_for);

        questions[question_id].is_finalized = true;

        LogFinalize(question_id, best_answer_id, answers[best_answer_id].answer);

    }

    function finalizeByArbitrator(bytes32 answer_id) {

        bytes32 question_id = answers[answer_id].question_id;

        require(msg.sender == questions[question_id].arbitrator); 
        require(!questions[question_id].is_finalized);

        questions[question_id].best_answer_id = answer_id;
        questions[question_id].is_finalized = true;

        balances[msg.sender] = balances[msg.sender] + arbitration_bounties[question_id];
        arbitration_bounties[question_id] = 0;

        LogFinalize(question_id, answer_id, answers[answer_id].answer);

    }

    // Assigns the bond for a particular answer to either:
    // ...the original answerer, if they had the final answer
    // ...or the highest-bonded person with the right answer, if they were wrong
    function claimBond(bytes32 answer_id) {

        bytes32 question_id = answers[answer_id].question_id;
        require(questions[question_id].is_finalized);
        
        bytes32 best_answer_id = questions[question_id].best_answer_id;
        address payee;

        // If the answer is correct, it goes to its owner
        // If the answer is wrong, it goes to whoever gave the best answer
        if (answers[answer_id].answer == answers[best_answer_id].answer) { 
            payee = answers[answer_id].answerer;
        } else {
            payee = answers[best_answer_id].answerer;
        }

        uint256 bond = answers[answer_id].bond;

        LogClaimBond(answer_id, payee, bond);

        balances[payee] += bond;

        // We no longer need answers, except the final accepted one
        if (best_answer_id == answer_id) {
            answers[answer_id].bond = 0;
        } else {
            delete answers[answer_id];
        }


    }

    function claimBounty(bytes32 question_id) {

        require(questions[question_id].is_finalized);
        bytes32 best_answer_id = questions[question_id].best_answer_id;

        address payee = answers[best_answer_id].answerer;
        uint256 bounty = questions[question_id].bounty;

        LogClaimBounty(question_id, payee, bounty);

        balances[payee] += bounty;
        questions[question_id].bounty = 0;

    }

    // Convenience function to claim multiple bounties and bonds in 1 go
    // TODO: This could probably be more efficient, as some checks are being duplicated
    function claimMultipleAndWithdrawBalance(bytes32[] question_ids, bytes32[] answer_ids) returns (bool withdrawal_completed) {

        uint256 i;
        for(i=0; i<question_ids.length; i++) {
            claimBounty(question_ids[i]);
        }
        for(i=0; i<answer_ids.length; i++) {
            claimBond(answer_ids[i]);
        }
        uint256 bal = balances[msg.sender];
        if (bal > 0) {
            return withdraw(bal);
        }
        return false;

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
        uint256 paid = arbitration_bounties[question_id];

        if (paid >= arbitration_fee) {
            questions[question_id].is_arbitration_paid_for = true;
            LogRequestArbitration(question_id, msg.value, msg.sender, 0);
            return true;
        } else {
            LogRequestArbitration(question_id, msg.value, msg.sender, arbitration_fee - paid);
            return false;
        }

    }

    function sendCallback(bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty) {

        require(questions[question_id].is_finalized);
        if (!no_bounty) {
            require(callback_requests[question_id][client_ctrct][gas] > 0);   
        }
        require(msg.gas >= gas);
        bytes32 answer_id = questions[question_id].best_answer_id;

        // We call the callback with the low-level call() interface
        // We don't care if it errors out or not:
        // This is the responsibility of the requestor.

        // Call signature argument hard-codes the result of:
        // bytes4(bytes32(sha3("__factcheck_callback(bytes32,bytes32)"))
        bool ignore = client_ctrct.call.gas(gas)(0xbc8a3697, question_id, answers[answer_id].answer); 

        balances[msg.sender] += callback_requests[question_id][client_ctrct][gas];
        callback_requests[question_id][client_ctrct][gas] = 0;
    }

    function withdraw(uint256 _value) returns (bool success) {
        require(balances[msg.sender] >= _value);
        balances[msg.sender] = balances[msg.sender] - _value;
        require(_value >= balances[msg.sender]);
        return msg.sender.send(_value);
    }

    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

} 
