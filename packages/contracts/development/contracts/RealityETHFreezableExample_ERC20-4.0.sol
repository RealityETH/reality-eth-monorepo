// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import {RealityETHFreezable_ERC20} from "./RealityETHFreezable_ERC20.sol";

/*
 * This contract is designed for testing the abstract contract RealityETHFreezable_ERC20.
 * It should not be used as is because anyone can call setFreezeTimestamp.
 */

// solhint-disable-next-line contract-name-camelcase
contract RealityETHFreezableExample_ERC20_v4_0 is RealityETHFreezable_ERC20 {
    function setFreezeTimestamp(uint32 _freeze_ts) external {
        freeze_ts = _freeze_ts;
    }
}
