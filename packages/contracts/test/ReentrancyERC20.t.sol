// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_ERC20_v4_0} from "../src/RealityETH_ERC20-4.0.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {MockReentrantERC20, IReentrancyHook} from "./mocks/MockReentrantERC20.sol";

interface IReenterTarget {
    function submitAnswerERC20(bytes32 questionId, bytes32 answer, uint256 maxPrevious, uint256 tokens) external;
}

/// Attacker that re-enters submitAnswerERC20 once, from inside the token's
/// transfer hook, while it is itself the sender being charged.
contract ReentrantAttacker is IReentrancyHook {
    IReenterTarget public immutable rc;
    MockReentrantERC20 public immutable token;
    bytes32 public qid;
    bytes32 public constant ANSWER = bytes32(uint256(1));
    uint256 public reentryBond;
    bool public reentered;

    constructor(address _rc, address _token) {
        rc = IReenterTarget(_rc);
        token = MockReentrantERC20(_token);
    }

    function approveToken() external {
        token.approve(address(rc), type(uint256).max);
    }

    function setQuestion(bytes32 _qid) external {
        qid = _qid;
    }

    function setReentryBond(uint256 b) external {
        reentryBond = b;
    }

    function submit(uint256 tokens) external {
        rc.submitAnswerERC20(qid, ANSWER, 0, tokens);
    }

    function reentrancyHook() external {
        if (!reentered) {
            reentered = true;
            rc.submitAnswerERC20(qid, ANSWER, 0, reentryBond);
        }
    }
}

/// Reentrancy regression test for the ERC20 deposit path. The
/// `bondMustDoubleAndMatchMinimum` modifier reads `questions[questionId].bond`
/// at entry; if the token transfer (an external call) happens before the new
/// bond is written, a re-entrant answer sees the stale bond and bypasses the
/// "each bond must at least double the previous" rule. Checks-Effects-
/// Interactions ordering (write the bond, then pull tokens) closes that.
contract ReentrancyERC20Test is Test {
    RealityETH_ERC20_v4_0 internal rc;
    MockReentrantERC20 internal token;
    ReentrantAttacker internal attacker;

    uint256 internal constant B = 1e18; // baseline bond
    uint256 internal constant TWO_B = 2e18; // legitimately doubles B, but not 2*TWO_B

    bytes32 internal qid;

    function setUp() public {
        rc = new RealityETH_ERC20_v4_0();
        token = new MockReentrantERC20();
        rc.setToken(IERC20(address(token)));

        uint256 tid = rc.createTemplate("q");
        qid = rc.askQuestionERC20(tid, "question", address(0), 30, 0, 0, 0);

        attacker = new ReentrantAttacker(address(rc), address(token));
        token.mint(address(attacker), 100e18);
        attacker.approveToken();
        attacker.setQuestion(qid);

        // Establish a baseline answer so questions.bond == B.
        attacker.submit(B);
        assertEq(rc.getBond(qid), B, "baseline bond");
    }

    /// Done sequentially (no reentrancy), doubling to 2*B is a perfectly valid
    /// escalation — proves the revert in the reentrant case is about ordering,
    /// not about TWO_B being too small.
    function test_sequential_escalation_ok() public {
        attacker.submit(TWO_B);
        assertEq(rc.getBond(qid), TWO_B, "escalated bond");
    }

    /// The same TWO_B escalation attempted re-entrantly must revert: with CEI
    /// ordering the re-entrant answer sees bond == TWO_B (already written by the
    /// outer call) and is required to post >= 2*TWO_B, which it does not, so the
    /// whole transaction reverts. Without the fix the re-entrant call sees the
    /// stale bond B, passes the 2*B check, and the exploit succeeds (this test
    /// then fails on the missing revert).
    function test_reentrant_escalation_reverts() public {
        token.setArmed(true);
        attacker.setReentryBond(TWO_B);

        vm.expectRevert();
        attacker.submit(TWO_B);
    }
}
