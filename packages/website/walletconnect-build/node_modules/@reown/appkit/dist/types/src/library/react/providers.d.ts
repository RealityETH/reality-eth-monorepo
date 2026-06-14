import { type ReactNode } from 'react';
import { type CreateAppKit } from '../../../exports/react.js';
export type AppKitProviderProps = CreateAppKit & {
    children: ReactNode;
};
export declare function memoizeCreateAppKit(config: CreateAppKit): import("../../client/appkit.js").AppKit;
export declare function AppKitProvider({ children, ...props }: AppKitProviderProps): ReactNode;
