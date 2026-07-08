import { erc20Abi } from '../../constants/abis.js';
import { readContract } from '../public/readContract.js';
import { findDeclaredToken, resolveToken, } from './internal.js';
/**
 * Gets the metadata (`decimals`, `name`, `symbol`) of an ERC-20 token.
 *
 * Fields declared on the Client's `tokens` array are used as-is; any missing
 * field is fetched from the token contract.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const metadata = await token.getMetadata(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token metadata (`decimals`, `name`, `symbol`).
 */
export async function getMetadata(client, parameters) {
    const { token, ...rest } = parameters;
    const { address } = resolveToken(client, { token });
    const declared = findDeclaredToken(client, token);
    const [decimals_, name, symbol] = await Promise.all([
        declared?.decimals ??
            readContract(client, {
                ...rest,
                abi: erc20Abi,
                address,
                functionName: 'decimals',
            }),
        declared?.name ??
            readContract(client, {
                ...rest,
                abi: erc20Abi,
                address,
                functionName: 'name',
            }),
        declared?.symbol ??
            readContract(client, {
                ...rest,
                abi: erc20Abi,
                address,
                functionName: 'symbol',
            }),
    ]);
    return {
        decimals: decimals_,
        name: name,
        symbol: symbol,
    };
}
//# sourceMappingURL=getMetadata.js.map