import { css as litCSS, unsafeCSS } from 'lit';
import { styles as allStyles, tokens } from './ThemeConstantsUtil.js';
const PREFIX_VAR = '--apkt';
function normalizeThemeVariables(themeVariables) {
    if (!themeVariables) {
        return {};
    }
    const normalized = {};
    normalized['font-family'] =
        themeVariables['--apkt-font-family'] ?? themeVariables['--w3m-font-family'] ?? 'KHTeka';
    normalized['accent'] =
        themeVariables['--apkt-accent'] ?? themeVariables['--w3m-accent'] ?? '#0988F0';
    normalized['color-mix'] =
        themeVariables['--apkt-color-mix'] ?? themeVariables['--w3m-color-mix'] ?? '#000';
    normalized['color-mix-strength'] =
        themeVariables['--apkt-color-mix-strength'] ?? themeVariables['--w3m-color-mix-strength'] ?? 0;
    normalized['font-size-master'] =
        themeVariables['--apkt-font-size-master'] ?? themeVariables['--w3m-font-size-master'] ?? '10px';
    normalized['border-radius-master'] =
        themeVariables['--apkt-border-radius-master'] ??
            themeVariables['--w3m-border-radius-master'] ??
            '4px';
    if (themeVariables['--apkt-z-index'] !== undefined) {
        normalized['z-index'] = themeVariables['--apkt-z-index'];
    }
    else if (themeVariables['--w3m-z-index'] !== undefined) {
        normalized['z-index'] = themeVariables['--w3m-z-index'];
    }
    return normalized;
}
export const ThemeHelperUtil = {
    createCSSVariables(styles) {
        const cssVariables = {};
        const cssVariablesVarPrefix = {};
        function createVars(_styles, parent, currentVar = '') {
            for (const [styleKey, styleValue] of Object.entries(_styles)) {
                const variable = currentVar ? `${currentVar}-${styleKey}` : styleKey;
                if (styleValue && typeof styleValue === 'object' && Object.keys(styleValue).length) {
                    parent[styleKey] = {};
                    createVars(styleValue, parent[styleKey], variable);
                }
                else if (typeof styleValue === 'string') {
                    parent[styleKey] = `${PREFIX_VAR}-${variable}`;
                }
            }
        }
        function addVarsPrefix(_styles, parent) {
            for (const [key, value] of Object.entries(_styles)) {
                if (value && typeof value === 'object') {
                    parent[key] = {};
                    addVarsPrefix(value, parent[key]);
                }
                else if (typeof value === 'string') {
                    parent[key] = `var(${value})`;
                }
            }
        }
        createVars(styles, cssVariables);
        addVarsPrefix(cssVariables, cssVariablesVarPrefix);
        return { cssVariables, cssVariablesVarPrefix };
    },
    assignCSSVariables(vars, styles) {
        const assignedCSSVariables = {};
        function assignVars(_vars, _styles, variable) {
            for (const [varKey, varValue] of Object.entries(_vars)) {
                const nextVariable = variable ? `${variable}-${varKey}` : varKey;
                const styleValues = _styles[varKey];
                if (varValue && typeof varValue === 'object') {
                    assignVars(varValue, styleValues, nextVariable);
                }
                else if (typeof styleValues === 'string') {
                    assignedCSSVariables[`${PREFIX_VAR}-${nextVariable}`] = styleValues;
                }
            }
        }
        assignVars(vars, styles);
        return assignedCSSVariables;
    },
    createRootStyles(theme, themeVariables) {
        const styles = {
            ...allStyles,
            tokens: { ...allStyles.tokens, theme: theme === 'light' ? tokens.light : tokens.dark }
        };
        const { cssVariables } = ThemeHelperUtil.createCSSVariables(styles);
        const assignedCSSVariables = ThemeHelperUtil.assignCSSVariables(cssVariables, styles);
        const w3mVariables = ThemeHelperUtil.generateW3MVariables(themeVariables);
        const w3mOverrides = ThemeHelperUtil.generateW3MOverrides(themeVariables);
        const scaledVariables = ThemeHelperUtil.generateScaledVariables(themeVariables);
        const baseVariables = ThemeHelperUtil.generateBaseVariables(assignedCSSVariables);
        const allVariables = {
            ...assignedCSSVariables,
            ...baseVariables,
            ...w3mVariables,
            ...w3mOverrides,
            ...scaledVariables
        };
        const colorMixVariables = ThemeHelperUtil.applyColorMixToVariables(themeVariables, allVariables);
        const finalVariables = {
            ...allVariables,
            ...colorMixVariables
        };
        const rootStyles = Object.entries(finalVariables)
            .map(([key, style]) => `${key}:${style.replace('/[:;{}</>]/g', '')};`)
            .join('');
        return `:root {${rootStyles}}`;
    },
    generateW3MVariables(themeVariables) {
        if (!themeVariables) {
            return {};
        }
        const normalized = normalizeThemeVariables(themeVariables);
        const variables = {};
        variables['--w3m-font-family'] = normalized['font-family'];
        variables['--w3m-accent'] = normalized['accent'];
        variables['--w3m-color-mix'] = normalized['color-mix'];
        variables['--w3m-color-mix-strength'] = `${normalized['color-mix-strength']}%`;
        variables['--w3m-font-size-master'] = normalized['font-size-master'];
        variables['--w3m-border-radius-master'] = normalized['border-radius-master'];
        return variables;
    },
    generateW3MOverrides(themeVariables) {
        if (!themeVariables) {
            return {};
        }
        const normalized = normalizeThemeVariables(themeVariables);
        const overrides = {};
        if (themeVariables['--apkt-accent'] || themeVariables['--w3m-accent']) {
            const accentColor = normalized['accent'];
            overrides['--apkt-tokens-core-iconAccentPrimary'] = accentColor;
            overrides['--apkt-tokens-core-borderAccentPrimary'] = accentColor;
            overrides['--apkt-tokens-core-textAccentPrimary'] = accentColor;
            overrides['--apkt-tokens-core-backgroundAccentPrimary'] = accentColor;
        }
        if (themeVariables['--apkt-font-family'] || themeVariables['--w3m-font-family']) {
            overrides['--apkt-fontFamily-regular'] = normalized['font-family'];
        }
        if (normalized['z-index'] !== undefined) {
            overrides['--apkt-tokens-core-zIndex'] = `${normalized['z-index']}`;
        }
        return overrides;
    },
    generateScaledVariables(themeVariables) {
        if (!themeVariables) {
            return {};
        }
        const normalized = normalizeThemeVariables(themeVariables);
        const scaledVars = {};
        if (themeVariables['--apkt-font-size-master'] || themeVariables['--w3m-font-size-master']) {
            const masterSize = parseFloat(normalized['font-size-master'].replace('px', ''));
            scaledVars['--apkt-textSize-h1'] = `${Number(masterSize) * 5}px`;
            scaledVars['--apkt-textSize-h2'] = `${Number(masterSize) * 4.4}px`;
            scaledVars['--apkt-textSize-h3'] = `${Number(masterSize) * 3.8}px`;
            scaledVars['--apkt-textSize-h4'] = `${Number(masterSize) * 3.2}px`;
            scaledVars['--apkt-textSize-h5'] = `${Number(masterSize) * 2.6}px`;
            scaledVars['--apkt-textSize-h6'] = `${Number(masterSize) * 2}px`;
            scaledVars['--apkt-textSize-large'] = `${Number(masterSize) * 1.6}px`;
            scaledVars['--apkt-textSize-medium'] = `${Number(masterSize) * 1.4}px`;
            scaledVars['--apkt-textSize-small'] = `${Number(masterSize) * 1.2}px`;
        }
        if (themeVariables['--apkt-border-radius-master'] ||
            themeVariables['--w3m-border-radius-master']) {
            const masterRadius = parseFloat(normalized['border-radius-master'].replace('px', ''));
            scaledVars['--apkt-borderRadius-1'] = `${Number(masterRadius)}px`;
            scaledVars['--apkt-borderRadius-2'] = `${Number(masterRadius) * 2}px`;
            scaledVars['--apkt-borderRadius-3'] = `${Number(masterRadius) * 3}px`;
            scaledVars['--apkt-borderRadius-4'] = `${Number(masterRadius) * 4}px`;
            scaledVars['--apkt-borderRadius-5'] = `${Number(masterRadius) * 5}px`;
            scaledVars['--apkt-borderRadius-6'] = `${Number(masterRadius) * 6}px`;
            scaledVars['--apkt-borderRadius-8'] = `${Number(masterRadius) * 8}px`;
            scaledVars['--apkt-borderRadius-16'] = `${Number(masterRadius) * 16}px`;
            scaledVars['--apkt-borderRadius-20'] = `${Number(masterRadius) * 20}px`;
            scaledVars['--apkt-borderRadius-32'] = `${Number(masterRadius) * 32}px`;
            scaledVars['--apkt-borderRadius-64'] = `${Number(masterRadius) * 64}px`;
            scaledVars['--apkt-borderRadius-128'] = `${Number(masterRadius) * 128}px`;
        }
        return scaledVars;
    },
    generateColorMixCSS(themeVariables, allVariables) {
        if (!themeVariables?.['--w3m-color-mix'] || !themeVariables['--w3m-color-mix-strength']) {
            return '';
        }
        const colorMix = themeVariables['--w3m-color-mix'];
        const strength = themeVariables['--w3m-color-mix-strength'];
        if (!strength || strength === 0) {
            return '';
        }
        const colorVariables = Object.keys(allVariables || {}).filter(key => {
            const isColorToken = key.includes('-tokens-core-background') ||
                key.includes('-tokens-core-text') ||
                key.includes('-tokens-core-border') ||
                key.includes('-tokens-core-foreground') ||
                key.includes('-tokens-core-icon') ||
                key.includes('-tokens-theme-background') ||
                key.includes('-tokens-theme-text') ||
                key.includes('-tokens-theme-border') ||
                key.includes('-tokens-theme-foreground') ||
                key.includes('-tokens-theme-icon');
            const isDimensional = key.includes('-borderRadius-') ||
                key.includes('-spacing-') ||
                key.includes('-textSize-') ||
                key.includes('-fontFamily-') ||
                key.includes('-fontWeight-') ||
                key.includes('-typography-') ||
                key.includes('-duration-') ||
                key.includes('-ease-') ||
                key.includes('-path-') ||
                key.includes('-width-') ||
                key.includes('-height-') ||
                key.includes('-visual-size-') ||
                key.includes('-modal-width') ||
                key.includes('-cover');
            return isColorToken && !isDimensional;
        });
        if (colorVariables.length === 0) {
            return '';
        }
        const colorMixVariables = colorVariables
            .map(key => {
            const originalValue = allVariables?.[key] || '';
            if (originalValue.includes('color-mix') ||
                originalValue.startsWith('#') ||
                originalValue.startsWith('rgb')) {
                return `${key}: color-mix(in srgb, ${colorMix} ${strength}%, ${originalValue});`;
            }
            return `${key}: color-mix(in srgb, ${colorMix} ${strength}%, var(${key}-base, ${originalValue}));`;
        })
            .join('');
        return ` @supports (background: color-mix(in srgb, white 50%, black)) {
      :root {
        ${colorMixVariables}
      }
    }`;
    },
    generateBaseVariables(assignedCSSVariables) {
        const baseVariables = {};
        const themeBackgroundPrimary = assignedCSSVariables['--apkt-tokens-theme-backgroundPrimary'];
        if (themeBackgroundPrimary) {
            baseVariables['--apkt-tokens-theme-backgroundPrimary-base'] = themeBackgroundPrimary;
        }
        const coreBackgroundAccentPrimary = assignedCSSVariables['--apkt-tokens-core-backgroundAccentPrimary'];
        if (coreBackgroundAccentPrimary) {
            baseVariables['--apkt-tokens-core-backgroundAccentPrimary-base'] = coreBackgroundAccentPrimary;
        }
        return baseVariables;
    },
    applyColorMixToVariables(themeVariables, allVariables) {
        const colorMixVariables = {};
        if (allVariables?.['--apkt-tokens-theme-backgroundPrimary']) {
            colorMixVariables['--apkt-tokens-theme-backgroundPrimary'] =
                'var(--apkt-tokens-theme-backgroundPrimary-base)';
        }
        if (allVariables?.['--apkt-tokens-core-backgroundAccentPrimary']) {
            colorMixVariables['--apkt-tokens-core-backgroundAccentPrimary'] =
                'var(--apkt-tokens-core-backgroundAccentPrimary-base)';
        }
        const normalized = normalizeThemeVariables(themeVariables);
        const colorMix = normalized['color-mix'];
        const strength = normalized['color-mix-strength'];
        if (!strength || strength === 0) {
            return colorMixVariables;
        }
        const colorVariables = Object.keys(allVariables || {}).filter(key => {
            const isColorToken = key.includes('-tokens-core-background') ||
                key.includes('-tokens-core-text') ||
                key.includes('-tokens-core-border') ||
                key.includes('-tokens-core-foreground') ||
                key.includes('-tokens-core-icon') ||
                key.includes('-tokens-theme-background') ||
                key.includes('-tokens-theme-text') ||
                key.includes('-tokens-theme-border') ||
                key.includes('-tokens-theme-foreground') ||
                key.includes('-tokens-theme-icon') ||
                key.includes('-tokens-theme-overlay');
            const isDimensional = key.includes('-borderRadius-') ||
                key.includes('-spacing-') ||
                key.includes('-textSize-') ||
                key.includes('-fontFamily-') ||
                key.includes('-fontWeight-') ||
                key.includes('-typography-') ||
                key.includes('-duration-') ||
                key.includes('-ease-') ||
                key.includes('-path-') ||
                key.includes('-width-') ||
                key.includes('-height-') ||
                key.includes('-visual-size-') ||
                key.includes('-modal-width') ||
                key.includes('-cover');
            return isColorToken && !isDimensional;
        });
        if (colorVariables.length === 0) {
            return colorMixVariables;
        }
        colorVariables.forEach(key => {
            const originalValue = allVariables?.[key] || '';
            if (key.endsWith('-base')) {
                return;
            }
            if (key === '--apkt-tokens-theme-backgroundPrimary' ||
                key === '--apkt-tokens-core-backgroundAccentPrimary') {
                colorMixVariables[key] = `color-mix(in srgb, ${colorMix} ${strength}%, var(${key}-base))`;
            }
            else if (originalValue.includes('color-mix') ||
                originalValue.startsWith('#') ||
                originalValue.startsWith('rgb')) {
                colorMixVariables[key] = `color-mix(in srgb, ${colorMix} ${strength}%, ${originalValue})`;
            }
            else {
                colorMixVariables[key] =
                    `color-mix(in srgb, ${colorMix} ${strength}%, var(${key}-base, ${originalValue}))`;
            }
        });
        return colorMixVariables;
    }
};
const { cssVariablesVarPrefix: vars } = ThemeHelperUtil.createCSSVariables(allStyles);
function css(strings, ...values) {
    return litCSS(strings, ...values.map(value => typeof value === 'function' ? unsafeCSS(value(vars)) : unsafeCSS(value)));
}
export { css, vars };
//# sourceMappingURL=ThemeHelperUtil.js.map