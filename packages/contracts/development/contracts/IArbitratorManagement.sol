// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

import './IERC20.sol';
import './IOwned.sol';

interface IArbitratorManagement {
  function setRealitio ( address addr ) external;
  function setDisputeFee ( uint256 fee ) external;
  function setCustomDisputeFee ( bytes32 question_id, uint256 fee ) external;
  function setQuestionFee ( uint256 fee ) external;
  function submitAnswerByArbitrator ( bytes32 question_id, bytes32 answer, address answerer ) external;
  function withdraw ( address addr ) external;
  function withdrawERC20 ( IERC20 _token, address addr ) external;
  function callWithdraw (  ) external;
  function setMetaData ( string memory _metadata ) external;
}
