import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Add your portrait to public/abhishek.jpg, then set this to '/abhishek.jpg'. Leave empty for the animated abstract artwork.
const FOUNDER_PHOTO = "";

function NeuralLoader({ onComplete }) {
  const root = useRef(null),
    canvas = useRef(null),
    progress = useRef(null),
    status = useRef(null);
  useEffect(() => {
    const el = root.current,
      c = canvas.current,
      ctx = c.getContext("2d");
    let raf = 0,
      w = 0,
      h = 0,
      dpr = 1,
      live = true;
    const reduced = reduceMotion(),
      coarse = matchMedia("(pointer: coarse)").matches;
    const nodes = Array.from({ length: coarse ? 38 : 58 }, (_, i) => {
      const a = i * 2.399963,
        r = Math.sqrt((i + 0.5) / (coarse ? 38 : 58)) * 0.42;
      return {
        x: 0.5 + Math.cos(a) * r,
        y: 0.49 + Math.sin(a) * r,
        vx: (Math.random() - 0.5) * 0.00032,
        vy: (Math.random() - 0.5) * 0.00032,
        p: Math.random() * Math.PI * 2,
        s: 0.7 + Math.random() * 1.2,
      };
    });
    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (ms = 0) => {
      if (!live || document.hidden) return;
      const t = reduced ? 0 : ms * 0.00035,
        cx = w / 2,
        cy = h / 2,
        R = Math.min(w, h) * 0.86;
      ctx.clearRect(0, 0, w, h);
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.13 + i * 0.105), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(190,218,166,.10)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      const pts = nodes.map((n) => {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0.09 || n.x > 0.91) n.vx *= -1;
          if (n.y < 0.1 || n.y > 0.88) n.vy *= -1;
        }
        return { ...n, sx: cx + (n.x - 0.5) * R, sy: cy + (n.y - 0.49) * R };
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i],
            b = pts[j],
            dist = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (dist < R * 0.25) {
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = `rgba(190,220,163,${(1 - dist / (R * 0.25)) * 0.35})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      pts.forEach((n) => {
        const active = Math.sin(t * 2.5 + n.p) > 0.83;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, n.s * (active ? 1.7 : 1), 0, Math.PI * 2);
        ctx.fillStyle = active ? "#d4f56a" : "rgba(191,218,171,.68)";
        ctx.fill();
        if (active) {
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(212,245,106,.11)";
          ctx.fill();
        }
      });
      const pulse = 1 + Math.sin(t * 3) * 0.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.2 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "#d4f56a";
      ctx.fill();
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(c);
    const statusLines = [
      "INITIALIZING NEURAL PATHWAYS",
      "MAPPING CONNECTED SYSTEMS",
      "PREPARING THE UNKNOWN",
    ];
    let idx = 0;
    const statusTimer = reduced
      ? null
      : window.setInterval(() => {
          idx = (idx + 1) % statusLines.length;
          if (status.current) status.current.textContent = statusLines[idx];
        }, 700);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (reduced)
      gsap.set(
        [root.current, ".loader-brand", ".loader-meta", ".loader-rule"],
        { clearProps: "all" },
      );
    else
      tl.fromTo(
        ".loader-brand",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65 },
      )
        .fromTo(
          ".loader-meta",
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=.22",
        )
        .fromTo(
          ".loader-rule span",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.25, ease: "power2.inOut" },
          "-=.2",
        );
    gsap.to(progress.current, {
      scaleX: 1,
      duration: reduced ? 0 : 1.45,
      ease: "power2.inOut",
      transformOrigin: "left",
    });
    const started = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = reduced
        ? 0
        : Math.max(0, 1350 - (performance.now() - started));
      window.setTimeout(() => {
        live = false;
        cancelAnimationFrame(raf);
        clearInterval(statusTimer);
        resizeObserver.disconnect();
        gsap.to(el, {
          autoAlpha: 0,
          duration: reduced ? 0 : 0.85,
          ease: "power2.inOut",
          onComplete: onComplete,
        });
      }, wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const safety = window.setTimeout(finish, 4200);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      clearInterval(statusTimer);
      clearTimeout(safety);
      resizeObserver.disconnect();
      window.removeEventListener("load", finish);
      tl.kill();
    };
  }, [onComplete]);
  return (
    <div
      className="loader"
      ref={root}
      role="status"
      aria-label="Loading Aivaara experience"
    >
      <div className="loader-top">
        <span className="loader-brand">
          <img
            className="brand-logo loader-logo"
            src="/aivaara-logo.svg"
            alt=""
          />
          AIVAARA
        </span>
        <span className="loader-index">SYSTEM / 001</span>
      </div>
      <canvas className="neural-canvas" ref={canvas} aria-hidden="true" />
      <div className="loader-center">
        <span className="loader-kicker">A SYSTEMS EXPLORATION</span>
        <div className="loader-title">
          Intelligence<span> in motion.</span>
        </div>
        <div className="loader-rule">
          <span ref={progress} />
        </div>
        <div className="loader-meta" ref={status}>
          INITIALIZING NEURAL PATHWAYS
        </div>
      </div>
      <div className="loader-bottom">
        <span>ENGINEERING THE NOT-YET</span>
        <span>
          PLEASE STAND BY <i className="loader-dot" />
        </span>
      </div>
    </div>
  );
}

function NetworkField() {
  const canvas = useRef(null),
    wrap = useRef(null);
  useEffect(() => {
    const c = canvas.current,
      ctx = c.getContext("2d"),
      host = wrap.current,
      reduced = reduceMotion(),
      coarse = matchMedia("(pointer: coarse)").matches;
    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0,
      live = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const points = Array.from({ length: coarse ? 70 : 118 }, (_, i) => {
      const a = i * 2.39996,
        r = Math.sqrt((i + 0.5) / (coarse ? 70 : 118));
      return {
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        z: Math.random() - 0.5,
        p: Math.random() * 6.28,
        s: 0.6 + Math.random() * 1.1,
      };
    });
    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(devicePixelRatio || 1, 1.6);
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (ms) => {
      if (!live || document.hidden) return;
      const t = ms * (reduced ? 0.000035 : 0.00018);
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      ctx.clearRect(0, 0, w, h);
      const cx = w * (0.51 + pointer.x * 0.012),
        cy = h * (0.5 + pointer.y * 0.01),
        R = Math.min(w, h) * 0.44,
        co = Math.cos(t),
        si = Math.sin(t);
      const p = points.map((n) => {
        const x = n.x * co - n.y * si * 0.65,
          y = n.x * si * 0.65 + n.y * co;
        return {
          ...n,
          sx: cx + x * R * (1 + n.z * 0.15),
          sy: cy + y * R * (1 + n.z * 0.15),
        };
      });
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          R * (0.48 + k * 0.16),
          R * (0.17 + k * 0.055),
          -0.42 + t * (k % 2 ? -0.12 : 0.1),
          0,
          Math.PI * 2,
        );
        ctx.strokeStyle = `rgba(177,201,151,${0.08 + k * 0.01})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      for (let i = 0; i < p.length; i++)
        for (let j = i + 1; j < p.length; j++) {
          const a = p[i],
            b = p[j],
            dx = a.sx - b.sx,
            dy = a.sy - b.sy,
            dist = dx * dx + dy * dy;
          if (dist < R * R * 0.08) {
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = `rgba(181,207,152,${(1 - dist / (R * R * 0.08)) * 0.23})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      p.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, n.s, 0, Math.PI * 2);
        ctx.fillStyle =
          n.s > 1.3 ? "rgba(218,246,166,.85)" : "rgba(184,206,165,.47)";
        ctx.fill();
      });
      for (let k = 0; k < 3; k++) {
        const a = t * (k % 2 ? -0.7 : 0.9) + k * 2.1,
          x = cx + Math.cos(a) * R * (0.48 + k * 0.12),
          y = cy + Math.sin(a) * R * (0.25 + k * 0.05);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#d4f56a";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 9 + Math.sin(t * 4 + k) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(212,245,106,.28)";
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    const move = (e) => {
      const r = host.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const leave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };
    const visibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    };
    resize();
    draw(0);
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div className="network-field" ref={wrap}>
      <canvas
        ref={canvas}
        className="field"
        aria-label="Animated interconnected computational network"
      />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true),
    [menuOpen, setMenuOpen] = useState(false),
    [showBackTop, setShowBackTop] = useState(false);
  const finishLoading = React.useCallback(() => setLoading(false), []);
  const siteRef = useRef(null);

  // Optional production-only friction for casual source inspection. This is not security:
  // browser tools can bypass it, so never put secrets or private logic in client-side code.
  useEffect(() => {
    if (!import.meta.env.PROD) return undefined;

    const blockContextMenu = (event) => event.preventDefault();
    const blockInspectionShortcuts = (event) => {
      const key = event.key.toLowerCase();
      const blocked =
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && key === "u");
      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    window.addEventListener("keydown", blockInspectionShortcuts, true);
    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      window.removeEventListener("keydown", blockInspectionShortcuts, true);
    };
  }, []);

  useEffect(() => {
    const onScroll = () =>
      setShowBackTop(window.scrollY > Math.max(420, window.innerHeight * 0.65));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleInternalNavigation = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion() ? "auto" : "smooth",
        block: "start",
      });
      if (link.closest(".nav-links")) setMenuOpen(false);
    };
    document.addEventListener("click", handleInternalNavigation);
    return () =>
      document.removeEventListener("click", handleInternalNavigation);
  }, []);

  useLayoutEffect(() => {
    if (loading) return;
    const reduced = reduceMotion();
    const coarse = matchMedia("(pointer: coarse)").matches;
    const interactionCleanups = [];
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          ".nav, .hero .eyebrow, .headline-line, .hero-copy-reveal, .visual-wrap, .hero-foot > *, .motion-reveal",
          { clearProps: "all" },
        );
        return;
      }

      // A coordinated entrance, with the copy and computational field moving as one composition.
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .fromTo(
          ".nav",
          { y: -22, autoAlpha: 0, filter: "blur(5px)" },
          { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.9 },
        )
        .fromTo(
          ".hero .eyebrow",
          { x: -18, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.7 },
          "-=.48",
        )
        .fromTo(
          ".headline-line",
          { yPercent: 125, rotate: 2.5, filter: "blur(7px)" },
          {
            yPercent: 0,
            rotate: 0,
            filter: "blur(0px)",
            duration: 1.12,
            stagger: 0.13,
          },
          "-=.28",
        )
        .fromTo(
          ".hero-copy-reveal",
          { y: 24, autoAlpha: 0, filter: "blur(3px)" },
          {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.85,
            stagger: 0.13,
          },
          "-=.52",
        )
        .fromTo(
          ".visual-wrap",
          { scale: 0.86, x: 46, rotate: 2, autoAlpha: 0, filter: "blur(8px)" },
          {
            scale: 1,
            x: 0,
            rotate: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 1.45,
            ease: "expo.out",
          },
          "-=1.05",
        )
        .fromTo(
          ".hero-foot > *",
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.09 },
          "-=.62",
        );

      // Section entrances: headings wipe upward, paragraphs arrive softly, rows cascade in.
      gsap.utils.toArray(".section-index").forEach((el) => {
        gsap.fromTo(
          el,
          { x: -20, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });
      gsap.utils.toArray(".section-title").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 35, autoAlpha: 0, clipPath: "inset(0 0 35% 0)" },
          {
            yPercent: 0,
            autoAlpha: 1,
            clipPath: "inset(0 0 0% 0)",
            duration: 1.05,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 84%", once: true },
          },
        );
      });
      gsap.utils.toArray(".copy-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 28, autoAlpha: 0, filter: "blur(4px)" },
          {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 89%", once: true },
          },
        );
      });
      gsap.fromTo(
        ".frontier",
        { x: -26, autoAlpha: 0, clipPath: "inset(0 0 0 12%)" },
        {
          x: 0,
          autoAlpha: 1,
          clipPath: "inset(0 0 0 0%)",
          duration: 0.78,
          stagger: 0.105,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".frontiers",
            start: "top 80%",
            once: true,
          },
        },
      );
      gsap.fromTo(
        ".founder-visual",
        { scale: 0.84, rotate: -5, autoAlpha: 0 },
        {
          scale: 1,
          rotate: 0,
          autoAlpha: 1,
          duration: 1.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".founder-visual",
            start: "top 82%",
            once: true,
          },
        },
      );
      gsap.fromTo(
        ".join-card",
        { y: 35, autoAlpha: 0, rotateX: 4 },
        {
          y: 0,
          autoAlpha: 1,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.16,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".join-grid",
            start: "top 82%",
            once: true,
          },
        },
      );

      gsap.to(".scroll-cue i", {
        scaleX: 1,
        duration: 1.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "left center",
      });

      // Magnetic movement is deliberately restrained and disabled on touch devices.
      if (!coarse) {
        gsap.utils.toArray("[data-magnetic]").forEach((el) => {
          const xTo = gsap.quickTo(el, "x", {
            duration: 0.35,
            ease: "power3.out",
          });
          const yTo = gsap.quickTo(el, "y", {
            duration: 0.35,
            ease: "power3.out",
          });
          const move = (event) => {
            const r = el.getBoundingClientRect();
            xTo((event.clientX - r.left - r.width / 2) * 0.11);
            yTo((event.clientY - r.top - r.height / 2) * 0.13);
          };
          const reset = () => {
            xTo(0);
            yTo(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", reset);
          interactionCleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", reset);
          });
        });
      }

      // A tactile row response with no abrupt jumps.
      gsap.utils.toArray(".frontier").forEach((row) => {
        const arrow = row.querySelector(".frontier-mark");
        const enter = () => {
          gsap.to(row, {
            paddingLeft: 10,
            duration: 0.35,
            ease: "power3.out",
            overwrite: true,
          });
          if (arrow)
            gsap.to(arrow, {
              x: 4,
              y: -4,
              duration: 0.35,
              ease: "power3.out",
              overwrite: true,
            });
        };
        const leave = () => {
          gsap.to(row, {
            paddingLeft: 0,
            duration: 0.45,
            ease: "power3.out",
            overwrite: true,
          });
          if (arrow)
            gsap.to(arrow, {
              x: 0,
              y: 0,
              duration: 0.45,
              ease: "power3.out",
              overwrite: true,
            });
        };
        row.addEventListener("pointerenter", enter);
        row.addEventListener("pointerleave", leave);
        interactionCleanups.push(() => {
          row.removeEventListener("pointerenter", enter);
          row.removeEventListener("pointerleave", leave);
        });
      });
    }, siteRef);
    return () => {
      interactionCleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [loading]);

  const closeMenu = () => setMenuOpen(false);
  const joinSubject = encodeURIComponent("I'd like to join Aivaara");
  const collabSubject = encodeURIComponent("A collaboration idea for Aivaara");

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {loading && <NeuralLoader onComplete={finishLoading} />}
      <div
        className={`site ${loading ? "site-loading" : "site-ready"}`}
        id="top"
        ref={siteRef}
      >
        <div className="topline" />
        <header className="nav">
          <a className="brand" href="#top" aria-label="Aivaara home">
            <img className="brand-logo" src="/aivaara-logo.svg" alt="" />
            <span>AIVAARA</span>
          </a>
          <button
            className={`menu-btn ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="navLinks"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
          <nav
            className={`nav-links ${menuOpen ? "open" : ""}`}
            id="navLinks"
            aria-label="Main navigation"
          >
            <a href="#approach" onClick={closeMenu}>
              Approach
            </a>
            <a href="#frontiers" onClick={closeMenu}>
              Frontiers
            </a>
            <a href="#founder" onClick={closeMenu}>
              Founder
            </a>
            <a href="#join" onClick={closeMenu}>
              Join us
            </a>
          </nav>
          <a className="nav-cta" data-magnetic href="#contact">
            Let's talk <span>↗</span>
          </a>
        </header>
        <main id="main">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-grid" />
            <div className="ambient" />
            <div className="hero-main">
              <div className="copy">
                <div className="eyebrow">
                  Independent technology and research
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
                  Aivaara is a place to follow hard questions, learn by
                  building, and see what becomes possible when engineering meets
                  curiosity. Our interests span artificial intelligence,
                  cybersecurity, healthcare, financial research, quantitative
                  systems, and space computing.
                </p>
                <div className="actions hero-copy-reveal">
                  <a className="btn btn-primary" data-magnetic href="#approach">
                    <span>Explore Aivaara</span>
                    <span className="arrow">↗</span>
                  </a>
                  <a
                    className="btn btn-secondary"
                    data-magnetic
                    href="#contact"
                  >
                    <span>Start a conversation</span>
                    <span className="arrow">↗</span>
                  </a>
                </div>
                <div className="availability hero-copy-reveal">
                  <span className="pulse" /> Curious minds are welcome here.
                </div>
              </div>
              <div className="visual-wrap">
                <NetworkField />
                <div className="visual-caption">
                  A living field of connections
                </div>
                <div className="orbital-tag">
                  <b>FIELD / 01</b>EMERGENT
                  <br />
                  INTELLIGENCE
                </div>
                <div className="axis-label">SIGNAL / STRUCTURE / SYSTEM</div>
                <div className="readout">
                  FIELD STATUS&nbsp; <strong>ACTIVE</strong>
                  <br />
                  NODES&nbsp; <strong>CONNECTED</strong>
                  <br />
                  STATE&nbsp; <strong>EVOLVING</strong>
                </div>
              </div>
            </div>
            <div className="hero-foot">
              <span className="foot-label">Questions worth exploring</span>
              <div className="domains">
                <span className="domain">Artificial intelligence</span>
                <span className="domain">Cybersecurity</span>
                <span className="domain">Quantitative research</span>
                <span className="domain">Healthcare</span>
                <span className="domain">Space computing</span>
              </div>
              <a className="scroll-cue" href="#approach">
                <i /> Scroll to explore
              </a>
            </div>
          </section>

          <section
            className="next"
            id="approach"
            aria-labelledby="approach-title"
          >
            <div className="section-index">01 / THE APPROACH</div>
            <div>
              <h2 className="section-title" id="approach-title">
                Start with curiosity.
                <br />
                Keep <em>building.</em>
              </h2>
              <p className="copy-reveal">
                Aivaara is still growing, and that is part of the point. We want
                to understand how things work, ask better questions, and turn
                what we learn into useful technology. The work matters more than
                the noise around it.
              </p>
              <div
                className="frontiers"
                id="frontiers"
                aria-label="Aivaara's areas of exploration"
              >
                <div className="frontier">
                  <small>01</small>
                  <span>Artificial Intelligence</span>
                  <i className="frontier-mark" aria-hidden="true">
                    ◇
                  </i>
                </div>
                <div className="frontier">
                  <small>02</small>
                  <span>Cybersecurity</span>
                  <i className="frontier-mark" aria-hidden="true">
                    ◇
                  </i>
                </div>
                <div className="frontier">
                  <small>03</small>
                  <span>Quantitative research and financial systems</span>
                  <i className="frontier-mark" aria-hidden="true">
                    ◇
                  </i>
                </div>
                <div className="frontier">
                  <small>04</small>
                  <span>Healthcare technology</span>
                  <i className="frontier-mark" aria-hidden="true">
                    ◇
                  </i>
                </div>
                <div className="frontier">
                  <small>05</small>
                  <span>Space computing and software</span>
                  <i className="frontier-mark" aria-hidden="true">
                    ◇
                  </i>
                </div>
                <div className="frontier">
                  <small>06</small>
                  <span>Systems engineering and infrastructure</span>
                  <i className="frontier-mark" aria-hidden="true">
                    ◇
                  </i>
                </div>
              </div>
            </div>
          </section>

          <section
            className="founder-section"
            id="founder"
            aria-labelledby="founder-title"
          >
            <div className="section-index">02 / A NOTE FROM THE FOUNDER</div>
            <div className="founder-layout">
              <div
                className={`founder-visual ${FOUNDER_PHOTO ? "has-founder-photo" : "is-abstract"}`}
                aria-label={
                  FOUNDER_PHOTO
                    ? "Portrait of Aivaara founder Abhishek"
                    : "Animated abstract founder artwork"
                }
              >
                <div className="founder-art" aria-hidden="true">
                  <div className="founder-aura" />
                  <div className="founder-orbit orbit-one" />
                  <div className="founder-orbit orbit-two" />
                  <div className="founder-orbit orbit-three" />
                  <svg
                    className="founder-constellation"
                    viewBox="0 0 500 500"
                    aria-hidden="true"
                  >
                    <path d="M70 340 155 220 242 285 325 135 430 205M155 220 190 95 325 135 360 360 242 285 120 420M325 135 430 205 360 360 430 410" />
                    <circle cx="155" cy="220" r="4" />
                    <circle cx="325" cy="135" r="5" />
                    <circle cx="242" cy="285" r="3" />
                    <circle cx="360" cy="360" r="4" />
                    <circle cx="190" cy="95" r="3" />
                  </svg>
                  <span className="founder-cross cross-a">+</span>
                  <span className="founder-cross cross-b">+</span>
                  {!FOUNDER_PHOTO && (
                    <div className="founder-art-title">
                      <span>INDEPENDENT THINKING</span>
                      <strong>
                        Curiosity
                        <br />
                        <em>in motion.</em>
                      </strong>
                      <i>ENGINEERING / RESEARCH / PEOPLE</i>
                    </div>
                  )}
                </div>
                {FOUNDER_PHOTO && (
                  <img
                    className="founder-photo"
                    src={FOUNDER_PHOTO}
                    alt="Abhishek, founder of Aivaara"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="founder-frame" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="founder-photo-label">
                  <span className="founder-status-dot" />
                  {FOUNDER_PHOTO
                    ? "ABHISHEK / FOUNDER"
                    : "AIVAARA / IN THE MAKING"}
                </div>
                <span className="founder-coordinates">
                  MUMBAI, INDIA <b>·</b> 19°04′ N<br />
                  BUILDING FROM FIRST PRINCIPLES
                </span>
              </div>
              <div className="founder-copy">
                <p className="founder-kicker">A little about me</p>
                <h2 className="section-title" id="founder-title">
                  Meet the <em>founder.</em>
                </h2>
                <p className="copy-reveal">
                  I'm Abhishek, a second year Computer Science Engineering
                  student with a curiosity for how technology works beneath the
                  surface. I started Aivaara because I wanted a place to explore
                  ideas seriously, build things from the ground up, and bring
                  people together around problems worth solving.
                </p>
                <p className="copy-reveal">
                  My vision is to grow Aivaara into an engineering led
                  technology company that stays curious, keeps learning, and
                  builds useful things with care. I'm at the beginning of that
                  journey, and I'm excited to meet people who want to help shape
                  it.
                </p>
                <a
                  className="text-link copy-reveal"
                  href="mailto:abhishekmaurya2510@gmail.com?subject=Hello%20Abhishek"
                >
                  Say hello <span>↗</span>
                </a>
              </div>
            </div>
          </section>

          <section
            className="join-section"
            id="join"
            aria-labelledby="join-title"
          >
            <div className="section-index">03 / BUILD SOMETHING TOGETHER</div>
            <div className="join-heading">
              <h2 className="section-title" id="join-title">
                Good ideas grow
                <br />
                when people <em>show up.</em>
              </h2>
              <p className="copy-reveal">
                Aivaara is growing one step at a time. If you're curious,
                thoughtful, and willing to learn by doing, there could be a
                place for you here.
              </p>
            </div>
            <div className="join-grid">
              <article className="join-card">
                <span className="join-number">01 / JOIN THE TEAM</span>
                <h3>Want to build with us?</h3>
                <p>
                  We're interested in meeting students and makers who care about
                  solving real problems, sharing what they know, and learning
                  alongside others.
                </p>
                <a
                  className="btn btn-primary"
                  data-magnetic
                  href={`mailto:hello@aivaara.in?subject=${joinSubject}`}
                >
                  <span>Get involved</span>
                  <span className="arrow">↗</span>
                </a>
              </article>
              <article className="join-card">
                <span className="join-number">02 / COLLABORATE</span>
                <h3>Have an idea in mind?</h3>
                <p>
                  If you're working on a project, exploring a research question,
                  or see a way we could work together, we'd love to hear what
                  you're thinking.
                </p>
                <a
                  className="btn btn-secondary"
                  data-magnetic
                  href={`mailto:hello@aivaara.in?subject=${collabSubject}`}
                >
                  <span>Share your idea</span>
                  <span className="arrow">↗</span>
                </a>
              </article>
            </div>
          </section>

          <section
            className="contact"
            id="contact"
            aria-labelledby="contact-title"
          >
            <div>
              <div className="section-index">04 / OPEN EXCHANGE</div>
              <h2 className="section-title" id="contact-title">
                Start with a<br />
                <em>conversation.</em>
              </h2>
            </div>
            <div className="contact-meta copy-reveal">
              No pitch needed. Tell us what you're working on, what you're
              curious about, or what you'd like to build together.
              <br />
              <br />
              <a href="mailto:hello@aivaara.in">hello@aivaara.in&nbsp; ↗</a>
            </div>
          </section>
        </main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} Aivaara</span>
          <span>Built with curiosity in Mumbai</span>
        </footer>
        <button
          className={`back-to-top ${showBackTop ? "is-visible" : ""}`}
          type="button"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduceMotion() ? "auto" : "smooth",
            })
          }
          tabIndex={showBackTop ? 0 : -1}
        >
          <span aria-hidden="true">↑</span>
          <small>TOP</small>
        </button>
        <div className="grain" aria-hidden="true" />
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
