import { getBlock, } from '../../actions/public/getBlock.js';
/**
 * Gets the L2 block number for a timestamp using the latest L2 block and its parent.
 *
 * @param client - Client to use.
 * @param parameters - {@link GetL2BlockNumberAtTimestampParameters}
 * @returns L2 block number.
 */
export async function getL2BlockNumberAtTimestamp(client, parameters) {
    const latest = await getBlock(client);
    if (latest.number === null)
        throw new Error('Latest L2 block number is unavailable.');
    if (latest.timestamp === undefined)
        throw new Error('Latest L2 block timestamp is unavailable.');
    if (latest.number === 0n)
        throw new Error('Cannot derive L2 block time from genesis block.');
    const parent = await getBlock(client, { blockNumber: latest.number - 1n });
    if (parent.timestamp === undefined)
        throw new Error('Parent L2 block timestamp is unavailable.');
    const blockTime = latest.timestamp - parent.timestamp;
    if (blockTime === 0n)
        throw new Error('L2 block time is zero.');
    const timeDiff = latest.timestamp - parameters.timestamp;
    if (timeDiff < 0n)
        throw new Error('Timestamp is in the future relative to L2 head.');
    if (timeDiff % blockTime !== 0n)
        throw new Error('Timestamp does not align with the L2 block time.');
    const blocksToLookBack = timeDiff / blockTime;
    if (blocksToLookBack > latest.number)
        throw new Error('Timestamp predates L2 genesis.');
    return latest.number - blocksToLookBack;
}
//# sourceMappingURL=getL2BlockNumberAtTimestamp.js.map