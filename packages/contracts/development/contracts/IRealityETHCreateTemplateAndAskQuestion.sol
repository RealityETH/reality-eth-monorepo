// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

// This function was removed from reality.eth in version 4.
interface IRealityETHCreateTemplateAndAskQuestion {
    function createTemplateAndAskQuestion(string calldata content, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) external payable returns (bytes32);
}
