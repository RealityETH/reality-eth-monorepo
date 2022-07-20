/*
Set the token address, it shouldn't be 0x000000000000000000000000000000000000800A
*/

import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
const fs = require('fs');

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the reality.eth contract`);

  const key_file = '/home/ed/secrets/zksync_goerli.sec';
  const priv = fs.readFileSync(key_file, 'utf8').replace(/\n$/, "");

  // Initialize the wallet.
  const wallet = new Wallet(priv);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("RealityETH_v3_0");

  /*
  // Deposit some funds to L2 in order to be able to perform L2 transactions.
  const depositAmount = ethers.utils.parseEther("0.00001");
  const depositHandle = await deployer.zkWallet.deposit({
    to: deployer.zkWallet.address,
    token: utils.ETH_ADDRESS,
    amount: depositAmount,
  });
  // Wait until the deposit is processed on zkSync
  await depositHandle.wait();
 */

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  const realityContract = await deployer.deploy(artifact, []);

  // Show the contract info.
  const contractAddress = realityContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  /*
  // Edit the greeting of the contract
  const token = "0x000000000000000000000000000000000000800A"
  const setTokenHandle = await realityContract.setToken(token);
  await setTokenHandle.wait();

  const tokenFromContract = await realityContract.token();
  if (tokenFromContract == token) {
    console.log(`Contract greets us with ${token}!`);
  } else {
    console.error(`Contract said something unexpected: ${tokenFromContract}`);
  }
  */
}

