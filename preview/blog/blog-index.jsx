// ARX — Blog index page. Content + IA reference the arx.trade blog
// (Hyperliquid / RWA / copy-trading deep dives), designed in the ARX system.
const { useState: bpUseState, useRef: bpUseRef, useEffect: bpUseEffect } = React;

/* ---------- icons ---------- */
function BpArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function BpSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function BpCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ---------- live blob (mounts via arx-blob.js) ---------- */
function BpBlob({ opts }) {
  const ref = bpUseRef(null);
  bpUseEffect(() => {
    if (!ref.current || !window.mountArxBlob) return;
    return window.mountArxBlob(ref.current, opts || {});
  }, []);
  return <canvas ref={ref} />;
}

/* ---------- content ---------- */
const FEATURED = {
  cat: "Airdrop",
  flag: "Featured",
  title: "Hyperliquid Season 2 Airdrop: The Complete Points & Strategy Guide",
  excerpt: "238.8M HYPE is allocated for Season 2. We break down the points system, the HLP 3x multiplier, and five concrete strategies to maximize your allocation before the snapshot.",
  date: "May 28, 2026", read: "12 min read", author: "ARX Research",
};

const POSTS = [
  {
    cat: "Analysis",
    title: "Hyperliquid vs Lighter vs Aster: The Battle for Perp DEX Dominance",
    excerpt: "Three venues, one prize. We compare fees, speed, volume, and copy-trading depth across the leading perp DEXs — and where ARX fits.",
    date: "May 24, 2026", read: "9 min read",
  },
  {
    cat: "Macro & Markets",
    title: "Fed Hike 32%, BTC $77K, S&P 7,408: The Stagflation Playbook",
    excerpt: "Hot CPI flipped Fed pricing. BTC is weakening at $77K, the S&P is off Thursday's 7,517 ATH. Three scenarios with concrete watch levels on Hyperliquid.",
    date: "May 19, 2026", read: "8 min read",
  },
  {
    cat: "Copy Trading",
    title: "Why Copy Smart Money on Hyperliquid? The On-Chain Edge",
    excerpt: "CEX leaderboards are curated. Hyperliquid shows every wallet's positions, fees and PnL on-chain. Here's why that flips copy trading — and how to pick wallets.",
    date: "May 14, 2026", read: "7 min read",
  },
  {
    cat: "Guides",
    title: "DeFi Copy Trading with ARX: Everything You Need to Know",
    excerpt: "From wallet selection to risk sizing and the Three-Gate framework — the complete guide to auto-copying elite traders, non-custodially, on ARX.",
    date: "May 9, 2026", read: "11 min read",
  },
  {
    cat: "Macro & RWA",
    title: "Iran War Day 70: Gold –10%, Oil +45%, S&P at 7,399 ATH",
    excerpt: "The textbook trade was wrong on two of three. A counter-intuitive RWA playbook with three scenarios and watch levels for gold, oil and S&P perps.",
    date: "May 3, 2026", read: "8 min read",
  },
  {
    cat: "Airdrop",
    title: "The Complete Hyperliquid Genesis Airdrop & HLP Recap",
    excerpt: "Did HLP depositors qualify for the Nov 2024 Genesis event? 310M HYPE to 94K wallets. Full eligibility math, conversion, and Season 2 carryover.",
    date: "Apr 27, 2026", read: "10 min read",
  },
  {
    cat: "Copy Trading",
    title: "Reading the Three-Gate Framework: How ARX Verifies Leaders",
    excerpt: "Not every green PnL is a wallet worth copying. The three gates — sample size, drawdown discipline, and fee transparency — and how to read them.",
    date: "Apr 21, 2026", read: "6 min read",
  },
  {
    cat: "Analysis",
    title: "Regime-Aware Trading: The 5 Market States, Explained",
    excerpt: "Trending, Range-Bound, Transition, Compression, Crisis. Know the environment before you size up — and let ARX filter signals to match it.",
    date: "Apr 15, 2026", read: "9 min read",
  },
  {
    cat: "Macro & RWA",
    title: "Tokenized Treasuries On-Chain: T+0 Settlement, 24/7 Markets",
    excerpt: "Why RWA markets that settle instantly and never close change the math for short-duration carry — and how to trade the gold, FX and treasury perps.",
    date: "Apr 8, 2026", read: "7 min read",
  },
];

const CATS = ["All", "Macro & Markets", "Macro & RWA", "Copy Trading", "Analysis", "Airdrop", "Guides"];

/* ---------- masthead ---------- */
function BpMasthead() {
  return (
    <section className="bp-masthead">
      <div className="bloom" />
      <div className="bp-wrap">
        <div className="bp-mast-row">
          <div>
            <span className="bp-eyebrow bp-anim"><span className="live-dot" />Insights</span>
            <h1 className="bp-h1 bp-anim d1">From the<br /><span className="out">Blog</span></h1>
            <p className="bp-sub bp-anim d2">
              Deep dives from the ARX team on RWA perps, trading strategy, market regimes, and the Hyperliquid ecosystem. Plainly stated. Always on-chain.
            </p>
          </div>
          <div className="bp-search bp-anim d2">
            <BpSearch />
            <input type="text" placeholder="Search articles" aria-label="Search articles" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- featured ---------- */
function BpFeatured() {
  const p = FEATURED;
  return (
    <div className="bp-wrap">
      <a className="bp-featured bp-anim d1" href="/blog/">
        <div className="bp-feat-body">
          <div className="bp-feat-tags">
            <span className="bp-cat">{p.cat}</span>
            <span className="bp-feat-flag">{p.flag}</span>
          </div>
          <h2 className="bp-feat-title">{p.title}</h2>
          <p className="bp-feat-excerpt">{p.excerpt}</p>
          <div className="bp-meta">
            <span>{p.author}</span><span className="dot">·</span>
            <span>{p.date}</span><span className="dot">·</span>
            <span>{p.read}</span>
          </div>
          <span className="bp-feat-read">Read article <BpArrow /></span>
        </div>
        <div className="bp-feat-visual">
          <BpBlob opts={{ colors: [[0.702, 0.553, 0.957], [0.231, 0.106, 0.506], [0.133, 0.82, 0.933]], sizes: [0.52, 0.34, 0.24], spread: 0.3 }} />
          <div className="bp-feat-grid" />
          <span className="bp-feat-stamp"><span className="live-dot" />Live on Hyperliquid</span>
        </div>
      </a>
    </div>
  );
}

/* ---------- filters + grid ---------- */
function BpArticles() {
  const [active, setActive] = bpUseState("All");
  const counts = CATS.reduce((m, c) => {
    m[c] = c === "All" ? POSTS.length : POSTS.filter((p) => p.cat === c).length;
    return m;
  }, {});
  const shown = active === "All" ? POSTS : POSTS.filter((p) => p.cat === active);

  return (
    <section className="bp-wrap" style={{ marginTop: 0 }}>
      <div className="bp-filters">
        <span className="bp-filters-label">Filter</span>
        {CATS.map((c) => (
          <button
            key={c}
            className={"bp-chip" + (active === c ? " on" : "")}
            aria-pressed={active === c}
            onClick={() => setActive(c)}
          >
            {c}<span className="bp-chip-n">{counts[c]}</span>
          </button>
        ))}
        <div className="bp-search bp-search--inline">
          <BpSearch />
          <input type="text" placeholder="Search articles" aria-label="Search articles" />
        </div>
      </div>

      <div className="bp-grid">
        {shown.map((p, i) => (
          <a className="bp-card" href="/blog/" key={p.title}>
            <span className="bp-card-cat">{p.cat}</span>
            <h3 className="bp-card-title">{p.title}</h3>
            <p className="bp-card-excerpt">{p.excerpt}</p>
            <div className="bp-card-meta">
              <span>{p.date}</span><span className="dot">·</span><span>{p.read}</span>
            </div>
          </a>
        ))}
        {shown.length === 0 && <div className="bp-empty">No articles in this category yet.</div>}
      </div>

      {active === "All" && (
        <div className="bp-more">
          <button className="bp-more-btn">Load more articles <BpArrow /></button>
        </div>
      )}
    </section>
  );
}

/* ---------- newsletter ---------- */
function BpNewsletter() {
  const [val, setVal] = bpUseState("");
  const [done, setDone] = bpUseState(false);
  const submit = (e) => { e.preventDefault(); if (val.trim()) setDone(true); };
  return (
    <section className="bp-wrap">
      <div className="bp-news bp-anim d1">
        <div>
          <span className="bp-news-eye">The ARX Edge</span>
          <h2 className="bp-news-h">Get the edge in your inbox.</h2>
          <p className="bp-news-sub">Regime shifts, RWA playbooks and Hyperliquid airdrop intel — sent when it matters, never as noise.</p>
        </div>
        <div>
          {done ? (
            <span className="bp-news-ok"><BpCheck /> You're on the list. Watch your inbox.</span>
          ) : (
            <form className="bp-news-form" onSubmit={submit}>
              <input
                className="bp-news-input" type="email" required placeholder="you@wallet.eth"
                value={val} onChange={(e) => setVal(e.target.value)} aria-label="Email address"
              />
              <button className="bp-news-btn" type="submit">Subscribe <BpArrow /></button>
            </form>
          )}
          <p className="bp-news-note">No spam. Unsubscribe anytime. ARX never takes your keys.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- atmosphere stage ---------- */
function BpStage({ children }) {
  return (
    <div className="stage stage--page">
      <div className="stage-grain" />
      <div className="stage-vignette" />
      {children}
    </div>
  );
}

/* ---------- one full blog page in a given direction ---------- */
function BlogVariant({ variant }) {
  return (
    <BpStage>
      <ArxHeader lang="en" active="blog" />
      <main className={"bp-main bp--" + variant}>
        <BpFeatured />
        <BpArticles />
        <BpNewsletter />
      </main>
      <CtaBand variant={variant} />
      <Footer variant={variant} lang="en" />
    </BpStage>
  );
}

/* ---------- render: 01 · Editorial blog page (standalone) ---------- */
ReactDOM.createRoot(document.getElementById("root")).render(<BlogVariant variant="editorial" />);
