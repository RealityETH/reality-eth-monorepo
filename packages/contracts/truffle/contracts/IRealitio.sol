pragma solidity ^0.4.25;

interface IRealitio {
  function claimWinnings ( bytes32 question_id, bytes32[] history_hashes, address[] addrs, uint256[] bonds, bytes32[] answers ) external;
  function getFinalAnswerIfMatches ( bytes32 question_id, bytes32 content_hash, address arbitrator, uint32 min_timeout, uint256 min_bond ) external view returns ( bytes32 );
  function getBounty ( bytes32 question_id ) external view returns ( uint256 );
  function getArbitrator ( bytes32 question_id ) external view returns ( address );
  function getBond ( bytes32 question_id ) external view returns ( uint256 );
  function claimMultipleAndWithdrawBalance ( bytes32[] question_ids, uint256[] lengths, bytes32[] hist_hashes, address[] addrs, uint256[] bonds, bytes32[] answers ) external;
  function withdraw (  ) external;
  function submitAnswerReveal ( bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond ) external;
  function setQuestionFee ( uint256 fee ) external;
  function template_hashes ( uint256 ) external view returns ( bytes32 );
  function getContentHash ( bytes32 question_id ) external view returns ( bytes32 );
  function question_claims ( bytes32 ) external view returns ( address payee, uint256 last_bond, uint256 queued_funds );
  function fundAnswerBounty ( bytes32 question_id ) external payable;
  function arbitrator_question_fees ( address ) external view returns ( uint256 );
  function balanceOf ( address ) external view returns ( uint256 );
  function askQuestion ( uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce ) external payable returns ( bytes32 );
  function submitAnswer ( bytes32 question_id, bytes32 answer, uint256 max_previous ) external payable;
  function submitAnswerFor ( bytes32 question_id, bytes32 answer, uint256 max_previous, address answerer ) external payable; 
  function isFinalized ( bytes32 question_id ) external view returns ( bool );
  function getHistoryHash ( bytes32 question_id ) external view returns ( bytes32 );
  function commitments ( bytes32 ) external view returns ( uint32 reveal_ts, bool is_revealed, bytes32 revealed_answer );
  function createTemplate ( string content ) external returns ( uint256 );
  function getBestAnswer ( bytes32 question_id ) external view returns ( bytes32 );
  function isPendingArbitration ( bytes32 question_id ) external view returns ( bool );
  function questions ( bytes32 ) external view returns ( bytes32 content_hash, address arbitrator, uint32 opening_ts, uint32 timeout, uint32 finalize_ts, bool is_pending_arbitration, uint256 bounty, bytes32 best_answer, bytes32 history_hash, uint256 bond );
  function getOpeningTS ( bytes32 question_id ) external view returns ( uint32 );
  function getTimeout ( bytes32 question_id ) external view returns ( uint32 );
  function createTemplateAndAskQuestion ( string content, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce ) external payable returns ( bytes32 );
  function getFinalAnswer ( bytes32 question_id ) external view returns ( bytes32 );
  function getFinalizeTS ( bytes32 question_id ) external view returns ( uint32 );
  function templates ( uint256 ) external view returns ( uint256 );
  function resultFor ( bytes32 question_id ) external view returns ( bytes32 );
  function submitAnswerCommitment ( bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer ) external payable;
  function notifyOfArbitrationRequest ( bytes32 question_id, address requester, uint256 max_previous ) external;
  function submitAnswerByArbitrator ( bytes32 question_id, bytes32 answer, address answerer ) external;
  function assignWinnerAndSubmitAnswerByArbitrator( bytes32 question_id, bytes32 answer, address payee_if_wrong, bytes32 last_history_hash, bytes32 last_answer_or_commitment_id, address last_answerer ) external;
  function cancelArbitration(bytes32 question_id) external; // Only available from v2.1
}

