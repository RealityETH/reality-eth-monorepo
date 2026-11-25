// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_ERC20_v4_0} from "../src/RealityETH_ERC20-4.0.sol";
import {RealityETH_ERC20_Factory} from "../src/RealityETH_ERC20_Factory.sol";
import {IRealityETH_ERC20} from "../src/interfaces/IRealityETH_ERC20.sol";
import {AnswerType} from "../src/RealityETHTypes.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

interface IFactoryCreate {
    function createInstance(address token) external;
}

/// A token whose decimals() re-enters the factory once. createInstance calls
/// decimals()/symbol() on the (caller-supplied) token, and they are NOT view, so
/// this call can re-enter — the case the one-per-token guard must survive.
contract ReentrantDecimalsToken {
    IFactoryCreate public factory;
    bool public armed;
    bool internal entered;

    function setFactory(address f) external {
        factory = IFactoryCreate(f);
    }

    function setArmed(bool v) external {
        armed = v;
    }

    function decimals() external returns (uint8) {
        if (armed && !entered) {
            entered = true;
            factory.createInstance(address(this));
        }
        return 18;
    }

    function symbol() external pure returns (string memory) {
        return "RE";
    }
}

contract FactoryTest is Test {
    RealityETH_ERC20_v4_0 internal lib;
    RealityETH_ERC20_Factory internal factory;

    function setUp() public {
        lib = new RealityETH_ERC20_v4_0();
        factory = new RealityETH_ERC20_Factory(address(lib));
    }

    /// createInstance deploys a working clone: token wired, templates seeded, and
    /// the clone can create a question end to end.
    function test_createInstance_deploys_working_clone() public {
        MockERC20 token = new MockERC20();
        factory.createInstance(address(token));

        address clone = factory.deployments(address(token));
        assertTrue(clone != address(0), "deployment recorded");

        IRealityETH_ERC20 inst = IRealityETH_ERC20(clone);
        assertEq(address(inst.token()), address(token), "clone token set");
        assertEq(uint256(inst.getTemplate(0).answerType), uint256(AnswerType.Bool), "template 0 seeded (bool)");
        assertEq(uint256(inst.getTemplate(2).answerType), uint256(AnswerType.Datetime), "template 2 seeded (datetime)");
        vm.expectRevert(); // v4 seeds only the 3 generalized defaults (0,1,2)
        inst.getTemplate(3);

        string[] memory params = new string[](1);
        params[0] = "q";
        bytes32 qid = inst.askQuestionERC20(0, params, new string[](0), address(0), 30, 0, 0, 0);
        assertTrue(qid != bytes32(0), "question created on clone");
    }

    /// Only one instance per token.
    function test_duplicate_deployment_reverts() public {
        MockERC20 token = new MockERC20();
        factory.createInstance(address(token));
        vm.expectRevert();
        factory.createInstance(address(token));
    }

    /// Constructor rejects a zero library address.
    function test_constructor_rejects_zero_library() public {
        vm.expectRevert();
        new RealityETH_ERC20_Factory(address(0));
    }

    /// A token re-entering createInstance (via decimals()) for its own instance
    /// must hit the one-per-token guard, because deployments[token] is recorded
    /// before the token is called (CEI). Without that ordering the re-entrant call
    /// would deploy a duplicate instead of reverting.
    function test_reentrant_createInstance_reverts() public {
        ReentrantDecimalsToken token = new ReentrantDecimalsToken();
        token.setFactory(address(factory));
        token.setArmed(true);
        vm.expectRevert();
        factory.createInstance(address(token));
    }

    /// createInitialTemplates can only seed once: the library (constructor-seeded)
    /// and a factory-seeded clone both reject a second call.
    function test_createInitialTemplates_only_once() public {
        vm.expectRevert();
        lib.createInitialTemplates();

        MockERC20 token2 = new MockERC20();
        factory.createInstance(address(token2));
        IRealityETH_ERC20 inst = IRealityETH_ERC20(factory.deployments(address(token2)));
        vm.expectRevert();
        inst.createInitialTemplates();
    }
}
