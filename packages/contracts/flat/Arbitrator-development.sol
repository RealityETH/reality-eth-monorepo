// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

interface IBalanceHolder {
  function withdraw (  ) external;
  function balanceOf ( address ) external view returns ( uint256 );
}

interface IRealityETH is IBalanceHolder {
     event LogAnswerReveal (bytes32 indexed question_id, address indexed user, bytes32 indexed answer_hash, bytes32 answer, uint256 nonce, uint256 bond);
     event LogCancelArbitration (bytes32 indexed question_id);
     event LogClaim (bytes32 indexed question_id, address indexed user, uint256 amount);
     event LogFinalize (bytes32 indexed question_id, bytes32 indexed answer);
     event LogFundAnswerBounty (bytes32 indexed question_id, uint256 bounty_added, uint256 bounty, address indexed user);
     event LogMinimumBond (bytes32 indexed question_id, uint256 min_bond);
     event LogNewAnswer (bytes32 answer, bytes32 indexed question_id, bytes32 history_hash, address indexed user, uint256 bond, uint256 ts, bool is_commitment);
     event LogNewQuestion (bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created);
     event LogNewTemplate (uint256 indexed template_id, address indexed user, string question_text);
     event LogNotifyOfArbitrationRequest (bytes32 indexed question_id, address indexed user);
     event LogReopenQuestion (bytes32 indexed question_id, bytes32 indexed reopened_question_id);
     event LogSetQuestionFee (address arbitrator, uint256 amount);

     function assignWinnerAndSubmitAnswerByArbitrator (bytes32 question_id, bytes32 answer, address payee_if_wrong, bytes32 last_history_hash, bytes32 last_answer_or_commitment_id, address last_answerer) external;
     function cancelArbitration (bytes32 question_id) external;
     function claimMultipleAndWithdrawBalance (bytes32[] calldata question_ids, uint256[] calldata lengths, bytes32[] calldata hist_hashes, address[] calldata addrs, uint256[] calldata bonds, bytes32[] calldata answers) external;
     function claimWinnings (bytes32 question_id, bytes32[] calldata history_hashes, address[] calldata addrs, uint256[] calldata bonds, bytes32[] calldata answers) external;
     function createTemplate (string calldata content) external returns (uint256);
     function notifyOfArbitrationRequest (bytes32 question_id, address requester, uint256 max_previous) external;
     function setQuestionFee (uint256 fee) external;
     function submitAnswerByArbitrator (bytes32 question_id, bytes32 answer, address answerer) external;
     function submitAnswerReveal (bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond) external;
     function askQuestion (uint256 template_id, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) external payable returns (bytes32);
     function askQuestionWithMinBond (uint256 template_id, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond) external payable returns (bytes32);
     function createTemplateAndAskQuestion (string calldata content, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) external payable returns (bytes32);
     function fundAnswerBounty (bytes32 question_id) external payable;
     function reopenQuestion (uint256 template_id, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond, bytes32 reopens_question_id) external payable returns (bytes32);
     function submitAnswer (bytes32 question_id, bytes32 answer, uint256 max_previous) external payable;
     function submitAnswerCommitment (bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer) external payable;
     function submitAnswerFor (bytes32 question_id, bytes32 answer, uint256 max_previous, address answerer) external payable;
     function arbitrator_question_fees (address) external view returns (uint256);
     function commitments (bytes32) external view returns (uint32 reveal_ts, bool is_revealed, bytes32 revealed_answer);
     function getArbitrator (bytes32 question_id) external view returns (address);
     function getBestAnswer (bytes32 question_id) external view returns (bytes32);
     function getBond (bytes32 question_id) external view returns (uint256);
     function getBounty (bytes32 question_id) external view returns (uint256);
     function getContentHash (bytes32 question_id) external view returns (bytes32);
     function getFinalAnswer (bytes32 question_id) external view returns (bytes32);
     function getFinalAnswerIfMatches (bytes32 question_id, bytes32 content_hash, address arbitrator, uint32 min_timeout, uint256 min_bond) external view returns (bytes32);
     function getFinalizeTS (bytes32 question_id) external view returns (uint32);
     function getHistoryHash (bytes32 question_id) external view returns (bytes32);
     function getMinBond (bytes32 question_id) external view returns (uint256);
     function getOpeningTS (bytes32 question_id) external view returns (uint32);
     function getTimeout (bytes32 question_id) external view returns (uint32);
     function isFinalized (bytes32 question_id) external view returns (bool);
     function isPendingArbitration (bytes32 question_id) external view returns (bool);
     function isSettledTooSoon (bytes32 question_id) external view returns (bool);
     function question_claims (bytes32) external view returns (address payee, uint256 last_bond, uint256 queued_funds);
     function questions (bytes32) external view returns (bytes32 content_hash, address arbitrator, uint32 opening_ts, uint32 timeout, uint32 finalize_ts, bool is_pending_arbitration, uint256 bounty, bytes32 best_answer, bytes32 history_hash, uint256 bond, uint256 min_bond);
     function reopened_questions (bytes32) external view returns (bytes32);
     function reopener_questions (bytes32) external view returns (bool);
     function resultFor (bytes32 question_id) external view returns (bytes32);
     function resultForOnceSettled (bytes32 question_id) external view returns (bytes32);
     function template_hashes (uint256) external view returns (bytes32);
     function templates (uint256) external view returns (uint256);
}

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);

    function decimals() external returns (uint8); 

    function name() external returns (string memory); 

    function symbol() external returns (string memory); 

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IOwned {
  function owner (  ) external view returns ( address );
  function transferOwnership ( address newOwner ) external;
}

contract Owned is IOwned {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) 
        onlyOwner 
    external {
        owner = newOwner;
    }
}

interface IArbitrator {
  function metadata (  ) external view returns ( string memory );
  function arbitration_bounties ( bytes32 ) external view returns ( uint256 );
  function realitio (  ) external view returns ( IRealityETH );
  function realitycheck (  ) external view returns ( IRealityETH );
  function setRealitio ( address addr ) external;
  function setDisputeFee ( uint256 fee ) external;
  function setCustomDisputeFee ( bytes32 question_id, uint256 fee ) external;
  function getDisputeFee ( bytes32 question_id ) external view returns ( uint256 );
  function setQuestionFee ( uint256 fee ) external;
  function submitAnswerByArbitrator ( bytes32 question_id, bytes32 answer, address answerer ) external;
  function requestArbitration ( bytes32 question_id, uint256 max_previous ) external payable returns ( bool );
  function withdraw ( address addr ) external;
  function withdrawERC20 ( IERC20 _token, address addr ) external;
  function callWithdraw (  ) external;
  function setMetaData ( string memory _metadata ) external;
}

contract Arbitrator is Owned, IArbitrator {

    IRealityETH public realitio;

    mapping(bytes32 => uint256) public arbitration_bounties;

    uint256 dispute_fee;
    mapping(bytes32 => uint256) custom_dispute_fees;

    string public metadata;

    event LogRequestArbitration(
        bytes32 indexed question_id,
        uint256 fee_paid,
        address requester,
        uint256 remaining
    );

    event LogSetRealitio(
        address realitio
    );

    event LogSetQuestionFee(
        uint256 fee
    );


    event LogSetDisputeFee(
        uint256 fee
    );

    event LogSetCustomDisputeFee(
        bytes32 indexed question_id,
        uint256 fee
    );

    /// @notice Constructor. Sets the deploying address as owner.
    constructor() {
        owner = msg.sender;
    }

    /// @notice Returns the Realitio contract address - deprecated in favour of realitio()
    function realitycheck() 
    external view returns(IRealityETH) {
        return realitio;
    }

    /// @notice Set the Reality Check contract address
    /// @param addr The address of the Reality Check contract
    function setRealitio(address addr) 
        onlyOwner 
    public {
        realitio = IRealityETH(addr);
        emit LogSetRealitio(addr);
    }

    /// @notice Set the default fee
    /// @param fee The default fee amount
    function setDisputeFee(uint256 fee) 
        onlyOwner 
    public {
        dispute_fee = fee;
        emit LogSetDisputeFee(fee);
    }

    /// @notice Set a custom fee for this particular question
    /// @param question_id The question in question
    /// @param fee The fee amount
    function setCustomDisputeFee(bytes32 question_id, uint256 fee) 
        onlyOwner 
    public {
        custom_dispute_fees[question_id] = fee;
        emit LogSetCustomDisputeFee(question_id, fee);
    }

    /// @notice Return the dispute fee for the specified question. 0 indicates that we won't arbitrate it.
    /// @param question_id The question in question
    /// @dev Uses a general default, but can be over-ridden on a question-by-question basis.
    function getDisputeFee(bytes32 question_id) 
    public view returns (uint256) {
        return (custom_dispute_fees[question_id] > 0) ? custom_dispute_fees[question_id] : dispute_fee;
    }

    /// @notice Set a fee for asking a question with us as the arbitrator
    /// @param fee The fee amount
    /// @dev Default is no fee. Unlike the dispute fee, 0 is an acceptable setting.
    /// You could set an impossibly high fee if you want to prevent us being used as arbitrator unless we submit the question.
    /// (Submitting the question ourselves is not implemented here.)
    /// This fee can be used as a revenue source, an anti-spam measure, or both.
    function setQuestionFee(uint256 fee) 
        onlyOwner 
    public {
        realitio.setQuestionFee(fee);
        emit LogSetQuestionFee(fee);
    }

    /// @notice Submit the arbitrator's answer to a question.
    /// @param question_id The question in question
    /// @param answer The answer
    /// @param answerer The answerer. If arbitration changed the answer, it should be the payer. If not, the old answerer.
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer) 
        onlyOwner 
    public {
        delete arbitration_bounties[question_id];
        realitio.submitAnswerByArbitrator(question_id, answer, answerer);
    }

    /// @notice Submit the arbitrator's answer to a question, assigning the winner automatically.
    /// @param question_id The question in question
    /// @param answer The answer
    /// @param payee_if_wrong The account to by credited as winner if the last answer given is wrong, usually the account that paid the arbitrator
    /// @param last_history_hash The history hash before the final one
    /// @param last_answer_or_commitment_id The last answer given, or the commitment ID if it was a commitment.
    /// @param last_answerer The address that supplied the last answer
    function assignWinnerAndSubmitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address payee_if_wrong, bytes32 last_history_hash, bytes32 last_answer_or_commitment_id, address last_answerer) 
        onlyOwner 
    public {
        delete arbitration_bounties[question_id];
        realitio.assignWinnerAndSubmitAnswerByArbitrator(question_id, answer, payee_if_wrong, last_history_hash, last_answer_or_commitment_id, last_answerer);
    }

    /// @notice Cancel a previous arbitration request
    /// @dev This is intended for situations where the arbitration is happening non-atomically and the fee or something change.
    /// @param question_id The question in question
    function cancelArbitration(bytes32 question_id) 
        onlyOwner 
    public {
        realitio.cancelArbitration(question_id);
    }

    /// @notice Request arbitration, freezing the question until we send submitAnswerByArbitrator
    /// @dev The bounty can be paid only in part, in which case the last person to pay will be considered the payer
    /// Will trigger an error if the notification fails, eg because the question has already been finalized
    /// @param question_id The question in question
    /// @param max_previous If specified, reverts if a bond higher than this was submitted after you sent your transaction.
    function requestArbitration(bytes32 question_id, uint256 max_previous) 
    external payable returns (bool) {

        uint256 arbitration_fee = getDisputeFee(question_id);
        require(arbitration_fee > 0, "The arbitrator must have set a non-zero fee for the question");

        arbitration_bounties[question_id] += msg.value;
        uint256 paid = arbitration_bounties[question_id];

        if (paid >= arbitration_fee) {
            realitio.notifyOfArbitrationRequest(question_id, msg.sender, max_previous);
            emit LogRequestArbitration(question_id, msg.value, msg.sender, 0);
            return true;
        } else {
            require(!realitio.isFinalized(question_id), "The question must not have been finalized");
            emit LogRequestArbitration(question_id, msg.value, msg.sender, arbitration_fee - paid);
            return false;
        }

    }

    /// @notice Withdraw any accumulated ETH fees to the specified address
    /// @param addr The address to which the balance should be sent
    function withdraw(address addr) 
        onlyOwner 
    public {
        payable(addr).transfer(address(this).balance); 
    }

    /// @notice Withdraw any accumulated token fees to the specified address
    /// @param addr The address to which the balance should be sent
    /// @dev Only needed if the Realitio contract used is using an ERC20 token
    /// @dev Also only normally useful if a per-question fee is set, otherwise we only have ETH.
    function withdrawERC20(IERC20 _token, address addr) 
        onlyOwner 
    public {
        uint256 bal = _token.balanceOf(address(this));
        IERC20(_token).transfer(addr, bal); 
    }

    receive() 
    external payable {
    }

    /// @notice Withdraw any accumulated question fees from the specified address into this contract
    /// @dev Funds can then be liberated from this contract with our withdraw() function
    /// @dev This works in the same way whether the realitio contract is using ETH or an ERC20 token
    function callWithdraw() 
        onlyOwner 
    public {
        realitio.withdraw(); 
    }

    /// @notice Set a metadata string, expected to be JSON, containing things like arbitrator TOS address
    function setMetaData(string memory _metadata) 
        onlyOwner
    external {
        metadata = _metadata;
    }

}


