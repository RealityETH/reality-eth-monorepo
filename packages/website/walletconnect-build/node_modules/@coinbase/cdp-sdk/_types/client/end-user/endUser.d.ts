import { type ValidateAccessTokenOptions, type ListEndUsersOptions, type CreateEndUserOptions, type GetEndUserOptions, type ImportEndUserOptions, type AddEndUserEvmAccountOptions, type AddEndUserEvmAccountResult, type AddEndUserEvmSmartAccountOptions, type AddEndUserEvmSmartAccountResult, type AddEndUserSolanaAccountOptions, type AddEndUserSolanaAccountResult, type GetDelegationForEndUserOptions, type GetDelegationForEndUserResult, type RevokeDelegationForEndUserOptions, type GetDelegationForEndUserAccountOptions, type GetDelegationForEndUserAccountResult, type RevokeDelegationForEndUserAccountOptions, type SignEvmTransactionOptions, type SignEvmTransactionResult, type SignEvmMessageOptions, type SignEvmMessageResult, type SignEvmTypedDataOptions, type SignEvmTypedDataResult, type SendEvmTransactionOptions, type SendEvmTransactionResult, type SendEvmAssetOptions, type SendEvmAssetResult, type SendUserOperationOptions, type SendUserOperationResult, type CreateEvmEip7702DelegationOptions, type CreateEvmEip7702DelegationForEndUserResult, type SignSolanaMessageOptions, type SignSolanaMessageResult, type SignSolanaTransactionOptions, type SignSolanaTransactionResult, type SendSolanaTransactionOptions, type SendSolanaTransactionResult, type SendSolanaAssetOptions, type SendSolanaAssetResult, type EndUserAccount } from "./endUser.types.js";
import { type ListEndUsers200 } from "../../openapi-client/index.js";
/**
 * The CDP end user client.
 */
export declare class EndUserClient {
    /**
     * Creates an end user. An end user is an entity that can own CDP EVM accounts,
     * EVM smart accounts, and/or Solana accounts.
     *
     * @param options - The options for creating an end user.
     *
     * @returns A promise that resolves to the created end user.
     *
     * @example **Create an end user with an email authentication method**
     *          ```ts
     *          const endUser = await cdp.endUser.createEndUser({
     *            authenticationMethods: [
     *              { type: "email", email: "user@example.com" }
     *            ]
     *          });
     *          console.log(endUser.userId);
     *          ```
     *
     * @example **Create an end user with an EVM EOA account**
     *          ```ts
     *          const endUser = await cdp.endUser.createEndUser({
     *            authenticationMethods: [
     *              { type: "email", email: "user@example.com" }
     *            ],
     *            evmAccount: { createSmartAccount: false }
     *          });
     *          ```
     */
    createEndUser(options: CreateEndUserOptions): Promise<EndUserAccount>;
    /**
     * Lists end users belonging to the developer's CDP Project.
     * By default, the response is sorted by creation date in ascending order and paginated to 20 users per page.
     *
     * @param options - The options for listing end users.
     *
     * @returns A promise that resolves to a paginated list of end users.
     *
     * @example **List all end users**
     *          ```ts
     *          const result = await cdp.endUsers.listEndUsers();
     *          console.log(result.endUsers);
     *          ```
     *
     * @example **With pagination**
     *          ```ts
     *          let page = await cdp.endUsers.listEndUsers({ pageSize: 10 });
     *
     *          while (page.nextPageToken) {
     *            page = await cdp.endUsers.listEndUsers({
     *              pageSize: 10,
     *              pageToken: page.nextPageToken
     *            });
     *          }
     *          ```
     *
     * @example **With sorting**
     *          ```ts
     *          const result = await cdp.endUsers.listEndUsers({
     *            sort: ['createdAt=desc']
     *          });
     *          ```
     */
    listEndUsers(options?: ListEndUsersOptions): Promise<ListEndUsers200>;
    /**
     * Gets an end user by their unique identifier.
     *
     * @param options - The options for getting an end user.
     *
     * @returns A promise that resolves to the end user.
     *
     * @example **Get an end user by ID**
     *          ```ts
     *          const endUser = await cdp.endUser.getEndUser({
     *            userId: "user-123"
     *          });
     *          console.log(endUser.userId);
     *          ```
     */
    getEndUser(options: GetEndUserOptions): Promise<EndUserAccount>;
    /**
     * Adds an EVM EOA (Externally Owned Account) to an existing end user. End users can have up to 10 EVM accounts.
     *
     * @param options - The options for adding an EVM account.
     *
     * @returns A promise that resolves to the newly created EVM EOA account.
     *
     * @example **Add an EVM EOA account to an existing end user**
     *          ```ts
     *          const result = await cdp.endUser.addEndUserEvmAccount({
     *            userId: "user-123"
     *          });
     *          console.log(result.evmAccount.address);
     *          ```
     */
    addEndUserEvmAccount(options: AddEndUserEvmAccountOptions): Promise<AddEndUserEvmAccountResult>;
    /**
     * Adds an EVM smart account to an existing end user. This also creates a new EVM EOA account to serve as the owner of the smart account.
     *
     * @param options - The options for adding an EVM smart account.
     *
     * @returns A promise that resolves to the newly created EVM smart account.
     *
     * @example **Add an EVM smart account to an existing end user**
     *          ```ts
     *          const result = await cdp.endUser.addEndUserEvmSmartAccount({
     *            userId: "user-123",
     *            enableSpendPermissions: false
     *          });
     *          console.log(result.evmSmartAccount.address);
     *          ```
     *
     * @example **Add an EVM smart account with spend permissions enabled**
     *          ```ts
     *          const result = await cdp.endUser.addEndUserEvmSmartAccount({
     *            userId: "user-123",
     *            enableSpendPermissions: true
     *          });
     *          console.log(result.evmSmartAccount.address);
     *          ```
     */
    addEndUserEvmSmartAccount(options: AddEndUserEvmSmartAccountOptions): Promise<AddEndUserEvmSmartAccountResult>;
    /**
     * Adds a Solana account to an existing end user. End users can have up to 10 Solana accounts.
     *
     * @param options - The options for adding a Solana account.
     *
     * @returns A promise that resolves to the newly created Solana account.
     *
     * @example **Add a Solana account to an existing end user**
     *          ```ts
     *          const result = await cdp.endUser.addEndUserSolanaAccount({
     *            userId: "user-123"
     *          });
     *          console.log(result.solanaAccount.address);
     *          ```
     */
    addEndUserSolanaAccount(options: AddEndUserSolanaAccountOptions): Promise<AddEndUserSolanaAccountResult>;
    /**
     * Gets the active delegation for the specified end user, if one exists.
     * This operation can be performed by the end user themselves or by a developer using their API key.
     *
     * @param options - The options for getting the delegation.
     *
     * @returns A promise that resolves to the delegation details including its expiry.
     *
     * @example **Get the active delegation for an end user**
     *          ```ts
     *          const delegation = await cdp.endUser.getDelegationForEndUser({
     *            userId: "user-123"
     *          });
     *          console.log(delegation.expiresAt);
     *          ```
     */
    getDelegationForEndUser(options: GetDelegationForEndUserOptions): Promise<GetDelegationForEndUserResult>;
    /**
     * Revokes all active delegations for the specified end user.
     * This operation can be performed by the end user themselves or by a developer using their API key.
     *
     * @param options - The options for revoking the delegation.
     *
     * @returns A promise that resolves when the delegation has been revoked.
     *
     * @example **Revoke all delegations for an end user**
     *          ```ts
     *          await cdp.endUser.revokeDelegationForEndUser({
     *            userId: "user-123"
     *          });
     *          ```
     */
    revokeDelegationForEndUser(options: RevokeDelegationForEndUserOptions): Promise<void>;
    /**
     * Gets the active account-scoped delegation for the specified end user account address, if one exists.
     *
     * @param options - The options for getting the account-scoped delegation.
     *
     * @returns A promise that resolves to the delegation details including its expiry.
     *
     * @example **Get the account-scoped delegation for an address**
     *          ```ts
     *          const delegation = await cdp.endUser.getDelegationForEndUserAccount({
     *            userId: "user-123",
     *            address: "0x1234...",
     *          });
     *          console.log(delegation.expiresAt);
     *          ```
     */
    getDelegationForEndUserAccount(options: GetDelegationForEndUserAccountOptions): Promise<GetDelegationForEndUserAccountResult>;
    /**
     * Revokes the active account-scoped delegation for the specified end user account address.
     * Other account-scoped delegations for the same user are unaffected.
     *
     * @param options - The options for revoking the account-scoped delegation.
     *
     * @returns A promise that resolves when the delegation has been revoked.
     *
     * @example **Revoke the account-scoped delegation for an address**
     *          ```ts
     *          await cdp.endUser.revokeDelegationForEndUserAccount({
     *            userId: "user-123",
     *            address: "0x1234...",
     *          });
     *          ```
     */
    revokeDelegationForEndUserAccount(options: RevokeDelegationForEndUserAccountOptions): Promise<void>;
    /**
     * Signs an EVM transaction on behalf of an end user using a delegation.
     *
     * @param options - The options for signing an EVM transaction.
     *
     * @returns A promise that resolves to the signed transaction.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.signEvmTransaction({
     *   userId: "user-123",
     *   address: "0x1234...",
     *   transaction: "0x02..."
     * });
     * console.log(result.signedTransaction);
     * ```
     */
    signEvmTransaction(options: SignEvmTransactionOptions): Promise<SignEvmTransactionResult>;
    /**
     * Signs an EVM message (EIP-191) on behalf of an end user using a delegation.
     *
     * @param options - The options for signing an EVM message.
     *
     * @returns A promise that resolves to the signature.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.signEvmMessage({
     *   userId: "user-123",
     *   address: "0x1234...",
     *   message: "Hello, World!"
     * });
     * console.log(result.signature);
     * ```
     */
    signEvmMessage(options: SignEvmMessageOptions): Promise<SignEvmMessageResult>;
    /**
     * Signs EVM EIP-712 typed data on behalf of an end user using a delegation.
     *
     * @param options - The options for signing EVM typed data.
     *
     * @returns A promise that resolves to the signature.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.signEvmTypedData({
     *   userId: "user-123",
     *   address: "0x1234...",
     *   typedData: { domain: {}, types: {}, primaryType: "...", message: {} }
     * });
     * console.log(result.signature);
     * ```
     */
    signEvmTypedData(options: SignEvmTypedDataOptions): Promise<SignEvmTypedDataResult>;
    /**
     * Sends an EVM transaction on behalf of an end user using a delegation.
     *
     * @param options - The options for sending an EVM transaction.
     *
     * @returns A promise that resolves to the transaction hash.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.sendEvmTransaction({
     *   userId: "user-123",
     *   address: "0x1234...",
     *   transaction: "0x02...",
     *   network: "base-sepolia"
     * });
     * console.log(result.transactionHash);
     * ```
     */
    sendEvmTransaction(options: SendEvmTransactionOptions): Promise<SendEvmTransactionResult>;
    /**
     * Sends an EVM asset (e.g. USDC) on behalf of an end user using a delegation.
     *
     * @param options - The options for sending an EVM asset.
     *
     * @returns A promise that resolves to the transaction result.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.sendEvmAsset({
     *   userId: "user-123",
     *   address: "0x1234...",
     *   to: "0xabcd...",
     *   amount: "1000000",
     *   network: "base-sepolia"
     * });
     * console.log(result.transactionHash);
     * ```
     */
    sendEvmAsset(options: SendEvmAssetOptions): Promise<SendEvmAssetResult>;
    /**
     * Sends a user operation on behalf of an end user using a delegation.
     *
     * @param options - The options for sending a user operation.
     *
     * @returns A promise that resolves to the user operation result.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.sendUserOperation({
     *   userId: "user-123",
     *   address: "0x1234...",
     *   network: "base-sepolia",
     *   calls: [{ to: "0xabcd...", value: "0", data: "0x" }],
     *   useCdpPaymaster: true
     * });
     * ```
     */
    sendUserOperation(options: SendUserOperationOptions): Promise<SendUserOperationResult>;
    /**
     * Creates an EVM EIP-7702 delegation on behalf of an end user.
     *
     * @param options - The options for creating an EIP-7702 delegation.
     *
     * @returns A promise that resolves to the delegation operation ID.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.createEvmEip7702Delegation({
     *   userId: "user-123",
     *   address: "0x1234...",
     *   network: "base-sepolia"
     * });
     * console.log(result.delegationOperationId);
     * ```
     */
    createEvmEip7702Delegation(options: CreateEvmEip7702DelegationOptions): Promise<CreateEvmEip7702DelegationForEndUserResult>;
    /**
     * Signs a Solana message on behalf of an end user using a delegation.
     *
     * @param options - The options for signing a Solana message.
     *
     * @returns A promise that resolves to the signature.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.signSolanaMessage({
     *   userId: "user-123",
     *   address: "So1ana...",
     *   message: "base64message..."
     * });
     * console.log(result.signature);
     * ```
     */
    signSolanaMessage(options: SignSolanaMessageOptions): Promise<SignSolanaMessageResult>;
    /**
     * Signs a Solana transaction on behalf of an end user using a delegation.
     *
     * @param options - The options for signing a Solana transaction.
     *
     * @returns A promise that resolves to the signed transaction.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.signSolanaTransaction({
     *   userId: "user-123",
     *   address: "So1ana...",
     *   transaction: "base64tx..."
     * });
     * console.log(result.signedTransaction);
     * ```
     */
    signSolanaTransaction(options: SignSolanaTransactionOptions): Promise<SignSolanaTransactionResult>;
    /**
     * Sends a Solana transaction on behalf of an end user using a delegation.
     *
     * @param options - The options for sending a Solana transaction.
     *
     * @returns A promise that resolves to the transaction signature.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.sendSolanaTransaction({
     *   userId: "user-123",
     *   address: "So1ana...",
     *   transaction: "base64tx...",
     *   network: "solana-devnet"
     * });
     * console.log(result.transactionSignature);
     * ```
     */
    sendSolanaTransaction(options: SendSolanaTransactionOptions): Promise<SendSolanaTransactionResult>;
    /**
     * Sends a Solana asset (e.g. USDC) on behalf of an end user using a delegation.
     *
     * @param options - The options for sending a Solana asset.
     *
     * @returns A promise that resolves to the transaction signature.
     *
     * @example
     * ```ts
     * const result = await cdp.endUser.sendSolanaAsset({
     *   userId: "user-123",
     *   address: "So1ana...",
     *   to: "Recipi...",
     *   amount: "1000000",
     *   network: "solana-devnet"
     * });
     * console.log(result.transactionSignature);
     * ```
     */
    sendSolanaAsset(options: SendSolanaAssetOptions): Promise<SendSolanaAssetResult>;
    /**
     * Validates an end user's access token. Throws an error if the access token is invalid.
     *
     * @param options - The options for validating an access token.
     *
     * @returns The end user object if the access token is valid.
     */
    validateAccessToken(options: ValidateAccessTokenOptions): Promise<EndUserAccount>;
    /**
     * Imports an existing private key for an end user.
     *
     * @param options - The options for importing an end user.
     *
     * @returns A promise that resolves to the imported end user.
     *
     * @example **Import an end user with an EVM private key**
     *          ```ts
     *          const endUser = await cdp.endUser.importEndUser({
     *            authenticationMethods: [
     *              { type: "sms", phoneNumber: "+12055555555" }
     *            ],
     *            privateKey: "0x...",
     *            keyType: "evm"
     *          });
     *          ```
     *
     * @example **Import an end user with a Solana private key (base58)**
     *          ```ts
     *          const endUser = await cdp.endUser.importEndUser({
     *            authenticationMethods: [
     *              { type: "sms", phoneNumber: "+12055555555" }
     *            ],
     *            privateKey: "3Kzj...",
     *            keyType: "solana"
     *          });
     *          ```
     */
    importEndUser(options: ImportEndUserOptions): Promise<EndUserAccount>;
}
//# sourceMappingURL=endUser.d.ts.map