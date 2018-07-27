pragma solidity ^0.4.6;

import './SafeMath.sol';
import './BalanceHolder.sol';

contract RealityCheckAPI {
    function getFinalAnswerIfMatches(bytes32 question_id, bytes32 content_hash, address arbitrator, uint256 min_timeout, uint256 min_bond) public returns (bytes32);
}

contract FireInsuranceExample is BalanceHolder {

    using SafeMath for uint256;

    struct Policy {
        address realitycheck;
        bytes32 content_hash; 
        address arbitrator;
        uint256 min_timeout; 
        uint256 min_bond;
        address insuree;
        uint256 coverage_period;
        uint256 premium;
        uint256 face_value;
        uint256 coverage_start;
        address insurer;
    }
    mapping(bytes32 => Policy) policies;

    function requestPolicy(
        address realitycheck, 
        bytes32 content_hash, 
        address arbitrator, 
        uint256 min_timeout, 
        uint256 min_bond,
        uint256 coverage_period,
        uint256 face_value
    ) 
    payable public returns (bytes32) {
        bytes32 policy_id = keccak256(realitycheck, content_hash, arbitrator, min_timeout, min_bond, msg.sender, msg.value, coverage_period, face_value);
        policies[policy_id] = Policy(
            realitycheck, 
            content_hash, 
            arbitrator, 
            min_timeout, 
            min_bond,
            msg.sender,
            coverage_period,
            msg.value,
            face_value,
            0,
            0x0
        );
        return policy_id;
    }

    function providePolicy(bytes32 policy_id) 
    payable public
    {
        require(policies[policy_id].premium > 0); 
        require(policies[policy_id].face_value == 0); 
        require(msg.value >= policies[policy_id].face_value);
        policies[policy_id].face_value = msg.value;
        policies[policy_id].coverage_start = now;
    }

    function cancelPolicyRequest(bytes32 policy_id) 
    public {
        require(policies[policy_id].premium > 0);
        require(policies[policy_id].face_value == 0);
        require(policies[policy_id].insuree == msg.sender);
        balanceOf[msg.sender] = balanceOf[msg.sender].add(policies[policy_id].premium);
        delete policies[policy_id];
    }

    function claim(bytes32 policy_id, bytes32 question_id) 
    public {
        require(policies[policy_id].face_value > 0);
        require(now <= policies[policy_id].coverage_start + policies[policy_id].coverage_period);
        bytes32 response = RealityCheckAPI(policies[policy_id].realitycheck).getFinalAnswerIfMatches(
            question_id,
            policies[policy_id].content_hash,
            policies[policy_id].arbitrator,
            policies[policy_id].min_timeout,
            policies[policy_id].min_bond
        );
        require(uint256(response) == 1);
        address insuree = policies[policy_id].insuree;
        assert(insuree != 0x0);
        balanceOf[insuree] = balanceOf[insuree].add(policies[policy_id].face_value);
        delete policies[policy_id];
    }

    function complete(bytes32 policy_id) 
    public {
        require(now > policies[policy_id].coverage_start + policies[policy_id].coverage_period);
        uint256 face_value = policies[policy_id].face_value;
        uint256 premium = policies[policy_id].premium;
        address insurer = policies[policy_id].insurer;
        require(face_value > 0);
        require(premium > 0);
        assert(insurer != 0x0);
        balanceOf[insurer] = balanceOf[insurer].add(premium).add(face_value);
        delete policies[policy_id];
    }

}
