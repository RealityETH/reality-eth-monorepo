(function () {
'use strict';

const DOCS = [
  { id: 'contracts',            title: 'Using from a contract',   desc: 'Deploy and call the Reality.eth contracts from your Solidity code.' },
  { id: 'javascript',           title: 'Using from JavaScript',   desc: 'Query and interact with Reality.eth from a browser or Node.js.' },
  { id: 'dapp',                 title: 'Using the dapp',          desc: 'Ask questions, submit answers, and dispute through the web UI.' },
  { id: 'dapp_links',           title: 'Linking to the dapp',     desc: 'Construct deep links with pre-filled parameters.' },
  { id: 'fees',                 title: 'Fees and payments',       desc: 'How arbitration fees, answer bonds, and bounties work.' },
  { id: 'arbitrators',          title: 'Arbitrators',             desc: 'Choosing and building arbitrators for dispute resolution.' },
  { id: 'contract_explanation', title: 'Contract internals',      desc: 'Data structures and internal logic of the RealityETH contract.' },
  { id: 'whitepaper',           title: 'White paper',             desc: 'Design goals, game theory, and protocol specification.' },
];

let _clickHandlerAdded = false;

window.RealityDocs = {};

window.RealityDocs.mount = async function (docId) {
  const docsView = document.getElementById('docs-view');
  const sidebar  = document.getElementById('docs-sidebar-nav');
  const main     = document.getElementById('docs-main');

  if (!_clickHandlerAdded) {
    _clickHandlerAdded = true;
    docsView.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const m = href.match(/^([a-zA-Z_]+)\.md$/);
      if (m) { e.preventDefault(); window.location.hash = '#!/docs/' + m[1]; }
    });
  }

  sidebar.innerHTML = DOCS.map(d =>
    `<a class="nav-item${d.id === docId ? ' active' : ''}" href="#!/docs/${d.id}">${d.title}</a>`
  ).join('');

  if (!docId) {
    renderIndex(main);
  } else {
    await renderDoc(docId, main);
  }
};

function renderIndex(main) {
  main.innerHTML = `
    <div class="article-title">Documentation</div>
    <div class="article-subtitle">Reference documentation for the Reality.eth oracle protocol.</div>
    <div class="guide-cards">
      ${DOCS.map(d => `
        <a class="guide-card" href="#!/docs/${d.id}">
          <div class="guide-card-name">${d.title}</div>
          <div class="guide-card-desc">${d.desc}</div>
        </a>
      `).join('')}
    </div>
  `;
}

async function renderDoc(docId, main) {
  const doc = DOCS.find(d => d.id === docId);
  if (!doc) { main.innerHTML = '<p class="docs-error">Document not found.</p>'; return; }

  main.innerHTML = `
    <div class="article-breadcrumb"><a href="#!/docs">Documentation</a> → ${doc.title}</div>
    <div class="docs-body docs-loading">Loading…</div>
  `;

  try {
    const res = await fetch('docs/' + docId + '.md');
    if (!res.ok) throw new Error(res.status);
    const md  = await res.text();
    const html = DOMPurify.sanitize(marked.parse(md));
    const body = main.querySelector('.docs-body');
    body.className = 'docs-body';
    body.innerHTML = html;
  } catch (e) {
    main.querySelector('.docs-body').innerHTML = '<p class="docs-error">Failed to load: ' + e.message + '</p>';
  }
}

})();
