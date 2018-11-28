Arbitration Consortium Setup
============================

.. toctree::
   :maxdepth: 2
   :caption: Contents:


Arbitration by trusted parties can be done more securely and transparently by combining multiple parties. This document describes the technical steps to set up contracts allowing m of n multiple parties (here, 2 of 3) to combine to perform arbitration tasks.

This document assumes one of the parties, which we refer to as "we", will do the initial contract deployment etc. Other parties do not need to do this, but the steps are included at the end of the document.


Arbitration contract structure
------------------------------

.. _`The Realitio contract`: https://etherscan.io/address/0x325a2e0f3cca2ddbaebb4dfc38df8d19ca165b47
.. _`An Arbitrator contract`: https://etherscan.io/address/0x257FA39e697C43DFF95E1D2aF754eD0118c062AB
.. _`A Gnosis MultiSig contract`: https://etherscan.io/address/0x257FA39e697C43DFF95E1D2aF754eD0118c062AB
.. _`A Splitter contract`: https://etherscan.io/address/0xd6455e86834563Bd11bbEC3Ad2A4969197ba4666

* `The Realitio contract`_
* `An Arbitrator contract`_ 
* `A Gnosis MultiSig contract`_ instance to control the Arbitrator contract 
* `A Splitter contract`_ for splitting and withdrawing funds from the Arbitrator contract


What arbitrators have to do
---------------------------

We have has done the initial deployment of the contracts and made their source code and setup parameters available via Etherscan.

Arbitrators need to create and secure an Ethereum account, capable of interacting with the contracts. We provide JavaScript-based tools designed for providing these functions on an offline computer. However, consortium members are free to implement other methods of interacting with the contracts if they prefer.

We use a Gnosis Multisig Wallet to manage the Arbitrator contract. As well as our command-line tool, this wallet provides a web UI allowing you to sign off on proposed transactions made by other parties, using the MetaMask Chrome extension.

Before starting operation, consortium members should run a test on the main Ethereum network to confirm that they can perform tasks they may need to perform later. (See below).

When arbitration is requested, by someone sending a fee to the arbitrator contract, arbitrators should consider the question under dispute, and send a transaction including the correct answer, and either the account that gave the final answer (if the previous final answer was correct) or the account that paid for arbitration (if the previous final answer was wrong).

Operation rules and terms of service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* If they wish, parties may publish a document describing any information they wish to share with users who interact with questions that use the consortium's arbitration contract. A link to this information can be displayed in the dapp.


Technical Setup
---------------


Requirements
^^^^^^^^^^^^
* Unix-compatible command line [tested on Ubuntu 18.04.1 LTS]
* node.js [tested on v8.10.0]


Setting up the command-line scripts:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash
   :linenos:

   git clone https://github.com/realitio/realitio-cli
   cd realitio-cli
   npm install

At this point the computer may be taken offline.



Creating an Ethereum address for arbitration operations
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. _`Keythereum`: https://github.com/ethereumjs/keythereum
.. _`Ethereum Key Thing`:  https://github.com/edmundedgar/ethereum-key-thing

Generate an Ethereum private key.

We leave it up to you to decide how this should be generated, backed up and secured.
Here we just take 32 random bytes from ``/dev/urandom``.
Alternatively you can use `Keythereum`_ to extract a private key from a standard Ethereum keystore file or our `Ethereum Key Thing`_ python script to generate a key and output a mnemonic.


.. code-block:: bash
   :linenos:

   # Use the config.json file we prepared
   cp config.consortium.1.json config.json

   # Create 32 random bytes of hex at secrets/arbitrator.sec
   mkdir ./secrets
   echo 0x`hexdump -v -n "32" -e '1/1 "%02x"' /dev/urandom` > secrets/arbitrator.sec

   # This will output an address, and qrcode to extract the address with a mobile phone if you want to keep your signing computer offline.
   node show_address.js

Send us the address, and we will register it with the multisig contract and the splitter contract, and send you some ETH for gas. We will register this address for both controlling arbitration and receiving payments from arbitration, although technically it is possible to separate these roles.

If you want to store the arbitration key in some other location - for example, on a ramdisk that is only decryted and mounted for arbitration operations - you can edit its location in ``config.json``.


Arbitration operations
^^^^^^^^^^^^^^^^^^^^^^

We send requests to the arbitration contract via a Gnosis Multisig Wallet contract. You can see the wallet at:
https://wallet.gnosis.pm/#/wallet/0x7006c40e5a759876a10852f3b78c7c0874967c22

For each operation, one party (probably us) creates a transaction with the wallet and another party approves it. 

Although we provide a command-line script to approve transactions, it can also be done with MetaMask, if you are confident you can manage this securely. The private key used for the arbitration operations can be imported into MetaMask as a "loose private key".



Using our command-line scripts
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The first two arguments of these scripts are always the `nonce`, which increases in series and can be checked on a block explorer, and the `gas price`, which you can check with https://ethgasstation.info.

The scripts will output a QR code for the signed transaction, which you can scan with a mobile phone app and broadcast to the network using https://etherscan.io/pushTX .

If your computer is online and has a local Ethereum node listening on the standard port (8545), you can instead pipe the output to ``./broadcast.sh``.


Accepting transactions already sent to the Gnosis multi-sig contract
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Most operations only need to be done by one party, and the others just need to sign off on it.  You can see the pending operation with the Gnosis Multi-Sig Wallet dapp, get its ID, and sign off with:

.. code-block:: bash

   node confirm_transaction.js <nonce> <gas_price> <id>


Withdrawing funds
~~~~~~~~~~~~~~~~~

Funds arrive in the Realitio or Arbitrator contract, then are moved to the Splitter wallet where they are allocated to the parties, at which point they can be withdrawn and moved on.
Any address can call the following:

.. code-block:: bash

   # (The first step is only needed if there are question fees)
   node call_withdraw.js <node> <gas_price> 

   # Move funds from the arbitrator contract to the splitter wallet
   node withdraw_to_registered_wallet.js <node> <gas_price> 

   # Allocates funds in the splitter contract to each party's address
   node allocate_splitter_funds.js <node> <gas_price> 

You can then extract your own split funds with:

.. code-block:: bash

   node withdraw_from_splitter_wallet.js <node> <gas_price>


You can send the funds received on with:

.. code-block:: bash

   node send_value.js <node> <gas_price> <address> <amount_in_gwei>


Setting dispute fees
~~~~~~~~~~~~~~~~~~~~

The main payment mechanism for this system is a fee paid per question. 
This can funded by the profits from people posting incorrect answers, and it should be set at a level which discourages excessive arbitration requests, and provides attractive profits to arbitrators. 
  
This fee should be adjusted if there is a large change in the ETH price. Since it effectively caps the amount of money that is likely to be staked on a single question, we also propose starting at a relatively low level and gradually increasing it over the first few months.

We set the fee in Gwei. (There are `1,000,000,000` Gwei to 1 ETH)

.. code-block:: bash

   node set_dispute_fee <nonce> <gas_price> <fee_in_gwei>


Setting question fees (anti-spam)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  It is possible to set a fee that will be charged for each question, whether we arbitrate it or not. Initially we do not intend to set this. It may become necessary if people start to spam the dapp.

.. code-block:: bash

   node set_question_fee <nonce> <gas_price> <fee_in_gwei>


Performing arbitration
~~~~~~~~~~~~~~~~~~~~~~

  We prepare a json file at `requests/arbitration.json`. Each entry contains:
  * The question ID
  * The right answer
  * The account that should be credited with that answer: If the final answer was right, this should be that answer. If not it should be the user that paid for arbitration.

  You can then create a transaction for an item at a particular index in that list with:

.. code-block:: bash

  node arbitrate.js <nonce> <gas_price> <index>



FYI: Our setup steps
--------------------

.. code-block:: bash


      ### Step 0: Our initial setup

       # Create 3 accounts (will be transferred to other parties later)
       # (Follow cli setup)
       
       #> git clone https://github.com/realitio/realitio-cli
       #> cd realitio-cli
       #> git fetch
       #> git checkout feature-multisig
       #> npm install
       # In config, change to a local path instead of sharing /secrets

       # cd ~/working
       # mkdir arb1 arb2 arb3
       # cp -r realitio-cli arb1/realitio-cli
       # cp -r realitio-cli arb2/realitio-cli
       # cp -r realitio-cli arb3/realitio-cli

       #> cd arb1/realitio-cli
       #> echo 0x`hexdump -v -n "32" -e '1/1 "%02x"' /dev/urandom` > arbitrator.sec
       #> node show_address.js
       #< 0xe3dac366009c2b5cba7676a76077ef5a3b03c26c

       #> cd arb2/realitio-cli
       #> echo 0x`hexdump -v -n "32" -e '1/1 "%02x"' /dev/urandom` > arbitrator.sec
       #> node show_address.js
       #< 0xd6259d9a408c48f027b44a3bc9821f9ef0c570f8

       #> cd arb3/realitio-cli
       #> echo 0x`hexdump -v -n "32" -e '1/1 "%02x"' /dev/urandom` > arbitrator.sec
       #> node show_address.js
       #< 0x89577dfcb85c4d3e89c0862dc869e7261c748182


       #> cd MultiSigWallet
       #> rm -rf build
       #> truffle deploy 2 [account1],[account2],[account3]

       # eg dev:> truffle migrate 0xe3dac366009c2b5cba7676a76077ef5a3b03c26c,0xd6259d9a408c48f027b44a3bc9821f9ef0c570f8,0x89577dfcb85c4d3e89c0862dc869e7261c748182 2

       # Get the address of the multisig contract, which we will call 0xmultisig
       # Update realitio-cli/config.json with the address of the wallet
       # Update realitio npm module and publish

       #> cd realitio-contracts/truffle
       #> truffle deploy # deploy RegisteredWalletArbitrator.sol and SplitWallet.sol

       #> Restore settings for any contracts we didn't need to overwrite
       #> git checkout build/contracts/Realitio.json build/contracts/RealitioSafeMath32.json build/contracts/RealitioSafeMath256.json build/contracts/ExplodingCallbackClient.json build/contracts/CallbackClient.json build/contracts/BalanceHolder.json build/contracts/Owned.json

       #> truffle console
       #> Realitio.deployed().then(function(r) { realitio=r })
       #> SplitterWallet.deployed().then(function(w) { wallet=w })
       #> RegisteredWalletArbitrator.deployed().then(function(a) { arb=a })

       ## Register the splitter wallet with the arbitrator contract
       #> arb.updateRegisteredWallet(wallet.address);

       ## Register the realitio contract with the arbitrator contract
       #> arb.setRealitio(realitio.address);


      ### Step 1: Participants create addresses

        (see above)


      ### Step 2: Register participants addresses 

       After getting keys from consortium members: For each payment address, eg 0xabcz

       # Send some ETH for gas
       web3.eth.sendTransaction({from: web3.eth.accounts[0], to: "0x...", value:10000000000000000})

       1) Splitter contract

       # cd realitio-contracts/truffle
       #> truffle console
       #> SplitWallet.deployed().then(function(w) { wallet=w })
       #> w.addRecipient(0xabcz);

       # Now transfer ownership of the splitter wallet to the multisig contrat
       #> w.transferOwnership(0xabcz);

       ## Finally, transfer ownership of the arbitrator contract to the multisig wallet
       #> arb.transferOwnership(0xabcz);

       #> cd arb1/realitio-cli
       # We keep the first key but replace the other two

       # Replace arb3 with 
       #> cd arb1/realitio-cli
       #> node replace_multisig_key.js <nonce> <gas_price> 0xd6259d9a408c48f027b44a3bc9821f9ef0c570f8 <bitcoin_com_key>
       #> cd arb2/realitio-cli
       #> node approve_submission.js <nonce> <gas_price> 0xd6259d9a408c48f027b44a3bc9821f9ef0c570f8 <id>

       #> cd arb1/realitio-cli
       #> node replace_multisig_key.js <nonce> <gas_price> 0x89577dfcb85c4d3e89c0862dc869e7261c748182 <k2>
       #> cd arb2/realitio-cli
       #> node approve_submission.js <nonce> <gas_price> 0x89577dfcb85c4d3e89c0862dc869e7261c748182 <k2>


      ### Step 3: 

       # Fee change test
       # Arbitration test

      ### Step 4: 

       # Add the arbitrator to the list in the dapp ui
