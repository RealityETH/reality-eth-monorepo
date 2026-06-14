//
import { ConstantsUtil, SafeLocalStorage, SafeLocalStorageKeys } from '@reown/appkit-common';
import { ApiController } from '../../../controllers/ApiController.js';
import { BlockchainApiController } from '../../../controllers/BlockchainApiController.js';
import { ChainController } from '../../../controllers/ChainController.js';
import { getActiveCaipNetwork } from '../../../utils/ChainControllerUtil.js';
import { ReownAuthenticationMessenger } from './ReownAuthenticationMessenger.js';
/**
 * This is the configuration for using SIWX with Reown Authentication service.
 * It allows you to authenticate and capture user sessions through the Cloud Dashboard.
 */
export class ReownAuthentication {
    constructor(params = {}) {
        this.otpUuid = null;
        this.listeners = {
            sessionChanged: []
        };
        this.localAuthStorageKey =
            params.localAuthStorageKey ||
                SafeLocalStorageKeys.SIWX_AUTH_TOKEN;
        this.localNonceStorageKey =
            params.localNonceStorageKey ||
                SafeLocalStorageKeys.SIWX_NONCE_TOKEN;
        this.required = params.required ?? true;
        this.messenger = new ReownAuthenticationMessenger({
            getNonce: this.getNonce.bind(this)
        });
    }
    async createMessage(input) {
        return this.messenger.createMessage(input);
    }
    async addSession(session) {
        const response = await this.request({
            method: 'POST',
            key: 'authenticate',
            body: {
                data: session.data,
                message: session.message,
                signature: session.signature,
                clientId: this.getClientId(),
                walletInfo: this.getWalletInfo()
            },
            headers: ['nonce', 'otp']
        });
        this.setStorageToken(response.token, this.localAuthStorageKey);
        this.emit('sessionChanged', session);
        this.setAppKitAccountUser(jwtDecode(response.token));
        this.otpUuid = null;
    }
    async getSessions(chainId, address) {
        try {
            if (!this.getStorageToken(this.localAuthStorageKey)) {
                return [];
            }
            const account = await this.request({
                method: 'GET',
                key: 'me',
                query: {},
                headers: ['auth']
            });
            if (!account) {
                return [];
            }
            const isSameAddress = account.address.toLowerCase() === address.toLowerCase();
            const isSameNetwork = account.caip2Network === chainId;
            if (!isSameAddress || !isSameNetwork) {
                return [];
            }
            const session = {
                data: {
                    accountAddress: account.address,
                    chainId: account.caip2Network
                },
                message: '',
                signature: ''
            };
            this.emit('sessionChanged', session);
            this.setAppKitAccountUser(account);
            return [session];
        }
        catch {
            return [];
        }
    }
    async revokeSession(_chainId, _address) {
        return Promise.resolve(this.clearStorageTokens());
    }
    async setSessions(sessions) {
        if (sessions.length === 0) {
            this.clearStorageTokens();
        }
        else {
            const session = (sessions.find(s => s.data.chainId === getActiveCaipNetwork()?.caipNetworkId) || sessions[0]);
            await this.addSession(session);
        }
    }
    getRequired() {
        return this.required;
    }
    async getSessionAccount() {
        if (!this.getStorageToken(this.localAuthStorageKey)) {
            throw new Error('Not authenticated');
        }
        return this.request({
            method: 'GET',
            key: 'me',
            body: undefined,
            query: {
                includeAppKitAccount: true
            },
            headers: ['auth']
        });
    }
    async setSessionAccountMetadata(metadata = null) {
        if (!this.getStorageToken(this.localAuthStorageKey)) {
            throw new Error('Not authenticated');
        }
        return this.request({
            method: 'PUT',
            key: 'account-metadata',
            body: { metadata },
            headers: ['auth']
        });
    }
    on(event, callback) {
        this.listeners[event].push(callback);
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }
    removeAllListeners() {
        const keys = Object.keys(this.listeners);
        keys.forEach(key => {
            this.listeners[key] = [];
        });
    }
    async requestEmailOtp({ email, account }) {
        const otp = await this.request({
            method: 'POST',
            key: 'otp',
            body: { email, account }
        });
        this.otpUuid = otp.uuid;
        this.messenger.resources = [`email:${email}`];
        return otp;
    }
    confirmEmailOtp({ code }) {
        return this.request({
            method: 'PUT',
            key: 'otp',
            body: { code },
            headers: ['otp']
        });
    }
    async request({ method, key, query, body, headers }) {
        const { projectId, st, sv } = this.getSDKProperties();
        const url = new URL(`${ConstantsUtil.W3M_API_URL}/auth/v1/${String(key)}`);
        url.searchParams.set('projectId', projectId);
        url.searchParams.set('st', st);
        url.searchParams.set('sv', sv);
        if (query) {
            Object.entries(query).forEach(([queryKey, queryValue]) => url.searchParams.set(queryKey, String(queryValue)));
        }
        const response = await fetch(url, {
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: Array.isArray(headers)
                ? headers.reduce((acc, header) => {
                    switch (header) {
                        case 'nonce':
                            acc['x-nonce-jwt'] = `Bearer ${this.getStorageToken(this.localNonceStorageKey)}`;
                            break;
                        case 'auth':
                            acc['Authorization'] = `Bearer ${this.getStorageToken(this.localAuthStorageKey)}`;
                            break;
                        case 'otp':
                            if (this.otpUuid) {
                                acc['x-otp'] = this.otpUuid;
                            }
                            break;
                        default:
                            break;
                    }
                    return acc;
                }, {})
                : undefined
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json();
        }
        return null;
    }
    getStorageToken(key) {
        return SafeLocalStorage.getItem(key);
    }
    setStorageToken(token, key) {
        SafeLocalStorage.setItem(key, token);
    }
    clearStorageTokens() {
        this.otpUuid = null;
        SafeLocalStorage.removeItem(this.localAuthStorageKey);
        SafeLocalStorage.removeItem(this.localNonceStorageKey);
        this.emit('sessionChanged', undefined);
    }
    async getNonce() {
        const { nonce, token } = await this.request({
            method: 'GET',
            key: 'nonce'
        });
        this.setStorageToken(token, this.localNonceStorageKey);
        return nonce;
    }
    getClientId() {
        return BlockchainApiController.state.clientId;
    }
    getWalletInfo() {
        const walletInfo = ChainController.getAccountData()?.connectedWalletInfo;
        if (!walletInfo) {
            return undefined;
        }
        if ('social' in walletInfo && 'identifier' in walletInfo) {
            const social = walletInfo['social'];
            const identifier = walletInfo['identifier'];
            return { type: 'social', social, identifier };
        }
        const { name, icon } = walletInfo;
        let type = 'unknown';
        switch (walletInfo.type) {
            case 'EXTERNAL':
            case 'INJECTED':
            case 'ANNOUNCED':
                type = 'extension';
                break;
            case 'WALLET_CONNECT':
                type = 'walletconnect';
                break;
            default:
                type = 'unknown';
        }
        return {
            type,
            name,
            icon
        };
    }
    getSDKProperties() {
        return ApiController._getSdkProperties();
    }
    emit(event, data) {
        this.listeners[event].forEach(listener => listener(data));
    }
    setAppKitAccountUser(session) {
        const { email } = session;
        if (email) {
            Object.values(ConstantsUtil.CHAIN).forEach(chainNamespace => {
                ChainController.setAccountProp('user', { email }, chainNamespace);
            });
        }
    }
}
/**
 * Decodes a JWT token and returns its payload
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
function jwtDecode(token) {
    // Split the token into parts
    const parts = token.split('.');
    // Check if the token has the correct format (header.payload.signature)
    if (parts.length !== 3) {
        throw new Error('Invalid token');
    }
    // Decode the payload (second part)
    const payload = parts[1];
    if (typeof payload !== 'string') {
        throw new Error('Invalid token');
    }
    // Convert base64url to base64
    const base64 = payload.replace(/-/gu, '+').replace(/_/gu, '/');
    // Add padding if needed
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    // Decode and parse the JSON
    const decoded = JSON.parse(atob(padded));
    return decoded;
}
//# sourceMappingURL=ReownAuthentication.js.map