pragma solidity ^0.4.6;

contract RealityCheckAPI {
    function finalizeByArbitrator(bytes32 answer_id);
    function claimBond(bytes32 answer_id);
    function sendCallback(bytes32 question_id, address client_contract, uint256 gas, bool no_bounty);
    function submitAnswer(bytes32 question_id, uint256 answer, string evidence);
}

contract Arbitrator {

    address owner;

    modifier onlyOwner() {
        if (msg.sender != owner) throw;
        _;
    }

    function Arbitrator() {
        owner = msg.sender;
    }

    function getFee(bytes32 question_id) constant returns (uint256) {
        return 100000;
    }

    function claimBond(address realitycheck, bytes32 answer_id) onlyOwner {
        RealityCheckAPI(realitycheck).claimBond(answer_id);
    }

    function sendCallback(address realitycheck, bytes32 question_id, address client_contract, uint256 gas, bool no_bounty) onlyOwner {

        RealityCheckAPI(realitycheck).sendCallback(question_id, client_contract, gas, no_bounty);

    }

    function submitAnswer(address realitycheck, bytes32 question_id, uint256 answer, string evidence) onlyOwner {
        RealityCheckAPI(realitycheck).submitAnswer(question_id, answer, evidence);
    }

    function finalizeByArbitrator(address realitycheck, bytes32 answer_id) onlyOwner {
        RealityCheckAPI(realitycheck).finalizeByArbitrator(answer_id);
    }

}
