// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

interface IRealityETHFreezable {
    function freezeTs() external view returns (uint32);
}
