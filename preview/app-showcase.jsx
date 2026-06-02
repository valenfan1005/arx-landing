// ARX App Showcase — three floating phone screens. The two side screens start
// stacked behind the center one and FAN OUT as the section scrolls up through
// the viewport (and converge back on scroll up). Scroll-/scrub-bound via a
// rAF loop that reads the stage's viewport position — works under native page
// scroll, the design-canvas pan, and focus mode alike. Screens are user-
// fillable image-slots.
const { useRef: showUseRef, useLayoutEffect: showUseLayout } = React;

const SHOW_COPY = {
  en: {
    eyebrow: "The ARX app · iOS & Android",
    h2: "The whole market, in your pocket.",
    sub: "Trade RWA and perps, copy verified leaders, and read on-chain signals — non-custodial, on mobile.",
    tags: ["Markets", "Copy Trade", "Leader"],
  },
  kr: {
    eyebrow: "ARX 앱 · iOS & Android",
    h2: "시장 전체를, 당신의 주머니 속에.",
    sub: "RWA와 무기한 선물 거래, 검증된 리더 카피, 온체인 시그널 — 모바일에서, 비수탁으로.",
    tags: ["마켓", "카피 트레이드", "리더"],
  },
};

function Phone({ pos, slotId, tag, placeholder, img }) {
  return (
    <div className={"phone phone--" + pos}>
      <div className="phone-screen">
        {img
          ? <img className="phone-img" src={img} alt={tag + " screen"} draggable="false" />
          : <image-slot id={slotId} shape="rect" placeholder={placeholder}></image-slot>}
      </div>
      {tag && <span className="phone-tag">{tag}</span>}
    </div>
  );
}

function AppShowcase({ lang = "en", variant }) {
  const t = SHOW_COPY[lang] || SHOW_COPY.en;
  const stageRef = showUseRef(null);

  showUseLayout(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const left = stage.querySelector(".phone--left");
    const right = stage.querySelector(".phone--right");
    if (!left || !right) return;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, p) => a + (b - a) * p;
    const smooth = (p) => p * p * (3 - 2 * p); // smoothstep

    // p = 0 → stacked/overlapped behind center · p = 1 → fully fanned out
    const apply = (p) => {
      const e = smooth(p);
      const sc = lerp(0.78, 0.9, e);
      const lx = lerp(-14, -248, e), rx = lerp(14, 248, e);
      left.style.transform =
        `translate(calc(-50% + ${lx}px), -50%) rotateY(${lerp(0, 8, e)}deg) rotateZ(${lerp(-1.5, -11, e)}deg) scale(${sc})`;
      right.style.transform =
        `translate(calc(-50% + ${rx}px), -50%) rotateY(${lerp(0, -8, e)}deg) rotateZ(${lerp(1.5, 11, e)}deg) scale(${sc})`;
      stage.style.setProperty("--fan", e.toFixed(3));
    };

    const targetP = () => {
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const center = r.top + r.height / 2;
      // converged when the stage centre sits low in the viewport; fanned once
      // it has risen to the middle.
      const start = vh * 1.05, end = vh * 0.45;
      return clamp((start - center) / (start - end), 0, 1);
    };

    // side screens are scrubbed by rAF — kill their CSS transition so they
    // track 1:1 with scroll/pan.
    left.style.transition = "none";
    right.style.transition = "none";

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { apply(1); return; }

    let cur = targetP();
    apply(cur); // paint correct state before first frame (no flash)
    let raf = 0;
    const frame = () => {
      const tp = targetP();
      cur += (tp - cur) * 0.16;
      if (Math.abs(tp - cur) < 0.0008) cur = tp;
      apply(cur);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className={"show" + (variant === "type" ? " show--type" : "")}>
      <div className="show-inner">
        <span className="show-eyebrow">{t.eyebrow}</span>
        <h2 className="show-h2">{t.h2}</h2>
        <p className="show-sub">{t.sub}</p>
      </div>
      <div className="show-stage" ref={stageRef}>
        <div className="show-bloom" />
        <Phone pos="left" slotId="show-left" tag={t.tags[0]} img="assets/screens/rwa.png" placeholder="Drop screen 1" />
        <Phone pos="center" slotId="show-center" tag={t.tags[1]} img="assets/screens/copytrade-list.png" placeholder="Drop screen 2" />
        <Phone pos="right" slotId="show-right" tag={t.tags[2]} img="assets/screens/copytrade-detail.png" placeholder="Drop screen 3" />
      </div>
    </section>
  );
}

Object.assign(window, { AppShowcase });
