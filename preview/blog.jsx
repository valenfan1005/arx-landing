// ARX "From the Blog" / Insights — content + IA from the arx.trade blog
// reference, styled in the ARX system. Supports "editorial" + "type" variants.
const { } = React;

function BlogArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const BLOG_POSTS = [
  {
    cat: "Macro & Markets",
    title: "Fed Hike 32%, BTC $77K, S&P 7,408: Stagflation Playbook (May 2026)",
    excerpt: "Hot CPI flipped the Fed pricing. Iran war Day 80. BTC weakening at $77K, S&P off Thursday's 7,517 ATH. Three scenarios + concrete watch levels on Hyperliquid.",
  },
  {
    cat: "Airdrop History",
    title: "The Complete Hyperliquid Genesis Airdrop HLP Recap (2024)",
    excerpt: "Did HLP depositors qualify for the Nov 2024 Genesis event? 310M HYPE to 94K wallets. Full eligibility math, points-to-HYPE conversion, and Season 2 carryover.",
  },
  {
    cat: "Macro & RWA",
    title: "Iran War Day 70: Gold –10%, Oil +45%, S&P at 7,399 ATH",
    excerpt: "The textbook trade was wrong on two of three. Counter-intuitive RWA playbook with three scenarios and concrete watch levels for gold, oil, and S&P perps.",
  },
  {
    cat: "Copy Trading",
    title: "Why Copy Smart Money on Hyperliquid? The On-Chain Edge",
    excerpt: "CEX leaderboards are curated. Hyperliquid shows every wallet's positions, fees, and PnL on-chain. Why that flips copy trading and how to pick wallets.",
  },
];

function BlogSection({ variant }) {
  return (
    <section className={"blog" + (variant === "type" ? " blog--type" : " blog--editorial")}>
      <div className="blog-inner">
        <span className="blog-eyebrow">Insights</span>
        <h2 className="blog-h2">From the Blog</h2>
        <p className="blog-sub">Deep dives on RWA perps, trading strategies, market regimes, and the Hyperliquid ecosystem.</p>

        <div className="blog-grid">
          {BLOG_POSTS.map((p, i) => (
            <a className="blog-card" href="/blog/" key={i}>
              <span className="blog-cat">{p.cat}</span>
              <h3 className="blog-title">{p.title}</h3>
              <p className="blog-excerpt">{p.excerpt}</p>
              <span className="blog-read">Read article <BlogArrow /></span>
            </a>
          ))}
        </div>

        <div className="blog-foot">
          <a className="blog-all" href="/blog/">View all articles <BlogArrow /></a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { BlogSection });
