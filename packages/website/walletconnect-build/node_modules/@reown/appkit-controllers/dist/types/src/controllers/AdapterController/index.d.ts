import type { ChainNamespace } from '@reown/appkit-common';
import type { AdapterBlueprint } from './ChainAdapterBlueprint.js';
export type Adapters = {
    [K in ChainNamespace]?: AdapterBlueprint;
};
export type AdapterControllerState = {
    adapters: Adapters;
};
export declare const AdapterController: {
    state: AdapterControllerState;
    initialize(adapters: Adapters): void;
    get(namespace: ChainNamespace): AdapterBlueprint<import("./types.js").ChainAdapterConnector> | undefined;
};
