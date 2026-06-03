// ARX Copy Trading + Smart Money — content + IA from copy-trading-section.md,
// styled in the ARX system. Mirrors RWASection conventions (variant-only, EN copy).
const { useState: ctUseState, useEffect: ctUseEffect, useRef: ctUseRef } = React;

/* ---- inline icons (ARX line idiom) ---- */
function CtArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function CtX() {
  return (
    <svg className="ct-li-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--loss)"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="no">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function CtCheck() {
  return (
    <svg className="ct-li-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gain)"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="yes">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function CtCopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function CtStar({ on }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}
function CtUserGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}
function CtHlMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 12c3-5 6-5 9 0s6 5 9 0c-3 5-6 5-9 0s-6-5-9 0z" />
    </svg>
  );
}
function CtUsers() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5M19 20a6 6 0 0 0-3.5-5.4" />
    </svg>
  );
}
function CtVault() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3" /><path d="M12 10v6M9 13h6" />
    </svg>
  );
}
function CtAdvIcon({ name }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "shield") {
    return (<svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>);
  }
  if (name === "signal") {
    return (<svg {...common}><path d="M3 20h.01M8 20v-5M13 20v-9M18 20V7M22 4v16" /></svg>);
  }
  // lock — self-custody
  return (<svg {...common}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
}

const CT_OLD = [
  "Chase whoever's on top of the leaderboard",
  "No verification — survivor bias rules",
  "One bad sizing decision liquidates your portfolio",
];
const CT_ARX = [
  <React.Fragment><b>Three-Gate verified leaders</b> — 6-month on-chain track + behavioral fingerprint + capital cap</React.Fragment>,
  <React.Fragment><b>Smart-money signal</b> alongside every leader trade — before you mirror</React.Fragment>,
  <React.Fragment><b>Per-follow kill switch</b> + drawdown circuit breaker</React.Fragment>,
];

// Smart-money snapshot (shape mirrors /data/smart-money-scores.json).
const CT_WALLETS = [
  { full: "0x7a3f9c2e1b8d4a06f5c3e9217d4b6a0e5f2c891", disc: "linear-gradient(135deg,#b38df4,#3b1b81)",
    roi: "170.20", pnl: 418730, dd: "12.4", win: "68.5", aum: "$660.8K", copiers: 12, score: 84 },
  { full: "0x2c9b4e07a13f8d6502e7c1b9a4f0d3e86b5a4e07", disc: "linear-gradient(135deg,#22d1ee,#137b8c)",
    roi: "91.98", pnl: 3433017, dd: "16.3", win: "71.2", aum: "$7.2M", copiers: 31, score: 79 },
  { full: "0x5f12a3d6c8901e74b2f5a9c30d6e1f84a7b2a3d6", disc: "linear-gradient(135deg,#6ee2a8,#2f9e6a)",
    roi: "71.84", pnl: 26248, dd: "24.8", win: "63.0", aum: "$62.8K", copiers: 4, score: 73 },
];
function ctTruncate(a) { return a.slice(0, 6) + "…" + a.slice(-4); }
function ctFmt(n) { return Math.round(n).toLocaleString("en-US"); }

const CT_ADV = [
  { ic: "shield", lead: "Verified leaders, not influencers.", body: "Every ARX leader passes a Three-Gate check — on-chain history, behavioral fingerprint, capital cap." },
  { ic: "signal", lead: "Signal-first copy.", body: "You see the smart-money confluence behind every trade — before you mirror it." },
  { ic: "lock", lead: "Self-custody, always.", body: "Your USDC stays in your wallet. ARX never holds your funds." },
];

function CtWalletCard({ w, rank, onCopy }) {
  const [pnl, setPnl] = ctUseState(w.pnl);
  const [flash, setFlash] = ctUseState(false);
  const [fav, setFav] = ctUseState(rank === 1);
  ctUseEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // simulate the 5-min live refresh with a brief flash on the changed cell
    const id = setInterval(() => {
      setPnl((p) => Math.max(1000, Math.round(p * (1 + (Math.random() - 0.42) * 0.04))));
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }, 5200 + rank * 900);
    return () => clearInterval(id);
  }, [rank]);
  return (
    <div className="ct-wallet">
      <div className="ct-wallet-head">
        <span className="ct-avatar" style={{ background: w.disc }}><CtUserGlyph /></span>
        <button className="ct-addr" onClick={() => onCopy(w.full)}
          aria-label={"Copy wallet address " + w.full} title="Click to copy full address">
          <code>{ctTruncate(w.full)}</code>
          <CtCopyIcon />
        </button>
        <button className={"ct-fav" + (fav ? " on" : "")} onClick={() => setFav((f) => !f)}
          aria-label={fav ? "Remove from watchlist" : "Add to watchlist"} aria-pressed={fav}>
          <CtStar on={fav} />
        </button>
      </div>

      <div className="ct-badges">
        <span className="ct-badge venue"><CtHlMark /> Hyperliquid</span>
        <span className="ct-badge score">Smart-money <b>{w.score}</b></span>
      </div>

      <div className="ct-roi">
        <span className="ct-roi-label">ROI · 30d</span>
        <span className="ct-roi-val" aria-label={"up " + w.roi + " percent"}>+{w.roi}%</span>
      </div>

      <div className="ct-wallet-div" />

      <div className="ct-metrics">
        <div className="ct-metric">
          <span className="ct-metric-label">30-day PnL</span>
          <span className={"ct-metric-val gain" + (flash ? " flash" : "")}>+${ctFmt(pnl)}</span>
        </div>
        <div className="ct-metric">
          <span className="ct-metric-label">Max drawdown</span>
          <span className="ct-metric-val">{w.dd}%</span>
        </div>
        <div className="ct-metric ct-metric-r">
          <span className="ct-metric-label">Win rate</span>
          <span className="ct-metric-val">{w.win}%</span>
        </div>
      </div>

      <div className="ct-aum">
        <span className="ct-aum-l"><CtVault /> AUM <b>{w.aum}</b></span>
        <span className="ct-aum-r"><CtUsers /> {w.copiers}<span className="ct-aum-slots">/50</span></span>
      </div>

      <div className="ct-wallet-actions">
        <a className="ct-follow primary" href="/trade/copy-trade/#smart-money">Copy the wallet</a>
      </div>
    </div>
  );
}

function CopyTradeSection({ variant }) {
  const [toast, setToast] = ctUseState(false);
  const toastTimer = ctUseRef(null);
  const copyAddr = (full) => {
    try {
      navigator.clipboard && navigator.clipboard.writeText(full);
    } catch (e) { /* clipboard may be blocked in sandbox; toast still confirms intent */ }
    setToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2200);
  };
  return (
    <section id="copy-trade" className={"ct" + (variant === "type" ? " ct--type" : " ct--editorial")}>
      <div className="ct-inner">
        <span className="ct-eyebrow">Copy trading · Powered by on-chain signals</span>
        <h2 className="ct-h2">
          Stop copying blind.<br />
          <span className="accent">Follow verified leaders</span> — with the data behind every trade.
        </h2>
        <p className="ct-sub">
          <b>75% of copy portfolios fail.</b> ARX flips the model: every leader is on-chain verified,
          and every follow comes with the live smart-money signal behind the trade.
        </p>

        {/* smart money teaser — 3 compact wallet cards + prominent link-out */}
        <div className="ct-smart">
          <div className="ct-smart-head">
            <span className="ct-smart-eyebrow">Smart money · Live from Hyperliquid this week</span>
            <span className="ct-live"><span className="ct-live-dot" />Live</span>
          </div>
          <div className="ct-wallets">
            {CT_WALLETS.map((w, i) => <CtWalletCard w={w} rank={i} key={w.full} onCopy={copyAddr} />)}
          </div>
          <a className="ct-board-link" href="/trade/copy-trade/#smart-money">
            <span className="ct-board-link-l">
              <span className="ct-board-link-k">The full board</span>
              <span className="ct-board-link-t">See the full Smart Money board on Copy Trade</span>
            </span>
            <span className="ct-board-link-r">Open Copy Trade <CtArrow /></span>
          </a>
        </div>

        {/* ARX advantages — 3 bullets */}
        <div className="ct-adv">
          {CT_ADV.map((a, i) => (
            <div className="ct-adv-card" key={i}>
              <span className="ct-adv-ic"><CtAdvIcon name={a.ic} /></span>
              <p className="ct-adv-lead">{a.lead}</p>
              <p className="ct-adv-body">{a.body}</p>
            </div>
          ))}
        </div>

        {/* CTA + secondary link */}
        <div className="ct-foot">
          <a className="ct-cta" href="/#waitlist">Join the Waitlist <CtArrow /></a>
          <a className="ct-secondary" href="/#waitlist?intent=leader">Apply as a Founding Leader <CtArrow /></a>
        </div>
      </div>

      <div className={"ct-toast" + (toast ? " show" : "")} role="status" aria-live="polite">
        <CtCheck />Address copied to clipboard
      </div>
    </section>
  );
}

Object.assign(window, { CopyTradeSection });
