// ARX FAQ — accordion. Content + IA from the arx.trade FAQ reference,
// answers written in ARX voice. Supports "editorial" + "type" variants.
const { useState: faqUseState } = React;

const FAQ_ITEMS = [
  {
    q: "What are RWA perpetuals?",
    a: <React.Fragment>RWA perpetuals are perpetual futures on <b>tokenized real-world assets</b> — equities, treasuries, gold, FX — traded on-chain. You get round-the-clock exposure to markets that normally close, settled in stablecoin, with no expiry and no delivery.</React.Fragment>,
  },
  {
    q: "How does ARX work?",
    a: <React.Fragment>ARX is a <b>non-custodial</b> trading venue built on Hyperliquid. You connect a wallet, your USDC stays in your control, and every order, position, and settlement is on-chain. ARX removes the middle — no broker, no custodian, no clearing house holding your keys.</React.Fragment>,
  },
  {
    q: "What are overnight fees and why does ARX have none?",
    a: <React.Fragment>Traditional CFD brokers charge a daily financing fee to hold a position past market close. ARX markets <b>never close</b> and settle T+0 on-chain, so there is no overnight financing charge — you pay transparent funding only, the same rate longs and shorts exchange directly.</React.Fragment>,
  },
  {
    q: "Is trading on ARX safe?",
    a: <React.Fragment>Your funds stay in your own wallet — <b>ARX never takes custody</b>. Settlement and margin are enforced on-chain by Hyperliquid's audited contracts, and every position is verifiable. Trading is still risky: leverage can liquidate your collateral, so size accordingly.</React.Fragment>,
  },
  {
    q: "Can I copy other traders on ARX?",
    a: <React.Fragment>Yes. ARX Copy Trade lets you mirror <b>on-chain verified leaders</b> — each passes a Three-Gate check (six-month track record, behavioral fingerprint, capital cap). You see the smart-money signal behind every trade before you mirror, with a per-follow kill switch and drawdown circuit breaker.</React.Fragment>,
  },
  {
    q: "How is ARX different from a CFD broker?",
    a: <React.Fragment>A CFD broker is your counterparty: they hold your money, set the price, and can close your account. ARX is <b>a venue, not a counterparty</b> — prices are on-chain, funds are self-custodied, markets run 24/7, and there are no overnight financing fees. Your assets, your keys.</React.Fragment>,
  },
];

function FaqSection({ variant }) {
  const [open, setOpen] = faqUseState(0);
  return (
    <section className={"faq" + (variant === "type" ? " faq--type" : " faq--editorial")}>
      <div className="faq-inner">
        <span className="faq-eyebrow">FAQ</span>
        <h2 className="faq-h2">Frequently Asked Questions</h2>
        <p className="faq-sub">Everything you need to know about trading RWA and crypto perps on ARX.</p>

        <div className="faq-list">
          {FAQ_ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div className={"faq-item" + (isOpen ? " open" : "")} key={i}>
                <button className="faq-q" aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span>{it.q}</span>
                  <span className="faq-ic" aria-hidden="true"></span>
                </button>
                <div className="faq-a" role="region">
                  <div className="faq-a-inner">
                    <p className="faq-a-text">{it.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="faq-foot">
          Still have questions? <a href="/#waitlist">Reach the team →</a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { FaqSection });
