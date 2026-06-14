// eslint-disable-next-line no-shadow
export var SocialProviderEnum;
(function (SocialProviderEnum) {
    SocialProviderEnum["Google"] = "google";
    SocialProviderEnum["Github"] = "github";
    SocialProviderEnum["Apple"] = "apple";
    SocialProviderEnum["Facebook"] = "facebook";
    SocialProviderEnum["X"] = "x";
    SocialProviderEnum["Discord"] = "discord";
    SocialProviderEnum["Farcaster"] = "farcaster";
})(SocialProviderEnum || (SocialProviderEnum = {}));
export function hasProperty(value, propertyKey) {
    return hasProperties(value, [propertyKey]);
}
export function hasProperties(value, propertyKeys) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    return propertyKeys.every(propertyKey => propertyKey in value);
}
//# sourceMappingURL=TypeUtil.js.map