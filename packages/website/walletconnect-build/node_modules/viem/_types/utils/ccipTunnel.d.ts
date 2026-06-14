import { ccipRequest as ccipRequest_ } from './ccip.js';
export type CcipReadTunnelParameters = {
    batchGateways: string[];
    ccipRequest?: typeof ccipRequest_;
};
export declare function ccipReadTunnel({ batchGateways, ccipRequest, }: CcipReadTunnelParameters): {
    request: typeof ccipRequest_;
};
//# sourceMappingURL=ccipTunnel.d.ts.map