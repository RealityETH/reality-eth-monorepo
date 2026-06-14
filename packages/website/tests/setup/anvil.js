import { spawn } from 'child_process';
import { ethers } from 'ethers';

const ANVIL_BIN = `${process.env.HOME}/.foundry/bin/anvil`;
const GNOSIS_RPC = 'https://rpc.gnosischain.com';
export const FORK_BLOCK = 46600000;
const GNOSIS_CHAIN_ID = 100;

export const ANVIL_PORT = 8545;
export const ANVIL_URL = `http://127.0.0.1:${ANVIL_PORT}`;

// First default anvil account — pre-funded with 10000 ETH on the fork
export const TEST_ACCOUNT = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
};

let anvilProcess = null;

export async function startAnvil() {
  anvilProcess = spawn(ANVIL_BIN, [
    '--fork-url', GNOSIS_RPC,
    '--fork-block-number', String(FORK_BLOCK),
    '--port', String(ANVIL_PORT),
    '--chain-id', String(GNOSIS_CHAIN_ID),
    '--retries', '2',
    '--silent',
  ]);

  anvilProcess.on('error', (err) => {
    throw new Error(`Failed to start anvil: ${err.message}`);
  });

  await waitForAnvil();
  return anvilProcess;
}

export async function stopAnvil() {
  if (anvilProcess) {
    anvilProcess.kill();
    anvilProcess = null;
  }
}

async function waitForAnvil(retries = 20, delayMs = 300) {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  for (let i = 0; i < retries; i++) {
    try {
      await provider.getBlockNumber();
      return;
    } catch {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Anvil did not start in time');
}

export async function snapshot() {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  return provider.send('evm_snapshot', []);
}

export async function revert(snapshotId) {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  await provider.send('evm_revert', [snapshotId]);
}

export async function mineBlocks(n = 1) {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  for (let i = 0; i < n; i++) {
    await provider.send('evm_mine', []);
  }
}

export async function increaseTime(seconds) {
  const provider = new ethers.JsonRpcProvider(ANVIL_URL);
  await provider.send('evm_increaseTime', [seconds]);
  await provider.send('evm_mine', []);
}
