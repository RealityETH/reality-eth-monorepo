// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {RealityETHBase} from "./RealityETHBase.t.sol";
import {MockArbitrator} from "./mocks/MockArbitrator.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

/// Standard fixture mirroring the Python `setUp`: an arbitrator with a 100-unit
/// question fee, and one open question "my question" (template 0, timeout 30)
/// asked with 1100 so the resulting bounty is 1000. Works for both the ETH and
/// ERC20 contract families — all payment operations route through branching
/// helpers (_ask/_submit/_fund/...), the Solidity equivalent of the Python
/// `if ERC20:` branches.
abstract contract RealityETHStd is RealityETHBase {
    MockArbitrator internal arb;
    MockERC20 internal token; // only set for ERC20 variants
    bytes32 internal question_id;

    uint32 internal constant TIMEOUT = 30;
    uint256 internal constant QUESTION_FEE = 100;
    uint256 internal constant TOKEN_SUPPLY = 1e24;

    function setUp() public virtual override {
        super.setUp();
        // pre-v3 struct/id layout handled separately; skip cleanly for now.
        if (versionNum < 30) {
            vm.skip(true);
            return;
        }

        arb = new MockArbitrator();
        arb.setRealitio(address(rc));
        arb.setDisputeFee(10000000000000000);

        if (isERC20) {
            token = new MockERC20();
            rc.setToken(address(token));
            token.mint(address(this), TOKEN_SUPPLY);
            token.approve(address(rc), type(uint256).max);
        }
        arb.setQuestionFee(QUESTION_FEE);

        question_id = _ask(address(this), 0, "my question", address(arb), TIMEOUT, 0, 0, 1100);

        // mirror the sanity asserts in the Python setUp
        (, address arbitrator,, uint32 timeout, uint32 finalizeTs,, uint256 bounty,,,,) = rc.questions(question_id);
        assertEq(arbitrator, address(arb), "arbitrator");
        assertEq(uint256(timeout), uint256(TIMEOUT), "timeout");
        assertEq(uint256(finalizeTs), 0, "finalize ts should start at 0");
        assertEq(bounty, 1000, "bounty should be 1000 after the 100 fee");
    }

    // ---------------------------------------------------------------------
    // payment helpers: ETH uses msg.value; ERC20 mints+approves then passes
    // the amount. Each acts as `sender`.
    // ---------------------------------------------------------------------
    function _prepERC20(address sender, uint256 amount) private {
        token.mint(sender, amount);
        vm.prank(sender);
        token.approve(address(rc), type(uint256).max);
    }

    function _ask(
        address sender,
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 bounty
    ) internal returns (bytes32) {
        if (isERC20) {
            _prepERC20(sender, bounty);
            vm.prank(sender);
            return rc.askQuestionERC20(templateId, question, arbitrator, timeout, openingTs, nonce, bounty);
        }
        vm.deal(sender, sender.balance + bounty);
        vm.prank(sender);
        return rc.askQuestion{value: bounty}(templateId, question, arbitrator, timeout, openingTs, nonce);
    }

    function _askMinBond(
        address sender,
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond,
        uint256 bounty
    ) internal returns (bytes32) {
        if (isERC20) {
            _prepERC20(sender, bounty);
            vm.prank(sender);
            return rc.askQuestionWithMinBondERC20(
                templateId, question, arbitrator, timeout, openingTs, nonce, minBond, bounty
            );
        }
        vm.deal(sender, sender.balance + bounty);
        vm.prank(sender);
        return rc.askQuestionWithMinBond{value: bounty}(templateId, question, arbitrator, timeout, openingTs, nonce, minBond);
    }

    function _reopen(
        address sender,
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond,
        bytes32 reopens,
        uint256 bounty
    ) internal returns (bytes32) {
        if (isERC20) {
            _prepERC20(sender, bounty);
            vm.prank(sender);
            return rc.reopenQuestionERC20(templateId, question, arbitrator, timeout, openingTs, nonce, minBond, reopens, bounty);
        }
        vm.deal(sender, sender.balance + bounty);
        vm.prank(sender);
        return rc.reopenQuestion{value: bounty}(templateId, question, arbitrator, timeout, openingTs, nonce, minBond, reopens);
    }

    function _fund(address sender, bytes32 qid, uint256 amount) internal {
        if (isERC20) {
            _prepERC20(sender, amount);
            vm.prank(sender);
            rc.fundAnswerBountyERC20(qid, amount);
        } else {
            vm.deal(sender, sender.balance + amount);
            vm.prank(sender);
            rc.fundAnswerBounty{value: amount}(qid);
        }
    }

    function _submitFor(address sender, bytes32 qid, uint256 ansVal, uint256 maxLast, address answerer, uint256 bond)
        internal
    {
        if (isERC20) {
            _prepERC20(sender, bond);
            vm.prank(sender);
            rc.submitAnswerForERC20(qid, _answer(ansVal), maxLast, answerer, bond);
        } else {
            vm.deal(sender, sender.balance + bond);
            vm.prank(sender);
            rc.submitAnswerFor{value: bond}(qid, _answer(ansVal), maxLast, answerer);
        }
    }

    // external (withdrawable) balance of an account: tokens for ERC20, else ETH
    function _extBalance(address who) internal view returns (uint256) {
        return isERC20 ? token.balanceOf(who) : who.balance;
    }

    // expect-revert variants (payment must be prepped before vm.expectRevert so
    // the revert target is the ask/submit call itself). All act as address(this).
    function _submitRevert(bytes32 qid, uint256 ansVal, uint256 maxLast, uint256 bond) internal {
        if (isERC20) {
            token.mint(address(this), bond);
            token.approve(address(rc), type(uint256).max);
            vm.expectRevert();
            rc.submitAnswerERC20(qid, _answer(ansVal), maxLast, bond);
        } else {
            vm.expectRevert();
            rc.submitAnswer{value: bond}(qid, _answer(ansVal), maxLast);
        }
    }

    function _submitForRevert(bytes32 qid, uint256 ansVal, uint256 maxLast, address answerer, uint256 bond) internal {
        if (isERC20) {
            token.mint(address(this), bond);
            token.approve(address(rc), type(uint256).max);
            vm.expectRevert();
            rc.submitAnswerForERC20(qid, _answer(ansVal), maxLast, answerer, bond);
        } else {
            vm.expectRevert();
            rc.submitAnswerFor{value: bond}(qid, _answer(ansVal), maxLast, answerer);
        }
    }

    function _askRevert(
        address sender,
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 bounty
    ) internal {
        if (isERC20) {
            token.mint(sender, bounty);
            vm.prank(sender);
            token.approve(address(rc), type(uint256).max);
            vm.expectRevert();
            vm.prank(sender);
            rc.askQuestionERC20(templateId, question, arbitrator, timeout, openingTs, nonce, bounty);
        } else {
            vm.deal(sender, sender.balance + bounty);
            vm.expectRevert();
            vm.prank(sender);
            rc.askQuestion{value: bounty}(templateId, question, arbitrator, timeout, openingTs, nonce);
        }
    }

    function _reopenRevert(
        address sender,
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        uint256 minBond,
        bytes32 reopens,
        uint256 bounty
    ) internal {
        if (isERC20) {
            token.mint(sender, bounty);
            vm.prank(sender);
            token.approve(address(rc), type(uint256).max);
            vm.expectRevert();
            vm.prank(sender);
            rc.reopenQuestionERC20(templateId, question, arbitrator, timeout, openingTs, nonce, minBond, reopens, bounty);
        } else {
            vm.deal(sender, sender.balance + bounty);
            vm.expectRevert();
            vm.prank(sender);
            rc.reopenQuestion{value: bounty}(templateId, question, arbitrator, timeout, openingTs, nonce, minBond, reopens);
        }
    }

    // ---------------------------------------------------------------------
    // answer-history tracking — Solidity equivalent of the Python
    // submitAnswerReturnUpdatedState. Stored chronologically (oldest first);
    // claim arrays are built newest-first as claimWinnings expects.
    // ---------------------------------------------------------------------
    bytes32[] internal hHash; // question history hash *before* each answer
    uint256[] internal hBond;
    bytes32[] internal hAnswer; // answer, or commitment id for commitments
    address[] internal hAddr;
    uint256[] internal hNonce; // commitment nonce (0 for plain answers)

    uint256 internal constant COMMIT_NONCE = 1234;

    function _histHash(bytes32 qid) internal view returns (bytes32 h) {
        (,,,,,,,, h,,) = rc.questions(qid);
    }

    function _submit(bytes32 qid, uint256 ansVal, uint256 maxLast, uint256 bond, address sender) internal {
        bytes32 beforeHash = _histHash(qid);
        if (isERC20) {
            _prepERC20(sender, bond);
            vm.prank(sender);
            rc.submitAnswerERC20(qid, _answer(ansVal), maxLast, bond);
        } else {
            vm.deal(sender, bond + 1 ether);
            vm.prank(sender);
            rc.submitAnswer{value: bond}(qid, _answer(ansVal), maxLast);
        }
        hHash.push(beforeHash);
        hBond.push(bond);
        hAnswer.push(_answer(ansVal));
        hAddr.push(sender);
        hNonce.push(0);
    }

    function _submitCommit(bytes32 qid, uint256 ansVal, uint256 maxLast, uint256 bond, address sender)
        internal
        returns (uint256)
    {
        return _submitCommitAs(qid, ansVal, maxLast, bond, sender, sender);
    }

    // `answerer` is the address passed to submitAnswerCommitment (address(0) for
    // the "skip sender" case, where RealityETH falls back to msg.sender).
    function _submitCommitAs(bytes32 qid, uint256 ansVal, uint256 maxLast, uint256 bond, address sender, address answerer)
        internal
        returns (uint256)
    {
        bytes32 beforeHash = _histHash(qid);
        bytes32 answerHash = _answerHash(_answer(ansVal), COMMIT_NONCE);
        bytes32 commitmentId = _commitmentId(qid, answerHash, bond);
        if (isERC20) {
            _prepERC20(sender, bond);
            vm.prank(sender);
            rc.submitAnswerCommitmentERC20(qid, answerHash, maxLast, answerer, bond);
        } else {
            vm.deal(sender, bond + 1 ether);
            vm.prank(sender);
            rc.submitAnswerCommitment{value: bond}(qid, answerHash, maxLast, answerer);
        }
        hHash.push(beforeHash);
        hBond.push(bond);
        hAnswer.push(commitmentId);
        hAddr.push(sender);
        hNonce.push(COMMIT_NONCE);
        return COMMIT_NONCE;
    }

    function _reveal(bytes32 qid, uint256 ansVal, uint256 nonce, uint256 bond, address sender) internal {
        vm.prank(sender);
        rc.submitAnswerReveal(qid, _answer(ansVal), nonce, bond);
    }

    function _lastHistBefore() internal view returns (bytes32) {
        return hHash[hHash.length - 1];
    }

    function _lastAnswer() internal view returns (bytes32) {
        return hAnswer[hAnswer.length - 1];
    }

    function _lastAddr() internal view returns (address) {
        return hAddr[hAddr.length - 1];
    }

    function _buildClaim(bytes32 arbHash, uint256 arbBond, bytes32 arbAnswer, address arbAddr)
        internal
        view
        returns (bytes32[] memory hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers)
    {
        uint256 n = hHash.length;
        hashes = new bytes32[](n + 1);
        addrs = new address[](n + 1);
        bonds = new uint256[](n + 1);
        answers = new bytes32[](n + 1);
        hashes[0] = arbHash;
        addrs[0] = arbAddr;
        bonds[0] = arbBond;
        answers[0] = arbAnswer;
        for (uint256 i = 0; i < n; i++) {
            uint256 src = n - 1 - i;
            hashes[1 + i] = hHash[src];
            addrs[1 + i] = hAddr[src];
            bonds[1 + i] = hBond[src];
            answers[1 + i] = hAnswer[src];
        }
    }

    function _buildClaimNoArb()
        internal
        view
        returns (bytes32[] memory hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers)
    {
        return _claimSlice(0, hHash.length);
    }

    // newest-first claim arrays for the half-open range [from, to) of answers
    // (used by the split-over-transactions tests, mirroring Python st[:2]/st[2:]).
    function _claimSlice(uint256 from, uint256 to)
        internal
        view
        returns (bytes32[] memory hashes, address[] memory addrs, uint256[] memory bonds, bytes32[] memory answers)
    {
        uint256 n = hHash.length;
        uint256 m = to - from;
        hashes = new bytes32[](m);
        addrs = new address[](m);
        bonds = new uint256[](m);
        answers = new bytes32[](m);
        for (uint256 j = 0; j < m; j++) {
            uint256 src = n - 1 - (from + j);
            hashes[j] = hHash[src];
            addrs[j] = hAddr[src];
            bonds[j] = hBond[src];
            answers[j] = hAnswer[src];
        }
    }
}
