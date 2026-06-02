// ARX RWA Spotlight — content + IA from spec Part B, styled in the ARX system.
const { useState: rwaUseState, useEffect: rwaUseEffect } = React;

/* ---- check / x inline icons (ARX line idiom) ---- */
function Check() {
  return (
    <svg className="rwa-ic" width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="var(--gain)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-label="yes">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function Cross() {
  return (
    <svg className="rwa-ic" width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="var(--loss)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-label="no">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function RArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const RWA_STATS = [
  { n: "$32B", c: "Tokenized RWA TVL · May 2026", icon: "layers" },
  { n: "3×", c: "growth in 12 months", icon: "trend" },
  { n: "$5,589", c: "Gold ATH · Apr 2026", icon: "peak" },
];

// ARX thin-line stat icons (Lucide/Feather idiom, 1.75 stroke, inherit colour)
function StatIcon({ name }) {
  const common = { width: 44, height: 44, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "layers") {
    // stacked tokens — total value locked
    return (
      <svg {...common}>
        <path d="M12 3l8 4-8 4-8-4 8-4z" />
        <path d="M4 12l8 4 8-4" />
        <path d="M4 17l8 4 8-4" />
      </svg>
    );
  }
  if (name === "trend") {
    // trending-up — growth
    return (
      <svg {...common}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M17 7h4v4" />
      </svg>
    );
  }
  // peak — all-time high
  return (
    <svg {...common}>
      <path d="M3 20h18" />
      <path d="M5 20l5-12 4 7 2-4 3 9" />
      <circle cx="10" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// asset-identity disc colors (token marks — allowed by ARX guide; NOT section accent)
const RWA_CARDS = [
  { mark: "Au", disc: "linear-gradient(135deg,#e8c074,#a87f2e)", name: "GOLD", ticker: "XAUUSDC",
    tagline: "The hedge that never sleeps.", body: "Hourly funding · 25× leverage · zero overnight swap.",
    px: "$4,832", chg: "+1.2%", dir: "gain", oi: "OI $145M", cta: "Trade Gold" },
  { mark: "Oil", disc: "linear-gradient(135deg,#3a3f4b,#171a20)", name: "OIL", ticker: "WTI-PERP",
    tagline: "Geopolitics, 24/7.", body: "Trade Hormuz shocks, OPEC headlines, EIA prints — without waiting for the CME open.",
    px: "$74.12", chg: "−0.8%", dir: "loss", oi: "OI $89M", cta: "Trade Oil" },
  { mark: "Ag", disc: "linear-gradient(135deg,#dfe3ea,#9aa3b2)", name: "SILVER", ticker: "XAGUSDC",
    tagline: "The gold/silver ratio trade — finally executable.", body: "Run the spread on one venue, one account, one click.",
    px: "$36.40", chg: "+0.4%", dir: "gain", oi: "OI $32M", cta: "Trade Silver" },
  { mark: "S&P", disc: "linear-gradient(135deg,#b38df4,#3b1b81)", name: "S&P 500", ticker: "SPX-PERP",
    tagline: "The US benchmark, on-chain.", body: "Licensed by S&P Dow Jones Indices (Mar 2026). Trade the index 24/7, in any timezone.",
    px: "6,840", chg: "+0.3%", dir: "gain", oi: "OI $76M", cta: "Trade S&P" },
  { mark: "MU", disc: "linear-gradient(135deg,#6ee2a8,#2f9e6a)", name: "MICRON", ticker: "MU-PERP",
    tagline: "The memory supercycle, on-chain.", body: "Ride HBM and DRAM demand 24/7 — no broker, no market-hours gate.",
    px: "$142.80", chg: "+2.6%", dir: "gain", oi: "OI $48M", cta: "Trade MU" },
  { mark: "NV", disc: "linear-gradient(135deg,#22d1ee,#137b8c)", name: "NVIDIA", ticker: "NVDA-PERP",
    tagline: "The AI benchmark, settled in stablecoin.", body: "Trade the world's most-watched single name around the clock.",
    px: "$1,184", chg: "+3.0%", dir: "gain", oi: "OI $112M", cta: "Trade NVDA" },
];

// crypto perps (Hyperliquid) — the flip-side of the deck
const CRYPTO_CARDS = [
  { mark: "₿", disc: "linear-gradient(135deg,#f7931a,#b5650a)", name: "BITCOIN", ticker: "BTC-PERP",
    px: "$68,240", chg: "+2.1%", dir: "gain", oi: "OI $1.2B", cta: "Trade BTC" },
  { mark: "Ξ", disc: "linear-gradient(135deg,#8a92b2,#454a75)", name: "ETHEREUM", ticker: "ETH-PERP",
    px: "$3,512", chg: "+1.5%", dir: "gain", oi: "OI $640M", cta: "Trade ETH" },
  { mark: "◎", disc: "linear-gradient(135deg,#14f195,#9945ff)", name: "SOLANA", ticker: "SOL-PERP",
    px: "$214.60", chg: "+4.2%", dir: "gain", oi: "OI $310M", cta: "Trade SOL" },
  { mark: "H", disc: "linear-gradient(135deg,#9be8d8,#2bb7a3)", name: "HYPERLIQUID", ticker: "HYPE-PERP",
    px: "$38.12", chg: "+6.8%", dir: "gain", oi: "OI $420M", cta: "Trade HYPE" },
  { mark: "S", disc: "linear-gradient(135deg,#4da2ff,#1565d8)", name: "SUI", ticker: "SUI-PERP",
    px: "$4.08", chg: "−1.2%", dir: "loss", oi: "OI $86M", cta: "Trade SUI" },
  { mark: "A", disc: "linear-gradient(135deg,#ff5b5b,#c4202c)", name: "AVALANCHE", ticker: "AVAX-PERP",
    px: "$52.74", chg: "+0.9%", dir: "gain", oi: "OI $74M", cta: "Trade AVAX" },
];

function AssetCard({ c, onNotify }) {
  return (
    <div className={"rwa-card " + (c.coming ? "coming" : "active")} tabIndex={0} role={c.coming ? undefined : "link"}>
      {c.coming && <span className="rwa-ribbon" aria-label="Coming in year 2">Coming soon</span>}
      <div className="rwa-card-top">
        <div className="rwa-tok">
          <span className="rwa-disc" style={{ background: c.disc }}>{c.mark}</span>
          <div>
            <div className="rwa-name">{c.name}</div>
            {c.ticker && <div className="rwa-ticker">{c.ticker}</div>}
          </div>
        </div>
      </div>
      <div className="rwa-card-div" />
      {c.coming ? (
        <div className="rwa-coming-row">Coming · Year 2</div>
      ) : (
        <React.Fragment>
          <div className="rwa-data">
            <span className="rwa-px">{c.px}</span>
            <span className={"rwa-chg " + c.dir}>{c.chg}</span>
            <span className="rwa-oi">{c.oi}</span>
          </div>
          <div className="rwa-data-labels"><span>Live</span><span>24h</span><span>Hyperliquid</span></div>
        </React.Fragment>
      )}
      <button className="rwa-cta" onClick={() => c.coming && onNotify(c.name)}>
        {c.cta} <RArrow />
      </button>
    </div>
  );
}

const ADV_BULLETS = [
  { n: "01", lead: "24/7/365 trading.", body: "Gold, oil, silver, S&P never close. No weekend gap, no overnight halt, no roll month." },
  { n: "02", lead: "No overnight fee.", body: "Market-driven funding replaces the 5–7% APR swap fee CFD brokers charge to hold past 5pm NY." },
  { n: "03", lead: "Self-custody.", body: "Your USDC stays in your wallet. ARX routes orders to Hyperliquid; it never holds your funds." },
  { n: "04", lead: "Built on Hyperliquid liquidity.", body: "Deepest perp DEX on-chain · hourly funding · sub-second finality. Mobile-first interface." },
];

function RWASection({ variant }) {
  const [notify, setNotify] = rwaUseState(null);
  const [side, setSide] = rwaUseState("rwa"); // "rwa" | "crypto"
  const flipped = side === "crypto";
  rwaUseEffect(() => {
    const id = setInterval(() => setSide((s) => (s === "rwa" ? "crypto" : "rwa")), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className={"rwa" + (variant === "type" ? " rwa--type" : " rwa--editorial")}>
      <div className="rwa-inner">
        <span className="rwa-eyebrow">Real-world assets · 24/7 on-chain</span>
        <h2 className="rwa-h2">Gold, oil, and the S&amp;P 500.<br /><span className="accent">Now in your wallet, 24/7.</span></h2>
        <p className="rwa-sub">
          Tokenized RWA hit $32B TVL in May 2026 — 3× in 12 months. Trade gold, silver, oil, and the
          S&amp;P 500 as perpetuals on Hyperliquid, settled in stablecoin, on your phone, around the clock.
        </p>

        {/* trust strip */}
        <div className="rwa-trust">
          {RWA_STATS.map((s, i) => (
            <div className="rwa-stat" key={i}>
              <span className="rwa-stat-ic"><StatIcon name={s.icon} /></span>
              <div className="rwa-stat-body">
                <div className="rwa-stat-num">{s.n}</div>
                <div className="rwa-stat-cap">{s.c}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rwa-source">Source: BP 2026 · Hyperliquid · ARX market data</div>

        {/* 3D flip deck — auto-flips every 4s between RWA tickers and crypto tickers */}
        <div className="flip-status" aria-live="polite">
          <span className={"flip-label" + (!flipped ? " on" : "")}>Real-world assets</span>
          <span className="flip-dots">
            <span className={"flip-dot" + (!flipped ? " on" : "")} />
            <span className={"flip-dot" + (flipped ? " on" : "")} />
          </span>
          <span className={"flip-label" + (flipped ? " on" : "")}>Crypto perps</span>
        </div>
        <div className="flip-scene">
          <div className={"flip-deck" + (flipped ? " flipped" : "")}>
            <div className="flip-face front" aria-hidden={flipped}>
              <div className="rwa-cards">
                {RWA_CARDS.map((c, i) => <AssetCard c={c} onNotify={setNotify} key={i} />)}
              </div>
            </div>
            <div className="flip-face back" aria-hidden={!flipped}>
              <div className="rwa-cards">
                {CRYPTO_CARDS.map((c, i) => <AssetCard c={c} onNotify={setNotify} key={i} />)}
              </div>
            </div>
          </div>
        </div>

        {/* structural advantage — 4 key bullets */}
        <div className="rwa-compare">
          <span className="rwa-compare-eyebrow">The structural advantage</span>
          <h3 className="rwa-compare-h">Why on-chain RWA beats your CFD broker</h3>
          <div className="rwa-bullets">
            {ADV_BULLETS.map((b, i) => (
              <div className="rwa-bullet" key={i}>
                <span className="rwa-bullet-num">{b.n}</span>
                <p className="rwa-bullet-text"><b>{b.lead}</b> {b.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="rwa-foot">
          <a className="rwa-foot-cta" href="#waitlist">Join the Waitlist <RArrow /></a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { RWASection });
