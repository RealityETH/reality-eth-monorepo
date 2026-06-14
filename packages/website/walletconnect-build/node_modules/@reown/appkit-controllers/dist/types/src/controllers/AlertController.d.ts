export interface AlertControllerState {
    message: string;
    variant: 'info' | 'success' | 'warning' | 'error';
    open: boolean;
}
type StateKey = keyof AlertControllerState;
interface OpenMessageParameters {
    code?: string;
    displayMessage?: string;
    debugMessage?: string | (() => void);
}
export declare const AlertController: {
    state: AlertControllerState;
    subscribeKey<K extends StateKey>(key: K, callback: (value: AlertControllerState[K]) => void): () => void;
    open(message: OpenMessageParameters, variant: AlertControllerState["variant"]): void;
    warn(title: string, description: string, code: string): void;
    close(): void;
};
export {};
