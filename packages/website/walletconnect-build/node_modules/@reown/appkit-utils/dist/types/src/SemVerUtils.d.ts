import { type AppKitSdkVersion } from '@reown/appkit-common';
export declare const SemVerUtils: {
    extractVersion(version: string | undefined): string | null;
    checkSDKVersion(version: AppKitSdkVersion): void;
    isValidVersion(version: string | undefined): boolean;
    isOlder(currentVersion: string, latestVersion: string): boolean;
};
