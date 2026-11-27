// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

/// Hook a malicious/ERC777-style token invokes on the token sender mid-transfer.
interface IReentrancyHook {
    function reentrancyHook() external;
}

/// A minimal ERC20 that models an ERC777-style transfer hook: on the first
/// `transferFrom` after being armed, it calls `reentrancyHook()` on the `from`
/// address *before* settling balances, giving that address a chance to re-enter
/// the caller. Used to exercise the deposit-path reentrancy in the ERC20
/// RealityETH contract. Only re-enters once (guarded) to keep the PoC bounded.
contract MockReentrantERC20 {
    string public name = "Reentrant";
    string public symbol = "RE";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    bool public armed;
    bool private entered;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function setArmed(bool v) external {
        armed = v;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        // ERC777-style: notify the sender before balances settle. A revert in
        // the hook (e.g. a re-entrant call that now fails) propagates out of
        // transferFrom, as a real hook would.
        if (armed && !entered) {
            entered = true;
            IReentrancyHook(from).reentrancyHook();
        }
        uint256 a = allowance[from][msg.sender];
        if (a != type(uint256).max) {
            allowance[from][msg.sender] = a - amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
