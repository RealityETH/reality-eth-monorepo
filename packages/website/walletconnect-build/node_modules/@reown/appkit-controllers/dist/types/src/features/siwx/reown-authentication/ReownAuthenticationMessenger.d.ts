import type { SIWXMessage } from '../../../utils/SIWXUtil.js';
export declare class ReownAuthenticationMessenger {
    resources?: SIWXMessage['resources'];
    protected getNonce: (params: SIWXMessage.Input) => Promise<SIWXMessage['nonce']>;
    constructor(params: ReownAuthenticationMessenger.ConstructorParams);
    createMessage(input: SIWXMessage.Input): Promise<SIWXMessage>;
    private stringify;
    private getNetworkName;
    private stringifyDate;
}
export declare namespace ReownAuthenticationMessenger {
    interface ConstructorParams {
        getNonce: (params: SIWXMessage.Input) => Promise<SIWXMessage['nonce']>;
    }
}
