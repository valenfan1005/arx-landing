/* ============================================
   MARKET TICKER — Live data from Hyperliquid
   RWA: HIP-3 xyz deployer perps (Trade.xyz)
   Crypto: Standard Hyperliquid perps
   Static HTML fallback for SEO crawlers
   ============================================ */
(function () {
  'use strict';

  /* ── Asset config ─────────────────────────── */
  /* RWA: HIP-3 perps from Trade.xyz (dex: "xyz") — names prefixed xyz: in API */
  var RWA_ASSETS = [
    { apiName: 'xyz:GOLD',    display: 'GOLD',    pair: 'USDC', icon: 'gold' },
    { apiName: 'xyz:SP500',   display: 'S&P 500', pair: 'USDC', icon: 'sp500' },
    { apiName: 'xyz:CL',      display: 'WTIOIL',  pair: 'USDC', icon: 'oil' },
    { apiName: 'xyz:SILVER',  display: 'SILVER',  pair: 'USDC', icon: 'silver' },
    { apiName: 'xyz:TSLA',    display: 'TSLA',    pair: 'USDC', icon: 'tsla' }
  ];

  /* Crypto: standard Hyperliquid perps */
  var CRYPTO_ASSETS = [
    { apiName: 'BTC',   display: 'BTC',  pair: 'USDC', icon: 'btc' },
    { apiName: 'ETH',   display: 'ETH',  pair: 'USDC', icon: 'eth' },
    { apiName: 'SOL',   display: 'SOL',  pair: 'USDC', icon: 'sol' },
    { apiName: 'HYPE',  display: 'HYPE', pair: 'USDC', icon: 'hype' },
    { apiName: 'kPEPE', display: 'PEPE', pair: 'USDC', icon: 'pepe' }
  ];

  var ICON_URLS = {
    gold:   'https://app.trade.xyz/markets/gold.svg',
    sp500:  'https://app.trade.xyz/markets/sp500.svg',
    oil:    'https://app.trade.xyz/markets/oil.svg',
    silver: 'https://app.trade.xyz/markets/silver.svg',
    tsla:   '/img/tsla.png',
    btc:    'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png?1696501400',
    eth:    'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png?1696501628',
    sol:    'https://coin-images.coingecko.com/coins/images/4128/small/solana.png?1718769756',
    pepe:   'https://coin-images.coingecko.com/coins/images/29850/small/pepe-token.jpeg?1696528776',
    hype:   'https://coin-images.coingecko.com/coins/images/50882/small/hyperliquid.jpg?1729431300'
  };

  /* ── Formatters ───────────────────────────── */
  function fmtPrice(p) {
    if (p >= 10000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 100)   return p.toFixed(2);
    if (p >= 1)     return p.toFixed(2);
    if (p >= 0.01)  return p.toFixed(4);
    return p.toFixed(6);
  }

  function fmtVol(v) {
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
    return '$' + v.toFixed(0);
  }

  function getIconHtml(iconId) {
    var url = ICON_URLS[iconId];
    if (!url) return '';
    return '<img src="' + url + '" alt="' + iconId + '" width="36" height="36" loading="lazy">';
  }

  /* ── DOM refs ─────────────────────────────── */
  var body = document.getElementById('ticker-body');
  var tabs = document.querySelectorAll('.ticker-tab');
  var activeTab = 'rwa';

  /* ── Live data cache ──────────────────────── */
  var liveData = { rwa: null, crypto: null };

  /* ── Render rows from data array ──────────── */
  function renderRows(rows) {
    if (!rows || !rows.length) return;
    body.innerHTML = '';
    rows.forEach(function (m) {
      var isPos = m.change >= 0;
      var changeClass = isPos ? 'positive' : 'negative';
      var changeStr = (isPos ? '+' : '') + m.change.toFixed(2) + '%';
      var row = document.createElement('div');
      row.className = 'ticker-row';
      row.innerHTML =
        '<div class="ticker-market">' +
          '<div class="ticker-icon">' + getIconHtml(m.icon) + '</div>' +
          '<div class="ticker-market-info">' +
            '<span class="ticker-market-name">' + m.display + '</span>' +
            '<span class="ticker-market-pair">/ ' + m.pair + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="ticker-price">' + m.price + '</span>' +
        '<span class="ticker-vol">' + m.vol + '</span>' +
        '<span class="ticker-change ' + changeClass + '">' + changeStr + '</span>';
      body.appendChild(row);
    });
  }

  function renderTab(tab) {
    if (liveData[tab]) {
      renderRows(liveData[tab]);
    }
    /* If no live data yet, keep the static HTML that's already in the DOM */
  }

  /* ── Build name→context map from API response ── */
  function buildMap(apiData) {
    var meta = apiData[0];
    var ctxs = apiData[1];
    var map = {};
    meta.universe.forEach(function (asset, i) {
      map[asset.name] = ctxs[i];
    });
    return map;
  }

  /* ── Build display row from context ─────────── */
  function buildRow(assetCfg, ctxMap) {
    var ctx = ctxMap[assetCfg.apiName];
    if (!ctx) return null;

    var price  = parseFloat(ctx.markPx || '0');
    var prev   = parseFloat(ctx.prevDayPx || '0');
    var vol    = parseFloat(ctx.dayNtlVlm || '0');
    var change = prev > 0 ? ((price - prev) / prev) * 100 : 0;

    /* kPEPE: show per-token price (API returns per 1000 tokens) */
    if (assetCfg.apiName === 'kPEPE') {
      price = price / 1000;
    }

    return {
      display: assetCfg.display,
      pair:    assetCfg.pair,
      icon:    assetCfg.icon,
      price:   fmtPrice(price),
      vol:     fmtVol(vol),
      change:  change
    };
  }

  /* ── Fetch live data from Hyperliquid ─────── */
  function fetchLiveData() {
    /* RWA: HIP-3 xyz deployer perps */
    var xyzReq = fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs', dex: 'xyz' })
    }).then(function (r) { return r.json(); });

    /* Crypto: standard perps */
    var perpReq = fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' })
    }).then(function (r) { return r.json(); });

    Promise.all([xyzReq, perpReq])
      .then(function (results) {
        var xyzMap  = buildMap(results[0]);
        var perpMap = buildMap(results[1]);

        liveData.rwa = RWA_ASSETS.map(function (a) {
          return buildRow(a, xyzMap);
        }).filter(Boolean);

        liveData.crypto = CRYPTO_ASSETS.map(function (a) {
          return buildRow(a, perpMap);
        }).filter(Boolean);

        renderTab(activeTab);
      })
      .catch(function () {
        /* API failed — keep static HTML, no action needed */
      });
  }

  /* ── Tab switching ────────────────────────── */
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (this.dataset.tab === activeTab) return;
      tabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
      activeTab = this.dataset.tab;
      renderTab(activeTab);
    });
  });

  /* ── Init: fetch live data, refresh every 30s ── */
  fetchLiveData();
  setInterval(fetchLiveData, 30000);

})();
