import { AlertController, ApiController, ConstantsUtil } from '@reown/appkit-controllers';
import { ErrorUtil } from '@reown/appkit-utils';
const FEATURE_KEYS = [
    'email',
    'socials',
    'swaps',
    'onramp',
    'activity',
    'reownBranding',
    'multiWallet',
    'emailCapture',
    'payWithExchange',
    'payments',
    'reownAuthentication',
    'headless'
];
const featureConfig = {
    email: {
        apiFeatureName: 'social_login',
        localFeatureName: 'email',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => {
            if (!apiConfig?.config) {
                return false;
            }
            const config = apiConfig.config;
            return Boolean(apiConfig.isEnabled) && config.includes('email');
        },
        processFallback: (localValue) => {
            if (localValue === undefined) {
                return ConstantsUtil.DEFAULT_REMOTE_FEATURES.email;
            }
            return Boolean(localValue);
        }
    },
    socials: {
        apiFeatureName: 'social_login',
        localFeatureName: 'socials',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => {
            if (!apiConfig?.config) {
                return false;
            }
            const config = apiConfig.config;
            return Boolean(apiConfig.isEnabled) && config.length > 0
                ? config.filter((s) => s !== 'email')
                : false;
        },
        processFallback: (localValue) => {
            if (localValue === undefined) {
                return ConstantsUtil.DEFAULT_REMOTE_FEATURES.socials;
            }
            if (typeof localValue === 'boolean') {
                return localValue ? ConstantsUtil.DEFAULT_REMOTE_FEATURES.socials : false;
            }
            return localValue;
        }
    },
    swaps: {
        apiFeatureName: 'swap',
        localFeatureName: 'swaps',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => {
            if (!apiConfig?.config) {
                return false;
            }
            const config = apiConfig.config;
            return Boolean(apiConfig.isEnabled) && config.length > 0 ? config : false;
        },
        processFallback: (localValue) => {
            if (localValue === undefined) {
                return ConstantsUtil.DEFAULT_REMOTE_FEATURES.swaps;
            }
            if (typeof localValue === 'boolean') {
                return localValue ? ConstantsUtil.DEFAULT_REMOTE_FEATURES.swaps : false;
            }
            return localValue;
        }
    },
    onramp: {
        apiFeatureName: 'onramp',
        localFeatureName: 'onramp',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => {
            if (!apiConfig?.config) {
                return false;
            }
            const config = apiConfig.config;
            return Boolean(apiConfig.isEnabled) && config.length > 0 ? config : false;
        },
        processFallback: (localValue) => {
            if (localValue === undefined) {
                return ConstantsUtil.DEFAULT_REMOTE_FEATURES.onramp;
            }
            if (typeof localValue === 'boolean') {
                return localValue ? ConstantsUtil.DEFAULT_REMOTE_FEATURES.onramp : false;
            }
            return localValue;
        }
    },
    activity: {
        apiFeatureName: 'activity',
        localFeatureName: 'history',
        returnType: false,
        isLegacy: true,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => Boolean(apiConfig.isEnabled),
        processFallback: (localValue) => {
            if (localValue === undefined) {
                return ConstantsUtil.DEFAULT_REMOTE_FEATURES.activity;
            }
            return Boolean(localValue);
        }
    },
    reownBranding: {
        apiFeatureName: 'reown_branding',
        localFeatureName: 'reownBranding',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => Boolean(apiConfig.isEnabled),
        processFallback: (localValue) => {
            if (localValue === undefined) {
                return ConstantsUtil.DEFAULT_REMOTE_FEATURES.reownBranding;
            }
            return Boolean(localValue);
        }
    },
    emailCapture: {
        apiFeatureName: 'email_capture',
        localFeatureName: 'emailCapture',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => apiConfig.isEnabled && (apiConfig.config ?? []),
        processFallback: (_localValue) => false
    },
    multiWallet: {
        apiFeatureName: 'multi_wallet',
        localFeatureName: 'multiWallet',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => Boolean(apiConfig.isEnabled),
        processFallback: () => ConstantsUtil.DEFAULT_REMOTE_FEATURES.multiWallet
    },
    payWithExchange: {
        apiFeatureName: 'fund_from_exchange',
        localFeatureName: 'payWithExchange',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => Boolean(apiConfig.isEnabled),
        processFallback: () => ConstantsUtil.DEFAULT_REMOTE_FEATURES.payWithExchange
    },
    payments: {
        apiFeatureName: 'payments',
        localFeatureName: 'payments',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => Boolean(apiConfig.isEnabled),
        processFallback: () => ConstantsUtil.DEFAULT_REMOTE_FEATURES.payments
    },
    reownAuthentication: {
        apiFeatureName: 'reown_authentication',
        localFeatureName: 'reownAuthentication',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => Boolean(apiConfig.isEnabled),
        processFallback: (localValue) => {
            if (typeof localValue === 'undefined') {
                return ConstantsUtil.DEFAULT_REMOTE_FEATURES.reownAuthentication;
            }
            return Boolean(localValue);
        }
    },
    headless: {
        apiFeatureName: 'headless',
        localFeatureName: 'headless',
        returnType: false,
        isLegacy: false,
        isAvailableOnBasic: false,
        processApi: (apiConfig) => Boolean(apiConfig.isEnabled),
        processFallback: () => ConstantsUtil.DEFAULT_REMOTE_FEATURES.headless
    }
};
export const ConfigUtil = {
    localSettingsOverridden: new Set(),
    getApiConfig(id, apiProjectConfig) {
        return apiProjectConfig?.find((f) => f.id === id);
    },
    addWarning(localFeatureValue, featureKey) {
        if (localFeatureValue !== undefined) {
            const config = featureConfig[featureKey];
            const warningName = config.isLegacy
                ? `"features.${config.localFeatureName}" (now "${featureKey}")`
                : `"features.${featureKey}"`;
            this.localSettingsOverridden.add(warningName);
        }
    },
    processFeature(featureKey, localFeatures, apiProjectConfig, useApi, isBasic) {
        const config = featureConfig[featureKey];
        const localValue = localFeatures[config.localFeatureName];
        if (isBasic && !config.isAvailableOnBasic) {
            return false;
        }
        if (useApi) {
            const apiConfig = this.getApiConfig(config.apiFeatureName, apiProjectConfig);
            if (apiConfig?.config === null) {
                return this.processFallbackFeature(featureKey, localValue);
            }
            if (!apiConfig?.config) {
                return false;
            }
            if (localValue !== undefined) {
                this.addWarning(localValue, featureKey);
            }
            return this.processApiFeature(featureKey, apiConfig);
        }
        return this.processFallbackFeature(featureKey, localValue);
    },
    processApiFeature(featureKey, apiConfig) {
        return featureConfig[featureKey].processApi(apiConfig);
    },
    processFallbackFeature(featureKey, localValue) {
        return featureConfig[featureKey].processFallback(localValue);
    },
    async fetchRemoteFeatures(config) {
        const isBasic = config.basic ?? false;
        const localFeatures = config.features || {};
        this.localSettingsOverridden.clear();
        let apiProjectConfig = null;
        let shouldUseApiConfig = false;
        try {
            apiProjectConfig = await ApiController.fetchProjectConfig();
            shouldUseApiConfig = apiProjectConfig !== null && apiProjectConfig !== undefined;
        }
        catch (e) {
            console.warn('[Reown Config] Failed to fetch remote project configuration. Using local/default values.', e);
        }
        const remoteFeaturesConfig = shouldUseApiConfig && !isBasic
            ? ConstantsUtil.DEFAULT_REMOTE_FEATURES
            : ConstantsUtil.DEFAULT_REMOTE_FEATURES_DISABLED;
        try {
            for (const featureKey of FEATURE_KEYS) {
                const result = this.processFeature(featureKey, localFeatures, apiProjectConfig, shouldUseApiConfig, isBasic);
                Object.assign(remoteFeaturesConfig, { [featureKey]: result });
            }
        }
        catch (e) {
            console.warn('[Reown Config] Failed to process the configuration from Cloud. Using default values.', e);
            return ConstantsUtil.DEFAULT_REMOTE_FEATURES;
        }
        if (shouldUseApiConfig && this.localSettingsOverridden.size > 0) {
            const warningMessage = `Your local configuration for ${Array.from(this.localSettingsOverridden).join(', ')} was ignored because a remote configuration was successfully fetched. Please manage these features via your project dashboard on dashboard.reown.com.`;
            AlertController.open({
                debugMessage: ErrorUtil.ALERT_WARNINGS.LOCAL_CONFIGURATION_IGNORED.debugMessage(warningMessage)
            }, 'warning');
        }
        return remoteFeaturesConfig;
    }
};
//# sourceMappingURL=ConfigUtil.js.map