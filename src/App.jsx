import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function NeuralCanvas({ loader = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const isReduced = reducedMotion();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let width = 0,
      height = 0,
      dpr = 1,
      raf = 0,
      last = 0;
    const count = loader ? (coarse ? 34 : 52) : coarse ? 58 : 104;
    let points = [];
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = Array.from({ length: count }, (_, i) => {
        const angle = i * 2.399963;
        const radius = Math.sqrt((i + 0.5) / count) * (loader ? 0.42 : 0.46);
        return {
          x: 0.5 + Math.cos(angle) * radius,
          y: 0.5 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.0003,
          vy: (Math.random() - 0.5) * 0.0003,
          phase: Math.random() * Math.PI * 2,
          size: 0.6 + Math.random() * 1.2,
        };
      });
    };
    const draw = (time = 0) => {
      raf = 0;
      if (document.hidden) return;
      const t = isReduced ? 0 : time * (loader ? 0.00035 : 0.00016);
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      ctx.clearRect(0, 0, width, height);
      const cx = width * (0.5 + pointer.x * (loader ? 0 : 0.025));
      const cy = height * 0.5;
      const radius = Math.min(width, height) * (loader ? 0.9 : 0.43);
      const projected = points.map((p) => {
        if (!isReduced && loader) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0.08 || p.x > 0.92) p.vx *= -1;
          if (p.y < 0.08 || p.y > 0.92) p.vy *= -1;
        }
        const angle = loader ? 0 : t * 0.7;
        const x =
          (p.x - 0.5) * Math.cos(angle) - (p.y - 0.5) * Math.sin(angle) * 0.55;
        const y =
          (p.x - 0.5) * Math.sin(angle) * 0.55 + (p.y - 0.5) * Math.cos(angle);
        const wave = isReduced ? 1 : 1 + Math.sin(t * 2 + p.phase) * 0.018;
        return {
          ...p,
          sx: cx + (x * wave + pointer.x * 0.018) * radius,
          sy: cy + (y * wave + pointer.y * 0.018) * radius,
        };
      });
      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        if (loader) ctx.arc(cx, cy, radius * ring * 0.19, 0, Math.PI * 2);
        else
          ctx.ellipse(
            cx,
            cy,
            radius * (0.48 + ring * 0.14),
            radius * (0.18 + ring * 0.055),
            -0.45 + t * 0.08,
            0,
            Math.PI * 2,
          );
        ctx.strokeStyle = `rgba(190,215,164,${loader ? 0.075 : 0.055})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      const maxDist = radius * (loader ? 0.25 : 0.27);
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const b = projected[j],
            distance = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (distance < maxDist) {
            const alpha = (1 - distance / maxDist) * (loader ? 0.35 : 0.25);
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = `rgba(190,220,157,${alpha})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
            if (!isReduced && Math.sin(t * 4 + a.phase + b.phase) > 0.94) {
              const pulse = (Math.sin(t * 4 + a.phase + b.phase) + 1) / 2;
              ctx.beginPath();
              ctx.arc(
                a.sx + (b.sx - a.sx) * pulse,
                a.sy + (b.sy - a.sy) * pulse,
                1.5,
                0,
                Math.PI * 2,
              );
              ctx.fillStyle = "#e4ffb1";
              ctx.fill();
            }
          }
        }
      }
      projected.forEach((p) => {
        const active = !isReduced && Math.sin(t * 2.5 + p.phase) > 0.82;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.size * (active ? 1.7 : 1), 0, Math.PI * 2);
        ctx.fillStyle = active ? "#e4ffb1" : "rgba(190,215,169,.65)";
        ctx.fill();
        if (active) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(212,245,106,.12)";
          ctx.fill();
        }
      });
      const pulse = isReduced ? 1 : 1 + Math.sin(t * 4) * 0.2;
      ctx.beginPath();
      ctx.arc(cx, cy, (loader ? 3 : 2.4) * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "#d4f56a";
      ctx.fill();
      if (!isReduced) raf = requestAnimationFrame(draw);
    };
    const onPointer = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!isReduced && !raf) raf = requestAnimationFrame(draw);
    };
    resize();
    draw(0);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loader]);
  return (
    <canvas
      ref={canvasRef}
      className={
        loader ? "neural-canvas loader-canvas" : "neural-canvas hero-canvas"
      }
      aria-hidden="true"
    />
  );
}

function Loader({ onComplete }) {
  const root = useRef(null);
  const [status, setStatus] = useState("Establishing neural pathways");
  useEffect(() => {
    const el = root.current;
    const statuses = [
      "Establishing neural pathways",
      "Mapping connected systems",
      "Preparing the unknown",
    ];
    if (reducedMotion()) {
      onComplete();
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".loader-kicker",
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, delay: 0.08 },
      )
        .fromTo(
          ".loader-mark",
          { scale: 0.78, opacity: 0, rotate: -18 },
          { scale: 1, opacity: 1, rotate: 0, duration: 0.75 },
          "-=.25",
        )
        .fromTo(
          ".loader-wordmark",
          { y: 10, opacity: 0, letterSpacing: ".34em" },
          { y: 0, opacity: 1, letterSpacing: ".22em", duration: 0.65 },
          "-=.35",
        )
        .fromTo(
          ".loader-progress span",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.3, ease: "power2.inOut" },
          "-=.1",
        )
        .to({}, { duration: 0.2 })
        .to(el, {
          autoAlpha: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete,
        });
      gsap.fromTo(
        ".loader-orbit",
        { rotate: -35, scale: 0.9 },
        { rotate: 325, scale: 1.06, duration: 5.5, ease: "none", repeat: -1 },
      );
      gsap.fromTo(
        ".loader-halo",
        { scale: 0.88, opacity: 0.25 },
        {
          scale: 1.1,
          opacity: 0.7,
          duration: 1.7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        },
      );
    }, el);
    const statusTimer = window.setInterval(
      () =>
        setStatus((s) => statuses[(statuses.indexOf(s) + 1) % statuses.length]),
      700,
    );
    return () => {
      window.clearInterval(statusTimer);
      ctx.revert();
    };
  }, [onComplete]);
  return (
    <div
      ref={root}
      className="page-loader"
      role="status"
      aria-label="Loading Aivaara experience"
    >
      <div className="loader-grid" />
      <div className="loader-core">
        <div className="loader-halo" />
        <div className="loader-orbit" />
        <NeuralCanvas loader />
        <div className="loader-mark">
          <span />
          <span />
          <span />
        </div>
      </div>
      <p className="loader-kicker">AIVAARA / SYSTEMS INITIALIZATION</p>
      <div className="loader-wordmark">A I V A A R A</div>
      <p className="loader-status" aria-live="polite">
        {status}
        <i>...</i>
      </p>
      <div className="loader-progress">
        <span />
      </div>
      <div className="loader-bottom">
        <span>INTELLIGENCE IN MOTION</span>
        <span>SYS.01 — ONLINE</span>
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const hero = useRef(null);
  const complete = React.useCallback(() => setLoading(false), []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(
        ".nav",
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75 },
      )
        .fromTo(
          ".eyebrow",
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          "-=.35",
        )
        .fromTo(
          ".headline-line",
          { yPercent: 115, rotate: 1.5 },
          { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.12 },
          "-=.25",
        )
        .fromTo(
          ".hero-copy-reveal",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.12 },
          "-=.45",
        )
        .fromTo(
          ".visual-wrap",
          { x: 30, scale: 0.96, opacity: 0 },
          { x: 0, scale: 1, opacity: 1, duration: 1.2 },
          "-=.9",
        )
        .fromTo(
          ".hero-foot > *",
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
          "-=.5",
        );
      const revealObserver = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, {
                y: 0,
                opacity: 1,
                duration: 0.85,
                ease: "power3.out",
                overwrite: true,
              });
              revealObserver.unobserve(entry.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
      );
      gsap.utils.toArray(".reveal").forEach((el) => revealObserver.observe(el));
      return () => revealObserver.disconnect();
      gsap.to(".hero-grid", {
        backgroundPosition: "0px 68px",
        duration: 12,
        ease: "none",
        repeat: -1,
      });
      gsap.to(".scroll-cue i", {
        scaleX: 1,
        duration: 1.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "left center",
      });
    }, hero);
    return () => ctx.revert();
  }, [loading]);

  useEffect(() => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    const handle = (e) => {
      const href = e.currentTarget.getAttribute("href");
      const target = href && document.querySelector(href);
      if (target) {
        e.preventDefault();
        setMenuOpen(false);
        target.scrollIntoView({
          behavior: reducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }
    };
    anchors.forEach((a) => a.addEventListener("click", handle));
    return () => anchors.forEach((a) => a.removeEventListener("click", handle));
  }, []);

  return (
    <>
      {loading && <Loader onComplete={complete} />}
      <div
        className={`site-shell ${loading ? "site-hidden" : "site-visible"}`}
        ref={hero}
        id="top"
      >
        <div className="topline" />
        <header className="nav">
          <a className="brand" href="#top" aria-label="Aivaara home">
            <span className="brand-mark">
              <i />
            </span>
            <span>AIVAARA</span>
          </a>
          <button
            className="menu-btn"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
          <nav
            className={`nav-links ${menuOpen ? "open" : ""}`}
            aria-label="Main navigation"
          >
            <a href="#approach">Approach</a>
            <a href="#frontiers">Frontiers</a>
            <a href="#contact">Research</a>
          </nav>
          <a className="nav-cta magnetic" href="#contact">
            Let's connect <span>↗</span>
          </a>
        </header>
        <main>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-grid" />
            <div className="ambient" />
            <div className="hero-main">
              <div className="copy">
                <div className="eyebrow">
                  Independent technology &amp; research
                </div>
                <h1 id="hero-title">
                  <span className="line">
                    <span className="headline-line">Intelligence</span>
                  </span>
                  <span className="line">
                    <span className="headline-line">for the</span>
                  </span>
                  <span className="line">
                    <span className="headline-line">
                      <em>Unwritten.</em>
                    </span>
                  </span>
                </h1>
                <p className="dek hero-copy-reveal">
                  We explore the edges of artificial intelligence,
                  cybersecurity, quantitative systems, healthcare technology,
                  and space computing — through first principles, rigorous
                  research, and engineering.
                </p>
                <div className="actions hero-copy-reveal">
                  <a className="btn btn-primary magnetic" href="#approach">
                    <span>Explore Aivaara</span>
                    <span className="arrow">↗</span>
                  </a>
                  <a className="btn btn-secondary magnetic" href="#contact">
                    <span>Start a conversation</span>
                    <span className="arrow">↗</span>
                  </a>
                </div>
                <div className="availability hero-copy-reveal">
                  <span className="pulse" /> Curious minds. Difficult questions.
                </div>
              </div>
              <div className="visual-wrap">
                <NeuralCanvas />
                <div className="visual-caption">Computational field / 001</div>
                <div className="orbital-tag">
                  FIELD STUDY <b>α — 07.24</b>LIVE MODEL
                </div>
                <div className="axis-label">SIGNAL / STRUCTURE / EMERGENCE</div>
                <div className="readout">
                  FIELD STATUS <strong>ACTIVE</strong>
                  <br />
                  NODES <strong>CONNECTED</strong>
                  <br />
                  SYSTEMS <strong>EVOLVING</strong>
                </div>
              </div>
            </div>
            <div className="hero-foot">
              <span className="foot-label">Exploring across disciplines</span>
              <div className="domains">
                <span className="domain">Artificial intelligence</span>
                <span className="domain">Cybersecurity</span>
                <span className="domain">Quantitative systems</span>
                <span className="domain">Healthcare</span>
                <span className="domain">Space computing</span>
              </div>
              <a className="scroll-cue" href="#approach">
                <i /> Scroll to explore
              </a>
            </div>
          </section>
          <section className="next" id="approach">
            <div className="section-index reveal">01 / THE APPROACH</div>
            <div>
              <h2 className="reveal">
                The future isn't found.
                <br />
                It's <em>engineered.</em>
              </h2>
              <p className="reveal">
                Aivaara is an independent technology company exploring difficult
                questions across disciplines. We turn fundamentals, research,
                and rigorous experimentation into systems that can matter in the
                real world.
              </p>
              <div className="frontiers" id="frontiers">
                <a className="frontier reveal" href="#contact">
                  <small>01</small>
                  <span>Intelligence &amp; machine reasoning</span>
                  <b>↗</b>
                </a>
                <a className="frontier reveal" href="#contact">
                  <small>02</small>
                  <span>Security &amp; resilient infrastructure</span>
                  <b>↗</b>
                </a>
                <a className="frontier reveal" href="#contact">
                  <small>03</small>
                  <span>Quantitative &amp; financial systems</span>
                  <b>↗</b>
                </a>
                <a className="frontier reveal" href="#contact">
                  <small>04</small>
                  <span>Healthcare technology</span>
                  <b>↗</b>
                </a>
                <a className="frontier reveal" href="#contact">
                  <small>05</small>
                  <span>Space computing &amp; software</span>
                  <b>↗</b>
                </a>
              </div>
            </div>
          </section>
          <section className="contact" id="contact">
            <div>
              <div className="section-index reveal">02 / OPEN EXCHANGE</div>
              <h2 className="reveal">
                Have a difficult
                <br />
                question? <em>Good.</em>
              </h2>
            </div>
            <div className="contact-meta reveal">
              Ideas become interesting when they're shared.
              <br />
              For research, collaborations, or just a good question.
              <br />
              <br />
              <a href="mailto:hello@aivaara.in">hello@aivaara.in&nbsp; ↗</a>
            </div>
          </section>
        </main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} Aivaara</span>
          <span>Built for the not-yet</span>
          <a href="#top">Back to the beginning ↑</a>
        </footer>
      </div>
    </>
  );
}
