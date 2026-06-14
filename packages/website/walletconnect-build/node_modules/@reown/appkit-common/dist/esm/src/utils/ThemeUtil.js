export function getW3mThemeVariables(themeVariables, themeType) {
    const accent = themeVariables?.['--apkt-accent'] ?? themeVariables?.['--w3m-accent'];
    if (themeType === 'light') {
        return {
            '--w3m-accent': accent || 'hsla(231, 100%, 70%, 1)',
            '--w3m-background': '#fff'
        };
    }
    return {
        '--w3m-accent': accent || 'hsla(230, 100%, 67%, 1)',
        '--w3m-background': '#202020'
    };
}
//# sourceMappingURL=ThemeUtil.js.map