import type { QuoteStatus } from '../../types/quote.js';
export declare const STEPS: {
    id: string;
    title: string;
    icon: string;
}[];
export declare const TERMINAL_STATES: QuoteStatus[];
export type Step = (typeof STEPS)[number];
