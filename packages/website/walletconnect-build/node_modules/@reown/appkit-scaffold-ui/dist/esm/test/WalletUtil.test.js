import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectionController, ConnectorController, CoreHelperUtil, OptionsController, StorageUtil, WalletUtil } from '@reown/appkit-controllers';
const mockMetamaskConnector = {
    info: { rdns: 'io.metamask' },
    name: 'Metamask',
    id: '1',
    explorerId: '1',
    chain: 'eip155',
    type: 'ANNOUNCED'
};
const mockMetamaskMultiChainConnector = {
    info: { rdns: 'io.metamask' },
    name: 'Metamask',
    id: '1',
    explorerId: '1',
    chain: 'eip155',
    type: 'MULTI_CHAIN'
};
const mockRainbowConnector = {
    info: { rdns: 'io.rainbow' },
    name: 'Rainbow',
    id: '2',
    explorerId: '2',
    chain: 'eip155',
    type: 'ANNOUNCED'
};
const mockMetamaskMobileConnector = {
    info: { rdns: 'io.metamask.mobile' },
    name: 'Metamask',
    id: '4',
    explorerId: '4',
    chain: 'eip155',
    type: 'ANNOUNCED'
};
const mockCoinbaseconnector = {
    info: { rdns: 'io.coinbase' },
    name: 'Coinbase',
    id: '5',
    explorerId: '5',
    chain: 'eip155',
    type: 'EXTERNAL'
};
const mockBitGetConnector = {
    info: { rdns: 'io.bitget' },
    name: 'BitGet Wallet',
    id: '6',
    explorerId: '6',
    chain: 'eip155',
    type: 'ANNOUNCED'
};
const mockMetamaskWallet = { id: '1', name: 'Wallet 1', rdns: 'io.metamask' };
const mockRainbowWallet = { id: '2', name: 'Wallet 2', rdns: 'io.rainbow' };
const mockTrustWallet = { id: '3', name: 'Wallet 3', rdns: 'io.trustwallet' };
const mockCoinbaseWallet = { id: '5', name: 'Wallet 5', rdns: 'io.coinbase' };
const mockBitGetWallet = { id: '6', name: 'BitGet Wallet', rdns: null };
describe('WalletUtil', () => {
    const mockWallets = [
        mockMetamaskWallet,
        mockRainbowWallet,
        mockTrustWallet,
        mockBitGetWallet
    ];
    beforeEach(() => {
        vi.restoreAllMocks();
        OptionsController.state.enableEIP6963 = true;
        OptionsController.state.featuredWalletIds = [];
    });
    describe('filterOutDuplicatesByRDNS', () => {
        it("should filter out wallets with RDNS or wallets that exactly match a connector name when they don't have RDNS from connectors and recent wallets", () => {
            const mockConnectors = [
                mockMetamaskConnector,
                mockRainbowConnector,
                mockCoinbaseconnector,
                mockBitGetConnector
            ];
            const mockRecentWallets = [mockTrustWallet];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets);
            vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false);
            const filteredWallets = WalletUtil.filterOutDuplicatesByRDNS(mockWallets);
            expect(filteredWallets).toEqual([]);
        });
        it('should replace "io.metamask.mobile" with "io.metamask" on mobile', () => {
            const mockConnectors = [mockMetamaskMobileConnector];
            const mockRecentWallets = [];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets);
            vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true);
            const filteredWallets = WalletUtil.filterOutDuplicatesByRDNS(mockWallets);
            expect(filteredWallets).toEqual(mockWallets.filter(wallet => wallet.rdns !== 'io.metamask'));
        });
        it('should return all wallets if no connectors or recent wallets have RDNS', () => {
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([]);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([]);
            const filteredWallets = WalletUtil.filterOutDuplicatesByRDNS(mockWallets);
            expect(filteredWallets).toEqual(mockWallets);
        });
    });
    describe('filterOutDuplicatesByIds', () => {
        it('should filter out wallets with IDs from connectors and recent wallets', () => {
            const mockConnectors = [mockMetamaskConnector, mockRainbowConnector, mockBitGetConnector];
            const mockRecentWallets = [mockTrustWallet];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets);
            const filteredWallets = WalletUtil.filterOutDuplicatesByIds(mockWallets);
            expect(filteredWallets).toEqual([]);
        });
        it('should filter out wallets with IDs from multi-chain connectors', () => {
            const mockConnectors = [
                mockRainbowConnector,
                mockBitGetConnector,
                mockMetamaskMultiChainConnector
            ];
            const mockRecentWallets = [mockTrustWallet];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets);
            const filteredWallets = WalletUtil.filterOutDuplicatesByIds(mockWallets);
            expect(filteredWallets).toEqual([]);
        });
        it('should not filter if connector is not Injected or Announced', () => {
            const mockConnectors = [mockMetamaskConnector, mockRainbowConnector, mockBitGetConnector];
            const mockRecentWallets = [mockTrustWallet];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets);
            const filteredWallets = WalletUtil.filterOutDuplicatesByIds([
                ...mockWallets,
                mockCoinbaseWallet
            ]);
            expect(filteredWallets).toEqual([mockCoinbaseWallet]);
        });
        it('should return all wallets if no connectors or recent wallets have IDs', () => {
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue([]);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue([]);
            const filteredWallets = WalletUtil.filterOutDuplicatesByIds(mockWallets);
            expect(filteredWallets).toEqual(mockWallets);
        });
    });
    describe('filterOutDuplicateWallets', () => {
        it('should filter out wallets with duplicate RDNS and IDs', () => {
            const mockConnectors = [mockMetamaskConnector, mockBitGetConnector];
            const mockRecentWallets = [mockTrustWallet];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets);
            const filteredWallets = WalletUtil.filterOutDuplicateWallets(mockWallets);
            expect(filteredWallets).toEqual([mockRainbowWallet]);
        });
        it('should return all wallets if no duplicates exist by RDNS or IDs', () => {
            const mockConnectors = [];
            const mockRecentWallets = [];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            vi.spyOn(StorageUtil, 'getRecentWallets').mockReturnValue(mockRecentWallets);
            const filteredWallets = WalletUtil.filterOutDuplicateWallets(mockWallets);
            expect(filteredWallets).toEqual(mockWallets);
        });
    });
    describe('markWalletsAsInstalled', () => {
        const mockWallets = [
            { id: '1', name: 'Wallet 1', rdns: 'io.metamask' },
            { id: '2', name: 'Wallet 2', rdns: 'io.rainbow' },
            { id: '3', name: 'Wallet 3', rdns: 'io.trustwallet' }
        ];
        beforeEach(() => {
            vi.restoreAllMocks();
        });
        it('should mark wallets as installed based on connectors', () => {
            const mockConnectors = [mockMetamaskConnector, mockRainbowConnector];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            const result = WalletUtil.markWalletsAsInstalled(mockWallets);
            expect(result).toEqual([
                { ...mockMetamaskWallet, installed: true },
                { ...mockRainbowWallet, installed: true },
                { ...mockTrustWallet, installed: false }
            ]);
        });
        it('should return wallets sorted by installed status', () => {
            const mockConnectors = [mockRainbowConnector];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            const result = WalletUtil.markWalletsAsInstalled(mockWallets);
            expect(result).toEqual([
                { ...mockRainbowWallet, installed: true },
                { ...mockMetamaskWallet, installed: false },
                { ...mockTrustWallet, installed: false }
            ]);
        });
        it('should return wallets with installed false if no matching connectors are found', () => {
            const mockConnectors = [
                {
                    type: 'ANNOUNCED',
                    info: { rdns: 'io.someotherwallet' },
                    name: 'Test Wallet',
                    id: '1233',
                    chain: 'eip155'
                }
            ];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            const result = WalletUtil.markWalletsAsInstalled(mockWallets);
            expect(result).toEqual([
                { ...mockMetamaskWallet, installed: false },
                { ...mockRainbowWallet, installed: false },
                { ...mockTrustWallet, installed: false }
            ]);
        });
        it('should sort installed wallets according to featuredWalletIds order', () => {
            OptionsController.state.featuredWalletIds = ['3', '1', '2'];
            const mockConnectors = [mockMetamaskConnector, mockRainbowConnector];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            const result = WalletUtil.markWalletsAsInstalled(mockWallets);
            expect(result).toEqual([
                { ...mockMetamaskWallet, installed: true },
                { ...mockRainbowWallet, installed: true },
                { ...mockTrustWallet, installed: false }
            ]);
        });
        it('should handle wallets without RDNS', () => {
            const walletsWithoutRDNS = [
                { id: '1', name: 'Wallet 1' },
                { id: '2', name: 'Wallet 2', rdns: 'io.rainbow' }
            ];
            const mockConnectors = [mockRainbowConnector];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            const result = WalletUtil.markWalletsAsInstalled(walletsWithoutRDNS);
            expect(result).toEqual([
                { id: '2', name: 'Wallet 2', rdns: 'io.rainbow', installed: true },
                { id: '1', name: 'Wallet 1', installed: false }
            ]);
        });
        it('should sort multiple installed wallets by featuredWalletIds order', () => {
            const testWallets = [
                { id: 'wallet1', name: 'Wallet 1', rdns: 'io.wallet1' },
                { id: 'wallet2', name: 'Wallet 2', rdns: 'io.wallet2' },
                { id: 'wallet3', name: 'Wallet 3', rdns: 'io.wallet3' },
                { id: 'wallet4', name: 'Wallet 4', rdns: 'io.wallet4' }
            ];
            OptionsController.state.featuredWalletIds = ['wallet3', 'wallet1', 'wallet4'];
            const mockConnectors = [
                { info: { rdns: 'io.wallet1' }, type: 'ANNOUNCED' },
                { info: { rdns: 'io.wallet2' }, type: 'ANNOUNCED' },
                { info: { rdns: 'io.wallet3' }, type: 'ANNOUNCED' },
                { info: { rdns: 'io.wallet4' }, type: 'ANNOUNCED' }
            ];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            const result = WalletUtil.markWalletsAsInstalled(testWallets);
            expect(result).toEqual([
                { ...testWallets[2], installed: true },
                { ...testWallets[0], installed: true },
                { ...testWallets[3], installed: true },
                { ...testWallets[1], installed: true }
            ]);
        });
        it('should handle empty featuredWalletIds array', () => {
            OptionsController.state.featuredWalletIds = [];
            const mockConnectors = [mockMetamaskConnector, mockRainbowConnector];
            vi.spyOn(ConnectorController.state, 'connectors', 'get').mockReturnValue(mockConnectors);
            const result = WalletUtil.markWalletsAsInstalled(mockWallets);
            expect(result).toEqual([
                { ...mockMetamaskWallet, installed: true },
                { ...mockRainbowWallet, installed: true },
                { ...mockTrustWallet, installed: false }
            ]);
        });
    });
    describe('filterWalletsByWcSupport', () => {
        const walletsWithWcSupport = [
            { id: '1', name: 'Wallet 1', supports_wc: true },
            { id: '2', name: 'Wallet 2', supports_wc: false },
            { id: '3', name: 'Wallet 3', supports_wc: true },
            { id: '4', name: 'Wallet 4' }
        ];
        beforeEach(() => {
            vi.restoreAllMocks();
            OptionsController.state.manualWCControl = false;
            ConnectionController.state.wcBasic = false;
        });
        it('should filter out wallets without WC support on mobile', () => {
            vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true);
            const result = WalletUtil.filterWalletsByWcSupport(walletsWithWcSupport);
            expect(result).toEqual([
                { id: '1', name: 'Wallet 1', supports_wc: true },
                { id: '3', name: 'Wallet 3', supports_wc: true }
            ]);
        });
        it('should filter out wallets without WC support when using Appkit Core (wcBasic)', () => {
            vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false);
            ConnectionController.state.wcBasic = true;
            const result = WalletUtil.filterWalletsByWcSupport(walletsWithWcSupport);
            expect(result).toEqual([
                { id: '1', name: 'Wallet 1', supports_wc: true },
                { id: '3', name: 'Wallet 3', supports_wc: true }
            ]);
        });
        it('should show all wallets on desktop with Appkit (not Appkit Core)', () => {
            vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false);
            OptionsController.state.manualWCControl = false;
            ConnectionController.state.wcBasic = false;
            const result = WalletUtil.filterWalletsByWcSupport(walletsWithWcSupport);
            expect(result).toEqual(walletsWithWcSupport);
        });
    });
});
//# sourceMappingURL=WalletUtil.test.js.map