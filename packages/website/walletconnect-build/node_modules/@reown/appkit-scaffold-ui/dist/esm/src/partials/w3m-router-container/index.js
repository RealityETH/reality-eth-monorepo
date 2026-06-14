var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { OptionsController } from '@reown/appkit-controllers';
import { UiHelperUtil, customElement } from '@reown/appkit-ui';
import styles from './styles.js';
const HEADER_HEIGHT = 60;
let W3mRouterContainer = class W3mRouterContainer extends LitElement {
    constructor() {
        super(...arguments);
        this.resizeObserver = undefined;
        this.transitionDuration = '0.15s';
        this.transitionFunction = '';
        this.history = '';
        this.view = '';
        this.setView = undefined;
        this.viewDirection = '';
        this.historyState = '';
        this.previousHeight = '0px';
        this.mobileFullScreen = OptionsController.state.enableMobileFullScreen;
        this.onViewportResize = () => {
            this.updateContainerHeight();
        };
    }
    updated(changedProps) {
        if (changedProps.has('history')) {
            const newHistory = this.history;
            if (this.historyState !== '' && this.historyState !== newHistory) {
                this.onViewChange(newHistory);
            }
        }
        if (changedProps.has('transitionDuration')) {
            this.style.setProperty('--local-duration', this.transitionDuration);
        }
        if (changedProps.has('transitionFunction')) {
            this.style.setProperty('--local-transition', this.transitionFunction);
        }
    }
    firstUpdated() {
        if (this.transitionFunction) {
            this.style.setProperty('--local-transition', this.transitionFunction);
        }
        this.style.setProperty('--local-duration', this.transitionDuration);
        this.historyState = this.history;
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === this.getWrapper()) {
                    let newHeight = entry.contentRect.height;
                    const footerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--apkt-footer-height') ||
                        '0');
                    if (this.mobileFullScreen) {
                        const viewportHeight = window.visualViewport?.height || window.innerHeight;
                        const headerHeight = this.getHeaderHeight();
                        newHeight = viewportHeight - headerHeight - footerHeight;
                        this.style.setProperty('--local-border-bottom-radius', '0px');
                    }
                    else {
                        const totalHeight = newHeight + footerHeight;
                        newHeight = totalHeight;
                        this.style.setProperty('--local-border-bottom-radius', footerHeight ? 'var(--apkt-borderRadius-5)' : '0px');
                    }
                    this.style.setProperty('--local-container-height', `${newHeight}px`);
                    if (this.previousHeight !== '0px') {
                        this.style.setProperty('--local-duration-height', this.transitionDuration);
                    }
                    this.previousHeight = `${newHeight}px`;
                }
            }
        });
        this.resizeObserver.observe(this.getWrapper());
        this.updateContainerHeight();
        window.addEventListener('resize', this.onViewportResize);
        window.visualViewport?.addEventListener('resize', this.onViewportResize);
    }
    disconnectedCallback() {
        const wrapper = this.getWrapper();
        if (wrapper && this.resizeObserver) {
            this.resizeObserver.unobserve(wrapper);
        }
        window.removeEventListener('resize', this.onViewportResize);
        window.visualViewport?.removeEventListener('resize', this.onViewportResize);
    }
    render() {
        return html `
      <div class="container" data-mobile-fullscreen="${ifDefined(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${ifDefined(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
    }
    onViewChange(history) {
        const historyArr = history.split(',').filter(Boolean);
        const prevArr = this.historyState.split(',').filter(Boolean);
        const prevLength = prevArr.length;
        const newLength = historyArr.length;
        const newView = historyArr[historyArr.length - 1] || '';
        const duration = UiHelperUtil.cssDurationToNumber(this.transitionDuration);
        let direction = '';
        if (newLength > prevLength) {
            direction = 'next';
        }
        else if (newLength < prevLength) {
            direction = 'prev';
        }
        else if (newLength === prevLength && historyArr[newLength - 1] !== prevArr[prevLength - 1]) {
            direction = 'next';
        }
        this.viewDirection = `${direction}-${newView}`;
        setTimeout(() => {
            this.historyState = history;
            this.setView?.(newView);
        }, duration);
        setTimeout(() => {
            this.viewDirection = '';
        }, duration * 2);
    }
    getWrapper() {
        return this.shadowRoot?.querySelector('div.page');
    }
    updateContainerHeight() {
        const wrapper = this.getWrapper();
        if (!wrapper) {
            return;
        }
        const footerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--apkt-footer-height') || '0');
        let newHeight = 0;
        if (this.mobileFullScreen) {
            const viewportHeight = window.visualViewport?.height || window.innerHeight;
            const headerHeight = this.getHeaderHeight();
            newHeight = viewportHeight - headerHeight - footerHeight;
            this.style.setProperty('--local-border-bottom-radius', '0px');
        }
        else {
            newHeight = wrapper.getBoundingClientRect().height + footerHeight;
            this.style.setProperty('--local-border-bottom-radius', footerHeight ? 'var(--apkt-borderRadius-5)' : '0px');
        }
        this.style.setProperty('--local-container-height', `${newHeight}px`);
        if (this.previousHeight !== '0px') {
            this.style.setProperty('--local-duration-height', this.transitionDuration);
        }
        this.previousHeight = `${newHeight}px`;
    }
    getHeaderHeight() {
        return HEADER_HEIGHT;
    }
};
W3mRouterContainer.styles = [styles];
__decorate([
    property({ type: String })
], W3mRouterContainer.prototype, "transitionDuration", void 0);
__decorate([
    property({ type: String })
], W3mRouterContainer.prototype, "transitionFunction", void 0);
__decorate([
    property({ type: String })
], W3mRouterContainer.prototype, "history", void 0);
__decorate([
    property({ type: String })
], W3mRouterContainer.prototype, "view", void 0);
__decorate([
    property({ attribute: false })
], W3mRouterContainer.prototype, "setView", void 0);
__decorate([
    state()
], W3mRouterContainer.prototype, "viewDirection", void 0);
__decorate([
    state()
], W3mRouterContainer.prototype, "historyState", void 0);
__decorate([
    state()
], W3mRouterContainer.prototype, "previousHeight", void 0);
__decorate([
    state()
], W3mRouterContainer.prototype, "mobileFullScreen", void 0);
W3mRouterContainer = __decorate([
    customElement('w3m-router-container')
], W3mRouterContainer);
export { W3mRouterContainer };
//# sourceMappingURL=index.js.map