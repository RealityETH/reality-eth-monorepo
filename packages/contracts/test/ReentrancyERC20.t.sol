// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_ERC20_v4_0} from "../src/RealityETH_ERC20-4.0.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {MockReentrantERC20, IReentrancyHook} from "./mocks/MockReentrantERC20.sol";
import {AnswerType, Template} from "../src/RealityETHTypes.sol";

// Shared helpers for building v4 ask-time params/outcomes and a generalized bool template.
function _one(string memory s) pure returns (string[] memory a) {
    a = new string[](1);
    a[0] = s;
}

function _none() pure returns (string[] memory) {
    return new string[](0);
}

function _boolTpl() pure returns (Template memory) {
    return Template(
        AnswerType.Bool, 0, false, false, false, false, false, false, address(0), 0, _one(""), _none(), "", "", ""
    );
}

// Bool template that permits the ANSWERED_TOO_SOON sentinel (needed to settle a question "too soon").
function _boolTplTooSoon() pure returns (Template memory) {
    return
        Template(
            AnswerType.Bool, 0, true, false, false, false, false, false, address(0), 0, _one(""), _none(), "", "", ""
        );
}

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
        token = new MockReentrantERC20();
        rc = new RealityETH_ERC20_v4_0(IERC20(address(token)), address(0));

        uint256 tid = rc.createTemplate(_boolTpl());
        qid = rc.askQuestionERC20(tid, _one("question"), _none(), address(0), 30, 0, 0, 0);

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

interface IReopenTarget {
    function reopenQuestionERC20(
        uint256 templateId,
        string[] calldata params,
        string[] calldata outcomes,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond,
        bytes32 reopensQuestionId,
        uint256 tokens
    ) external returns (bytes32);
}

/// Attacker that re-enters reopenQuestionERC20 once (with a different nonce) from
/// the token transfer hook while the outer reopen is pulling its tokens.
contract ReentrantReopener is IReentrancyHook {
    IReopenTarget public immutable rc;
    MockReentrantERC20 public immutable token;

    uint256 internal templateId;
    string[] internal params;
    string[] internal outcomes;
    address internal arbitrator;
    uint32 internal timeout;
    uint32 internal openingTs;
    uint256 internal minBond;
    bytes32 internal reopensQuestionId;
    uint256 internal tokens;
    bool public reentered;

    constructor(address _rc, address _token) {
        rc = IReopenTarget(_rc);
        token = MockReentrantERC20(_token);
    }

    function approveToken() external {
        token.approve(address(rc), type(uint256).max);
    }

    function configure(
        uint256 _templateId,
        string[] memory _params,
        string[] memory _outcomes,
        address _arbitrator,
        uint32 _timeout,
        uint32 _openingTs,
        uint256 _minBond,
        bytes32 _reopensQuestionId,
        uint256 _tokens
    ) external {
        templateId = _templateId;
        params = _params;
        outcomes = _outcomes;
        arbitrator = _arbitrator;
        timeout = _timeout;
        openingTs = _openingTs;
        minBond = _minBond;
        reopensQuestionId = _reopensQuestionId;
        tokens = _tokens;
    }

    function attack() external {
        rc.reopenQuestionERC20(
            templateId, params, outcomes, arbitrator, timeout, openingTs, 1, minBond, reopensQuestionId, tokens
        );
    }

    function reentrancyHook() external {
        if (!reentered) {
            reentered = true;
            // Re-enter with a different nonce so it isn't a stateNotCreated collision.
            rc.reopenQuestionERC20(
                templateId, params, outcomes, arbitrator, timeout, openingTs, 2, minBond, reopensQuestionId, tokens
            );
        }
    }
}

/// Reentrancy regression test for the reopen path. reopenQuestionERC20 writes
/// reopenedQuestions only after the new question is created; if the token pull
/// happened before that write, a re-entrant reopen would see reopenedQuestions
/// still unset, pass the guards, and create a duplicate reopening / divert the
/// bounty. Pulling tokens last (CEI) makes the re-entrant reopen hit the guards.
contract ReopenReentrancyTest is Test {
    RealityETH_ERC20_v4_0 internal rc;
    MockReentrantERC20 internal token;
    ReentrantReopener internal attacker;

    bytes32 internal constant UNRESOLVED_ANSWER = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe;
    uint32 internal constant TIMEOUT = 30;

    bytes32 internal origQid;

    function setUp() public {
        token = new MockReentrantERC20();
        rc = new RealityETH_ERC20_v4_0(IERC20(address(token)), address(0));

        uint256 tid = rc.createTemplate(_boolTplTooSoon());

        // Original question with a bounty, answered "too soon" and finalized so it
        // is eligible to be reopened.
        token.mint(address(this), 1000e18);
        token.approve(address(rc), type(uint256).max);
        origQid = rc.askQuestionERC20(tid, _one("question"), _none(), address(0), TIMEOUT, 0, 0, 100e18);
        rc.submitAnswerERC20(origQid, UNRESOLVED_ANSWER, 0, 1e18);
        vm.warp(block.timestamp + TIMEOUT + 1);
        assertTrue(rc.isSettledTooSoon(origQid), "precondition: settled too soon");

        attacker = new ReentrantReopener(address(rc), address(token));
        token.mint(address(attacker), 1000e18);
        attacker.approveToken();
        // Reopen must match the original exactly except nonce/creator.
        attacker.configure(tid, _one("question"), _none(), address(0), TIMEOUT, 0, 0, origQid, 1e18);
    }

    /// Without reentrancy, a single reopen succeeds and is recorded.
    function test_reopen_ok() public {
        attacker.attack();
        assertTrue(rc.reopenedQuestions(origQid) != bytes32(0), "reopening recorded");
    }

    /// Re-entrant reopen during the token pull must revert: the outer call has
    /// already recorded reopenedQuestions, so the inner reopen hits a guard.
    function test_reentrant_reopen_reverts() public {
        token.setArmed(true);
        vm.expectRevert();
        attacker.attack();
    }
}
