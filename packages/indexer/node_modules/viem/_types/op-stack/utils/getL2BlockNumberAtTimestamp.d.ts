import { type GetBlockErrorType } from '../../actions/public/getBlock.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { ErrorType } from '../../errors/utils.js';
import type { Account } from '../../types/account.js';
import type { Chain } from '../../types/chain.js';
export type GetL2BlockNumberAtTimestampParameters = {
    /** L2 block timestamp. */
    timestamp: bigint;
};
export type GetL2BlockNumberAtTimestampReturnType = bigint;
export type GetL2BlockNumberAtTimestampErrorType = GetBlockErrorType | ErrorType;
/**
 * Gets the L2 block number for a timestamp using the latest L2 block and its parent.
 *
 * @param client - Client to use.
 * @param parameters - {@link GetL2BlockNumberAtTimestampParameters}
 * @returns L2 block number.
 */
export declare function getL2BlockNumberAtTimestamp(client: Client<Transport, Chain | undefined, Account | undefined>, parameters: GetL2BlockNumberAtTimestampParameters): Promise<GetL2BlockNumberAtTimestampReturnType>;
//# sourceMappingURL=getL2BlockNumberAtTimestamp.d.ts.map