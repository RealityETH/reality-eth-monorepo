// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import "./IRealityETH_ERC20.sol";
import "./IERC20.sol";

contract RealityETH_ERC20_Factory {
    address public libraryAddress;
    mapping(address => address) public deployments;

    event RealityETH_ERC20_deployed(address reality_eth, address token, uint8 decimals, string token_ticker);

    constructor(address _libraryAddress) {
        libraryAddress = _libraryAddress;
    }

    /// @notice Returns the address of a proxy based on the specified address
    /// @dev based on https://github.com/optionality/clone-factory
    function _deployProxy(address _target) internal returns (address result) {
        bytes20 targetBytes = bytes20(_target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }

    function createInstance(address _token) external {
        require(deployments[_token] == address(0), "There should only be one deployment per version per token");
        uint8 decimals = IERC20(_token).decimals();
        string memory ticker = IERC20(_token).symbol();
        address clone = _deployProxy(libraryAddress);
        IRealityETH_ERC20(clone).setToken(_token);
        IRealityETH_ERC20(clone).createTemplate('{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}');
        IRealityETH_ERC20(clone).createTemplate('{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}');
        IRealityETH_ERC20(clone).createTemplate('{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}');
        IRealityETH_ERC20(clone).createTemplate('{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}');
        IRealityETH_ERC20(clone).createTemplate('{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}');
        deployments[_token] = clone;
        emit RealityETH_ERC20_deployed(clone, _token, decimals, ticker);
    }
}
