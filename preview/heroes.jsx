// ARX hero variations — three directions sharing the header.
const { useRef: hUseRef, useEffect: hUseEffect } = React;

/* ---- bilingual hero copy ---- */
const HCOPY = {
  en: {
    live: "Live on Hyperliquid",
    h1: ["Every market.", "On chain.", "Always open."],
    sub: "On-chain, non-custodial markets for tokenized real-world assets and perpetuals. Open 24/7. Settled T+0. Your keys never leave your hands.",
    primary: "Start trading", ghost: "Explore markets",
    h2eye: "Every market · one chain",
    h2: "Every market.\nOne chain.\nAlways open.",
    h2sub: "Trade tokenized equities, treasuries, gold and FX next to perps — on a single non-custodial venue that never closes.",
    h2primary: "Launch app", h2ghost: "View markets",
    h3eye: "Non-custodial by design",
    h3sub: "Tokenized real-world assets and perps, settled on-chain. ARX removes the middle.",
    h3primary: "Start trading"
  },
  kr: {
    live: "하이퍼리퀴드에서 운영 중",
    h1: ["모든 시장.", "온체인에서.", "언제나."],
    sub: "토큰화된 실물 자산과 무기한 선물을 위한 온체인·비수탁 마켓. 24시간 운영, T+0 정산. 키는 언제나 당신의 것.",
    primary: "거래 시작", ghost: "마켓 둘러보기",
    h2eye: "모든 시장 · 하나의 체인",
    h2: "모든 시장.\n하나의 체인.\n언제나 열려 있게.",
    h2sub: "토큰화된 주식·국채·금·외환을 무기한 선물과 함께 — 결코 닫히지 않는 단일 비수탁 거래소에서.",
    h2primary: "앱 실행", h2ghost: "마켓 보기",
    h3eye: "설계부터 비수탁",
    h3sub: "온체인에서 정산되는 토큰화 실물 자산과 무기한 선물. ARX는 중개자를 제거합니다.",
    h3primary: "거래 시작"
  }
};

const STATS = [
{ v: "$1.4", u: "B", k: "Traded · 24h", accent: true },
{ v: "120", u: "+", k: "Live markets" },
{ v: "24/7", u: "", k: "Always open" },
{ v: "T+0", u: "", k: "Settlement" },
{ v: "100", u: "%", k: "Self-custody" }];


function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>);

}

function BlobCanvas({ opts, style }) {
  const ref = hUseRef(null);
  hUseEffect(() => {
    if (!ref.current || !window.mountArxBlob) return;
    return window.mountArxBlob(ref.current, opts || {});
  }, []);
  return <canvas ref={ref} style={style || { width: "100%", height: "100%", display: "block" }} />;
}

/* shared scrolling market ticker (used by Editorial + Typographic) */
const TICKER = [
["AAPL", "228.41", "+1.24%", "gain"], ["TSLA", "412.07", "-0.86%", "loss"],
["XAU", "2,418.50", "+0.42%", "gain"], ["US10Y", "4.21%", "-0.03", "loss"],
["BTC", "68,241", "+2.10%", "gain"], ["EUR/USD", "1.0842", "+0.12%", "gain"],
["NVDA", "1,184.20", "+3.04%", "gain"], ["ETH", "3,512", "+1.45%", "gain"]];

function TickerStrip() {
  return (
    <div className="ticker-strip">
      <div className="ticker-track">
        {[0, 1].map((dup) =>
        <React.Fragment key={dup}>
            {TICKER.map((r, i) =>
          <span className="tk-item" key={dup + "-" + i}>
                <span className="tk-sym">{r[0]}</span>
                <span className="tk-px">{r[1]}</span>
                <span className={"tk-chg " + r[3]}>{r[2]}</span>
              </span>
          )}
          </React.Fragment>
        )}
      </div>
    </div>);

}

/* ============================ HERO 1 — Editorial ============================ */
function HeroEditorial({ lang, accent }) {
  const t = HCOPY[lang];
  const krH1 = lang === "kr";
  return (
    <React.Fragment>
      <section className="hero" style={{ position: "relative", padding: "152px 40px 144px", textAlign: "center", minHeight: 640 }}>
        {/* live blob centered behind the headline as the hero backdrop */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div className="bloom" style={{ width: 760, height: 760, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 1180, height: 820 }}>
            <BlobCanvas
              style={{ width: "100%", height: "100%", display: "block", opacity: 0.92, filter: accent ? "saturate(1.15)" : "none" }}
              opts={accent ?
              { colors: [[0.80, 0.55, 1.0], [0.30, 0.12, 0.70], [0.13, 0.82, 0.93]], sizes: [0.5, 0.34, 0.24], spread: 0.34 } :
              { colors: [[0.702, 0.553, 0.957], [0.231, 0.106, 0.506], [0.133, 0.82, 0.933]], sizes: [0.5, 0.34, 0.24], spread: 0.34 }} />
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 4, maxWidth: 1100, margin: "0 auto" }}>
          <div className="hero-scrim" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 760, height: 520, zIndex: -1, pointerEvents: "none" }} />
          <span className="eyebrow-live" style={{ marginBottom: 26, fontSize: "15px" }}><span className="live-dot" />{t.live}</span>
          <h1 className={"arx-display" + (krH1 ? " kr" : "")}
          style={{ fontSize: krH1 ? 64 : 76, lineHeight: 0.98, margin: "22px 0 0", textTransform: krH1 ? "none" : "uppercase", letterSpacing: "-0.025em", wordSpacing: krH1 ? "normal" : "0.02em", width: "100%" }}>
            <span style={{ display: "inline-block", letterSpacing: "-0.035em" }}>{t.h1[0]}</span><br />{t.h1[1]} {t.h1[2]}
          </h1>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 44 }}>
            <button className="btn btn-primary" style={{ height: 60, padding: "0 34px", fontSize: 18, borderRadius: "var(--r-md)" }}>{t.primary}<ArrowIcon /></button>
            <button className="btn btn-ghost" style={{ height: 60, padding: "0 34px", fontSize: 18, borderRadius: "var(--r-md)" }}>{t.ghost}</button>
          </div>
        </div>
      </section>

      <TickerStrip />
    </React.Fragment>);

}

/* ============================ HERO 2 — Split / live ============================ */
function HeroSplit({ lang, accent }) {
  const t = HCOPY[lang];
  const blobOpts = accent ?
  { colors: [[0.80, 0.55, 1.0], [0.30, 0.12, 0.70], [0.13, 0.82, 0.93]], sizes: [0.5, 0.28, 0.22] } :
  { colors: [[0.702, 0.553, 0.957], [0.231, 0.106, 0.506], [0.133, 0.82, 0.933]], sizes: [0.46, 0.30, 0.20] };
  return (
    <section className="hero" style={{ padding: "64px 40px 72px", display: "grid", gridTemplateColumns: "1.04fr 0.96fr", gap: 56, alignItems: "center", minHeight: 640 }}>
      <div>
        <span className="eyebrow-live" style={{ marginBottom: 22 }}><span className="live-dot" />{t.h2eye}</span>
        <h1 className={"arx-display" + (lang === "kr" ? " kr" : "")}
        style={{ fontSize: lang === "kr" ? 50 : 56, lineHeight: 1.02, margin: "20px 0 0", letterSpacing: "-0.03em", whiteSpace: "pre-line", textTransform: "none" }}>
          {t.h2}
        </h1>
        <p className={"arx-body-lg hero-sub" + (lang === "kr" ? " kr" : "")} style={{ maxWidth: 480, marginTop: 24, fontSize: 16 }}>{t.h2sub}</p>
        <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
          <button className="btn btn-primary btn-lg">{t.h2primary}<ArrowIcon /></button>
          <button className="btn btn-ghost btn-lg">{t.h2ghost}</button>
        </div>
        <div className="chips" style={{ marginTop: 34 }}>
          <div className="chip"><b>$1.4B</b><span>24h volume</span></div>
          <div className="chip"><b>120+</b><span>markets</span></div>
          <div className="chip"><b>T+0</b><span>settlement</span></div>
        </div>
      </div>

      <div style={{ height: 520 }}>
        <div className="blob-panel">
          <BlobCanvas opts={blobOpts} />
          <div className="panel-grid" />
          <div className="hud">
            <div className="hud-top">
              <div className="hud-mkt">
                <span className="tok" style={{ background: "linear-gradient(135deg,#b38df4,#3b1b81)" }}>A</span>
                <div>
                  <div className="hud-sym">AAPL · Perp</div>
                  <div className="hud-kind">Tokenized equity</div>
                </div>
              </div>
              <span className="hud-live"><span className="live-dot" style={{ background: "var(--gain)" }} />Live</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span className="hud-px">$228.41</span>
              <span className="hud-chg gain">+1.24%</span>
            </div>
            <svg className="hud-spark" viewBox="0 0 224 34" preserveAspectRatio="none" fill="none">
              <polyline points="0,26 24,22 48,27 72,18 96,21 120,12 144,16 168,9 192,11 224,4"
              stroke="var(--gain)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="0,34 0,26 24,22 48,27 72,18 96,21 120,12 144,16 168,9 192,11 224,4 224,34"
              fill="rgba(110,226,168,0.10)" stroke="none" />
            </svg>
          </div>
        </div>
      </div>
    </section>);

}

/* ============================ HERO 3 — Typographic ============================ */
function HeroType({ lang, accent }) {
  const t = HCOPY[lang];
  const kr = lang === "kr";
  return (
    <React.Fragment>
      <section className="hero" style={{ position: "relative", padding: "120px 40px 104px", minHeight: 680 }}>
        <div className="bloom" style={{ width: 720, height: 720, right: -120, top: -120 }} />
        <div style={{ position: "absolute", right: -200, top: 40, width: 1040, height: 640, pointerEvents: "none", zIndex: 3 }}>
          <BlobCanvas
            style={{ width: "100%", height: "100%", display: "block", filter: accent ? "saturate(1.2)" : "none" }}
            opts={accent ?
            { colors: [[0.80, 0.55, 1.0], [0.30, 0.12, 0.70], [0.13, 0.82, 0.93]], sizes: [0.5, 0.34, 0.26], spread: 0.32 } :
            { colors: [[0.702, 0.553, 0.957], [0.231, 0.106, 0.506], [0.133, 0.82, 0.933]], sizes: [0.5, 0.34, 0.26], spread: 0.32 }} />
        </div>

        <span className="eyebrow-live" style={{ position: "relative", zIndex: 4 }}><span className="live-dot" />{t.h3eye}</span>

        {kr ?
        <h1 className="giant kr" style={{ fontSize: 96, marginTop: 28, position: "relative", zIndex: 4, letterSpacing: "-0.02em" }}>
            중개자 없는<br /><span className="out">시장.</span>
          </h1> :

        <h1 className="giant" style={{ marginTop: 24, position: "relative", zIndex: 4, fontSize: "115px" }}>
            Every market.<br />On chain.<br /><span className="out" style={{ fontSize: "115px" }}>ALWAYS OPEN.</span>
          </h1>
        }

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-start", marginTop: 44, position: "relative", zIndex: 4 }}>
          <button className="btn btn-primary" style={{ flexShrink: 0, height: 64, padding: "0 40px", fontSize: 19, borderRadius: "var(--r-md)" }}>{t.h3primary}<ArrowIcon /></button>
        </div>
      </section>

      <TickerStrip />
    </React.Fragment>);

}

Object.assign(window, { HeroEditorial, HeroSplit, HeroType, ArxHeader: window.ArxHeader });