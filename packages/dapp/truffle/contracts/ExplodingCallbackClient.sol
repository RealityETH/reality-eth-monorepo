pragma solidity ^0.4.6;

contract ExplodingCallbackClient {

    function __factcheck_callback(bytes32 question_id, uint256 question_answer) {
        throw;
    }

}
