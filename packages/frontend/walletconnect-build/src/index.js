import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Exposed as window.WalletConnectProvider so plain script tags can use it.
// Loaded lazily by wallet.js only when the user clicks "Connect wallet"
// and no injected wallet (window.ethereum) is present.
window.WalletConnectProvider = { EthereumProvider };
