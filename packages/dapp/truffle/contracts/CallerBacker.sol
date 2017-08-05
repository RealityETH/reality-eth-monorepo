pragma solidity ^0.4.6;

/*
This is an example of the callback code separated into its own contract.
We intend to bundle it in the RealityCheck contract as this produces a slight gas saving:
 * About 20,000 gas for calling the contract
 * Potentially a little bit extra in the caller for managing 2 contract addresses (RealityCheck + CallerBacker)
 * Potentially a little bit extra when withdrawing if the same address has been used for answering and calling back
*/

contract RealityCheckAPI {
    function getFinalAnswer(bytes32 question_id) constant returns (bytes32); 
}

contract CallerBacker {

    address realitycheck;
    mapping (address => uint256) balances;

    // question => ctrct => gas => bounty
    mapping(bytes32=>mapping(address=>mapping(uint256=>uint256))) public callback_requests; 

    function setRealityCheck(address addr) {
        address NULL_ADDRESS;
        require(realitycheck == NULL_ADDRESS);
        realitycheck = addr;
    }

    function fundCallbackRequest(bytes32 question_id, address client_ctrct, uint256 gas) payable {
        callback_requests[question_id][client_ctrct][gas] += msg.value;
    }

    function sendCallback(bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty) {

        if (!no_bounty) {
            require(callback_requests[question_id][client_ctrct][gas] > 0);   
        }
        require(msg.gas >= gas);

        bytes32 best_answer = RealityCheckAPI(realitycheck).getFinalAnswer(question_id);      

        // We call the callback with the low-level call() interface
        // We don't care if it errors out or not:
        // This is the responsibility of the requestor.

        // Call signature argument hard-codes the result of:
        // bytes4(bytes32(sha3("__factcheck_callback(bytes32,bytes32)"))
        bool ignore = client_ctrct.call.gas(gas)(0xbc8a3697, question_id, best_answer); 

        balances[msg.sender] += callback_requests[question_id][client_ctrct][gas];
        callback_requests[question_id][client_ctrct][gas] = 0;
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
