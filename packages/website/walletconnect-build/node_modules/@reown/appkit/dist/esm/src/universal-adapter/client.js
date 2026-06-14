import bs58 from 'bs58';
import { toHex } from 'viem';
import { ConstantsUtil } from '@reown/appkit-common';
import { ChainController, ConstantsUtil as CoreConstantsUtil, CoreHelperUtil } from '@reown/appkit-controllers';
import { AdapterBlueprint, WalletConnectConnector } from '@reown/appkit-controllers';
import { WcConstantsUtil } from '../utils/ConstantsUtil.js';
export class UniversalAdapter extends AdapterBlueprint {
    async setUniversalProvider(universalProvider) {
        if (!this.namespace) {
            throw new Error('UniversalAdapter:setUniversalProvider - namespace is required');
        }
        this.addConnector(new WalletConnectConnector({
            provider: universalProvider,
            caipNetworks: this.getCaipNetworks(),
            namespace: this.namespace
        }));
        return Promise.resolve();
    }
    async connect(params) {
        return Promise.resolve({
            id: 'WALLET_CONNECT',
            type: 'WALLET_CONNECT',
            chainId: Number(params.chainId),
            provider: this.provider,
            address: ''
        });
    }
    async disconnect() {
        try {
            const connector = this.getWalletConnectConnector();
            await connector.disconnect();
            this.emit('disconnect');
        }
        catch (error) {
            console.warn('UniversalAdapter:disconnect - error', error);
        }
        return { connections: [] };
    }
    syncConnections() {
        return Promise.resolve();
    }
    async writeSolanaTransaction() {
        return Promise.resolve({
            hash: ''
        });
    }
    async getAccounts({ namespace }) {
        const provider = this.provider;
        const addresses = (provider?.session?.namespaces?.[namespace]?.accounts
            ?.map(account => {
            const [, , address] = account.split(':');
            return address;
        })
            .filter((address, index, self) => self.indexOf(address) === index) || []);
        return Promise.resolve({
            accounts: addresses.map(address => CoreHelperUtil.createAccount(namespace, address, namespace === 'bip122' ? 'payment' : 'eoa'))
        });
    }
    async syncConnectors() {
        return Promise.resolve();
    }
    async getBalance(params) {
        const isBalanceSupported = params.caipNetwork &&
            CoreConstantsUtil.BALANCE_SUPPORTED_CHAINS.includes(params.caipNetwork?.chainNamespace);
        if (!isBalanceSupported || params.caipNetwork?.testnet) {
            return {
                balance: '0.00',
                symbol: params.caipNetwork?.nativeCurrency.symbol || ''
            };
        }
        const accountData = ChainController.getAccountData();
        if (accountData?.balanceLoading &&
            params.chainId === ChainController.state.activeCaipNetwork?.id) {
            return {
                balance: accountData?.balance || '0.00',
                symbol: accountData?.balanceSymbol || ''
            };
        }
        const balances = await ChainController.fetchTokenBalance();
        const balance = balances.find(b => b.chainId === `${params.caipNetwork?.chainNamespace}:${params.chainId}` &&
            b.symbol === params.caipNetwork?.nativeCurrency.symbol);
        return {
            balance: balance?.quantity.numeric || '0.00',
            symbol: balance?.symbol || params.caipNetwork?.nativeCurrency.symbol || ''
        };
    }
    async signMessage(params) {
        const { provider, message, address } = params;
        if (!provider) {
            throw new Error('UniversalAdapter:signMessage - provider is undefined');
        }
        let signature = '';
        if (ChainController.state.activeCaipNetwork?.chainNamespace === ConstantsUtil.CHAIN.SOLANA) {
            const response = await provider.request({
                method: 'solana_signMessage',
                params: {
                    message: bs58.encode(new TextEncoder().encode(message)),
                    pubkey: address
                }
            }, ChainController.state.activeCaipNetwork?.caipNetworkId);
            signature = response.signature;
        }
        else {
            signature = await provider.request({
                method: 'personal_sign',
                params: [message, address]
            }, ChainController.state.activeCaipNetwork?.caipNetworkId);
        }
        return { signature };
    }
    // -- Transaction methods ---------------------------------------------------
    /**
     *
     * These methods are supported only on `wagmi` and `ethers` since the Solana SDK does not support them in the same way.
     * These function definition is to have a type parity between the clients. Currently not in use.
     */
    async estimateGas() {
        return Promise.resolve({
            gas: BigInt(0)
        });
    }
    async sendTransaction() {
        return Promise.resolve({
            hash: ''
        });
    }
    walletGetAssets(_params) {
        return Promise.resolve({});
    }
    async writeContract() {
        return Promise.resolve({
            hash: ''
        });
    }
    emitFirstAvailableConnection() {
        return undefined;
    }
    parseUnits() {
        return 0n;
    }
    formatUnits() {
        return '0';
    }
    async getCapabilities() {
        return Promise.resolve({});
    }
    async grantPermissions() {
        return Promise.resolve({});
    }
    async revokePermissions() {
        return Promise.resolve('0x');
    }
    async syncConnection() {
        return Promise.resolve({
            id: 'WALLET_CONNECT',
            type: 'WALLET_CONNECT',
            chainId: 1,
            provider: this.provider,
            address: ''
        });
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async switchNetwork(params) {
        const { caipNetwork } = params;
        const connector = this.getWalletConnectConnector();
        if (caipNetwork.chainNamespace === ConstantsUtil.CHAIN.EVM) {
            try {
                await connector.provider?.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: toHex(caipNetwork.id) }]
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (switchError) {
                if (switchError.code === WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
                    switchError.code === WcConstantsUtil.ERROR_INVALID_CHAIN_ID ||
                    switchError.code === WcConstantsUtil.ERROR_CODE_DEFAULT ||
                    switchError?.data?.originalError?.code ===
                        WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID) {
                    try {
                        await connector.provider?.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: toHex(caipNetwork.id),
                                    rpcUrls: [caipNetwork?.rpcUrls['chainDefault']?.http],
                                    chainName: caipNetwork.name,
                                    nativeCurrency: caipNetwork.nativeCurrency,
                                    blockExplorerUrls: [caipNetwork.blockExplorers?.default.url]
                                }
                            ]
                        });
                    }
                    catch (error) {
                        throw new Error('Chain is not supported');
                    }
                }
            }
        }
        connector.provider.setDefaultChain(caipNetwork.caipNetworkId);
    }
    getWalletConnectProvider() {
        const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT');
        const provider = connector?.provider;
        return provider;
    }
}
//# sourceMappingURL=client.js.map