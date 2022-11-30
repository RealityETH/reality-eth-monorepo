Using Reality.eth from JavaScript
=====================================

Contract deployments
--------------------

You can find the reality.eth contract addresses under https://github.com/RealityETH/reality-eth-monorepo/tree/main/packages/contracts/chains/deployments .

For instance, the reality.eth v3 contract for mainnet (chain ID `1`) is shown in the file
https://github.com/RealityETH/reality-eth-monorepo/blob/main/packages/contracts/chains/deployments/1/ETH/RealityETH-3.0.json

These are also stored in the `@reality.eth/contracts` library. You can install them with `npm install --save @reality.eth/contracts`.

You can load this library with `const reality_eth_contracts = require('@reality.eth/contracts')`.


Loading the contracts for your network / token
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can check if a given `chain_id` is supported by calling
reality_eth_contracts.isChainSupported(chain_id);

We normally deploy a reality.eth contract for the native token on the chain (the token you pay gas with), and some chains may have additional contracts supporting different ERC20 tokens. You can get the name of the native token by calling `reality_eth_contracts.defaultTokenForChain(chain_id)`. On the Ethereum mainnet this will be `ETH`.

`const token_ticker = reality_eth_contracts.defaultTokenForChain(chain_id);`

The token may have multiple reality.eth contracts for different versions. You can read these with `reality_eth_contracts.realityETHConfigs(cid, token_ticker);`. If you know which version you want, you can pass this to get a single config, eg `const my_config = `reality_eth_contracts.realityETHConfig(chain_id, token_ticker, '3.0');`

To get an instance of the contract with the ABI populated, you can call `reality_eth_contracts.realityETHInstance(my_config)`. You can then create an instance in `ethers.js`, using a provider, with something like my_instance = new ethers.Contract(my_config.address, my_config.abi, provider);`.


Using reality-eth-lib
---------------------

We provide a library to help with formatting questions and parsing the answers.

Although it is possible to format questions and handle the answers without using this library, we recommend that you use it where possible to ensure that your code matches what users will see if they interact with your questions on the reality.eth dapp or in other UI code.

You can install this library with
`npm install --save @reality.eth/reality-eth-lib`.

To ask a question, you first need to format the text you will send to the contract.

The questions are formatted using an unusual delimiter character, "␟". See the contracts document for more details on formatting.



