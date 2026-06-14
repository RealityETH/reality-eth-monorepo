import type { Address, Hex } from "../../types/misc.js";
import type { PublicClient } from "viem";
/**
 * Wraps a smart account signature with EIP-6492 deployment data if the account is not yet deployed.
 *
 * For undeployed (counterfactual) Coinbase Smart Wallet accounts, validators cannot call
 * `isValidSignature` on-chain. EIP-6492 embeds the factory address and calldata so that
 * validators can simulate deployment before verifying the signature.
 *
 * @param publicClient - A viem public client used to check the account bytecode.
 * @param accountAddress - The smart account address to check deployment status.
 * @param ownerAddress - The owner address used as the factory `createAccount` argument.
 * @param signature - The inner ERC-1271 signature to wrap.
 * @returns The original signature if the account is deployed, or an EIP-6492 wrapped signature otherwise.
 */
export declare function wrapSignatureWithEip6492IfUndeployed(publicClient: PublicClient, accountAddress: Address, ownerAddress: Address, signature: Hex): Promise<Hex>;
//# sourceMappingURL=eip6492.d.ts.map