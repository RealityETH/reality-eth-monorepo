pragma solidity ^0.4.6;

import './BalanceHolder.sol';

contract RealityCheckAPI {
    function getFinalAnswerIfMatches(bytes32 question_id, bytes32 content_hash, address arbitrator, uint256 min_timeout, uint256 min_bond) returns (bytes32);
    function askQuestion(uint256 template_id, string question, address arbitrator, uint256 timeout, uint256 nonce) payable returns (bytes32); 
    function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) payable;
    function claimMultipleAndWithdrawBalance(bytes32[] question_ids, uint256[] lengths, bytes32[] hist_hashes, address[] addrs, uint256[] bonds, bytes32[] answers);
}

contract MetaQuestion is BalanceHolder {

    address realitycheck;

    mapping(bytes32 => uint256) public question_requests;
    mapping(bytes32 => address) public question_owners;

    function askQuestion(
        uint256 template_id,
        string question,
        address arbitrator,
        uint256 timeout,
        uint256 min_bond,
        uint256 min_answer,
        uint256 max_answer,
        uint256 callback_gas
    )
    payable public returns (bytes32)
    {
        bytes32 content_hash = keccak256(template_id, question);
        bytes32 request_id = keccak256(content_hash, arbitrator, timeout, min_bond, min_answer, max_answer, msg.sender, callback_gas);
        require(question_requests[request_id] == 0);
        question_requests[request_id] = msg.value;
        return request_id;
    }

    function initializeQuestion(
        uint256 template_id, string question, address arbitrator, uint256 timeout, uint256 nonce, 
        bytes32 answer
    ) 
    payable public
    {
        bytes32 question_id = RealityCheckAPI(realitycheck).askQuestion(template_id, question, arbitrator, timeout, nonce); 
        RealityCheckAPI(realitycheck).submitAnswer.value(msg.value)(question_id, answer, 0);
        question_owners[question_id] = msg.sender;
    }

    function _payPayee(bytes32 request_id, bytes32 question_id)
    internal {
        address owner = question_owners[question_id];
        balanceOf[owner] += question_requests[request_id];
        delete question_requests[request_id];
    }
   
    function claimBounty(
        bytes32 question_id,
        bytes32 content_hash, address arbitrator, uint256 timeout, 
        uint256 min_bond, uint256 min_answer, uint256 max_answer,
        address caller, uint256 callback_gas
    ) 
    public
    {
        bytes32 request_id = keccak256(content_hash, arbitrator, timeout, min_bond, min_answer, max_answer, caller, callback_gas);

        require(question_requests[request_id] > 0);

        // Will revert if not finalized
        bytes32 answer = RealityCheckAPI(realitycheck).getFinalAnswerIfMatches(question_id, content_hash, arbitrator, timeout, min_bond);

        require(uint256(answer) >= uint256(min_answer));
        require(uint256(answer) <= uint256(max_answer));

        require(msg.gas > callback_gas);

        _payPayee(question_id, request_id);

        if (callback_gas > 0) {
            // We call the callback with the low-level call() interface
            // We don't care if it errors out or not - this is the responsibility of the requestor.
            // If we called it with enough gas, we did our job.
            // Call signature argument hard-codes the result of:
            // bytes4(bytes32(sha3("__realitycheck_callback(bytes32,bytes32)"))
            bool callback_result = caller.call.gas(callback_gas)(0x1d7dbb43, request_id, answer); 
        }

    }

    event LogFundCallbackRequest(
        bytes32 indexed question_id,
        address indexed ctrct,
        address indexed caller,
        uint256 gas,
        uint256 bounty
    );

    event LogSendCallback(
        bytes32 indexed question_id,
        address indexed ctrct,
        address indexed caller,
        uint256 gas,
        uint256 bounty,
        bool callback_result
    );

    function setRealityCheck(address addr) {
        address NULL_ADDRESS;
        require(realitycheck == NULL_ADDRESS);
        realitycheck = addr;
    }

}

