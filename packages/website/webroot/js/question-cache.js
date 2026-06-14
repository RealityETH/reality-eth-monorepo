(function () {
'use strict';

const DB_NAME    = 'reality-eth-events';
const DB_VERSION = 1;

let _dbPromise = null;

function openDb() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = ev => {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains('events')) {
        const store = db.createObjectStore('events', {
          keyPath: ['chainId', 'questionId', 'blockNumber', 'logIndex'],
        });
        store.createIndex('by-question', ['chainId', 'questionId']);
      }
      if (!db.objectStoreNames.contains('sync')) {
        db.createObjectStore('sync', { keyPath: 'id' });
      }
    };
    req.onsuccess = ev => resolve(ev.target.result);
    req.onerror   = ev => { _dbPromise = null; reject(ev.target.error); };
  });
  return _dbPromise;
}

// ── BigNumber serialization ───────────────────────────────────────────────────
// ethers v5 BigNumbers have _isBigNumber:true and _hex. Store as { _bn: hex }
// so they survive the structured-clone algorithm used by IndexedDB.

function bnToJSON(v) {
  if (v?._isBigNumber) return { _bn: v._hex };
  if (Array.isArray(v)) return v.map(bnToJSON);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = bnToJSON(val);
    return out;
  }
  return v;
}

function bnFromJSON(v) {
  if (v && typeof v === 'object' && '_bn' in v) return ethers.BigNumber.from(v._bn);
  if (Array.isArray(v)) return v.map(bnFromJSON);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = bnFromJSON(val);
    return out;
  }
  return v;
}

// ── Event serialization ───────────────────────────────────────────────────────
// Only named args are stored — not ethers' numeric index aliases on Result.

function makeQEventRow(chainId, questionId, contract, ev) {
  return {
    chainId, questionId, contract,
    eventName:   'LogNewQuestion',
    blockNumber: ev.blockNumber,
    logIndex:    ev.logIndex ?? 0,
    txHash:      ev.transactionHash ?? '',
    args: bnToJSON({
      question_id:  ev.args.question_id,
      user:         ev.args.user,
      template_id:  ev.args.template_id,
      question:     ev.args.question,
      content_hash: ev.args.content_hash,
      arbitrator:   ev.args.arbitrator,
      timeout:      ev.args.timeout,
      opening_ts:   ev.args.opening_ts,
      nonce:        ev.args.nonce,
      timestamp:    ev.args.timestamp,
    }),
  };
}

function makeAnswerRow(chainId, questionId, contract, ev) {
  return {
    chainId, questionId, contract,
    eventName:   'LogNewAnswer',
    blockNumber: ev.blockNumber,
    logIndex:    ev.logIndex ?? 0,
    txHash:      ev.transactionHash ?? ev.txHash ?? '',
    args: bnToJSON({
      answer:       ev.args.answer,
      question_id:  ev.args.question_id,
      history_hash: ev.args.history_hash,
      user:         ev.args.user,
      bond:         ev.args.bond,
      ts:           ev.args.ts,
      is_commitment:ev.args.is_commitment,
    }),
  };
}

// Returns an object with the same shape as a raw ethers event so it can be
// processed identically by the normalisation step in question.js.
function deserializeRow(row) {
  return {
    blockNumber:     row.blockNumber,
    logIndex:        row.logIndex,
    transactionHash: row.txHash,
    args:            bnFromJSON(row.args),
  };
}

// ── IDB helpers ───────────────────────────────────────────────────────────────

function idbGet(db, storeName, key) {
  return new Promise((res, rej) => {
    const tx  = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = e => res(e.target.result ?? null);
    tx.onerror    = e => rej(e.target.error);
  });
}

function idbGetAllByIndex(db, storeName, indexName, key) {
  return new Promise((res, rej) => {
    const tx  = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).index(indexName).getAll(key);
    req.onsuccess = e => res(e.target.result ?? []);
    tx.onerror    = e => rej(e.target.error);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

window.QCache = {
  // Returns { qEvent, answerEvents, lastBlock } where qEvent/answerEvents have
  // the same shape as raw ethers events, ready for normalisation.
  // Returns null/empty values if nothing is cached or IndexedDB fails.
  async get(chainId, contract, questionId) {
    try {
      const db     = await openDb();
      const syncId = `${chainId}-${contract.toLowerCase()}-${questionId}`;
      const sync   = await idbGet(db, 'sync', syncId);
      if (!sync) return { qEvent: null, answerEvents: [], lastBlock: null };

      const rows  = await idbGetAllByIndex(db, 'events', 'by-question', [chainId, questionId]);
      const qRow  = rows.find(r => r.eventName === 'LogNewQuestion') ?? null;
      const aRows = rows
        .filter(r => r.eventName === 'LogNewAnswer')
        .sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);

      return {
        qEvent:       qRow ? deserializeRow(qRow) : null,
        answerEvents: aRows.map(deserializeRow),
        lastBlock:    sync.lastBlock,
      };
    } catch (err) {
      console.warn('[QCache] get failed:', err);
      return { qEvent: null, answerEvents: [], lastBlock: null };
    }
  },

  async clear() {
    try {
      const db = await openDb();
      const tx = db.transaction(['events', 'sync'], 'readwrite');
      tx.objectStore('events').clear();
      tx.objectStore('sync').clear();
      await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = e => rej(e.target.error); });
    } catch (err) {
      console.warn('[QCache] clear failed:', err);
    }
  },

  attachPanel(el) {
    if (!el) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', async e => {
      e.stopPropagation();
      const RS = window.RealitySettings;
      if (!RS) return;
      if (RS.activeAnchor === el) { RS.closePanel(); return; }

      let eventCount = 0, questionCount = 0;
      try {
        const db = await openDb();
        const tx = db.transaction(['events', 'sync'], 'readonly');
        [eventCount, questionCount] = await Promise.all([
          new Promise(res => { tx.objectStore('events').count().onsuccess = e => res(e.target.result); }),
          new Promise(res => { tx.objectStore('sync').count().onsuccess  = e => res(e.target.result); }),
        ]);
      } catch { /* DB not yet initialised */ }

      RS.openPanel(el, 270, panel => {
        panel.innerHTML = `
          <div class="sp-title">Local event cache</div>
          <p class="sp-body">${questionCount} question${questionCount !== 1 ? 's' : ''} cached &mdash; ${eventCount} events total. Only RPC-sourced events are stored here.</p>
          <div class="sp-actions"><button class="sp-save sp-cache-clear-btn">Clear cache</button></div>
        `;
        panel.querySelector('.sp-cache-clear-btn').addEventListener('click', async () => {
          await QCache.clear();
          RS.closePanel();
          el.classList.remove('hit');
        });
      });
    });
  },

  // Stores events and advances the high-water mark.
  // qEvent: raw ethers event or null (null = incremental update, qEvent already stored).
  // newAnswerEvents: raw ethers events from the RPC (NOT previously-cached events).
  // lastBlock: the block number scanned up to.
  async put(chainId, contract, questionId, qEvent, newAnswerEvents, lastBlock) {
    try {
      const db     = await openDb();
      const lc     = contract.toLowerCase();
      const syncId = `${chainId}-${lc}-${questionId}`;
      const tx     = db.transaction(['events', 'sync'], 'readwrite');
      const evStore   = tx.objectStore('events');
      const syncStore = tx.objectStore('sync');

      if (qEvent) evStore.put(makeQEventRow(chainId, questionId, lc, qEvent));
      for (const ev of newAnswerEvents) {
        evStore.put(makeAnswerRow(chainId, questionId, lc, ev));
      }
      syncStore.put({
        id: syncId, chainId, contract: lc, questionId,
        lastBlock, updatedAt: Date.now(),
      });

      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror    = e => rej(e.target.error);
      });
    } catch (err) {
      console.warn('[QCache] put failed:', err);
    }
  },
};

})();
