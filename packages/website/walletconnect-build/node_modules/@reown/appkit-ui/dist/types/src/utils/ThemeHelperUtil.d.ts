import { type CSSResultGroup } from 'lit';
import type { ThemeType } from '@reown/appkit-common';
import type { ThemeVariables } from './TypeUtil.js';
export declare const ThemeHelperUtil: {
    createCSSVariables<styles extends Record<string, unknown>>(styles: styles): {
        cssVariables: styles;
        cssVariablesVarPrefix: styles;
    };
    assignCSSVariables<vars extends Record<string, unknown>, styles extends Record<string, unknown>>(vars: vars, styles: styles): Record<string, string>;
    createRootStyles(theme: ThemeType, themeVariables?: ThemeVariables): string;
    generateW3MVariables(themeVariables?: ThemeVariables): Record<string, string>;
    generateW3MOverrides(themeVariables?: ThemeVariables): Record<string, string>;
    generateScaledVariables(themeVariables?: ThemeVariables): Record<string, string>;
    generateColorMixCSS(themeVariables?: ThemeVariables, allVariables?: Record<string, string>): string;
    generateBaseVariables(assignedCSSVariables: Record<string, string>): Record<string, string>;
    applyColorMixToVariables(themeVariables?: ThemeVariables, allVariables?: Record<string, string>): Record<string, string>;
};
declare const vars: {
    colors: {
        black: string;
        white: string;
        white010: string;
        accent010: string;
        accent020: string;
        accent030: string;
        accent040: string;
        accent050: string;
        accent060: string;
        accent070: string;
        accent080: string;
        accent090: string;
        accent100: string;
        accentSecondary010: string;
        accentSecondary020: string;
        accentSecondary030: string;
        accentSecondary040: string;
        accentSecondary050: string;
        accentSecondary060: string;
        accentSecondary070: string;
        accentSecondary080: string;
        accentSecondary090: string;
        accentSecondary100: string;
        productWalletKit: string;
        productAppKit: string;
        productCloud: string;
        productDocumentation: string;
        neutrals050: string;
        neutrals100: string;
        neutrals200: string;
        neutrals300: string;
        neutrals400: string;
        neutrals500: string;
        neutrals600: string;
        neutrals700: string;
        neutrals800: string;
        neutrals900: string;
        neutrals1000: string;
        semanticSuccess010: string;
        semanticSuccess020: string;
        semanticSuccess030: string;
        semanticSuccess040: string;
        semanticSuccess050: string;
        semanticSuccess060: string;
        semanticSuccess070: string;
        semanticSuccess080: string;
        semanticSuccess090: string;
        semanticSuccess100: string;
        semanticError010: string;
        semanticError020: string;
        semanticError030: string;
        semanticError040: string;
        semanticError050: string;
        semanticError060: string;
        semanticError070: string;
        semanticError080: string;
        semanticError090: string;
        semanticError100: string;
        semanticWarning010: string;
        semanticWarning020: string;
        semanticWarning030: string;
        semanticWarning040: string;
        semanticWarning050: string;
        semanticWarning060: string;
        semanticWarning070: string;
        semanticWarning080: string;
        semanticWarning090: string;
        semanticWarning100: string;
    };
    fontFamily: {
        regular: string;
        mono: string;
    };
    fontWeight: {
        regular: string;
        medium: string;
    };
    textSize: {
        h1: string;
        h2: string;
        h3: string;
        h4: string;
        h5: string;
        h6: string;
        large: string;
        medium: string;
        small: string;
    };
    typography: {
        'h1-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h1-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h1-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h2-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h2-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h2-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h3-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h3-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h3-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h4-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h4-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h4-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h5-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h5-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h5-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h6-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h6-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'h6-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
        'lg-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'lg-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'lg-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
        'md-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'md-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'md-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
        'sm-regular-mono': {
            lineHeight: string;
            letterSpacing: string;
        };
        'sm-regular': {
            lineHeight: string;
            letterSpacing: string;
        };
        'sm-medium': {
            lineHeight: string;
            letterSpacing: string;
        };
    };
    tokens: {
        core: {
            backgroundAccentPrimary: string;
            backgroundAccentCertified: string;
            backgroundWalletKit: string;
            backgroundAppKit: string;
            backgroundCloud: string;
            backgroundDocumentation: string;
            backgroundSuccess: string;
            backgroundError: string;
            backgroundWarning: string;
            textAccentPrimary: string;
            textAccentCertified: string;
            textWalletKit: string;
            textAppKit: string;
            textCloud: string;
            textDocumentation: string;
            textSuccess: string;
            textError: string;
            textWarning: string;
            borderAccentPrimary: string;
            borderSecondary: string;
            borderSuccess: string;
            borderError: string;
            borderWarning: string;
            foregroundAccent010: string;
            foregroundAccent020: string;
            foregroundAccent040: string;
            foregroundAccent060: string;
            foregroundSecondary020: string;
            foregroundSecondary040: string;
            foregroundSecondary060: string;
            iconAccentPrimary: string;
            iconAccentCertified: string;
            iconSuccess: string;
            iconError: string;
            iconWarning: string;
            glass010: string;
            zIndex: string;
        };
        theme: {
            overlay: string;
            backgroundPrimary: string;
            backgroundInvert: string;
            textPrimary: string;
            textSecondary: string;
            textTertiary: string;
            textInvert: string;
            borderPrimary: string;
            borderPrimaryDark: string;
            borderSecondary: string;
            foregroundPrimary: string;
            foregroundSecondary: string;
            foregroundTertiary: string;
            iconDefault: string;
            iconInverse: string;
        };
    };
    borderRadius: {
        '1': string;
        '2': string;
        '10': string;
        '3': string;
        '4': string;
        '6': string;
        '5': string;
        '8': string;
        '16': string;
        '20': string;
        '32': string;
        '64': string;
        '128': string;
        round: string;
    };
    spacing: {
        '0': string;
        '01': string;
        '1': string;
        '2': string;
        '3': string;
        '4': string;
        '5': string;
        '6': string;
        '7': string;
        '8': string;
        '9': string;
        '10': string;
        '12': string;
        '14': string;
        '16': string;
        '20': string;
        '32': string;
        '64': string;
    };
    durations: {
        xl: string;
        lg: string;
        md: string;
        sm: string;
    };
    easings: {
        'ease-out-power-2': string;
        'ease-out-power-1': string;
        'ease-in-power-2': string;
        'ease-in-power-1': string;
        'ease-inout-power-2': string;
        'ease-inout-power-1': string;
    };
};
declare function css(strings: TemplateStringsArray, ...values: ((_vars: typeof vars) => CSSResultGroup | number | string)[]): import("lit").CSSResult;
export { css, vars };
