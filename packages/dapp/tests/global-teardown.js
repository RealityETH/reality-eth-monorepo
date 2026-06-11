import { stopAnvil } from './setup/anvil.js';
import { stopDappServer } from './setup/dapp-server.js';

export default async function globalTeardown() {
  await stopDappServer();
  await stopAnvil();
}
