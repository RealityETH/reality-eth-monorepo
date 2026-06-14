// Browser IIFE entry: exposes parsing/formatting helpers as window.RealityLib
export {
    populatedJSONForTemplate,
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
