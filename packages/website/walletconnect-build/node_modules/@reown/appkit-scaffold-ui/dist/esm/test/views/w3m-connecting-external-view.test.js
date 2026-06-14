import { fixture } from '@open-wc/testing';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';
import {} from '@reown/appkit-common';
import { ConnectionController, ConnectionControllerUtil, ConnectorController, EventsController, ModalController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
const TEST_CHAIN = 'eip155';
const TEST_CONNECTOR_ID = 'test-connector';
const ALTERNATIVE_CONNECTOR_ID = 'alternative-connector';
const MOCK_CONNECTOR = {
    id: TEST_CONNECTOR_ID,
    name: 'Test Connector',
    chain: TEST_CHAIN,
    type: 'EXTERNAL'
};
const MOCK_ACCOUNT_1 = {
    address: '0x1234567890123456789012345678901234567890',
    type: 'eoa'
};
const MOCK_ACCOUNT_2 = {
    address: '0x0987654321098765432109876543210987654321',
    type: 'eoa'
};
const MOCK_CONNECTION_1 = {
    connectorId: TEST_CONNECTOR_ID,
    accounts: [MOCK_ACCOUNT_1]
};
const MOCK_CONNECTION_2 = {
    connectorId: TEST_CONNECTOR_ID,
    accounts: [MOCK_ACCOUNT_2]
};
const MOCK_CONNECTION_ALTERNATIVE = {
    connectorId: ALTERNATIVE_CONNECTOR_ID,
    accounts: [MOCK_ACCOUNT_1]
};
beforeAll(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }));
});
describe('W3mConnectingExternalView', () => {
    describe('onConnectionsChange', () => {
        let connectionChangeHandler;
        beforeEach(async () => {
            vi.clearAllMocks();
            vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
                ...RouterController.state,
                data: { connector: MOCK_CONNECTOR }
            });
            vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
                ...OptionsController.state,
                remoteFeatures: { multiWallet: true }
            });
            vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
                ...ConnectionController.state,
                connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION_1]]])
            });
            vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
                ...ConnectorController.state,
                activeConnectorIds: {
                    eip155: TEST_CONNECTOR_ID,
                    solana: undefined,
                    polkadot: undefined,
                    bip122: undefined,
                    cosmos: undefined,
                    sui: undefined,
                    stacks: undefined,
                    ton: undefined
                }
            });
            vi.spyOn(RouterController, 'replace').mockImplementation(() => { });
            vi.spyOn(RouterController, 'push').mockImplementation(() => { });
            vi.spyOn(ModalController, 'close').mockImplementation(() => { });
            vi.spyOn(SnackController, 'showSuccess').mockImplementation(() => { });
            vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => { });
            vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation(() => () => { });
            vi.spyOn(ConnectionController, 'subscribeKey').mockImplementation((key, handler) => {
                if (key === 'connections') {
                    connectionChangeHandler = handler;
                }
                return () => { };
            });
            vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([MOCK_CONNECTION_1]);
            await fixture(html `<w3m-connecting-external-view></w3m-connecting-external-view>`);
        });
        it('should navigate to Connect view when all connections are removed', () => {
            vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([]);
            vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
                ...ConnectionController.state,
                connections: new Map([[TEST_CHAIN, []]])
            });
            const emptyConnections = new Map([[TEST_CHAIN, []]]);
            connectionChangeHandler(emptyConnections);
            expect(RouterController.replace).toHaveBeenCalledWith('Connect');
            expect(RouterController.push).not.toHaveBeenCalled();
            expect(ModalController.close).not.toHaveBeenCalled();
        });
        it('should navigate to ProfileWallets when multi-wallet is enabled and our connector accounts changed', () => {
            vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([
                MOCK_CONNECTION_1,
                MOCK_CONNECTION_ALTERNATIVE
            ]);
            vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
                ...ConnectionController.state,
                connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION_1, MOCK_CONNECTION_ALTERNATIVE]]])
            });
            vi.spyOn(ConnectionControllerUtil, 'getConnectionsByConnectorId')
                .mockReturnValueOnce([MOCK_CONNECTION_1])
                .mockReturnValueOnce([]);
            const newConnections = new Map([[TEST_CHAIN, [MOCK_CONNECTION_ALTERNATIVE]]]);
            connectionChangeHandler(newConnections);
            expect(RouterController.replace).toHaveBeenCalledWith('ProfileWallets');
            expect(SnackController.showSuccess).toHaveBeenCalledWith('Wallet deleted');
            expect(ModalController.close).not.toHaveBeenCalled();
        });
        it('should close modal when multi-wallet is disabled and our connector accounts changed', async () => {
            vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
                ...OptionsController.state,
                remoteFeatures: { multiWallet: false }
            });
            vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([
                MOCK_CONNECTION_1,
                MOCK_CONNECTION_ALTERNATIVE
            ]);
            vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
                ...ConnectionController.state,
                connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION_1, MOCK_CONNECTION_ALTERNATIVE]]])
            });
            vi.spyOn(ConnectionControllerUtil, 'getConnectionsByConnectorId')
                .mockReturnValueOnce([MOCK_CONNECTION_1])
                .mockReturnValueOnce([]);
            await fixture(html `<w3m-connecting-external-view></w3m-connecting-external-view>`);
            const newConnections = new Map([[TEST_CHAIN, [MOCK_CONNECTION_ALTERNATIVE]]]);
            connectionChangeHandler(newConnections);
            expect(ModalController.close).toHaveBeenCalled();
            expect(RouterController.replace).not.toHaveBeenCalled();
            expect(RouterController.push).not.toHaveBeenCalled();
        });
        it('should navigate to ProfileWallets when different accounts are detected and multi-wallet enabled', async () => {
            vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([MOCK_CONNECTION_1]);
            vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
                ...ConnectionController.state,
                connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION_1]]])
            });
            await fixture(html `<w3m-connecting-external-view></w3m-connecting-external-view>`);
            vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([MOCK_CONNECTION_2]);
            vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
                ...ConnectionController.state,
                connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION_2]]])
            });
            const newConnections = new Map([[TEST_CHAIN, [MOCK_CONNECTION_2]]]);
            connectionChangeHandler(newConnections);
            expect(RouterController.replace).toHaveBeenCalledWith('ProfileWallets');
            expect(ModalController.close).not.toHaveBeenCalled();
        });
        it('should not navigate when accounts are the same and multi-wallet enabled', () => {
            vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([MOCK_CONNECTION_1]);
            vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
                ...ConnectionController.state,
                connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION_1]]])
            });
            vi.spyOn(ConnectionControllerUtil, 'getConnectionsByConnectorId').mockReturnValue([
                MOCK_CONNECTION_1
            ]);
            const newConnections = new Map([[TEST_CHAIN, [MOCK_CONNECTION_1]]]);
            connectionChangeHandler(newConnections);
            expect(RouterController.replace).not.toHaveBeenCalled();
            expect(RouterController.push).not.toHaveBeenCalled();
            expect(ModalController.close).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=w3m-connecting-external-view.test.js.map