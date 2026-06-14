export type SocialProvider = 'google' | 'github' | 'apple' | 'facebook' | 'x' | 'discord' | 'farcaster';
export declare enum SocialProviderEnum {
    Google = "google",
    Github = "github",
    Apple = "apple",
    Facebook = "facebook",
    X = "x",
    Discord = "discord",
    Farcaster = "farcaster"
}
type AnyFn = (...args: unknown[]) => unknown;
export type AsStruct<T> = {
    [P in keyof T as T[P] extends AnyFn ? never : P]: T[P];
};
export type WithoutId<T extends {
    id: unknown;
}> = Omit<T, 'id'>;
export type WithoutIdDistributive<T extends {
    id: unknown;
}> = DistributiveOmit<T, 'id'>;
export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export declare function hasProperty<T extends string>(value: unknown, propertyKey: T): value is Record<T, unknown>;
export declare function hasProperties<T extends string>(value: unknown, propertyKeys: T[]): value is Record<T, unknown>;
export {};
