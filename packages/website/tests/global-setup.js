import { startAnvil } from './setup/anvil.js';
import { startWebsiteServer } from './setup/website-server.js';

export default async function globalSetup() {
  await startAnvil();
  await startWebsiteServer();
}
