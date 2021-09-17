const realityeth_contracts = require('./index.js'); // Outside this module you would instead use:
// const realityeth_contracts = require('@reality.eth/contracts')

// In this example we'll use ethersjs to interact with the contract
const ethers = require('ethers');


// The chain ID is usually either specified by the user or detected from metamask etc.
const chain_id = 1;
console.log('Using chain ID', chain_id)

// We provide some basic information about chains we support.
// This will include an RPC node and a Graph endpoint where available.
const chain_info = realityeth_contracts.chainData(chain_id);
console.log('Loaded chain info', chain_info);

// With ethers.js we might use that to set up a provider like this:
const provider = new ethers.providers.JsonRpcProvider(chain_info.hostedRPC);


// The tokens are specified under tokens/
// If you don't know which token to use you can list the tokens on the current chain to let the user choose
const available_tokens = realityeth_contracts.chainTokenList(chain_id);
console.log('Available tokens on this chain are', available_tokens);

// Alternatively you can get the name of the default for the network, which will normally be the chain's native token (eg on XDAI, the XDAI token).
const default_token = realityeth_contracts.defaultTokenForChain(chain_id);
console.log('Default token is', default_token);


// Once you know your chain ID and token you can get the configuration information for reality.eth on that chain.
// The following will get you the currently recommended version, which will be the latest stable version:
const default_config = realityeth_contracts.realityETHConfig(chain_id, 'ETH')
console.log('Default config is', default_config);

// If you want to specify the version, you can add a third parameter:
const version = '2.0';
const config = realityeth_contracts.realityETHConfig(chain_id, 'ETH', version)
console.log('Config for version', version, config);


// Some features are only supported on some versions.
// You can check whether the current version has a feature with:
const has_min_bond = realityeth_contracts.versionHasFeature(version, 'min-bond');
console.log('Version support for minimum bonds?', has_min_bond);
const has_reopen_question = realityeth_contracts.versionHasFeature(version, 'reopen-question');
console.log('Version support for reopening questions?', has_reopen_question);


// You can get an instance of the contract with
const contract = realityeth_contracts.realityETHInstance(config);
// console.log('Contract is', contract);


// For ethers.js we can then instantiate a contract like this:
const ethers_instance = new ethers.Contract(contract.address, contract.abi, provider);
// console.log('ethers', ethers_instance);


// Now we can query the contract. Here's the ID of a question that's already on mainnet:
const question_id = '0xa8fc96981fe9010d7ab5649af6a454202c7053b370f9ab84023277b5bfaf268e'

console.log('Querying the default RPC node', chain_info.hostedRPC);
ethers_instance.resultFor(question_id).then(function(result) {
    console.log('The result for question', question_id, 'is', result);
});
