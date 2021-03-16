# realitio-contracts
Contracts for Realitio, including source code, ABI and addresses of contracts on mainnet and test networks

We now use Etherlime instead of Truffle, but we still use the old Truffle layout to avoid breaking things.

*truffle/* contains source files and build files for contracts, as laid out by truffle.

*config/* contains:

  * information about arbitrators subsequently deployed.
  * information about templates deployed by the constructor to save fetching them from the event logs.


## Tests

Contract tests use python3.

`$ cd truffle/contracts`

`$ pip install -r requirements.txt`

You can then run the tests with:

`$ python test.py`

The version we will deploy on XDai, v2.1, has an additional fee, called the claim fee. You can test it with:

`$ CLAIM_FEE=40 REALITIO=Realitio_v2_1 python test.py`


## Compilation 

We now use Etherlime rather than Truffle for compilation and deployment. The existing build files already contain the compiled code, so if you're not changing the code and just deploying versions of a previous contract for a new token, you don't need to compile.

`$ cd truffle`

`$ etherlime compile --solcVersion=0.4.25 --runs=200`

The above builds contracts under `truffle/build`. If you don't need to merge with any existing contract definitions (eg to preserve the addresses of existing contracts) you can copy them to the normal truffle location under `truffle/build/contracts`.


## Deployment

You will need the private key of an account with funds to deploy on the relevant network. It should be in hex, beginning "0x", in a file called `mainnet.sec` or `rinkeby.sec` or the equivalent for the network you will deploy to.

`$ mkdir truffle/etherlime_deploy/secrets`

The `.gitignore` file should prevent it from being checked into Git, but be careful not to share it.

To deploy contracts using the code compiled under truffle/build/contracts, use

`$ cd truffle/etherlime_deploy`

`$ node deploy.js <Realitio|Arbitrator|ERC20> <network> <token_name> [<token_address>] [<dispute_fee>] [<arbitrator_owner>]`

This will add contract addresses to the existing deployed contract .json definitions, and deploy per-token versions in the format expected by the `realitio-dapp` ui.


## Adding your contracts to the dapp

If you have added Reality.eth for a new token, or a new arbitrator, or both, please submit the changes to this repo as a PR.

If you are adding a token, please also let us know the approximate value of the token (in USD or ETH as you prefer) for use in dapp settings like "this bond is very low".

