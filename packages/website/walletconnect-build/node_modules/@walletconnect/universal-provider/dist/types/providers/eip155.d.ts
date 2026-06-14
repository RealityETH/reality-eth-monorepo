import Client from "@walletconnect/sign-client";
import { SessionTypes } from "@walletconnect/types";
import { IProvider, RpcProvidersMap, SubProviderOpts, RequestParams, SessionNamespace } from "../types/index.js";
import { Storage } from "../utils/index.js";
import EventEmitter from "events";
declare class Eip155Provider implements IProvider {
    name: string;
    client: Client;
    chainId: number;
    namespace: SessionNamespace;
    httpProviders: RpcProvidersMap;
    events: EventEmitter;
    storage: Storage;
    constructor(opts: SubProviderOpts);
    request<T = unknown>(args: RequestParams): Promise<T>;
    updateNamespace(namespace: SessionTypes.Namespace): void;
    setDefaultChain(chainId: string, rpcUrl?: string | undefined): void;
    requestAccounts(): string[];
    getDefaultChain(): string;
    private createHttpProvider;
    private setHttpProvider;
    private createHttpProviders;
    private getAccounts;
    private getHttpProvider;
    private handleSwitchChain;
    private isChainApproved;
    private getCapabilities;
    private getCallStatus;
    private getUserOperationReceipt;
    private getBundlerUrl;
    private sendCalls;
}
export default Eip155Provider;
//# sourceMappingURL=eip155.d.ts.map