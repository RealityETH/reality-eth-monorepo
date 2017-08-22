pragma solidity ^0.4.6;

contract RealityCheckAPI {
    function finalizeByArbitrator(bytes32 question_id, bytes32 answer);
    function claimBond(bytes32 answer_id);
    function sendCallback(bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty);
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, bytes32 evidence) returns (bytes32);
}

contract Arbitrator {

    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function Arbitrator() {
        owner = msg.sender;
    }

    function getFee(bytes32 question_id) constant returns (uint256) {
        return 100;
    }

    function claimBond(address realitycheck, bytes32 answer_id) onlyOwner {
        RealityCheckAPI(realitycheck).claimBond(answer_id);
    }

    function sendCallback(address realitycheck, bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty) onlyOwner {
        RealityCheckAPI(realitycheck).sendCallback(question_id, client_ctrct, gas, no_bounty);
    }

    function submitAnswerByArbitrator(address realitycheck, bytes32 question_id, bytes32 answer, bytes32 evidence) onlyOwner returns (bytes32) {
        return RealityCheckAPI(realitycheck).submitAnswerByArbitrator(question_id, answer, evidence);
    }

}
