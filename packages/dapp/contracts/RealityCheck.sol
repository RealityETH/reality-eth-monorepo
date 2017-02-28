pragma solidity ^0.4.6;

import "./StandardToken.sol";

contract CallerAPI {
    function __factcheck_callback(bytes32 question_id, uint256 question_answer); 
}

contract ArbitratorAPI {
    function getFee(bytes32 question_id) constant returns (uint256); 
}

contract RealityCheck is StandardToken {

    event LogNewQuestion(
        bytes32 question_id,
        address arbitrator, 
        uint256 step_delay,
        string question_text,
        uint256 deadline,
        uint256 default_answer
    );

    event LogFundAnswerBounty(
        bytes32 question_id,
        uint256 bounty_added,
        uint256 bounty
    );

    event LogFinalize(
        bytes32 question_id,
        bytes32 answer_id,
        uint256 answer
    );

    mapping(address => uint256) balances;

    struct Answer{
        bytes32 question_id;
        uint256 answer;
        address answerer;
        uint256 bond;
        uint256 ts;
        string evidence;
    }

    struct Question {
        uint256 created;

        // Identity fields - if these are the same, it's a duplicate
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

    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => Answer) public answers;

    bytes32 my_question_id;

    // question => contract => gas => bounty
    mapping(bytes32=>mapping(address=>mapping(uint256=>uint256))) public callback_requests; 

    function askQuestion(string question_text, address arbitrator, uint256 step_delay, uint256 deadline, uint256 default_answer) payable returns (bytes32) {

        bytes32 question_id = keccak256(arbitrator, step_delay, question_text, deadline, default_answer);
        if (questions[question_id].created == 0) {
            questions[question_id] = Question(
                now,
                arbitrator,
                step_delay,
                question_text,
                deadline,
                default_answer,
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
        my_question_id = question_id;
        LogNewQuestion( question_id, arbitrator, step_delay, question_text, deadline, default_answer );
        if (msg.value > 0) {
            LogFundAnswerBounty(question_id, msg.value, questions[question_id].bounty);
        }

        return question_id;

    }

    function getQuestionID(string question_text, address arbitrator, uint256 step_delay, uint256 deadline, uint256 default_answer) constant returns (bytes32) {
        return keccak256(arbitrator, step_delay, question_text, deadline, default_answer);
    }

    function fundCallbackRequest(bytes32 question_id, address client_contract, uint256 gas) payable {

        if (questions[question_id].created == 0) throw; // Check existence
        callback_requests[question_id][client_contract][gas] += msg.value;

    }

    function getAnswerID(bytes32 question_id, address sender, uint256 amount) constant returns (bytes32) {
        return keccak256(question_id, sender, amount);
    }

    function submitAnswer(bytes32 question_id, uint256 answer, string evidence) payable returns (bytes32) {

        bytes32 NULL_BYTES32;

        if (questions[question_id].is_finalized) throw;

        if (msg.sender != questions[question_id].arbitrator) {

            if (questions[question_id].is_arbitration_paid_for) throw;

            bytes32 best_answer_id = questions[question_id].best_answer_id;

            uint256 last_ts;
            if (best_answer_id == NULL_BYTES32) {
                last_ts = questions[question_id].created; 
            } else {
                last_ts = answers[best_answer_id].ts;
                if (msg.value == 0) throw;
                if (msg.value < (answers[best_answer_id].bond * 2)) throw;
            }

            if (now > (last_ts + questions[question_id].step_delay) ) throw;

        }

        bytes32 answer_id = keccak256(question_id, msg.sender, msg.value);

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

        return answer_id;

    }

    function getFinalAnswer(bytes32 question_id) constant returns (uint256) {
        bytes32 NULL_BYTES32;
        bytes32 best_answer_id = questions[question_id].best_answer_id;
        if (!questions[question_id].is_finalized) throw;
        if (best_answer_id == NULL_BYTES32) {
            return questions[question_id].default_answer;
        } else {
            return answers[best_answer_id].answer;
        }
    }

    function isFinalized(bytes32 question_id) constant returns (bool) {
        return questions[question_id].is_finalized;
    }

    function finalize(bytes32 question_id) {
        
        bytes32 NULL_BYTES32;

        if (questions[question_id].is_finalized) throw;
        bytes32 best_answer_id = questions[question_id].best_answer_id;

        uint256 last_ts;
        uint256 answer;
        if (best_answer_id == NULL_BYTES32) {
            last_ts = questions[question_id].created; 
            answer = questions[question_id].default_answer;
        } else {
            last_ts = answers[best_answer_id].ts;
            answer = answers[best_answer_id].answer;
        }

        if (now < (last_ts + questions[question_id].step_delay) ) throw;
        if (questions[question_id].is_arbitration_paid_for) throw;

        questions[question_id].is_finalized = true;

        LogFinalize(question_id, best_answer_id, answer);

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

    function fundAnswerBounty(bytes32 question_id) payable {
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
        bytes32 NULL_BYTES32;

        if (!questions[question_id].is_finalized) throw;
        if (!no_bounty && callback_requests[question_id][client_contract][gas] == 0) throw;
        if (gas > msg.gas) throw;
        bytes32 answer_id = questions[question_id].best_answer_id;

        uint256 answer;
        if (answer_id == NULL_BYTES32) {
            answer = answers[answer_id].answer;
        } else {
            answer = questions[question_id].default_answer;
        }

        // TODO: Use send() for this - we still get paid if it errors or runs out of gas.
        CallerAPI(client_contract).__factcheck_callback.gas(gas)(question_id, answer);

        balances[msg.sender] += callback_requests[question_id][client_contract][gas];
        callback_requests[question_id][client_contract][gas] = 0;
    }

}
