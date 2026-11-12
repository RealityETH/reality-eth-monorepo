// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IArbitrator} from "./interfaces/IArbitrator.sol";
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

    /// @notice Returns the Realitio contract address - deprecated in favour of realitio()
    function realitycheck() external view returns (IRealityETH) {
        return realitio;
    }

    /// @notice Set the Reality Check contract address
    /// @param addr The address of the Reality Check contract
    function setRealitio(address addr) public onlyOwner {
        realitio = IRealityETH(addr);
        emit LogSetRealitio(addr);
    }

    /// @notice Set the default fee
    /// @param fee The default fee amount
    function setDisputeFee(uint256 fee) public onlyOwner {
        disputeFee = fee;
        emit LogSetDisputeFee(fee);
    }

    /// @notice Set a custom fee for this particular question
    /// @param questionId The question in question
    /// @param fee The fee amount
    function setCustomDisputeFee(bytes32 questionId, uint256 fee) public onlyOwner {
        customDisputeFees[questionId] = fee;
        emit LogSetCustomDisputeFee(questionId, fee);
    }

    /// @notice Return the dispute fee for the specified question. 0 indicates that we won't arbitrate it.
    /// @param questionId The question in question
    /// @dev Uses a general default, but can be over-ridden on a question-by-question basis.
    function getDisputeFee(bytes32 questionId) public view returns (uint256) {
        return (customDisputeFees[questionId] > 0) ? customDisputeFees[questionId] : disputeFee;
    }

    /// @notice Set a fee for asking a question with us as the arbitrator
    /// @param fee The fee amount
    /// @dev Default is no fee. Unlike the dispute fee, 0 is an acceptable setting.
    /// You could set an impossibly high fee if you want to prevent us being used as arbitrator unless we submit the question.
    /// (Submitting the question ourselves is not implemented here.)
    /// This fee can be used as a revenue source, an anti-spam measure, or both.
    function setQuestionFee(uint256 fee) public onlyOwner {
        realitio.setQuestionFee(fee);
        emit LogSetQuestionFee(fee);
    }

    /// @notice Submit the arbitrator's answer to a question.
    /// @param questionId The question in question
    /// @param answer The answer
    /// @param answerer The answerer. If arbitration changed the answer, it should be the payer. If not, the old answerer.
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

    /// @notice Request arbitration, freezing the question until we send submitAnswerByArbitrator
    /// @dev The bounty can be paid only in part, in which case the last person to pay will be considered the payer
    /// Will trigger an error if the notification fails, eg because the question has already been finalized
    /// @param questionId The question in question
    /// @param maxPrevious If specified, reverts if a bond higher than this was submitted after you sent your transaction.
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

    /// @notice Withdraw any accumulated ETH fees to the specified address
    /// @param addr The address to which the balance should be sent
    function withdraw(address addr) public onlyOwner {
        payable(addr).transfer(address(this).balance);
    }

    /// @notice Withdraw any accumulated token fees to the specified address
    /// @param addr The address to which the balance should be sent
    /// @dev Only needed if the Realitio contract used is using an ERC20 token
    /// @dev Also only normally useful if a per-question fee is set, otherwise we only have ETH.
    function withdrawERC20(IERC20 _token, address addr) public onlyOwner {
        uint256 bal = _token.balanceOf(address(this));
        IERC20(_token).transfer(addr, bal);
    }

    receive() external payable {}

    /// @notice Withdraw any accumulated question fees from the specified address into this contract
    /// @dev Funds can then be liberated from this contract with our withdraw() function
    /// @dev This works in the same way whether the realitio contract is using ETH or an ERC20 token
    function callWithdraw() public onlyOwner {
        realitio.withdraw();
    }

    /// @notice Set a metadata string, expected to be JSON, containing things like arbitrator TOS address
    function setMetaData(string memory _metadata) external onlyOwner {
        metadata = _metadata;
    }
}
