import { Buffer } from 'buffer';
// Make Buffer available globally — WalletConnect uses it internally
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
