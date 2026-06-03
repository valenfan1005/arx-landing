// ARX site footer — wordmark + link columns + non-custodial line + bottom bar.
// Bilingual (EN/KR). Supports "editorial" + "type" variants.

function FtrExt() {
  return (
    <svg className="ext" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}
function FtrHlMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 12c3-5 6-5 9 0s6 5 9 0c-3 5-6 5-9 0s-6-5-9 0z" />
    </svg>
  );
}

const FTR_COPY = {
  en: {
    tag: "Markets without a middle.",
    note: "On-chain, non-custodial markets for tokenized real-world assets and perpetuals. Your keys never leave your hands.",
    trade: "Trade", company: "Company", community: "Community",
    tradeItems: [
      ["Spot", "/trade/spot/"], ["Perpetual", "/trade/perpetual/"], ["RWA", "/trade/rwa/"],
      ["Copy Trade", "/trade/copy-trade/"], ["On-chain Signal", "/trade/on-chain-signal/"],
    ],
    companyItems: [
      ["Markets", "/markets/"], ["Blog", "ARX%20Blog.html"], ["FAQ", "/#faq"], ["Get Help", "mailto:support@arx.trade"],
    ],
    built: "Built on Hyperliquid",
    rights: "© 2026 ARX. All rights reserved.",
    legal: [["Terms", "/legal/terms/"], ["Privacy", "/legal/privacy/"], ["Disclosures", "/legal/disclosures/"]],
  },
  kr: {
    tag: "중개자 없는 시장.",
    note: "토큰화된 실물 자산과 무기한 선물을 위한 온체인·비수탁 마켓. 키는 언제나 당신의 것입니다.",
    trade: "트레이드", company: "회사", community: "커뮤니티",
    tradeItems: [
      ["스팟", "/trade/spot/"], ["무기한 선물", "/trade/perpetual/"], ["RWA", "/trade/rwa/"],
      ["카피 트레이드", "/trade/copy-trade/"], ["온체인 시그널", "/trade/on-chain-signal/"],
    ],
    companyItems: [
      ["마켓", "/markets/"], ["블로그", "ARX%20Blog.html"], ["FAQ", "/#faq"], ["고객 지원", "mailto:support@arx.trade"],
    ],
    built: "하이퍼리퀴드 기반",
    rights: "© 2026 ARX. All rights reserved.",
    legal: [["이용약관", "/legal/terms/"], ["개인정보", "/legal/privacy/"], ["공시", "/legal/disclosures/"]],
  },
};

const FTR_SOCIALS = [
  { t: "Discord", href: "https://discord.gg/arxtrade" },
  { t: "X (Twitter)", href: "https://twitter.com/ARX_TRADE" },
  { t: "Telegram", href: "https://t.me/ARX_Trade_Official" },
];

function FtrSocIcon({ name }) {
  const c = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true };
  if (name === "Discord") {
    return (<svg {...c}><path d="M19.3 5.4A17 17 0 0 0 15 4l-.3.5a13 13 0 0 1 3.7 1.2 12.4 12.4 0 0 0-9-.9 12 12 0 0 0-3.4 1A17 17 0 0 0 4.7 5.4 18 18 0 0 0 2 16.7 17 17 0 0 0 7 19l.6-1a11 11 0 0 1-1.8-.9l.4-.3a9 9 0 0 0 7.6 0l.4.3a11 11 0 0 1-1.8.9l.6 1a17 17 0 0 0 5-2.3 18 18 0 0 0-1.7-11.3zM9 14.3c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5zm6 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5z"/></svg>);
  }
  if (name === "Telegram") {
    return (<svg {...c}><path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.4l-4.7-1.5c-1-.3-1-1 .2-1.5l18.3-7c.9-.3 1.6.2 1.3 1.4z"/></svg>);
  }
  // X (Twitter)
  return (<svg {...c}><path d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.5L8 21H5l7.5-8.6L4.6 3H11l4.5 6 2-6zm-1 16h1.7L8 4.8H6.2L16.5 19z"/></svg>);
}

function Footer({ variant, lang = "en" }) {
  const t = FTR_COPY[lang] || FTR_COPY.en;
  return (
    <footer className={"ftr" + (variant === "type" ? " ftr--type" : " ftr--editorial")}>
      <div className="ftr-inner">
        <div className="ftr-top">
          <div className="ftr-brand">
            <span className="ftr-mark" aria-label="ARX">
              <svg viewBox="0 0 1280 700" aria-hidden="true">
                <path d={window.ARX_WORDMARK_D} fill="currentColor" fillRule="evenodd" />
              </svg>
            </span>
            <p className="ftr-tag">{t.tag}</p>
            <p className="ftr-note">{t.note}</p>
            <div className="ftr-social">
              {FTR_SOCIALS.map((s) => (
                <a className="ftr-soc" href={s.href} target="_blank" rel="noopener" aria-label={s.t} key={s.t}>
                  <FtrSocIcon name={s.t} />
                </a>
              ))}
            </div>
          </div>

          <div className="ftr-col">
            <div className="ftr-col-h">{t.trade}</div>
            <div className="ftr-links">
              {t.tradeItems.map(([label, href]) => (
                <a className="ftr-link" href={href} key={label}>{label}</a>
              ))}
            </div>
          </div>

          <div className="ftr-col">
            <div className="ftr-col-h">{t.company}</div>
            <div className="ftr-links">
              {t.companyItems.map(([label, href]) => (
                <a className="ftr-link" href={href} key={label}>{label}</a>
              ))}
            </div>
          </div>

          <div className="ftr-col">
            <div className="ftr-col-h">{t.community}</div>
            <div className="ftr-links">
              {FTR_SOCIALS.map((s) => (
                <a className="ftr-link" href={s.href} target="_blank" rel="noopener" key={s.t}>
                  {s.t} <FtrExt />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="ftr-bottom">
          <div className="ftr-meta">
            <span>{t.rights}</span>
            <span className="dot">·</span>
            <span className="ftr-built"><FtrHlMark /> {t.built}</span>
          </div>
          <div className="ftr-legal">
            {t.legal.map(([label, href]) => (<a href={href} key={label}>{label}</a>))}
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
