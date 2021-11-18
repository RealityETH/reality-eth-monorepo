const axios = require('axios')
const twit = require('twit')
const ethers = require('ethers');
const fs = require('fs');
const rc_contracts = require('@reality.eth/contracts');
const rc_question = require('@reality.eth/reality-eth-lib/formatters/question.js');
const rc_template = require('@reality.eth/reality-eth-lib/formatters/template.js');

const PER_QUERY = 100;
const MAX_TWEET = 100;

const SLEEP_SECS = 10; // How long to pause between runs

const TWITTER_CONFIG = require('./secrets/config.json');

const chain_ids = process.argv[2].split(',');
const init = (process.argv.length > 3 && process.argv[3] == 'init');

for(let ci=0; ci<chain_ids.length;ci++) {
    const chain_id = parseInt(chain_ids[ci]);
    if (chain_id) {
        // console.log('processing chain', chain_id)
        processChain(chain_id, init);
    } else {
        console.log('Could not parse chain ID, skipping:', chain_id);
    }
}

async function processChain(chain_id, init) {

    const lock_file_name = './state/'+chain_id+'.pid';
    if (fs.existsSync(lock_file_name)) {
        console.log("Skipping chain with process already running, delete pid file to force", chain_id);
        return;
    }
    fs.writeFileSync(lock_file_name, 
        process.pid,
        { encoding: "utf8", }
    );

    // console.log('chain_id', chain_id);

    if (!chain_id) {
        throw new Error("Missing or unsupported chain ID");
    }

    const tokens = rc_contracts.chainTokenList(chain_id);
    const chain_data = rc_contracts.chainData(chain_id);

    let contract_tokens = {};

    for(const t in tokens) {
        const configs = rc_contracts.realityETHConfigs(chain_id, t); 
        // console.log(configs);
        for (const c in configs) {
            contract_tokens[c.toLowerCase()] = t;
        }
    }

    if (!'graphURL' in chain_data) {
        throw new Error("No graph URL found for chain", chain_id);
    }
    const graph_url = chain_data['graphURL'];

    // console.log(graph_url);

    const state_file_name = './state/'+chain_id+'.json';
    if (!fs.existsSync(state_file_name)) {
        if (!init) {
            console.log('No state file for chain,', chain_id, 'run with init to create it');
            fs.unlinkSync(lock_file_name);
            return;
        }
        // No state file so initialize starting now
        const tsnow = parseInt(new Date().getTime()/1000);
        updateStateFile(chain_id, tsnow, 0);
    }

    const chain_state = require(state_file_name);
    // console.log(chain_state);
    let initial_ts = 0;
    if ('ts' in chain_state) {
        initial_ts = chain_state['ts'];
    }

    await doQuery(graph_url, chain_id, contract_tokens, tokens, initial_ts);

    fs.unlinkSync(lock_file_name);

}

async function doQuery(graph_url, chain_id, contract_tokens, tokens, initial_ts) {

    /*
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    await sleep(10000);
    */

    const template_res = await axios.post(graph_url, {
      query: `
      {
        templates(orderBy: id, orderDirection: asc) {
            id,
            question_text
        }
      }
    `
    })

    let all_templates = {};
    for(const t of template_res.data.data.templates) {
        const tid = parseInt(t.id, 16);
        all_templates[tid] = t.question_text;
    }

    const qres = await axios.post(graph_url, {
      query: `
      {
        questions(orderBy: createdTimestamp, orderDirection: asc, first: ${PER_QUERY},  where: { createdTimestamp_gt: ${initial_ts}, currentAnswerTimestamp: null }) {
            id,
            createdTimestamp,
            contract,
            templateId,
            data,
            bounty,
            currentAnswer,
            currentAnswerTimestamp,
            currentAnswerBond
        }
      }
    `
    })

    const ares = await axios.post(graph_url, {
      query: `
      {
        questions(orderBy: currentAnswerTimestamp, orderDirection: asc, first: ${PER_QUERY},  where: { currentAnswerTimestamp_gt: ${initial_ts} }) {
            id,
            createdTimestamp,
            contract,
            templateId,
            data,
            bounty,
            currentAnswer,
            currentAnswerTimestamp,
            currentAnswerBond
        }
      }
    `
    })

    const questions = qres.data.data.questions.concat(ares.data.data.questions);

    // console.log('res', res.data);
    let i = 0;
    let ts = 0;
    for (const q of questions) {
        i++;
        // console.log(q)
        const contract = q.contract;
        const id = q.id;
        const data = q.data;
        const template_id = ''+q.templateId;
        const template_text = all_templates[template_id];
        const question_json = rc_question.populatedJSONForTemplate(template_text, data, true);
        const token = contract_tokens[contract.toLowerCase()];
        let title = question_json['title'];
        const url = 'https://reality.eth.link/app/#!/network/'+chain_id+'/contract/'+contract+'/token/'+token+'/question/'+id;

        let current_answer = null;
        let seen_ts = q.createdTimestamp;
        let bond = null;
        const decimals = tokens[token].decimals;
        if (q.currentAnswerTimestamp && parseInt(q.currentAnswerTimestamp) > 0) {
            // console.log('q.currentAnswerTimestamp', q.currentAnswerTimestamp, 'gt', initial_ts);
            current_answer = rc_question.getAnswerString(question_json, q.currentAnswer);
            title = title + ' ' + current_answer;
            seen_ts = q.currentAnswerTimestamp;
            // console.log('bond', q.currentAnswerBond);
            bond = ethers.utils.formatUnits(q.currentAnswerBond, decimals).replace(/\.0+$/,'') + ' ' + token;
            title = title + ' ('+bond+')'
        } else if (q.bounty > 0) {
            const bounty = ethers.utils.formatUnits(q.bounty, decimals).replace(/\.0+$/,'') + ' ' + token;
            title = title + ' (pays '+bounty+')'
        }

        //console.log(url);

        if (ts < q.createdTimestamp) {
            ts = q.createdTimestamp;
            i = 0;
        }
        if (!title) {
            continue;
        }
        if ('errors' in question_json) {
            console.log('skipping question with errors', question_json['errors'])
            continue;
        }
        await tweetQuestion(title, url);
        updateStateFile(chain_id, seen_ts, i);
    }
}

function tweetQuestion(title, url) {

    if (title.length > MAX_TWEET) {
        title = title.slice(0, MAX_TWEET) + '...';
    }
    const T = new twit(TWITTER_CONFIG);

    const tweet = {
        status: title + ' ' + url
    };

    const tweeted = function(err, data, response) {
        if (err){
            console.log("Something went wrong!", err);
        } else{
            // console.log("Voila It worked!");
        }
    }

    T.post('statuses/update', tweet, tweeted)

}

function updateStateFile(chain_id, createdTimestamp, indexFromTimestamp) {
    const chain_state_file = './state/'+chain_id+'.json';
    const json = {
        'ts': createdTimestamp, 
        'index': indexFromTimestamp
    }
    fs.writeFileSync(chain_state_file, 
        JSON.stringify(json),    
        { encoding: "utf8", }
    );
}
