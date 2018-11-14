pragma solidity ^0.4.25;

// Import a standard Gnosis multisig wallet
import './MultiSigWallet.sol';
import './Arbitrator.sol';

/*
The arbitrator contract is managed by an owner address.

This contract implements a MultiSig wallet to allow that owner address to be controlled by multiple parties.

For most functions of the arbitrator contract, changes will require m of n parties to approve.

However, we want you to be able to withdraw your own funds without the permission of the other participants.
We therefore implement a separate Splitter Wallet to handle splitting the funds between the participants.

The address of the splitter wallet is controlled by m of n, like other multi-sig wallet features.
As well as a function to control this, we implement functions callable by anyone to:
    * Download any outstanding funds in a realitio contract to the arbitrator contract
    * Withdraw funds from the arbitrator to the splitter wallet
*/

contract MultiSigArbitratorController is MultiSigWallet {

    address splitter_wallet;

    /// @notice Call the withdraw function of the specified arbitrator contract to pull funds from Realitio to it.
    /// @param arbitrator The arbitrator contract that should pull funds from Realitio to itself
    /// @dev Arbitrator.callWithdraw() is limited to its owner (this), but it's the arbitrator's money so in fact it doesn't matter who calls it.
    function callWithdraw(address arbitrator) 
    external {
        Arbitrator(arbitrator).callWithdraw();
    }

    /// @notice Withdraw money from the arbitrator contract to our splitter wallet
    /// @param arbitrator The arbitrator contract to pull funds from
    function withdrawToSplit(address arbitrator)
    external {
        Arbitrator(arbitrator).withdraw(splitter_wallet);
    }

    /// @notice Change the address of our splitter wallet
    /// @param addr The address of the new splitter wallet
    /// @dev 
    function updateSplitterWallet(address addr) 
        onlyWallet
        validRequirement(owners.length + 1, required)
    public {
        splitter_wallet = addr;
    }

}
