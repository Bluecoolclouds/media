'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Deep imports rather than the `studio` barrel: that barrel is "use client" and
// statically re-exports all 15 studios + muapi, so importing useLang from it drags
// the whole graph into this page's first load (442 kB). These two modules are leaves.
import { useLang } from 'studio/src/i18n/useLang';
import { setLang as setAppLang, LANG_CYCLE, LANG_LABEL } from 'studio/src/i18n/core';
import { landingContent } from './landingContent';

/* ── 3D tilt card: reacts to pointer like higgsfield showcase tiles ───────── */
function TiltCard({ card, index }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * 16;
    const ry = (px - 0.5) * 16;
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(30px) scale(1.04)`,
      '--gx': `${px * 100}%`,
      '--gy': `${py * 100}%`,
    });
  }, []);

  const handleLeave = useCallback(() => {
    setStyle({ transform: 'perspective(900px) rotateX(0) rotateY(0) translateZ(0) scale(1)' });
  }, []);

  // animationDelay staggers the lp-rise entrance. transitionDelay must stay unset:
  // it would also delay the pointer-follow tilt (up to 180ms on the last card).
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...style, animationDelay: `${index * 90}ms`, background: card.grad }}
      className="lp-3d lp-rise group relative aspect-[3/4] rounded-3xl p-[1px] overflow-hidden transition-transform duration-300 ease-out will-change-transform"
    >
      <div className="relative h-full w-full rounded-3xl bg-[#0a0a0c]/80 backdrop-blur-sm overflow-hidden flex flex-col justify-end">
        {/* pointer-follow sheen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'radial-gradient(340px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.14), transparent 60%)' }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: card.grad }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="relative z-10 p-5" style={{ transform: 'translateZ(40px)' }}>
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">{card.kicker}</span>
          <h3 className="mt-1 text-xl font-black tracking-tight text-white">{card.title}</h3>
          <p className="mt-1 text-[13px] leading-snug text-white/60">{card.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingClient() {
  const router = useRouter();
  const lang = useLang();
  const c = landingContent[lang] || landingContent.en;
  const heroRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Same cycle the studio shell uses; setLang persists to localStorage and
  // broadcasts, so /pricing and /studio pick the choice up on navigation.
  const handleLangChange = useCallback(() => {
    setAppLang(LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length]);
  }, [lang]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setParallax({ x, y });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#040406] text-white">
      {/* ── Ambient background field ─────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-[#22d3ee]/[0.10] blur-[190px] rounded-full lp-float-slow" />
        <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-[#a855f7]/[0.09] blur-[170px] rounded-full lp-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[500px] bg-[#38bdf8]/[0.07] blur-[180px] rounded-full lp-float-slow" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
          }}
        />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="relative z-30 h-16 flex items-center justify-between px-6 md:px-10 border-b border-white/[0.05] backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22d3ee] to-[#a855f7] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight">apinet.cloud</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-white/50">
          {c.nav.links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/pricing')} className="hidden sm:block text-[13px] font-semibold text-white/60 hover:text-white transition-colors">
            {c.nav.pricing}
          </button>
          <button
            onClick={handleLangChange}
            title={c.nav.langSwitch}
            aria-label={c.nav.langSwitch}
            className="flex items-center justify-center size-8 rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            {LANG_LABEL[LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length]]}
          </button>
          <button
            onClick={() => router.push('/studio')}
            className="px-4 py-2 rounded-lg bg-white text-black text-[13px] font-bold hover:bg-[#22d3ee] transition-colors active:scale-95"
          >
            {c.nav.cta}
          </button>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative z-10 lp-perspective px-6 pt-20 pb-16 md:pt-28 md:pb-24 text-center max-w-5xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-7 lp-rise" style={{ animationDelay: '40ms' }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22d3ee] opacity-75" style={{ animation: 'lp-pulse-ring 2s ease-out infinite' }} />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22d3ee]" />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/70">{c.hero.badge}</span>
        </div>

        <h1
          className="text-5xl sm:text-7xl md:text-[5.5rem] font-black tracking-tighter leading-[0.9] mb-6 lp-rise"
          style={{ animationDelay: '120ms', transform: `translate(${parallax.x * 14}px, ${parallax.y * 14}px)` }}
        >
          <span className="block text-white">{c.hero.titleLine1}</span>
          <span className="block bg-gradient-to-r from-[#22d3ee] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent lp-gradient">
            {c.hero.titleLine2}
          </span>
        </h1>

        <p className="text-white/55 text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-9 lp-rise" style={{ animationDelay: '200ms' }}>
          {c.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lp-rise" style={{ animationDelay: '280ms' }}>
          <button
            onClick={() => router.push('/studio')}
            className="group relative px-8 py-4 rounded-xl bg-[#22d3ee] text-black font-bold text-sm overflow-hidden hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#22d3ee]/25"
          >
            <span className="absolute inset-0 -skew-x-12 opacity-0 group-hover:opacity-100" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)', animation: 'lp-shimmer 1.1s ease-out' }} />
            <span className="relative">{c.hero.ctaPrimary}</span>
          </button>
          <button
            onClick={() => router.push('/pricing')}
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-colors"
          >
            {c.hero.ctaSecondary}
          </button>
        </div>

        <p className="mt-6 text-xs text-white/35 lp-rise" style={{ animationDelay: '340ms' }}>{c.hero.note}</p>
      </section>

      {/* ── 3D card showcase (higgsfield-style) ──────────────────────────── */}
      <section id="showcase" className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lp-perspective">
          {c.cards.map((card, i) => (
            <TiltCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </section>

      {/* ── Models marquee ───────────────────────────────────────────────── */}
      <section className="relative z-10 py-14 border-y border-white/[0.05] overflow-hidden">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35 mb-8">{c.models.label}</p>
        <div className="relative lp-scene-mask">
          <div className="flex gap-3 w-max lp-marquee">
            {[...c.models.list, ...c.models.list].map((m, i) => (
              <span key={`${m}-${i}`} className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-sm font-semibold text-white/70 whitespace-nowrap">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature rows ─────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">{c.features.title}</h2>
          <p className="text-white/50 max-w-xl mx-auto">{c.features.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {c.features.items.map((f) => (
            <div key={f.title} className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:bg-white/[0.04] hover:border-white/20 transition-all overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: f.glow }} />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-xl" style={{ background: f.glow }}>{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {c.stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">{s.value}</div>
              <div className="mt-1 text-[13px] font-medium text-white/45">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-32">
        <div className="relative max-w-4xl mx-auto rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-12 md:p-16 text-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-[600px] h-[400px] bg-[#22d3ee]/10 blur-[130px] rounded-full" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-5">{c.bottomCta.title}</h2>
            <p className="text-white/55 mb-9 max-w-md mx-auto">{c.bottomCta.subtitle}</p>
            <button
              onClick={() => router.push('/studio')}
              className="px-9 py-4 rounded-xl bg-[#22d3ee] text-black font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#22d3ee]/25"
            >
              {c.bottomCta.button}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 py-10 text-center">
        <p className="text-xs text-white/35">{c.footer}</p>
      </footer>
    </div>
  );
}
