window.RealityGuide = window.RealityGuide || {};

const _GUIDES = [
  {
    id: 'snapshot',
    icon: '🗳️',
    name: 'Snapshot DAO Voting',
    subtitle: 'Execute on-chain transactions when a Snapshot vote passes, using the Zodiac Reality Module.',
    desc: 'Execute Safe transactions from Snapshot votes',
    sections: [
      {
        title: 'How it works',
        body: `<p>Snapshot votes are off-chain — cheap and gasless, but not automatically enforceable on-chain. The Zodiac Reality Module bridges the gap: it watches for a Snapshot proposal to pass, then asks reality.eth whether it did. If the question finalises <em>Yes</em> without a successful challenge, anyone can trigger execution of the queued Safe transactions.</p>
        <p>Each Gnosis Safe that uses this pattern has its own Reality Module instance, which is why Snapshot appears under many different creator contract addresses in the question index.</p>`
      },
      {
        title: 'Architecture',
        body: `<p>The flow has four actors:</p>
        <ul>
          <li><strong>Snapshot space</strong> — Off-chain governance. Proposals include a batch of Safe transactions in their metadata.</li>
          <li><strong>Proposer</strong> — Once a vote passes, calls <code>addProposal()</code> on the Reality Module, which creates the reality.eth question.</li>
          <li><strong>Answerers</strong> — Bond-backed community members who answer the question Yes/No.</li>
          <li><strong>Reality Module</strong> — After the question finalises Yes, any caller can trigger <code>executeProposal()</code>, which reads <code>resultFor()</code> and, if confirmed, dispatches the transactions through the Safe.</li>
        </ul>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Deploy a Gnosis Safe',
            body: `<p>Create a Gnosis Safe multisig at <a href="https://app.safe.global" target="_blank" rel="noopener">app.safe.global</a> with your team's signers. This Safe will hold treasury funds and execute the on-chain effects of governance votes.</p>`
          },
          {
            title: 'Install the Zodiac Reality Module',
            body: `<p>From the Safe's Apps section, install <strong>Zodiac</strong> and add a Reality Module. Configure it with:</p>
            <ul>
              <li><strong>Reality.eth contract</strong> — the address for your chain (e.g. <code>0xE78996A233895bE74a66F451f1019cA9734205cc</code> on Gnosis Chain)</li>
              <li><strong>Arbitrator</strong> — typically Kleros, for dispute resolution</li>
              <li><strong>Timeout</strong> — how long an answer must stand unchallenged (e.g. 24 hours)</li>
              <li><strong>Cooldown</strong> — delay after finalisation before execution is allowed</li>
              <li><strong>Expiration</strong> — how long after cooldown the proposal can still be executed</li>
            </ul>`,
            code: { lang: 'Solidity', body: `<span class="cm">// Reality Module reads the question result like this:</span>
<span class="kw">bytes32</span> answer = realityEth.<span class="fn">getFinalAnswerIfMatches</span>(
    questionId,
    contentHash,   <span class="cm">// keccak of (template_id, opening_ts, question_string)</span>
    arbitrator,
    minTimeout,
    minBond
);
<span class="cm">// answer == bytes32(1) means YES</span>` }
          },
          {
            title: 'Connect your Snapshot space',
            body: `<p>In your Snapshot space settings, add the <strong>SafeSnap</strong> plugin. Enter the chain ID and the address of your Reality Module. From now on, proposal authors can attach transaction batches to their proposals.</p>`
          },
          {
            title: 'Understand the auto-created question',
            body: `<p>When a vote passes and a proposer calls <code>addProposal()</code>, the module creates a reality.eth question for each transaction batch index. The question text follows this template:</p>`,
            code: { lang: 'Question text', body: `Did the Snapshot proposal with the id {proposalId}
pass the execution of the transaction batch
with index {index} on {network}?
The proposal and transactions can be found at {url}.` }
          },
          {
            title: 'Community answers and disputes',
            body: `<p>Anyone can submit a bonded answer. If the proposal genuinely passed the vote, honest answerers will post <em>Yes</em>. If a malicious actor posts the wrong answer, it can be disputed by someone who bonds twice as much. If no one disputes within the timeout, the answer finalises.</p>
            <p>If a dispute is raised and can't be resolved by bonds alone, the arbitrator (e.g. Kleros) is invoked for a binding ruling.</p>`
          },
          {
            title: 'Execute the proposal',
            body: `<p>Once the question finalises <em>Yes</em> and the cooldown has passed, call <code>executeProposal()</code> on the Reality Module. It calls <code>resultFor(questionId)</code> internally and, if the result is Yes, dispatches the Safe transactions.</p>`,
            code: { lang: 'Solidity (module interface)', body: `<span class="kw">function</span> <span class="fn">executeProposal</span>(
    <span class="ty">string</span> memory proposalId,
    <span class="ty">bytes32</span>[] memory txHashes
) <span class="kw">external</span>;` }
          }
        ]
      },
      {
        title: 'Further reading',
        body: `<ul>
          <li><a href="https://github.com/gnosis/zodiac-module-reality" target="_blank" rel="noopener">Zodiac Reality Module source code</a></li>
          <li><a href="https://docs.snapshot.org/user-guides/plugins/safesnap" target="_blank" rel="noopener">SafeSnap plugin docs (Snapshot)</a></li>
        </ul>`
      }
    ]
  },

  {
    id: 'event-oracle',
    icon: '⚽',
    name: 'Event Result Oracle',
    subtitle: 'Report real-world event outcomes on-chain with bond-backed dispute resolution — the pattern used by Sports Oracle and similar integrations.',
    desc: 'Ask & answer questions about real-world events',
    sections: [
      {
        title: 'How it works',
        body: `<p>A trusted operator creates a question on reality.eth for each real-world event before it happens, then submits the result when it does. Because the bond doubles with each competing answer, a wrong result can always be corrected by someone willing to post a higher bond — the honesty cost is lower than the correction reward.</p>
        <p>Sports Oracle deploys a separate creator contract per sport/league, which is why all its questions share a known creator address in the question index.</p>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Choose a question template',
            body: `<p>Built-in template 2 (<em>single-select</em>) suits most event oracles. For a football match you might use:</p>`,
            code: { lang: 'Template JSON', body: `{
  "title": "Who won the match %s?",
  "type": "single-select",
  "outcomes": [%s],
  "category": "sports",
  "lang": "en"
}` }
          },
          {
            title: 'Deploy a creator contract',
            body: `<p>Deploying your questions from a dedicated contract gives your integration a stable, identifiable creator address. The contract calls <code>askQuestionWithMinBond()</code> for each event:</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">interface</span> <span class="ty">IRealityETH</span> {
    <span class="kw">function</span> <span class="fn">askQuestionWithMinBond</span>(
        <span class="ty">uint256</span> templateId,
        <span class="ty">string</span> <span class="kw">calldata</span> question,
        <span class="ty">address</span> arbitrator,
        <span class="ty">uint32</span>  timeout,
        <span class="ty">uint32</span>  openingTs,
        <span class="ty">uint256</span> nonce,
        <span class="ty">uint256</span> minBond
    ) <span class="kw">external payable returns</span> (<span class="ty">bytes32</span>);
}

<span class="kw">contract</span> <span class="ty">SportsOracle</span> {
    <span class="ty">IRealityETH</span> <span class="kw">public immutable</span> reality;
    <span class="ty">address</span>     <span class="kw">public immutable</span> arbitrator;

    <span class="kw">event</span> <span class="fn">QuestionAsked</span>(<span class="ty">bytes32</span> questionId, <span class="ty">string</span> matchDesc);

    <span class="kw">constructor</span>(<span class="ty">address</span> _reality, <span class="ty">address</span> _arb) {
        reality    = <span class="ty">IRealityETH</span>(_reality);
        arbitrator = _arb;
    }

    <span class="kw">function</span> <span class="fn">createMatchQuestion</span>(
        <span class="ty">string</span> <span class="kw">calldata</span> matchDesc,
        <span class="ty">string</span> <span class="kw">calldata</span> outcomesJson, <span class="cm">// e.g. '"Team A","Team B","Draw"'</span>
        <span class="ty">uint32</span>  kickoff,
        <span class="ty">uint256</span> nonce
    ) <span class="kw">external returns</span> (<span class="ty">bytes32</span> questionId) {
        <span class="ty">string</span> <span class="kw">memory</span> q = <span class="ty">string</span>.<span class="fn">concat</span>(matchDesc, <span class="str">"␟"</span>, outcomesJson);
        questionId = reality.<span class="fn">askQuestionWithMinBond</span>(
            <span class="num">2</span>,           <span class="cm">// template: single-select</span>
            q,
            arbitrator,
            <span class="num">86400</span>,       <span class="cm">// 24-hour dispute window</span>
            kickoff,     <span class="cm">// question opens at kickoff time</span>
            nonce,
            <span class="num">1e16</span>         <span class="cm">// 0.01 ETH minimum bond</span>
        );
        <span class="kw">emit</span> <span class="fn">QuestionAsked</span>(questionId, matchDesc);
    }
}` }
          },
          {
            title: 'Submit results',
            body: `<p>When the match ends, your backend submits the result. The answer for a single-select question is the zero-based index of the winning outcome, encoded as a 32-byte value:</p>`,
            code: { lang: 'JavaScript (ethers.js)', body: `<span class="kw">const</span> reality = <span class="kw">new</span> ethers.<span class="fn">Contract</span>(REALITY_ADDRESS, ABI, signer);

<span class="cm">// "Team A" is outcome index 0</span>
<span class="kw">const</span> answer = ethers.utils.<span class="fn">hexZeroPad</span>(ethers.BigNumber.<span class="fn">from</span>(<span class="num">0</span>), <span class="num">32</span>);

<span class="kw">await</span> reality.<span class="fn">submitAnswer</span>(
    questionId,
    answer,
    <span class="num">0</span>,   <span class="cm">// max_previous: 0 means "no existing bond to protect"</span>
    { value: ethers.utils.<span class="fn">parseEther</span>(<span class="str">"0.01"</span>) }
);` }
          },
          {
            title: 'Read the result in your consumer',
            body: `<p>Any contract that needs the result calls <code>resultFor()</code>, which reverts if the question hasn't finalised yet:</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">bytes32</span> result = reality.<span class="fn">resultFor</span>(questionId);
<span class="ty">uint256</span> winnerIdx = <span class="ty">uint256</span>(result);
<span class="cm">// 0 = Team A, 1 = Team B, 2 = Draw</span>` }
          },
          {
            title: 'Handle disputes and "answered too soon"',
            body: `<p>If your event is cancelled or postponed, the correct answer is <em>Answered Too Soon</em> (<code>0xffff...fe</code>). Your consumer should call <code>isSettledTooSoon()</code> and, if so, use <code>reopenQuestion()</code> to ask again for the rescheduled date.</p>`
          }
        ]
      }
    ]
  },

  {
    id: 'hash-commit-oracle',
    icon: '🏆',
    name: 'Hash-Commit Oracle',
    subtitle: 'Commit a compact hash of complex off-chain results on-chain, then let consumers verify against it — the pattern used by Fantasy Sports.',
    desc: 'Commit encoded result hashes for complex data',
    sections: [
      {
        title: 'How it works',
        body: `<p>When a result set is too large or complex to publish on-chain directly (e.g. scores for hundreds of players), you instead publish a <em>hash commitment</em>: the keccak256 of the encoded result data. Anyone who has the raw data can verify the hash. Disputes challenge the hash itself, not the individual scores.</p>
        <p>Fantasy Sports uses reality.eth template 120 for this, which produces a <code>hash</code>-type question. The answer is a bytes32 value that everyone can verify by computing <code>keccak256(abi.encode(results))</code> themselves.</p>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Define your result encoding',
            body: `<p>Choose a canonical ABI encoding for your results. Document it publicly so that anyone can recompute the hash. For example, for a fantasy league round you might encode an array of (playerId, points) structs:</p>`,
            code: { lang: 'Solidity', body: `<span class="cm">// Canonical encoding — publish this spec openly</span>
<span class="kw">bytes32</span> resultsHash = <span class="fn">keccak256</span>(<span class="fn">abi.encode</span>(
    playerIds,   <span class="cm">// uint256[]</span>
    scores       <span class="cm">// uint256[]</span>
));` }
          },
          {
            title: 'Create a hash-type template',
            body: `<p>Register a template on reality.eth with <code>"type": "hash"</code>:</p>`,
            code: { lang: 'JavaScript (ethers.js)', body: `<span class="kw">const</span> templateJson = JSON.<span class="fn">stringify</span>({
    title: <span class="str">"What hash represents the results of league %s round %s?"</span>,
    type:  <span class="str">"hash"</span>,
    category: <span class="str">"fantasy-sports"</span>,
    lang: <span class="str">"en"</span>
});
<span class="kw">const</span> tx = <span class="kw">await</span> reality.<span class="fn">createTemplate</span>(templateJson);
<span class="kw">const</span> receipt = <span class="kw">await</span> tx.<span class="fn">wait</span>();
<span class="cm">// template ID is in LogNewTemplate event</span>` }
          },
          {
            title: 'Ask the question before the round starts',
            body: `<p>Create the question from your oracle contract, with the opening timestamp set to after the round ends:</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">bytes32</span> questionId = reality.<span class="fn">askQuestionWithMinBond</span>(
    TEMPLATE_ID,
    <span class="ty">string</span>.<span class="fn">concat</span>(leagueId, <span class="str">"␟"</span>, roundId),
    arbitrator,
    <span class="num">86400</span>,      <span class="cm">// 24h dispute window</span>
    roundEndTs,  <span class="cm">// opens when round ends</span>
    nonce,
    MIN_BOND
);` }
          },
          {
            title: 'Submit the results hash',
            body: `<p>After the round ends, compute the hash off-chain and submit it as the answer. The answer is just the bytes32 hash value:</p>`,
            code: { lang: 'JavaScript', body: `<span class="kw">const</span> resultsHash = ethers.utils.<span class="fn">keccak256</span>(
    ethers.utils.<span class="fn">defaultAbiCoder</span>.<span class="fn">encode</span>(
        [<span class="str">"uint256[]"</span>, <span class="str">"uint256[]"</span>],
        [playerIds, scores]
    )
);
<span class="kw">await</span> reality.<span class="fn">submitAnswer</span>(questionId, resultsHash, <span class="num">0</span>, {
    value: MIN_BOND
});` }
          },
          {
            title: 'Verify in consumer contracts',
            body: `<p>Your consumer reads the finalised hash and verifies the results the user supplies match it:</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">function</span> <span class="fn">claimPrize</span>(
    <span class="ty">bytes32</span>   questionId,
    <span class="ty">uint256[]</span> <span class="kw">calldata</span> playerIds,
    <span class="ty">uint256[]</span> <span class="kw">calldata</span> scores
) <span class="kw">external</span> {
    <span class="ty">bytes32</span> committed = reality.<span class="fn">resultFor</span>(questionId);
    <span class="ty">bytes32</span> supplied  = <span class="fn">keccak256</span>(<span class="fn">abi.encode</span>(playerIds, scores));
    <span class="kw">require</span>(committed == supplied, <span class="str">"results mismatch"</span>);
    <span class="cm">// calculate winnings from scores...</span>
}` }
          }
        ]
      }
    ]
  },

  {
    id: 'prediction-market',
    icon: '📈',
    name: 'Prediction Market',
    subtitle: 'Let users buy and sell outcome tokens for a question, with automatic settlement once reality.eth finalises — the pattern used by Seer.',
    desc: 'Create token markets that settle via reality.eth',
    sections: [
      {
        title: 'How it works',
        body: `<p>A prediction market mints two (or more) outcome tokens — one per possible answer. Traders buy and sell these tokens on a market. When the reality.eth question finalises, token holders can redeem winners for a share of the prize pool and losers become worthless.</p>
        <p>Seer uses the Gnosis Conditional Tokens Framework (CTF) as the token layer, with reality.eth as the resolution layer.</p>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Ask the question on reality.eth',
            body: `<p>Create a reality.eth question for each market. Use a boolean or single-select template:</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">bytes32</span> questionId = reality.<span class="fn">askQuestionWithMinBond</span>(
    <span class="num">0</span>,             <span class="cm">// template 0: bool (Yes/No)</span>
    questionText,  <span class="cm">// e.g. "Will ETH exceed $5000 by Dec 31 2025?"</span>
    arbitrator,
    timeout,
    openingTs,
    nonce,
    minBond
);` }
          },
          {
            title: 'Create a condition in the CTF',
            body: `<p>Register a Conditional Tokens condition. The <em>condition ID</em> ties a CTF position to a specific reality.eth question and oracle:</p>`,
            code: { lang: 'Solidity', body: `<span class="cm">// Gnosis CTF address (same on all chains)</span>
<span class="ty">IConditionalTokens</span> ctf = <span class="ty">IConditionalTokens</span>(<span class="str">0x...</span>);

ctf.<span class="fn">prepareCondition</span>(
    address(<span class="kw">this</span>),  <span class="cm">// your contract is the oracle</span>
    questionId,    <span class="cm">// used as conditionId input</span>
    <span class="num">2</span>             <span class="cm">// 2 outcomes: No, Yes</span>
);` }
          },
          {
            title: 'Collect collateral and mint outcome tokens',
            body: `<p>Users deposit collateral (e.g. xDAI) and receive a set of outcome tokens (one per possible answer). An AMM or order book lets them trade these tokens before resolution.</p>`
          },
          {
            title: 'Resolve after finalisation',
            body: `<p>Once the reality.eth question finalises, your contract reads the result and reports it to the CTF:</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">function</span> <span class="fn">resolve</span>(<span class="ty">bytes32</span> questionId) <span class="kw">external</span> {
    <span class="ty">bytes32</span> result = reality.<span class="fn">resultFor</span>(questionId);
    <span class="cm">// For bool: result == bytes32(1) → YES wins (index 1)</span>
    <span class="ty">uint256</span> winIdx = <span class="ty">uint256</span>(result);

    <span class="ty">uint256[]</span> <span class="kw">memory</span> payouts = <span class="kw">new</span> <span class="ty">uint256</span>[](<span class="num">2</span>);
    payouts[winIdx] = <span class="num">1</span>;  <span class="cm">// all collateral to winners</span>

    ctf.<span class="fn">reportPayouts</span>(questionId, payouts);
}` }
          },
          {
            title: 'Redeem winning tokens',
            body: `<p>After resolution, holders of the winning outcome token call <code>redeemPositions()</code> on the CTF to receive their share of the collateral pool.</p>`
          }
        ]
      },
      {
        title: 'Further reading',
        body: `<ul>
          <li><a href="https://github.com/gnosis/conditional-tokens-contracts" target="_blank" rel="noopener">Gnosis Conditional Tokens Framework</a></li>
          <li><a href="https://seer.pm" target="_blank" rel="noopener">Seer — prediction markets on Gnosis Chain</a></li>
        </ul>`
      }
    ]
  },

  {
    id: 'content-moderation',
    icon: '🛡️',
    name: 'Content Moderation',
    subtitle: 'Let a decentralised crowd decide whether community content violates rules, with Kleros as backstop arbitrator — the pattern used by Kleros Moderate.',
    desc: 'Decentralised dispute resolution for communities',
    sections: [
      {
        title: 'How it works',
        body: `<p>When a moderator flags a piece of content, a reality.eth question is asked: "Did this content violate the rules?" Community members bond ETH for Yes or No. If the stakes are high enough that the outcome is disputed, Kleros jurors render a binding ruling.</p>
        <p>Kleros Moderate deploys dedicated creator contracts per community, so all questions from the same group share an identifiable on-chain origin.</p>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Design your moderation question template',
            body: `<p>Create a template with <code>"type": "bool"</code> that encodes the content reference and the rule being adjudicated:</p>`,
            code: { lang: 'Template JSON', body: `{
  "title": "Did the following message in %s violate rule: %s? Message: %s",
  "type": "bool",
  "category": "moderation",
  "lang": "en"
}` }
          },
          {
            title: 'Ask a question for each dispute',
            body: `<p>Your moderation contract asks a question when content is flagged. Set a short timeout (e.g. 1 hour) so decisions are fast, but use Kleros as arbitrator so disputes get a full jury review:</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">function</span> <span class="fn">flagContent</span>(
    <span class="ty">string</span> <span class="kw">calldata</span> groupId,
    <span class="ty">string</span> <span class="kw">calldata</span> rule,
    <span class="ty">string</span> <span class="kw">calldata</span> content
) <span class="kw">external returns</span> (<span class="ty">bytes32</span>) {
    <span class="ty">string</span> <span class="kw">memory</span> q = <span class="ty">string</span>.<span class="fn">concat</span>(groupId, <span class="str">"␟"</span>, rule, <span class="str">"␟"</span>, content);
    <span class="kw">return</span> reality.<span class="fn">askQuestionWithMinBond</span>(
        TEMPLATE_ID,
        q,
        KLEROS_ARBITRATOR,
        <span class="num">3600</span>,           <span class="cm">// 1-hour window for uncontested decisions</span>
        <span class="ty">uint32</span>(<span class="fn">block.timestamp</span>),
        nonce++,
        MIN_BOND
    );
}` }
          },
          {
            title: 'Let the community answer',
            body: `<p>Anyone can post a bonded Yes/No answer. Trusted moderators answer quickly with a larger bond; ordinary community members can dispute if they disagree. If the dispute escalates to Kleros, jurors rule on whether the content violated the stated rule.</p>`
          },
          {
            title: 'Take moderation action on finalisation',
            body: `<p>After the question finalises, read the result and take the appropriate action (remove message, ban user, etc.):</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">function</span> <span class="fn">enforce</span>(<span class="ty">bytes32</span> questionId, <span class="ty">uint256</span> messageId) <span class="kw">external</span> {
    <span class="ty">bytes32</span> result = reality.<span class="fn">resultFor</span>(questionId);
    <span class="kw">bool</span> violated = (<span class="ty">uint256</span>(result) == <span class="num">1</span>);  <span class="cm">// 1 = Yes</span>
    <span class="kw">if</span> (violated) {
        _removeMessage(messageId);
    }
}` }
          }
        ]
      },
      {
        title: 'Tip: use the "Invalid" answer for edge cases',
        body: `<p class="callout callout-tip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>&nbsp;If a dispute turns out to be unanswerable (e.g. the content was deleted before it could be reviewed), answerers can mark it <em>Invalid</em>. Build your enforcement logic to handle this gracefully — typically by taking no action.</p>`
      }
    ]
  },

  {
    id: 'ai-agent',
    icon: '🤖',
    name: 'AI Agent Markets',
    subtitle: 'Automate question creation and resolution for events an AI agent monitors — the pattern used by Nous Hermes for GitHub PR prediction markets.',
    desc: 'Automated question creation and resolution by AI agents',
    sections: [
      {
        title: 'How it works',
        body: `<p>An AI agent monitors a stream of events (GitHub pull requests, on-chain metrics, social media milestones) and creates a reality.eth question for each one. When the event resolves (PR merged or closed, price reached, etc.), the agent submits the answer. Because the agent's reputation is on the line via bonds, honest behaviour is economically incentivised.</p>
        <p>Nous Hermes tracks pull requests in the NousResearch/hermes-agent repository. One question per PR: "Will this PR be merged?"</p>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Define your event trigger',
            body: `<p>Decide what events your agent watches. Each event should be:</p>
            <ul>
              <li><strong>Unambiguous</strong> — the outcome is binary or from a fixed set</li>
              <li><strong>Publicly verifiable</strong> — anyone can check the result, enabling disputes</li>
              <li><strong>Time-bounded</strong> — a clear deadline prevents questions that never resolve</li>
            </ul>`
          },
          {
            title: 'Create a question per event',
            body: `<p>Your agent script creates a question as soon as the event starts. Include enough detail in the question string for a third party to verify the outcome independently:</p>`,
            code: { lang: 'JavaScript (ethers.js)', body: `<span class="kw">async function</span> <span class="fn">onPROpened</span>(pr) {
    <span class="kw">const</span> question = [
        \`Will PR #\${pr.number} in \${pr.repo} be merged?\`,
        \`Resolves Yes if the PR status is "merged" by \${deadline}.\`,
        \`Resolves No if it is closed without merging.\`,
        \`Evidence: \${pr.url}\`
    ].<span class="fn">join</span>(<span class="str">" "</span>);

    <span class="kw">const</span> questionId = <span class="kw">await</span> reality.<span class="fn">askQuestionWithMinBond</span>(
        <span class="num">0</span>,                <span class="cm">// template: bool</span>
        question,
        ARBITRATOR,
        <span class="num">86400</span>,            <span class="cm">// 24h dispute window</span>
        deadlineTs,       <span class="cm">// opens at the deadline</span>
        pr.number,        <span class="cm">// use PR number as nonce for uniqueness</span>
        ethers.utils.<span class="fn">parseEther</span>(<span class="str">"0.01"</span>),
        { value: ethers.utils.<span class="fn">parseEther</span>(<span class="str">"0.001"</span>) } <span class="cm">// bounty</span>
    );
    <span class="kw">await</span> <span class="fn">saveQuestionId</span>(pr.number, questionId);
}` }
          },
          {
            title: 'Submit the answer when the event resolves',
            body: `<p>Monitor the event source for resolution. When the event concludes, submit the answer with a bond. Use a larger bond than the minimum — this signals confidence and reduces the chance of a dispute:</p>`,
            code: { lang: 'JavaScript', body: `<span class="kw">async function</span> <span class="fn">onPRClosed</span>(pr) {
    <span class="kw">const</span> questionId = <span class="kw">await</span> <span class="fn">loadQuestionId</span>(pr.number);
    <span class="kw">const</span> answer = pr.merged
        ? ethers.constants.One  <span class="cm">// Yes = bytes32(1)</span>
        : ethers.constants.Zero; <span class="cm">// No  = bytes32(0)</span>
    <span class="kw">const</span> answerBytes = ethers.utils.<span class="fn">hexZeroPad</span>(answer, <span class="num">32</span>);

    <span class="kw">await</span> reality.<span class="fn">submitAnswer</span>(
        questionId, answerBytes, <span class="num">0</span>,
        { value: ethers.utils.<span class="fn">parseEther</span>(<span class="str">"0.05"</span>) }
    );
}` }
          },
          {
            title: 'Handle disputes',
            body: `<p>If your agent submits the wrong answer, any observer can override it by posting a higher bond. Design your agent to monitor active questions and correct its own mistakes before the dispute window closes — an agent that self-corrects quickly builds trust and keeps bond costs low.</p>`
          },
          {
            title: 'Expose the result to consumers',
            body: `<p>Any on-chain consumer can read the finalised answer. Off-chain consumers can listen for <code>LogFinalize</code> events:</p>`,
            code: { lang: 'JavaScript', body: `<span class="kw">const</span> filter = reality.<span class="fn">filters</span>.<span class="fn">LogFinalize</span>(questionId);
reality.<span class="fn">on</span>(filter, (qId, answer) => {
    <span class="kw">const</span> merged = answer === ethers.utils.<span class="fn">hexZeroPad</span>(<span class="str">"0x01"</span>, <span class="num">32</span>);
    console.log(\`PR \${prNumber}: \${merged ? "merged" : "not merged"}\`);
});` }
          }
        ]
      }
    ]
  },

  {
    id: 'dao-governance',
    icon: '🏛️',
    name: 'DAO Governance Tracking',
    subtitle: 'Create reality.eth questions that track on-chain DAO proposal outcomes, providing a public, disputeable record of governance decisions.',
    desc: 'Track and enforce on-chain governance outcomes',
    sections: [
      {
        title: 'How it works',
        body: `<p>DAOs that vote on-chain (e.g. Gnosis DAO GIPs, Kleros KIPs) can complement their governance contracts with reality.eth questions that serve as a public, human-readable, disputeable record. These questions can also trigger off-chain or cross-chain execution via bridges.</p>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Ask a question per proposal',
            body: `<p>When a proposal is submitted to your DAO, also ask a reality.eth question. Link to the proposal in the question text so anyone can verify the outcome:</p>`,
            code: { lang: 'JavaScript', body: `<span class="kw">const</span> q = \`Did GIP-\${proposalId} ("\${title}") pass? \`
           + \`See \${proposalUrl} for the full proposal and vote.\`;

<span class="kw">const</span> questionId = <span class="kw">await</span> reality.<span class="fn">askQuestionWithMinBond</span>(
    <span class="num">0</span>,               <span class="cm">// bool template</span>
    q,
    KLEROS_ARB,
    <span class="num">604800</span>,          <span class="cm">// 1-week dispute window (matches vote duration)</span>
    voteEndTs,       <span class="cm">// opens when voting closes</span>
    proposalId,
    ethers.utils.<span class="fn">parseEther</span>(<span class="str">"0.1"</span>)  <span class="cm">// meaningful minimum bond</span>
);` }
          },
          {
            title: 'Report the result',
            body: `<p>After voting closes, report the on-chain result to reality.eth. To provide maximum assurance, have the DAO's own governance contract submit the answer — this makes the answer as trustworthy as the on-chain vote itself:</p>`,
            code: { lang: 'Solidity', body: `<span class="cm">// Called from the DAO's executeProposal() function</span>
<span class="kw">function</span> <span class="fn">_reportToRealityEth</span>(<span class="ty">bytes32</span> questionId, <span class="kw">bool</span> passed) <span class="kw">internal</span> {
    <span class="ty">bytes32</span> answer = passed ? <span class="ty">bytes32</span>(<span class="ty">uint256</span>(<span class="num">1</span>)) : <span class="ty">bytes32</span>(<span class="num">0</span>);
    reality.<span class="fn">submitAnswer</span>{value: BOND}(questionId, answer, <span class="num">0</span>);
}` }
          },
          {
            title: 'Use for cross-chain execution',
            body: `<p>If your DAO's treasury or actions span multiple chains, combine this pattern with the Zodiac Reality Module (see the Snapshot guide). The module on the target chain watches the same reality.eth question and executes the approved transactions once it finalises Yes.</p>`
          },
          {
            title: 'Claim bonds after finalisation',
            body: `<p>Whoever submitted the correct answer (or their delegates) can claim their bond back plus any loser bonds. Call <code>claimMultipleAndWithdrawBalance()</code> with the answer history to receive funds:</p>`,
            code: { lang: 'Solidity', body: `<span class="cm">// Claim winnings for one question</span>
reality.<span class="fn">claimWinnings</span>(
    questionId,
    historyHashes,  <span class="cm">// chain of history_hash values</span>
    answerers,
    bonds,
    answers
);
reality.<span class="fn">withdraw</span>();  <span class="cm">// move balance to your wallet</span>` }
          }
        ]
      }
    ]
  }
];

window.RealityGuide.mount = function (guideId) {
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderCode(block) {
    return `<div class="code-block">
      <div class="code-label">${esc(block.lang)}</div>
      <pre>${block.body}</pre>
    </div>`;
  }

  function renderSteps(steps) {
    return `<div class="steps">${steps.map((s, i) => `
      <div class="step">
        <div>
          <div class="step-num">${i + 1}</div>
          <div class="step-connector"></div>
        </div>
        <div class="step-body">
          <div class="step-title">${esc(s.title)}</div>
          <div class="step-desc">${s.body}${s.code ? renderCode(s.code) : ''}</div>
        </div>
      </div>`).join('')}</div>`;
  }

  function renderGuide(guide) {
    const main = document.getElementById('guide-main');
    main.innerHTML = `
      <div class="article-breadcrumb">
        <a href="#!/guide">All guides</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        ${esc(guide.name)}
      </div>
      <div class="article-title">${esc(guide.name)}</div>
      <div class="article-subtitle">${esc(guide.subtitle)}</div>
      ${guide.sections.map(sec => `
        <div class="article-section">
          <h2>${esc(sec.title)}</h2>
          ${sec.steps ? renderSteps(sec.steps) : (sec.body || '')}
        </div>`).join('')}
    `;
    document.title = `reality.eth — ${guide.name}`;
  }

  function renderIndex() {
    const main = document.getElementById('guide-main');
    main.innerHTML = `
      <div class="guide-index">
        <div class="guide-index-title">Integration guides</div>
        <div class="guide-index-sub">Step-by-step guides showing how to build each type of reality.eth integration, based on real apps in the ecosystem.</div>
        <div class="guide-cards">
          ${_GUIDES.map(g => `
            <a class="guide-card" href="#!/guide/${g.id}">
              <div class="guide-card-icon">${g.icon}</div>
              <div class="guide-card-name">${esc(g.name)}</div>
              <div class="guide-card-desc">${esc(g.desc)}</div>
            </a>`).join('')}
        </div>
      </div>
    `;
    document.title = 'reality.eth — Integration guides';
  }

  function buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = `<a class="nav-item" href="#!/guide">All guides</a>`
      + _GUIDES.map(g => `<a class="nav-item" href="#!/guide/${g.id}">${esc(g.name)}</a>`).join('');
  }

  function setActiveNav(id) {
    document.querySelectorAll('#sidebar-nav .nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('href') === (id ? `#!/guide/${id}` : '#!/guide'));
    });
  }

  buildSidebar();

  const guide = guideId ? _GUIDES.find(g => g.id === guideId) : null;
  if (guide) {
    renderGuide(guide);
    setActiveNav(guide.id);
  } else {
    renderIndex();
    setActiveNav(null);
  }
};
