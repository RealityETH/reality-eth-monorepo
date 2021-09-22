# @reality.eth/contracts
Contracts for Reality.eth, including source code, ABI and addresses of contracts on mainnet and test networks.

## Using the contracts

### Quick example:

    const realityeth_contracts = require('@reality.eth/contracts')
    const chain_id = 4; // eg rinkeby
    const provider = ...;
    
    const config = realityeth_contracts.realityETHConfig(chain_id, 'ETH', '3.0')
    const contract = realityeth_contracts.realityETHInstance(config);
    const ethers_instance = new ethers.Contract(contract.address, contract.abi, provider);

This module also contains support for checking which tokens are available on the given chain, checking which features it has etc.

See [example.js](example.js) for more examples.


## File layout

*tokens/* contains a file describing each supported token.

*chains/* contains the full raw data from https://chainid.network/chains.json, and a file listing chains we specifically support, and adding useful configuration information not supplied by chainid.network.

*chains/deployments/* contains a directory hierarchy with a file for the deployed version of each live contract on the specified network for the specified token. Each file also lists any whitelisted arbitrators. It may also contain additional post-deployment files for arbitrators we deployed.

The above are combined into JSON files under *generated/* using `npm run-script generate`.


*development/contracts/* contains source files and build files for contracts from the original build, as laid out by truffle. These files are no longer supported as a way of managing contract addresses.

*config/templates.json* contains information about templates deployed by the constructor to save fetching them from the event logs.

## Compilation

`$ cd development/contracts/`

`$ ./compile.py RealityETH-3.0

Bytecode and ABIs will be stored under *bytecode/* and *abi/* respectively.

## Tests

Contract tests use python3.

`$ cd tests/python`

`$ pip install -r requirements.txt`

You can then test the version in question with, eg

`$ REALITYETH=RealityETH-3.0 python test.py`

These tests test the bytecode not the source code, so you need to compile before testing source code changes.

## Deployment

You will need the private key of an account with funds to deploy on the relevant network. It should be in hex, beginning "0x", in a file called `mainnet.sec` or `rinkeby.sec` or the equivalent for the network you will deploy to. A different key should be used for each network to avoid clashing contract addresses.

`$ mkdir packages/contracts/secrets`

The `.gitignore` file should prevent it from being checked into Git, but be careful not to share it.

To deploy contracts using the code compiled under contracts/bytecode, use

`$ cd packages/contracts/scripts`

`$ node deploy.js <RealityETH|Arbitrator|ERC20> <network> <token_name> [<dispute_fee>] [<arbitrator_owner>]`

This will add contract addresses to the existing deployed contract .json definitions, and deploy per-token versions in the format expected by the `@reality.eth/dapp` ui.

If the token or network was not previously supported, you will need to add its configuration files and run `npm run-script generate`.

## Adding your contracts to the dapp

If you have added Reality.eth for a new token, or a new arbitrator, or both, please submit the changes to this repo as a PR.
