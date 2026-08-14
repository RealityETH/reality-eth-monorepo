#!/usr/bin/env node
// Fetches approximate USD values for all tokens and writes approx_1_usd to each token JSON.
//
// approx_1_usd: how many of this token equals ~$1 USD.
// Used for sorting bonds by USD value: usd_value = bond_in_units / approx_1_usd
//
// Testnet-only tokens are valued at 1/1,000,000 of the mainnet token they represent.

'use strict';

const fs = require('fs');
const path = require('path');

const TOKENS_DIR = path.join(__dirname, '..', 'tokens');

// Maps our token symbol to a CoinGecko coin ID.
// OETH and ARETH are just ETH on L2 chains — same price.
const COINGECKO_IDS = {
  ETH:   'ethereum',
  OETH:  'ethereum',
  ARETH: 'ethereum',
  BNB:   'binancecoin',
  GNO:   'gnosis',
  XDAI:  'xdai',
  MATIC: 'matic-network',
  AVAX:  'avalanche-2',
  CELO:  'celo',
  FOX:   'shapeshift-fox-token',
  SWISE: 'stakewise',
  POLK:  'polkamarkets',
  DEXE:  'dexe',
  SUKU:  'suku',
  TRST:  'wetrust',
  UBQ:   'ubiq',
  TLOS:  'telos',
};

// Testnet-only tokens. Value = (mainnet base price) / 1,000,000.
// The base coin is what they nominally represent for ordering purposes.
const TESTNET_BASE = {
  BOND:  'ethereum',   // arbitrary Sepolia ERC20
  DAOOS: 'ethereum',   // dead Rinkeby test token
  MONAD: 'ethereum',   // Monad testnet, mainnet not launched
  ZBS:   'ethereum',   // dev-chain token
  CTH:   'ethereum',   // dev-chain token
};

// Hardcoded fallback prices (USD per token) used when CoinGecko is unavailable.
// Values are approximate and should be refreshed periodically by running this script.
const FALLBACKS = {
  ethereum:               3500,
  binancecoin:             650,
  gnosis:                  250,
  xdai:                      1,
  'matic-network':          0.45,
  'avalanche-2':            38,
  celo:                     0.60,
  'shapeshift-fox-token':   0.03,
  stakewise:                0.15,
  polkamarkets:             0.008,
  dexe:                    12,
  suku:                     0.007,
  wetrust:                  0.004,
  ubiq:                     0.02,
  telos:                    0.06,
};

async function fetchCoinGeckoPrices(ids) {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=' + ids.join(',') + '&vs_currencies=usd';
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function main() {
  const allCgIds = [...new Set([
    ...Object.values(COINGECKO_IDS),
    ...Object.values(TESTNET_BASE),
  ])];

  let cgPrices = {};
  let liveData = false;

  console.log('Fetching prices from CoinGecko...');
  try {
    const data = await fetchCoinGeckoPrices(allCgIds);
    cgPrices = data;
    liveData = true;
    console.log('Live prices fetched.\n');
  } catch (err) {
    console.warn('CoinGecko unavailable (' + err.message + '), using hardcoded fallbacks.\n');
    for (const [id, usd] of Object.entries(FALLBACKS)) {
      cgPrices[id] = { usd };
    }
  }

  function getPrice(cgId) {
    return (cgPrices[cgId] && cgPrices[cgId].usd) || FALLBACKS[cgId] || null;
  }

  const tokenFiles = fs.readdirSync(TOKENS_DIR).filter(f => f.endsWith('.json')).sort();

  for (const file of tokenFiles) {
    const symbol = file.replace('.json', '');
    const filePath = path.join(TOKENS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    let priceUsd = null;
    let note = '';

    if (COINGECKO_IDS[symbol]) {
      const cgId = COINGECKO_IDS[symbol];
      priceUsd = getPrice(cgId);
      note = liveData ? 'live (' + cgId + ')' : 'fallback (' + cgId + ')';
    } else if (TESTNET_BASE[symbol]) {
      const baseId = TESTNET_BASE[symbol];
      const basePrice = getPrice(baseId);
      if (basePrice) {
        priceUsd = basePrice / 1_000_000;
        note = 'testnet 1/1M of ' + baseId + ' ($' + basePrice + ')';
      }
    }

    if (!priceUsd || priceUsd <= 0) {
      console.warn('  ' + symbol + ': no price found, skipping');
      continue;
    }

    const approx1Usd = parseFloat((1 / priceUsd).toPrecision(6));
    data.approx_1_usd = approx1Usd;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + '\n');
    console.log('  ' + symbol.padEnd(6) + ' $' + priceUsd.toPrecision(4).padStart(10) + '/token  →  approx_1_usd = ' + approx1Usd + '  (' + note + ')');
  }

  console.log('\nDone.');
  if (!liveData) {
    console.log('NOTE: hardcoded fallbacks used. Re-run when network is available for live prices.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
