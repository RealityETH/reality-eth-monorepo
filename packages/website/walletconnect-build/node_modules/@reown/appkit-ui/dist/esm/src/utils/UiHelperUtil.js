const DECIMAL_POINT = '.';
export const UiHelperUtil = {
    getSpacingStyles(spacing, index) {
        if (Array.isArray(spacing)) {
            return spacing[index] ? `var(--apkt-spacing-${spacing[index]})` : undefined;
        }
        else if (typeof spacing === 'string') {
            return `var(--apkt-spacing-${spacing})`;
        }
        return undefined;
    },
    getFormattedDate(date) {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    },
    formatCurrency(amount = 0, options = {}) {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) {
            return '$0.00';
        }
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options
        });
        return formatter.format(numericAmount);
    },
    getHostName(url) {
        try {
            const newUrl = new URL(url);
            return newUrl.hostname;
        }
        catch (error) {
            return '';
        }
    },
    getTruncateString({ string, charsStart, charsEnd, truncate }) {
        if (string.length <= charsStart + charsEnd) {
            return string;
        }
        if (truncate === 'end') {
            return `${string.substring(0, charsStart)}...`;
        }
        else if (truncate === 'start') {
            return `...${string.substring(string.length - charsEnd)}`;
        }
        return `${string.substring(0, Math.floor(charsStart))}...${string.substring(string.length - Math.floor(charsEnd))}`;
    },
    generateAvatarColors(address) {
        const hash = address
            .toLowerCase()
            .replace(/^0x/iu, '')
            .replace(/[^a-f0-9]/gu, '');
        const baseColor = hash.substring(0, 6).padEnd(6, '0');
        const rgbColor = this.hexToRgb(baseColor);
        const masterBorderRadius = getComputedStyle(document.documentElement).getPropertyValue('--w3m-border-radius-master');
        const radius = Number(masterBorderRadius?.replace('px', ''));
        const edge = 100 - 3 * radius;
        const gradientCircle = `${edge}% ${edge}% at 65% 40%`;
        const colors = [];
        for (let i = 0; i < 5; i += 1) {
            const tintedColor = this.tintColor(rgbColor, 0.15 * i);
            colors.push(`rgb(${tintedColor[0]}, ${tintedColor[1]}, ${tintedColor[2]})`);
        }
        return `
    --local-color-1: ${colors[0]};
    --local-color-2: ${colors[1]};
    --local-color-3: ${colors[2]};
    --local-color-4: ${colors[3]};
    --local-color-5: ${colors[4]};
    --local-radial-circle: ${gradientCircle}
   `;
    },
    hexToRgb(hex) {
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    },
    tintColor(rgb, tint) {
        const [r, g, b] = rgb;
        const tintedR = Math.round(r + (255 - r) * tint);
        const tintedG = Math.round(g + (255 - g) * tint);
        const tintedB = Math.round(b + (255 - b) * tint);
        return [tintedR, tintedG, tintedB];
    },
    isNumber(character) {
        const regex = {
            number: /^[0-9]+$/u
        };
        return regex.number.test(character);
    },
    getColorTheme(theme) {
        if (theme) {
            return theme;
        }
        else if (typeof window !== 'undefined' &&
            window.matchMedia &&
            typeof window.matchMedia === 'function') {
            if (window.matchMedia('(prefers-color-scheme: dark)')?.matches) {
                return 'dark';
            }
            return 'light';
        }
        return 'dark';
    },
    splitBalance(input) {
        const parts = input.split('.');
        if (parts.length === 2) {
            return [parts[0], parts[1]];
        }
        return ['0', '00'];
    },
    roundNumber(number, threshold, fixed) {
        const roundedNumber = number.toString().length >= threshold ? Number(number).toFixed(fixed) : number;
        return roundedNumber;
    },
    cssDurationToNumber(duration) {
        if (duration.endsWith('s')) {
            return Number(duration.replace('s', '')) * 1000;
        }
        else if (duration.endsWith('ms')) {
            return Number(duration.replace('ms', ''));
        }
        return 0;
    },
    maskInput({ value, decimals, integers }) {
        value = value.replace(',', '.');
        if (value === DECIMAL_POINT) {
            return `0${DECIMAL_POINT}`;
        }
        const [integerPart = '', decimalsPart] = value
            .split(DECIMAL_POINT)
            .map(p => p.replace(/[^0-9]/gu, ''));
        const limitedInteger = integers ? integerPart.substring(0, integers) : integerPart;
        const cleanIntegerPart = limitedInteger.length === 2 ? String(Number(limitedInteger)) : limitedInteger;
        const cleanDecimalsPart = typeof decimals === 'number' ? decimalsPart?.substring(0, decimals) : decimalsPart;
        const canIncludeDecimals = typeof decimals !== 'number' || decimals > 0;
        const maskValue = typeof cleanDecimalsPart === 'string' && canIncludeDecimals
            ? [cleanIntegerPart, cleanDecimalsPart].join(DECIMAL_POINT)
            : cleanIntegerPart;
        return maskValue ?? '';
    },
    capitalize(value) {
        if (!value) {
            return '';
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
};
//# sourceMappingURL=UiHelperUtil.js.map