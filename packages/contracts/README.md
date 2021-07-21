# @reality.eth/contracts
Contracts for Reality.eth, including source code, ABI and addresses of contracts on mainnet and test networks.

*networks/* contains a directory hierarchy with a file for the deployed version of each live contract on the specified network for the specified token. Each file also lists any whitelisted arbitrators. It may also contain additional post-deployment files for arbitrators we deployed.

*tokens/* contains a file describing each supported token.

*chains/* contains the full raw data from https://chainid.network/chains.json, and a file listing chains we specifically support, and adding useful configuration information not supplied by chainid.network.

The above are combined into JSON files under generated/ using `npm run-script generate`.


*truffle/* contains source files and build files for contracts from the original build, as laid out by truffle. These files are no longer supported as a way of managing contract addresses.


*config/templates* contains information about templates deployed by the constructor to save fetching them from the event logs.


## Tests

Contract tests use python3.

`$ cd tests/python`

`$ pip install -r requirements.txt`

You can then run the tests with:

`$ python test.py`

The version we will deploy on XDai, v2.1, has an additional fee, called the claim fee. You can test it with:

`$ CLAIM_FEE=40 REALITYETH=RealityETH-2.1 python test.py`


## Compilation 

We now use Etherlime rather than Truffle for compilation. The existing build files already contain the compiled code, so if you're not changing the code and just deploying versions of a previous contract for a new token, you don't need to compile.

`$ cd truffle`

`$ etherlime compile --solcVersion=0.4.25 --runs=200`

The above builds contracts under `truffle/build`. If you don't need to merge with any existing contract definitions (eg to preserve the addresses of existing contracts) you can copy them to the normal truffle location under `truffle/build/contracts`.


## Deployment

You will need the private key of an account with funds to deploy on the relevant network. It should be in hex, beginning "0x", in a file called `mainnet.sec` or `rinkeby.sec` or the equivalent for the network you will deploy to.

`$ mkdir packages/contracts/secrets`

The `.gitignore` file should prevent it from being checked into Git, but be careful not to share it.

To deploy contracts using the code compiled under truffle/build/contracts, use

`$ cd packages/contracts/scripts`

`$ node deploy.js <Realitio|Arbitrator|ERC20> <network> <token_name> [<dispute_fee>] [<arbitrator_owner>]`

This will add contract addresses to the existing deployed contract .json definitions, and deploy per-token versions in the format expected by the `realitio-dapp` ui.

If the token or network was not previously supported, you will need to add its configuration files and run `npm run-script generate`.

## Adding your contracts to the dapp

If you have added Reality.eth for a new token, or a new arbitrator, or both, please submit the changes to this repo as a PR.
