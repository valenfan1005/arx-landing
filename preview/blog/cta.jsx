// ARX closing CTA band — stripped to a single CTA button per request.
// Supports "editorial" (centered) + "type" (left-aligned) variants.

function CtaArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CtaBand({ variant }) {
  return (
    <section className={"cta-band" + (variant === "type" ? " cta-band--type" : " cta-band--editorial")}>
      <a className="cta-band-btn" href="/#waitlist">Join the Waitlist <CtaArrow /></a>
    </section>
  );
}

Object.assign(window, { CtaBand });
