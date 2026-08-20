// Browser IIFE entry: exposes parsing/formatting helpers as window.RealityLib
export {
    populatedJSONForTemplate,
    parseQuestionJSON,
    encodeText,
    encodeCustomText,
    answerHash,
    answerToBytes32,
    bytes32ToString,
    getAnswerString,
    contentHash,
    questionID,
    hasInvalidOption,
    hasAnsweredTooSoonOption,
    getInvalidValue,
    getAnsweredTooSoonValue,
} from './src/formatters/question.js';

export {
    preloadedTemplateContents,
    preloadedTemplateContentsV32,
} from './src/formatters/template.js';
