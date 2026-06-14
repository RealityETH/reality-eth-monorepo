import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SafeLocalStorage, SafeLocalStorageKeys } from '@reown/appkit-common';
import { ChainController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
import { ReownAuthentication } from '@reown/appkit-controllers/features';
import { W3mDataCaptureView } from '../../src/views/w3m-data-capture-view/index.js';
import { HelpersUtil } from '../utils/HelpersUtil';
vi.mock('@reown/appkit-controllers', () => ({
    ChainController: {
        getActiveCaipAddress: vi.fn(),
        getAccountData: vi.fn()
    },
    OptionsController: {
        state: {
            metadata: { name: 'Test App' },
            siwx: null,
            remoteFeatures: { emailCapture: false }
        }
    },
    RouterController: {
        state: { data: null },
        replace: vi.fn()
    },
    SnackController: {
        showError: vi.fn()
    }
}));
vi.mock('@reown/appkit-common', () => ({
    SafeLocalStorage: {
        getItem: vi.fn(),
        setItem: vi.fn()
    },
    SafeLocalStorageKeys: {
        RECENT_EMAILS: '@appkit/recent_emails'
    },
    ConstantsUtil: {
        FOUR_MINUTES_MS: 4 * 60 * 1000,
        CHAIN: {
            EVM: 'eip155'
        },
        EIP155: 'eip155',
        CONNECTOR_ID: {
            COINBASE: 'coinbaseWallet',
            COINBASE_SDK: 'coinbaseWalletSDK'
        }
    }
}));
describe('W3mDataCaptureView', () => {
    let element;
    let mockSiwx;
    beforeEach(() => {
        vi.restoreAllMocks();
        mockSiwx = new ReownAuthentication();
        document.body.innerHTML = '';
        vi.spyOn(ChainController, 'getAccountData').mockImplementation(() => {
            return {
                address: '0x1234567890abcdef1234567890abcdef12345678'
            };
        });
        vi.spyOn(ChainController, 'getActiveCaipAddress').mockReturnValue('eip155:1:0x1234567890abcdef1234567890abcdef12345678');
        vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('');
        vi.spyOn(SafeLocalStorage, 'setItem').mockReturnValue();
        OptionsController.state.siwx = mockSiwx;
        OptionsController.state.metadata = {
            name: 'Test App',
            description: 'Test Description',
            url: 'https://test.com',
            icons: []
        };
        OptionsController.state.remoteFeatures = { emailCapture: false };
        if (!customElements.get('w3m-data-capture-view')) {
            customElements.define('w3m-data-capture-view', W3mDataCaptureView);
        }
        RouterController.state.data = undefined;
    });
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });
    const createView = async () => {
        const view = document.createElement('w3m-data-capture-view');
        document.body.appendChild(view);
        await new Promise(resolve => setTimeout(resolve, 0));
        await view.updateComplete;
        return view;
    };
    describe('Initialization', () => {
        it('should throw error if ReownAuthentication is not initialized', async () => {
            OptionsController.state.siwx = undefined;
            await createView();
            expect(SnackController.showError).toHaveBeenCalledWith('ReownAuthentication is not initialized. Please contact support.');
        });
        it('should initialize with correct default values', async () => {
            element = await createView();
            expect(element).toBeTruthy();
            const hero = HelpersUtil.querySelect(element, '.hero');
            expect(hero).toBeTruthy();
        });
        it('should initialize with email from router data', async () => {
            RouterController.state.data = { email: 'test@example.com' };
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            expect(emailInput?.value).toBe('test@example.com');
        });
        it('should initialize with email from user account', async () => {
            vi.spyOn(ChainController, 'getAccountData').mockImplementation(() => {
                return {
                    address: '0x1234567890abcdef1234567890abcdef12345678',
                    user: { email: 'user@test.com' }
                };
            });
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            expect(emailInput?.value).toBe('user@test.com');
        });
        it('should auto-submit if email is pre-filled', async () => {
            RouterController.state.data = { email: 'auto@example.com' };
            mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: null });
            element = await createView();
            expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
                email: 'auto@example.com',
                account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
            });
        });
    });
    describe('Email Validation', () => {
        it('should show error for invalid email format', async () => {
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'invalid-email' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            expect(SnackController.showError).toHaveBeenCalledWith('Please provide a valid email.');
        });
        it('should accept valid email format', async () => {
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            expect(SnackController.showError).not.toHaveBeenCalledWith('Please provide a valid email.');
        });
    });
    describe('Form Submission', () => {
        it('should show error and abort when siwx is not an instance of ReownAuthentication on submit', async () => {
            OptionsController.state.siwx = {};
            const view = await createView();
            const emailInput = HelpersUtil.querySelect(view, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await view.updateComplete;
            const spy = vi.spyOn(ReownAuthentication.prototype, 'requestEmailOtp');
            const submitButton = HelpersUtil.querySelect(view, 'wui-button[type="submit"]');
            submitButton?.click();
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(SnackController.showError).toHaveBeenCalledWith('ReownAuthentication is not initialized. Please contact support.');
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
        it('should handle successful OTP request with UUID', async () => {
            mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' });
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
                email: 'test@example.com',
                account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
            });
            expect(RouterController.replace).toHaveBeenCalledWith('DataCaptureOtpConfirm', {
                email: 'test@example.com'
            });
        });
        it('should handle successful OTP request without UUID', async () => {
            mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: null });
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(RouterController.replace).toHaveBeenCalledWith('SIWXSignMessage');
        });
        it('should handle OTP request failure', async () => {
            mockSiwx.requestEmailOtp = vi.fn().mockRejectedValue(new Error('Network error'));
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(SnackController.showError).toHaveBeenCalledWith('Failed to send email OTP');
        });
        it('should show error when account is not connected', async () => {
            vi.spyOn(ChainController, 'getActiveCaipAddress').mockReturnValue(undefined);
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            expect(submitButton?.disabled).toBe(false);
        });
    });
    describe('Recent Emails', () => {
        it('should load recent emails from storage', async () => {
            vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('email1@test.com,email2@test.com,email3@test.com');
            element = await createView();
            element.requestUpdate();
            await element.updateComplete;
            const recentEmailsWidget = HelpersUtil.querySelect(element, 'w3m-recent-emails-widget');
            expect(recentEmailsWidget).toBeTruthy();
            expect(recentEmailsWidget?.emails).toEqual([
                'email1@test.com',
                'email2@test.com',
                'email3@test.com'
            ]);
        });
        it('should handle email selection from recent emails', async () => {
            vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('recent@test.com');
            mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' });
            element = await createView();
            element.recentEmails = element.getRecentEmails();
            element.requestUpdate();
            await element.updateComplete;
            const recentEmailsWidget = HelpersUtil.querySelect(element, 'w3m-recent-emails-widget');
            expect(recentEmailsWidget).toBeTruthy();
            recentEmailsWidget?.dispatchEvent(new CustomEvent('select', {
                detail: 'recent@test.com'
            }));
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(mockSiwx.requestEmailOtp).toHaveBeenCalledWith({
                email: 'recent@test.com',
                account: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678'
            });
        });
        it('should filter invalid emails from recent emails', async () => {
            vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('valid@test.com,invalid-email,another@test.com');
            element = await createView();
            element.recentEmails = element.getRecentEmails();
            element.requestUpdate();
            await element.updateComplete;
            const recentEmailsWidget = HelpersUtil.querySelect(element, 'w3m-recent-emails-widget');
            expect(recentEmailsWidget).toBeTruthy();
            expect(recentEmailsWidget?.emails).toEqual(['valid@test.com', 'another@test.com']);
        });
        it('should limit recent emails to 3 items', async () => {
            vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('email1@test.com,email2@test.com,email3@test.com,email4@test.com,email5@test.com');
            element = await createView();
            element.recentEmails = element.getRecentEmails();
            element.requestUpdate();
            await element.updateComplete;
            const recentEmailsWidget = HelpersUtil.querySelect(element, 'w3m-recent-emails-widget');
            expect(recentEmailsWidget).toBeTruthy();
            expect(recentEmailsWidget?.emails).toEqual([
                'email1@test.com',
                'email2@test.com',
                'email3@test.com'
            ]);
        });
        it('should save email to recent emails on successful submission', async () => {
            mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' });
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'new@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(SafeLocalStorage.setItem).toHaveBeenCalledWith(SafeLocalStorageKeys.RECENT_EMAILS, expect.stringContaining('new@example.com'));
        });
    });
    describe('Email Suffixes Widget', () => {
        it('should render email suffixes widget', async () => {
            element = await createView();
            const suffixesWidget = HelpersUtil.querySelect(element, 'w3m-email-suffixes-widget');
            expect(suffixesWidget).toBeTruthy();
        });
        it('should handle email change from suffixes widget', async () => {
            element = await createView();
            const suffixesWidget = HelpersUtil.querySelect(element, 'w3m-email-suffixes-widget');
            suffixesWidget?.dispatchEvent(new CustomEvent('change', {
                detail: 'test@gmail.com'
            }));
            await element.updateComplete;
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            expect(emailInput?.value).toBe('test@gmail.com');
        });
    });
    describe('Loading States', () => {
        it('should show loading state during form submission', async () => {
            mockSiwx.requestEmailOtp = vi
                .fn()
                .mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 100)));
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            await new Promise(resolve => setTimeout(resolve, 10));
            await element.updateComplete;
            const hero = HelpersUtil.querySelect(element, '.hero');
            expect(hero?.getAttribute('data-state')).toBe('loading');
            await new Promise(resolve => setTimeout(resolve, 450));
            expect(hero?.getAttribute('data-state')).toBe('default');
        });
        it('should hide email input during loading', async () => {
            mockSiwx.requestEmailOtp = vi
                .fn()
                .mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 100)));
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            await new Promise(resolve => setTimeout(resolve, 10));
            await element.updateComplete;
            const emailInputDuringLoading = HelpersUtil.querySelect(element, 'wui-email-input');
            expect(emailInputDuringLoading).toBeNull();
            await new Promise(resolve => setTimeout(resolve, 450));
            const emailInputAfterLoading = HelpersUtil.querySelect(element, 'wui-email-input');
            expect(emailInputAfterLoading).toBeTruthy();
        });
        it('should hide recent emails widget during loading', async () => {
            vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('test@example.com,user@domain.com,admin@company.org');
            mockSiwx.requestEmailOtp = vi
                .fn()
                .mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 100)));
            element = await createView();
            element.recentEmails = element.getRecentEmails();
            element.requestUpdate();
            await element.updateComplete;
            const recentEmailsWidgetInitial = HelpersUtil.querySelect(element, 'w3m-recent-emails-widget');
            expect(recentEmailsWidgetInitial).toBeTruthy();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const submitButton = HelpersUtil.querySelect(element, 'wui-button[type="submit"]');
            submitButton?.click();
            await new Promise(resolve => setTimeout(resolve, 10));
            await element.updateComplete;
            const recentEmailsWidgetDuringLoading = HelpersUtil.querySelect(element, 'w3m-recent-emails-widget');
            expect(recentEmailsWidgetDuringLoading).toBeNull();
            await new Promise(resolve => setTimeout(resolve, 450));
            const recentEmailsWidgetAfterLoading = HelpersUtil.querySelect(element, 'w3m-recent-emails-widget');
            expect(recentEmailsWidgetAfterLoading).toBeTruthy();
        });
    });
    describe('Required Field Handling', () => {
        it('should handle required email capture feature', async () => {
            OptionsController.state.remoteFeatures = { emailCapture: ['required'] };
            element = await createView();
        });
        it('should handle optional email capture feature', async () => {
            OptionsController.state.remoteFeatures = { emailCapture: ['optional'] };
            element = await createView();
        });
    });
    describe('Keyboard Navigation', () => {
        it('should submit form on Enter key press', async () => {
            mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' });
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            emailInput?.dispatchEvent(keyEvent);
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(mockSiwx.requestEmailOtp).toHaveBeenCalled();
        });
        it('should not submit form on other key presses', async () => {
            mockSiwx.requestEmailOtp = vi.fn().mockResolvedValue({ uuid: 'test-uuid' });
            element = await createView();
            const emailInput = HelpersUtil.querySelect(element, 'wui-email-input');
            emailInput?.dispatchEvent(new CustomEvent('inputChange', { detail: 'test@example.com' }));
            await element.updateComplete;
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            emailInput?.dispatchEvent(tabEvent);
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(mockSiwx.requestEmailOtp).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=w3m-data-capture-view.test.js.map