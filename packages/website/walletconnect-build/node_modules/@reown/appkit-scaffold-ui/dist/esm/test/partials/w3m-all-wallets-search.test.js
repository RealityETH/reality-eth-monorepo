import { elementUpdated, fixture } from '@open-wc/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';
import { ApiController, ChainController, ConnectionController, ConnectorController, CoreHelperUtil, OptionsController, RouterController } from '@reown/appkit-controllers';
import { W3mAllWalletsSearch } from '../../src/partials/w3m-all-wallets-search';
const mockWallet = { id: 'test-wallet', name: 'Test Wallet', rdns: 'test.rdns' };
describe('W3mAllWalletsSearch', () => {
    let element;
    beforeEach(async () => {
        global.IntersectionObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            disconnect: vi.fn()
        }));
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            value: 400
        });
        Element.prototype.animate = vi.fn().mockReturnValue({
            finished: Promise.resolve()
        });
        element = await fixture(html `<w3m-all-wallets-search></w3m-all-wallets-search>`);
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    it('should render loading spinner initially', () => {
        const spinner = element.shadowRoot?.querySelector('wui-loading-spinner');
        expect(spinner).toBeTruthy();
    });
    it('should render no wallet found message when search returns empty', async () => {
        const mockState = {
            search: [],
            page: 1,
            count: 0,
            featured: [],
            allFeatured: [],
            promises: {},
            allRecommended: [],
            filteredWallets: [],
            recommended: [],
            wallets: [],
            isAnalyticsEnabled: false,
            excludedWallets: [],
            isFetchingRecommendedWallets: false,
            explorerWallets: [],
            explorerFilteredWallets: [],
            plan: {
                tier: 'starter',
                hasExceededUsageLimit: false,
                limits: {
                    isAboveRpcLimit: false,
                    isAboveMauLimit: false
                }
            }
        };
        vi.spyOn(ApiController, 'state', 'get').mockReturnValue(mockState);
        vi.spyOn(ApiController, 'searchWallet').mockResolvedValue();
        element.query = 'nonexistent';
        await elementUpdated(element);
        const noWalletMessage = element.shadowRoot?.querySelector('[data-testid="no-wallet-found-text"]');
        expect(noWalletMessage).toBeTruthy();
    });
    it('should render wallet list when search returns results', async () => {
        const mockWallets = [mockWallet];
        const mockState = {
            search: mockWallets,
            page: 1,
            count: mockWallets.length,
            promises: {},
            featured: [],
            allFeatured: [],
            recommended: [],
            allRecommended: [],
            filteredWallets: [],
            wallets: mockWallets,
            isAnalyticsEnabled: false,
            excludedWallets: [],
            isFetchingRecommendedWallets: false,
            explorerWallets: [],
            explorerFilteredWallets: [],
            plan: {
                tier: 'starter',
                hasExceededUsageLimit: false,
                limits: {
                    isAboveRpcLimit: false,
                    isAboveMauLimit: false
                }
            }
        };
        vi.spyOn(ApiController, 'state', 'get').mockReturnValue(mockState);
        vi.spyOn(ApiController, 'searchWallet').mockResolvedValue();
        element.query = 'metamask';
        await elementUpdated(element);
        const walletList = element.shadowRoot?.querySelector('[data-testid="wallet-list"]');
        expect(walletList).toBeTruthy();
        const walletItem = element.shadowRoot?.querySelector(`[data-testid="wallet-search-item-${mockWallet.id}"]`);
        expect(walletItem).toBeTruthy();
    });
    it('should trigger search when query changes', async () => {
        const searchSpy = vi.spyOn(ApiController, 'searchWallet').mockResolvedValue();
        element.query = 'new search';
        await elementUpdated(element);
        expect(searchSpy).toHaveBeenCalledWith({
            search: 'new search',
            badge: undefined
        });
    });
    it('should handle wallet connection for external connector', async () => {
        const mockConnector = {
            id: 'mock-connector',
            type: 'INJECTED',
            name: 'Mock Connector',
            provider: {},
            chain: 'eip155'
        };
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155'
        });
        vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(mockConnector);
        const routerPushSpy = vi.spyOn(RouterController, 'push');
        const mockExternalWallet = { ...mockWallet, id: 'external', rdns: 'mock.rdns' };
        element.onConnectWallet(mockExternalWallet);
        expect(ConnectorController.getConnector).toHaveBeenCalledWith({
            id: mockExternalWallet.id,
            namespace: 'eip155'
        });
        expect(routerPushSpy).toHaveBeenCalledWith('ConnectingExternal', {
            connector: mockConnector,
            wallet: mockExternalWallet
        });
    });
    it('should handle wallet connection for WalletConnect', async () => {
        vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined);
        const routerPushSpy = vi.spyOn(RouterController, 'push');
        element.onConnectWallet(mockWallet);
        expect(ConnectorController.getConnector).toHaveBeenCalledWith({
            id: mockWallet.id,
            namespace: 'eip155'
        });
        expect(routerPushSpy).toHaveBeenCalledWith('ConnectingWalletConnect', { wallet: mockWallet });
    });
    it('should update search when badge property changes', async () => {
        const searchSpy = vi.spyOn(ApiController, 'searchWallet').mockResolvedValue();
        element.badge = 'recent';
        await elementUpdated(element);
        expect(searchSpy).toHaveBeenCalledWith({
            search: '',
            badge: 'recent'
        });
    });
    it('should set the correct properties and values mobileFullScreen is true', async () => {
        OptionsController.state.enableMobileFullScreen = true;
        const el = (await fixture(html `<w3m-all-wallets-search></w3m-all-wallets-search>`));
        await elementUpdated(el);
        expect(el.getAttribute('data-mobile-fullscreen')).toBe('true');
    });
    it('should set the correct properties and values mobileFullScreen is false', async () => {
        OptionsController.state.enableMobileFullScreen = false;
        const el = (await fixture(html `<w3m-all-wallets-search></w3m-all-wallets-search>`));
        await elementUpdated(el);
        expect(el.getAttribute('data-mobile-fullscreen')).toBeNull();
    });
    it('should filter search results by WC support on mobile', async () => {
        const mockSearchResults = [
            { id: '1', name: 'Mobile Wallet', supports_wc: true },
            { id: '2', name: 'Desktop Only Wallet', supports_wc: false },
            { id: '3', name: 'Universal Wallet', supports_wc: true }
        ];
        vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
            ...ApiController.state,
            search: mockSearchResults
        });
        vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true);
        vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([]);
        element.query = 'wallet';
        await elementUpdated(element);
        const walletItems = element.shadowRoot?.querySelectorAll('[data-testid^="wallet-search-item"]');
        expect(walletItems?.length).toBe(2);
    });
    it('should show all search results on desktop with Appkit', async () => {
        const mockSearchResults = [
            { id: '1', name: 'Mobile Wallet', supports_wc: true },
            { id: '2', name: 'Desktop Only Wallet', supports_wc: false },
            { id: '3', name: 'Universal Wallet', supports_wc: true }
        ];
        vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
            ...ApiController.state,
            search: mockSearchResults
        });
        vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false);
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
            ...OptionsController.state,
            manualWCControl: false
        });
        vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
            ...ConnectionController.state,
            wcBasic: false
        });
        vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([]);
        element.query = 'wallet';
        await elementUpdated(element);
        const walletItems = element.shadowRoot?.querySelectorAll('[data-testid^="wallet-search-item"]');
        expect(walletItems?.length).toBe(3);
    });
});
//# sourceMappingURL=w3m-all-wallets-search.test.js.map