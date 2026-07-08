"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superGameTypes = void 0;
exports.isSuperGameType = isSuperGameType;
exports.superGameTypes = new Set([4, 5, 7, 9]);
function isSuperGameType(gameType) {
    return exports.superGameTypes.has(gameType);
}
//# sourceMappingURL=gameTypes.js.map