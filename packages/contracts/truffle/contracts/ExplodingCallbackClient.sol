pragma solidity ^0.4.25;

contract ExplodingCallbackClient {

    // Just write some state to avoid warnings that this could be pure
    bool impurity;

    function __realitycheck_callback(bytes32 question_id, bytes32 question_answer) 
    public {
        question_id == 0x0;
        question_answer = 0x0;
        impurity = true;
        revert();
    }

}
