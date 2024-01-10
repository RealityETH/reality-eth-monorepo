// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

interface IOwned {
  function owner (  ) external view returns ( address );
  function transferOwnership ( address newOwner ) external;
}
