pragma solidity ^0.4.24;

contract CallbackClient {

    mapping(bytes32=>bytes32) public answers;

    event LogCallback(
        bytes32 question_id,
        bytes32 question_answer,
        address sender
    );

    function __realitycheck_callback(bytes32 question_id, bytes32 question_answer) 
    public {
        answers[question_id] = question_answer;
        emit LogCallback(question_id, question_answer, msg.sender);
    }

}
