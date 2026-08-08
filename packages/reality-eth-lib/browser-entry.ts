// Browser IIFE entry: exposes parsing/formatting helpers as window.RealityLib
export {
    populatedJSONForTemplate,
    parseQuestionJSON,
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
