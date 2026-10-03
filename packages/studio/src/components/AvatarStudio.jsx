"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { generateImage } from "../muapi.js";
import { avatarModels as fallbackAvatarModels } from "../models.js";
import { useDynamicModels } from "../hooks/useDynamicModels";
import { useLang, makeT } from "../i18n/useLang";
import { avatarStudioDict } from "../i18n/dictionaries/avatarStudio";

// ─── helpers ────────────────────────────────────────────────────────────────

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

// ─── style presets ──────────────────────────────────────────────────────────
// Each preset wraps the user's subject with a prompt that steers the look.

const STYLE_PRESETS = [
  {
    id: "anime",
    label: "Anime",
    emoji: "🌸",
    prompt: "anime style portrait, cel shaded, vibrant colors, clean linework, studio lighting, highly detailed face",
  },
  {
    id: "3d",
    label: "3D Render",
    emoji: "🧊",
    prompt: "3D rendered character portrait, Pixar style, soft global illumination, subsurface scattering, ultra detailed, octane render",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    emoji: "🌆",
    prompt: "cyberpunk portrait, neon rim lighting, holographic reflections, futuristic, cinematic, moody atmosphere, high contrast",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    emoji: "🎨",
    prompt: "watercolor painting portrait, soft washes of color, paper texture, delicate brush strokes, artistic, dreamy",
  },
  {
    id: "pixel",
    label: "Pixel Art",
    emoji: "👾",
    prompt: "pixel art avatar, 32-bit retro game character, crisp pixels, limited palette, isometric lighting",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    emoji: "🎬",
    prompt: "cinematic portrait photograph, 85mm lens, shallow depth of field, dramatic film lighting, photorealistic, 8k",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    emoji: "🐉",
    prompt: "fantasy character portrait, ethereal glow, ornate details, magical atmosphere, concept art, artstation trending",
  },
  {
    id: "lineart",
    label: "Ink Sketch",
    emoji: "✒️",
    prompt: "black and white ink sketch portrait, bold hatching, high contrast line drawing, hand drawn, expressive",
  },
];

// ─── SimpleDropdown (aspect ratio) ────────────────────────────────────────────

function SimpleDropdown({ title, options, selected, onSelect, onClose }) {
  return (
    <>
      <div className="text-xs font-medium text-muted pb-2 border-b border-white/5 mb-2">
        {title}
      </div>
      <div className="flex flex-col gap-1">
        {options.map((opt) => (
          <div
            key={opt}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(opt);
              onClose();
            }}
            className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md cursor-pointer transition-all group"
          >
            <span className="text-xs font-bold text-white opacity-80 group-hover:opacity-100">
              {opt}
            </span>
            {selected === opt && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AvatarStudio({ apiKey, onGenerationComplete }) {
  const lang = useLang();
  const t = makeT(avatarStudioDict, lang);

  const PERSIST_KEY = "hg_avatar_studio_persistent";

  const { models: avatarModels } = useDynamicModels("avatar", fallbackAvatarModels);

  // ── State ────────────────────────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0].id);
  const [selectedModelId, setSelectedModelId] = useState(fallbackAvatarModels[0]?.id ?? "");
  const [selectedAr, setSelectedAr] = useState(
    fallbackAvatarModels[0]?.inputs?.aspect_ratio?.default || "1:1",
  );
  const [batchSize, setBatchSize] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(null); // 'ar' | 'model' | null
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  const [history, setHistory] = useState([]);

  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // If the dynamic model list loads and the current selection isn't in it,
  // fall back to the first model in the new list.
  useEffect(() => {
    if (avatarModels.length > 0 && !avatarModels.find((m) => m.id === selectedModelId)) {
      setSelectedModelId(avatarModels[0].id);
    }
  }, [avatarModels, selectedModelId]);

  const selectedModel = avatarModels.find((m) => m.id === selectedModelId) || avatarModels[0];
  const aspectRatios = selectedModel?.inputs?.aspect_ratio?.enum || [];

  const getStyleLabel = (id) => {
    const preset = STYLE_PRESETS.find((s) => s.id === id);
    return preset ? t(`style.${preset.id}`) : id;
  };

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [dropdownOpen]);

  // ── Persistence: Load ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.prompt) setPrompt(data.prompt);
        if (data.selectedStyle) setSelectedStyle(data.selectedStyle);
        if (data.selectedModelId) setSelectedModelId(data.selectedModelId);
        if (data.selectedAr) setSelectedAr(data.selectedAr);
        if (data.batchSize) setBatchSize(data.batchSize);
        if (data.history) setHistory(data.history);
      }
    } catch (err) {
      console.warn("Failed to load AvatarStudio persistence:", err);
    }
  }, []);

  // ── Persistence: Save ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          PERSIST_KEY,
          JSON.stringify({ prompt, selectedStyle, selectedModelId, selectedAr, batchSize, history }),
        );
      } catch (err) {
        console.warn("Failed to save AvatarStudio persistence:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [prompt, selectedStyle, selectedModelId, selectedAr, batchSize, history]);

  // ── Textarea auto-resize ───────────────────────────────────────────────────
  const handleTextareaInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = window.innerWidth < 768 ? 120 : 200;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  const buildPrompt = () => {
    const preset = STYLE_PRESETS.find((s) => s.id === selectedStyle);
    const subject = prompt.trim() || "a person";
    return `${subject}, ${preset?.prompt || ""}`.trim();
  };

  // ── Generation ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (generating) return;
    if (!prompt.trim()) {
      alert(t('alert.describeAvatar'));
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    const finalPrompt = buildPrompt();

    try {
      const results = await Promise.all(
        Array.from({ length: batchSize }).map(async () => {
          return await generateImage(apiKey, {
            model: selectedModel.endpoint || selectedModel.id,
            prompt: finalPrompt,
            aspect_ratio: selectedAr,
          });
        }),
      );

      results.forEach((res) => {
        if (res && res.url) {
          const entry = {
            id: res.id || Math.random().toString(36).substring(7),
            url: res.url,
            prompt: prompt.trim(),
            style: selectedStyle,
            aspect_ratio: selectedAr,
            timestamp: new Date().toISOString(),
          };
          setHistory((prev) => [entry, ...prev.slice(0, 49)]);
          onGenerationComplete?.({
            url: res.url,
            model: selectedModel.endpoint || selectedModel.id,
            prompt: finalPrompt,
            type: "image",
          });
        }
      });
    } catch (e) {
      console.error("[AvatarStudio] Generation failed:", e);
      setGenerateError(e.message.slice(0, 80));
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setGenerating(false);
    }
  };

  const styleLabel =
    getStyleLabel(selectedStyle) || t('style.fallback');

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-app-bg relative p-4 md:p-6 overflow-hidden">
      {/* ── CENTRAL GALLERY AREA ── */}
      <div className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto custom-scrollbar pb-52 lg:pb-44 px-2">
        {history.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full pt-4 animate-fade-in-up">
            {history.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-xl hover:border-[#a855f7]/50 transition-all duration-300 flex flex-col"
              >
                <img
                  src={entry.url}
                  alt={entry.prompt?.substring(0, 30) || t('gallery.generatedAvatarAlt')}
                  className="w-full aspect-square object-cover bg-black/40 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setFullscreenUrl(entry.url)}
                />

                {/* Overlay actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    title={t('action.fullscreen')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenUrl(entry.url);
                    }}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-[#a855f7] hover:text-black transition-all border border-white/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title={t('action.download')}
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(entry.url, `avatar-${entry.id || idx}.jpg`);
                    }}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-[#a855f7] hover:text-black transition-all border border-white/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                </div>

                {/* Prompt & Details */}
                <div className="p-3 bg-black/80 backdrop-blur-sm border-t border-white/5 flex-1 flex flex-col justify-between gap-2">
                  <p className="text-white/70 text-xs line-clamp-3 leading-relaxed" title={entry.prompt}>
                    {entry.prompt || t('gallery.noPrompt')}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-[#a855f7] px-2 py-0.5 bg-[#a855f7]/10 rounded border border-[#a855f7]/20 capitalize">
                      {getStyleLabel(entry.style) || entry.style}
                    </span>
                    <span className="text-[10px] text-white/40">{entry.aspect_ratio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up transition-all duration-700 min-h-[60vh] relative">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[560px] h-[560px] bg-[#a855f7]/10 blur-[160px] rounded-full opacity-70" />
            </div>

            {/* Eyebrow badge */}
            <div className="relative z-10 mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">
                {t('badge.avatarStudio')}
              </span>
            </div>

            {/* Big cinematic headline */}
            <h1 className="relative z-10 text-5xl sm:text-7xl md:text-[5.5rem] font-black text-center leading-[0.92] tracking-tighter mb-6 px-4">
              <span className="block text-white">{t('headline.becomeAnyone')}</span>
              <span className="block bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#22d3ee] bg-clip-text text-transparent">
                {t('headline.inAnyStyle')}
              </span>
            </h1>

            <p className="relative z-10 text-white/50 text-base md:text-lg font-medium text-center max-w-xl leading-relaxed mb-10 px-4">
              {t('subheadline.describe')}
            </p>

            {/* Quick-start prompt chips */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 max-w-2xl px-4">
              {[
                t('chip.astronaut'),
                t('chip.warrior'),
                t('chip.robot'),
                t('chip.detective'),
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setPrompt(chip)}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white/70 bg-white/[0.04] border border-white/10 hover:border-[#a855f7]/50 hover:text-white hover:bg-[#a855f7]/10 transition-all duration-300"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM PROMPT BAR ── */}
      <div
        className="absolute bottom-4 w-full max-w-[95%] lg:max-w-4xl z-40 animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-2xl border border-white/10 p-4 flex flex-col gap-3 shadow-2xl ring-1 ring-[#a855f7]/10">
          {/* Style preset chips row */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedStyle(preset.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedStyle === preset.id
                    ? "bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                    : "bg-white/[0.03] text-white/50 border-white/[0.05] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-sm leading-none">{preset.emoji}</span>
                {t(`style.${preset.id}`)}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onInput={handleTextareaInput}
            placeholder={t('placeholder.describeAvatar')}
            rows={1}
            className="w-full bg-transparent border-none text-white text-sm placeholder:text-white/20 focus:outline-none resize-none pt-1 leading-relaxed min-h-[40px] max-h-[120px] md:max-h-[200px] overflow-y-auto custom-scrollbar"
          />

          {/* Bottom row: controls + generate */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-white/[0.03] relative">
            {/* Left controls */}
            <div className="flex items-center gap-2 relative flex-wrap pb-1 md:pb-0">
              {/* Style indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-md border border-white/[0.03] whitespace-nowrap">
                <div className="w-4 h-4 bg-[#a855f7] rounded flex items-center justify-center">
                  <span className="text-[9px] font-bold text-black uppercase">A</span>
                </div>
                <span className="text-xs font-semibold text-white/70">{styleLabel}</span>
              </div>

              {/* Model button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((o) => (o === "model" ? null : "model"));
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] rounded-md transition-all border border-white/[0.03] group whitespace-nowrap"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40 text-white">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                  <span className="text-[11px] font-semibold text-white/70 group-hover:text-[#a855f7] transition-colors">
                    {selectedModel?.name ?? t('model.selectPlaceholder') ?? "Model"}
                  </span>
                </button>

                {dropdownOpen === "model" && (
                  <div
                    ref={dropdownRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-[calc(100%+12px)] left-0 z-50 bg-[#0a0a0a] rounded-md p-3 max-h-[40vh] overflow-y-auto custom-scrollbar shadow-2xl border border-white/10 min-w-[200px]"
                  >
                    <div className="text-xs font-medium text-muted pb-2 border-b border-white/5 mb-2">
                      {t('model.title') ?? "Model"}
                    </div>
                    <div className="flex flex-col gap-1">
                      {avatarModels.map((model) => (
                        <div
                          key={model.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModelId(model.id);
                            const ratios = model.inputs?.aspect_ratio?.enum || [];
                            if (ratios.length > 0 && !ratios.includes(selectedAr)) {
                              setSelectedAr(model.inputs?.aspect_ratio?.default ?? ratios[0]);
                            }
                            setDropdownOpen(null);
                          }}
                          className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md cursor-pointer transition-all group"
                        >
                          <span className="text-xs font-bold text-white opacity-80 group-hover:opacity-100">
                            {model.name}
                          </span>
                          {selectedModelId === model.id && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Aspect ratio button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((o) => (o === "ar" ? null : "ar"));
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] rounded-md transition-all border border-white/[0.03] group whitespace-nowrap"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40 text-white">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  </svg>
                  <span className="text-[11px] font-semibold text-white/70 group-hover:text-[#a855f7] transition-colors">
                    {selectedAr}
                  </span>
                </button>

                {dropdownOpen === "ar" && (
                  <div
                    ref={dropdownRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-[calc(100%+12px)] left-0 z-50 bg-[#0a0a0a] rounded-md p-3 max-h-[40vh] overflow-y-auto custom-scrollbar shadow-2xl border border-white/10 min-w-[160px]"
                  >
                    <SimpleDropdown
                      title={t('dropdown.aspectRatio')}
                      options={aspectRatios}
                      selected={selectedAr}
                      onSelect={(val) => setSelectedAr(val)}
                      onClose={() => setDropdownOpen(null)}
                    />
                  </div>
                )}
              </div>

              {/* Batch size selector */}
              <div className="flex items-center gap-1 bg-white/[0.03] rounded-md p-1 border border-white/[0.03]">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBatchSize(num)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-[10px] font-black transition-all ${
                      batchSize === num
                        ? "bg-[#a855f7] text-black shadow-lg shadow-[#a855f7]/20"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="bg-[#a855f7] text-black px-4 py-2 rounded-md font-medium text-sm hover:bg-[#c084fc] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-[#a855f7]/10 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              {generating ? (
                <>
                  <span className="animate-spin inline-block text-black">◌</span>
                  {t('generate.generating')}
                </>
              ) : generateError ? (
                t('generate.error')(generateError)
              ) : (
                <span>{t('generate.generateAvatar')}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN IMAGE MODAL ── */}
      {fullscreenUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
          onClick={() => setFullscreenUrl(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenUrl(null);
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={fullscreenUrl}
            alt={t('modal.fullscreenPreviewAlt')}
            className="max-w-[95vw] max-h-[95vh] rounded-2xl shadow-2xl object-contain animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
