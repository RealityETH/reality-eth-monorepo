/* eslint-disable @typescript-eslint/no-empty-interface */
import { useEffect, useState } from 'react';
let modal = undefined;
export function getAppKit(appKit) {
    if (appKit) {
        modal = appKit;
    }
}
// -- Core Hooks ---------------------------------------------------------------
export * from '@reown/appkit-controllers/react';
export function useAppKitTheme() {
    if (!modal) {
        throw new Error('Please call "createAppKit" before using "useAppKitTheme" hook');
    }
    function setThemeMode(themeMode) {
        if (themeMode) {
            modal?.setThemeMode(themeMode);
        }
    }
    function setThemeVariables(themeVariables) {
        if (themeVariables) {
            modal?.setThemeVariables(themeVariables);
        }
    }
    const [themeMode, setInternalThemeMode] = useState(modal.getThemeMode());
    const [themeVariables, setInternalThemeVariables] = useState(modal.getThemeVariables());
    useEffect(() => {
        const unsubscribe = modal?.subscribeTheme(state => {
            setInternalThemeMode(state.themeMode);
            setInternalThemeVariables(state.themeVariables);
        });
        return () => {
            unsubscribe?.();
        };
    }, []);
    return {
        themeMode,
        themeVariables,
        setThemeMode,
        setThemeVariables
    };
}
export function useAppKit() {
    if (!modal) {
        throw new Error('Please call "createAppKit" before using "useAppKit" hook');
    }
    async function open(options) {
        return modal?.open(options);
    }
    async function close() {
        await modal?.close();
    }
    return { open, close };
}
export function useWalletInfo(namespace) {
    if (!modal) {
        throw new Error('Please call "createAppKit" before using "useWalletInfo" hook');
    }
    const [walletInfo, setWalletInfo] = useState(() => modal?.getWalletInfo(namespace));
    useEffect(() => {
        // Sync immediately on namespace change to avoid stale data until subscription emits
        setWalletInfo(modal?.getWalletInfo(namespace));
        const unsubscribe = modal?.subscribeWalletInfo(newWalletInfo => {
            setWalletInfo(newWalletInfo);
        }, namespace);
        return () => unsubscribe?.();
    }, [namespace]);
    return { walletInfo };
}
export function useAppKitState() {
    if (!modal) {
        throw new Error('Please call "createAppKit" before using "useAppKitState" hook');
    }
    const [state, setState] = useState({ ...modal.getState(), initialized: false });
    const [remoteFeatures, setRemoteFeatures] = useState(modal.getRemoteFeatures());
    useEffect(() => {
        if (modal) {
            setState({ ...modal.getState() });
            setRemoteFeatures(modal.getRemoteFeatures());
            const unsubscribe = modal?.subscribeState(newState => {
                setState({ ...newState });
            });
            const unsubscribeRemoteFeatures = modal?.subscribeRemoteFeatures(newState => {
                setRemoteFeatures(newState);
            });
            return () => {
                unsubscribe?.();
                unsubscribeRemoteFeatures?.();
            };
        }
        return () => null;
    }, []);
    return { ...state, ...(remoteFeatures ?? {}) };
}
export function useAppKitEvents() {
    if (!modal) {
        throw new Error('Please call "createAppKit" before using "useAppKitEvents" hook');
    }
    const [event, setEvents] = useState(modal.getEvent());
    useEffect(() => {
        const unsubscribe = modal?.subscribeEvents(newEvent => {
            setEvents({ ...newEvent });
        });
        return () => {
            unsubscribe?.();
        };
    }, []);
    return event;
}
//# sourceMappingURL=index.js.map