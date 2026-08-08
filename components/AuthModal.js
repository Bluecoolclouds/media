'use client';

import { useState } from 'react';

// ── Social provider icons ─────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path d="M18.8 10.209C18.8 9.55898 18.7417 8.93398 18.6333 8.33398H10V11.8798H14.9333C14.7208 13.0257 14.075 13.9965 13.1042 14.6465V16.9465H16.0667C17.8 15.3507 18.8 13.0007 18.8 10.209Z" fill="#4285F4" />
    <path d="M10.0003 19.1672C12.4753 19.1672 14.5503 18.3464 16.0669 16.9464L13.1044 14.6464C12.2836 15.1964 11.2336 15.5214 10.0003 15.5214C7.61276 15.5214 5.59193 13.9089 4.87109 11.7422H1.80859V14.1172C3.31693 17.113 6.41693 19.1672 10.0003 19.1672Z" fill="#34A853" />
    <path d="M4.86953 11.7411C4.6862 11.1911 4.58203 10.6036 4.58203 9.99948C4.58203 9.39531 4.6862 8.80781 4.86953 8.25781V5.88281H1.80703C1.16536 7.16019 0.831466 8.56999 0.832032 9.99948C0.832032 11.4786 1.1862 12.8786 1.80703 14.1161L4.86953 11.7411Z" fill="#FBBC05" />
    <path d="M10.0003 4.47982C11.3461 4.47982 12.5544 4.94232 13.5044 5.85065L16.1336 3.22148C14.5461 1.74232 12.4711 0.833984 10.0003 0.833984C6.41693 0.833984 3.31693 2.88815 1.80859 5.88398L4.87109 8.25898C5.59193 6.09232 7.61276 4.47982 10.0003 4.47982Z" fill="#EA4335" />
  </svg>
);
const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path d="M9.68745 6.01898C8.95745 6.01898 7.82745 5.18898 6.63745 5.21898C5.06745 5.23898 3.62745 6.12898 2.81745 7.53898C1.18745 10.369 2.39745 14.549 3.98745 16.849C4.76745 17.969 5.68745 19.229 6.90745 19.189C8.07745 19.139 8.51745 18.429 9.93745 18.429C11.3474 18.429 11.7474 19.189 12.9874 19.159C14.2474 19.139 15.0474 18.019 15.8174 16.889C16.7074 15.589 17.0774 14.329 17.0975 14.259C17.0675 14.249 14.6475 13.319 14.6175 10.519C14.5975 8.17898 16.5274 7.05898 16.6174 7.00898C15.5175 5.39898 13.8274 5.21898 13.2374 5.17898C11.6974 5.05898 10.4074 6.01898 9.68745 6.01898ZM12.2874 3.65898C12.9375 2.87898 13.3674 1.78898 13.2474 0.708984C12.3174 0.748984 11.1974 1.32898 10.5274 2.10898C9.92745 2.79898 9.40745 3.90898 9.54745 4.96898C10.5774 5.04898 11.6375 4.43898 12.2874 3.65898Z" fill="white" />
  </svg>
);
const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path d="M8.55425 8.55288H0V0H8.55425V8.55288Z" fill="#F1511B" />
    <path d="M18.0003 8.55288H9.44531V0H17.9996V8.55288H18.0003Z" fill="#80CC28" />
    <path d="M8.55425 18.0001H0V9.44727H8.55425V18.0001Z" fill="#00ADEF" />
    <path d="M18.0003 18.0001H9.44531V9.44727H17.9996V18.0001H18.0003Z" fill="#FBBC09" />
  </svg>
);
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3.75 4C2.7835 4 2 4.7835 2 5.75V6.78938L11.8876 11.7646C11.9583 11.8002 12.0417 11.8002 12.1124 11.7646L22 6.78938V5.75C22 4.7835 21.2165 4 20.25 4H3.75Z" fill="currentColor" />
    <path d="M22 8.46856L12.7866 13.1045C12.2917 13.3535 11.7082 13.3535 11.2134 13.1045L2 8.46856V18.25C2 19.2165 2.7835 20 3.75 20H20.25C21.2165 20 22 19.2165 22 18.25V8.46856Z" fill="currentColor" />
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

function SocialButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="py-3.5 md:py-4 rounded-xl flex gap-2 items-center justify-center text-center font-semibold text-sm transition border border-white/10 hover:border-white/30 text-white"
    >
      {icon}
      {label}
    </button>
  );
}

// ── Right-side showcase slides ─────────────────────────────────────────────────
const SLIDES = [
  { title: 'IMAGE STUDIO', desc: 'Generate cinematic images across 200+ models.', accent: 'from-[#22d3ee]/30' },
  { title: 'VIDEO ENGINE', desc: 'Turn prompts and stills into motion in seconds.', accent: 'from-[#a855f7]/30' },
  { title: 'ONE API', desc: 'Every model, one key, one balance — apinet.cloud.', accent: 'from-[#34d399]/30' },
];

export default function AuthModal({ onSuccess, onClose }) {
  const [mode, setMode] = useState('choose'); // 'choose' | 'email'
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [slide, setSlide] = useState(0);

  const social = (provider) => {
    setError(`${provider} sign-in isn't wired up yet — use Email or an API key for now.`);
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Enter your email');
    // If the user pasted an apinet key, treat it as a direct login.
    if (apiKey.trim().startsWith('sk-')) {
      setBusy(true);
      onSuccess({ key: apiKey.trim(), email: email.trim() });
      return;
    }
    if (!password.trim() || password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    // No admin backend wired yet — accept locally and seed the env/dev key.
    setBusy(true);
    onSuccess({ key: null, email: email.trim() });
  };

  return (
    <div className="fixed inset-0 z-[3002] flex items-center justify-center p-3 md:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[352px] md:max-w-[560px] xl:max-w-[1120px] h-[620px] md:h-[700px] xl:h-[min(720px,calc(100dvh-64px))] max-h-[calc(100dvh-24px)] bg-[#0a0a0a] rounded-[20px] md:rounded-[24px] border border-white/10 shadow-[inset_0px_0px_32px_0px_rgba(0,0,0,0.4)] flex overflow-hidden animate-scale-up"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 md:top-5 md:right-5 size-8 rounded-full bg-white/5 border border-white/[0.06] flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
        >
          <svg className="size-4 md:size-5 text-white" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.11612 7.11612C7.60427 6.62796 8.39573 6.62796 8.88388 7.11612L12 10.2322L15.1161 7.11612C15.6043 6.62796 16.3957 6.62796 16.8839 7.11612C17.372 7.60427 17.372 8.39573 16.8839 8.88388L13.7678 12L16.8839 15.1161C17.372 15.6043 17.372 16.3957 16.8839 16.8839C16.3957 17.372 15.6043 17.372 15.1161 16.8839L12 13.7678L8.88388 16.8839C8.39573 17.372 7.60427 17.372 7.11612 16.8839C6.62796 16.3957 6.62796 15.6043 7.11612 15.1161L10.2322 12L7.11612 8.88388C6.62796 8.39573 6.62796 7.60427 7.11612 7.11612Z" fill="currentColor" />
          </svg>
        </button>

        {/* ── Left: form ── */}
        <div className="flex-1 flex flex-col items-center px-5 py-6 md:px-14 md:py-8 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-sm mx-auto my-auto">
            {/* Logo + heading */}
            <div className="mb-8 md:mb-10 flex flex-col text-center w-full gap-4">
              <span className="flex w-full justify-center">
                <span className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </span>
              </span>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {mode === 'email'
                    ? (isSignup ? 'Create your account' : 'Welcome back')
                    : 'Welcome to apinet.cloud'}
                </h1>
                <p className="text-sm text-white/50">
                  {mode === 'email'
                    ? (isSignup ? 'Sign up and start generating' : 'Log in to continue')
                    : 'Sign up and generate for free'}
                </p>
              </div>
            </div>

            {mode === 'choose' ? (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-center gap-2.5 rounded-xl p-3 bg-[#22d3ee]/10 text-sm font-medium text-[#22d3ee]">
                  🎁 Sign up and get free starter credits
                </div>

                <div className="flex flex-col gap-3">
                  <SocialButton icon={<GoogleIcon />} label="Continue with Google" onClick={() => social('Google')} />
                  <SocialButton icon={<AppleIcon />} label="Continue with Apple" onClick={() => social('Apple')} />
                  <SocialButton icon={<MicrosoftIcon />} label="Continue with Microsoft" onClick={() => social('Microsoft')} />
                </div>

                <div className="flex justify-center items-center w-full py-1">
                  <span className="text-xs text-white/30 text-center">OR</span>
                </div>

                <button
                  type="button"
                  onClick={() => { setError(''); setMode('email'); }}
                  className="py-3.5 md:py-4 rounded-xl flex gap-2 items-center justify-center text-center font-semibold text-sm transition border border-white/10 hover:border-white/30 text-white"
                >
                  <MailIcon />
                  Continue with Email
                </button>

                {error && <p className="text-[12px] text-red-400/90 text-center mt-1">{error}</p>}
              </div>
            ) : (
              <form onSubmit={submitEmail} className="flex flex-col gap-3 w-full">
                <div className="flex gap-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-1 mb-1">
                  <button type="button" onClick={() => setIsSignup(true)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${isSignup ? 'bg-[#22d3ee] text-black' : 'text-white/50 hover:text-white'}`}>
                    Sign up
                  </button>
                  <button type="button" onClick={() => setIsSignup(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${!isSignup ? 'bg-[#22d3ee] text-black' : 'text-white/50 hover:text-white'}`}>
                    Log in
                  </button>
                </div>

                <input
                  type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#22d3ee]/50 transition-colors"
                />
                <input
                  type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Password (min 8 characters)" autoComplete={isSignup ? 'new-password' : 'current-password'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#22d3ee]/50 transition-colors"
                />

                <details className="text-left">
                  <summary className="text-[11px] text-white/30 cursor-pointer hover:text-white/50 transition-colors select-none">
                    Have an apinet API key? Use it directly
                  </summary>
                  <input
                    type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                    placeholder="sk-..."
                    className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#22d3ee]/50 transition-colors"
                  />
                </details>

                {error && <p className="text-[12px] text-red-400/90 text-center">{error}</p>}

                <button
                  type="submit" disabled={busy}
                  className="mt-1 py-3.5 rounded-xl bg-[#22d3ee] text-black font-bold text-sm hover:bg-[#e5ff33] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {busy ? 'Please wait…' : (isSignup ? 'Create account' : 'Log in')}
                </button>

                <button
                  type="button" onClick={() => { setError(''); setMode('choose'); }}
                  className="flex items-center justify-center gap-1.5 text-[12px] text-white/40 hover:text-white transition-colors mt-1"
                >
                  <BackIcon /> Other sign-in options
                </button>
              </form>
            )}

            <p className="text-[11px] text-center text-white/25 mt-6">
              By continuing you agree to our{' '}
              <a href="/terms" className="underline text-white/40">Terms</a> and{' '}
              <a href="/privacy" className="underline text-white/40">Privacy Policy</a>.
            </p>
          </div>
        </div>

        {/* ── Right: showcase ── */}
        <div className="hidden xl:block w-1/2 min-h-0 p-2 pl-0">
          <div className="relative h-full rounded-2xl overflow-hidden bg-black flex flex-col">
            <div className={`absolute inset-0 bg-gradient-to-br ${SLIDES[slide].accent} via-black to-black transition-all duration-700`} />
            <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] bg-[#22d3ee]/20" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-[120px] bg-[#a855f7]/20" />

            <div className="relative z-10 mt-auto p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/10 text-white backdrop-blur-md">2K Quality</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/10 text-white backdrop-blur-md">200+ Models</span>
                </div>
                <h2 className="text-[40px] leading-[46px] font-black text-white tracking-tight uppercase">
                  {SLIDES[slide].title}
                </h2>
                <p className="text-sm text-white/50 max-w-sm">{SLIDES[slide].desc}</p>
              </div>

              <div className="flex gap-1.5">
                {SLIDES.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSlide(i)}
                    className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden"
                  >
                    <div className={`h-full rounded-full transition-all duration-500 ${i === slide ? 'bg-white w-full' : 'bg-white w-0'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
