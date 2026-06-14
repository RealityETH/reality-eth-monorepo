import { BlockNotFoundError, } from '../../errors/block.js';
import { numberToHex, } from '../../utils/encoding/toHex.js';
import { formatTransactionReceipt, } from '../../utils/formatters/transactionReceipt.js';
/**
 * Returns the transaction receipts of a block at a block number, hash, or tag.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlockReceipts
 * - JSON-RPC Methods: [`eth_getBlockReceipts`](https://ethereum.github.io/execution-apis/api/methods/eth_getBlockReceipts/)
 *
 * @param client - Client to use
 * @param parameters - {@link GetBlockReceiptsParameters}
 * @returns The transaction receipts. {@link GetBlockReceiptsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlockReceipts } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const receipts = await getBlockReceipts(client, {
 *   blockNumber: 69420n,
 * })
 */
export async function getBlockReceipts(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? 'latest', } = {}) {
    const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
    const receipts = await client.request({
        method: 'eth_getBlockReceipts',
        params: [blockHash || blockNumberHex || blockTag],
    }, { dedupe: Boolean(blockHash || blockNumberHex) });
    if (!receipts)
        throw new BlockNotFoundError({ blockHash, blockNumber });
    const format = client.chain?.formatters?.transactionReceipt?.format ||
        formatTransactionReceipt;
    return receipts.map((receipt) => format(receipt, 'getBlockReceipts'));
}
//# sourceMappingURL=getBlockReceipts.js.map