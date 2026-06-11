import { stopAnvil } from './setup/anvil.js';
import { stopDappServer } from './setup/dapp-server.js';
import { stopQuestionServer } from './setup/question-server.js';

export default async function globalTeardown() {
  await Promise.all([stopDappServer(), stopQuestionServer()]);
  await stopAnvil();
}
