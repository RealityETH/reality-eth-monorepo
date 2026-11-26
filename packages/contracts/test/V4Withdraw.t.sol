// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_v4_0} from "../src/RealityETH-4.0.sol";

// A withdrawal recipient whose receive() does an SSTORE, costing far more than transfer()'s 2300-gas
// stipend. withdraw() must use call (not transfer) for such a recipient to be payable.
contract GasHungryRecipient {
    RealityETH_v4_0 internal rc;
    uint256 public pings;

    constructor(RealityETH_v4_0 _rc) {
        rc = _rc;
    }

    receive() external payable {
        pings += 1; // > 2300 gas; a transfer()-based withdraw would revert here
    }

    function submit(bytes32 qid, bytes32 answer) external payable {
        rc.submitAnswer{value: msg.value}(qid, answer, 0);
    }

    function claim(
        bytes32 qid,
        bytes32[] calldata hh,
        address[] calldata ad,
        uint256[] calldata bo,
        bytes32[] calldata an
    ) external {
        rc.claimWinnings(qid, hh, ad, bo, an);
    }

    function doWithdraw() external {
        rc.withdraw();
    }
}

contract V4WithdrawTest is Test {
    RealityETH_v4_0 internal rc;
    address internal arb = address(0xA4B);

    function setUp() public {
        rc = new RealityETH_v4_0(address(0));
    }

    function _one(string memory s) internal pure returns (string[] memory a) {
        a = new string[](1);
        a[0] = s;
    }

    function _none() internal pure returns (string[] memory) {
        return new string[](0);
    }

    // A contract recipient whose receive() exceeds transfer()'s 2300-gas stipend can still withdraw,
    // because withdraw() uses call. (With the old transfer() this would revert and strand the funds.)
    function test_contract_recipient_can_withdraw() public {
        GasHungryRecipient r = new GasHungryRecipient(rc);
        vm.deal(address(r), 1 ether);

        bytes32 qid = rc.askQuestion(0, _one("Will it rain?"), _none(), arb, 30, 0, 0);
        r.submit{value: 100}(qid, bytes32(uint256(1))); // the single, winning answer
        vm.warp(block.timestamp + 31); // finalize

        // claim: a single-entry history terminating at the null hash
        bytes32[] memory hh = new bytes32[](1);
        hh[0] = bytes32(0);
        address[] memory ad = new address[](1);
        ad[0] = address(r);
        uint256[] memory bo = new uint256[](1);
        bo[0] = 100;
        bytes32[] memory an = new bytes32[](1);
        an[0] = bytes32(uint256(1));
        r.claim(qid, hh, ad, bo, an);
        assertEq(rc.balanceOf(address(r)), 100, "bond credited to the contract");

        uint256 beforeBal = address(r).balance;
        r.doWithdraw();
        assertEq(rc.balanceOf(address(r)), 0, "balance withdrawn");
        assertEq(address(r).balance, beforeBal + 100, "contract received the ETH");
        assertGt(r.pings(), 0, "receive() ran (more than the 2300-gas stipend)");
    }
}
