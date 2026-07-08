/**
 * Super dispute game type IDs from the OP Stack contracts
 * (`contracts-bedrock/src/dispute/lib/Types.sol:99-103`).
 */
export const superGameTypes = new Set([4, 5, 7, 9]);
export function isSuperGameType(gameType) {
    return superGameTypes.has(gameType);
}
//# sourceMappingURL=gameTypes.js.map