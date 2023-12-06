// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.10;

/*
This defines the features needed by a "foreign proxy" for a cross-chain arbitrator as created by Kleros, for example see
https://github.com/kleros/cross-chain-realitio-proxy

In this arrangement, the "foreign" side is deployed on the chain where reality.eth is, and the "home" side is deployed on the chain where Kleros is.

If you implement this you should also inherit and implement the functions in IArbitratorCoreRecommended, with the exception of requestArbitration() which is done on the other chain.

The metadata() string defined in IArbitratorCoreRecommended should return some JSON to tell the UI that it is dealing with a foreign proxy, like:
{ foreignProxy: true }
*/

interface IArbitratorForeignProxy {
  function foreignProxy() external returns (address);
  function foreignChainId() external returns (uint256);
}
