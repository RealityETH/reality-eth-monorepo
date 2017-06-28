pragma solidity ^0.4.6;

contract CallerAPI {
    function __factcheck_callback(bytes32 question_id, uint256 question_answer); 
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
        bytes32 question_sha256,
        uint256 default_answer
    );

    event LogNewAnswer(
        bytes32 indexed answer_id,
        bytes32 indexed question_id,
        uint256 answer,
        address indexed answerer,
        uint256 bond,
        uint256 ts,
        bytes32 evidence_sha256
    );

    event LogFundAnswerBounty(
        bytes32 indexed question_id,
        uint256 bounty_added,
        uint256 bounty
    );

    event LogFinalize(
        bytes32 indexed question_id,
        bytes32 answer_id,
        uint256 answer
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
        uint256 answer;
        address answerer;
        uint256 bond;
        uint256 ts;
        bytes32 evidence_sha256;
    }

    struct Question {
        uint256 created;

        // Identity fields - if these are the same, it's a duplicate
        address arbitrator;
        uint256 step_delay;
        bytes32 question_sha256;

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

    function askQuestion(bytes32 question_sha256, address arbitrator, uint256 step_delay, uint256 default_answer) payable returns (bytes32) {

        bytes32 question_id = keccak256(arbitrator, step_delay, question_sha256, default_answer);
        if (questions[question_id].created > 0) throw;

        bytes32 answer_id = keccak256(question_id, msg.sender, msg.value);
        answers[answer_id] = Answer(
            question_id,
            default_answer,
            msg.sender,
            0,
            now,
            0x0 
        );

        questions[question_id] = Question(
            now,
            arbitrator,
            step_delay,
            question_sha256,
            msg.value,
            false,
            false,
            answer_id 
        );

        LogNewQuestion( question_id, msg.sender, arbitrator, step_delay, question_sha256, default_answer );
        LogNewAnswer( answer_id, question_id, default_answer, msg.sender, 0, now, "");

        return question_id;

    }

    function getQuestionID(bytes32 question_sha256, address arbitrator, uint256 step_delay, uint256 default_answer) constant returns (bytes32) {
        return keccak256(arbitrator, step_delay, question_sha256, default_answer);
    }

    function fundCallbackRequest(bytes32 question_id, address client_ctrct, uint256 gas) payable {
        if (questions[question_id].created == 0) throw; // Check existence
        callback_requests[question_id][client_ctrct][gas] += msg.value;
    }

    function getAnswerID(bytes32 question_id, address sender, uint256 amount) constant returns (bytes32) {
        return keccak256(question_id, sender, amount);
    }

    function submitAnswer(bytes32 question_id, uint256 answer, bytes32 evidence_sha256) payable returns (bytes32) {

        if (questions[question_id].is_finalized) throw;

        if (msg.sender != questions[question_id].arbitrator) {

            if (questions[question_id].is_arbitration_paid_for) throw;

            bytes32 best_answer_id = questions[question_id].best_answer_id;

            // The default answer can be 0, but anything added later must be positive
            if (msg.value == 0) throw; 

            // You have to double every time
            if (msg.value < (answers[best_answer_id].bond * 2)) throw;

            // Once the delay has past you can no longer change it, you have to finalize
            if (now > (answers[best_answer_id].ts + questions[question_id].step_delay) ) throw;

        }

        bytes32 answer_id = keccak256(question_id, msg.sender, msg.value);

        answers[answer_id] = Answer(
            question_id,
            answer,
            msg.sender,
            msg.value,
            now,
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

        if (msg.sender == questions[question_id].arbitrator) {
            finalizeByArbitrator(answer_id);
        }

        return answer_id;

    }

    function getFinalAnswer(bytes32 question_id) constant returns (uint256) {
        bytes32 best_answer_id = questions[question_id].best_answer_id;
        if (!questions[question_id].is_finalized) throw;
        return answers[best_answer_id].answer;
    }

    function isFinalized(bytes32 question_id) constant returns (bool) {
        return questions[question_id].is_finalized;
    }

    function isArbitrationPaidFor(bytes32 question_id) constant returns (bool) {
        return questions[question_id].is_arbitration_paid_for;
    }

    function getEarliestFinalizationTS(bytes32 question_id) constant returns (uint256) {
        bytes32 best_answer_id = questions[question_id].best_answer_id;
        return (answers[best_answer_id].ts + questions[question_id].step_delay);
    }

    function finalize(bytes32 question_id) {
        
        if (questions[question_id].is_finalized) throw;
        bytes32 best_answer_id = questions[question_id].best_answer_id;

        if (now < (answers[best_answer_id].ts + questions[question_id].step_delay) ) throw;
        if (questions[question_id].is_arbitration_paid_for) throw;

        questions[question_id].is_finalized = true;

        LogFinalize(question_id, best_answer_id, answers[best_answer_id].answer);

    }

    function finalizeByArbitrator(bytes32 answer_id) {

        bytes32 question_id = answers[answer_id].question_id;

        if (msg.sender != questions[question_id].arbitrator) throw; 
        if (questions[question_id].is_finalized) throw;

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
        if (!questions[question_id].is_finalized) throw;
        
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
        answers[answer_id].bond = 0;

    }

    function claimBounty(bytes32 question_id) {

        if (!questions[question_id].is_finalized) throw;
        bytes32 best_answer_id = questions[question_id].best_answer_id;

        address payee = answers[best_answer_id].answerer;
        uint256 bounty = questions[question_id].bounty;

        LogClaimBounty(question_id, payee, bounty);

        balances[payee] += bounty;
        questions[question_id].bounty = 0;

    }

    function fundAnswerBounty(bytes32 question_id) payable {
        if (questions[question_id].created == 0) throw; 
        if (questions[question_id].is_finalized) throw;
        questions[question_id].bounty += msg.value;
    }

    // Sends money to the arbitration bounty pool
    // Returns true if enough was paid to trigger arbitration
    // Once triggered, only the arbitrator can finalize
    // This may take longer than the normal step_delay
    function requestArbitration(bytes32 question_id) payable returns (bool) {

        uint256 arbitration_fee = ArbitratorAPI(questions[question_id].arbitrator).getFee(question_id);

        if (questions[question_id].created == 0) throw;
        if (questions[question_id].is_finalized) throw;

        arbitration_bounties[question_id] += msg.value;

        if (arbitration_bounties[question_id] >= arbitration_fee) {
            questions[question_id].is_arbitration_paid_for = true;
            return true;
        }

        return false;

    }

    function sendCallback(bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty) {

        if (!questions[question_id].is_finalized) throw;
        if (!no_bounty && callback_requests[question_id][client_ctrct][gas] == 0) throw;
        if (gas > msg.gas) throw;
        bytes32 answer_id = questions[question_id].best_answer_id;

        // We call the callback with the low-level call() interface
        // We don't care if it errors out or not:
        // This is the responsibility of the requestor.

        // Call signature argument hard-codes the result of:
        // bytes4(bytes32(sha3("__factcheck_callback(bytes32,uint256)"))
        bool ignore = client_ctrct.call.gas(gas)(0x6f32be63, question_id, answers[answer_id].answer); 

        balances[msg.sender] += callback_requests[question_id][client_ctrct][gas];
        callback_requests[question_id][client_ctrct][gas] = 0;
    }

    function withdraw(uint256 _value) returns (bool success) {
        if (_value > balances[msg.sender]) throw;
        balances[msg.sender] = balances[msg.sender] - _value;
        if (balances[msg.sender] > _value) throw;
        if (!msg.sender.send(_value)) {
            throw;
        }
        return true;
    }

    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

} 
