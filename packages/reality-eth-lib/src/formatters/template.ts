import templateConfig from '@reality.eth/contracts/config/templates.json';
import templateConfig32 from '@reality.eth/contracts/config/templates_3.2.json';

export function defaultTemplateIDForType(template_type: string): number {
    return (templateConfig.base_ids as Record<string, number>)[template_type];
}

export function defaultTemplateForType(template_type: string): string {
    return (templateConfig.content as Record<string, string>)[String(defaultTemplateIDForType(template_type))];
}

export function preloadedTemplateContents(): Record<string, string> {
    return templateConfig.content as Record<string, string>;
}

// v3.2+ contracts (and v2.2) use description instead of category and add template 5 (hash type).
export function preloadedTemplateContentsV32(): Record<string, string> {
    return templateConfig32.content as Record<string, string>;
}
