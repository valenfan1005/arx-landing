/* ============================================
   MARKET PAGE — Live data overlay from Hyperliquid
   Updates static prices with real-time API data.
   Static HTML serves as SEO fallback for crawlers.
   ============================================ */
(function () {
  'use strict';

  var API = 'https://api.hyperliquid.xyz/info';

  /* Read config from <body> data attributes */
  var body = document.body;
  var apiName = body.getAttribute('data-api-name');
  var dex = body.getAttribute('data-dex');
  var divisor = parseFloat(body.getAttribute('data-price-divisor') || '1');

  if (!apiName) return; /* Not a market page */

  /* ── Formatters (same as market-ticker.js) ── */
  function fmtPrice(p) {
    if (p >= 10000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1)     return '$' + p.toFixed(2);
    if (p >= 0.01)  return '$' + p.toFixed(4);
    return '$' + p.toFixed(6);
  }

  function fmtVol(v) {
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
    return '$' + v.toFixed(0);
  }

  function fmtChange(c) {
    var sign = c >= 0 ? '+' : '';
    return sign + c.toFixed(2) + '%';
  }

  function fmtFunding(f) {
    var sign = f >= 0 ? '+' : '';
    return sign + f.toFixed(4) + '%';
  }

  /* ── Build name→context map ─────────────── */
  function buildMap(apiData) {
    var meta = apiData[0];
    var ctxs = apiData[1];
    var map = {};
    meta.universe.forEach(function (asset, i) {
      map[asset.name] = ctxs[i];
    });
    return map;
  }

  /* ── Update DOM fields ─────────────────── */
  function updateFields(ctx) {
    if (!ctx) return;

    var price  = parseFloat(ctx.markPx || '0') / divisor;
    var prev   = parseFloat(ctx.prevDayPx || '0') / divisor;
    var vol    = parseFloat(ctx.dayNtlVlm || '0');
    var oi     = parseFloat(ctx.openInterest || '0');
    var oiUsd  = oi * parseFloat(ctx.markPx || '0');
    var funding = parseFloat(ctx.funding || '0') * 100;
    var change = prev > 0 ? ((price - prev) / prev) * 100 : 0;

    /* Price */
    var priceEl = document.querySelector('[data-field="price"]');
    if (priceEl) priceEl.textContent = fmtPrice(price);

    /* 24h change */
    var changeEl = document.querySelector('[data-field="change"]');
    if (changeEl) {
      changeEl.textContent = fmtChange(change);
      changeEl.className = 'market-change mono ' + (change >= 0 ? 'positive' : 'negative');
    }

    /* Volume */
    var volEl = document.querySelector('[data-field="volume"]');
    if (volEl) volEl.textContent = fmtVol(vol);

    /* OI */
    var oiEl = document.querySelector('[data-field="oi"]');
    if (oiEl) oiEl.textContent = fmtVol(oiUsd);

    /* Funding */
    var fundingEl = document.querySelector('[data-field="funding"]');
    if (fundingEl) fundingEl.textContent = fmtFunding(funding);
  }

  /* ── Fetch & update ────────────────────── */
  function fetchData() {
    var payload = { type: 'metaAndAssetCtxs' };
    if (dex) payload.dex = dex;

    /* The API name includes dex prefix (e.g., "xyz:GOLD") for RWA */
    var lookupKey = dex ? (dex + ':' + apiName) : apiName;

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var map = buildMap(data);
      updateFields(map[lookupKey]);
    })
    .catch(function () {
      /* API failed — keep static values */
    });
  }

  /* ── Init: fetch immediately, then every 30s ── */
  fetchData();
  setInterval(fetchData, 30000);

})();
