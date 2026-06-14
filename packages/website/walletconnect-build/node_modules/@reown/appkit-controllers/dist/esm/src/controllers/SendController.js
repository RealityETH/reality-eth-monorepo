import { proxy, ref, subscribe as sub } from 'valtio/vanilla';
import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { ConstantsUtil as CommonConstantsUtil, ErrorUtil, NumberUtil, UserRejectedRequestError } from '@reown/appkit-common';
import { ContractUtil } from '@reown/appkit-common';
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils';
import { BalanceUtil } from '../utils/BalanceUtil.js';
import { getActiveNetworkTokenAddress, getPreferredAccountType } from '../utils/ChainControllerUtil.js';
import { ConstantsUtil } from '../utils/ConstantsUtil.js';
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js';
import { SwapApiUtil } from '../utils/SwapApiUtil.js';
import { withErrorBoundary } from '../utils/withErrorBoundary.js';
import { ChainController } from './ChainController.js';
import { ConnectionController } from './ConnectionController.js';
import { EventsController } from './EventsController.js';
import { RouterController } from './RouterController.js';
import { SnackController } from './SnackController.js';
// -- State --------------------------------------------- //
const state = proxy({
    tokenBalances: [],
    loading: false
});
// -- Controller ---------------------------------------- //
const controller = {
    state,
    subscribe(callback) {
        return sub(state, () => callback(state));
    },
    subscribeKey(key, callback) {
        return subKey(state, key, callback);
    },
    setToken(token) {
        if (token) {
            state.token = ref(token);
        }
    },
    setTokenAmount(sendTokenAmount) {
        state.sendTokenAmount = sendTokenAmount;
    },
    setReceiverAddress(receiverAddress) {
        state.receiverAddress = receiverAddress;
    },
    setReceiverProfileImageUrl(receiverProfileImageUrl) {
        state.receiverProfileImageUrl = receiverProfileImageUrl;
    },
    setReceiverProfileName(receiverProfileName) {
        state.receiverProfileName = receiverProfileName;
    },
    setNetworkBalanceInUsd(networkBalanceInUSD) {
        state.networkBalanceInUSD = networkBalanceInUSD;
    },
    setLoading(loading) {
        state.loading = loading;
    },
    getSdkEventProperties(error) {
        return {
            message: CoreHelperUtil.parseError(error),
            isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
            token: state.token?.symbol || '',
            amount: state.sendTokenAmount ?? 0,
            network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        };
    },
    async sendToken() {
        try {
            SendController.setLoading(true);
            switch (ChainController.state.activeCaipNetwork?.chainNamespace) {
                case 'eip155':
                    await SendController.sendEvmToken();
                    return;
                case 'solana':
                    await SendController.sendSolanaToken();
                    return;
                default:
                    throw new Error('Unsupported chain');
            }
        }
        catch (err) {
            if (ErrorUtil.isUserRejectedRequestError(err)) {
                throw new UserRejectedRequestError(err);
            }
            throw err;
        }
        finally {
            SendController.setLoading(false);
        }
    },
    async sendEvmToken() {
        const activeChainNamespace = ChainController.state.activeChain;
        if (!activeChainNamespace) {
            throw new Error('SendController:sendEvmToken - activeChainNamespace is required');
        }
        const activeAccountType = getPreferredAccountType(activeChainNamespace);
        if (!SendController.state.sendTokenAmount || !SendController.state.receiverAddress) {
            throw new Error('An amount and receiver address are required');
        }
        if (!SendController.state.token) {
            throw new Error('A token is required');
        }
        if (SendController.state.token?.address) {
            EventsController.sendEvent({
                type: 'track',
                event: 'SEND_INITIATED',
                properties: {
                    isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
                    token: SendController.state.token.address,
                    amount: SendController.state.sendTokenAmount,
                    network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
                }
            });
            const { hash } = await SendController.sendERC20Token({
                receiverAddress: SendController.state.receiverAddress,
                tokenAddress: SendController.state.token.address,
                sendTokenAmount: SendController.state.sendTokenAmount,
                decimals: SendController.state.token.quantity.decimals
            });
            if (hash) {
                state.hash = hash;
            }
        }
        else {
            EventsController.sendEvent({
                type: 'track',
                event: 'SEND_INITIATED',
                properties: {
                    isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
                    token: SendController.state.token.symbol || '',
                    amount: SendController.state.sendTokenAmount,
                    network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
                }
            });
            const { hash } = await SendController.sendNativeToken({
                receiverAddress: SendController.state.receiverAddress,
                sendTokenAmount: SendController.state.sendTokenAmount,
                decimals: SendController.state.token.quantity.decimals
            });
            if (hash) {
                state.hash = hash;
            }
        }
    },
    async fetchTokenBalance(onError) {
        state.loading = true;
        const namespace = ChainController.state.activeChain;
        const chainId = ChainController.state.activeCaipNetwork?.caipNetworkId;
        const chain = ChainController.state.activeCaipNetwork?.chainNamespace;
        const caipAddress = ChainController.getAccountData(namespace)?.caipAddress ??
            ChainController.state.activeCaipAddress;
        const address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined;
        if (state.lastRetry &&
            !CoreHelperUtil.isAllowedRetry(state.lastRetry, 30 * ConstantsUtil.ONE_SEC_MS)) {
            state.loading = false;
            return [];
        }
        try {
            if (address && chainId && chain) {
                const balances = await BalanceUtil.getMyTokensWithBalance();
                state.tokenBalances = balances;
                state.lastRetry = undefined;
                return balances;
            }
        }
        catch (error) {
            state.lastRetry = Date.now();
            onError?.(error);
            SnackController.showError('Token Balance Unavailable');
        }
        finally {
            state.loading = false;
        }
        return [];
    },
    fetchNetworkBalance() {
        if (state.tokenBalances.length === 0) {
            return;
        }
        const networkTokenBalances = SwapApiUtil.mapBalancesToSwapTokens(state.tokenBalances);
        if (!networkTokenBalances) {
            return;
        }
        const networkToken = networkTokenBalances.find(token => token.address === getActiveNetworkTokenAddress());
        if (!networkToken) {
            return;
        }
        state.networkBalanceInUSD = networkToken
            ? NumberUtil.multiply(networkToken.quantity.numeric, networkToken.price).toString()
            : '0';
    },
    async sendNativeToken(params) {
        RouterController.pushTransactionStack({});
        const to = params.receiverAddress;
        const address = ChainController.getAccountData()?.address;
        const value = ConnectionController.parseUnits(params.sendTokenAmount.toString(), Number(params.decimals));
        const data = '0x';
        const hash = await ConnectionController.sendTransaction({
            chainNamespace: CommonConstantsUtil.CHAIN.EVM,
            to,
            address,
            data,
            value: value ?? BigInt(0)
        });
        EventsController.sendEvent({
            type: 'track',
            event: 'SEND_SUCCESS',
            properties: {
                isSmartAccount: getPreferredAccountType('eip155') === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
                token: SendController.state.token?.symbol || '',
                amount: params.sendTokenAmount,
                network: ChainController.state.activeCaipNetwork?.caipNetworkId || '',
                hash: hash || ''
            }
        });
        ConnectionController._getClient()?.updateBalance('eip155');
        SendController.resetSend();
        return { hash };
    },
    async sendERC20Token(params) {
        RouterController.pushTransactionStack({
            onSuccess() {
                RouterController.replace('Account');
            }
        });
        const amount = ConnectionController.parseUnits(params.sendTokenAmount.toString(), Number(params.decimals));
        const address = ChainController.getAccountData()?.address;
        if (address && params.sendTokenAmount && params.receiverAddress && params.tokenAddress) {
            const tokenAddress = CoreHelperUtil.getPlainAddress(params.tokenAddress);
            if (!tokenAddress) {
                throw new Error('SendController:sendERC20Token - tokenAddress is required');
            }
            const hash = await ConnectionController.writeContract({
                fromAddress: address,
                tokenAddress,
                args: [params.receiverAddress, amount ?? BigInt(0)],
                method: 'transfer',
                abi: ContractUtil.getERC20Abi(tokenAddress),
                chainNamespace: CommonConstantsUtil.CHAIN.EVM
            });
            EventsController.sendEvent({
                type: 'track',
                event: 'SEND_SUCCESS',
                properties: {
                    isSmartAccount: getPreferredAccountType('eip155') === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
                    token: SendController.state.token?.symbol || '',
                    amount: params.sendTokenAmount,
                    network: ChainController.state.activeCaipNetwork?.caipNetworkId || '',
                    hash: hash || ''
                }
            });
            SendController.resetSend();
            return { hash };
        }
        return { hash: undefined };
    },
    async sendSolanaToken() {
        if (!SendController.state.sendTokenAmount || !SendController.state.receiverAddress) {
            throw new Error('An amount and receiver address are required');
        }
        RouterController.pushTransactionStack({
            onSuccess() {
                RouterController.replace('Account');
            }
        });
        let tokenMint = undefined;
        if (SendController.state.token &&
            SendController.state.token.address !== ConstantsUtil.SOLANA_NATIVE_TOKEN_ADDRESS) {
            if (CoreHelperUtil.isCaipAddress(SendController.state.token.address)) {
                tokenMint = CoreHelperUtil.getPlainAddress(SendController.state.token.address);
            }
            else {
                tokenMint = SendController.state.token.address;
            }
        }
        const hash = await ConnectionController.sendTransaction({
            chainNamespace: 'solana',
            tokenMint,
            to: SendController.state.receiverAddress,
            value: SendController.state.sendTokenAmount
        });
        if (hash) {
            state.hash = hash;
        }
        ConnectionController._getClient()?.updateBalance('solana');
        EventsController.sendEvent({
            type: 'track',
            event: 'SEND_SUCCESS',
            properties: {
                isSmartAccount: false,
                token: SendController.state.token?.symbol || '',
                amount: SendController.state.sendTokenAmount,
                network: ChainController.state.activeCaipNetwork?.caipNetworkId || '',
                hash: hash || ''
            }
        });
        SendController.resetSend();
    },
    resetSend() {
        state.token = undefined;
        state.sendTokenAmount = undefined;
        state.receiverAddress = undefined;
        state.receiverProfileImageUrl = undefined;
        state.receiverProfileName = undefined;
        state.loading = false;
        state.tokenBalances = [];
    }
};
// Export the controller wrapped with our error boundary
export const SendController = withErrorBoundary(controller);
//# sourceMappingURL=SendController.js.map