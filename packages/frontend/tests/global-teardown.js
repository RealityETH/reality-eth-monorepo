import { stopAnvil } from './setup/anvil.js';
import { stopWebsiteServer } from './setup/website-server.js';

export default async function globalTeardown() {
  await stopWebsiteServer();
  await stopAnvil();
}
