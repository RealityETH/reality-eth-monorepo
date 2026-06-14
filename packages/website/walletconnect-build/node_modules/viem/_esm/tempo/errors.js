import { BaseError } from '../errors/base.js';
export class InvalidFeeTokenError extends BaseError {
    constructor({ cause, token, }) {
        super(`Fee token "${token}" is invalid.`, {
            cause,
            docsPath: '/tempo/transactions',
            docsSlug: 'pay-fees-with-stablecoins',
            metaMessages: [
                'Fee tokens must be unpaused USD-denominated TIP-20 tokens.',
                'Use `client.fee.validateToken({ token })` before sending transactions or setting fee preferences.',
            ],
            name: 'InvalidFeeTokenError',
        });
    }
}
export class FeeTokenNotTip20Error extends BaseError {
    constructor({ token }) {
        super(`Fee token "${token}" is not a TIP-20 token.`, {
            docsPath: '/tempo/transactions',
            docsSlug: 'pay-fees-with-stablecoins',
            metaMessages: [
                'Fee tokens must be TIP-20 token addresses or token IDs.',
                'TIP-20 token addresses use the `0x20c0...` address prefix.',
            ],
            name: 'FeeTokenNotTip20Error',
        });
    }
}
export class FeeTokenNotUsdError extends BaseError {
    constructor({ currency, token, }) {
        super(`Fee token "${token}" is denominated in "${currency}", not "USD".`, {
            docsPath: '/tempo/transactions',
            docsSlug: 'pay-fees-with-stablecoins',
            metaMessages: [
                'Only USD-denominated TIP-20 tokens can be used as fee tokens.',
            ],
            name: 'FeeTokenNotUsdError',
        });
    }
}
export class FeeTokenPausedError extends BaseError {
    constructor({ token }) {
        super(`Fee token "${token}" is paused.`, {
            docsPath: '/tempo/transactions',
            docsSlug: 'pay-fees-with-stablecoins',
            metaMessages: ['Paused TIP-20 tokens cannot be used as fee tokens.'],
            name: 'FeeTokenPausedError',
        });
    }
}
//# sourceMappingURL=errors.js.map