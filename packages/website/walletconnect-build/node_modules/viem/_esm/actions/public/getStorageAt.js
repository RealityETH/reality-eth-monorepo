import { formatBlockParameter, } from '../../utils/block/formatBlockParameter.js';
/**
 * Returns the value from a storage slot at a given address.
 *
 * - Docs: https://viem.sh/docs/contract/getStorageAt
 * - JSON-RPC Methods: [`eth_getStorageAt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat)
 *
 * @param client - Client to use
 * @param parameters - {@link GetStorageAtParameters}
 * @returns The value of the storage slot. {@link GetStorageAtReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getStorageAt } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const code = await getStorageAt(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   slot: toHex(0),
 * })
 */
export async function getStorageAt(client, { address, blockHash, blockNumber, blockTag = 'latest', requireCanonical, slot, }) {
    const block = formatBlockParameter({
        blockHash,
        blockNumber,
        blockTag,
        requireCanonical,
    });
    const data = await client.request({
        method: 'eth_getStorageAt',
        params: [address, slot, block],
    });
    return data;
}
//# sourceMappingURL=getStorageAt.js.map