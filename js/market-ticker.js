/* ============================================
   MARKET TICKER — Interactive RWA/Crypto tabs
   ============================================ */
(function () {
  'use strict';

  var MARKETS = {
    rwa: [
      { symbol: 'S&P 500', pair: 'USDC', price: '6,295.20', vol: '$5.36B', change: -2.03, icon: 'sp500' },
      { symbol: 'BRENTOIL', pair: 'USDC', price: '68.42', vol: '$471M', change: -4.17, icon: 'oil' },
      { symbol: 'GOLD', pair: 'USDC', price: '3,024.50', vol: '$1.2B', change: +1.84, icon: 'gold' },
      { symbol: 'SILVER', pair: 'USDC', price: '33.78', vol: '$312M', change: -0.56, icon: 'silver' },
      { symbol: 'TSLA', pair: 'USDC', price: '348.77', vol: '$25.5M', change: +17.02, icon: 'tsla' }
    ],
    crypto: [
      { symbol: 'BTC', pair: 'USDC', price: '82,441.20', vol: '$5.36B', change: -2.03, icon: 'btc' },
      { symbol: 'SOL', pair: 'USDC', price: '110.60', vol: '$471M', change: -11.04, icon: 'sol' },
      { symbol: 'ETH', pair: 'USDC', price: '1,812.30', vol: '$2.1B', change: -3.28, icon: 'eth' },
      { symbol: 'HYPE', pair: 'USDC', price: '14.82', vol: '$189M', change: -6.51, icon: 'hype' },
      { symbol: 'PEPE', pair: 'USDC', price: '0.00000712', vol: '$25.5M', change: +17.02, icon: 'pepe' }
    ]
  };

  var ICON_URLS = {
    /* RWA — trade.xyz market icons */
    sp500:  'https://app.trade.xyz/markets/sp500.svg',
    oil:    'https://app.trade.xyz/markets/oil.svg',
    gold:   'https://app.trade.xyz/markets/gold.svg',
    silver: 'https://app.trade.xyz/markets/silver.svg',
    tsla:   '/img/tsla.png',

    /* Crypto — CoinGecko CDN (small PNGs, circular logos) */
    btc:    'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png?1696501400',
    eth:    'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png?1696501628',
    sol:    'https://coin-images.coingecko.com/coins/images/4128/small/solana.png?1718769756',
    pepe:   'https://coin-images.coingecko.com/coins/images/29850/small/pepe-token.jpeg?1696528776',
    hype:   'https://coin-images.coingecko.com/coins/images/50882/small/hyperliquid.jpg?1729431300'
  };

  function getIconHtml(iconId) {
    var url = ICON_URLS[iconId];
    if (!url) return '';
    return '<img src="' + url + '" alt="' + iconId + '" width="36" height="36" loading="lazy">';
  }

  var body = document.getElementById('ticker-body');
  var tabs = document.querySelectorAll('.ticker-tab');
  var activeTab = 'rwa';

  function renderRows(tab) {
    var rows = MARKETS[tab];
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
            '<span class="ticker-market-name">' + m.symbol + '</span>' +
            '<span class="ticker-market-pair">/ ' + m.pair + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="ticker-price">' + m.price + '</span>' +
        '<span class="ticker-vol">' + m.vol + '</span>' +
        '<span class="ticker-change ' + changeClass + '">' + changeStr + '</span>';
      body.appendChild(row);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (this.dataset.tab === activeTab) return;
      tabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');
      activeTab = this.dataset.tab;
      renderRows(activeTab);
    });
  });

  /* Initial render */
  renderRows(activeTab);
})();
