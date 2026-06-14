import Big from 'big.js';
export const NumberUtil = {
    bigNumber(value, params = {
        safe: false
    }) {
        try {
            if (!value) {
                return new Big(0);
            }
            return new Big(value);
        }
        catch (err) {
            if (params.safe) {
                return new Big(0);
            }
            throw err;
        }
    },
    formatNumber(value, params) {
        const { decimals, round = 8, safe = true } = params;
        const bigNumber = NumberUtil.bigNumber(value, { safe });
        return bigNumber.div(new Big(10).pow(decimals)).round(round);
    },
    multiply(a, b) {
        if (a === undefined || b === undefined) {
            return new Big(0);
        }
        const aBigNumber = new Big(a);
        const bBigNumber = new Big(b);
        return aBigNumber.times(bBigNumber);
    },
    toFixed(value, decimals = 2) {
        if (value === undefined || value === '') {
            return new Big(0).toFixed(decimals);
        }
        return new Big(value).toFixed(decimals);
    },
    formatNumberToLocalString(value, decimals = 2) {
        if (value === undefined || value === '') {
            return '0.00';
        }
        if (typeof value === 'number') {
            return value.toLocaleString('en-US', {
                maximumFractionDigits: decimals,
                minimumFractionDigits: decimals,
                roundingMode: 'floor'
            });
        }
        return parseFloat(value).toLocaleString('en-US', {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals,
            roundingMode: 'floor'
        });
    },
    parseLocalStringToNumber(value) {
        if (value === undefined || value === '') {
            return 0;
        }
        const sanitizedValue = value.replace(/,/gu, '');
        return new Big(sanitizedValue).toNumber();
    }
};
//# sourceMappingURL=NumberUtil.js.map