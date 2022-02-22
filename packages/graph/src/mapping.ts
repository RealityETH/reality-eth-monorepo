import { crypto, log, BigInt, Bytes, ByteArray } from '@graphprotocol/graph-ts'
import { json, JSONValueKind } from '@graphprotocol/graph-ts'

import { unescape } from './utils/unescape'
import { sprintf } from './utils/sprintf'

import { 
    Question,
    Outcome,
    Response,
    Answer,
    Category,
    Template,
    Claim,
    Withdrawal,
    Fund,
    UserAction,
} from '../generated/schema'

import {
  RealityETH,
  LogNewTemplate,
  LogNewQuestion,
  LogNewAnswer,
  LogNotifyOfArbitrationRequest,
  LogFinalize,
  LogAnswerReveal,
  LogFundAnswerBounty,
  LogClaim,
  LogWithdraw,
  LogMinimumBond,
  LogReopenQuestion
} from '../generated/RealityETH/RealityETH'

export function handleNewTemplate(event: LogNewTemplate): void {
  let contractTemplateId = event.address.toHexString() + '-' + event.params.template_id.toHexString();
  let tmpl = new Template(contractTemplateId);
  tmpl.templateId = event.params.template_id;
  tmpl.contract = event.address;
  tmpl.user = event.params.user;
  tmpl.questionText = event.params.question_text;
  tmpl.createdBlock = event.block.number;
  tmpl.save()

  let ua = new UserAction(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  ua.actionType = 'CreateTemplate';
  ua.user = event.params.user;
  ua.template = contractTemplateId;
  ua.createdBlock = event.block.number;
  ua.createdTimestamp = event.block.timestamp;
  ua.save();
}

export function handleNewQuestion(event: LogNewQuestion): void {
  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let contract = event.address;
  let question = new Question(contractQuestionId);
  question.questionId = event.params.question_id;  

  let contractTemplateId = event.address.toHexString() + '-' + event.params.template_id.toHexString();
  let tmpl = Template.load(contractTemplateId);
  question.template = contractTemplateId;

  let questionText = tmpl.questionText;

  let data = event.params.question;
  let fields = data.split('\u241f');

  let qJsonStr = sprintf(questionText, fields)  

  let tryData = json.try_fromBytes(ByteArray.fromUTF8(qJsonStr) as Bytes)
  if (tryData.isOk) {
    let json_dict = tryData.value.toObject()

    let qTitle = json_dict.get('title')
    if (qTitle != null && qTitle.kind === JSONValueKind.STRING) {
      question.qTitle = qTitle.toString()
    }

    let qCategory = json_dict.get('category')
    if (qCategory != null && qCategory.kind == JSONValueKind.STRING) {
        question.qCategory = qCategory.toString();
    }

    let qLang = json_dict.get('lang')
    if (qLang != null && qLang.kind == JSONValueKind.STRING) {
        question.qLang = qLang.toString();
    }

    let qType = json_dict.get('type')
    if (qType != null && qType.kind == JSONValueKind.STRING) {
        question.qType = qType.toString();
    }

    let q_outcomes_val = json_dict.get('outcomes')
    if (q_outcomes_val != null && q_outcomes_val.kind === JSONValueKind.ARRAY) {
      let q_outcomes = q_outcomes_val.toArray()
      for(let i = 0; i < q_outcomes.length; i++) {
          let outcomeID = contractQuestionId + '-' + i.toString();
          let outcome = new Outcome(outcomeID);
          outcome.answer = q_outcomes[i].toString()
          outcome.question = contractQuestionId;
          outcome.save()
        }
    }
  } else {
    log.info('Could not parse json for question {}', [contractQuestionId]);
  }

  question.contract = contract;

  question.data = data
  question.contentHash = event.params.content_hash;

  question.qJsonStr = qJsonStr

  question.createdBlock = event.block.number;
  question.createdTimestamp = event.params.created;
  question.updatedBlock = event.block.number;
  question.updatedTimestamp = event.block.timestamp;

  question.user = event.params.user;
  question.arbitrator = event.params.arbitrator;
  question.openingTimestamp = event.params.opening_ts;
  question.timeout = event.params.timeout;

  question.isPendingArbitration = false;
  question.arbitrationOccurred = false;

  question.currentAnswerBond = new BigInt(0);
  question.lastBond = new BigInt(0);
  question.cumulativeBonds = new BigInt(0);

  question.minBond = new BigInt(0);

  question.currentScheduledFinalizationTimestamp = BigInt.fromI32(I32.MAX_VALUE);

  // TODO: This may theoretically be wrong if the arbitrator snaffled part of the transaction value
  question.bounty = event.transaction.value;

  question.save();

  let ua = new UserAction(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  ua.actionType = 'AskQuestion';
  ua.user = event.params.user;
  ua.question = contractQuestionId;
  ua.createdBlock = event.block.number;
  ua.createdTimestamp = event.block.timestamp;
  ua.save();

}

export function handleNewAnswer(event: LogNewAnswer): void {

  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let question = Question.load(contractQuestionId);
  if (question == null) {
    log.info('cannot find question {} to answer', [contractQuestionId]);
    return;
  }

  let ts = event.params.ts
  let isCommitment = event.params.is_commitment;

  let responseId = contractQuestionId + '-' + event.params.bond.toHexString();
  let response = new Response(responseId);
  response.question = contractQuestionId;
  response.createdBlock = event.block.number;
  if (isCommitment) {
    response.commitmentId = event.params.answer;
    response.isUnrevealed = true;
  } else {
    response.answer = event.params.answer;
    response.isUnrevealed = false;
  }
  response.bond = event.params.bond;
  response.user = event.params.user;
  response.timestamp = event.params.ts;
  response.isCommitment = isCommitment;
  response.historyHash = event.params.history_hash;
  response.save();

  if (!isCommitment) {
    saveAnswer(contractQuestionId, event.params.answer, event.params.bond, event.params.ts, event.block.number);
    if (event.params.bond > question.lastBond) {
      question.currentAnswer = event.params.answer;
      question.currentAnswerBond = event.params.bond;
      question.currentAnswerTimestamp = event.params.ts;
    }
  }
  // response.bondAggregate = response.bondAggregate.plus(bond);

    /*
    response.bondAggregate = response.bondAggregate.plus(bond);
    response.timestamp = ts;
*/

  question.answerFinalizedTimestamp = question.arbitrationOccurred ? ts : ts.plus(question.timeout);
  question.currentScheduledFinalizationTimestamp = question.arbitrationOccurred ? ts : ts.plus(question.timeout);

  question.historyHash = event.params.history_hash;
  question.lastBond = event.params.bond;
  question.cumulativeBonds = question.cumulativeBonds.plus(event.params.bond);

  question.updatedBlock = event.block.number;
  question.updatedTimestamp = event.block.timestamp;

  question.save();

  let ua = new UserAction(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  ua.actionType = 'AnswerQuestion';
  ua.user = event.params.user;
  ua.question = contractQuestionId;
  ua.response = responseId;
  ua.createdBlock = event.block.number;
  ua.createdTimestamp = event.block.timestamp;
  ua.save();

}

export function handleAnswerReveal(event: LogAnswerReveal): void {
  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let responseId = contractQuestionId + '-' + event.params.bond.toHexString();

  let response = Response.load(responseId);
  if (response == null) {
    //log.info('cannot find answer {} for reveal', [event.params.answer]);
    return;
  }
  response.answer = event.params.answer;
  response.isUnrevealed = false;
  response.revealedBlock = event.block.number;
  response.save()

  let question = Question.load(contractQuestionId);
  if (question == null) {
    log.info('cannot find question {} to answer', [contractQuestionId]);
    return;
  }
  saveAnswer(contractQuestionId, event.params.answer, event.params.bond, response.timestamp, event.block.number);

  question.updatedBlock = event.block.number;
  question.updatedTimestamp = event.block.timestamp;

  // Update the question to the current answer, unless someone has posted a higher bond since you made the commitment
  if (event.params.bond == question.lastBond) {
    question.currentAnswer = event.params.answer;
  }
  question.save()

  let ua = new UserAction(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  ua.actionType = 'RevealAnswer';
  ua.user = event.params.user;
  ua.question = contractQuestionId;
  ua.response = responseId;
  ua.createdBlock = event.block.number;
  ua.createdTimestamp = event.block.timestamp;
  ua.save();

    //saveAnswer(question, questionId, event.params.answer, event.params.bond, event.params.ts);

}

export function handleArbitrationRequest(event: LogNotifyOfArbitrationRequest): void {
  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let question = Question.load(contractQuestionId);
  if (question == null) {
    log.info('cannot find question {} to begin arbitration', [contractQuestionId]);
    return;
  }

  question.isPendingArbitration = true;
  question.answerFinalizedTimestamp = null;
  question.arbitrationRequestedTimestamp = event.block.timestamp;
  question.arbitrationRequestedBy = event.params.user.toHexString();

  question.currentScheduledFinalizationTimestamp = BigInt.fromI32(I32.MAX_VALUE);

  question.updatedBlock = event.block.number;
  question.updatedTimestamp = event.block.timestamp;
  question.save();

  let ua = new UserAction(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  ua.actionType = 'RequestArbitration';
  ua.user = event.params.user;
  ua.question = contractQuestionId;
  ua.createdBlock = event.block.number;
  ua.createdTimestamp = event.block.timestamp;
  ua.save();

}

export function handleFinalize(event: LogFinalize): void {
  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let question = Question.load(contractQuestionId);
  if (question == null) {
    log.info('cannot find question {} to finalize', [contractQuestionId]);
    return;
  }

  question.isPendingArbitration = false;
  question.arbitrationOccurred = true;
  question.currentAnswer = event.params.answer;

  question.updatedBlock = event.block.number;
  question.updatedTimestamp = event.block.timestamp;
  question.save();

}

export function handleFundAnswerBounty(event: LogFundAnswerBounty): void {
  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let question = Question.load(contractQuestionId);
  if (question == null) {
    log.info('cannot find question {} to finalize', [contractQuestionId]);
    return;
  }
  question.bounty = event.params.bounty;
  question.updatedBlock = event.block.number;
  question.updatedTimestamp = event.block.timestamp;
  question.save()

  let fundId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let fund = new Fund(fundId);
  fund.question = contractQuestionId;
  fund.user = event.params.user;
  fund.amount = event.params.bounty_added;
  fund.createdBlock = event.block.number;
  fund.save()

  let ua = new UserAction(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  ua.actionType = 'FundAnswerBounty';
  ua.user = event.params.user;
  ua.createdBlock = event.block.number;
  ua.createdTimestamp = event.block.timestamp;
  ua.fund = fundId;
  ua.question = contractQuestionId;
  ua.save();
}

export function handleLogClaim(event: LogClaim): void {
   let claimId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
   let claim = new Claim(claimId)

   let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
   claim.question = contractQuestionId;
   claim.user = event.params.user;
   claim.amount = event.params.amount;
   claim.createdBlock = event.block.number;
   claim.save();

   let question = Question.load(contractQuestionId);
   let contract = RealityETH.bind(event.address)
   question.historyHash = contract.getHistoryHash(event.params.question_id);

   question.updatedBlock = event.block.number;
   question.updatedTimestamp = event.block.timestamp;
   question.save();
}

export function handleLogWithdraw(event: LogWithdraw): void {
   let withdrawalId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
   let withdrawal = new Withdrawal(withdrawalId);
   withdrawal.user = event.params.user;
   withdrawal.amount = event.params.amount;
   withdrawal.createdBlock = event.block.number;
   withdrawal.save();
}

// This is done on question creation.
// To preserve the old event signatures it adds a new event
export function handleLogMinimumBond(event: LogMinimumBond): void {
  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let question = Question.load(contractQuestionId);
  question.minBond = event.params.min_bond;
  question.save();
}

export function handleLogReopenQuestion(event: LogReopenQuestion): void {
  // We'll save this in both directions for easy querying
  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let reopenedContractQuestionId = event.address.toHexString() + '-' + event.params.reopened_question_id.toHexString();
  let question = Question.load(contractQuestionId);
  let reopenedQuestion = Question.load(reopenedContractQuestionId);
  question.reopens = reopenedContractQuestionId;
  question.updatedBlock = event.block.number;
  question.updatedTimestamp = event.block.timestamp;
  question.save();
  reopenedQuestion.reopenedBy = contractQuestionId;
  reopenedQuestion.updatedBlock = event.block.number;
  reopenedQuestion.updatedTimestamp = event.block.timestamp;
  reopenedQuestion.save();
}

function saveAnswer(contractQuestionId: string, answer: Bytes, bond: BigInt, ts: BigInt, createdBlock: BigInt): void {
  let question = Question.load(contractQuestionId);

  let answerId = contractQuestionId + '-' + answer.toHexString();
  let answerEntity = Answer.load(answerId);
  if(answerEntity == null) {
    answerEntity = new Answer(answerId);
    answerEntity.question = contractQuestionId;
    answerEntity.answer = answer;
    answerEntity.bondAggregate = bond;
    answerEntity.lastBond = bond;
    answerEntity.timestamp = ts;
    answerEntity.createdBlock = createdBlock;
    answerEntity.save();
  } else {
    answerEntity.bondAggregate = answerEntity.bondAggregate.plus(bond);
    answerEntity.timestamp = ts;
    if (bond > answerEntity.lastBond) {
      answerEntity.lastBond = bond;
    }
    answerEntity.save();
  }
}

