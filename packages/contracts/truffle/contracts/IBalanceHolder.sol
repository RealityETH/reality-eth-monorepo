pragma solidity ^0.4.25;

interface IBalanceHolder {
  function withdraw (  ) external;
  function balanceOf ( address ) external view returns ( uint256 );
}
