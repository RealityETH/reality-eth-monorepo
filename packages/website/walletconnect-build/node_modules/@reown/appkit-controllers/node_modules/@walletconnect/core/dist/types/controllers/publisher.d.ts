import { EventEmitter } from "events";
import { RequestArguments } from "@walletconnect/jsonrpc-types";
import { Logger } from "@walletconnect/logger";
import { IPublisher, IRelayer, RelayerTypes } from "@walletconnect/types";
type IPublishType = {
    attestation?: string;
    attempt: number;
    request: RequestArguments;
    opts?: RelayerTypes.PublishOptions;
};
export declare class Publisher extends IPublisher {
    relayer: IRelayer;
    logger: Logger;
    events: EventEmitter<[never]>;
    name: string;
    queue: Map<string, IPublishType>;
    private publishTimeout;
    private initialPublishTimeout;
    private needsTransportRestart;
    constructor(relayer: IRelayer, logger: Logger);
    get context(): string;
    publish: IPublisher["publish"];
    publishCustom: IPublisher["publishCustom"];
    on: IPublisher["on"];
    once: IPublisher["once"];
    off: IPublisher["off"];
    removeListener: IPublisher["removeListener"];
    private rpcPublish;
    private removeRequestFromQueue;
    private checkQueue;
    private registerEventListeners;
}
export {};
//# sourceMappingURL=publisher.d.ts.map