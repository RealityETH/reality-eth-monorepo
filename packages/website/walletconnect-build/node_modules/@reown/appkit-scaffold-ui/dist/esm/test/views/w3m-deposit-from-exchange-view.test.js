import { elementUpdated, fixture } from '@open-wc/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';
import { ChainController, ConnectionController, ExchangeController, RouterController, SnackController } from '@reown/appkit-controllers';
import { W3mDepositFromExchangeView } from '../../src/views/w3m-deposit-from-exchange-view';
import { HelpersUtil } from '../utils/HelpersUtil';
const mockMainnet = {
    id: '1',
    name: 'Mainnet',
    chainNamespace: 'eip155',
    caipNetworkId: 'eip155:1',
    nativeCurrency: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY']
        }
    }
};
const mockSolanaMainnet = {
    id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana Mainnet',
    chainNamespace: 'solana',
    caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    nativeCurrency: { symbol: 'SOL', name: 'Solana', decimals: 9 },
    rpcUrls: {
        default: {
            http: ['https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY']
        }
    }
};
describe('W3mDepositFromExchangeView', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    it('should fetch and set default payment asset on first update', async () => {
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeCaipNetwork: mockSolanaMainnet
        });
        const getAssetsForNetworkSpy = vi
            .spyOn(ExchangeController, 'getAssetsForNetwork')
            .mockResolvedValue([
            {
                network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
                asset: 'native',
                price: 1,
                metadata: {
                    iconUrl: 'https://img.solana.com/solana-logo-full.svg',
                    name: 'Solana',
                    symbol: 'SOL',
                    decimals: 9
                }
            }
        ]);
        const setPaymentAssetSpy = vi.spyOn(ExchangeController, 'setPaymentAsset');
        const fetchExchangesSpy = vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue();
        await fixture(html `<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`);
        expect(getAssetsForNetworkSpy).toHaveBeenCalledWith('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
        expect(setPaymentAssetSpy).toHaveBeenCalledWith({
            network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            asset: 'native',
            price: 1,
            metadata: {
                iconUrl: 'https://img.solana.com/solana-logo-full.svg',
                name: 'Solana',
                symbol: 'SOL',
                decimals: 9
            }
        });
        expect(fetchExchangesSpy).toHaveBeenCalled();
    });
    it('renders exchanges and asset token button, and calls controller on interactions', async () => {
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeCaipNetwork: mockMainnet
        });
        const mockPaymentAsset = {
            network: 'eip155:1',
            asset: 'native',
            price: 1,
            metadata: {
                iconUrl: 'https://img.solana.com/solana-logo-full.svg',
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
            }
        };
        vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([mockPaymentAsset]);
        vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue();
        const element = await fixture(html `<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`);
        ExchangeController.state.exchanges = [
            { id: 'ex1', imageUrl: 'https://img1', name: 'Exchange One' },
            { id: 'ex2', imageUrl: 'https://img2', name: 'Exchange Two' }
        ];
        ExchangeController.state.amount = 0;
        ExchangeController.state.paymentAsset = mockPaymentAsset;
        await elementUpdated(element);
        const assetButton = HelpersUtil.getByTestId(element, 'deposit-from-exchange-asset-button');
        expect(assetButton).toBeTruthy();
        expect(assetButton?.getAttribute('text')).toBe('ETH');
        const routerSpy = vi.spyOn(RouterController, 'push');
        assetButton?.click();
        expect(routerSpy).toHaveBeenCalledWith('PayWithExchangeSelectAsset');
        const items = HelpersUtil.querySelectAll(element, 'wui-list-item');
        expect(items?.length).toBe(2);
        const setAmountSpy = vi.spyOn(ExchangeController, 'setAmount');
        const presetButtons = HelpersUtil.querySelectAll(element, 'wui-chip-button');
        presetButtons?.[0]?.click();
        await elementUpdated(element);
        expect(setAmountSpy).toHaveBeenCalledWith(10);
        ExchangeController.state.amount = 25;
        const handleSpy = vi.spyOn(ExchangeController, 'handlePayWithExchange').mockResolvedValue();
        items?.[0]?.click();
        expect(handleSpy).toHaveBeenCalledWith('ex1');
    });
    it('shows set amount during first update', async () => {
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeCaipNetwork: mockMainnet
        });
        ExchangeController.state.exchanges = [
            { id: 'ex1', imageUrl: 'https://img1', name: 'Exchange One' }
        ];
        vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([]);
        vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue();
        const element = await fixture(html `<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`);
        await elementUpdated(element);
        expect(ExchangeController.state.amount).toBe(10);
    });
    it('shows chainImageSrc on token button', async () => {
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeCaipNetwork: {
                ...mockMainnet,
                assets: { imageUrl: 'https://chain.example/eth.png' }
            }
        });
        vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([]);
        vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue();
        const element = await fixture(html `<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`);
        await elementUpdated(element);
        const assetButton = HelpersUtil.getByTestId(element, 'deposit-from-exchange-asset-button');
        expect(assetButton).toBeTruthy();
        expect(assetButton.chainImageSrc).toBe('https://chain.example/eth.png');
    });
    it('does not reset on disconnect while payment is in progress', async () => {
        vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([]);
        vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue();
        const resetSpy = vi.spyOn(ExchangeController, 'reset').mockImplementation(() => { });
        const element = await fixture(html `<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`);
        await elementUpdated(element);
        ExchangeController.state.isPaymentInProgress = true;
        ExchangeController.state.currentPayment = {
            type: 'exchange',
            exchangeId: 'coinbase',
            sessionId: 'session',
            status: 'IN_PROGRESS'
        };
        element.disconnectedCallback();
        expect(resetSpy).not.toHaveBeenCalled();
    });
    it('resets when transaction succeeds', async () => {
        vi.spyOn(ExchangeController, 'getAssetsForNetwork').mockResolvedValue([]);
        vi.spyOn(ExchangeController, 'fetchExchanges').mockResolvedValue();
        vi.spyOn(SnackController, 'showLoading').mockImplementation(() => { });
        vi.spyOn(SnackController, 'showSuccess').mockImplementation(() => { });
        vi.spyOn(RouterController, 'replace').mockImplementation(() => { });
        vi.spyOn(ChainController, 'fetchTokenBalance').mockResolvedValue(undefined);
        vi.spyOn(ConnectionController, 'updateBalance').mockResolvedValue(undefined);
        const resetSpy = vi.spyOn(ExchangeController, 'reset').mockImplementation(() => { });
        vi.spyOn(ExchangeController, 'waitUntilComplete').mockResolvedValue({
            status: 'SUCCESS',
            txHash: '0xabc'
        });
        ExchangeController.state.isPaymentInProgress = true;
        ExchangeController.state.paymentId = 'payment-1';
        ExchangeController.state.currentPayment = {
            type: 'exchange',
            exchangeId: 'coinbase',
            sessionId: 'session-1',
            status: 'IN_PROGRESS'
        };
        const element = await fixture(html `<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`);
        await elementUpdated(element);
        element.handlePaymentInProgress();
        await elementUpdated(element);
        expect(resetSpy).toHaveBeenCalled();
    });
});
//# sourceMappingURL=w3m-deposit-from-exchange-view.test.js.map