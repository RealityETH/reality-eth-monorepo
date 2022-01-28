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
} from '../generated/schema'

import {
  LogNewTemplate,
  LogNewQuestion,
  LogNewAnswer,
  LogNotifyOfArbitrationRequest,
  LogFinalize,
  LogAnswerReveal,
  LogFundAnswerBounty,
  LogClaim,
  LogWithdraw
} from '../generated/RealityETH/RealityETH'

export function handleNewTemplate(event: LogNewTemplate): void {
  let contractTemplateId = event.address.toHexString() + '-' + event.params.template_id.toHexString();
  let tmpl = new Template(contractTemplateId);
  tmpl.templateId = event.params.template_id;
  tmpl.contract = event.address;
  tmpl.user = event.params.user;
  tmpl.question_text = event.params.question_text;
  tmpl.createdBlock = event.block.number;
  tmpl.save()
}

export function handleNewQuestion(event: LogNewQuestion): void {
  let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
  let contract = event.address;
  let question = new Question(contractQuestionId);
  question.questionId = event.params.question_id;  

  let contractTemplateId = event.address.toHexString() + '-' + event.params.template_id.toHexString();

  let tmpl = Template.load(contractTemplateId);
  let question_text = tmpl.question_text;

  let data = event.params.question;
  let fields = data.split('\u241f');

  let json_str = sprintf(question_text, fields)  

  question.templateId = event.params.template_id

  let tryData = json.try_fromBytes(ByteArray.fromUTF8(json_str) as Bytes)
  if (tryData.isOk) {
    let json_dict = tryData.value.toObject()

    let q_title = json_dict.get('title')
    if (q_title != null && q_title.kind === JSONValueKind.STRING) {
      question.q_title = q_title.toString()
    }

    let q_category = json_dict.get('category')
    if (q_category != null && q_category.kind == JSONValueKind.STRING) {
        question.q_category = q_category.toString();
    }

    let q_lang = json_dict.get('lang')
    if (q_lang != null && q_lang.kind == JSONValueKind.STRING) {
        question.q_lang = q_lang.toString();
    }

    let q_type = json_dict.get('type')
    if (q_type != null && q_type.kind == JSONValueKind.STRING) {
        question.q_type = q_type.toString();
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
  question.json_str = json_str

  question.createdBlock = event.block.number;
  question.createdTimestamp = event.params.created;

  question.arbitrator = event.params.arbitrator;
  question.openingTimestamp = event.params.opening_ts;
  question.timeout = event.params.timeout;

  question.isPendingArbitration = false;
  question.arbitrationOccurred = false;

  question.currentAnswerBond = new BigInt(0);
  question.lastBond = new BigInt(0);
  question.cumulativeBonds = new BigInt(0);

  question.currentScheduledFinalizationTimestamp = BigInt.fromI32(I32.MAX_VALUE);

  // TODO: This may theoretically be wrong if the arbitrator snaffled part of the transaction value
  question.bounty = event.transaction.value;

  question.save();
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
  if (isCommitment) {
    response.commitmentId = event.params.answer;
    response.isUnrevealed = true;
  } else {
    response.answer = event.params.answer;
    response.isUnrevealed = false;
  }
  response.bond = event.params.bond;
  response.answerer = event.params.user;
  response.timestamp = event.params.ts;
  response.isCommitment = isCommitment;
  response.save();

  if (!isCommitment) {
    saveAnswer(contractQuestionId, event.params.answer, event.params.bond, event.params.ts);
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

  question.lastBond = event.params.bond;
  question.cumulativeBonds = question.cumulativeBonds.plus(event.params.bond);

  question.save();

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
  // TODO: Handle question updates etc
  response.save()

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

  question.save();

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
  question.save()
}

export function handleLogClaim(event: LogClaim): void {
   let claimId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
   let claim = new Claim(claimId)

   let contractQuestionId = event.address.toHexString() + '-' + event.params.question_id.toHexString();
   // let question = Question.load(contractQuestionId);

   claim.question = contractQuestionId;
   claim.user = event.params.user;
   claim.amount = event.params.amount;
   claim.createdBlock = event.block.number;
   claim.save();
}

export function handleLogWithdraw(event: LogWithdraw): void {
   let withdrawalId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
   let withdrawal = new Withdrawal(withdrawalId);
   withdrawal.user = event.params.user;
   withdrawal.amount = event.params.amount;
   withdrawal.createdBlock = event.block.number;
   withdrawal.save();
}

function saveAnswer(contractQuestionId: string, answer: Bytes, bond: BigInt, ts: BigInt): void {
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
    answerEntity.save();
  } else {
    answerEntity.bondAggregate = answerEntity.bondAggregate.plus(bond);
    answerEntity.timestamp = ts;
    if (bond > answerEntity.lastBond) {
      answerEntity.lastBond = bond;
    }
    answerEntity.save();
  }

  let answerFinalizedTimestamp = question.arbitrationOccurred ? ts : ts.plus(question.timeout);
}

