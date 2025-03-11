import { BskyAgent, AtpSessionEvent, AtpSessionData, RichText } from '@atproto/api';
import { TID } from '@atproto/common-web';

import { config } from 'dotenv';

const axios = require('axios')
const ethers = require('ethers');
const fs = require('fs');
const rc_contracts = require('@reality.eth/contracts');
const rc_question = require('@reality.eth/reality-eth-lib/formatters/question.js');
const rc_template = require('@reality.eth/reality-eth-lib/formatters/template.js');

const PER_QUERY = 20;
const MAX_TWEET = 260; // 300 - "Answer" (6) - 2 line returns (2) - hashtag (18) - some for luck

const SLEEP_SECS = 2; // How long to pause between runs

const chain_ids = process.argv[2].split(',');
const init = (process.argv.length > 3 && process.argv[3] == 'init');
const noop_arg = (process.argv.length > 3 && process.argv[3] == 'noop');
const NOOP = noop_arg; // || ('noop' in NEYNAR_CONFIG && NEYNAR_CONFIG['noop']);

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function fetchQuestionSkeetByRkey(agent, rkey) {
    // Ideally we would fetch for a post with the expected URL.
    // However, the search on the URL (or the tag) appears not to be working.
    // Instead, we will tag with a short tag which appears in the text.
    // We will then search for the short tag.
    // The short tag may collide with unrelated questions.
    // So we will loop through what we get and check the URL.
    const at_uri = "at://" + agent.session.did + "/app.bsky.feed.post/" + rkey;

    console.log('search with at uri', at_uri);
    // console.log('search for', title);
    const res = await agent.api.app.bsky.feed.getPosts({
      uris: [at_uri]
    });
    console.log('seach result', res.data);
    if (res.data.posts) {
      // console.log('result', res.data.posts);
      for (let i=0; i<res.data.posts.length; i++) {
        const post = res.data.posts[i];
        return post;
      }
    }
    console.log('no existing post found for ', rkey);
    return null;
}


async function fetchQuestionSkeet(agent, q_id, rkey, title) {
    // Ideally we would fetch for a post with the expected URL.
    // However, the search on the URL (or the tag) appears not to be working.
    // Instead, we will tag with a short tag which appears in the text.
    // We will then search for the short tag.
    // The short tag may collide with unrelated questions.
    // So we will loop through what we get and check the URL.
    console.log('search with short id is', rc_question.shortDisplayQuestionID(q_id));
    // console.log('search for', title);
      const res = await agent.api.app.bsky.feed.searchPosts({
        q: rc_question.shortDisplayQuestionID(q_id),
        //q: title,
        sort: 'top',
        author: agent.session.did,
        // url: q_url,
        // tag: ["1dbfe6c33236a9b1bc1ce5a1172e868446a411bc9c4d98ddd8fb4f4b560cf953"],
        // tag: q_id.slice(-64),
        limit: 2
      });
      // console.log('seach result', res.data);
      if (res.data.posts) {
        // console.log('result', res.data.posts);
        for (let i=0; i<res.data.posts.length; i++) {
          const post = res.data.posts[i];
           //console.log('got post', res.data.posts[i]);
          if (post.record && post.record.facets) {
             for (let j=0; j<post.record.facets.length; j++) {
                const features = res.data.posts[i].record.facets[j].features
                if (features && features.length) {
                  const link = features[0].uri;
                  //console.log('look for', q_id, 'in ', link);
                  if (link && link.toLowerCase().indexOf(q_id.toLowerCase()) !== -1){
                     console.log('found, returning data', res.data.posts[i]);
                     return res.data.posts[i];
                  }
                }
             }
          }
          // console.log(res.data.posts[i]);
        }
      }
    console.log('not found for ', q_id);
    return null;
}

async function skeet(agent, seen_ts, qid, rkey, txt, url, reply_to) {
// console.log('skeet reply_to is', reply_to);
  if (!agent.session) {
    throw new Error("no session, wtf");
  }

  const textEncoder = new TextEncoder();
  const main_length = textEncoder.encode(txt).length;
  if (main_length > MAX_TWEET) {
    throw new Error("title too long", txt);
  }

  const short_id = "#"+rc_question.shortDisplayQuestionID(qid);
  const link_txt = "⇒Answer";
  const answer_link_length = textEncoder.encode(link_txt).length;
  const facets = reply_to ? [] : [
    {
      index: {
        byteStart: main_length + 1 + short_id.length + 1,
        byteEnd: main_length + 1 + short_id.length + 2 + answer_link_length
      },
      features: [{
        $type: 'app.bsky.richtext.facet#link',
        uri: url
      }]
    },
    {
      index: {
        byteStart: main_length+1,
        byteEnd: main_length+1+short_id.length
      },
      features: [{
        $type: 'app.bsky.richtext.facet#tag',
        tag: qid.slice(-64)
      }]
    }
  ]
  if (!reply_to) {
    txt = txt + ' ' + short_id + "\n\n" + link_txt;
  }
  const rt = new RichText({ text: txt })
  if (rt.text.length >= 300) {
     console.log('too long', txt, rt);
  }
  //console.log('posting', rt);
  //await rt.detectFacets(agent) // automatically detects mentions and links

  let postRecord = {
    $type: 'app.bsky.feed.post',
    text: rt.text,
    createdAt: new Date(seen_ts*1000).toISOString(),
  }

  if (reply_to) {
    postRecord.reply = {
        "root": {
          "uri": reply_to.uri,
          "cid": reply_to.cid
        },
        "parent": {
          "uri": reply_to.uri,
          "cid": reply_to.cid
        }
    };
  } else {
    postRecord.facets = facets;
  }

  const res = await agent.com.atproto.repo.putRecord({
     repo: agent.accountDid,
     collection: 'app.bsky.feed.post',
     rkey: rkey,
     record: postRecord
  })
  console.log(res);

   /*
  const res = await agent.app.bsky.feed.post.create({
    repo: agent.session?.did,
  }, postRecord);
   */
  return res;
}

async function go() {
    config();
    const session_fn = './state/session.json';
    let agent = new BskyAgent({
      service: 'https://bsky.social',
      persistSession: (evt: AtpSessionEvent, sesh?: AtpSessionData) => {
	if (!sesh) {
	  console.log('no session');
	  return;
	}
	console.log('new login, storing session');
        fs.writeFileSync(session_fn, JSON.stringify(sesh), {encoding: "utf8"});
      }
    });
    const login_params = {
      identifier: process.env.BSKY_USERNAME as string,
      password: process.env.BSKY_PASS as string
    };
    if (fs.existsSync(session_fn)) {
      const sess = JSON.parse(fs.readFileSync(session_fn, {encoding: "utf8"}));
      await agent.resumeSession(sess);
    } else {
      await agent.login(login_params);
    }
    await handleChains(agent);
}

go();
export { }

function truncateStringByBytes(inputString, maxBytes) {
    const encoder = new TextEncoder();
    const byteArray = encoder.encode(inputString);

    if (byteArray.length <= maxBytes) {
        return inputString; // Return original string if within byte limit
    }

    const truncatedArray = byteArray.slice(0, maxBytes);
    const decoder = new TextDecoder();
    return decoder.decode(truncatedArray);
}

async function handleChains(agent) {
    if (NOOP) {
        console.log('Running with noop');
    }

    for(let ci=0; ci<chain_ids.length;ci++) {
        const chain_id = parseInt(chain_ids[ci]);
        if (chain_id) {
            console.log('processing chain', chain_id)
            processChain(agent, chain_id, init);
        } else {
            console.log('Could not parse chain ID, skipping:', chain_id);
        }
    }
}

async function processChain(agent, chain_id, init) {

    const lock_file_name = './state/'+chain_id+'.pid';
    if (fs.existsSync(lock_file_name)) {
        console.log("Skipping chain with process already running, delete pid file to force", chain_id);
        return;
    }
    fs.writeFileSync(lock_file_name, 
        ""+process.pid,
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

    if (!('graphURL' in chain_data)) {
        throw new Error("No graph URL found for chain", chain_id);
    }
    const graph_url = chain_data['graphURL'];

    // console.log(graph_url);

    const state_file_name_q = './state/question-'+chain_id+'.json';
    if (!fs.existsSync(state_file_name_q)) {
        if (!init) {
            console.log('No question state file for chain,', chain_id, 'run with init to create it');
            fs.unlinkSync(lock_file_name);
            return;
        }
        // No state file so initialize starting now
        const tsnow = parseInt(new Date().getTime()/1000);
        updateStateFile(chain_id, 'question', tsnow, 0);
    }

    const state_file_name_a = './state/answer-'+chain_id+'.json';
    if (!fs.existsSync(state_file_name_a)) {
        if (!init) {
            console.log('No answer state file for chain,', chain_id, 'run with init to create it');
            fs.unlinkSync(lock_file_name);
            return;
        }
        // No state file so initialize starting now
        const tsnow = parseInt(new Date().getTime()/1000);
        updateStateFile(chain_id, 'answer', tsnow, 0);
    }

    const question_state = require(state_file_name_q);
    const answer_state = require(state_file_name_a);
    // console.log(chain_state);
    let q_initial_ts = 0;
    if ('ts' in question_state) {
        q_initial_ts = question_state['ts'];
    }
    let a_initial_ts = 0;
    if ('ts' in answer_state) {
        a_initial_ts = answer_state['ts'];
    }

    await doQuery(agent, graph_url, chain_id, contract_tokens, tokens, q_initial_ts, a_initial_ts);

    fs.unlinkSync(lock_file_name);

}

async function calculateRkey(graph_url, chain_id, q_id) {

    let where = `question: "${q_id}", actionType: "AskQuestion"`;

    const query = `
      {
        userActions(orderBy: createdTimestamp, orderDirection: asc, first: 1,  where: { ${where} }) {
            id,
            question {
                createdTimestamp,
            }
        }
      }
    `

    const qres = await axios.post(graph_url, {
      query: query 
    })

    if (qres.data.errors) {
       console.log(qres.data.errors);
    }
    const userActions = qres.data.data.userActions;

    // console.log('res', res.data);
    for (const ua of userActions) {
        const uaID = ua.id;
        const bits = uaID.split('-');
        const logIndex = bits[1];
        const rkey_ts = ua.question.createdTimestamp*1000000 + parseInt(logIndex);
        const rkey_clock_identifier = rc_contracts.realityETH10BitChainID(chain_id);
        // console.log("make rkey sith ", rkey_ts, rkey_clock_identifier);
        const rkey = TID.fromTime(rkey_ts, rkey_clock_identifier)['str'];
        // console.log("made rkey", rkey);
        return rkey;
    }

}

async function handleQuestionBatch(agent, graph_url, chain_id, contract_tokens, tokens, initial_ts, q_id) {

    let q_created = {};

    // Fetch the next range, unless we got a specific id
    let where = q_id ? `question: "${q_id}"` : `createdTimestamp_gt: ${initial_ts}`; 
    where = where + ', actionType: "AskQuestion"'

    const query = `
      {
        userActions(orderBy: createdTimestamp, orderDirection: asc, first: ${PER_QUERY},  where: { ${where} }) {
            id,
            question {
                id,
                createdTimestamp,
                user,
                qCategory,
                contract,
                data,
                bounty,
                currentAnswer,
                currentAnswerTimestamp,
                currentAnswerBond,
                template {
                    questionText
                }
            }
      }
      }
    `

    const qres = await axios.post(graph_url, {
      query: query 
    })
    // console.log(query);

    if (qres.data.errors) {
       console.log(qres.data.errors);
    }
    const userActions = qres.data.data.userActions;

    // console.log('res', res.data);
    let i = 0;
    let ts = 0;
    for (const ua of userActions) {
        i++;
        const uaID = ua.id;
        const bits = uaID.split('-');
        const logIndex = bits[1];
        //console.log('made index', uaID, logIndex);
        const q = ua.question;
        //console.log(q)
        const contract = q.contract;
        const id = q.id;
        const data = q.data;
        const template_text = q.template.questionText;
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
        if (q.bounty > 0) {
            const bounty = ethers.formatUnits(q.bounty, decimals).replace(/\.0+$/,'') + ' ' + token;
            bounty_txt = '(pays '+bounty+')'
        }

        // console.log('made msg id ', rkey);
        //console.log(url);

        if (ts < q.createdTimestamp) {
            ts = q.createdTimestamp;
            i = 0;
        }

        const rkey_ts = q.createdTimestamp*1000000 + parseInt(logIndex);
        const rkey_clock_identifier = rc_contracts.realityETH10BitChainID(chain_id);
        // console.log("make rkey sith ", rkey_ts, rkey_clock_identifier);
        const rkey = TID.fromTime(rkey_ts, rkey_clock_identifier)['str'];
        // console.log("made rkey", rkey);
        

        if (!title) {
            updateStateFile(chain_id, 'question', seen_ts, i);
            continue;
        }
        if ('errors' in question_json) {
            console.log('skipping question with errors', question_json['errors'], contract, template_text)
            updateStateFile(chain_id, 'question', seen_ts, i);
            continue;
        }

        const existing = await fetchQuestionSkeetByRkey(agent, rkey);
        if (existing) {
            console.log('question already found, skipping');
            updateStateFile(chain_id, 'question', seen_ts, i);
            continue;
        }

        const response = await tweetQuestion(agent, rkey, id, seen_ts, title, bounty_txt, q.qCategory, q.user, url);
        q_created[id] = response.data;
        
        updateStateFile(chain_id, 'question', seen_ts, i);
        await sleep(SLEEP_SECS*1000);
    }

    //console.log('q_created', q_created);
    return q_created;

}

async function handleAnswerBatch(agent, graph_url, chain_id, contract_tokens, tokens, initial_ts) {

    // TODO: Filter to unrevealed
    const ares = await axios.post(graph_url, {
      query: `
      {
        userActions(orderBy: createdTimestamp, orderDirection: asc, first: ${PER_QUERY},  where: {actionType: "AnswerQuestion", createdTimestamp_gt: ${initial_ts} }) {
            id,
            question {
                id,
                contract,
                data,
                template {
                    questionText
                }
            },
            response {
                id,
                user,
                timestamp,
                answer,
                bond
            }
        }
      }
    `
    })

    // console.log('ares', ares.data.errors);
    const answers = ares.data.data.userActions;

    // console.log('ares', answers);
    let ai = 0;
    for (const a of answers) {
console.log("answer entry", a);
        ai++;
        //console.log(q)
        const q = a.question;
        const ur = a.response;
        const contract = q.contract;
        const id = q.id;
        const data = q.data;
        const template_text = q.template.questionText;
        let question_json;
        let ts = 0;
        try {
            question_json = rc_question.populatedJSONForTemplate(template_text, data, true);
        } catch (e) {
            console.log('parse failure, skipping');
            continue;
        }
        let title = question_json['title'];

        const token = contract_tokens[contract.toLowerCase()];
        const url = 'https://reality.eth.link/app/#!/network/'+chain_id+'/contract/'+contract+'/token/'+token+'/question/'+id;

        let seen_ts = q.createdTimestamp;
        let bond_txt = '';
        let bounty_txt = '';
        let answer_txt = '';
        const decimals = tokens[token].decimals;
        // console.log('q.currentAnswerTimestamp', q.currentAnswerTimestamp, 'gt', initial_ts);
        answer_txt = rc_question.getAnswerString(question_json, ur.answer);
        seen_ts = ur.timestamp
        // console.log('bond', q.currentAnswerBond);
        const bond = ethers.formatUnits(ur.bond, decimals).replace(/\.0+$/,'') + ' ' + token;
        bond_txt = '('+bond+')';

        //const bounty = ethers.formatUnits(q.bounty, decimals).replace(/\.0+$/,'') + ' ' + token;
        // bounty_txt = '(pays '+bounty+')'

        let qid = id;
        /*
        if (q.currentAnswerTimestamp) {
            msg_id = msg_id + '-' + q.currentAnswerTimestamp;
        }
        //console.log('made msg id ', msg_id);
        */

        //console.log(url);

        if (ts < ur.timestamp) {
            ts = ur.timestamp;
            ai = 0;
        }
        if (!title) {
            continue;
        }
        if ('errors' in question_json) {
            console.log('skipping question with errors', question_json['errors'], contract, template_text)
            continue;
        }

        const question_rkey = await calculateRkey(graph_url, chain_id, id);
        let reply_to = await fetchQuestionSkeetByRkey(agent, question_rkey);
        if (!reply_to) {
            console.log('question not found when handling answer, trying to create it', id);
            // Create just this question so we can answer it
            const created = await handleQuestionBatch(agent, graph_url, chain_id, contract_tokens, tokens, initial_ts, id);
            if (created[id]) {
                reply_to = created[id];
                // console.log('created', created);
                // console.log('made reply_to', reply_to);
            } else {
                console.log('question not found and creation failed, skipping');
                continue;
            }
        } else {
         //  console.log('found reply_to', reply_to);
        }
        let user = ur.user;

        const uaID = a.id;
        const bits = uaID.split('-');
        const logIndex = bits[1];
        const rkey_ts = ur.timestamp*1000000 + parseInt(logIndex);
        //const rkey_ts = q.createdTimestamp*1000000 + parseInt(logIndex);
        const rkey_clock_identifier = rc_contracts.realityETH10BitChainID(chain_id);
        console.log("make rkey sith ", rkey_ts, rkey_clock_identifier);
        const rkey = TID.fromTime(rkey_ts, rkey_clock_identifier)['str'];

        await tweetResponse(agent, rkey, id, seen_ts, bond_txt, answer_txt, user, reply_to);
        updateStateFile(chain_id, 'answer', seen_ts, ai);
    }

}

async function doQuery(agent, graph_url, chain_id, contract_tokens, tokens, q_initial_ts, a_initial_ts) {

    await handleQuestionBatch(agent, graph_url, chain_id, contract_tokens, tokens, q_initial_ts);
    await handleAnswerBatch(agent, graph_url, chain_id, contract_tokens, tokens, a_initial_ts);
   
}

async function tweetResponse(agent, rkey, qid, seen_ts, bond_txt, answer_txt, user, reply_to) {

    // See if we can do the whole thing without trimming
    let tweet = answer_txt;
    let available = MAX_TWEET - bond_txt.length - 2;

    const textEncoder = new TextEncoder();
    const tweet_length = textEncoder.encode(tweet).length;

    if (tweet_length > available) {
        tweet = truncateStringByBytes(tweet, available-3) + '...';
    }

    tweet = tweet + ' ' + bond_txt;

    if (NOOP) {
        console.log(tweet);
        return;
    }

    const response = await skeet(agent, seen_ts, qid, rkey, tweet, null, reply_to);
    return response;
}


async function tweetQuestion(agent, rkey, qid, seen_ts, title, bounty_txt, category, creator, url) {

    if (title == '') {
        console.log('no title, skipping');
        return null;
    }

    // See if we can do the whole thing without trimming
    const textEncoder = new TextEncoder();
    let title_length = textEncoder.encode(title).length;
    let bounty_length = textEncoder.encode(bounty_txt).length;
    let total_length = title_length + bounty_length;
    if (bounty_length) {
        total_length = title_length + 1 + bounty_length;
    }

    if (total_length > MAX_TWEET) {

        let chars_remain = MAX_TWEET - bounty_length - 1;

        // Now trim the title to whatever we have left
        title = truncateStringByBytes(title, chars_remain-3) + '...';

        /*
        if (end_part == '') {
            str = title;
        } else {
            str = title + ' ' + end_part;
        }
        */

	/*
        if (category && category != '' && category != 'undefined') {
            str = str + ' #'+category.replace(' ','_');
        }

        if (creator && creator != '' && creator != 'undefined') {
            str = str + ' #'+creator.replace(' ','');
        }
        */

    }

    //const tweet = str + ' ' + url;
    const tweet = title + ' ' + bounty_txt;

    if (NOOP) {
        console.log(tweet);
        return;
    }

    const response = await skeet(agent, seen_ts, qid, rkey, tweet, url);
    return response;
}

function updateStateFile(chain_id, section, createdTimestamp, indexFromTimestamp) {
    const chain_state_file = './state/'+section+'-'+chain_id+'.json';
    const json = {
        'ts': createdTimestamp, 
        'index': indexFromTimestamp
    }
    fs.writeFileSync(chain_state_file, 
        JSON.stringify(json),    
        { encoding: "utf8", }
    );
}


