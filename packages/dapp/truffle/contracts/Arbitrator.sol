pragma solidity ^0.4.6;

contract RealityCheckAPI {
    function finalizeByArbitrator(bytes32 question_id, bytes32 answer);
    function claimBond(bytes32 answer_id);
    function sendCallback(bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty);
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer) returns (bytes32);
    function notifyOfArbitrationRequest(bytes32 question_id, address requester);
    function isFinalized(bytes32 question_id) returns (bool);
}

contract Arbitrator {

    address owner;
    mapping(bytes32 => uint256) public arbitration_bounties;

    event LogRequestArbitration(
        bytes32 indexed question_id,
        uint256 fee_paid,
        address requester,
        uint256 remaining
    );

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function Arbitrator() {
        owner = msg.sender;
    }

    function getFee(bytes32 question_id) constant returns (uint256) {
        return 10000000000000000; // 0.001 ETH
    }

    // TODO: Update this to claimWinnings, write tests
    function claimBond(address realitycheck, bytes32 answer_id) onlyOwner {
        RealityCheckAPI(realitycheck).claimBond(answer_id);
    }

    function sendCallback(address realitycheck, bytes32 question_id, address client_ctrct, uint256 gas, bool no_bounty) onlyOwner {
        RealityCheckAPI(realitycheck).sendCallback(question_id, client_ctrct, gas, no_bounty);
    }

    function submitAnswerByArbitrator(address realitycheck, bytes32 question_id, bytes32 answer, address answerer) onlyOwner returns (bytes32) {
        delete arbitration_bounties[question_id];
        return RealityCheckAPI(realitycheck).submitAnswerByArbitrator(question_id, answer, answerer);
    }

    // Sends money to the arbitration bounty last_bond, returns true if enough was paid to trigger arbitration
    // Will trigger an error if the notification fails, eg because the question has already been finalized
    function requestArbitration(address realitycheck, bytes32 question_id) 
        external
    payable returns (bool) {

        uint256 arbitration_fee = getFee(question_id);

        arbitration_bounties[question_id] += msg.value;
        uint256 paid = arbitration_bounties[question_id];

        if (paid >= arbitration_fee) {
            RealityCheckAPI(realitycheck).notifyOfArbitrationRequest(question_id, msg.sender);
            LogRequestArbitration(question_id, msg.value, msg.sender, 0);
            return true;
        } else {
            require(!RealityCheckAPI(realitycheck).isFinalized(question_id));
            LogRequestArbitration(question_id, msg.value, msg.sender, arbitration_fee - paid);
            return false;
        }

    }

    function withdraw(address addr) onlyOwner {
        addr.transfer(this.balance); 
    }

}
