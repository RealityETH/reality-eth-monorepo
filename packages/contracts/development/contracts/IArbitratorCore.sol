// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

import './IRealityETH.sol';

interface IArbitratorCore {
  function getDisputeFee ( bytes32 question_id ) external view returns ( uint256 );
  function metadata (  ) external view returns ( string memory );
  function realitio (  ) external view returns ( IRealityETH );
  function requestArbitration ( bytes32 question_id, uint256 max_previous ) external payable returns ( bool );
}
