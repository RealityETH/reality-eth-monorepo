import { test, expect } from '@playwright/test';
import { WEBSITE_URL } from './setup/website-server.js';

// The stored-XSS could poison localStorage with attacker RPC/indexer URLs and a cached wallet
// address that the account page rendered via innerHTML. index.html treats persisted state as a
// versioned namespace: a browser not on the current generation gets ALL storage wiped on the
// next load, then stamped with the new generation. This is a full reset — no key survives
// except the generation marker itself.
test('one-time storage reset wipes all persisted state and stamps the generation', async ({ page }) => {
  // Avoid hanging on real network once the (default) indexer URL is restored.
  await page.route('**/graphql**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { question: null } }) }));

  // Seed a mix of poisoned and ordinary state before any app script runs. This test does NOT
  // set the generation marker, so the reset must run.
  await page.addInitScript(() => {
    localStorage.setItem('reality.rpcUrl.100', 'https://evil.example/rpc');
    localStorage.setItem('reality.ponderUrl', 'https://evil.example/graphql');
    localStorage.setItem('reality.useBrowserRpc', 'false');
    localStorage.setItem('reality-eth-wallet', '0x1"><img src=x onerror=window.__xss=1>');
    localStorage.setItem('reality-eth-wc-session', '1');
    localStorage.setItem('reality-watches', JSON.stringify([{ id: 1 }]));
    localStorage.setItem('reality-eth-starred', JSON.stringify(['snapshot']));
    localStorage.setItem('cr-100-0xabc-0xdef', JSON.stringify({ answer: '0x1' }));
  });

  await page.goto(`${WEBSITE_URL}/index.html#!/browse`);
  await page.waitForFunction(
    () => localStorage.getItem('reality.storage.generation') === '2', {}, { timeout: 30000 });

  const ls = await page.evaluate(() => {
    const o = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); }
    return o;
  });

  // Everything seeded is gone.
  for (const k of [
    'reality.rpcUrl.100', 'reality.ponderUrl', 'reality.useBrowserRpc', 'reality-eth-wallet',
    'reality-eth-wc-session', 'reality-watches', 'reality-eth-starred', 'cr-100-0xabc-0xdef',
  ]) {
    expect(ls[k], `${k} should be wiped`).toBeUndefined();
  }

  // Only the generation marker remains, and the injected wallet payload never executed.
  expect(ls['reality.storage.generation']).toBe('2');
  expect(await page.evaluate(() => window.__xss)).toBeFalsy();
});

// The reset must also clear IndexedDB (the question/answer event cache + WalletConnect data),
// which localStorage.clear() doesn't touch and the XSS could have poisoned.
test('one-time reset also deletes poisoned IndexedDB', async ({ page }) => {
  await page.route('**/graphql**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { question: null } }) }));

  // First load: reset runs, stamps the current generation, clean slate.
  await page.goto(`${WEBSITE_URL}/index.html#!/browse`);
  await page.waitForFunction(() => localStorage.getItem('reality.storage.generation') === '2', {}, { timeout: 30000 });

  // Seed a poisoned event-cache DB and downgrade the generation so the reset re-runs next load.
  await page.evaluate(async () => {
    await new Promise((res, rej) => {
      const r = indexedDB.open('reality-eth-events', 2);
      r.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        if (!db.objectStoreNames.contains('sync')) db.createObjectStore('sync', { keyPath: 'id' });
      };
      r.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('sync', 'readwrite');
        tx.objectStore('sync').put({ id: 'poison', evil: true });
        tx.oncomplete = () => { db.close(); res(); };
        tx.onerror = () => rej(tx.error);
      };
      r.onerror = () => rej(r.error);
    });
    localStorage.setItem('reality.storage.generation', '1'); // downgrade → reset re-runs
  });

  // Sanity: the DB exists before the reset.
  expect(await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name)))
    .toContain('reality-eth-events');

  // Reload → the one-time reset should delete it. (The app may later re-create an empty DB,
  // so assert the poison record is gone rather than the DB name being absent. Use reload(),
  // not goto(sameUrl#hash), which is a same-document navigation and wouldn't re-run the head.)
  await page.reload();
  await page.waitForFunction(() => localStorage.getItem('reality.storage.generation') === '2', {}, { timeout: 30000 });

  await expect
    .poll(async () => page.evaluate(() => new Promise((resolve) => {
      const req = indexedDB.open('reality-eth-events');
      req.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('sync')) { db.close(); return resolve('clean'); }
        const g = db.transaction('sync', 'readonly').objectStore('sync').get('poison');
        g.onsuccess = () => { db.close(); resolve(g.result ? 'POISON' : 'clean'); };
        g.onerror = () => { db.close(); resolve('clean'); };
      };
      req.onerror = () => resolve('clean');
    })), { timeout: 15000 })
    .toBe('clean');
});
