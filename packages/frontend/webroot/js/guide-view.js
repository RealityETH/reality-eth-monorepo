window.RealityGuide = window.RealityGuide || {};

window.RealityGuide._guides = [
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
  },

  {
    id: 'olas-predict',
    icon: '⚡',
    name: 'Olas Predict',
    subtitle: 'Deploy an autonomous AI agent economy that creates, trades, and resolves reality.eth prediction markets — the pattern used by Olas Network on Gnosis Chain.',
    desc: 'Autonomous multi-agent prediction market pipeline',
    sections: [
      {
        title: 'How it works',
        body: `<p>Olas Predict is a coordinated economy of four autonomous AI agent services, each running as an Open Autonomy finite-state machine. The pipeline is:</p>
        <ol>
          <li><strong>Market Creator</strong> — calls an LLM mech to generate candidate questions from live news, then posts approved ones to reality.eth and seeds liquidity in an Omen FPMM (Fixed Product Market Maker).</li>
          <li><strong>Mech</strong> — an off-chain LLM worker (GPT-4, Claude, etc.) that responds to on-chain <code>Request</code> events with probability estimates.</li>
          <li><strong>Trader</strong> — reads mech probability outputs and buys/sells outcome tokens on Omen markets when the edge exceeds a threshold.</li>
          <li><strong>Market Resolver</strong> — monitors open questions, submits answers to reality.eth when markets close, removes LP, and claims winnings.</li>
        </ol>
        <p>Each agent service is controlled by a <strong>Gnosis Safe</strong> that holds the collateral (wxDAI). The Safe's address appears as the question creator on reality.eth.</p>`
      },
      {
        title: 'Architecture',
        body: `<p>The full on-chain stack on Gnosis Chain:</p>
        <ul>
          <li><strong>Reality.eth</strong> (<code>0xE78996A233895bE74a66F451f1019cA9734205cc</code>) — question creation and bond-backed resolution</li>
          <li><strong>FPMMDeterministicFactory</strong> — deploys one AMM pool per market; the Market Creator seeds it with wxDAI</li>
          <li><strong>Gnosis Conditional Tokens (CTF)</strong> — ERC-1155 outcome tokens; each market is a condition with two outcome slots (Yes / No)</li>
          <li><strong>Kleros Home Proxy</strong> — three cross-chain arbitration proxies bridge disputes to Kleros Court on Ethereum via the Arbitrary Message Bridge</li>
        </ul>
        <p>The three Kleros arbitrators used for Olas markets on Gnosis Chain:</p>
        <ul>
          <li><code>0xe40DD83a262da3f56976038F1554Fe541Fa75ecd</code> — Omen AI v1.0 (500 min jurors)</li>
          <li><code>0x5562Ac605764DC4039fb6aB56a74f7321396Cdf2</code> — Omen AI v1.1 (31 min jurors)</li>
          <li><code>0x29f39de98d750eb77b5fafb31b2837f079fce222</code> — Default v1.1.1 (31 min jurors)</li>
        </ul>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Register a service on the Olas Protocol',
            body: `<p>Olas agent services are registered as NFTs in the on-chain <strong>Service Registry</strong>. Each service specifies the number of agents, their canonical key hashes, the multisig threshold, and the IPFS hash of the service configuration.</p>
            <p>Use the <a href="https://govern.olas.network" target="_blank" rel="noopener">Olas Govern</a> interface or the Pearl desktop app to deploy and manage your service. The service's Gnosis Safe address becomes its on-chain identity and the <code>creator</code> address for all reality.eth questions it asks.</p>`
          },
          {
            title: 'Configure the Market Creator',
            body: `<p>The Market Creator service reads its configuration from on-chain and IPFS. Key parameters you set per deployment:</p>`,
            code: { lang: 'YAML (service configuration)', body: `TOPICS:            # e.g. "Crypto, Politics, Sports"
NEWS_SOURCES:      # e.g. "newsapi.org, cryptopanic.com"
QUESTION_TIMEOUT:  86400    # seconds until finalisation
MIN_BOND:          1000000000000000  # 0.001 xDAI
CLOSE_TIME_DAYS:   3        # how far ahead to set openingTs
COLLATERAL_AMOUNT: "1000000000000000000"  # 1 wxDAI initial liquidity
ARBITRATOR:        "0x5562Ac605764DC4039fb6aB56a74f7321396Cdf2"` }
          },
          {
            title: 'Understand question creation',
            body: `<p>When the Market Creator FSM reaches its <em>create market</em> state, it batches calls via the Safe's MultiSend:</p>`,
            code: { lang: 'Sequence (simplified)', body: `1. Call RealityETH.askQuestionWithMinBond(
      templateId=0,     // bool: Yes/No
      question,         // LLM-generated text
      arbitrator,
      timeout,
      openingTs,
      nonce,
      minBond
   )
2. Call IERC20(wxDAI).approve(factory, amount)
3. Call FPMMDeterministicFactory.create2FixedProductMarketMaker(
      conditionalTokens, collateralToken,
      [conditionId],     // derived from questionId
      fee, initialFunds,
      saltNonce
   )` }
          },
          {
            title: 'Implement the Mech (LLM probability engine)',
            body: `<p>A Mech is a smart contract that emits <code>Request</code> events which off-chain workers answer. The Market Creator posts probability requests; the Mech worker calls back with a float representing its confidence:</p>`,
            code: { lang: 'Solidity (Mech interface)', body: `<span class="cm">// Mech on Gnosis Chain: 0x77af31De935740567Cf4fF1986D04B2c964A786a</span>
<span class="kw">interface</span> <span class="ty">IMech</span> {
    <span class="kw">function</span> <span class="fn">request</span>(
        <span class="ty">bytes</span> <span class="kw">calldata</span> data    <span class="cm">// encoded question + model config</span>
    ) <span class="kw">external payable returns</span> (<span class="ty">uint256</span> requestId);
}

<span class="cm">// Off-chain worker delivers probability estimate back via:</span>
<span class="kw">function</span> <span class="fn">deliver</span>(<span class="ty">uint256</span> requestId, <span class="ty">bytes</span> <span class="kw">calldata</span> data) <span class="kw">external</span>;` }
          },
          {
            title: 'Set up the Market Resolver',
            body: `<p>The Market Resolver runs a separate Open Autonomy service that watches for questions past their opening timestamp, reads the Mech's probability (if > 0.5 → Yes, else → No), and submits an answer with a bond. It also removes LP from expired FPMMs and redeems conditional tokens.</p>`,
            code: { lang: 'JavaScript (resolution logic)', body: `<span class="cm">// Simplified resolver decision</span>
<span class="kw">async function</span> <span class="fn">resolve</span>(questionId, mechProbability) {
    <span class="kw">const</span> answer = mechProbability >= <span class="num">0.5</span>
        ? ethers.utils.<span class="fn">hexZeroPad</span>(<span class="str">'0x01'</span>, <span class="num">32</span>)  <span class="cm">// Yes</span>
        : ethers.utils.<span class="fn">hexZeroPad</span>(<span class="str">'0x00'</span>, <span class="num">32</span>); <span class="cm">// No</span>

    <span class="kw">await</span> reality.<span class="fn">submitAnswer</span>(
        questionId, answer, <span class="num">0</span>,
        { value: MIN_BOND }
    );
}` }
          }
        ]
      },
      {
        title: 'Further reading',
        body: `<ul>
          <li><a href="https://github.com/valory-xyz/market-creator" target="_blank" rel="noopener">valory-xyz/market-creator — Market Creator service</a></li>
          <li><a href="https://github.com/valory-xyz/market-resolver" target="_blank" rel="noopener">valory-xyz/market-resolver — Market Resolver service</a></li>
          <li><a href="https://github.com/valory-xyz/trader" target="_blank" rel="noopener">valory-xyz/trader — Trading agent</a></li>
          <li><a href="https://olas.network/agent-economies/predict" target="_blank" rel="noopener">Olas Predict overview</a></li>
          <li><a href="https://docs.olas.network" target="_blank" rel="noopener">Open Autonomy framework docs</a></li>
        </ul>`
      }
    ]
  },

  {
    id: 'infinite-games',
    icon: '∞',
    name: 'Infinite Games',
    subtitle: 'Run a forecasting competition where AI miners submit probability estimates for real-world events, scored by validators against reality.eth ground truth.',
    desc: 'Bittensor-based AI forecasting competition',
    sections: [
      {
        title: 'How it works',
        body: `<p>Infinite Games is a <strong>Bittensor subnet</strong> for decentralised forecasting of real-world binary events. Miners (AI forecasters) and validators (scorers) operate on the Bittensor network, while the event questions and their official outcomes are anchored on Gnosis Chain via reality.eth.</p>
        <p>The core loop:</p>
        <ol>
          <li>Questions are sourced from platforms like Polymarket and ACLED and posted to reality.eth on Gnosis Chain by the operator's Gnosis Safe.</li>
          <li>Miners submit probability estimates (0–1) for each event before it resolves.</li>
          <li>Validators score miner predictions using a Brier Score against the reality.eth finalised answer.</li>
          <li>Bittensor rewards ($TAO tokens) flow to high-scoring miners each epoch.</li>
        </ol>`
      },
      {
        title: 'Key components',
        body: `<ul>
          <li><strong>Reality.eth question creator</strong> — a Gnosis Safe operated by the platform; all questions in the index come from two addresses on Gnosis Chain</li>
          <li><strong>Bittensor subnet 41</strong> — the inference layer; miners and validators communicate via the Bittensor protocol (no on-chain Gnosis registration required for miners)</li>
          <li><strong>Scoring</strong> — Brier Score with exponential recency weighting; later updates to a forecast are weighted more heavily</li>
          <li><strong>Peer review</strong> — validators cross-check each other to prevent collusion</li>
        </ul>`
      },
      {
        title: 'Step-by-step (running a miner)',
        steps: [
          {
            title: 'Register on the Bittensor network',
            body: `<p>You need a Bittensor wallet and sufficient TAO to register on subnet 41 (Infinite Games). Registration happens on the Bittensor chain, not on Gnosis. Use the <code>btcli</code> command-line tool:</p>`,
            code: { lang: 'Shell', body: `btcli subnet register --netuid 41 --wallet.name my_wallet --wallet.hotkey my_hotkey` }
          },
          {
            title: 'Fetch open questions',
            body: `<p>The subnet exposes a list of active reality.eth questions you should forecast. Validators send these to miners as a <em>synapse</em> — a structured request/response over the Bittensor protocol. Each question includes the questionId, the full question text, and the closing timestamp.</p>`,
            code: { lang: 'Python (miner logic)', body: `<span class="kw">class</span> <span class="ty">EventScoreSynapse</span>(bt.Synapse):
    question_id:  str
    question:     str
    closing_time: int
    p_yes:        float = <span class="num">None</span>  <span class="cm"># miner fills this in</span>

<span class="kw">async def</span> <span class="fn">forward</span>(synapse: EventScoreSynapse) -> EventScoreSynapse:
    synapse.p_yes = <span class="kw">await</span> my_llm.<span class="fn">predict</span>(synapse.question)
    <span class="kw">return</span> synapse` }
          },
          {
            title: 'Return probability estimates',
            body: `<p>For each question, return a float <code>p_yes</code> in [0, 1]. A value of 0.5 is maximally uncertain; values near 0 or 1 are high-confidence predictions. Your score depends on how close your probability is to the actual outcome — a confident wrong answer is heavily penalised.</p>`
          },
          {
            title: 'Outcome resolution via reality.eth',
            body: `<p>When an event resolves, validators check the finalised answer on reality.eth and score all miners who forecast that question. The Brier Score for a binary outcome is:</p>`,
            code: { lang: 'Python (scoring)', body: `<span class="cm"># outcome is 1.0 (Yes) or 0.0 (No) from reality.eth</span>
brier_score = (p_yes - outcome) ** <span class="num">2</span>
<span class="cm"># lower is better; perfect forecast = 0.0, worst = 1.0</span>
reward = <span class="num">1.0</span> - brier_score` }
          },
          {
            title: 'Run a validator (optional)',
            body: `<p>Validators query all registered miners, aggregate their responses, and submit scores to the Bittensor metagraph each epoch. They also verify each other's scores to prevent manipulation. Running a validator requires a larger TAO stake.</p>`
          }
        ]
      },
      {
        title: 'Further reading',
        body: `<ul>
          <li><a href="https://github.com/amedeo-gigaver/infinite_games" target="_blank" rel="noopener">amedeo-gigaver/infinite_games — subnet source code</a></li>
          <li><a href="https://infinitegam.es" target="_blank" rel="noopener">infinitegam.es — platform website</a></li>
          <li><a href="https://docs.bittensor.com" target="_blank" rel="noopener">Bittensor documentation</a></li>
        </ul>`
      }
    ]
  },

  {
    id: 'deep-funding',
    icon: 'D',
    name: 'Deep Funding',
    subtitle: 'Crowdsource dependency-graph weights for open-source project funding using reality.eth uint questions and robust statistical aggregation.',
    desc: 'Numeric weight crowdsourcing for dependency funding',
    sections: [
      {
        title: 'How it works',
        body: `<p>Deep Funding allocates grants to open-source projects by asking: <em>how much did dependency A contribute to the success of project B?</em> Instead of a Yes/No vote, it uses reality.eth <strong>uint questions</strong> — each question has a numeric answer representing a juror-estimated weight (e.g. 0–10,000).</p>
        <p>Jurors submit their estimates on-chain via reality.eth's bond-escalation mechanism. The platform aggregates all submissions using <strong>Huber loss minimisation in the log domain</strong> — a robust method that down-weights extreme outliers — to produce a final allocation weight for each (dependency, project) pair.</p>
        <p>This pattern is hosted on the <strong>CryptoPond Model Factory</strong> (cryptopond.xyz), which provides the front-end, juror coordination, and the question-creation infrastructure.</p>`
      },
      {
        title: 'The uint question type',
        body: `<p>Unlike reality.eth's built-in bool (0/1) and single-select (index) templates, the <code>uint</code> type accepts any non-negative integer as the answer. The question template is registered with <code>"type": "uint"</code> and an optional <code>decimals</code> field:</p>`,
        code: { lang: 'Template JSON', body: `{
  "title": "What will be the juror weight of %s for %s in %s? [weight]",
  "type": "uint",
  "decimals": 0,
  "category": "deepfunding",
  "lang": "en"
}` }
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Map the dependency graph',
            body: `<p>Use a tool like <a href="https://deps.dev" target="_blank" rel="noopener">deps.dev</a> or GitHub's dependency API to enumerate the open-source packages that your funded projects depend on. Each (dependency, project) pair becomes one question.</p>`
          },
          {
            title: 'Create a uint template',
            body: `<p>Register a template on reality.eth for your competition round. The template encodes the weight-asking question:</p>`,
            code: { lang: 'JavaScript', body: `<span class="kw">const</span> templateJson = JSON.<span class="fn">stringify</span>({
    title:    <span class="str">"What will be the juror weight of %s for %s in round %s? [weight]"</span>,
    type:     <span class="str">"uint"</span>,
    decimals: <span class="num">0</span>,
    category: <span class="str">"deepfunding"</span>,
    lang:     <span class="str">"en"</span>
});
<span class="kw">const</span> tx = <span class="kw">await</span> reality.<span class="fn">createTemplate</span>(templateJson);` }
          },
          {
            title: 'Batch-ask questions for each pair',
            body: `<p>One question per (dependency, project) pair. Use a scripted caller to batch them via a Safe or a dedicated creator contract. Set <code>openingTs</code> to when the round ends so jurors can only answer after all submissions are in:</p>`,
            code: { lang: 'JavaScript', body: `<span class="kw">for</span> (<span class="kw">const</span> [dep, project, round] <span class="kw">of</span> pairs) {
    <span class="kw">const</span> q = \`\${dep}␟\${project}␟\${round}\`;
    <span class="kw">await</span> reality.<span class="fn">askQuestionWithMinBond</span>(
        TEMPLATE_ID, q,
        ARBITRATOR,
        <span class="num">604800</span>,     <span class="cm">// 1-week dispute window</span>
        roundEndTs,  <span class="cm">// opens when round ends</span>
        nonce++,
        MIN_BOND
    );
}` }
          },
          {
            title: 'Collect juror answers',
            body: `<p>Jurors submit a uint answer (the weight they believe the dependency deserves) with a bond. If another juror disagrees and posts a different value with a higher bond, the old answer is displaced. The answer with the highest bond when the timeout expires is the "winner" — but the platform further aggregates all historical submissions off-chain.</p>`,
            code: { lang: 'JavaScript (juror submission)', body: `<span class="cm">// Juror posts a weight estimate of 3500</span>
<span class="kw">const</span> answer = ethers.utils.<span class="fn">hexZeroPad</span>(
    ethers.BigNumber.<span class="fn">from</span>(<span class="num">3500</span>), <span class="num">32</span>
);
<span class="kw">await</span> reality.<span class="fn">submitAnswer</span>(questionId, answer, <span class="num">0</span>, {
    value: MIN_BOND
});` }
          },
          {
            title: 'Aggregate weights off-chain',
            body: `<p>After finalisation, read all bond-weighted answers from the question's answer history on-chain. Apply robust aggregation (Huber loss minimisation or trimmed mean) to resist outlier jurors. The final weights are then used to allocate a grant pool proportionally across the (dependency, project) pairs.</p>`,
            code: { lang: 'Python (aggregation sketch)', body: `<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="cm"># answers: list of (value, bond) from on-chain history</span>
values = np.<span class="fn">array</span>([a.value <span class="kw">for</span> a <span class="kw">in</span> answers])
bonds  = np.<span class="fn">array</span>([a.bond  <span class="kw">for</span> a <span class="kw">in</span> answers])

<span class="cm"># Bond-weighted median (simple version)</span>
sorted_idx = np.<span class="fn">argsort</span>(values)
cumulative  = np.<span class="fn">cumsum</span>(bonds[sorted_idx])
median_idx  = sorted_idx[np.<span class="fn">searchsorted</span>(cumulative, bonds.<span class="fn">sum</span>() / <span class="num">2</span>)]
weight      = values[median_idx]` }
          }
        ]
      },
      {
        title: 'Further reading',
        body: `<ul>
          <li><a href="https://cryptopond.xyz/modelfactory" target="_blank" rel="noopener">CryptoPond Model Factory — where DeepFunding rounds are hosted</a></li>
          <li><a href="https://eval.science" target="_blank" rel="noopener">eval.science — Deep Funding research</a></li>
          <li><a href="https://deepfunding.ai" target="_blank" rel="noopener">deepfunding.ai — funding rounds and submissions</a></li>
        </ul>`
      }
    ]
  },

  {
    id: 'cryptopond',
    icon: 'C',
    name: 'CryptoPond Model Factory',
    subtitle: 'Host AI model competitions with on-chain, bond-backed scoring via reality.eth — letting the crowd verify and dispute model performance claims.',
    desc: 'On-chain AI model competition scoring',
    sections: [
      {
        title: 'How it works',
        body: `<p>CryptoPond's Model Factory lets anyone propose an AI model competition: define a dataset, a scoring metric, and a deadline. Participants train and submit models; a leaderboard ranks them by score. To make the final scores tamper-resistant and disputable, CryptoPond anchors each result as a reality.eth question on Optimism or Base.</p>
        <p>The question asks for a numeric score (<code>uint</code> type) or a binary outcome (<code>bool</code>) depending on the competition format. Community members bond ETH to post what they believe the correct result is; if anyone disputes the leaderboard, they override it with a higher bond. The finalised on-chain answer is the authoritative competition result and can trigger automated payouts.</p>`
      },
      {
        title: 'Competition question formats',
        body: `<p>CryptoPond uses two reality.eth question types:</p>
        <ul>
          <li><strong>uint</strong> — for numeric scores with a decimal precision field (e.g. originality score 0–10000 with 4 implicit decimals = 0.0000–1.0000). Question titles include a <code>[score]</code> or <code>[weight]</code> suffix.</li>
          <li><strong>single-select</strong> — for binary or ranked outcomes (e.g. "Which of these models ranked first?").</li>
        </ul>`,
        code: { lang: 'Template JSON (score type)', body: `{
  "title": "[%s] What will be the %s score of %s? (%s decimals) [score]",
  "type": "uint",
  "decimals": 4,
  "category": "cryptopond",
  "lang": "en"
}` }
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Design your competition',
            body: `<p>Define:</p>
            <ul>
              <li><strong>Dataset</strong> — privately held test data that participants cannot access before the deadline (prevents overfitting)</li>
              <li><strong>Metric</strong> — the scoring function (accuracy, F1, Brier Score, etc.) you will compute on the held-out set</li>
              <li><strong>Submission format</strong> — predictions as a CSV, a model checkpoint, or an API endpoint</li>
              <li><strong>Resolution method</strong> — who computes and posts the final score, and how it can be verified</li>
            </ul>`
          },
          {
            title: 'Register questions on reality.eth',
            body: `<p>Create one question per model or per ranked outcome. Link the competition URL in the question title so anyone can find the source data and verify the score independently:</p>`,
            code: { lang: 'JavaScript', body: `<span class="kw">const</span> questionTitle =
    <span class="str">\`[https://cryptopond.xyz/modelfactory/detail/\${competitionId}] \`</span> +
    <span class="str">\`What will be the accuracy score of \${modelId}? (4 decimals) [score]\`</span>;

<span class="kw">await</span> reality.<span class="fn">askQuestionWithMinBond</span>(
    UINT_TEMPLATE_ID,
    questionTitle,
    ARBITRATOR,
    <span class="num">604800</span>,      <span class="cm">// 1-week dispute window</span>
    competitionEndTs,
    nonce++,
    MIN_BOND
);` }
          },
          {
            title: 'Post leaderboard results',
            body: `<p>Once scoring is complete, post the result as an answer. For a score of 0.8341 (4 decimals), post the integer 8341:</p>`,
            code: { lang: 'JavaScript', body: `<span class="cm">// Score 0.8341 → integer 8341 (with 4 implicit decimal places)</span>
<span class="kw">const</span> scoreInt = Math.<span class="fn">round</span>(score * <span class="num">10_000</span>);
<span class="kw">const</span> answer   = ethers.utils.<span class="fn">hexZeroPad</span>(
    ethers.BigNumber.<span class="fn">from</span>(scoreInt), <span class="num">32</span>
);
<span class="kw">await</span> reality.<span class="fn">submitAnswer</span>(questionId, answer, <span class="num">0</span>, {
    value: BOND
});` }
          },
          {
            title: 'Enable community verification',
            body: `<p>Since the question URL points to your competition page, any participant can rerun the scoring locally and dispute an incorrect result. Publish the scoring code and dataset after the deadline so anyone can reproduce the leaderboard. A successful dispute requires posting a higher bond with the correct score; Kleros arbitration is the backstop if the dispute is escalated.</p>`
          },
          {
            title: 'Trigger payouts from the finalised result',
            body: `<p>Your payout contract reads the finalised score from reality.eth to determine prize distribution:</p>`,
            code: { lang: 'Solidity', body: `<span class="kw">function</span> <span class="fn">claimPrize</span>(<span class="ty">bytes32</span> questionId, <span class="ty">address</span> model) <span class="kw">external</span> {
    <span class="ty">bytes32</span> raw   = reality.<span class="fn">resultFor</span>(questionId);
    <span class="ty">uint256</span> score = <span class="ty">uint256</span>(raw);  <span class="cm">// e.g. 8341 = 0.8341</span>
    <span class="kw">require</span>(score >= MIN_SCORE, <span class="str">"score too low"</span>);
    _distribute(model, score);
}` }
          }
        ]
      },
      {
        title: 'Further reading',
        body: `<ul>
          <li><a href="https://cryptopond.xyz/modelfactory" target="_blank" rel="noopener">CryptoPond Model Factory</a></li>
          <li><a href="https://docs.cryptopond.xyz" target="_blank" rel="noopener">CryptoPond documentation</a></li>
        </ul>`
      }
    ]
  },

  {
    id: 'polkamarkets-v2',
    icon: 'P',
    name: 'Polkamarkets V2',
    subtitle: 'Create outcome-token prediction markets that settle automatically once reality.eth finalises — the pattern used by the Polkamarkets protocol on Polygon.',
    desc: 'Outcome-token markets with reality.eth settlement',
    sections: [
      {
        title: 'How it works',
        body: `<p>Polkamarkets V2 is a DeFi prediction market protocol where each market issues ERC-20 outcome shares that trade against a collateral token. Reality.eth is used as the decentralised resolution oracle: when the real-world event concludes, bond-stakers post the result on-chain, and the market contract reads it via <code>resultFor()</code> to distribute winnings.</p>
        <p>All 551+ questions on Polygon were created by <code>PredictionMarketV2.sol</code> calling reality.eth directly when each market was opened. The question text encodes the event and outcome criteria; the answer (Yes/No for binary markets) determines which shares pay out.</p>`
      },
      {
        title: 'Architecture',
        body: `<ul>
          <li><strong>PredictionMarketV2.sol</strong> — the main market contract; holds collateral, mints/redeems outcome shares, creates reality.eth questions, reads results</li>
          <li><strong>Reality.eth on Polygon</strong> (<code>0xA75AE6D61Dd9d55e8153A393E2fc859c6a0FC716</code>) — question creation and crowdsourced resolution</li>
          <li><strong>Kleros arbitrator</strong> — cross-chain proxy on Polygon for disputed markets</li>
          <li><strong>polkamarkets-js</strong> — JavaScript SDK for creating markets, buying shares, and resolving</li>
        </ul>`
      },
      {
        title: 'Step-by-step',
        steps: [
          {
            title: 'Install the SDK',
            body: `<p>Polkamarkets provides a JavaScript SDK that wraps the V2 contract calls:</p>`,
            code: { lang: 'Shell', body: `npm install @polkamarkets/js` }
          },
          {
            title: 'Create a market',
            body: `<p>Creating a market calls <code>PredictionMarketV2.createMarket()</code>, which internally calls <code>reality.askQuestion()</code>. You supply the event description, outcomes, closing date, and the ERC-20 token to use as collateral:</p>`,
            code: { lang: 'JavaScript (polkamarkets-js)', body: `<span class="kw">import</span> { Polkamarkets } <span class="kw">from</span> <span class="str">'@polkamarkets/js'</span>;

<span class="kw">const</span> pm = <span class="kw">new</span> <span class="ty">Polkamarkets</span>({ provider, networkId: <span class="num">137</span> }); <span class="cm">// Polygon</span>
<span class="kw">await</span> pm.<span class="fn">login</span>();

<span class="kw">await</span> pm.<span class="fn">createMarket</span>({
    question:     <span class="str">"Will NEAR Protocol ($NEAR) be above $1.33 on 12/08/2023 UTC 17:00?"</span>,
    image:        <span class="str">"ipfs://..."</span>,
    outcomes:     [<span class="str">"Yes"</span>, <span class="str">"No"</span>],
    closingDate:  <span class="str">"2023-08-12T17:00:00Z"</span>,
    token:        USDC_ADDRESS,   <span class="cm">// collateral token</span>
    liquidity:    <span class="str">"100"</span>,          <span class="cm">// initial liquidity in collateral</span>
    fee:          <span class="num">0.02</span>,           <span class="cm">// 2% trading fee</span>
    arbitrator:   KLEROS_ADDRESS
});` }
          },
          {
            title: 'Buy and sell outcome shares',
            body: `<p>Users trade outcome shares against a constant-product AMM embedded in the market. Prices reflect the crowd's probability estimate; the share price for the winning outcome converges to 1 collateral token at resolution:</p>`,
            code: { lang: 'JavaScript', body: `<span class="cm">// Buy 10 "Yes" shares for market 42</span>
<span class="kw">await</span> pm.<span class="fn">buy</span>({
    marketId:  <span class="num">42</span>,
    outcomeId: <span class="num">0</span>,       <span class="cm">// 0 = first outcome ("Yes")</span>
    amount:    <span class="str">"10"</span>,   <span class="cm">// collateral to spend</span>
    minShares: <span class="str">"9.5"</span>  <span class="cm">// slippage guard</span>
});` }
          },
          {
            title: 'Resolve the market',
            body: `<p>Once the event concludes, anyone posts the answer to reality.eth. After the timeout elapses without a successful challenge, call <code>resolveMarket()</code> on the Polkamarkets contract — it calls <code>resultFor()</code> internally and marks the winning outcome:</p>`,
            code: { lang: 'Solidity (internal flow)', body: `<span class="cm">// PredictionMarketV2.resolveMarket() does this internally:</span>
<span class="ty">bytes32</span> result = reality.<span class="fn">resultFor</span>(market.questionId);
<span class="ty">uint256</span> outcomeIdx = <span class="ty">uint256</span>(result);
market.resolvedOutcomeId = outcomeIdx;
market.resolved = <span class="kw">true</span>;
<span class="kw">emit</span> <span class="fn">MarketResolved</span>(marketId, outcomeIdx);` }
          },
          {
            title: 'Claim winnings',
            body: `<p>Holders of winning outcome shares redeem them for collateral proportional to the final share of the prize pool:</p>`,
            code: { lang: 'JavaScript', body: `<span class="kw">await</span> pm.<span class="fn">claimWinnings</span>({ marketId: <span class="num">42</span> });` }
          },
          {
            title: 'Handle disputes',
            body: `<p>If the wrong outcome is posted to reality.eth, any user can submit a higher bond with the correct answer during the timeout period. If dispute is escalated to Kleros, jurors vote and the verdict is posted back to reality.eth, which then propagates to Polkamarkets on the next <code>resolveMarket()</code> call.</p>`
          }
        ]
      },
      {
        title: 'Further reading',
        body: `<ul>
          <li><a href="https://github.com/Polkamarkets/polkamarkets-js" target="_blank" rel="noopener">polkamarkets-js — JavaScript SDK</a></li>
          <li><a href="https://help.polkamarkets.com/developers/polkamarkets-protocol-for-developers" target="_blank" rel="noopener">Polkamarkets developer docs</a></li>
          <li><a href="https://github.com/Polkamarkets/polkamarkets-api" target="_blank" rel="noopener">polkamarkets-api — REST API</a></li>
        </ul>`
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
          ${window.RealityGuide._guides.map(g => `
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
      + window.RealityGuide._guides.map(g => `<a class="nav-item" href="#!/guide/${g.id}">${esc(g.name)}</a>`).join('');
  }

  function setActiveNav(id) {
    document.querySelectorAll('#sidebar-nav .nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('href') === (id ? `#!/guide/${id}` : '#!/guide'));
    });
  }

  buildSidebar();

  const guide = guideId ? window.RealityGuide._guides.find(g => g.id === guideId) : null;
  if (guide) {
    renderGuide(guide);
    setActiveNav(guide.id);
  } else {
    renderIndex();
    setActiveNav(null);
  }
};
