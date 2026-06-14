import Big from 'big.js';
interface BigNumberParams {
    safe?: boolean;
}
interface FormatNumberParams {
    decimals: number;
    round?: number;
    safe?: boolean;
}
export declare const NumberUtil: {
    bigNumber(value: Big | string | number | undefined, params?: BigNumberParams): Big.Big;
    formatNumber(value: Big | number | string | undefined, params: FormatNumberParams): Big.Big;
    multiply(a: Big | number | string | undefined, b: Big | number | string | undefined): Big.Big;
    toFixed(value: string | number | undefined, decimals?: number): string;
    formatNumberToLocalString(value: string | number | undefined, decimals?: number): string;
    parseLocalStringToNumber(value: string | undefined): number;
};
export {};
