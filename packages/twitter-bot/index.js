const axios = require('axios')
const twit = require('twit')
const ethers = require('ethers');
const fs = require('fs');
const rc_contracts = require('@reality.eth/contracts');
const rc_question = require('@reality.eth/reality-eth-lib/formatters/question.js');
const rc_template = require('@reality.eth/reality-eth-lib/formatters/template.js');

const PER_QUERY = 100;
const MAX_TWEET = 180;

const SLEEP_SECS = 10; // How long to pause between runs

const TWITTER_CONFIG = require('./secrets/config.json');

const chain_ids = process.argv[2].split(',');
const init = (process.argv.length > 3 && process.argv[3] == 'init');
const NOOP = ('noop' in TWITTER_CONFIG && TWITTER_CONFIG['noop']);

let ALL_TEMPLATES = {};

if (NOOP) {
    console.log('Running with noop');
}

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

async function templateTextWithCache(graph_url, contract, template_id) {
    // console.log('look for', contract, template_id);
    if (!ALL_TEMPLATES[contract] || !ALL_TEMPLATES[contract][''+template_id]) {
        const template_res = await axios.post(graph_url, {
          query: `
          {
            templates(orderBy: id, orderDirection: asc, where: { contract: "${contract}", templateId: ${template_id} }) {
                id,
                contract,
                templateId,
                question_text
            }
          }
        `
        })
        for(const t of template_res.data.data.templates) {
            const tid = parseInt(t.templateId);
            // console.log('populate ', contract, template_id, tid, t);
            const tcontract = t.contract.toLowerCase();
            if (!ALL_TEMPLATES[tcontract]) {
                ALL_TEMPLATES[tcontract] = {};
            }
            ALL_TEMPLATES[tcontract][''+tid] = t.question_text;
        }
    }

    if (!ALL_TEMPLATES[contract][''+template_id]) {
        console.log('wtf, template not found after fetch', contract, template_id)
    }
    return ALL_TEMPLATES[contract][''+template_id];
}

async function doQuery(graph_url, chain_id, contract_tokens, tokens, initial_ts) {

    /*
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    await sleep(10000);
    */

    // Start with an initial fill for the most common (lowest-id) templates.
    // The pager will cut the rest off, and we'll fetch them when we need them.
    const template_res = await axios.post(graph_url, {
      query: `
      {
        templates(orderBy: templateId, orderDirection: asc) {
            id,
            contract,
            templateId,
            question_text
        }
      }
    `
    })

    for(const t of template_res.data.data.templates) {
        const tid = parseInt(t.templateId);
        const tcontract = t.contract.toLowerCase();
        if (!ALL_TEMPLATES[tcontract]) {
            ALL_TEMPLATES[tcontract] = {};
        }
        ALL_TEMPLATES[tcontract][''+tid] = t.question_text;
    }
//console.log('ALL_TEMPLATES', ALL_TEMPLATES);

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
        //console.log(q)
        const contract = q.contract;
        const id = q.id;
        const data = q.data;
        const template_id = ''+q.templateId;
        const template_text = await templateTextWithCache(graph_url, contract.toLowerCase(), template_id);
        let question_json;
        try {
            question_json = rc_question.populatedJSONForTemplate(template_text, data, true);
        } catch (e) {
            console.log('parse failure, skipping');
            continue;
        }
        const token = contract_tokens[contract.toLowerCase()];
        let title = question_json['title'];
        const url = 'https://reality.eth.link/app/#!/network/'+chain_id+'/contract/'+contract+'/token/'+token+'/question/'+id;

        let current_answer = null;
        let seen_ts = q.createdTimestamp;
        let bond_txt = '';
        let bounty_txt = '';
        let current_answer_txt = '';
        const decimals = tokens[token].decimals;
        if (q.currentAnswerTimestamp && parseInt(q.currentAnswerTimestamp) > 0) {
            // console.log('q.currentAnswerTimestamp', q.currentAnswerTimestamp, 'gt', initial_ts);
            current_answer_txt = rc_question.getAnswerString(question_json, q.currentAnswer);
            seen_ts = q.currentAnswerTimestamp;
            // console.log('bond', q.currentAnswerBond);
            bond = ethers.utils.formatUnits(q.currentAnswerBond, decimals).replace(/\.0+$/,'') + ' ' + token;
            bond_txt = '('+bond+')';
        } else if (q.bounty > 0) {
            const bounty = ethers.utils.formatUnits(q.bounty, decimals).replace(/\.0+$/,'') + ' ' + token;
            bounty_txt = '(pays '+bounty+')'
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
            console.log('skipping question with errors', question_json['errors'], contract, template_id, template_text)
            continue;
        }
        await tweetQuestion(title, bond_txt, bounty_txt, current_answer_txt, url);
        updateStateFile(chain_id, seen_ts, i);
    }
}

function tweetQuestion(title, bond_txt, bounty_txt, answer_txt, url) {

    // See if we can do the whole thing without trimming
    let str = title;
    if (bounty_txt != '') {
        str = str + ' ' + bounty_txt;
    }
    if (answer_txt != '') {
        str = str + ' ' + answer_txt;
    }
    if (bond_txt != '') {
        str = str + ' ' + bond_txt;
    }

    if (str.length > MAX_TWEET) {

        str = '';

        // Try to keep the answer, but truncate it if we need to
        if (answer_txt.length > 20) {
            answer_txt = answer_txt.slice(0, 20) + '...';
        }

        let end_part = answer_txt;
        
        if (bond_txt != '') {
            end_part = end_part + ' ' + bond_txt;
        }
        
        if (bounty_txt != '') {
            end_part = bounty_txt + ' ' + end_part;
        }

        // Now trim the title to whatever we have left
        const chars_remain = MAX_TWEET - end_part.length;
        if (title.length > chars_remain) {
            title = title.slice(0, chars_remain) + '...';
        }

        if (end_part == '') {
            str = title;
        } else {
            str = title + ' ' + end_part;
        }
    }

    const tweet = {
        status: str + ' ' + url
    };

    if (NOOP) {
        console.log(tweet);
        return;
    }

    const T = new twit(TWITTER_CONFIG);

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
