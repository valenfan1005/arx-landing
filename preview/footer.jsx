// ARX site footer — addendum #2. Bilingual (EN/KR), two variants (editorial / type).
// Renders as the last section of both pages, after <CtaBand>.

/* ---- bilingual copy ---- */
const FTR_COPY = {
  en: {
    tag: "Markets without a middle.",
    note: "On-chain, non-custodial markets for tokenized real-world assets and perpetuals. Your keys never leave your hands.",
    built: "Built on Hyperliquid",
    cols: {
      trade: { h: "Trade", links: [
        ["Spot", "/trade/spot/"],
        ["Perpetual", "/trade/perpetual/"],
        ["RWA", "/trade/rwa/"],
        ["Copy Trade", "/trade/copy-trade/"],
        ["On-chain Signal", "/trade/on-chain-signal/"],
      ]},
      company: { h: "Company", links: [
        ["Markets", "/markets/"],
        ["Blog", "/blog/"],
        ["FAQ", "/#faq"],
        ["Get Help", "mailto:support@arx.trade"],
      ]},
      community: { h: "Community" },
    },
    legal: [
      ["Terms", "/legal/terms/"],
      ["Privacy", "/legal/privacy/"],
      ["Disclosures", "/legal/disclosures/"],
    ],
    rights: "© 2026 ARX. All rights reserved.",
  },
  kr: {
    tag: "중개자 없는 시장.",
    note: "토큰화된 실물 자산과 무기한 선물을 위한 온체인·비수탁 마켓. 키는 언제나 당신의 것입니다.",
    built: "하이퍼리퀴드 기반",
    cols: {
      trade: { h: "거래", links: [
        ["현물 (Spot)", "/trade/spot/"],
        ["무기한 (Perpetual)", "/trade/perpetual/"],
        ["RWA", "/trade/rwa/"],
        ["카피 트레이딩", "/trade/copy-trade/"],
        ["온체인 시그널", "/trade/on-chain-signal/"],
      ]},
      company: { h: "회사", links: [
        ["마켓", "/markets/"],
        ["블로그", "/blog/"],
        ["FAQ", "/#faq"],
        ["고객지원", "mailto:support@arx.trade"],
      ]},
      community: { h: "커뮤니티" },
    },
    legal: [
      ["이용약관", "/legal/terms/"],
      ["개인정보", "/legal/privacy/"],
      ["공시", "/legal/disclosures/"],
    ],
    rights: "© 2026 ARX. All rights reserved.",
  },
};

/* ---- social destinations (shared across locales) ---- */
const FTR_SOCIALS = [
  { k: "discord", label: "Discord", href: "https://discord.gg/arxtrade" },
  { k: "x", label: "X (Twitter)", href: "https://twitter.com/ARX_TRADE" },
  { k: "telegram", label: "Telegram", href: "https://t.me/ARX_Trade_Official" },
];

/* ---- inline social icons ---- */
function FtrSocialIcon({ k }) {
  if (k === "discord") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.27 5.33A16.6 16.6 0 0 0 15.1 4l-.2.4a12.5 12.5 0 0 1 3.7 1.9 11.6 11.6 0 0 0-9.2 0A12.5 12.5 0 0 1 13.1 4.4L12.9 4a16.6 16.6 0 0 0-4.17 1.33C5.4 9.3 4.7 13.18 5 17a16.7 16.7 0 0 0 5.1 2.6l.4-.6a10.9 10.9 0 0 1-1.7-.84l.42-.32a11.9 11.9 0 0 0 9.56 0l.42.32a10.9 10.9 0 0 1-1.7.84l.4.6A16.7 16.7 0 0 0 23 17c.37-4.42-.62-8.27-3.73-11.67ZM9.7 14.7c-.8 0-1.46-.74-1.46-1.65 0-.9.65-1.65 1.46-1.65.82 0 1.48.75 1.46 1.65 0 .9-.65 1.65-1.46 1.65Zm4.6 0c-.8 0-1.46-.74-1.46-1.65 0-.9.65-1.65 1.46-1.65.82 0 1.48.75 1.46 1.65 0 .9-.64 1.65-1.46 1.65Z"/>
      </svg>
    );
  }
  if (k === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
      </svg>
    );
  }
  // telegram
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.94 4.6 18.6 20.34c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.4-8.5c.4-.36-.09-.56-.63-.2L5.16 13.1l-5-1.56c-1.09-.34-1.1-1.09.23-1.61l19.55-7.53c.9-.34 1.7.2 1.4 1.6Z"/>
    </svg>
  );
}

/* ---- arrow for external links ---- */
function FtrExt() {
  return (
    <svg className="ext" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

/* ---- "built on Hyperliquid" wave mark ---- */
function FtrWave() {
  return (
    <span className="wave">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12c2.5 0 2.5-5 5-5s2.5 5 5 5 2.5-5 5-5 2.5 5 5 5" />
      </svg>
    </span>
  );
}

function Footer({ variant, lang }) {
  const t = FTR_COPY[lang === "kr" ? "kr" : "en"];
  const isType = variant === "type";
  return (
    <footer className={"ftr" + (isType ? " ftr--type" : " ftr--editorial")} aria-label="Site footer">
      <div className="ftr-inner">
        <div className="ftr-top">
          {/* brand */}
          <div className="ftr-brand">
            <span className="wordmark" aria-label="ARX">
              <svg viewBox="0 0 1280 700" width="100%" height="100%" aria-hidden="true">
                <path d={window.ARX_WORDMARK_D} fill="currentColor" fillRule="evenodd" />
              </svg>
            </span>
            <p className="ftr-tag">{t.tag}</p>
            <p className="ftr-note">{t.note}</p>
            <div className="ftr-socials">
              {FTR_SOCIALS.map(s => (
                <a key={s.k} className="ftr-soc" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <FtrSocialIcon k={s.k} />
                </a>
              ))}
            </div>
          </div>

          {/* Trade */}
          <div className="ftr-col">
            <h4 className="ftr-col-h">{t.cols.trade.h}</h4>
            <ul>{t.cols.trade.links.map(([l, h]) => <li key={h}><a href={h}>{l}</a></li>)}</ul>
          </div>

          {/* Company */}
          <div className="ftr-col">
            <h4 className="ftr-col-h">{t.cols.company.h}</h4>
            <ul>{t.cols.company.links.map(([l, h]) => <li key={h}><a href={h}>{l}</a></li>)}</ul>
          </div>

          {/* Community (external) */}
          <div className="ftr-col">
            <h4 className="ftr-col-h">{t.cols.community.h}</h4>
            <ul>{FTR_SOCIALS.map(s => (
              <li key={s.k}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}<FtrExt /></a>
              </li>
            ))}</ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="ftr-bottom">
          <div className="ftr-copy">
            <span>{t.rights}</span>
            <span className="dot">·</span>
            <span className="ftr-built"><FtrWave />{t.built}</span>
          </div>
          <nav className="ftr-legal" aria-label="Legal">
            {t.legal.map(([l, h]) => <a key={h} href={h}>{l}</a>)}
          </nav>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
