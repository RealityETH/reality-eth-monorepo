Linking to the Reality.eth dapp
===============================

Parameters can be set for the reality.eth dapp by adding ``#!`` to the top page, followed by parameters and their values, delimited by ``/``.
https://reality.eth.link/app/index.html#!/question/0xa09ce5e7943f281a782a0dc021c4029f9088bec4-0x4c6b2691b7f698690168f1fa09c74886cb347d14207ef9a0340a7e53aced9961

Multiple parameters may be added in any order.

Choosing the chain
------------------

By default the dapp will show you the chain to which the user is already connected using MetaMask etc.

To specify the chain, append ``network``, followed by the chain ID.

For example, for the Rinkeby chain use:
https://reality.eth.link/app/index.html#!/network/4

If the user does not have this network selected, it will prompt them to switch to it. If the user does not have the chain in question configured in their browser, it will attempt to configure it using data from https://chainlist.org/. This is currently supported by MetaMask but not by Brave.

Choosing the token
------------------

Append ``token`` and the code for the token. 

For example, to use the ``POLK`` token, use
https://reality.eth.link/app/index.html#!/token/POLK

If you do not specify a token, the dapp will default to the native token, assuming one is supported.

Specifying the contract
-----------------------

On some networks, multiple versions of Reality.eth are supported, each with their own contract. 

To specify that only a particular contract version should be used, for both displaying questions and asking new questions, append ``contract`` and the address of the contract.

For example, on Rinkeby the reality.eth 2.0 contract is deployed at ``0x3D00D77ee771405628a4bA4913175EcC095538da``, so you would link to:
https://reality.eth.link/app/index.html#!/contract/0x3D00D77ee771405628a4bA4913175EcC095538da

Specifying the question
-----------------------

To link to a specific question, add the ID. Since multiple contracts may be supported on the same network, you should include the contract address. 

For example, for a question on contract ``0x3d00d77ee771405628a4ba4913175ecc095538da`` you would use:
https://reality.eth.link/app/index.html#!/question/0x3d00d77ee771405628a4ba4913175ecc095538da-0xf9d2c6cd9a1b21d8ec4829dbb1e7b49e951e8171465335907274434b2b762774

This will display your question using the contract to which it was posted, even if you do not otherwise specify the contract that should be displayed by the UI.

.. note:: Prior to August, 2021, question IDs did not include the contract address. These are still supported, but if the `contract` parameter is not supplied, the dapp may not be able to tell which contract the question lives on.

