## Reality.eth monorepo

This repo replaces the old separate repos that were previously at realitio.github.com.

It comprises the following packages, under packages/:

  * contracts: Reality.eth contracts source code, also details of supported networks and tokens and the relevant contract addresses.
  * reality-eth-lib: Useful functions for creating and interpreting questions and templates used by the reality.eth system.
  * dapp: The UI front-end as deployed at reality.eth/dapp
  * docs: The system documentation as deployed at reality.eth/docs
  * website: The project website as seen at reality.eth/
  * cli-tools: Javascript tools, mainly used for arbitration
  * python-services: Python code used for back-end services, specifically the twitter bot @RealityEthBot
  * graph: Subgraph definitions for https://thegraph.com/

See the README of each respective package for details.

The following scripts are used for deployment, under tools/:
  
  * ipfs_build.sh: Deploy web-accessible parts of the project to a web-accessible URL, and pin it to IPFS on the local server. You should then manually add it to pinata and register it with ENS to update reality.eth.link.
  * gh_build.sh: As with ipfs_build.sh but deploying the dapp only, to github.io repo at https://realityeth.github.io/. This is usually updated more frequently than the IPFS build.

### NPM packages

The following are published to npm. They are versioned individually, and updated by running `lerna publish`.

  * @reality.eth/contracts
  * @reality.eth/reality-eth-lib
  * @reality.eth/dapp
  * @reality.eth/cli-tools

