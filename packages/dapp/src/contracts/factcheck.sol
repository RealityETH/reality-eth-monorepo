pragma solidity ^0.4.6;

contract CallerAPI {
    function __factcheck_callback(bytes32 question_id, uint256 question_answer); 
}

contract ArbitratorAPI {
    function getFee(bytes32 question_id) constant returns (uint256); 
}

contract FactCheck {

    //event LogRequest(string question, uint256 ts, address arbitrator, uint256 callback_bounty);

    mapping(address => uint256) balances;

    struct Answer{
        bytes32 question_id;
        uint256 answer;
        address answerer;
        uint256 bond;
        uint256 ts;
        string evidence;
    }

    struct Question{
        // Identity fields - if these are the same, it's a duplicate
        uint256 created;
        address arbitrator;
        uint256 step_delay;
        string question_text;
        uint256 deadline;
        uint256 default_answer;

        // Mutable data
        uint256 bounty;
        uint256 arbitration_bounty;
        bool is_arbitration_paid_for;
        bool is_finalized;
        bytes32 best_answer_id;
    }

    mapping(bytes32 => Question) questions;
    mapping(bytes32 => Answer) answers;

    // question => contract => gas => bounty
    mapping(bytes32=>mapping(address=>mapping(uint256=>uint256))) callback_requests; 

    function askQuestion(string question_text, address arbitrator, uint256 step_delay, uint256 deadline, uint256 default_answer, uint256 bounty) payable returns (bytes32) {

        bytes32 question_id = sha3(now, arbitrator, step_delay, question_text, deadline, default_answer);
        if (questions[question_id].created == 0) {
            questions[question_id] = Question(
                now,
                arbitrator,
                step_delay,
                question_text,
                deadline,
                deadline,
                msg.value,
                0,
                false,
                false,
                0
            );
        } else {
            // Already created in the same second, probably in the same block
            questions[question_id].bounty += msg.value;
        }

        return question_id;

    }

    function fundCallbackRequest(bytes32 question_id, address client_contract, uint256 gas) payable {

        if (questions[question_id].created == 0) throw; // Check existence
        callback_requests[question_id][client_contract][gas] += msg.value;

    }

    function submitAnswer(bytes32 question_id, uint256 answer, string evidence) payable {

        if (questions[question_id].is_finalized) throw;

        if (msg.sender != questions[question_id].arbitrator) {

            if (questions[question_id].is_arbitration_paid_for) throw;

            bytes32 best_answer_id = questions[question_id].best_answer_id;
            if (msg.value <= (answers[best_answer_id].bond * 2)) throw;

            if (now > (answers[best_answer_id].ts + questions[question_id].step_delay) ) throw;

        }

        bytes32 answer_id = sha3(question_id, answer, msg.sender, now); // TODO ETC ETC

        answers[answer_id] = Answer(
            question_id,
            answer,
            msg.sender,
            msg.value,
            now,
            evidence
        );

        questions[question_id].best_answer_id = answer_id;

        if (msg.sender == questions[question_id].arbitrator) {
            questions[question_id].is_finalized = true;
        }

    }

    function finalize(bytes32 question_id) {
        
        if (questions[question_id].is_finalized) throw;
        bytes32 best_answer_id = questions[question_id].best_answer_id;

        if (now < (answers[best_answer_id].ts + questions[question_id].step_delay) ) throw;
        if (questions[question_id].is_arbitration_paid_for) throw;

        questions[question_id].is_finalized = true;

    }

    function finalizeByArbitrator(bytes32 answer_id) {

        bytes32 question_id = answers[answer_id].question_id;
        if (msg.sender != questions[question_id].arbitrator) throw; 
        if (questions[question_id].is_finalized) throw;

        questions[question_id].best_answer_id = answer_id;
        questions[question_id].is_finalized = true;

    }

    // Assigns the bond for a particular answer to either:
    // ...the original answerer, if they had the final answer
    // ...or the highest-bonded person with the right answer, if they were wrong
    function claimBond(bytes32 answer_id) {

        bytes32 question_id = answers[answer_id].question_id;
        if (!questions[question_id].is_finalized) throw;
        
        bytes32 best_answer_id = questions[question_id].best_answer_id;
        address payee;

        if (answers[answer_id].answer == answers[best_answer_id].answer) { 
            // Correct answer, you get your bond back
            // This may not be the payee, if somebody else later trumped you with the right answer
            payee = answers[answer_id].answerer;
        } else {
            payee = answers[best_answer_id].answerer;
        }

        balances[payee] += answers[answer_id].bond;
        answers[answer_id].bond = 0;

    }

    function addAnswerBounty(bytes32 question_id) payable {
        if (questions[question_id].created == 0) throw; 
        if (questions[question_id].is_finalized) throw;
        questions[question_id].bounty += msg.value;
    }

    function requestArbitration(bytes32 question_id) payable returns (bool) {
        if (questions[question_id].created == 0) throw;
        if (questions[question_id].is_finalized) throw;

        questions[question_id].arbitration_bounty += msg.value;
        uint256 arbitration_fee = ArbitratorAPI(questions[question_id].arbitrator).getFee(question_id);

        if (questions[question_id].arbitration_bounty >= arbitration_fee) {
            questions[question_id].is_arbitration_paid_for = true;
            return true;
        }

        return false;
    }

    function sendCallback(bytes32 question_id, address client_contract, uint256 gas, bool no_bounty) {
        if (!questions[question_id].is_finalized) throw;
        if (!no_bounty && callback_requests[question_id][client_contract][gas] == 0) throw;
        if (gas > msg.gas) throw;
        bytes32 answer_id = questions[question_id].best_answer_id;
        uint256 answer = answers[answer_id].answer;

        // TODO: Use send() for this - we still get paid if it errors or runs out of gas.
        CallerAPI(client_contract).__factcheck_callback.gas(gas)(question_id, answer);

        balances[msg.sender] += callback_requests[question_id][client_contract][gas];
        callback_requests[question_id][client_contract][gas] = 0;
    }

}
