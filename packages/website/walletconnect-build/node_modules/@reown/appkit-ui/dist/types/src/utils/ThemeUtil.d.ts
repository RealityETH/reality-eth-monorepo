import type { ThemeType, ThemeVariables } from './TypeUtil.js';
export declare function initializeTheming(themeVariables?: ThemeVariables, themeMode?: ThemeType): void;
export declare function setColorTheme(themeMode?: ThemeType): void;
export declare function setThemeVariables(_themeVariables?: ThemeVariables): void;
export declare function createRootStyles(_themeVariables?: ThemeVariables): {
    core: import("lit").CSSResult;
    dark: import("lit").CSSResult;
    light: import("lit").CSSResult;
};
export declare const resetStyles: import("lit").CSSResult;
export declare const elementStyles: import("lit").CSSResult;
