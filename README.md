## reality.eth monorepo

This repo replaces the old separate repos that were previously at realitio.github.com.

It comprises the following packages, under packages/:

  * contracts: reality.eth contracts source code, also details of supported networks and tokens and the relevant contract addresses.
  * reality-eth-lib: Useful functions for creating and interpreting questions and templates used by the reality.eth system.
  * dapp: The UI front-end as deployed at reality.eth/dapp
  * docs: The system documentation as deployed at reality.eth/docs
  * website: The project website as seen at reality.eth/
  * cli-tools: Javascript tools, mainly used for arbitration
  * graph: Subgraph definitions for https://thegraph.com/
  * template-generator: A GUI tool to create custom question templates.
  * twitter-bot: A script to tweet out new questions and answers.

See the README of each respective package for details.

The following scripts are used for deployment, under tools/:
  
  * ipfs_build.sh: Deploy web-accessible parts of the project to a web-accessible URL, pin it to IPFS on the local server and on Filebase. You should then register it with ENS to update reality.eth.link.
  * gh_build.sh: As with ipfs_build.sh but deploying the dapp only, to github.io repo at https://realityeth.github.io/. This is usually updated more frequently than the IPFS build.

### NPM packages

The following are published to npm. They are versioned individually, and updated by running `lerna publish`.

  * @reality.eth/contracts
  * @reality.eth/reality-eth-lib
  * @reality.eth/dapp
  * @reality.eth/cli-tools

Some packages reference each other, for example `dapp` needs `contracts` and `reality-eth-lib`. When developing it can be useful to make your local environment refer directly to the working versions of the other packages in the repo. To do this, instead of running the normal `npm install` for each JavaScript package, run `lerna bootstrap` from the uppermost directory. This will install external dependencies normally, but set up dependencies within this repo as symlinks.

NB The dapp lerna setup does not seem to be working correctly. You may need to run `npm install` separately for the dapp. If `npm install` fails due to problems with node-gyp or node-sass, try deleting packages/dapp/package-lock.json and `node_modules` then running `npm install` again.
