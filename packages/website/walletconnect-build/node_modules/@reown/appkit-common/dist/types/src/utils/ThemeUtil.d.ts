export type ThemeType = 'dark' | 'light';
export interface ThemeVariables {
    '--w3m-font-family'?: string;
    '--w3m-accent'?: string;
    '--w3m-color-mix'?: string;
    '--w3m-color-mix-strength'?: number;
    '--w3m-font-size-master'?: string;
    '--w3m-border-radius-master'?: string;
    '--w3m-z-index'?: number;
    '--w3m-qr-color'?: string;
    '--apkt-font-family'?: string;
    '--apkt-accent'?: string;
    '--apkt-color-mix'?: string;
    '--apkt-color-mix-strength'?: number;
    '--apkt-font-size-master'?: string;
    '--apkt-border-radius-master'?: string;
    '--apkt-z-index'?: number;
    '--apkt-qr-color'?: string;
}
export interface W3mThemeVariables {
    '--w3m-accent': string;
    '--w3m-background': string;
}
export declare function getW3mThemeVariables(themeVariables?: ThemeVariables, themeType?: ThemeType): {
    '--w3m-accent': string;
    '--w3m-background': string;
};
