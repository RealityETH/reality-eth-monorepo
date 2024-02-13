// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETHErrors_ERC20} from "./IRealityETHErrors_ERC20.sol";
import {IERC20} from "./IERC20.sol";

/* solhint-disable func-name-mixedcase */

// solhint-disable-next-line contract-name-camelcase
interface IRealityETHCore_ERC20 is IRealityETHErrors_ERC20 {
    function askQuestion(uint256 template_id, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) external returns (bytes32);
    function askQuestionERC20(uint256 template_id, string calldata question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 tokens) external returns (bytes32);
    function askQuestionWithMinBondERC20(
        uint256 template_id,
        string calldata question,
        address arbitrator,
        uint32 timeout,
        uint32 opening_ts,
        uint256 nonce,
        uint256 min_bond,
        uint256 tokens
    ) external returns (bytes32);
    function fundAnswerBountyERC20(bytes32 question_id, uint256 tokens) external;
    function submitAnswerERC20(bytes32 question_id, bytes32 answer, uint256 max_previous, uint256 tokens) external;
    function submitAnswerForERC20(bytes32 question_id, bytes32 answer, uint256 max_previous, address answerer, uint256 tokens) external;
    function token() external view returns (IERC20);
}
