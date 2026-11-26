// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

/// @notice The answer type a template declares. Drives on-chain answer validation.
enum AnswerType {
    Bool, // 0 — answer {0, 1}
    Uint, // 1 — any uint below uint256(-2), rendered with `decimals`
    SingleSelect, // 2 — answer = index into `outcomes`
    MultipleSelect, // 3 — answer = bitmask over `outcomes`
    Datetime, // 4 — unix timestamp, validated like Uint
    Hash, // 5 — any bytes32
    Assertion // 6 — "boolean with no no": the only substantive answer is 1 (plus invalid/too-soon)
}

/// @notice A reusable, structured, on-chain question template.
/// @dev title/description/category/lang replace the old delimiter-joined JSON.
/// `hasDescription`/`hasCategory`/`hasLang` drive a tri-state per field: false =>
/// unused; true with a non-empty stored string => preset; true with an empty
/// stored string => supplied by the asker at ask time.
struct Template {
    // scalars (pack into a single slot: 1+1+4 bools + 20-byte address = 26 bytes)
    AnswerType answerType;
    uint8 decimals; // meaningful only for Uint
    bool hasAnsweredTooSoon; // false => 0xff..fe is a banned answer, not a sentinel
    bool hasDescription;
    bool hasCategory;
    bool hasLang;
    // When true, the template fixes the corresponding field below for every question (even to the
    // zero value, e.g. "no arbitrator" / "no minimum bond"); the asker must leave it empty at ask
    // time, the question stores nothing for it, and reads fall back to the template. When false,
    // the asker supplies it per question and it is stored on the question.
    bool arbitratorFromTemplate;
    bool minBondFromTemplate;
    address arbitrator; // packs into the scalar slot
    uint256 minBond; // own slot
    // dynamic fields
    string[] titleParts; // literal segments interleaved with "" interpolation slots
    string[] outcomes; // SingleSelect/MultipleSelect only, length 1..256; empty otherwise
    string description;
    string category;
    string lang;
}
