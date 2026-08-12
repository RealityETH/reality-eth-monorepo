import { populatedJSONForTemplate as libPopulatedJSON } from "@reality.eth/reality-eth-lib/formatters/question.js";
import { preloadedTemplateContents } from "@reality.eth/reality-eth-lib/formatters/template.js";

export interface ParsedQuestion {
  title?: string;
  type?: string;
  category?: string;
  lang?: string;
  outcomes?: string; // JSON-stringified array for choice questions
  questionJson?: string; // Full JSON from populatedJSONForTemplate
}

// Built-in templates 0–4 sourced from reality-eth-lib.
export const BUILTIN_TEMPLATES: Record<string, string> =
  preloadedTemplateContents() as Record<string, string>;

/**
 * Strip null bytes from a string — raw RPC data can contain \x00 chars
 * that cause UTF-8 encoding errors in PostgreSQL/PGlite.
 * Used for template text storage; question data is handled inside the lib.
 */
export function stripNullBytes(s: string): string {
  return s.replace(/\x00/g, "");
}

/**
 * Parse question data given the template text, delegating to reality-eth-lib
 * for consistent parsing, null-byte stripping, and error detection.
 */
export function populatedJSONForTemplate(
  templateText: string | null | undefined,
  questionData: string
): ParsedQuestion {
  if (!questionData) return {};
  if (!templateText) {
    // No template available — return the first ␟-delimited field as title.
    const fields = questionData.replace(/\x00/g, "").split("␟");
    return { title: fields[0] || undefined };
  }

  const parsed = libPopulatedJSON(templateText, questionData);
  return {
    title: typeof parsed.title === "string" ? parsed.title : undefined,
    type: typeof parsed.type === "string" ? parsed.type : undefined,
    category: typeof parsed.category === "string" ? parsed.category : undefined,
    lang: typeof parsed.lang === "string" ? parsed.lang : undefined,
    outcomes: Array.isArray(parsed.outcomes)
      ? JSON.stringify(parsed.outcomes)
      : undefined,
    questionJson: JSON.stringify(parsed),
  };
}

/**
 * Resolve the template text for a given template ID, preferring the DB-stored
 * version (for custom templates) and falling back to built-ins.
 */
export function resolveTemplateText(
  templateId: bigint,
  storedTemplateText: string | null | undefined
): string | null {
  if (storedTemplateText) return storedTemplateText;
  return BUILTIN_TEMPLATES[templateId.toString()] ?? null;
}
