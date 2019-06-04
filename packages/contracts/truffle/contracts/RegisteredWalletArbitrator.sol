pragma solidity ^0.4.24;

import './Arbitrator.sol';
import './IERC20.sol';

/*
This contract extends the standard Arbitrator contract to make it possible to make routine fund withdrawals to an address pre-registered by the owner without actually being the owner.

We do this to facilitate controlling Arbitrator contracts using multisig wallets, which should require multiple sign-offs to allow validation and fee-settings tasks, but users should be able to withdraw their own share of the funds without anyone else's permission. This can be done in combination with our SplitterWallet contract.
*/

contract RegisteredWalletArbitrator is Arbitrator {

    address registered_wallet;

    /// @notice Withdraw any accumulated question fees from the specified address into this contract
    /// @dev Funds can then be liberated from this contract with our withdraw() function
    /// @dev Usually the arbitrator calls this, but if someone else does that's OK too
    function callWithdraw() 
    public {
        realitio.withdraw(); 
    }

    /// @notice Withdraw money from the arbitrator contract to our registered wallet
    function withdrawToRegisteredWalletERC20(IERC20 _token)
    external {
        require(registered_wallet != 0x0, "No wallet is registered");
        uint256 bal = _token.balanceOf(address(this));
        _token.transfer(registered_wallet, bal);
    }

    /// @notice Withdraw money from the arbitrator contract to our registered wallet
    function withdrawToRegisteredWallet()
    external {
        require(registered_wallet != 0x0, "No wallet is registered");
        registered_wallet.transfer(address(this).balance);
    }

    /// @notice Change the address of our registered wallet
    /// @param addr The address of the new wallet
    /// @dev Set to 0x0 to not use the registered wallet
    function updateRegisteredWallet(address addr) 
        onlyOwner
    external {
        registered_wallet= addr;
    }

}
