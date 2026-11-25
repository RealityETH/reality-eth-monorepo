// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_v4_0} from "../src/RealityETH-4.0.sol";
import {AnswerType, Template} from "../src/RealityETHTypes.sol";

/// Approximate per-call gas comparison for createTemplate and askQuestion between
/// the v4 structured-template source and the frozen 3.0/3.2 bytecode. Measured as
/// gasleft() deltas around each call (includes some call overhead, consistent
/// across both; dominant cost is storage writes).
contract V4GasTest is Test {
    address internal arb = address(0xA4B);

    function _ensure0x(string memory s) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        uint256 end = b.length;
        while (end > 0) {
            bytes1 c = b[end - 1];
            if (c == 0x0a || c == 0x0d || c == 0x20 || c == 0x09) end--;
            else break;
        }
        bytes memory t = new bytes(end);
        for (uint256 i = 0; i < end; i++) {
            t[i] = b[i];
        }
        if (end >= 2 && t[0] == 0x30 && (t[1] == 0x78 || t[1] == 0x58)) return string(t);
        return string(abi.encodePacked("0x", t));
    }

    function _deploy(string memory name) internal returns (address addr) {
        bytes memory code = vm.parseBytes(_ensure0x(vm.readFile(string.concat("bytecode/", name, ".bin"))));
        assembly ("memory-safe") {
            addr := create(0, add(code, 0x20), mload(code))
        }
        require(addr != address(0), "deploy failed");
    }

    function _one(string memory s) internal pure returns (string[] memory a) {
        a = new string[](1);
        a[0] = s;
    }

    function _rgb() internal pure returns (string[] memory a) {
        a = new string[](3);
        a[0] = "Red";
        a[1] = "Green";
        a[2] = "Blue";
    }

    function _measureOldCreate(address rc, string memory json) internal returns (uint256) {
        bytes memory cd = abi.encodeWithSignature("createTemplate(string)", json);
        uint256 g = gasleft();
        (bool ok,) = rc.call(cd);
        uint256 used = g - gasleft();
        require(ok, "old createTemplate failed");
        return used;
    }

    function _measureOldAsk(address rc) internal returns (uint256) {
        bytes memory cd = abi.encodeWithSignature(
            "askQuestion(uint256,string,address,uint32,uint32,uint256)",
            uint256(0),
            "Will it rain?",
            arb,
            uint32(30),
            uint32(0),
            uint256(0)
        );
        uint256 g = gasleft();
        (bool ok,) = rc.call(cd);
        uint256 used = g - gasleft();
        require(ok, "old askQuestion failed");
        return used;
    }

    function _measureNewCreate(RealityETH_v4_0 nw, Template memory t) internal returns (uint256) {
        uint256 g = gasleft();
        nw.createTemplate(t);
        return g - gasleft();
    }

    function _measureNewAsk(RealityETH_v4_0 nw) internal returns (uint256) {
        uint256 g = gasleft();
        nw.askQuestion(0, _one("Will it rain?"), new string[](0), arb, 30, 0, 0); // arbitrator stored
        return g - gasleft();
    }

    // arbitrator fixed by the template, inherited at ask time: the per-question arbitrator slot
    // stays zero (unwritten), saving a cold SSTORE versus supplying it per question.
    function _measureNewAskInheritArb(RealityETH_v4_0 nw) internal returns (uint256) {
        uint256 id = nw.createTemplate(
            Template(
                AnswerType.Bool,
                0,
                false,
                false,
                false,
                false,
                true,
                false,
                arb,
                0,
                _one(""),
                new string[](0),
                "",
                "",
                ""
            )
        );
        uint256 g = gasleft();
        nw.askQuestion(id, _one("Will it rain?"), new string[](0), address(0), 30, 0, 0); // inherit arbitrator
        return g - gasleft();
    }

    // select question whose outcomes are supplied at ask time: the strings go to the
    // event + content hash, only the count is stored (packed with createdBlock/templateId).
    function _measureNewAskSelect(RealityETH_v4_0 nw) internal returns (uint256) {
        uint256 id = nw.createTemplate(
            Template(
                AnswerType.SingleSelect,
                0,
                false,
                false,
                false,
                false,
                false,
                false,
                address(0),
                0,
                _one(""),
                new string[](0),
                "",
                "",
                ""
            )
        );
        uint256 g = gasleft();
        nw.askQuestion(id, _one("Favourite colour?"), _rgb(), arb, 30, 0, 0);
        return g - gasleft();
    }

    function test_gas_compare() public {
        RealityETH_v4_0 nw = new RealityETH_v4_0();
        address old30 = _deploy("RealityETH-3.0");
        address old32 = _deploy("RealityETH-3.2");

        string memory boolJson = '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}';
        string memory selJson =
            '{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}';

        emit log_string("=== createTemplate: generalized bool (gas) ===");
        emit log_named_uint("  3.0 (json->hash)", _measureOldCreate(old30, boolJson));
        emit log_named_uint("  3.2 (json->hash)", _measureOldCreate(old32, boolJson));
        emit log_named_uint(
            "  4.0 (struct->state)",
            _measureNewCreate(
                nw,
                Template(
                    AnswerType.Bool,
                    0,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    address(0),
                    0,
                    _one(""),
                    new string[](0),
                    "",
                    "",
                    ""
                )
            )
        );

        emit log_string("=== createTemplate: single-select, 3 outcomes (gas) ===");
        emit log_named_uint("  3.0 (json->hash, flat)", _measureOldCreate(old30, selJson));
        emit log_named_uint(
            "  4.0 (struct+outcomes->state)",
            _measureNewCreate(
                nw,
                Template(
                    AnswerType.SingleSelect,
                    0,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    address(0),
                    0,
                    _one(""),
                    _rgb(),
                    "",
                    "",
                    ""
                )
            )
        );

        emit log_string("=== askQuestion: bool, template 0 (gas) ===");
        emit log_named_uint("  3.0", _measureOldAsk(old30));
        emit log_named_uint("  3.2", _measureOldAsk(old32));
        emit log_named_uint("  4.0 (arbitrator supplied/stored)", _measureNewAsk(nw));
        emit log_named_uint("  4.0 (arbitrator inherited from template)", _measureNewAskInheritArb(nw));
        emit log_named_uint("  4.0 select, 3 outcomes at ask time", _measureNewAskSelect(nw));
    }
}
