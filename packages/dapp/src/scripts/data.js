'use strict';

const rc_question = require('@reality.eth/reality-eth-lib/formatters/question.js');
const rc_contracts = require('@reality.eth/contracts');
const ethers = require("ethers");

function contractQuestionID(question) {
    return cqToID(question.contract, question.question_id);
}

function cqToID(contract, question_id) {
    return contract.toLowerCase() + '-' + question_id.toLowerCase();
}

function isArbitrationPending(question) {
    return (question.is_pending_arbitration);
}

function isFinalized(question) {
    if (isArbitrationPending(question)) {
        return false;
    }
    const fin = question.finalization_ts.toNumber()
    const res = ((fin > 1) && (fin * 1000 < new Date().getTime()));
    return res;
}

// RPC TODO: Check this finalization_ts doesn't break something
function isAnswered(question) {
    const finalization_ts = question.finalization_ts.toNumber();
    const is_pending_arbitration = question.is_pending_arbitration;
    return (finalization_ts > 1 || is_pending_arbitration);
}

function isAnswerActivityStarted(question) {
    if (isAnswered(question)) {
        return true;
    }
    const history_hash = ethers.BigNumber.from(question.history_hash);
    return (history_hash.gt(0));
}

function isAnsweredOrAnswerActive(question) {
    if (isAnswered(question)) {
        return true;
    }
    const history_hash = ethers.BigNumber.from(question.history_hash);
    return (history_hash.gt(0));
}

function isAnythingUnrevealed(question) {
    console.log('isAnythingUnrevealed pretending everything is revealed');
    return false;
}
function isBeforeOpeningDate(opening_ts) {
    const opening_date = opening_ts * 1000
    const now = new Date();
    
    return now.getTime() < opening_date
}
function isCommitExpired(question, posted_ts) {
    const commit_secs = question.timeout.toNumber() / 8;
    // console.log('commit secs are ', commit_secs);
    return new Date().getTime() > (( posted_ts + commit_secs ) * 1000);
}

function isQuestionBeforeOpeningDate(question_detail) {    
    return isBeforeOpeningDate(question_detail.opening_ts.toNumber())
}

function isReopenCandidate(question, rc_instance_versions) {
    if (!isFinalized(question)) {
        return false;
    }
    if (question.best_answer != rc_question.getAnsweredTooSoonValue()) {
        return false;
    }
    if (!rc_contracts.versionHasFeature(rc_instance_versions[question.contract.toLowerCase()], 'reopen-question')) {
        return false;
    }
    return true;
}

function isReopenable(question) {
    // TODO: Check if it can be re-reopened
    // console.log('reopened_by is ', question.reopened_by);
    // console.log('last_reopened_by is ', question.last_reopened_by);
    if (question.reopened_by && question.reopened_by != '0x0000000000000000000000000000000000000000000000000000000000000000') {
        // console.log('already reopened');
        return false;
    }
    if (question.is_reopener) {
        // console.log('already reopening something else');
        return false;
    }
    return isReopenCandidate(question);
}

function hasUnrevealedCommits(question) {
    if (!isAnswerActivityStarted(question)) {
        return false;
    }
    if (question['history'].length) {
        for (let i=0; i<question['history'].length; i++) {
            // TODO: This is inconsistent between graph and rpc. Straighten this out.
            const item = question['history'][i].args ? question['history'][i].args : question['history'][i];
            if (item.is_commitment && !item.revealed_block) {
                return true;
            }
        }
    }
    return false;
}

function isTopAnswerRevealable(question) {
    // console.log('in isTopAnswerRevealable');
    if (!isAnswerActivityStarted(question)) {
        return false;
    }
    // console.log('history', question['history']);
    if (question['history'].length == 0) {
        return false;
    }
    const idx = question['history'].length - 1;
    // TODO: Fix inconsistency between rpc and graph
    const item = question['history'][idx].args ? question['history'][idx].args : question['history'][idx];
    if (!item.is_commitment) {
        return false;
    }
    if (item.revealed_block) {
        return false;
    }
    if (isCommitExpired(question, item['ts'].toNumber())) {
        return false;
    }
    return true;
}

function parseContractQuestionID(id, fallback_contract) {
    // console.log('fallback_contract', fallback_contract);
    id = id.toLowerCase();
    const bits = id.split('-');
    if (bits.length === 2) {
        return bits; 
    }
    if (bits.length === 1) {
        // console.log('try fallback');
        if (fallback_contract) {
            console.log('using fallback contract');
            return [fallback_contract.toLowerCase(), bits[0]]; 
        }
    } else {
        console.log('bits length was', bits.length, bits);
        throw new Error("Could not parse contract-question-id " + id); 
    }
}

export {
    contractQuestionID,
    cqToID,
    isArbitrationPending,
    isFinalized,
    isAnswered,
    isAnswerActivityStarted,
    isAnsweredOrAnswerActive,
    isAnythingUnrevealed,
    isBeforeOpeningDate,
    isCommitExpired,
    isQuestionBeforeOpeningDate,
    isReopenCandidate,
    isReopenable,
    hasUnrevealedCommits,
    isTopAnswerRevealable,
    parseContractQuestionID
}


