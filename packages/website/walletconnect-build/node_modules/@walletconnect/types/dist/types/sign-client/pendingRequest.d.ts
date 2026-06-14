import { IStore, Verify } from "../core/index.js";
import { SignClientTypes } from "./client.js";
export declare namespace PendingRequestTypes {
    interface Struct {
        topic: string;
        id: number;
        params: SignClientTypes.EventArguments["session_request"]["params"];
        verifyContext: Verify.Context;
    }
}
export type IPendingRequest = IStore<number, PendingRequestTypes.Struct>;
//# sourceMappingURL=pendingRequest.d.ts.map