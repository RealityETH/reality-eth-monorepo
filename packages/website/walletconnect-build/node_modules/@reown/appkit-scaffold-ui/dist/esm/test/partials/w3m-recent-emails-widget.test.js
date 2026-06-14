import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { W3mRecentEmailsWidget } from '../../src/partials/w3m-recent-emails-widget/index.js';
import { HelpersUtil } from '../utils/HelpersUtil';
describe('W3mRecentEmailsWidget', () => {
    let element;
    beforeEach(() => {
        vi.restoreAllMocks();
        if (!customElements.get('w3m-recent-emails-widget')) {
            customElements.define('w3m-recent-emails-widget', W3mRecentEmailsWidget);
        }
        document.body.innerHTML = '';
    });
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });
    const createWidget = async (emails = []) => {
        const widget = document.createElement('w3m-recent-emails-widget');
        widget.emails = emails;
        document.body.appendChild(widget);
        await new Promise(resolve => setTimeout(resolve, 0));
        await widget.updateComplete;
        return widget;
    };
    describe('Rendering', () => {
        it('should render nothing when emails array is empty', async () => {
            element = await createWidget([]);
            const container = HelpersUtil.querySelect(element, '.recent-emails');
            expect(container).toBeNull();
        });
        it('should render recent emails list when emails are provided', async () => {
            const emails = ['test@example.com', 'user@domain.com'];
            element = await createWidget(emails);
            const container = HelpersUtil.querySelect(element, '.recent-emails');
            expect(container).toBeTruthy();
            const heading = HelpersUtil.querySelect(element, '.recent-emails-heading');
            expect(heading).toBeTruthy();
            expect(heading?.textContent).toBe('Recently used emails');
            const listItems = HelpersUtil.querySelectAll(element, 'wui-list-item');
            expect(listItems.length).toBe(2);
        });
        it('should display correct email addresses in list items', async () => {
            const emails = ['john@example.com', 'jane@test.com', 'admin@company.org'];
            element = await createWidget(emails);
            const listItems = HelpersUtil.querySelectAll(element, 'wui-list-item');
            expect(listItems.length).toBe(3);
            emails.forEach((email, index) => {
                const listItem = listItems[index];
                if (listItem) {
                    expect(listItem.textContent?.trim()).toBe(email);
                }
            });
        });
        it('should set correct attributes on list items', async () => {
            const emails = ['test@example.com'];
            element = await createWidget(emails);
            const listItem = HelpersUtil.querySelect(element, 'wui-list-item');
            expect(listItem).toBeTruthy();
            expect(listItem?.getAttribute('icon')).toBe('mail');
            expect(listItem?.getAttribute('iconVariant')).toBe('overlay');
        });
    });
    describe('Event Handling', () => {
        it('should dispatch select event when list item is clicked', async () => {
            const emails = ['test@example.com', 'user@domain.com'];
            element = await createWidget(emails);
            const eventSpy = vi.fn();
            element.addEventListener('select', eventSpy);
            const listItems = HelpersUtil.querySelectAll(element, 'wui-list-item');
            const firstItem = listItems[0];
            expect(firstItem).toBeTruthy();
            firstItem?.click();
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                detail: 'test@example.com',
                bubbles: true,
                composed: true
            }));
        });
        it('should dispatch correct email when different items are clicked', async () => {
            const emails = ['first@example.com', 'second@example.com', 'third@example.com'];
            element = await createWidget(emails);
            const eventSpy = vi.fn();
            element.addEventListener('select', eventSpy);
            const listItems = HelpersUtil.querySelectAll(element, 'wui-list-item');
            listItems[1]?.click();
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                detail: 'second@example.com',
                bubbles: true,
                composed: true
            }));
            eventSpy.mockClear();
            listItems[2]?.click();
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                detail: 'third@example.com',
                bubbles: true,
                composed: true
            }));
        });
        it('should handle click events on multiple items independently', async () => {
            const emails = ['email1@test.com', 'email2@test.com'];
            element = await createWidget(emails);
            const eventSpy = vi.fn();
            element.addEventListener('select', eventSpy);
            const listItems = HelpersUtil.querySelectAll(element, 'wui-list-item');
            listItems[0]?.click();
            listItems[1]?.click();
            expect(eventSpy).toHaveBeenCalledTimes(2);
            expect(eventSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({
                detail: 'email1@test.com'
            }));
            expect(eventSpy).toHaveBeenNthCalledWith(2, expect.objectContaining({
                detail: 'email2@test.com'
            }));
        });
    });
    describe('Dynamic Updates', () => {
        it('should update rendering when emails property changes', async () => {
            element = await createWidget([]);
            let container = HelpersUtil.querySelect(element, '.recent-emails');
            expect(container).toBeNull();
            element.emails = ['new@example.com'];
            await element.updateComplete;
            container = HelpersUtil.querySelect(element, '.recent-emails');
            expect(container).toBeTruthy();
            const listItems = HelpersUtil.querySelectAll(element, 'wui-list-item');
            expect(listItems.length).toBe(1);
        });
        it('should handle empty emails after having emails', async () => {
            element = await createWidget(['test@example.com']);
            let container = HelpersUtil.querySelect(element, '.recent-emails');
            expect(container).toBeTruthy();
            element.emails = [];
            await element.updateComplete;
            container = HelpersUtil.querySelect(element, '.recent-emails');
            expect(container).toBeNull();
        });
    });
    describe('Styling', () => {
        it('should apply correct CSS classes', async () => {
            const emails = ['test@example.com'];
            element = await createWidget(emails);
            const container = HelpersUtil.querySelect(element, '.recent-emails');
            expect(container).toBeTruthy();
            const heading = HelpersUtil.querySelect(element, '.recent-emails-heading');
            expect(heading).toBeTruthy();
            const listItem = HelpersUtil.querySelect(element, '.recent-emails-list-item');
            expect(listItem).toBeTruthy();
        });
        it('should set correct text variants and colors', async () => {
            const emails = ['test@example.com'];
            element = await createWidget(emails);
            const heading = HelpersUtil.querySelect(element, '.recent-emails-heading');
            expect(heading?.getAttribute('variant')).toBe('micro-600');
            expect(heading?.getAttribute('color')).toBe('fg-200');
            const textElements = HelpersUtil.querySelectAll(element, 'wui-text');
            const emailTextElement = Array.from(textElements).find((el) => el !== heading);
            expect(emailTextElement?.getAttribute('variant')).toBe('paragraph-500');
            expect(emailTextElement?.getAttribute('color')).toBe('fg-100');
        });
    });
});
//# sourceMappingURL=w3m-recent-emails-widget.test.js.map