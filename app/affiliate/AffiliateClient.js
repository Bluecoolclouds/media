'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from 'studio/src/i18n/useLang';
import { setLang as setAppLang, LANG_CYCLE } from 'studio/src/i18n/core';
import { affiliateContent } from 'studio/src/i18n/dictionaries/affiliate';
import SiteHeader from '@/components/SiteHeader';
import { useAccountAuth, signOutAndClear, loginUrl } from '@/components/account/useAccountAuth';

const COMMISSION_RATE = 0.25;
const MONTHS = 12;

function formatUsd(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="w-full text-left border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <span className="text-sm font-semibold text-white">{item.q}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`shrink-0 text-white/40 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      {open && (
        <p className="px-5 pb-4 text-sm text-white/50 leading-relaxed">{item.a}</p>
      )}
    </button>
  );
}

function Slider({ label, unit, value, min, max, step, display, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-semibold text-white/70">{label}</span>
        <span className="text-sm font-black text-[#22d3ee]">{display} <span className="text-white/40 font-medium">{unit}</span></span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#22d3ee]"
        style={{
          background: `linear-gradient(to right, #22d3ee ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
        }}
      />
    </div>
  );
}

export default function AffiliateClient() {
  const router = useRouter();
  const lang = useLang();
  const c = affiliateContent[lang] || affiliateContent.en;
  const { email, usd, isAuthed } = useAccountAuth();

  const [referrals, setReferrals] = useState(20);
  const [spend, setSpend] = useState(40);

  const total = useMemo(() => {
    // New referrals compound monthly (last month's cohort keeps paying),
    // each cohort contributes for the remaining months within the 12-month window.
    let sum = 0;
    for (let month = 1; month <= MONTHS; month += 1) {
      const monthsRemaining = MONTHS - month + 1;
      sum += referrals * spend * COMMISSION_RATE * monthsRemaining;
    }
    return sum;
  }, [referrals, spend]);

  const mailHref = `mailto:${c.apply.email}?subject=${encodeURIComponent('Affiliate program application')}`;

  const handleLangChange = () => {
    const next = LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length];
    setAppLang(next);
  };

  const handleSignOut = () => signOutAndClear('/');

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden relative">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#22d3ee]/[0.08] blur-[180px] rounded-full" />
      <div className="pointer-events-none absolute top-[40%] right-[-10%] w-[600px] h-[500px] bg-[#a855f7]/[0.07] blur-[170px] rounded-full" />

      {/* Nav — same shared header as /studio, /account and /pricing */}
      <SiteHeader
        lang={lang}
        onLangChange={handleLangChange}
        balance={usd}
        isAuthed={isAuthed}
        userEmail={email}
        onSignIn={() => router.push(loginUrl('/affiliate'))}
        onSignOut={handleSignOut}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-14 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">{c.hero.badge}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.92] mb-5">
            <span className="block text-white">{c.hero.titleLine1}</span>
            <span className="block bg-gradient-to-r from-[#22d3ee] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">
              {c.hero.titleLine2}
            </span>
          </h1>
          <p className="text-white/50 text-base md:text-lg font-medium leading-relaxed mb-8">
            {c.hero.subtitle}
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={mailHref}
              className="px-7 py-3.5 bg-[#22d3ee] text-black rounded-xl font-bold text-sm hover:bg-[#e5ff33] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#22d3ee]/20"
            >
              {c.hero.ctaPrimary}
            </a>
            <a
              href="#how-it-works"
              className="px-7 py-3.5 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {c.hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Numbers strip */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-24 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          {c.numbers.items.map((n) => (
            <div key={n.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent">{n.value}</div>
              <p className="mt-2 text-[11px] md:text-xs font-medium text-white/50 leading-snug">{n.label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div id="how-it-works" className="mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#22d3ee]">{c.steps.label}</span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-3 mb-3">{c.steps.title}</h2>
            <p className="text-white/50 text-sm md:text-base">{c.steps.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.steps.items.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="w-9 h-9 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] font-black flex items-center justify-center text-sm mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings calculator */}
        <div className="mb-24">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a855f7]">{c.calculator.label}</span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-3 mb-3">{c.calculator.title}</h2>
            <p className="text-white/50 text-sm md:text-base">{c.calculator.subtitle}</p>
          </div>
          <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-col gap-8 mb-8">
              <Slider
                label={c.calculator.referralsLabel}
                unit={c.calculator.referralsUnit}
                value={referrals}
                min={1}
                max={200}
                step={1}
                display={referrals}
                onChange={setReferrals}
              />
              <Slider
                label={c.calculator.spendLabel}
                unit={c.calculator.spendUnit}
                value={spend}
                min={10}
                max={300}
                step={5}
                display={`$${spend}`}
                onChange={setSpend}
              />
            </div>
            <div className="text-center rounded-xl bg-gradient-to-br from-[#22d3ee]/10 to-[#a855f7]/10 border border-white/10 py-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">{c.calculator.totalLabel}</p>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent">
                {formatUsd(total)}
              </div>
            </div>
            <p className="text-[11px] text-white/30 text-center mt-4">{c.calculator.disclaimer}</p>
          </div>
        </div>

        {/* Perks */}
        <div className="mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#22d3ee]">{c.perks.label}</span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-3 mb-3">{c.perks.title}</h2>
            <p className="text-white/50 text-sm md:text-base">{c.perks.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {c.perks.items.map((perk) => (
              <div key={perk.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex gap-4">
                <span className="text-2xl shrink-0">{perk.icon}</span>
                <div>
                  <h3 className="font-bold text-white mb-1.5">{perk.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-24">
          <h2 className="text-2xl md:text-3xl font-black text-center tracking-tight mb-10">
            {c.faqTitle}
          </h2>
          <div className="flex flex-col gap-3">
            {c.faq.map((item) => (
              <FaqItem key={item.q} item={item} />
            ))}
          </div>
        </div>

        {/* Apply CTA */}
        <div className="text-center relative">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-[500px] h-[300px] bg-[#a855f7]/10 blur-[140px] rounded-full" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
              {c.apply.title}
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              {c.apply.subtitle}
            </p>
            <a
              href={mailHref}
              className="inline-block px-8 py-3.5 bg-[#22d3ee] text-black rounded-xl font-bold text-sm hover:bg-[#e5ff33] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#22d3ee]/20"
            >
              {c.apply.emailCta}
            </a>
            <p className="mt-4 text-xs text-white/30">{c.apply.email}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
