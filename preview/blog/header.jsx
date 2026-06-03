// ARX header — floating glass-capsule navbar (Binance-style, per RWA spec Part A)
const { useState, useEffect, useRef } = React;

function Caret() {
  return (
    <svg className="nav-caret" width="10" height="6" viewBox="0 0 10 6" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}
function Ext() {
  return (
    <svg className="ext" width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ marginLeft: 6, verticalAlign: "middle" }}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

// Lucide "languages" glyph — the translate cue
function LangGlyph() {
  return (
    <svg className="nav-lang-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
    </svg>
  );
}
function Check() {
  return (
    <svg className="lang-check" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
// "Translated by Google" attribution mark — four-dot motif (no wordmark)
function GTMark() {
  return (
    <svg className="gt-mark" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="6" r="3" fill="#4285F4" /><circle cx="18" cy="6" r="3" fill="#EA4335" />
      <circle cx="6" cy="18" r="3" fill="#34A853" /><circle cx="18" cy="18" r="3" fill="#FBBC05" />
    </svg>
  );
}

// pseudo Google-Translate languages (compliance: a translation widget, not a locale switch)
const LANGS = [
  { code: "en", native: "English", en: "English", short: "EN" },
  { code: "ko", native: "한국어", en: "Korean", short: "KO" },
  { code: "zh", native: "简体中文", en: "Chinese (Simplified)", short: "ZH" },
  { code: "vi", native: "Tiếng Việt", en: "Vietnamese", short: "VI" },
];

// bilingual labels (project is bilingual; Tweaks bar drives `lang`)
const NAV = {
  en: { markets: "Markets", trade: "Trade", blog: "Blog", more: "More", cta: "Join Waitlist" },
  kr: { markets: "마켓", trade: "트레이드", blog: "블로그", more: "더보기", cta: "웨이트리스트 신청" },
};

const TRADE_ITEMS = {
  en: [
    { t: "Spot", d: "Major tokens via Hyperliquid spot books", href: "/trade/spot/" },
    { t: "Perpetual", d: "100+ crypto perps · hourly funding", href: "/trade/perpetual/" },
    { t: "RWA", d: "Gold, oil, S&P 500 · 24/7 on-chain", href: "/trade/rwa/" },
    { t: "Copy Trade", d: "Verified leaders · Three-Gate framework", href: "/trade/copy-trade/" },
    { t: "On-chain Signal", d: "5-layer signal taxonomy · AI Copilot", href: "/trade/on-chain-signal/" },
  ],
  kr: [
    { t: "스팟", d: "하이퍼리퀴드 스팟 오더북의 주요 토큰", href: "/trade/spot/" },
    { t: "무기한 선물", d: "100+ 크립토 퍼프 · 시간별 펀딩", href: "/trade/perpetual/" },
    { t: "RWA", d: "금, 원유, S&P 500 · 24/7 온체인", href: "/trade/rwa/" },
    { t: "카피 트레이드", d: "검증된 리더 · 쓰리게이트 프레임워크", href: "/trade/copy-trade/" },
    { t: "온체인 시그널", d: "5계층 시그널 분류 · AI 코파일럿", href: "/trade/on-chain-signal/" },
  ],
};

const SOCIALS = [
  { t: "Discord", href: "https://discord.gg/arxtrade" },
  { t: "X (Twitter)", href: "https://twitter.com/ARX_TRADE" },
  { t: "Telegram", href: "https://t.me/ARX_Trade_Official" },
];

function ArxHeader({ lang = "en", active = "" }) {
  const t = NAV[lang] || NAV.en;
  const [open, setOpen] = useState(null); // "trade" | "more" | "lang" | null
  const [trans, setTrans] = useState(lang === "kr" ? "ko" : "en"); // pseudo-translate selection
  const closeTimer = useRef(null);
  const transLabel = lang === "kr" ? "번역" : "Translate";
  const wrapRef = useRef(null);

  const enter = (key) => { clearTimeout(closeTimer.current); setOpen(key); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(null), 100); };
  const toggle = (key) => setOpen((o) => (o === key ? null : key));

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); };
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDoc); };
  }, []);

  return (
    <div className="navwrap" ref={wrapRef}>
      <nav className="navcap" aria-label="Primary">
        <a className="nav-brand" href="/preview/editorial.html" aria-label="ARX Home">
          <span className="wordmark" aria-label="ARX">
            <svg viewBox="0 0 1280 700" width="100%" height="100%" aria-hidden="true">
              <path d={window.ARX_WORDMARK_D} fill="currentColor" fillRule="evenodd" />
            </svg>
          </span>
        </a>

        <div className="nav-items">
          <div className="nav-item">
            <a className={"nav-link" + (active === "markets" ? " on" : "")} href="/markets/">{t.markets}</a>
          </div>

          <div className="nav-item" onMouseEnter={() => enter("trade")} onMouseLeave={leave}>
            <button className="nav-trigger" aria-haspopup="true" aria-expanded={open === "trade"} onClick={() => toggle("trade")}>
              {t.trade}<Caret />
            </button>
            <div className={"nav-panel trade" + (open === "trade" ? " open" : "")} role="menu">
              {TRADE_ITEMS[lang].map((it, i) => (
                <a className="nav-opt" role="menuitem" href={it.href} key={i}>
                  <div className="nav-opt-title">{it.t}</div>
                  <div className="nav-opt-desc">{it.d}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="nav-item">
            <a className={"nav-link" + (active === "blog" ? " on" : "")} href="/preview/blog/">{t.blog}</a>
          </div>

          <div className="nav-item" onMouseEnter={() => enter("more")} onMouseLeave={leave}>
            <button className="nav-trigger" aria-haspopup="true" aria-expanded={open === "more"} onClick={() => toggle("more")}>
              {t.more}<Caret />
            </button>
            <div className={"nav-panel more" + (open === "more" ? " open" : "")} role="menu">
              <div className="nav-group-label">Community</div>
              {SOCIALS.map((s, i) => (
                <a className="nav-opt" role="menuitem" href={s.href} target="_blank" rel="noopener" key={i}>
                  <div className="nav-opt-row"><span className="nav-opt-title">{s.t}</span><Ext /></div>
                </a>
              ))}
              <div className="nav-divider" />
              <a className="nav-opt" role="menuitem" href="mailto:support@arx.trade">
                <div className="nav-opt-title">Get Help</div>
              </a>
              <a className="nav-opt" role="menuitem" href="/#faq">
                <div className="nav-opt-title">FAQ</div>
              </a>
            </div>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-item nav-lang-item" onMouseEnter={() => enter("lang")} onMouseLeave={leave}>
            <button className="nav-lang" aria-haspopup="true" aria-expanded={open === "lang"} onClick={() => toggle("lang")} aria-label={transLabel}>
              <LangGlyph />
              <span className="nav-lang-cur">{(LANGS.find((l) => l.code === trans) || LANGS[0]).short}</span>
              <Caret />
            </button>
            <div className={"nav-panel lang" + (open === "lang" ? " open" : "")} role="menu">
              <div className="nav-group-label">{transLabel}</div>
              {LANGS.map((l) => (
                <button
                  className={"nav-opt nav-opt-lang" + (trans === l.code ? " sel" : "")}
                  role="menuitemradio" aria-checked={trans === l.code} key={l.code}
                  onClick={() => { setTrans(l.code); setOpen(null); }}
                >
                  <span>
                    <span className="lang-native">{l.native}</span>
                    <span className="lang-en" style={{ display: "block" }}>{l.en}</span>
                  </span>
                  <Check />
                </button>
              ))}
              <div className="nav-divider" />
              <div className="nav-translate-foot"><GTMark />Translated by Google</div>
            </div>
          </div>

          <a className="nav-cta" href="/#waitlist">{t.cta}</a>
        </div>
      </nav>
    </div>
  );
}

Object.assign(window, { ArxHeader });
