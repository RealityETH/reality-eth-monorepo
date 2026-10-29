// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {IRealityETH} from "../../src/IRealityETH.sol";

/// @dev Minimal arbitrator for the ported suite — the 0.8.20 equivalent of the
/// 0.4.25 RegisteredWalletArbitrator the Python tests deploy. It holds a dispute
/// fee (with optional per-question overrides), passes a question fee through to
/// RealityETH, and forwards the arbitrator answer/cancel calls (so msg.sender on
/// RealityETH is this arbitrator).
contract MockArbitrator {
    IRealityETH public realitio;
    uint256 public disputeFee;
    mapping(bytes32 => uint256) private customFee; // 0 == no override

    function setRealitio(address a) external {
        realitio = IRealityETH(a);
    }

    function setDisputeFee(uint256 f) external {
        disputeFee = f;
    }

    function setCustomDisputeFee(bytes32 questionId, uint256 f) external {
        customFee[questionId] = f;
    }

    function getDisputeFee(bytes32 questionId) public view returns (uint256) {
        uint256 c = customFee[questionId];
        return c == 0 ? disputeFee : c;
    }

    function setQuestionFee(uint256 fee) external {
        realitio.setQuestionFee(fee);
    }

    function requestArbitration(bytes32 questionId, uint256 maxPrevious) external payable returns (bool) {
        uint256 fee = getDisputeFee(questionId);
        require(fee > 0, "dispute fee must be nonzero");
        require(msg.value >= fee, "fee too low");
        realitio.notifyOfArbitrationRequest(questionId, msg.sender, maxPrevious);
        return true;
    }

    function submitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address answerer) external {
        realitio.submitAnswerByArbitrator(questionId, answer, answerer);
    }

    function assignWinnerAndSubmitAnswerByArbitrator(
        bytes32 questionId,
        bytes32 answer,
        address payeeIfWrong,
        bytes32 lastHistoryHash,
        bytes32 lastAnswerOrCommitmentId,
        address lastAnswerer
    ) external {
        realitio.assignWinnerAndSubmitAnswerByArbitrator(
            questionId, answer, payeeIfWrong, lastHistoryHash, lastAnswerOrCommitmentId, lastAnswerer
        );
    }

    function cancelArbitration(bytes32 questionId) external {
        realitio.cancelArbitration(questionId);
    }

    receive() external payable {}
}
