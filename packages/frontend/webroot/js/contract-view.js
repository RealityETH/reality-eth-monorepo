window.RealityContract = window.RealityContract || {};

window.RealityContract.mount = async function (chainId, address) {
  'use strict';

  const VERSION_META = {
    'RealityETH-2.0':       { audit: 'RealityETH-2.0.rst',       commit: 'https://github.com/realitio/realitio-contracts/commit/40ab84fc2a1342ba36d1a36aed8e7f81c84844ed' },
    'RealityETH-2.1':       { audit: null,                         commit: 'https://github.com/RealityETH/monorepo/commit/2ca642aab0188bee2891a64dea0a537ebc66406b' },
    'RealityETH-3.0':       { audit: 'RealityETH-3.0.txt',        commit: 'https://github.com/RealityETH/monorepo/commit/c6aa3d7d81912c330f11ebd6e349f2836e2b491e' },
    'RealityETH-3.2':       { audit: 'RealityETH-3.0.txt',        commit: null },
    'RealityETH_ERC20-2.0': { audit: 'RealityETH_ERC20-2.0.txt', commit: 'https://github.com/realitio/realitio-contracts/commit/7c2096b22f7aa9bfb496f0c167ecce07108d7218' },
    'RealityETH_ERC20-3.0': { audit: 'RealityETH_ERC20-3.0.txt', commit: 'https://github.com/RealityETH/monorepo/commit/e4584d7cf6ab2d9a5b129bd970b7d4517811ae6a' },
    'RealityETH_ERC20-3.2': { audit: 'RealityETH_ERC20-3.0.txt', commit: null },
  };

  const VERSION_FEATURES = [
    { fromMajor: 3,   label: 'Minimum bond enforcement',      note: 'Questions can require a minimum opening bond.' },
    { fromMajor: 3,   label: 'Commit-reveal answers',          note: 'Answerers can hide their answer until after posting, preventing front-running.' },
    { fromMajor: 3.2, label: 'Template hash verification',     note: 'Custom template text is hashed on-chain, allowing trustless verification.' },
  ];

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function short(addr) { return addr.slice(0, 8) + '…' + addr.slice(-6); }

  function showError(msg) {
    document.getElementById('cv-loading').style.display = 'none';
    const err = document.getElementById('cv-error');
    err.textContent = msg;
    err.style.display = '';
  }

  if (!chainId || !address) {
    showError('Invalid URL — expected #!/network/{chainId}/contract/{address}');
    return;
  }

  const d = window.RealityWebsiteData;
  if (!d) { showError('Failed to load contract data.'); return; }
  const contracts = d.contracts;
  const tokens    = d.tokens;
  const chains    = d.chains;

  const chainData = contracts[String(chainId)] || {};
  let tokenSym = null, versionKey = null, info = null;
  outer: for (const [tok, versions] of Object.entries(chainData)) {
    for (const [ver, v] of Object.entries(versions)) {
      if (v.address?.toLowerCase() === address) {
        tokenSym = tok; versionKey = ver; info = v; break outer;
      }
    }
  }
  if (!info) { showError(`Contract ${address} not found in registry for chain ${chainId}.`); return; }

  const chainInfo = chains[String(chainId)] || {};
  const chainName = chainInfo.chainName || `Chain ${chainId}`;
  const explorer  = (chainInfo.blockExplorerUrls || [])[0] || '';
  const tokenInfo = tokens[tokenSym] || {};
  const isERC20   = !!info.token_address;
  const verMeta   = VERSION_META[versionKey] || {};

  const verNum  = parseFloat((versionKey.match(/[-_](\d+\.\d+)/) || [])[1] || '0');
  const features = VERSION_FEATURES.filter(f => verNum >= f.fromMajor);
  if (isERC20) features.unshift({ label: 'ERC-20 token bonds', note: `Bond payments use ${tokenSym} tokens rather than the chain's native currency.` });

  document.title = `reality.eth — ${versionKey} on ${chainName}`;

  const badges = document.getElementById('cv-badges');
  badges.innerHTML = `
    <span class="badge badge-chain">${esc(chainName)}</span>
    <span class="badge badge-version">${esc(versionKey)}</span>
    <span class="badge ${isERC20 ? 'badge-erc20' : 'badge-native'}">${isERC20 ? 'ERC-20' : 'Native token'}</span>
  `;

  document.getElementById('cv-hero-address').textContent = address;

  if (explorer) {
    const lnk = document.getElementById('cv-explorer-link');
    lnk.href = `${explorer}/address/${address}`;
    lnk.style.display = '';
  }

  const cards = document.getElementById('cv-cards');
  cards.innerHTML = '';

  function metaRow(key, valHtml) {
    return `<div class="cv-meta-row"><span class="cv-meta-key">${esc(key)}</span><span class="cv-meta-val">${valHtml}</span></div>`;
  }

  const deployedBlock  = info.block ? info.block.toLocaleString() : '—';
  const explorerAddrLink = explorer
    ? `<a href="${esc(explorer)}/address/${esc(address)}" target="_blank" rel="noopener noreferrer">${esc(short(address))} ↗</a>`
    : `<span class="mono">${esc(short(address))}</span>`;

  const overviewCard = el('div', 'card');
  overviewCard.innerHTML = `
    <div class="card-title">Overview</div>
    <div class="cv-meta-list">
      ${metaRow('Chain', `${esc(chainName)} <span style="color:var(--text-dim);font-size:12px">(${chainId})</span>`)}
      ${metaRow('Contract version', esc(versionKey))}
      ${metaRow('Address', explorerAddrLink)}
      ${metaRow('Deployed at block', deployedBlock)}
    </div>
  `;
  cards.appendChild(overviewCard);

  const tokenCard = el('div', 'card');
  let tokenValHtml;
  if (isERC20) {
    const expLink = explorer
      ? `<a href="${esc(explorer)}/address/${esc(info.token_address)}" target="_blank" rel="noopener noreferrer">${esc(short(info.token_address))} ↗</a>`
      : `<span class="mono">${esc(short(info.token_address))}</span>`;
    tokenValHtml = `${esc(tokenSym)} ERC-20 — ${expLink}`;
  } else {
    tokenValHtml = `${esc(tokenSym)} (native currency)`;
  }
  const smallNum    = tokenInfo.small_number;
  const smallNumStr = smallNum != null
    ? `${(smallNum / 1e18).toLocaleString(undefined, {maximumSignificantDigits: 6})} ${tokenSym}`
    : null;

  tokenCard.innerHTML = `
    <div class="card-title">Bond Token</div>
    <div class="cv-meta-list">
      ${metaRow('Token', tokenValHtml)}
      ${metaRow('Type', isERC20 ? 'ERC-20 (requires approval)' : 'Native currency')}
      ${smallNumStr ? metaRow('Typical minimum', esc(smallNumStr)) : ''}
    </div>
  `;
  cards.appendChild(tokenCard);

  const featCard = el('div', 'card');
  const checkSvg = `<svg class="feature-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  const featRows = features.map(f =>
    `<div class="feature-row">${checkSvg}<div><strong>${esc(f.label)}</strong><br><span style="font-size:12px;color:var(--text-dim)">${esc(f.note)}</span></div></div>`
  ).join('');
  featCard.innerHTML = `
    <div class="card-title">Features</div>
    ${features.length ? `<div class="feature-list">${featRows}</div>` : '<div class="none-note">Basic reality.eth (v2 — no minimum bond)</div>'}
  `;
  cards.appendChild(featCard);

  const secCard    = el('div', 'card');
  const auditFile  = verMeta.audit || null;
  const auditLink  = auditFile
    ? `<a href="/packages/contracts/audits/${esc(auditFile)}" target="_blank" rel="noopener noreferrer">${esc(auditFile)} ↗</a>`
    : null;
  const commitLink = verMeta.commit
    ? `<a href="${esc(verMeta.commit)}" target="_blank" rel="noopener noreferrer">${esc(verMeta.commit.split('/').pop().slice(0,10))}… ↗</a>`
    : null;

  secCard.innerHTML = `
    <div class="card-title">Security</div>
    <div class="cv-meta-list">
      ${metaRow('Audit', auditLink || '<span class="none-note">No audit on record</span>')}
      ${commitLink ? metaRow('Source commit', commitLink) : ''}
    </div>
  `;
  cards.appendChild(secCard);

  const arbEntries = Object.entries(info.arbitrators || {});
  const arbCard    = el('div', 'card');
  arbCard.classList.add('card-full');
  if (arbEntries.length === 0) {
    arbCard.innerHTML = `<div class="card-title">Arbitrators</div><div class="none-note">No configured arbitrators for this deployment.</div>`;
  } else {
    const arbRows = arbEntries.map(([addr, name]) => {
      const expLink = explorer
        ? `<a class="ext-link" href="${esc(explorer)}/address/${esc(addr)}" target="_blank" rel="noopener noreferrer">↗</a>`
        : '';
      return `<div class="arb-row">
        <span class="arb-name">${esc(name)}</span>
        <span class="arb-addr">${esc(addr)}</span>
        ${expLink}
      </div>`;
    }).join('');
    arbCard.innerHTML = `<div class="card-title">Arbitrators</div><div class="arb-list">${arbRows}</div>`;
  }
  cards.appendChild(arbCard);

  document.getElementById('cv-loading').style.display = 'none';
  document.getElementById('cv-content').style.display = '';
};
