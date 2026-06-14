import type { TemplateResult } from 'lit';
export declare const QrCodeUtil: {
    generate({ uri, size, logoSize, padding, dotColor }: {
        uri: string;
        size: number;
        padding?: number;
        logoSize: number;
        dotColor?: string;
    }): TemplateResult[];
};
