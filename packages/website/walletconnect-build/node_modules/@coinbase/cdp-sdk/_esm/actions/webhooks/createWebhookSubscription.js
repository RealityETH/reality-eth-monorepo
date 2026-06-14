/**
 * Creates a webhook subscription for wallet transaction events.
 *
 * @param client - The CDP OpenAPI client.
 * @param options - The options for creating the webhook subscription.
 * @returns The created webhook subscription.
 *
 * @example
 * ```ts
 * const subscription = await createWebhookSubscription(client, {
 *   description: "Monitor wallet transactions",
 *   eventTypes: [
 *     "wallet.transaction.pending",
 *     "wallet.transaction.confirmed",
 *     "wallet.transaction.failed",
 *   ],
 *   targetUrl: "https://example.com/webhook",
 *   isEnabled: true,
 * });
 * ```
 */
export async function createWebhookSubscription(client, options) {
    const response = await client.createWebhookSubscription({
        description: options.description,
        eventTypes: options.eventTypes,
        target: {
            url: options.targetUrl,
            headers: options.targetHeaders,
        },
        isEnabled: options.isEnabled ?? true,
        metadata: options.metadata,
    });
    return {
        subscriptionId: response.subscriptionId,
        description: response.description,
        eventTypes: response.eventTypes,
        targetUrl: response.target.url,
        targetHeaders: response.target.headers,
        isEnabled: response.isEnabled,
        secret: response.secret,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
    };
}
//# sourceMappingURL=createWebhookSubscription.js.map