'use strict';
(function () {

const DB_NAME    = 'reality-watches';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('watched_questions'))
        db.createObjectStore('watched_questions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('condition_watches'))
        db.createObjectStore('condition_watches', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('notifications'))
        db.createObjectStore('notifications', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('meta'))
        db.createObjectStore('meta');
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function dbOp(storeName, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx    = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req   = fn(store);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  }));
}

function dbGetAll(storeName) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  }));
}

// ── Watched questions (starred) ───────────────────────────────────────────────

async function starQuestion(q) {
  // q must include: id (Ponder compound "contract-questionId"), chainId, templateId, title
  await dbOp('watched_questions', 'readwrite', s => s.put({
    id:         q.id,
    chainId:    q.chainId,
    templateId: String(q.templateId || ''),
    title:      q.title || '',
    starredAt:  Date.now(),
  }));
  _starredCache?.add(q.id);
}

async function unstarQuestion(id) {
  await dbOp('watched_questions', 'readwrite', s => s.delete(id));
  _starredCache?.delete(id);
}

function isStarred(id) {
  return dbOp('watched_questions', 'readonly', s => s.get(id)).then(r => r != null);
}

function getStarredQuestions() { return dbGetAll('watched_questions'); }

// ── Condition watches ─────────────────────────────────────────────────────────

async function addConditionWatch(conditions, label) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('condition_watches', 'readwrite');
    const req = tx.objectStore('condition_watches').add({
      conditions,
      label:     label || '',
      createdAt: Date.now(),
    });
    req.onsuccess = e => {
      const newId = e.target.result;
      _conditionsCache?.push({ id: newId, conditions, label: label || '', createdAt: Date.now() });
      resolve(newId);
    };
    req.onerror = e => reject(e.target.error);
  });
}

async function updateConditionWatch(id, conditions, label) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('condition_watches', 'readwrite');
    const store = tx.objectStore('condition_watches');
    const getReq = store.get(id);
    getReq.onsuccess = e => {
      const existing = e.target.result;
      if (!existing) { reject(new Error('Not found')); return; }
      const updated = { ...existing, conditions, label: label ?? existing.label };
      const putReq = store.put(updated);
      putReq.onsuccess = () => {
        if (_conditionsCache) {
          const idx = _conditionsCache.findIndex(c => c.id === id);
          if (idx >= 0) _conditionsCache[idx] = updated;
        }
        resolve();
      };
      putReq.onerror = e => reject(e.target.error);
    };
    getReq.onerror = e => reject(e.target.error);
  });
}

async function removeConditionWatch(id) {
  await dbOp('condition_watches', 'readwrite', s => s.delete(id));
  if (_conditionsCache) {
    const idx = _conditionsCache.findIndex(c => c.id === id);
    if (idx >= 0) _conditionsCache.splice(idx, 1);
  }
}

function getConditionWatches() { return dbGetAll('condition_watches'); }

// conditions: plain JSON — scalar = exact match, array = _in, "keywords" = title substring search
function questionMatchesCondition(q, conditions) {
  for (const [key, val] of Object.entries(conditions)) {
    if (key === 'keywords') {
      const title = (q.title || q.data || '').toLowerCase();
      for (const kw of (Array.isArray(val) ? val : [val])) {
        if (!title.includes(kw.toLowerCase())) return false;
      }
    } else if (Array.isArray(val)) {
      if (!val.map(String).includes(String(q[key]))) return false;
    } else {
      if (String(q[key]) !== String(val)) return false;
    }
  }
  return true;
}

function getMatchingConditions(q) {
  return getConditionWatches().then(cws => cws.filter(cw => questionMatchesCondition(q, cw.conditions)));
}

// ── In-memory cache for synchronous render-time checks ───────────────────────

let _starredCache    = null; // Set<id>
let _conditionsCache = null; // Array<{id, conditions, label}>

async function preloadCache() {
  const [starred, conditions] = await Promise.all([
    getStarredQuestions(),
    getConditionWatches(),
  ]);
  _starredCache    = new Set(starred.map(q => q.id));
  _conditionsCache = conditions;
}

function isStarredSync(id) {
  return _starredCache ? _starredCache.has(id) : false;
}

function isWatchedSync(q) {
  if (!_starredCache || !_conditionsCache) return false;
  const id = (typeof q === 'string') ? q : q.id;
  if (_starredCache.has(id)) return true;
  if (typeof q !== 'string') {
    return _conditionsCache.some(cw => questionMatchesCondition(q, cw.conditions));
  }
  return false;
}

function getMatchingConditionsSync(q) {
  if (!_conditionsCache) return [];
  return _conditionsCache.filter(cw => questionMatchesCondition(q, cw.conditions));
}

// ── Notifications ─────────────────────────────────────────────────────────────

async function addNotification(n) {
  const existing = await dbOp('notifications', 'readonly', s => s.get(n.id));
  if (existing) return;
  await dbOp('notifications', 'readwrite', s => s.put({ seen: 0, receivedAt: Date.now(), ...n }));
}

function getNotifications(limit) {
  return dbGetAll('notifications').then(all => {
    all.sort((a, b) => (b.timestamp || b.receivedAt) - (a.timestamp || a.receivedAt));
    return limit ? all.slice(0, limit) : all;
  });
}

function getUnseenCount() {
  return getNotifications().then(all => all.filter(n => !n.seen).length);
}

async function markAllSeen() {
  const all = await getNotifications();
  const db  = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('notifications', 'readwrite');
    const store = tx.objectStore('notifications');
    for (const n of all) {
      if (!n.seen) store.put({ ...n, seen: 1 });
    }
    tx.oncomplete = () => resolve();
    tx.onerror    = e => reject(e.target.error);
  });
}

async function markSeen(id) {
  const n = await dbOp('notifications', 'readonly', s => s.get(id));
  if (n && !n.seen) await dbOp('notifications', 'readwrite', s => s.put({ ...n, seen: 1 }));
}

// ── Meta ──────────────────────────────────────────────────────────────────────

function getLastChecked() {
  return dbOp('meta', 'readonly', s => s.get('lastChecked')).then(r => r || 0);
}

function setLastChecked(ts) {
  return dbOp('meta', 'readwrite', s => s.put(ts, 'lastChecked'));
}

// ── Ponder polling ────────────────────────────────────────────────────────────

async function checkForUpdates(ponderUrl) {
  const url = ponderUrl || (window.RealitySettings?.getPonderUrl() || '/graphql');

  const gql = async q => {
    try {
      const r = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query: q }),
      });
      return (await r.json()).data;
    } catch { return null; }
  };

  const [starred, conditions, lastChecked] = await Promise.all([
    getStarredQuestions(),
    getConditionWatches(),
    getLastChecked(),
  ]);
  const now = Math.floor(Date.now() / 1000);

  if (starred.length > 0) {
    const ids     = starred.map(q => `"${q.id}"`).join(',');
    const afterTs = lastChecked;

    // New answers
    const respData = await gql(`{
      responses(where:{questionId_in:[${ids}],timestamp_gt:"${afterTs}"},orderBy:"timestamp",orderDirection:"desc",limit:50) {
        items { id questionId answer bond user timestamp }
      }
    }`);
    for (const r of respData?.responses?.items || []) {
      const sq = starred.find(q => q.id === r.questionId);
      await addNotification({
        id:         `resp-${r.id}`,
        questionId: r.questionId,
        chainId:    sq?.chainId,
        type:       'new_answer',
        title:      sq?.title || r.questionId,
        detail:     'New answer posted',
        timestamp:  Number(r.timestamp),
      });
    }

    // Newly finalized
    const finalData = await gql(`{
      questions(where:{id_in:[${ids}],scheduledFinalizationTimestamp_lt:"${now}",scheduledFinalizationTimestamp_gt:"${afterTs}"},limit:50) {
        items { id title scheduledFinalizationTimestamp }
      }
    }`);
    for (const q of finalData?.questions?.items || []) {
      await addNotification({
        id:         `final-${q.id}`,
        questionId: q.id,
        chainId:    starred.find(sq => sq.id === q.id)?.chainId,
        type:       'finalized',
        title:      q.title || q.id,
        detail:     'Question finalized',
        timestamp:  Number(q.scheduledFinalizationTimestamp),
      });
    }

    // Arbitration requested
    const arbReqData = await gql(`{
      questions(where:{id_in:[${ids}],isPendingArbitration:true},limit:50) {
        items { id title }
      }
    }`);
    for (const q of arbReqData?.questions?.items || []) {
      await addNotification({
        id:         `arbreq-${q.id}`,
        questionId: q.id,
        chainId:    starred.find(sq => sq.id === q.id)?.chainId,
        type:       'arb_requested',
        title:      q.title || q.id,
        detail:     'Arbitration requested',
        timestamp:  now,
      });
    }

    // Arbitration resolved
    const arbResData = await gql(`{
      questions(where:{id_in:[${ids}],arbitrationOccurred:true},limit:50) {
        items { id title }
      }
    }`);
    for (const q of arbResData?.questions?.items || []) {
      await addNotification({
        id:         `arbres-${q.id}`,
        questionId: q.id,
        chainId:    starred.find(sq => sq.id === q.id)?.chainId,
        type:       'arb_resolved',
        title:      q.title || q.id,
        detail:     'Arbitration resolved',
        timestamp:  now,
      });
    }
  }

  // New questions matching condition watches
  for (const cw of conditions) {
    const c       = cw.conditions;
    const filters = [];
    if (c.chainId != null) {
      filters.push(Array.isArray(c.chainId)
        ? `chainId_in:[${c.chainId.join(',')}]`
        : `chainId:${c.chainId}`);
    }
    if (c.templateId != null) {
      filters.push(Array.isArray(c.templateId)
        ? `templateId_in:[${c.templateId.map(v => `"${v}"`).join(',')}]`
        : `templateId:"${c.templateId}"`);
    }
    if (c.category != null) {
      filters.push(`category:"${c.category}"`);
    }
    if (c.creator != null) {
      filters.push(`creator:"${c.creator}"`);
    }
    if (c.contract != null) {
      filters.push(`contract:"${c.contract}"`);
    }
    const whereClause = `where:{${[...filters, `createdTimestamp_gt:"${lastChecked}"`].join(',')}}`;
    const newQData = await gql(`{
      questions(${whereClause},orderBy:"createdTimestamp",orderDirection:"desc",limit:20) {
        items { id title chainId templateId category data creator contract createdTimestamp }
      }
    }`);
    for (const q of newQData?.questions?.items || []) {
      if (questionMatchesCondition(q, c)) {
        await addNotification({
          id:          `newq-${cw.id}-${q.id}`,
          questionId:  q.id,
          chainId:     q.chainId,
          type:        'new_question',
          title:       q.title || q.data || q.id,
          detail:      'New matching question',
          conditionId: cw.id,
          timestamp:   Number(q.createdTimestamp),
        });
      }
    }
  }

  await setLastChecked(now);
}

// ── Bell badge helper ─────────────────────────────────────────────────────────

async function updateBellBadge(el) {
  const badge = el?.querySelector?.('.bell-badge') || document.getElementById('bell-badge');
  if (!badge) return;
  const count = await getUnseenCount();
  if (count > 0) {
    badge.textContent  = count > 99 ? '99+' : String(count);
    badge.style.display = '';
  } else {
    badge.style.display = 'none';
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

window.RealityWatches = {
  starQuestion, unstarQuestion, isStarred, getStarredQuestions,
  addConditionWatch, updateConditionWatch, removeConditionWatch, getConditionWatches,
  questionMatchesCondition, getMatchingConditions,
  preloadCache, isStarredSync, isWatchedSync, getMatchingConditionsSync,
  addNotification, getNotifications, getUnseenCount, markAllSeen, markSeen,
  getLastChecked, setLastChecked,
  checkForUpdates, updateBellBadge,
};

})();
