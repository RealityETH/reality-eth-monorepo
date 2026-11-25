// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IRealityETH} from "../src/IRealityETH.sol";

/// @dev Base harness for the ported RealityETH suite.
///
/// Mirrors the Python tests' `REALITYETH` env-var approach: the contract-under-
/// test is selected at runtime (default RealityETH-3.0) and deployed from its
/// committed creation bytecode under ./bytecode, then driven through the
/// {IRealityETH} superset interface. Per-version feature flags gate tests the
/// same way the Python suite skips unsupported features.
abstract contract RealityETHBase is Test {
    IRealityETH internal rc;

    string internal contractName;
    uint256 internal versionNum; // 20, 21, 22, 30, 32, 40
    bool internal isERC20;

    // feature flags (see _configureVersion)
    bool internal commitRevealSupported;
    bool internal answererAssignmentSupported; // submitAnswerFor / assignWinner... (3.0+)
    bool internal reopenSupported; // 3.2+
    bool internal minBondSupported; // 3.2+
    uint256 internal claimFeeDivisor; // 40 (2.5% burn) for >=2.1, else 0

    function setUp() public virtual {
        contractName = vm.envOr("REALITYETH", string("RealityETH-3.0"));
        _configureVersion(contractName);
        rc = IRealityETH(_deployBytecode(string.concat("bytecode/", contractName, ".bin"), ""));
        vm.deal(address(this), 1000 ether);
    }

    // ---------------------------------------------------------------------
    // deployment: raw creation bytecode (test the bytecode, not the source)
    // ---------------------------------------------------------------------
    function _deployBytecode(string memory path, bytes memory args) internal returns (address addr) {
        bytes memory code = vm.parseBytes(_ensure0x(vm.readFile(path)));
        bytes memory full = bytes.concat(code, args);
        assembly {
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
        answererAssignmentSupported = versionNum >= 30;
        reopenSupported = versionNum >= 32;
        minBondSupported = versionNum >= 32;
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
    function _contentHash(uint256 templateId, uint32 openingTs, string memory question)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(templateId, openingTs, question));
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

    // advance the chain clock by `secs` (Python _advance_clock / time_travel)
    function _advanceClock(uint256 secs) internal {
        vm.warp(block.timestamp + secs);
    }

    // Python subfee(): the 2.5% burn applied to a losing/non-final bond on claim.
    function _subFee(uint256 bond) internal view returns (uint256) {
        if (claimFeeDivisor == 0) return bond;
        return bond - (bond / claimFeeDivisor);
    }
}
