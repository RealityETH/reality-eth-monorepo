// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IRealityETHHarness} from "./interfaces/IRealityETHHarness.sol";
import {RealityETH_v4_0} from "../src/RealityETH-4.0.sol";
import {RealityETH_ERC20_v4_0} from "../src/RealityETH_ERC20-4.0.sol";
import {IRealityETHCore} from "../src/interfaces/IRealityETHCore.sol";
import {IRealityETHCore_ERC20} from "../src/interfaces/IRealityETHCore_ERC20.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {AnswerType, Template} from "../src/RealityETHTypes.sol";

/// @dev Base harness for the ported RealityETH suite.
///
/// Mirrors the Python tests' `REALITYETH` env-var approach: the contract-under-
/// test is selected at runtime (default RealityETH-3.0) and deployed from its
/// committed creation bytecode under ./bytecode, then driven through the
/// {IRealityETHHarness} superset interface. Per-version feature flags gate tests the
/// same way the Python suite skips unsupported features.
abstract contract RealityETHBase is Test {
    IRealityETHHarness internal rc;

    string internal contractName;
    uint256 internal versionNum; // 20, 21, 22, 30, 32, 40
    bool internal isERC20;

    // feature flags (see _configureVersion)
    bool internal commitRevealSupported;
    bool internal answererAssignmentSupported; // submitAnswerFor / assignWinner / cancelArbitration (2.1+)
    bool internal reopenSupported; // 3.0+
    bool internal minBondSupported; // 3.0+
    bool internal settledTooSoonSupported; // isSettledTooSoon / resultForOnceSettled (3.0+)
    bool internal questionFeeSupported; // arbitrator per-question fee (removed in 4.0)
    bool internal createdBlockSupported; // question createdBlock field (added in 4.0)
    uint256 internal claimFeeDivisor; // 40 (2.5% burn) for >=2.1, else 0
    // v4 credits the bond-claim fee (and no-arbitrator bond-tier fee) to this treasury instead of
    // burning it; set on the v4 instances so the matrix exercises the redirect (earlier versions ignore it).
    address internal constant TREASURY = address(0x7EA5);

    // 4.0 validates answers by the template's answer type, and templates/questions use a structured
    // ABI (string[] params/outcomes) rather than a question string. The ported suite asks generic
    // questions on template 0 with arbitrary uint answers (and occasionally the ANSWERED_TOO_SOON
    // sentinel). So on 4.0 we create one freeform template -- Uint (accepts any bytes32) with
    // hasAnsweredTooSoon enabled -- and the ask/hash helpers substitute it for template id 0. The
    // mechanics under test (bonds, claims, arbitration, reopening) are answer-type-agnostic.
    uint256 internal freeformTemplateId;

    function setUp() public virtual {
        contractName = vm.envOr("REALITYETH", string("RealityETH-3.0"));
        _configureVersion(contractName);
        // v4 is the current development source, so we deploy and test the compiled
        // source directly. Released versions (2.0-3.2) have no source in src/ and
        // stay on their frozen committed bytecode as regression fixtures.
        if (versionNum == 40) {
            rc = IRealityETHHarness(_deployV4Source());
            freeformTemplateId = _createFreeformTemplate();
        } else {
            rc = IRealityETHHarness(_deployBytecode(string.concat("bytecode/", contractName, ".bin"), ""));
        }
        vm.deal(address(this), 1000 ether);
    }

    // ---------------------------------------------------------------------
    // 4.0 ABI helpers (see freeformTemplateId above)
    // ---------------------------------------------------------------------

    // The template id the generic helpers use for 4.0; template 0 is remapped to the freeform template.
    function _tid(uint256 templateId) internal view returns (uint256) {
        return (versionNum >= 40 && templateId == 0) ? freeformTemplateId : templateId;
    }

    // A one-element ["<question>"] params array (the 4.0 title has a single interpolation slot).
    function _v4Params(string memory question) internal pure returns (string[] memory a) {
        a = new string[](1);
        a[0] = question;
    }

    function _v4NoOutcomes() internal pure returns (string[] memory) {
        return new string[](0);
    }

    // Create the Uint + ANSWERED_TOO_SOON freeform template used by the ported suite on 4.0.
    function _createFreeformTemplate() internal returns (uint256) {
        Template memory t = Template(
            AnswerType.Uint,
            0,
            true, // hasAnsweredTooSoon: allow the too-soon sentinel as a user answer
            false,
            false,
            false,
            false, // arbitratorFromTemplate: asker supplies it
            false, // minBondFromTemplate: asker supplies it
            address(0),
            0,
            _v4Params(""), // single interpolation slot
            _v4NoOutcomes(),
            "",
            "",
            ""
        );
        if (isERC20) {
            return IRealityETHCore_ERC20(address(rc)).createTemplate(t);
        }
        return IRealityETHCore(address(rc)).createTemplate(t);
    }

    // ---------------------------------------------------------------------
    // deployment: compile-from-source (v4, the current development version)
    // ---------------------------------------------------------------------
    function _deployV4Source() internal returns (address) {
        if (isERC20) {
            return address(new RealityETH_ERC20_v4_0(IERC20(address(0)), TREASURY));
        }
        return address(new RealityETH_v4_0(TREASURY));
    }

    // ---------------------------------------------------------------------
    // deployment: raw creation bytecode (test the bytecode, not the source)
    // ---------------------------------------------------------------------
    function _deployBytecode(string memory path, bytes memory args) internal returns (address addr) {
        bytes memory code = vm.parseBytes(_ensure0x(vm.readFile(path)));
        bytes memory full = bytes.concat(code, args);
        assembly ("memory-safe") {
            addr := create(0, add(full, 0x20), mload(full))
        }
        require(addr != address(0), "bytecode deploy failed");
    }

    function _ensure0x(string memory s) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        uint256 end = b.length;
        // trim trailing whitespace / newlines
        while (end > 0) {
            bytes1 c = b[end - 1];
            if (c == 0x0a || c == 0x0d || c == 0x20 || c == 0x09) {
                end--;
            } else {
                break;
            }
        }
        bytes memory t = new bytes(end);
        for (uint256 i = 0; i < end; i++) {
            t[i] = b[i];
        }
        if (end >= 2 && t[0] == 0x30 && (t[1] == 0x78 || t[1] == 0x58)) {
            return string(t);
        }
        return string(abi.encodePacked("0x", t));
    }

    // ---------------------------------------------------------------------
    // version configuration
    // ---------------------------------------------------------------------
    function _configureVersion(string memory name) internal {
        isERC20 = _contains(name, "_ERC20");
        if (_contains(name, "-2.0")) versionNum = 20;
        else if (_contains(name, "-2.1")) versionNum = 21;
        else if (_contains(name, "-2.2")) versionNum = 22;
        else if (_contains(name, "-3.0")) versionNum = 30;
        else if (_contains(name, "-3.2")) versionNum = 32;
        else if (_contains(name, "-4.0")) versionNum = 40;
        else revert(string.concat("unknown RealityETH version: ", name));

        commitRevealSupported = versionNum < 40; // commit-reveal was removed in 4.0
        answererAssignmentSupported = versionNum >= 21; // assignWinner/submitAnswerFor/cancel added in 2.1
        reopenSupported = versionNum >= 30; // reopenQuestion is in the 3.0 ABI
        minBondSupported = versionNum >= 30; // askQuestionWithMinBond is in the 3.0 ABI
        settledTooSoonSupported = versionNum >= 30; // isSettledTooSoon is in the 3.0 ABI
        questionFeeSupported = versionNum < 40; // arbitrator per-question fee removed in 4.0
        createdBlockSupported = versionNum >= 40; // question createdBlock added in 4.0
        claimFeeDivisor = versionNum >= 21 ? 40 : 0;
    }

    function _contains(string memory hay, string memory needle) internal pure returns (bool) {
        bytes memory h = bytes(hay);
        bytes memory n = bytes(needle);
        if (n.length == 0 || n.length > h.length) return false;
        for (uint256 i = 0; i <= h.length - n.length; i++) {
            bool ok = true;
            for (uint256 j = 0; j < n.length; j++) {
                if (h[i + j] != n[j]) {
                    ok = false;
                    break;
                }
            }
            if (ok) return true;
        }
        return false;
    }

    // ---------------------------------------------------------------------
    // hash helpers (packed keccak, matching Web3.solidity_keccak in test.py)
    // ---------------------------------------------------------------------
    // special answer meaning "answered too soon" (0xff..fe)
    bytes32 internal constant ANSWERED_TOO_SOON = bytes32(type(uint256).max - 1);

    function _contentHash(uint256 templateId, uint32 openingTs, string memory question)
        internal
        view
        returns (bytes32)
    {
        if (versionNum >= 40) {
            // 4.0: templateId 0 -> the freeform template, question -> params[0], no outcomes.
            return keccak256(abi.encode(_tid(templateId), openingTs, _v4Params(question), _v4NoOutcomes()));
        }
        return keccak256(abi.encodePacked(templateId, openingTs, question));
    }

    // question id, matching the Python calculate_question_id (v3+ includes
    // min_bond and the contract address; older versions do not).
    function _questionId(
        uint256 templateId,
        string memory question,
        address arbitrator,
        uint32 timeout,
        uint32 openingTs,
        uint256 nonce,
        address sender,
        uint256 minBond
    ) internal view returns (bytes32) {
        bytes32 ch = _contentHash(templateId, openingTs, question);
        if (versionNum >= 30) {
            return keccak256(abi.encodePacked(ch, arbitrator, timeout, minBond, address(rc), sender, nonce));
        }
        return keccak256(abi.encodePacked(ch, arbitrator, timeout, sender, nonce));
    }

    function _answerHash(bytes32 answer, uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(answer, nonce));
    }

    function _commitmentId(bytes32 questionId, bytes32 answerHash, uint256 bond) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(questionId, answerHash, bond));
    }

    function _historyHash(
        bytes32 lastHistoryHash,
        bytes32 answerOrCommitmentId,
        uint256 bond,
        address answerer,
        bool isCommitment
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(lastHistoryHash, answerOrCommitmentId, bond, answerer, isCommitment));
    }

    // convenience: bytes32 from a small uint answer (reality.eth answers are bytes32)
    function _answer(uint256 v) internal pure returns (bytes32) {
        return bytes32(v);
    }

    // Normalized question record. 2.x omits min_bond (left 0); the ABI getter
    // returns 10 fields pre-3.0 and 11 from 3.0 on, so decode by version.
    struct Q {
        bytes32 contentHash;
        address arbitrator;
        uint32 openingTs;
        uint32 timeout;
        uint32 finalizeTs;
        bool isPendingArbitration;
        uint256 bounty;
        bytes32 bestAnswer;
        bytes32 historyHash;
        uint256 bond;
        uint256 minBond;
        uint64 createdBlock;
    }

    // 3.0-3.2 getter (11 fields): has minBond but not createdBlock (added in 4.0).
    struct Q11 {
        bytes32 contentHash;
        address arbitrator;
        uint32 openingTs;
        uint32 timeout;
        uint32 finalizeTs;
        bool isPendingArbitration;
        uint256 bounty;
        bytes32 bestAnswer;
        bytes32 historyHash;
        uint256 bond;
        uint256 minBond;
    }

    // Pre-3.0 getter without the trailing min_bond field.
    struct QLegacy {
        bytes32 contentHash;
        address arbitrator;
        uint32 openingTs;
        uint32 timeout;
        uint32 finalizeTs;
        bool isPendingArbitration;
        uint256 bounty;
        bytes32 bestAnswer;
        bytes32 historyHash;
        uint256 bond;
    }

    function _q(bytes32 qid) internal view returns (Q memory q) {
        // 4.0 returns the Question struct from an explicit getter with a reordered layout, so decode via
        // the typed interface and map by field name. (arbitrator/minBond read the stored per-question
        // values, which equal the effective values for the freeform template the suite uses.)
        if (versionNum >= 40) {
            IRealityETHCore.Question memory v = IRealityETHCore(address(rc)).questions(qid);
            return Q(
                v.contentHash,
                v.arbitrator,
                v.openingTs,
                v.timeout,
                v.finalizeTs,
                v.isPendingArbitration,
                v.bounty,
                v.bestAnswer,
                v.historyHash,
                v.bond,
                v.minBond,
                v.createdBlock
            );
        }
        (bool ok, bytes memory data) = address(rc).staticcall(abi.encodeWithSignature("questions(bytes32)", qid));
        require(ok, "questions() call failed");
        // All fields are static, so the getter's return layout matches the
        // struct's; decode into the struct in one shot (avoids stack-too-deep).
        if (versionNum >= 30) {
            Q11 memory x = abi.decode(data, (Q11));
            q = Q(
                x.contentHash,
                x.arbitrator,
                x.openingTs,
                x.timeout,
                x.finalizeTs,
                x.isPendingArbitration,
                x.bounty,
                x.bestAnswer,
                x.historyHash,
                x.bond,
                x.minBond,
                0
            );
        } else {
            QLegacy memory l = abi.decode(data, (QLegacy));
            q = Q(
                l.contentHash,
                l.arbitrator,
                l.openingTs,
                l.timeout,
                l.finalizeTs,
                l.isPendingArbitration,
                l.bounty,
                l.bestAnswer,
                l.historyHash,
                l.bond,
                0,
                0
            );
        }
    }

    // reopened_questions getter. Renamed reopened_questions -> reopenedQuestions
    // (camelCase) in v4, so pick the signature by version (same technique as _q).
    function _reopenedQuestion(bytes32 qid) internal view returns (bytes32) {
        string memory sig = versionNum >= 40 ? "reopenedQuestions(bytes32)" : "reopened_questions(bytes32)";
        (bool ok, bytes memory data) = address(rc).staticcall(abi.encodeWithSignature(sig, qid));
        require(ok, "reopened_questions getter failed");
        return abi.decode(data, (bytes32));
    }

    // advance the chain clock by `secs` (Python _advance_clock / time_travel)
    function _advanceClock(uint256 secs) internal {
        vm.warp(vm.getBlockTimestamp() + secs);
    }

    // Python subfee(): the 2.5% burn applied to a losing/non-final bond on claim.
    function _subFee(uint256 bond) internal view returns (uint256) {
        if (claimFeeDivisor == 0) return bond;
        return bond - (bond / claimFeeDivisor);
    }
}
