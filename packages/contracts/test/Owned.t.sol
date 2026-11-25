// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Owned} from "../src/Owned.sol";

/// Unit test for the OwnershipTransferred event on Owned (base of Arbitrator).
contract OwnedTest is Test {
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function test_constructor_emits_from_zero_and_sets_owner() public {
        vm.expectEmit(true, true, false, true);
        emit OwnershipTransferred(address(0), address(this));
        Owned o = new Owned();
        assertEq(o.owner(), address(this));
    }

    function test_transfer_emits_and_updates_owner() public {
        Owned o = new Owned();
        address newOwner = address(0xBEEF);

        vm.expectEmit(true, true, false, true);
        emit OwnershipTransferred(address(this), newOwner);
        o.transferOwnership(newOwner);

        assertEq(o.owner(), newOwner);
    }

    function test_only_owner_can_transfer() public {
        Owned o = new Owned();
        vm.prank(address(0xBAD));
        vm.expectRevert();
        o.transferOwnership(address(0xBAD));
    }
}
