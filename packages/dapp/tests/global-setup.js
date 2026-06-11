import { startAnvil } from './setup/anvil.js';
import { startDappServer } from './setup/dapp-server.js';
import { startQuestionServer } from './setup/question-server.js';

export default async function globalSetup() {
  await startAnvil();
  await Promise.all([startDappServer(), startQuestionServer()]);
}
