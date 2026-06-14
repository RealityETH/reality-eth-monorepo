import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { W3mEmailSuffixesWidget } from '../../src/partials/w3m-email-suffixes-widget/index.js';
import { HelpersUtil } from '../utils/HelpersUtil';
describe('W3mEmailSuffixesWidget', () => {
    let element;
    beforeEach(() => {
        vi.restoreAllMocks();
        if (!customElements.get('w3m-email-suffixes-widget')) {
            customElements.define('w3m-email-suffixes-widget', W3mEmailSuffixesWidget);
        }
        document.body.innerHTML = '';
    });
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });
    const createWidget = async (email = '') => {
        const widget = document.createElement('w3m-email-suffixes-widget');
        widget.email = email;
        document.body.appendChild(widget);
        await new Promise(resolve => setTimeout(resolve, 0));
        await widget.updateComplete;
        return widget;
    };
    describe('Rendering', () => {
        it('should render nothing when email is empty', async () => {
            element = await createWidget('');
            const container = HelpersUtil.querySelect(element, '.email-sufixes');
            expect(container).toBeNull();
        });
        it('should render all suggestions when email has no @ symbol', async () => {
            element = await createWidget('test');
            const container = HelpersUtil.querySelect(element, '.email-sufixes');
            expect(container).toBeTruthy();
            const buttons = HelpersUtil.querySelectAll(element, 'wui-button');
            expect(buttons).toHaveLength(7);
        });
        it('should render suffix suggestions when email has incomplete domain', async () => {
            element = await createWidget('test@g');
            const container = HelpersUtil.querySelect(element, '.email-sufixes');
            expect(container).toBeTruthy();
            const buttons = HelpersUtil.querySelectAll(element, 'wui-button');
            expect(buttons.length).toBeGreaterThan(0);
            const gmailButton = Array.from(buttons).find((btn) => btn.textContent?.includes('@gmail.com'));
            expect(gmailButton).toBeTruthy();
        });
        it('should filter suggestions based on partial domain match', async () => {
            element = await createWidget('test@out');
            const buttons = HelpersUtil.querySelectAll(element, 'wui-button');
            const outlookButton = Array.from(buttons).find((btn) => btn.textContent?.includes('@outlook.com'));
            expect(outlookButton).toBeTruthy();
            const gmailButton = Array.from(buttons).find((btn) => btn.textContent?.includes('@gmail.com'));
            expect(gmailButton).toBeFalsy();
        });
        it('should not render already complete domain', async () => {
            element = await createWidget('test@gmail.com');
            const container = HelpersUtil.querySelect(element, '.email-sufixes');
            expect(container).toBeNull();
        });
    });
    describe('Event Handling', () => {
        it('should dispatch change event when suggestion is clicked', async () => {
            element = await createWidget('test@g');
            const eventSpy = vi.fn();
            element.addEventListener('change', eventSpy);
            const buttons = HelpersUtil.querySelectAll(element, 'wui-button');
            const gmailButton = Array.from(buttons).find((btn) => btn.textContent?.includes('@gmail.com'));
            expect(gmailButton).toBeTruthy();
            gmailButton?.click();
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                detail: 'test@gmail.com',
                bubbles: true,
                composed: true
            }));
        });
        it('should replace partial domain with complete domain', async () => {
            element = await createWidget('test@out');
            const eventSpy = vi.fn();
            element.addEventListener('change', eventSpy);
            const buttons = HelpersUtil.querySelectAll(element, 'wui-button');
            const outlookButton = Array.from(buttons).find((btn) => btn.textContent?.includes('@outlook.com'));
            outlookButton?.click();
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                detail: 'test@outlook.com'
            }));
        });
        it('should handle emails with multiple @ symbols correctly', async () => {
            element = await createWidget('test@domain@g');
            const eventSpy = vi.fn();
            element.addEventListener('change', eventSpy);
            const buttons = HelpersUtil.querySelectAll(element, 'wui-button');
            const gmailButton = Array.from(buttons).find((btn) => btn.textContent?.includes('@gmail.com'));
            gmailButton?.click();
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                detail: 'test@gmail.com'
            }));
        });
    });
    describe('Filtering Logic', () => {
        it('should show all suggestions when email has just @', async () => {
            element = await createWidget('test@');
            const buttons = HelpersUtil.querySelectAll(element, 'wui-button');
            expect(buttons.length).toBe(7);
            const expectedSuffixes = [
                '@gmail.com',
                '@outlook.com',
                '@yahoo.com',
                '@hotmail.com',
                '@aol.com',
                '@icloud.com',
                '@zoho.com'
            ];
            expectedSuffixes.forEach(suffix => {
                const button = Array.from(buttons).find((btn) => btn.textContent?.includes(suffix));
                expect(button).toBeTruthy();
            });
        });
        it('should filter case-sensitively', async () => {
            element = await createWidget('test@G');
            const buttons = HelpersUtil.querySelectAll(element, 'wui-button');
            const gmailButton = Array.from(buttons).find((btn) => btn.textContent?.includes('@gmail.com'));
            expect(gmailButton).toBeFalsy();
        });
    });
});
//# sourceMappingURL=w3m-email-suffixes-widget.test.js.map