import { type ChainNamespace } from '@reown/appkit-common';
export declare const HelpersUtil: {
    getTabsByNamespace(namespace?: ChainNamespace): {
        label: string;
    }[];
    isValidReownName(name: string): boolean;
    isValidEmail(email: string): boolean;
    validateReownName(name: string): string;
    hasFooter(): boolean;
};
