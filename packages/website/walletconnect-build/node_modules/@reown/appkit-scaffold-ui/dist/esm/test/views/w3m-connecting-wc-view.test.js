import { fixture } from '@open-wc/testing';
import { describe, expect, test, vi } from 'vitest';
import { html } from 'lit';
import { ChainController, ConnectionController, CoreHelperUtil, OptionsController, RouterController } from '@reown/appkit-controllers';
import { CaipNetworksUtil } from '@reown/appkit-utils';
import { HelpersUtil } from '../utils/HelpersUtil';
const WALLET = {
    id: 'metamask',
    name: 'MetaMask'
};
describe('W3mConnectingWcView - Render', () => {
    test('should render walletConnect widget if no wallet is given', async () => {
        const element = await fixture(html `<w3m-connecting-wc-view></w3m-connecting-wc-view>`);
        expect(HelpersUtil.querySelect(element, 'w3m-connecting-wc-qrcode')).not.toBeNull();
    });
    test('should render web and browser platforms', async () => {
        vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false);
        vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
            ...RouterController.state,
            data: {
                wallet: {
                    ...WALLET,
                    rdns: 'metamask.io',
                    webapp_link: 'https://metamask.io'
                }
            }
        });
        const element = await fixture(html `<w3m-connecting-wc-view></w3m-connecting-wc-view>`);
        const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header');
        expect(w3mConnectingHeader).not.toBeNull();
        const wuiTabs = HelpersUtil.querySelect(w3mConnectingHeader, 'wui-tabs');
        expect(wuiTabs).not.toBeNull();
        const tabsProperty = wuiTabs.tabs;
        expect(tabsProperty).toStrictEqual([
            { label: 'Webapp', icon: 'browser', platform: 'web' },
            { label: 'Browser', icon: 'extension', platform: 'unsupported' }
        ]);
    });
    test('should render mobile and browser platforms', async () => {
        vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true);
        vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
            ...RouterController.state,
            data: {
                wallet: {
                    ...WALLET,
                    webapp_link: 'https://metamask.io',
                    mobile_link: 'https://metamask.io'
                }
            }
        });
        const element = await fixture(html `<w3m-connecting-wc-view></w3m-connecting-wc-view>`);
        const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header');
        expect(w3mConnectingHeader).not.toBeNull();
        const wuiTabs = HelpersUtil.querySelect(w3mConnectingHeader, 'wui-tabs');
        expect(wuiTabs).not.toBeNull();
        const tabsProperty = wuiTabs.tabs;
        expect(tabsProperty).toStrictEqual([
            { label: 'Mobile', icon: 'mobile', platform: 'mobile' },
            { label: 'Webapp', icon: 'browser', platform: 'web' }
        ]);
    });
    test('should not render browser platforms when noAdapters is true', async () => {
        vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false);
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            noAdapters: true
        });
        vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
            ...RouterController.state,
            data: {
                wallet: {
                    ...WALLET,
                    rdns: 'metamask.io',
                    webapp_link: 'https://metamask.io',
                    mobile_link: 'https://metamask.io'
                }
            }
        });
        const element = await fixture(html `<w3m-connecting-wc-view></w3m-connecting-wc-view>`);
        const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header');
        expect(w3mConnectingHeader).not.toBeNull();
        const wuiTabs = HelpersUtil.querySelect(w3mConnectingHeader, 'wui-tabs');
        expect(wuiTabs).not.toBeNull();
        const tabsProperty = wuiTabs.tabs;
        expect(tabsProperty).toStrictEqual([
            { label: 'Mobile', icon: 'mobile', platform: 'qrcode' },
            { label: 'Webapp', icon: 'browser', platform: 'web' }
        ]);
    });
    test('should set the correct properties and values mobileFullScreen is true', async () => {
        OptionsController.state.enableMobileFullScreen = true;
        vi.spyOn(ConnectionController, 'connectWalletConnect').mockResolvedValue();
        vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([]);
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155'
        });
        const element = await fixture(html `<w3m-connecting-wc-view></w3m-connecting-wc-view>`);
        expect(element.getAttribute('data-mobile-fullscreen')).toBe('true');
    });
    test('should set the correct properties and values mobileFullScreen is false', async () => {
        OptionsController.state.enableMobileFullScreen = false;
        vi.spyOn(ConnectionController, 'connectWalletConnect').mockResolvedValue();
        vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([]);
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155'
        });
        const element = await fixture(html `<w3m-connecting-wc-view></w3m-connecting-wc-view>`);
        expect(element.getAttribute('data-mobile-fullscreen')).toBeNull();
    });
});
describe('W3mConnectingWcView - Handle chain switch error when enableNetworkSwitch is disabled', () => {
    test('should show unsupported chain UI when chain switch error occurs with enableNetworkSwitch disabled', async () => {
        const mockShowUnsupportedChainUI = vi.fn();
        const mockSetActiveCaipNetwork = vi.fn();
        const mockConnectWalletConnect = vi
            .fn()
            .mockRejectedValue(new Error('An error occurred when attempting to switch chain'));
        vi.spyOn(ChainController, 'showUnsupportedChainUI').mockImplementation(mockShowUnsupportedChainUI);
        vi.spyOn(ChainController, 'setActiveCaipNetwork').mockImplementation(mockSetActiveCaipNetwork);
        vi.spyOn(ConnectionController, 'connectWalletConnect').mockImplementation(mockConnectWalletConnect);
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
            ...OptionsController.state,
            enableNetworkSwitch: false
        });
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
            ...ChainController.state,
            activeChain: 'eip155',
            activeCaipNetwork: { id: '1' }
        });
        const mockGetUnsupportedNetwork = vi.fn().mockReturnValue({
            id: '1',
            name: 'Unsupported Network'
        });
        vi.spyOn(CaipNetworksUtil, 'getUnsupportedNetwork').mockImplementation(mockGetUnsupportedNetwork);
        await fixture(html `<w3m-connecting-wc-view></w3m-connecting-wc-view>`);
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(mockConnectWalletConnect).toHaveBeenCalled();
        expect(mockGetUnsupportedNetwork).toHaveBeenCalledWith('eip155:1');
        expect(mockSetActiveCaipNetwork).toHaveBeenCalled();
        expect(mockShowUnsupportedChainUI).toHaveBeenCalled();
    });
});
//# sourceMappingURL=w3m-connecting-wc-view.test.js.map