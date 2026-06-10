import { startAnvil } from './setup/anvil.js';
import { startDappServer } from './setup/dapp-server.js';

export default async function globalSetup() {
  await startAnvil();
  await startDappServer();
}
