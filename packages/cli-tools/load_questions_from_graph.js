'use strict';

const ethers = require("ethers");
const axios = require('axios');

const rc_question = require('@reality.eth/reality-eth-lib/formatters/question.js');
const rc_template = require('@reality.eth/reality-eth-lib/formatters/template.js');
const rc_contracts = require('@reality.eth/contracts');

let chain_id = parseInt(process.argv[2]);
let offset = parseInt(process.argv[3]);
let num_display = parseInt(process.argv[4]);
let filter_str = process.argv[5];
let order = process.argv[6];
let no_ts = true;

offset = offset ? offset : 0;
num_display = num_display ? num_display : 1000;
filter_str = (filter_str == '') ? filter_str : '{}';

let CONTRACT_CONFIGS = {};
const chain_info = rc_contracts.chainData(chain_id);
const tokens = rc_contracts.chainTokenList(chain_id);
for(const t in tokens) {
    const configs = rc_contracts.realityETHConfigs(chain_id, t); 
    for(const c in configs) {
        CONTRACT_CONFIGS[c.toLowerCase()] = configs[c];
    }
}

fetchAndDisplayQuestionFromGraph(chain_info, offset, num_display, filter_str, order); 

async function fetchAndDisplayQuestionFromGraph(CHAIN_INFO, offset, num_display, filter_str, order) {

    const ts_now = parseInt(new Date()/1000);
    // const contract_str = JSON.stringify(displayed_contracts);
    /*
    const ranking_where = {
        'questions-active-answered': `{${extra_filter_str} contract_in: ${contract_str}, isPendingArbitration: false, answerFinalizedTimestamp_gt: ${ts_now}, openingTimestamp_lte: ${ts_now}}`,
        'questions-active-unanswered': `{${extra_filter_str} contract_in: ${contract_str}, isPendingArbitration: false, answerFinalizedTimestamp: null, openingTimestamp_lte: ${ts_now}}`,
        'questions-upcoming': `{${extra_filter_str} contract_in: ${contract_str}, isPendingArbitration: false, openingTimestamp_gt: ${ts_now}}`,
        'questions-resolved': `{${extra_filter_str} contract_in: ${contract_str}, answerFinalizedTimestamp_lt: ${ts_now}}`,
        'questions-awaiting-arbitration': `{${extra_filter_str} contract_in: ${contract_str}, isPendingArbitration: true}`,
    }

    const ranking_order = {
        'questions-active-answered': 'lastBond',
        'questions-active-unanswered': 'createdTimestamp',
        'questions-upcoming': 'createdTimestamp',
        'questions-resolved': 'answerFinalizedTimestamp',
        'questions-awaiting-arbitration': 'lastBond'
    }
    */

    const network_graph_url = CHAIN_INFO.graphURL;
    if (!network_graph_url) {
        throw new Error('No graph endpoint found for the chain', chain_id); 
    }
    // console.log('graph url is ', network_graph_url);
    const question_fetch_fields = questionFetchFields();
    // const question_fetch_fields = 'questionId'

        // questions(first: ${num_display}, skip: ${offset}, where: ${filter_str}, orderBy: ${order}, orderDirection: desc) {

    const query = `
      {
        questions(first: ${num_display}, skip: ${offset}, where: ${filter_str}, orderDirection: desc) {
            ${question_fetch_fields}
        }
      }  
      `;
    

    console.log(query);
    const fetched_ms = Date.now();

    console.log('sending graph query', query);
    const res = await axios.post(network_graph_url, {query: query});
    // console.log('graph res', res);
    for (const q of res.data.data.questions) {
        handleQuestion(q, fetched_ms)
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
    }
}

function handleQuestion(q, fetched_ms) {
    const fq = filledQuestion(q, fetched_ms);
    console.log(fq);
}

function filledAnswer(item, fetched_ms) {

    // For now we make this look like what we get from a log event
    let ans = {};
    if (item.isCommitment) {
        ans.commitment_id = item.commitmentId;
        ans.is_commitment = true;
        ans.revealed_block = item.revealedBlock
    } else {
        ans.is_commitment = false;
        ans.commitment_id = null;
        ans.revealed_block = null;
    }
    ans.answer = item.answer;
    // ans.isUnrevealed = = item.isUnrevealed; // TODO: use this later
    ans.bond = ethers.BigNumber.from(item.bond);
    ans.history_hash = item.historyHash;

    ans.user = item.user; 
    ans.ts = ethers.BigNumber.from(item.timestamp);

    // txid isn't filled from the graph, only from our unconfirmed transactions
    ans.txid = item.txid;

    if (!no_ts) {
        ans.fetched_ms = fetched_ms;
    }


    return ans;

}

function filledQuestion(item, fetched_ms) {

    let question = {'history_unconfirmed': []};

    question.arbitrator = item.arbitrator;
    question.question_id = item.questionId;
    question.creation_ts = ethers.BigNumber.from(item.createdTimestamp);
    question.question_creator = item.user;
    question.question_created_block = item.createdBlock;
    question.content_hash = item.contentHash;
    question.question_text= item.data;
    question.template_id = item.template.templateId;
    question.block_mined = item.createdBlock;

    if (!no_ts) {
        question.fetched_ms = fetched_ms;
    }

    if (item.openingTimestamp) {
        question.opening_ts = ethers.BigNumber.from(item.openingTimestamp);
    } else {
        question.opening_ts = ethers.BigNumber.from(0);
    }

    question.contract = item.contract;
    question.version_number = CONTRACT_CONFIGS[question.contract.toLowerCase()].version_number;
    if (item.reopens) {
        question.reopener_of_question_id = item.reopens.id;
    }
    if (item.reopenedBy) {
        question.reopened_by = item.reopenedBy.id;
    }
    //question.bounty = data.args['bounty'];

    try {
        // question.question_json = JSON.parse(item.json_str);
        question.question_json = rc_question.populatedJSONForTemplate(item.template.questionText, item.data, true);
        question.has_invalid_option = rc_question.hasInvalidOption(question.question_json, question.version_number);
        question.has_too_soon_option = rc_question.hasAnsweredTooSoonOption(question.question_json, question.version_number);
    } catch (e) {
        console.log('error parsing json', e);
        return null;
        // question.question_json = null;
    }
  
    if (item.answerFinalizedTimestamp) {
        question.finalization_ts = ethers.BigNumber.from(item.answerFinalizedTimestamp); // GRAPH_TODO - check this is what we need
    } else {
        question.finalization_ts = ethers.BigNumber.from(0);
    }

    question.is_pending_arbitration = item.isPendingArbitration;
    question.timeout = ethers.BigNumber.from(item.timeout);
    question.bounty = ethers.BigNumber.from(item.bounty);
    question.best_answer = item.currentAnswer;
    question.bond = ethers.BigNumber.from(item.lastBond);
    question.history_hash = item.historyHash;

    if (!question.history_hash) {
        question.history_hash = "0x0000000000000000000000000000000000000000000000000000000000000000";
    }

    question.min_bond = ethers.BigNumber.from(item.minBond);
    question.history = [];
    for(let respi in item.responses) {
        question.history.push(filledAnswer(item.responses[respi], fetched_ms));
    }
    question.history = question.history.sort((a, b) => 
        (a.bond.isZero() || ( a.bond.gt(b.bond) && !b.bond.isZero() ) ) 
        ? 1 : -1);

    return question;

}

function questionFetchFields() {
    const txt = `
        id,
        questionId,
        contract,
        createdBlock,
        createdTimestamp,
        updatedBlock,
        updatedTimestamp,
        data,
        qJsonStr,
        qTitle,
        qCategory,
        qLang,
        qType,
        arbitrator,
        user,
        openingTimestamp,
        timeout,
        bounty,
        currentAnswer,
        currentAnswerBond,
        currentAnswerTimestamp,
        contentHash,
        historyHash,
        minBond,
        lastBond,
        cumulativeBonds,
        arbitrationRequestedTimestamp,
        arbitrationRequestedBy,
        isPendingArbitration,
        arbitrationOccurred,
        answerFinalizedTimestamp,
        currentScheduledFinalizationTimestamp,
        template {
            id, 
            templateId, 
            questionText
        },
        reopenedBy {
          id
        },
        reopens {
          id
        },
        responses {
          id,
          timestamp,
          answer,
          isUnrevealed,
          isCommitment,
          commitmentId,
          bond,
          user,
          historyHash,
          createdBlock,
          revealedBlock
        }
    `;
    return txt;
}


