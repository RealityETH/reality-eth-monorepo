pragma solidity ^0.4.6;

contract ExplodingCallbackClient {

    function __realitycheck_callback(bytes32 question_id, bytes32 question_answer) {
        throw;
    }

}
