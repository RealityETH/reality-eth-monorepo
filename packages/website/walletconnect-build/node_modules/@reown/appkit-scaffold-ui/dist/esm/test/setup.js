import { vi } from 'vitest';
import '@reown/appkit-ui';
import '../exports/index.js';
global.ResizeObserver = class {
    observe() {
    }
    unobserve() {
    }
    disconnect() {
    }
};
global.open = vi.fn();
global.fetch = vi.fn(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: [] }),
    text: () => Promise.resolve('')
}));
//# sourceMappingURL=setup.js.map