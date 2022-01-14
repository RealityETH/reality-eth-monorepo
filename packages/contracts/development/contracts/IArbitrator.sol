// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

import './IRealityETH.sol';
import './IERC20.sol';
import './IOwned.sol';

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
