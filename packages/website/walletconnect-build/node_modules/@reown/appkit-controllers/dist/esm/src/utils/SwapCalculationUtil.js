// -- Types --------------------------------------------- //
import { NumberUtil } from '@reown/appkit-common';
// -- Util ---------------------------------------- //
export const SwapCalculationUtil = {
    getGasPriceInEther(gas, gasPrice) {
        const totalGasCostInWei = gasPrice * gas;
        const totalGasCostInEther = Number(totalGasCostInWei) / 1e18;
        return totalGasCostInEther;
    },
    getGasPriceInUSD(networkPrice, gas, gasPrice) {
        const totalGasCostInEther = SwapCalculationUtil.getGasPriceInEther(gas, gasPrice);
        const networkPriceInUSD = NumberUtil.bigNumber(networkPrice);
        const gasCostInUSD = networkPriceInUSD.times(totalGasCostInEther);
        return gasCostInUSD.toNumber();
    },
    getPriceImpact({ sourceTokenAmount, sourceTokenPriceInUSD, toTokenPriceInUSD, toTokenAmount }) {
        const inputValue = NumberUtil.bigNumber(sourceTokenAmount).times(sourceTokenPriceInUSD);
        const outputValue = NumberUtil.bigNumber(toTokenAmount).times(toTokenPriceInUSD);
        const priceImpact = inputValue.minus(outputValue).div(inputValue).times(100);
        return priceImpact.toNumber();
    },
    getMaxSlippage(slippage, toTokenAmount) {
        const slippageToleranceDecimal = NumberUtil.bigNumber(slippage).div(100);
        const maxSlippageAmount = NumberUtil.multiply(toTokenAmount, slippageToleranceDecimal);
        return maxSlippageAmount.toNumber();
    },
    getProviderFee(sourceTokenAmount, feePercentage = 0.0085) {
        const providerFee = NumberUtil.bigNumber(sourceTokenAmount).times(feePercentage);
        return providerFee.toString();
    },
    isInsufficientNetworkTokenForGas(networkBalanceInUSD, gasPriceInUSD) {
        const gasPrice = gasPriceInUSD || '0';
        if (NumberUtil.bigNumber(networkBalanceInUSD).eq(0)) {
            return true;
        }
        return NumberUtil.bigNumber(NumberUtil.bigNumber(gasPrice)).gt(networkBalanceInUSD);
    },
    isInsufficientSourceTokenForSwap(sourceTokenAmount, sourceTokenAddress, balance) {
        const sourceTokenBalance = balance?.find(token => token.address === sourceTokenAddress)
            ?.quantity?.numeric;
        const isInSufficientBalance = NumberUtil.bigNumber(sourceTokenBalance || '0').lt(sourceTokenAmount);
        return isInSufficientBalance;
    }
};
//# sourceMappingURL=SwapCalculationUtil.js.map