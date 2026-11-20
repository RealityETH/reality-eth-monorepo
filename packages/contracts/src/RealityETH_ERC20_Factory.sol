// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

import {IRealityETH_ERC20} from "./interfaces/IRealityETH_ERC20.sol";
import {IERC20} from "./interfaces/IERC20.sol";

// solhint-disable-next-line contract-name-camelcase
contract RealityETH_ERC20_Factory {
    /// @notice There should only be one deployment per version per token
    error ThereShouldOnlyBeOneDeploymentPerVersionPerToken();
    /// @notice The library address must not be the zero address
    error LibraryAddressMustNotBeZero();

    address public libraryAddress;
    // Treasury applied to every clone this factory deploys (address(0) = burn fees, as before).
    address public treasury;
    mapping(address token => address instance) public deployments;

    // solhint-disable-next-line event-name-camelcase
    event RealityETH_ERC20_deployed(
        address indexed realityEth, address indexed token, uint8 decimals, string tokenTicker
    );

    constructor(address _libraryAddress, address _treasury) {
        if (_libraryAddress == address(0)) revert LibraryAddressMustNotBeZero();
        libraryAddress = _libraryAddress;
        treasury = _treasury;
    }

    /// @notice Returns the address of a proxy based on the specified address
    /// @dev based on https://github.com/optionality/clone-factory
    function _deployProxy(address _target) internal returns (address result) {
        bytes20 targetBytes = bytes20(_target);
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }

    function createInstance(address _token) external {
        if (deployments[_token] != address(0)) revert ThereShouldOnlyBeOneDeploymentPerVersionPerToken();
        address clone = _deployProxy(libraryAddress);
        // Record the deployment before any call into the untrusted token (CEI): a
        // malicious token re-entering via decimals()/symbol() then hits the guard
        // above instead of deploying a duplicate instance for the same token.
        deployments[_token] = clone;
        // setTreasury must precede setToken: it is only callable while the token is unset, and setToken
        // closes that window. Both run in this one transaction, so there is no window for anyone else.
        IRealityETH_ERC20(clone).setTreasury(treasury);
        IRealityETH_ERC20(clone).setToken(IERC20(_token));
        IRealityETH_ERC20(clone).createInitialTemplates();
        uint8 decimals = IERC20(_token).decimals();
        string memory ticker = IERC20(_token).symbol();
        emit RealityETH_ERC20_deployed(clone, _token, decimals, ticker);
    }
}
