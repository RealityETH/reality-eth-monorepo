import type { ConnectorImpressionItem, Event, PendingEvent, WalletImpressionItem } from '../utils/TypeUtil.js';
export interface EventsControllerState {
    timestamp: number;
    lastFlush: number;
    reportedErrors: Record<string, boolean>;
    data: Event;
    pendingEvents: PendingEvent[];
    subscribedToVisibilityChange: boolean;
    walletImpressions: (WalletImpressionItem | ConnectorImpressionItem)[];
}
export declare const EventsController: {
    state: EventsControllerState;
    subscribe(callback: (newState: EventsControllerState) => void): () => void;
    getSdkProperties(): {
        projectId: string;
        st: "appkit";
        sv: import("../utils/TypeUtil.js").SdkVersion;
    };
    shouldFlushEvents(): boolean;
    _setPendingEvent(payload: EventsControllerState): void;
    sendEvent(data: Event): void;
    /**
     * Adds a wallet impression item to the aggregated list. These are flushed as a single
     * WALLET_IMPRESSION_V2 batch in _submitPendingEvents.
     */
    sendWalletImpressionEvent(item: WalletImpressionItem | ConnectorImpressionItem): void;
    _transformPendingEventsForBatch(events: PendingEvent[]): PendingEvent[];
    _submitPendingEvents(): void;
    subscribeToFlushTriggers(): void;
};
