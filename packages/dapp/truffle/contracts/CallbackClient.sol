pragma solidity ^0.4.6;

contract CallbackClient {

    mapping(bytes32=>uint256) public answers;

    event LogCallback(
        bytes32 question_id,
        uint256 question_answer,
        address sender
    );

    function __factcheck_callback(bytes32 question_id, uint256 question_answer) {
        answers[question_id] = question_answer;
        LogCallback(question_id, question_answer, msg.sender);
    }

}
