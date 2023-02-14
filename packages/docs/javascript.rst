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

To get an instance of the contract with the ABI populated, you can call `reality_eth_contracts.realityETHInstance(my_config)`. You can then create an instance in `ethers.js`, using a provider, with something like `const my_instance = new ethers.Contract(my_config.address, my_config.abi, provider);`.


Using reality-eth-lib
---------------------

We provide a library to help with formatting questions and parsing the answers.

Although it is possible to format questions and handle the answers without using this library, we recommend that you use it where possible to ensure that your code matches what users will see if they interact with your questions on the reality.eth dapp or in other UI code.

You can install this library with
`npm install --save @reality.eth/reality-eth-lib`.

You can then import libraries for handling questions and templates.
`const reality_eth_question = require('@reality.eth').question;`
`const reality_eth_template = require('@reality.eth').template;`

This library will help you handle the encoding and decoding of questions using templates. See :doc:`contracts` to understand how the template system works.



Interpreting a question
^^^^^^^^^^^^^^^^^^^^^^^

A question stored on the blockchain consists of a template ID, with the body of the template in the logs for that template, and some encoded text. The following will parse the text and populate a an object with the question `title`, `type` and any other fields it may have such as `category`.
`const q = reality_eth_question.populatedJSONForTemplate(tmpl, qtext);`


Creating a question
^^^^^^^^^^^^^^^^^^^

Questions are created by calling the `askQuestion` method of the reality.eth contract. This requires a template ID and some parameters, stored in a string of text. The questions are formatted using an unusual delimiter character, "␟". See the contracts document for more details on formatting. The `encodeText` function will handle formatting text for inclusion into a template.

The supported types are `bool`, `uint', `single-select`, `multiple-select`, `datetime`.

Our built-in templates expect a type, the question title, a list of outcomes (for select types only), a category and a language. If your template expects the same parameters in the same order, you can use the following methods to format the text:

   const qtext = reality_eth_question.encodeText('bool', 'my title', null, 'my-category', 'en_US');
   const qtext = reality_eth_question.encodeText('multiple-select', 'my title', outcomes, 'my-category');
   const qtext = reality_eth_question.encodeText('single-select', 'my title', outcomes, 'my-category');

If your template uses different parameters or parameters in a different order, you can pass them as an object with the keys appropriately ordered to `encodeCustomText`.






