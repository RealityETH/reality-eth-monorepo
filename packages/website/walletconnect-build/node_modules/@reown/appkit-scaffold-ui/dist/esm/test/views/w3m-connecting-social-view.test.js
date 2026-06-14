import { fixture } from '@open-wc/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';
import { ChainController, ConnectionController, ConnectorController, EventsController, ModalController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
import { W3mConnectingSocialView } from '../../src/views/w3m-connecting-social-view';
describe('W3mConnectingSocialView - disconnectedCallback', () => {
    it('should call socialWindow.close when component unmounts', async () => {
        const mockSocialWindow = {
            close: vi.fn(),
            closed: false
        };
        const mockAuthConnector = {
            provider: {
                connectSocial: vi.fn()
            }
        };
        vi.spyOn(ConnectionController, 'connectExternal').mockImplementation(() => Promise.resolve(undefined));
        vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector);
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
            ...ChainController.getAccountData(),
            socialWindow: mockSocialWindow
        });
        vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
            ...RouterController.state,
            view: 'ConnectingSocial'
        });
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155'
        });
        const setSocialWindowSpy = vi.spyOn(ChainController, 'setAccountProp');
        const element = await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        element.disconnectedCallback();
        expect(mockSocialWindow.close).toHaveBeenCalled();
        expect(setSocialWindowSpy).toHaveBeenCalledWith('socialWindow', undefined, 'eip155');
    });
});
describe('W3mConnectingSocialView - Error Handling', () => {
    it('should handle error in resultUri and call handleSocialError', async () => {
        const mockSocialWindow = {
            close: vi.fn(),
            closed: false
        };
        const mockAuthConnector = {
            id: 'auth',
            type: 'AUTH',
            chain: 'eip155'
        };
        vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector);
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
            ...ChainController.getAccountData(),
            socialWindow: mockSocialWindow,
            socialProvider: 'discord'
        });
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155'
        });
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent');
        const setAccountPropSpy = vi.spyOn(ChainController, 'setAccountProp');
        const element = await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        const mockEvent = new MessageEvent('message', {
            data: {
                resultUri: 'https://secure.walletconnect.org/social?error=access_denied'
            },
            origin: 'https://secure.walletconnect.org'
        });
        window.dispatchEvent(mockEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(sendEventSpy).toHaveBeenCalledWith({
            type: 'track',
            event: 'SOCIAL_LOGIN_ERROR',
            properties: { provider: 'discord', message: 'access_denied' }
        });
        expect(mockSocialWindow.close).toHaveBeenCalled();
        expect(setAccountPropSpy).toHaveBeenCalledWith('socialWindow', undefined, 'eip155');
        expect(element['error']).toBe(true);
        expect(element['message']).toBe('Something went wrong');
    });
    it('should handle connection error and send SOCIAL_LOGIN_ERROR event', async () => {
        const mockSocialWindow = {
            close: vi.fn(),
            closed: false
        };
        const mockAuthConnector = {
            id: 'auth',
            type: 'AUTH',
            chain: 'eip155'
        };
        const connectionError = new Error('Connection failed');
        vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector);
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
            ...ChainController.getAccountData(),
            socialWindow: mockSocialWindow,
            socialProvider: 'google'
        });
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155'
        });
        vi.spyOn(ConnectionController, 'connectExternal').mockRejectedValue(connectionError);
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent');
        const element = await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        const mockEvent = new MessageEvent('message', {
            data: {
                resultUri: 'https://secure.walletconnect.org/social?code=123'
            },
            origin: 'https://secure.walletconnect.org'
        });
        window.dispatchEvent(mockEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(sendEventSpy).toHaveBeenCalledWith({
            type: 'track',
            event: 'SOCIAL_LOGIN_ERROR',
            properties: { provider: 'google', message: 'Connection failed' }
        });
        expect(element['error']).toBe(true);
        expect(element['message']).toBe('Something went wrong');
    });
    it('should handle untrusted origin and show error', async () => {
        const mockSocialWindow = {
            close: vi.fn(),
            closed: false
        };
        const mockAuthConnector = {
            id: 'auth',
            type: 'AUTH',
            chain: 'eip155'
        };
        vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector);
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
            ...ChainController.getAccountData(),
            socialWindow: mockSocialWindow,
            socialProvider: 'x'
        });
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155'
        });
        const sendEventSpy = vi.spyOn(EventsController, 'sendEvent');
        const goBackSpy = vi.spyOn(RouterController, 'goBack').mockImplementation(() => { });
        const showErrorSpy = vi.spyOn(SnackController, 'showError').mockImplementation(() => { });
        await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        const mockEvent = new MessageEvent('message', {
            data: {
                resultUri: 'https://secure.walletconnect.org/social?code=123'
            },
            origin: 'https://malicious-site.com'
        });
        window.dispatchEvent(mockEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(goBackSpy).toHaveBeenCalled();
        expect(showErrorSpy).toHaveBeenCalledWith('Untrusted Origin');
        expect(sendEventSpy).toHaveBeenCalledWith({
            type: 'track',
            event: 'SOCIAL_LOGIN_ERROR',
            properties: { provider: 'x', message: 'Untrusted Origin' }
        });
    });
    it('should parse error from URL correctly', async () => {
        const mockAuthConnector = {
            id: 'auth',
            type: 'AUTH',
            chain: 'eip155'
        };
        vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector);
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
            ...ChainController.getAccountData()
        });
        const element = await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        const errorUrl1 = 'https://secure.walletconnect.org/social?error=access_denied';
        const errorUrl2 = 'https://secure.walletconnect.org/social?code=123&error=server_error';
        const validUrl = 'https://secure.walletconnect.org/social?code=123';
        const invalidUrl = 'not-a-url';
        expect(element['parseURLError'](errorUrl1)).toBe('access_denied');
        expect(element['parseURLError'](errorUrl2)).toBe('server_error');
        expect(element['parseURLError'](validUrl)).toBe(null);
        expect(element['parseURLError'](invalidUrl)).toBe(null);
    });
    it('should close social window when closeSocialWindow is called', async () => {
        const mockSocialWindow = {
            close: vi.fn(),
            closed: false
        };
        const mockAuthConnector = {
            id: 'auth',
            type: 'AUTH',
            chain: 'eip155'
        };
        vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector);
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
            ...ChainController.getAccountData(),
            socialWindow: mockSocialWindow
        });
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155'
        });
        const setAccountPropSpy = vi.spyOn(ChainController, 'setAccountProp');
        const element = await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        element['closeSocialWindow']();
        expect(mockSocialWindow.close).toHaveBeenCalled();
        expect(setAccountPropSpy).toHaveBeenCalledWith('socialWindow', undefined, 'eip155');
    });
    it('should not throw when closeSocialWindow is called without window', async () => {
        const mockAuthConnector = {
            id: 'auth',
            type: 'AUTH',
            chain: 'eip155'
        };
        vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector);
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
            ...ChainController.getAccountData(),
            socialWindow: undefined
        });
        const element = await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        expect(() => element['closeSocialWindow']()).not.toThrow();
    });
});
describe('W3mConnectingSocialView - Embedded Modal Behavior', () => {
    beforeAll(() => {
        ConnectionController.state.connections = ConnectionController.state.connections;
    });
    it('closes the modal if no connections exist, an address is set and embedded mode is enabled', async () => {
        const mockSocialWindow = {
            close: vi.fn(),
            closed: false
        };
        let subscriptionCallback;
        vi.spyOn(ModalController, 'close').mockImplementation(() => { });
        vi.spyOn(RouterController, 'reset').mockImplementation(() => { });
        vi.spyOn(RouterController, 'push').mockImplementation(() => { });
        vi.spyOn(RouterController, 'replace').mockImplementation(() => { });
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
            ...OptionsController.state,
            enableEmbedded: true
        });
        vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
            ...ChainController.getAccountData(),
            socialWindow: mockSocialWindow
        });
        vi.spyOn(ModalController, 'state', 'get').mockReturnValueOnce({
            ...ModalController.state,
            open: true
        });
        vi.spyOn(ChainController, 'subscribe').mockImplementationOnce(() => {
            return () => { };
        });
        vi.spyOn(ChainController, 'subscribeChainProp').mockImplementationOnce((_property, callback) => {
            subscriptionCallback = callback;
            return () => { };
        });
        await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        if (subscriptionCallback) {
            subscriptionCallback({ address: '0x123' });
        }
        expect(ModalController.close).toHaveBeenCalled();
        expect(RouterController.reset).not.toHaveBeenCalled();
        expect(RouterController.push).not.toHaveBeenCalled();
    });
    it('redirects to the profile wallets page if connections exist, address is set and multiWallet is enabled', async () => {
        const mockSocialWindow = {
            close: vi.fn(),
            closed: false
        };
        const mockConnections = new Map([
            [
                'eip155',
                [
                    {
                        connectorId: 'auth'
                    }
                ]
            ]
        ]);
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
            ...OptionsController.state,
            remoteFeatures: { multiWallet: true }
        });
        let subscriptionCallback;
        ConnectionController.state.connections = mockConnections;
        vi.spyOn(RouterController, 'reset').mockImplementation(() => { });
        vi.spyOn(RouterController, 'push').mockImplementation(() => { });
        vi.spyOn(ModalController, 'close').mockImplementation(() => { });
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
            ...OptionsController.state,
            enableEmbedded: true
        });
        vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
            ...ChainController.getAccountData(),
            socialWindow: mockSocialWindow
        });
        vi.spyOn(ModalController, 'state', 'get').mockReturnValueOnce({
            ...ModalController.state,
            open: true
        });
        vi.spyOn(ChainController, 'subscribe').mockImplementationOnce(() => {
            return () => { };
        });
        vi.spyOn(ChainController, 'subscribeChainProp').mockImplementationOnce((_property, callback) => {
            subscriptionCallback = callback;
            return () => { };
        });
        await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        if (subscriptionCallback) {
            subscriptionCallback({ address: '0x123' });
        }
        expect(ModalController.close).not.toHaveBeenCalled();
        expect(RouterController.replace).toHaveBeenCalledWith('ProfileWallets');
    });
    it('should not close modal when address is set but enableEmbedded is false', async () => {
        const mockSocialWindow = {
            close: vi.fn(),
            closed: false
        };
        let subscriptionCallback;
        vi.spyOn(ModalController, 'close').mockImplementationOnce(() => { });
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
            ...OptionsController.state,
            enableEmbedded: false
        });
        vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
            ...ChainController.getAccountData(),
            socialWindow: mockSocialWindow
        });
        vi.spyOn(ModalController, 'state', 'get').mockReturnValueOnce({
            ...ModalController.state,
            open: false
        });
        vi.spyOn(ChainController, 'subscribe').mockImplementationOnce(callback => {
            subscriptionCallback = callback;
            return () => { };
        });
        await fixture(html `<w3m-connecting-social-view></w3m-connecting-social-view>`);
        if (subscriptionCallback) {
            subscriptionCallback({ address: '0x123' });
        }
        expect(ModalController.close).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=w3m-connecting-social-view.test.js.map