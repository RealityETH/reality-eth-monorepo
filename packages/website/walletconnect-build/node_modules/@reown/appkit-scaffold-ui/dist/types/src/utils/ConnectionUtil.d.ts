import type { Connection } from '@reown/appkit-common';
export declare const ConnectionUtil: {
    getAuthData(connection: Connection): {
        isAuth: boolean;
        icon: undefined;
        iconSize: undefined;
        name: undefined;
    } | {
        isAuth: boolean;
        icon: string;
        iconSize: string;
        name: string | undefined;
    };
};
