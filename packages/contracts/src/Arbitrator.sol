// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IArbitrator} from "./interfaces/IArbitrator.sol";
import {IArbitratorCore} from "./interfaces/IArbitratorCore.sol";
import {IArbitratorManagement} from "./interfaces/IArbitratorManagement.sol";
import {IArbitratorLegacy} from "./interfaces/IArbitratorLegacy.sol";
import {IRealityETH} from "./interfaces/IRealityETH.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {Owned} from "./Owned.sol";

contract Arbitrator is Owned, IArbitrator {
    IRealityETH public realitio;

    mapping(bytes32 questionId => uint256 bounty) public arbitrationBounties;

    uint256 disputeFee;
    mapping(bytes32 questionId => uint256 fee) customDisputeFees;

    string public metadata;

    /// @notice Constructor. Sets the deploying address as owner.
    constructor() {
        owner = msg.sender;
    }

    /// @inheritdoc IArbitratorLegacy
    function realitycheck() external view returns (IRealityETH) {
        return realitio;
    }

    /// @inheritdoc IArbitratorManagement
    function setRealitio(address addr) public onlyOwner {
        realitio = IRealityETH(addr);
        emit LogSetRealitio(addr);
    }

    /// @inheritdoc IArbitratorManagement
    function setDisputeFee(uint256 fee) public onlyOwner {
        disputeFee = fee;
        emit LogSetDisputeFee(fee);
    }

    /// @inheritdoc IArbitratorManagement
    function setCustomDisputeFee(bytes32 questionId, uint256 fee) public onlyOwner {
        customDisputeFees[questionId] = fee;
        emit LogSetCustomDisputeFee(questionId, fee);
    }

    /// @inheritdoc IArbitratorCore
    function getDisputeFee(bytes32 questionId) public view returns (uint256) {
        return (customDisputeFees[questionId] > 0) ? customDisputeFees[questionId] : disputeFee;
    }

    /// @inheritdoc IArbitratorManagement
    function submitAnswerByArbitrator(bytes32 questionId, bytes32 answer, address answerer) public onlyOwner {
        delete arbitrationBounties[questionId];
        realitio.submitAnswerByArbitrator(questionId, answer, answerer);
    }

    /// @notice Submit the arbitrator's answer to a question, assigning the winner automatically.
    /// @param questionId The question in question
    /// @param answer The answer
    /// @param payeeIfWrong The account to by credited as winner if the last answer given is wrong, usually the account that paid the arbitrator
    /// @param lastHistoryHash The history hash before the final one
    /// @param lastAnswerOrCommitmentId The last answer given, or the commitment ID if it was a commitment.
    /// @param lastAnswerer The address that supplied the last answer
    function assignWinnerAndSubmitAnswerByArbitrator(
        bytes32 questionId,
        bytes32 answer,
        address payeeIfWrong,
        bytes32 lastHistoryHash,
        bytes32 lastAnswerOrCommitmentId,
        address lastAnswerer
    ) public onlyOwner {
        delete arbitrationBounties[questionId];
        realitio.assignWinnerAndSubmitAnswerByArbitrator(questionId, answer, payeeIfWrong, lastHistoryHash, lastAnswerOrCommitmentId, lastAnswerer);
    }

    /// @notice Cancel a previous arbitration request
    /// @dev This is intended for situations where the arbitration is happening non-atomically and the fee or something change.
    /// @param questionId The question in question
    function cancelArbitration(bytes32 questionId) public onlyOwner {
        realitio.cancelArbitration(questionId);
    }

    /// @inheritdoc IArbitratorCore
    function requestArbitration(bytes32 questionId, uint256 maxPrevious) external payable returns (bool) {
        uint256 arbitrationFee = getDisputeFee(questionId);
        if (arbitrationFee == 0) revert TheArbitratorMustHaveSetANonZeroFeeForTheQuestion();

        arbitrationBounties[questionId] += msg.value;
        uint256 paid = arbitrationBounties[questionId];

        if (paid >= arbitrationFee) {
            realitio.notifyOfArbitrationRequest(questionId, msg.sender, maxPrevious);
            emit LogRequestArbitration(questionId, msg.value, msg.sender, 0);
            return true;
        } else {
            if (realitio.isFinalized(questionId)) revert TheQuestionMustNotHaveBeenFinalized();
            emit LogRequestArbitration(questionId, msg.value, msg.sender, arbitrationFee - paid);
            return false;
        }
    }

    /// @inheritdoc IArbitratorManagement
    function withdraw(address addr) public onlyOwner {
        if (addr == address(0)) revert RecipientMustNotBeZero();
        payable(addr).transfer(address(this).balance);
    }

    /// @inheritdoc IArbitratorManagement
    function withdrawERC20(IERC20 _token, address addr) public onlyOwner {
        uint256 bal = _token.balanceOf(address(this));
        if (!_token.transfer(addr, bal)) revert TokenTransferFailed();
    }

    receive() external payable {}

    /// @inheritdoc IArbitratorManagement
    function callWithdraw() public onlyOwner {
        realitio.withdraw();
    }

    /// @inheritdoc IArbitratorManagement
    function setMetaData(string memory _metadata) external onlyOwner {
        metadata = _metadata;
    }
}
