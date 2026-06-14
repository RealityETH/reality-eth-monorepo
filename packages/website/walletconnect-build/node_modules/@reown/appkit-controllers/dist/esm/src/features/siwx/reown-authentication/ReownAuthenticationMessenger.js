import { NetworkUtil } from '@reown/appkit-common';
import { ChainController } from '../../../controllers/ChainController.js';
export class ReownAuthenticationMessenger {
    constructor(params) {
        this.getNonce = params.getNonce;
    }
    async createMessage(input) {
        const params = {
            accountAddress: input.accountAddress,
            chainId: input.chainId,
            version: '1',
            domain: typeof document === 'undefined' ? 'Unknown Domain' : document.location.host,
            uri: typeof document === 'undefined' ? 'Unknown URI' : document.location.href,
            resources: this.resources,
            nonce: await this.getNonce(input),
            issuedAt: this.stringifyDate(new Date()),
            statement: undefined,
            expirationTime: undefined,
            notBefore: undefined
        };
        const methods = {
            toString: () => this.stringify(params)
        };
        return Object.assign(params, methods);
    }
    stringify(params) {
        const networkName = this.getNetworkName(params.chainId);
        return [
            `${params.domain} wants you to sign in with your ${networkName} account:`,
            params.accountAddress,
            params.statement ? `\n${params.statement}\n` : '',
            `URI: ${params.uri}`,
            `Version: ${params.version}`,
            `Chain ID: ${params.chainId}`,
            `Nonce: ${params.nonce}`,
            params.issuedAt && `Issued At: ${params.issuedAt}`,
            params.expirationTime && `Expiration Time: ${params.expirationTime}`,
            params.notBefore && `Not Before: ${params.notBefore}`,
            params.requestId && `Request ID: ${params.requestId}`,
            params.resources?.length &&
                params.resources.reduce((acc, resource) => `${acc}\n- ${resource}`, 'Resources:')
        ]
            .filter(line => typeof line === 'string')
            .join('\n')
            .trim();
    }
    getNetworkName(chainId) {
        const requestedNetworks = ChainController.getAllRequestedCaipNetworks();
        return NetworkUtil.getNetworkNameByCaipNetworkId(requestedNetworks, chainId);
    }
    stringifyDate(date) {
        return date.toISOString();
    }
}
//# sourceMappingURL=ReownAuthenticationMessenger.js.map