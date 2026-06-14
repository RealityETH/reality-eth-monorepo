import { polygon } from 'viem/chains';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConstantsUtil as CommonConstantsUtil, ParseUtil } from '@reown/appkit-common';
import { ChainController, ConnectionController, ConnectionControllerUtil, ConnectorController, ConnectorControllerUtil, ConstantsUtil, CoreHelperUtil, EventsController, ModalController, PublicStateController, RouterController } from '../../exports/index.js';
// -- Setup --------------------------------------------------------------------
const chain = CommonConstantsUtil.CHAIN.EVM;
const walletConnectUri = 'wc://uri?=123';
const externalId = 'coinbaseWallet';
const type = 'WALLET_CONNECT';
const caipNetworks = [
    { ...polygon, chainNamespace: chain, caipNetworkId: 'eip155:137' }
];
const client = {
    connectWalletConnect: async () => { },
    disconnect: async () => Promise.resolve(),
    disconnectConnector: async () => Promise.resolve(),
    signMessage: async (message) => Promise.resolve(message),
    estimateGas: async () => Promise.resolve(BigInt(0)),
    connectExternal: async (_id) => Promise.resolve({ address: '' }),
    checkInstalled: _id => true,
    parseUnits: value => BigInt(value),
    formatUnits: value => value.toString(),
    sendTransaction: () => Promise.resolve('0x'),
    writeContract: () => Promise.resolve('0x'),
    writeSolanaTransaction: () => Promise.resolve('0x'),
    getEnsAddress: async (value) => Promise.resolve(value),
    getEnsAvatar: async (value) => Promise.resolve(value),
    getCapabilities: async () => Promise.resolve(''),
    grantPermissions: async () => Promise.resolve('0x'),
    revokePermissions: async () => Promise.resolve('0x'),
    walletGetAssets: async () => Promise.resolve({}),
    updateBalance: () => Promise.resolve()
};
const clientConnectWalletConnectSpy = vi.spyOn(client, 'connectWalletConnect');
const clientConnectExternalSpy = vi.spyOn(client, 'connectExternal');
const clientCheckInstalledSpy = vi.spyOn(client, 'checkInstalled');
const partialClient = {
    connectWalletConnect: async () => Promise.resolve(),
    disconnect: async () => Promise.resolve(),
    disconnectConnector: async () => Promise.resolve(),
    estimateGas: async () => Promise.resolve(BigInt(0)),
    signMessage: async (message) => Promise.resolve(message),
    parseUnits: value => BigInt(value),
    formatUnits: value => value.toString(),
    sendTransaction: () => Promise.resolve('0x'),
    writeContract: () => Promise.resolve('0x'),
    writeSolanaTransaction: () => Promise.resolve('0x'),
    getEnsAddress: async (value) => Promise.resolve(value),
    getEnsAvatar: async (value) => Promise.resolve(value),
    getCapabilities: async () => Promise.resolve(''),
    grantPermissions: async () => Promise.resolve('0x'),
    revokePermissions: async () => Promise.resolve('0x'),
    walletGetAssets: async () => Promise.resolve({}),
    updateBalance: () => Promise.resolve()
};
const evmAdapter = {
    namespace: CommonConstantsUtil.CHAIN.EVM,
    connectionControllerClient: client
};
const solanaAdapter = {
    namespace: CommonConstantsUtil.CHAIN.SOLANA,
    connectionControllerClient: client
};
const bip122Adapter = {
    namespace: CommonConstantsUtil.CHAIN.BITCOIN,
    connectionControllerClient: client
};
const adapters = [evmAdapter, solanaAdapter, bip122Adapter];
// -- Tests --------------------------------------------------------------------
beforeAll(() => {
    ChainController.initialize(adapters, [], {
        connectionControllerClient: client
    });
    ConnectionController.setClient(evmAdapter.connectionControllerClient);
});
describe('ConnectionController', () => {
    it('should have valid default state', () => {
        ChainController.initialize([
            {
                namespace: CommonConstantsUtil.CHAIN.EVM,
                connectionControllerClient: client,
                caipNetworks
            }
        ], caipNetworks, {
            connectionControllerClient: client
        });
        expect(ConnectionController.state).toEqual({
            connections: new Map(),
            recentConnections: new Map(),
            wcError: false,
            buffering: false,
            isSwitchingConnection: false,
            status: 'disconnected',
            _client: evmAdapter.connectionControllerClient,
            wcFetchingUri: false
        });
    });
    it('should update state correctly and set wcPromisae on connectWalletConnect()', async () => {
        const setConnectorIdSpy = vi.spyOn(ConnectorController, 'setConnectorId');
        // Await on set promise and check results
        await ConnectionController.connectWalletConnect();
        expect(clientConnectWalletConnectSpy).toHaveBeenCalled();
        expect(setConnectorIdSpy).not.toBeCalled();
        // Just in case
        vi.useRealTimers();
    });
    it('connectExternal() should trigger internal client call and set connector in storage', async () => {
        const options = { id: externalId, type };
        await ConnectionController.connectExternal(options, chain);
        expect(clientConnectExternalSpy).toHaveBeenCalledWith(options);
    });
    it('connectExternal() should send CONNECT_SUCCESS event for regular connector', async () => {
        const mockConnector = {
            id: externalId,
            type: 'INJECTED',
            name: 'Test Wallet',
            chain: chain,
            explorerWallet: { order: 5 }
        };
        ConnectorController.state.allConnectors = [mockConnector];
        RouterController.state.view = 'Connect';
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => { });
        const options = { id: externalId, type: 'INJECTED' };
        await ConnectionController.connectExternal(options, chain);
        expect(sendEventSpy).toHaveBeenCalledWith({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            properties: {
                method: 'browser',
                name: 'Test Wallet',
                view: 'Connect',
                walletRank: 5
            }
        });
    });
    it('connectExternal() should send CONNECT_SUCCESS event for AUTH connector with email method', async () => {
        const mockAuthConnector = {
            id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
            type: 'AUTH',
            name: 'Email',
            chain: chain
        };
        ConnectorController.state.allConnectors = [mockAuthConnector];
        RouterController.state.view = 'Connect';
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => { });
        const options = { id: CommonConstantsUtil.CONNECTOR_ID.AUTH, type: 'AUTH' };
        await ConnectionController.connectExternal(options, chain);
        expect(sendEventSpy).toHaveBeenCalledWith({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            properties: {
                method: 'email',
                name: 'Email',
                view: 'Connect',
                walletRank: undefined
            }
        });
    });
    it('connectExternal() should send CONNECT_SUCCESS event with Unknown name when connector not found', async () => {
        ConnectorController.state.allConnectors = [];
        RouterController.state.view = 'Account';
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => { });
        const options = { id: 'unknown-connector', type: 'INJECTED' };
        await ConnectionController.connectExternal(options, chain);
        expect(sendEventSpy).toHaveBeenCalledWith({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            properties: {
                method: 'browser',
                name: 'Unknown',
                view: 'Account',
                walletRank: undefined
            }
        });
    });
    it('checkInstalled() should trigger internal client call', () => {
        ConnectionController.checkInstalled([externalId]);
        expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId]);
    });
    it('should not throw on checkInstalled() without ids', () => {
        ConnectionController.checkInstalled();
        expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined);
    });
    it('should not throw when optional methods are undefined', async () => {
        ChainController.initialize([
            {
                namespace: CommonConstantsUtil.CHAIN.EVM,
                connectionControllerClient: partialClient,
                caipNetworks: []
            }
        ], [], {
            connectionControllerClient: partialClient
        });
        await ConnectionController.connectExternal({ id: externalId, type }, chain);
        ConnectionController.checkInstalled([externalId]);
        expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId]);
        expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined);
        expect(ConnectionController._getClient()).toEqual(evmAdapter.connectionControllerClient);
    });
    it('should update state correctly on resetWcConnection()', () => {
        const setPublicStateSpy = vi.spyOn(PublicStateController, 'set');
        ConnectionController.resetWcConnection();
        expect(ConnectionController.state.wcUri).toEqual(undefined);
        expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined);
        expect(setPublicStateSpy).toHaveBeenCalledWith({ connectingWallet: undefined });
    });
    it('should set wcUri correctly', () => {
        // Setup timers for pairing expiry
        const fakeDate = new Date(0);
        vi.useFakeTimers();
        vi.setSystemTime(fakeDate);
        ConnectionController.setUri(walletConnectUri);
        expect(ConnectionController.state.wcUri).toEqual(walletConnectUri);
        expect(ConnectionController.state.wcPairingExpiry).toEqual(ConstantsUtil.FOUR_MINUTES_MS);
    });
    it('should disconnect correctly', async () => {
        const disconnectSpy = vi.spyOn(client, 'disconnect');
        await ConnectionController.disconnect();
        expect(disconnectSpy).toHaveBeenCalled();
    });
    it('should handle connectWalletConnect correctly on telegram or safari on ios', async () => {
        const connectWalletConnectSpy = vi.spyOn(client, 'connectWalletConnect');
        vi.spyOn(CoreHelperUtil, 'isPairingExpired').mockReturnValue(true);
        vi.spyOn(CoreHelperUtil, 'isTelegram').mockReturnValue(true);
        vi.spyOn(CoreHelperUtil, 'isSafari').mockReturnValue(true);
        vi.spyOn(CoreHelperUtil, 'isIos').mockReturnValue(true);
        expect(ConnectionController.state.status).toEqual('disconnected');
        await ConnectionController.connectWalletConnect();
        expect(connectWalletConnectSpy).toHaveBeenCalledTimes(1);
        expect(ConnectionController.state.status).toEqual('connected');
    });
    it('should handle connectWalletConnect when cache argument is "never"', async () => {
        vi.spyOn(CoreHelperUtil, 'isTelegram').mockReturnValue(true);
        vi.spyOn(CoreHelperUtil, 'isSafari').mockReturnValue(true);
        vi.spyOn(CoreHelperUtil, 'isIos').mockReturnValue(true);
        const connectWalletConnectSpy = vi.spyOn(client, 'connectWalletConnect');
        await ConnectionController.connectWalletConnect({ cache: 'never' });
        expect(connectWalletConnectSpy).toHaveBeenCalledTimes(1);
    });
    it('should set connections for a namespace', () => {
        const connections = [{ connectorId: 'test-connector', accounts: [{ address: '0x123' }] }];
        ConnectionController.setConnections(connections, chain);
        expect(ConnectionController.state.connections.get(chain)).toEqual(connections);
    });
    it('should overwrite existing connections for a namespace', () => {
        const initialConnections = [
            { connectorId: 'initial-connector', accounts: [{ address: '0xabc' }] }
        ];
        const newConnections = [{ connectorId: 'new-connector', accounts: [{ address: '0xdef' }] }];
        ConnectionController.setConnections(initialConnections, chain);
        ConnectionController.setConnections(newConnections, chain);
        expect(ConnectionController.state.connections.get(chain)).toEqual(newConnections);
    });
    describe('switchConnection', () => {
        const mockConnection = {
            connectorId: 'test-connector',
            accounts: [{ address: '0x123' }, { address: '0x456' }],
            name: 'Test Wallet',
            icon: 'test-icon.png'
        };
        const mockConnector = {
            id: 'test-connector',
            type: 'INJECTED',
            name: 'Test Connector',
            chain: chain
        };
        beforeEach(() => {
            vi.restoreAllMocks();
        });
        it('should call parseCaipAddress when caipAddress is available', async () => {
            const mockCaipAddress = 'eip155:137:0x789';
            vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
                caipAddress: mockCaipAddress
            });
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            const parseSpy = vi.spyOn(ParseUtil, 'parseCaipAddress');
            await ConnectionController.switchConnection({
                connection: mockConnection,
                namespace: chain
            });
            expect(ChainController.getAccountData).toHaveBeenCalledWith(chain);
            expect(parseSpy).toHaveBeenCalledWith(mockCaipAddress);
        });
        it('should not call parseCaipAddress when caipAddress is not available', async () => {
            vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined);
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            const parseSpy = vi.spyOn(ParseUtil, 'parseCaipAddress');
            await ConnectionController.switchConnection({
                connection: mockConnection,
                namespace: chain
            });
            expect(ChainController.getAccountData).toHaveBeenCalledWith(chain);
            expect(parseSpy).not.toHaveBeenCalled();
        });
        it.each([
            {
                address: '0x123',
                hasSwitchedAccount: true,
                hasSwitchedWallet: true,
                status: 'active'
            },
            { address: '0x321', hasSwitchedAccount: false, hasSwitchedWallet: true, status: 'active' },
            {
                address: '0x123',
                hasSwitchedAccount: true,
                hasSwitchedWallet: false,
                status: 'connected'
            },
            {
                address: '0x321',
                hasSwitchedAccount: false,
                hasSwitchedWallet: false,
                status: 'connected'
            }
        ])('should handle active and connected connection when switching to different addresses', async ({ address, hasSwitchedAccount, hasSwitchedWallet, status }) => {
            vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue(status);
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
                caipAddress: 'eip155:137:0x321'
            });
            const connectExternalSpy = vi
                .spyOn(ConnectionController, 'connectExternal')
                .mockResolvedValue({
                address
            });
            const onChange = vi.fn();
            await ConnectionController.switchConnection({
                connection: mockConnection,
                address,
                namespace: chain,
                onChange
            });
            expect(connectExternalSpy).toHaveBeenCalledWith({
                id: mockConnector.id,
                type: mockConnector.type,
                provider: mockConnector.provider,
                address,
                chain
            }, chain);
            expect(onChange).toHaveBeenCalledWith({
                address,
                namespace: chain,
                hasSwitchedAccount,
                hasSwitchedWallet
            });
        });
        it.each(['active', 'connected'])('should handle auth account switch for %s connection status', async (status) => {
            vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue(status);
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
                caipAddress: 'eip155:137:0x321'
            });
            const onChange = vi.fn();
            vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue({
                address: '0x123'
            });
            const handleAuthAccountSwitchSpy = vi.spyOn(ConnectionController, 'handleAuthAccountSwitch');
            await ConnectionController.switchConnection({
                connection: { ...mockConnection, connectorId: CommonConstantsUtil.CONNECTOR_ID.AUTH },
                address: '0x123',
                namespace: chain,
                onChange
            });
            expect(handleAuthAccountSwitchSpy).toHaveBeenCalledWith({
                address: '0x123',
                namespace: chain
            });
        });
        it('should handle disconnected connection when trying to connect with external connector', async () => {
            const address = '0x321';
            vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected');
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
                caipAddress: `eip155:137:${address}`
            });
            const connectExternalSpy = vi
                .spyOn(ConnectionController, 'connectExternal')
                .mockResolvedValue({
                address
            });
            const onChange = vi.fn();
            await ConnectionController.switchConnection({
                connection: mockConnection,
                address,
                namespace: chain,
                onChange
            });
            expect(connectExternalSpy).toHaveBeenCalledWith({
                id: mockConnector.id,
                type: mockConnector.type,
                provider: mockConnector.provider,
                chain
            }, chain);
            expect(onChange).toHaveBeenCalledWith({
                address,
                namespace: chain,
                hasSwitchedAccount: true,
                hasSwitchedWallet: true
            });
        });
        it.each(['google', 'x', 'discord', 'github', 'apple', 'facebook', 'farcaster'])('should handle disconnected connection when trying to connect with %s', async (social) => {
            const address = '0x321';
            vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected');
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            const connectSocialSpy = vi
                .spyOn(ConnectorControllerUtil, 'connectSocial')
                .mockResolvedValue({ address: '0x321' });
            const onChange = vi.fn();
            await ConnectionController.switchConnection({
                connection: {
                    ...mockConnection,
                    auth: { name: social, username: undefined },
                    connectorId: CommonConstantsUtil.CONNECTOR_ID.AUTH
                },
                address,
                namespace: chain,
                onChange
            });
            expect(connectSocialSpy).toHaveBeenCalledWith({
                social,
                onOpenFarcaster: expect.any(Function),
                onConnect: expect.any(Function)
            });
            expect(onChange).toHaveBeenCalledWith({
                address,
                namespace: chain,
                hasSwitchedAccount: true,
                hasSwitchedWallet: true
            });
        });
        it('should handle disconnected connection when trying to connect with email', async () => {
            const address = '0x321';
            vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected');
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            const connectEmailSpy = vi
                .spyOn(ConnectorControllerUtil, 'connectEmail')
                .mockResolvedValue({ address: '0x321' });
            const onChange = vi.fn();
            await ConnectionController.switchConnection({
                connection: {
                    ...mockConnection,
                    auth: { name: 'email', username: undefined },
                    connectorId: CommonConstantsUtil.CONNECTOR_ID.AUTH
                },
                address,
                namespace: chain,
                onChange
            });
            expect(connectEmailSpy).toHaveBeenCalledWith({
                onOpen: expect.any(Function),
                onConnect: expect.any(Function)
            });
            expect(onChange).toHaveBeenCalledWith({
                address,
                namespace: chain,
                hasSwitchedAccount: true,
                hasSwitchedWallet: true
            });
        });
        it('should handle connected connection when trying to connect with walletconnect if modal open', async () => {
            const address = '0x321';
            vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected');
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
                open: true
            });
            vi.spyOn(RouterController, 'push');
            const connectWalletConnectSpy = vi
                .spyOn(ConnectorControllerUtil, 'connectWalletConnect')
                .mockImplementation(({ onOpen }) => {
                onOpen?.(false);
                return Promise.resolve({ address: '0x321' });
            });
            const onChange = vi.fn();
            await ConnectionController.switchConnection({
                connection: {
                    ...mockConnection,
                    connectorId: CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
                },
                address,
                namespace: chain,
                onChange
            });
            expect(connectWalletConnectSpy).toHaveBeenCalledWith({
                walletConnect: true,
                onOpen: expect.any(Function),
                onConnect: expect.any(Function),
                connector: mockConnector,
                closeModalOnConnect: undefined
            });
            expect(RouterController.push).toHaveBeenCalledWith('ConnectingWalletConnect');
        });
        it('should handle connected connection when trying to connect with walletconnect if modal closed', async () => {
            const address = '0x321';
            vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected');
            vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector);
            vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
                open: false
            });
            vi.spyOn(ModalController, 'open');
            const connectWalletConnectSpy = vi
                .spyOn(ConnectorControllerUtil, 'connectWalletConnect')
                .mockImplementation(({ onOpen }) => {
                onOpen?.(false);
                return Promise.resolve({ address: '0x321' });
            });
            const onChange = vi.fn();
            await ConnectionController.switchConnection({
                connection: {
                    ...mockConnection,
                    connectorId: CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
                },
                address,
                namespace: chain,
                onChange
            });
            expect(connectWalletConnectSpy).toHaveBeenCalledWith({
                walletConnect: true,
                onOpen: expect.any(Function),
                onConnect: expect.any(Function),
                connector: mockConnector,
                closeModalOnConnect: undefined
            });
            expect(ModalController.open).toHaveBeenCalledWith({
                view: 'ConnectingWalletConnect'
            });
        });
        it('should throw error if connection status is invalid', async () => {
            vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined);
            vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('connecting');
            vi.spyOn(ConnectionController, 'handleActiveConnection').mockResolvedValue('0x123');
            const onChange = vi.fn();
            expect(async () => await ConnectionController.switchConnection({
                connection: mockConnection,
                namespace: chain,
                onChange
            })).rejects.toThrow('Invalid connection status: connecting');
        });
    });
});
describe('finalizeWcConnection', () => {
    it('should include event properties when address is provided', () => {
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => { });
        vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
            ...RouterController.state,
            view: 'TestView',
            data: { wallet: { name: 'TestWallet', id: 'test' } }
        });
        vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
            ...ConnectionController.state,
            wcLinking: { href: 'wc://deeplink', name: 'TestWallet' },
            recentWallet: { id: 'test', order: 5, name: 'TestWallet' }
        });
        const address = '0xabc';
        ConnectionController.finalizeWcConnection(address);
        expect(sendEventSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            address,
            properties: expect.objectContaining({
                method: 'mobile',
                name: 'TestWallet',
                view: 'TestView',
                walletRank: 5
            })
        }));
    });
    it('should use qrcode method when wcLinking is not provided', () => {
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => { });
        vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
            ...RouterController.state,
            view: 'Connect',
            data: { wallet: { name: 'QRWallet', id: 'qr-test' } }
        });
        vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
            ...ConnectionController.state,
            wcLinking: undefined,
            recentWallet: { id: 'qr-test', order: 10, name: 'QRWallet' }
        });
        const address = '0xdef';
        ConnectionController.finalizeWcConnection(address);
        expect(sendEventSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            address,
            properties: expect.objectContaining({
                method: 'qrcode',
                name: 'QRWallet',
                view: 'Connect',
                walletRank: 10
            })
        }));
    });
    it('should not send CONNECT_SUCCESS event when address is not provided', () => {
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => { });
        vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
            ...RouterController.state,
            view: 'Connect',
            data: { wallet: { name: 'TestWallet', id: 'test' } }
        });
        vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
            ...ConnectionController.state,
            wcLinking: { href: 'wc://deeplink', name: 'TestWallet' },
            recentWallet: { id: 'test', order: 5, name: 'TestWallet' }
        });
        ConnectionController.finalizeWcConnection(undefined);
        expect(sendEventSpy).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=ConnectionController.test.js.map