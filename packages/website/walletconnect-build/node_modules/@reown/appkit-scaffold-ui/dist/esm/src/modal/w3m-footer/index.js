var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { EventsController, RouterController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '../../partials/w3m-legal-footer/index.js';
import '../../partials/w3m-onramp-providers-footer/index.js';
import { HelpersUtil } from '../../utils/HelpersUtil.js';
import styles from './styles.js';
let W3mFooter = class W3mFooter extends LitElement {
    constructor() {
        super(...arguments);
        this.resizeObserver = undefined;
        this.unsubscribe = [];
        this.status = 'hide';
        this.view = RouterController.state.view;
    }
    firstUpdated() {
        this.status = HelpersUtil.hasFooter() ? 'show' : 'hide';
        this.unsubscribe.push(RouterController.subscribeKey('view', val => {
            this.view = val;
            this.status = HelpersUtil.hasFooter() ? 'show' : 'hide';
            if (this.status === 'hide') {
                const globalStyles = document.documentElement.style;
                globalStyles.setProperty('--apkt-footer-height', '0px');
            }
        }));
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === this.getWrapper()) {
                    const newHeight = `${entry.contentRect.height}px`;
                    const globalStyles = document.documentElement.style;
                    globalStyles.setProperty('--apkt-footer-height', newHeight);
                }
            }
        });
        this.resizeObserver.observe(this.getWrapper());
    }
    render() {
        return html `
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `;
    }
    templatePageContainer() {
        if (HelpersUtil.hasFooter()) {
            return html ` ${this.templateFooter()}`;
        }
        return null;
    }
    templateFooter() {
        switch (this.view) {
            case 'Networks':
                return this.templateNetworksFooter();
            case 'Connect':
            case 'ConnectWallets':
            case 'OnRampFiatSelect':
            case 'OnRampTokenSelect':
                return html `<w3m-legal-footer></w3m-legal-footer>`;
            case 'OnRampProviders':
                return html `<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;
            default:
                return null;
        }
    }
    templateNetworksFooter() {
        return html ` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`;
    }
    onNetworkHelp() {
        EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORK_HELP' });
        RouterController.push('WhatIsANetwork');
    }
    getWrapper() {
        return this.shadowRoot?.querySelector('div.container');
    }
};
W3mFooter.styles = [styles];
__decorate([
    state()
], W3mFooter.prototype, "status", void 0);
__decorate([
    state()
], W3mFooter.prototype, "view", void 0);
W3mFooter = __decorate([
    customElement('w3m-footer')
], W3mFooter);
export { W3mFooter };
//# sourceMappingURL=index.js.map