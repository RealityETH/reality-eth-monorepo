import {} from 'react';
import { createAppKit } from '../../../exports/react.js';
// -- State --------------------------------------------------------------------------------
let appkit = null;
// -- Utils & Others -----------------------------------------------------------------------
export function memoizeCreateAppKit(config) {
    if (!appkit) {
        appkit = createAppKit(config);
    }
    return appkit;
}
// -- Providers ----------------------------------------------------------------------------
export function AppKitProvider({ children, ...props }) {
    memoizeCreateAppKit(props);
    return children;
}
//# sourceMappingURL=providers.js.map