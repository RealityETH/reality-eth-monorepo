import { LitElement } from 'lit';
export declare class W3mRouterContainer extends LitElement {
    static styles: import("lit").CSSResult[];
    private resizeObserver?;
    transitionDuration: string;
    transitionFunction: string;
    history: string;
    view: string | undefined;
    setView: ((view: string) => void) | undefined;
    private viewDirection;
    private historyState;
    private previousHeight;
    private mobileFullScreen;
    private onViewportResize;
    updated(changedProps: Map<string, unknown>): void;
    firstUpdated(): void;
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private onViewChange;
    private getWrapper;
    private updateContainerHeight;
    private getHeaderHeight;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-router-container': W3mRouterContainer;
    }
}
