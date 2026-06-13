export interface QuestionJSON {
    title?: string;
    title_text?: string;
    title_html?: string;
    type?: string;
    category?: string;
    lang?: string;
    outcomes?: string[];
    format?: string;
    precision?: string;
    decimals?: number;
    has_invalid?: boolean;
    errors?: Record<string, boolean>;
    [key: string]: unknown;
}
export interface TemplatePart {
    part: 'parameter' | 'array_parameter' | 'text';
    part_index?: number;
    label?: string;
    value?: string;
}
export interface TemplateFieldDef {
    label: string;
    parts: TemplatePart[];
}
export interface TemplateConfig {
    fields: Record<string, TemplateFieldDef>;
    tags: Record<string, string>;
}
export declare function delimiter(): string;
export declare function contentHash(template_id: number | string, opening_ts: number | string, content: string): string;
export declare function questionID(template_id: number | string, question: string, arbitrator: string, timeout: number | string, opening_ts: number | string, sender: string, nonce: number | string, min_bond?: string, contract?: string, version?: string): string;
export declare function minNumber(qjson: QuestionJSON): bigint;
export declare function maxNumber(qjson: QuestionJSON): bigint;
export declare function arrayToBitmaskBigNumber(selections: boolean[]): bigint;
export declare function padToBytes32(n: string, raw?: boolean): string;
export declare function answerToBytes32(answer: any, qjson: QuestionJSON): string;
export declare function bytes32ToString(bytes32str: string, qjson: QuestionJSON): string;
export declare function convertTsToString(ts: number | {
    toNumber(): number;
}): string;
export declare function secondsTodHms(sec: number | string): string;
export declare function parseQuestionJSON(data: string, errors_to_title?: boolean, vsprint_errors?: Record<string, boolean> | null): QuestionJSON;
export declare function populatedJSONForTemplate(template: string, question: string, errors_to_title?: boolean): QuestionJSON;
export declare function encodeCustomText(params: Record<string, any>): string;
export declare function guessTemplateConfig(template: string): TemplateConfig;
export declare function encodeText(qtype: string, txt: string, outcomes?: string[] | null, category?: string, lang?: string): string;
export declare function getInvalidValue(_question_json?: QuestionJSON): string;
export declare function getAnsweredTooSoonValue(_question_json?: QuestionJSON): string;
export declare function getLanguage(question_json: QuestionJSON): string;
export declare function hasInvalidOption(question_json: QuestionJSON, _contract_version?: string): boolean;
export declare function hasAnsweredTooSoonOption(_question_json: QuestionJSON, contract_version: string): boolean;
export declare function getAnswerString(question_json: QuestionJSON, answer: string | null): string;
export declare function commitmentID(question_id: string, answer_hash: string, bond: string | {
    toString(base: number): string;
}): string;
export declare function answerHash(answer_plaintext: string, nonce: string): string;
export declare function shortDisplayQuestionID(question_id: string): string;
