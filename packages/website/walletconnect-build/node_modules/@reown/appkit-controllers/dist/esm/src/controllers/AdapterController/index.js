const state = {
    adapters: {}
};
export const AdapterController = {
    state,
    initialize(adapters) {
        state.adapters = { ...adapters };
    },
    get(namespace) {
        return state.adapters[namespace];
    }
};
//# sourceMappingURL=index.js.map