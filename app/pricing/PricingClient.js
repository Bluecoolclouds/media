'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Deep imports, not the `studio` barrel — see the note in app/LandingClient.js.
import { useLang } from 'studio/src/i18n/useLang';
import { setLang as setAppLang, LANG_CYCLE } from 'studio/src/i18n/core';
import { pricingContent } from 'studio/src/i18n/dictionaries/pricing';
import SiteHeader from '@/components/SiteHeader';
import AuthModal from '@/components/AuthModal';
import { useLocalAuth, AUTH_KEY, STORAGE_KEY } from '@/components/account/useLocalAuth';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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

export default function PricingClient() {
  const router = useRouter();
  const [yearly, setYearly] = useState(false);
  const [tierIndexByPlan, setTierIndexByPlan] = useState({});
  const lang = useLang();
  const c = pricingContent[lang] || pricingContent.en;
  const { email, usd, fetchBalance } = useLocalAuth();
  const [showAuth, setShowAuth] = useState(false);
  const isAuthed = Boolean(email);

  const handleCta = (plan) => {
    if (plan.id === 'free') router.push('/studio');
    else if (plan.id === 'enterprise') window.location.href = 'mailto:sales@apinet.cloud';
    else router.push('/studio');
  };

  const handleLangChange = () => {
    const next = LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length];
    setAppLang(next);
  };

  const handleAuthSuccess = ({ key, email: newEmail }) => {
    setShowAuth(false);
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      localStorage.setItem(AUTH_KEY, JSON.stringify({ ...prev, email: newEmail, signedInAt: new Date().toISOString() }));
    } catch (_) {}
    const effectiveKey = key && key.trim();
    if (effectiveKey) {
      localStorage.setItem(STORAGE_KEY, effectiveKey);
      document.cookie = `muapi_key=${effectiveKey}; path=/; max-age=31536000; SameSite=Lax`;
      fetchBalance(effectiveKey);
    }
    window.location.reload();
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    document.cookie = 'muapi_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden relative">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#22d3ee]/[0.08] blur-[180px] rounded-full" />

      {/* Nav — same shared header as /studio and /account */}
      <SiteHeader
        lang={lang}
        onLangChange={handleLangChange}
        balance={usd}
        isAuthed={isAuthed}
        userEmail={email}
        onSignIn={() => setShowAuth(true)}
        onSignOut={handleSignOut}
      />

      {showAuth && (
        <AuthModal onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
      )}

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
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
          <p className="text-white/50 text-base md:text-lg font-medium leading-relaxed">
            {c.hero.subtitle}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span className={`text-sm font-semibold transition-colors ${!yearly ? 'text-white' : 'text-white/40'}`}>
            {c.billing.monthly}
          </span>
          <button
            type="button"
            onClick={() => setYearly((y) => !y)}
            className={`relative w-14 h-7 rounded-full p-1 transition-all ${yearly ? 'bg-[#22d3ee]' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${yearly ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors ${yearly ? 'text-white' : 'text-white/40'}`}>
            {c.billing.yearly}
          </span>
          <span className="text-[11px] font-bold text-[#22d3ee] px-2 py-0.5 bg-[#22d3ee]/10 rounded-full border border-[#22d3ee]/20">
            {c.billing.save}
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {c.plans.map((plan) => {
            const hasTiers = plan.tiers?.length > 0;
            const tierIndex = tierIndexByPlan[plan.id] ?? plan.defaultTierIndex ?? 0;
            const activeTier = hasTiers ? plan.tiers[tierIndex] : null;
            // Tiers override the plan's base monthly/yearly/credits for display,
            // everything else (discount badge, CTA, features) reads off `plan` as-is.
            const price = activeTier ? (yearly ? activeTier.yearly : activeTier.monthly) : (yearly ? plan.yearly : plan.monthly);
            const oldPrice = activeTier ? (yearly ? activeTier.yearlyOld : activeTier.monthlyOld) : (yearly ? plan.yearlyOld : plan.monthlyOld);
            const hasDiscount = oldPrice != null && price != null && oldPrice > price;
            const basePlanMonthly = activeTier ? activeTier.monthly : plan.monthly;
            const basePlanYearly = activeTier ? activeTier.yearly : plan.yearly;
            const monthlySpend = basePlanMonthly || 0;
            const yearlySpend = (basePlanYearly || 0) * 12;
            const annualSavings = Math.max(0, monthlySpend * 12 - yearlySpend);
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-white/[0.04] border-2 border-[#22d3ee]/50 shadow-[0_0_40px_rgba(34,211,238,0.12)] lg:-translate-y-2'
                    : plan.bestValue
                      ? 'bg-gradient-to-b from-[#f43f5e]/[0.08] to-white/[0.02] border-2 border-[#f43f5e]/40 shadow-[0_0_40px_rgba(244,63,94,0.12)]'
                      : 'bg-white/[0.02] border border-white/10 hover:border-white/20'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#22d3ee] text-black text-[10px] font-black uppercase tracking-widest">
                    {c.mostPopular}
                  </div>
                )}

                <div className="mb-5 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-white/40 text-xs font-medium mt-0.5">{plan.tagline}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {hasDiscount && (
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-full bg-[#f43f5e]/15 text-[#fb7185] border border-[#f43f5e]/30">
                        {c.discountBadge}
                      </span>
                    )}
                    {plan.bestValue && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                        ⚡ {c.bestValueBadge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-3 min-h-[64px]">
                  {price === null ? (
                    <div className="text-3xl font-black text-white">{c.priceCustom}</div>
                  ) : (
                    <div className="flex items-end gap-2">
                      {hasDiscount && (
                        <span className="text-xl font-bold text-white/30 line-through mb-1">€{oldPrice}</span>
                      )}
                      <span className="text-4xl font-black text-white">€{price}</span>
                      <span className="text-white/40 text-sm font-medium mb-1.5">{c.priceSuffix}</span>
                    </div>
                  )}
                  {yearly && price > 0 && (
                    <p className="text-[11px] text-white/30 mt-1">{c.billedAnnuallyNote || c.billing.billedAnnually}</p>
                  )}
                  {!yearly && plan.renewsNote && price > 0 && (
                    <p className="text-[11px] text-white/30 mt-1">{plan.renewsNote(oldPrice ?? price)}</p>
                  )}
                  <p className="text-xs font-bold text-[#22d3ee] mt-2">
                    {activeTier ? `${activeTier.credits.toLocaleString()} ${c.creditsUnit}` : plan.credits}
                  </p>
                  {plan.creditsEquiv?.length > 0 && (
                    <ul className="mt-1.5 flex flex-col gap-0.5">
                      {plan.creditsEquiv.map((eq) => (
                        <li key={eq} className="text-[11px] text-white/35">{eq}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {hasTiers && (
                  <div className="mb-5">
                    <input
                      type="range"
                      min={0}
                      max={plan.tiers.length - 1}
                      step={1}
                      value={tierIndex}
                      onChange={(e) => setTierIndexByPlan((prev) => ({ ...prev, [plan.id]: Number(e.target.value) }))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#f43f5e]"
                      style={{
                        background: `linear-gradient(to right, #f43f5e ${(tierIndex / (plan.tiers.length - 1)) * 100}%, rgba(255,255,255,0.08) ${(tierIndex / (plan.tiers.length - 1)) * 100}%)`,
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      {plan.tiers.map((t, i) => (
                        <span key={t.credits} className={`text-[10px] font-semibold ${i === tierIndex ? 'text-white' : 'text-white/30'}`}>
                          {t.credits.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleCta(plan)}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    plan.highlight
                      ? 'bg-[#22d3ee] text-black hover:bg-[#e5ff33]'
                      : plan.bestValue
                        ? 'bg-gradient-to-r from-[#f43f5e] to-[#ec4899] text-white hover:brightness-110'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
                {yearly && annualSavings > 0 && (
                  <p className="text-center text-[11px] font-semibold text-[#22d3ee] mt-2">
                    {c.saveVsMonthly ? c.saveVsMonthly(annualSavings) : null}
                  </p>
                )}

                <ul className="flex flex-col gap-3 mt-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/70">
                      <span className={plan.highlight ? 'text-[#22d3ee]' : 'text-white/40'}>
                        <CheckIcon />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.unlimitedGens?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 mb-3">
                      {c.unlimitedGensTitle}
                    </p>
                    <ul className="flex flex-col gap-2.5">
                      {plan.unlimitedGens.map((g) => (
                        <li key={g.model} className="flex items-center justify-between gap-2 text-[12px]">
                          <span className={`flex items-center gap-1.5 ${g.available ? 'text-white/80' : 'text-white/30'}`}>
                            {g.available ? (
                              <span className="text-[#22d3ee]"><CheckIcon /></span>
                            ) : (
                              <span className="text-white/25">✕</span>
                            )}
                            {g.model}
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/50">{g.badge}</span>
                          </span>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            g.available ? 'bg-[#22d3ee]/15 text-[#22d3ee]' : 'bg-white/5 text-white/30'
                          }`}>
                            {g.state}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-2xl md:text-3xl font-black text-center tracking-tight mb-10">
            {c.faqTitle}
          </h2>
          <div className="flex flex-col gap-3">
            {c.faq.map((item) => (
              <FaqItem key={item.q} item={item} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center relative">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-[500px] h-[300px] bg-[#a855f7]/10 blur-[140px] rounded-full" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
              {c.bottomCta.title}
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              {c.bottomCta.subtitle}
            </p>
            <button
              onClick={() => router.push('/studio')}
              className="px-8 py-3.5 bg-[#22d3ee] text-black rounded-xl font-bold text-sm hover:bg-[#e5ff33] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#22d3ee]/20"
            >
              {c.bottomCta.button}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
