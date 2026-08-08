"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { generateI2I, uploadFile } from "../muapi.js";
import {
  getAspectRatiosForI2IModel,
  getResolutionsForI2IModel,
} from "../models.js";
import { useLang, makeT } from "../i18n/useLang";
import { productCardStudioDict } from "../i18n/dictionaries/productCardStudio";

// ─── constants ──────────────────────────────────────────────────────────────

const MODEL_ID = "nano-banana-pro-edit";
const MAX_PRODUCT_IMAGES = 4;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const CATEGORY_IDS = [
  "gadgets",
  "clothing",
  "beauty",
  "home",
  "kids",
  "food",
  "sports",
  "accessories",
  "other",
];

// "How to show the product" modes — shared definitions, mapped per category below.
const MODE_DEFS = {
  "in-use": {
    titleKey: "mode.inUse.title",
    subtitleKey: "mode.inUse.subtitle",
    promptFragment:
      "product being actively used by hands in a natural workflow, realistic lifestyle in-use photo",
  },
  "in-environment": {
    titleKey: "mode.inEnvironment.title",
    subtitleKey: "mode.inEnvironment.subtitle",
    promptFragment:
      "product placed naturally in its everyday environment, on a desk or workspace, lifestyle context photo",
  },
  "close-up": {
    titleKey: "mode.closeUp.title",
    subtitleKey: "mode.closeUp.subtitle",
    promptFragment:
      "extreme close-up macro shot of the product highlighting buttons, screens and fine details, sharp focus",
  },
  catalog: {
    titleKey: "mode.catalog.title",
    subtitleKey: "mode.catalog.subtitle",
    promptFragment:
      "clean studio catalog product shot, isolated object on a neutral seamless background, professional e-commerce photography, even soft lighting",
  },
  "on-model": {
    titleKey: "mode.onModel.title",
    subtitleKey: "mode.onModel.subtitle",
    promptFragment:
      "product worn by a model in a natural fashion editorial pose, realistic garment fit and drape",
  },
  "flat-lay": {
    titleKey: "mode.flatLay.title",
    subtitleKey: "mode.flatLay.subtitle",
    promptFragment:
      "top-down flat lay composition, product neatly arranged and folded, clean background",
  },
  "close-up-fabric": {
    titleKey: "mode.closeUpFabric.title",
    subtitleKey: "mode.closeUpFabric.subtitle",
    promptFragment:
      "extreme close-up of the fabric texture, stitching and material details, sharp focus",
  },
  "texture-swatch": {
    titleKey: "mode.textureSwatch.title",
    subtitleKey: "mode.textureSwatch.subtitle",
    promptFragment:
      "close-up swatch-style shot of the product's texture and finish, showing consistency and true-to-life color",
  },
  "kid-playing": {
    titleKey: "mode.kidPlaying.title",
    subtitleKey: "mode.kidPlaying.subtitle",
    promptFragment:
      "lifestyle photo of a child playing with the product, natural daylight, candid joyful moment",
  },
  "on-table": {
    titleKey: "mode.onTable.title",
    subtitleKey: "mode.onTable.subtitle",
    promptFragment:
      "food styling shot of the product on a table, appetizing presentation, natural lighting",
  },
  ingredients: {
    titleKey: "mode.ingredients.title",
    subtitleKey: "mode.ingredients.subtitle",
    promptFragment:
      "product shown together with its key ingredients arranged around it, flat lay context shot",
  },
  "in-action": {
    titleKey: "mode.inAction.title",
    subtitleKey: "mode.inAction.subtitle",
    promptFragment:
      "dynamic action shot of the product in use during sports or outdoor activity, motion, energetic feel",
  },
};

// Which "how to show" modes apply to each product category, and in what order.
const CATEGORY_SHOW_MODES = {
  gadgets: ["in-use", "in-environment", "close-up", "catalog"],
  clothing: ["on-model", "flat-lay", "close-up-fabric", "catalog"],
  beauty: ["in-use", "texture-swatch", "close-up", "catalog"],
  home: ["in-environment", "in-use", "close-up", "catalog"],
  kids: ["kid-playing", "in-use", "catalog", "close-up"],
  food: ["on-table", "ingredients", "close-up", "catalog"],
  sports: ["in-action", "in-use", "catalog", "close-up"],
  accessories: ["on-model", "close-up", "flat-lay", "catalog"],
  other: ["in-use", "in-environment", "close-up", "catalog"],
};

// Free-text "wishes" placeholder tuned per category; falls back to a generic one.
const WISHES_PLACEHOLDER_KEY = {
  gadgets: "wishes.placeholder.gadgets",
  clothing: "wishes.placeholder.clothing",
  beauty: "wishes.placeholder.beauty",
  home: "wishes.placeholder.home",
  kids: "wishes.placeholder.kids",
  food: "wishes.placeholder.food",
  sports: "wishes.placeholder.sports",
  accessories: "wishes.placeholder.accessories",
  other: "wishes.placeholder.other",
};

const PHOTOGRAPHY_STYLES = [
  {
    id: "commercial",
    labelKey: "style.commercial",
    promptFragment:
      "professional commercial product photography, polished advertising look, crisp studio lighting",
  },
  {
    id: "home",
    labelKey: "style.home",
    promptFragment:
      "casual home-style photo, realistic everyday lighting, authentic candid feel, smartphone-photography aesthetic",
  },
];

// Visual widths for the format picker — wider buttons for wider ratios (matches reference design).
const FORMAT_OPTIONS = [
  { ratio: "9:16", width: 27 },
  { ratio: "3:4", width: 36 },
  { ratio: "1:1", width: 48 },
  { ratio: "4:3", width: 64 },
  { ratio: "16:9", width: 85 },
];
const FORMAT_HEIGHT = 48;

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

// ─── SimpleDropdown ─────────────────────────────────────────────────────────

function SimpleDropdown({ title, options, selected, onSelect, onClose }) {
  return (
    <>
      <div className="text-xs font-medium text-muted pb-2 border-b border-white/5 mb-2">
        {title}
      </div>
      <div className="flex flex-col gap-1 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(opt.value);
              onClose();
            }}
            className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md cursor-pointer transition-all group"
          >
            <span className="text-xs font-bold text-white opacity-80 group-hover:opacity-100">
              {opt.label}
            </span>
            {selected === opt.value && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ProductCardStudio({
  apiKey,
  onGenerationComplete,
  droppedFiles,
  onFilesHandled,
}) {
  const PERSIST_KEY = "hg_product_card_studio_persistent";

  const lang = useLang();
  const t = makeT(productCardStudioDict, lang);

  // ── Product state ───────────────────────────────────────────────────────
  const [productImages, setProductImages] = useState([]); // [{url}]
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState(CATEGORY_IDS[0]);

  // ── Generation config state ─────────────────────────────────────────────
  const [contentType, setContentType] = useState("photo"); // photo | card | video
  const [showMode, setShowMode] = useState(CATEGORY_SHOW_MODES[CATEGORY_IDS[0]][0]);
  const [wishes, setWishes] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [modelPhoto, setModelPhoto] = useState(null); // {url} | null
  const [environmentPhoto, setEnvironmentPhoto] = useState(null); // {url} | null
  const [photoStyle, setPhotoStyle] = useState(PHOTOGRAPHY_STYLES[0].id);
  const [aspectRatio, setAspectRatio] = useState(
    getAspectRatiosForI2IModel(MODEL_ID)[0] || "1:1",
  );
  const [resolution, setResolution] = useState(
    getResolutionsForI2IModel(MODEL_ID)[0] || "1k",
  );
  const [batchSize, setBatchSize] = useState(1);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [dropdownOpen, setDropdownOpen] = useState(null); // 'category' | null
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);
  const modelPhotoInputRef = useRef(null);
  const environmentPhotoInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);

  const aspectRatios = getAspectRatiosForI2IModel(MODEL_ID);
  const resolutions = getResolutionsForI2IModel(MODEL_ID);
  const wishesMax = 5000;
  const showModesForCategory = (CATEGORY_SHOW_MODES[category] || CATEGORY_SHOW_MODES.other).map(
    (id) => ({ id, ...MODE_DEFS[id] }),
  );

  // ── Close dropdown on outside click ─────────────────────────────────────
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

  // ── Persistence: Load ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.productImages) setProductImages(data.productImages);
        if (data.productName) setProductName(data.productName);
        if (data.category) setCategory(data.category);
        if (data.contentType) setContentType(data.contentType);
        if (data.showMode) setShowMode(data.showMode);
        if (data.wishes) setWishes(data.wishes);
        if (data.modelPhoto) setModelPhoto(data.modelPhoto);
        if (data.environmentPhoto) setEnvironmentPhoto(data.environmentPhoto);
        if (data.photoStyle) setPhotoStyle(data.photoStyle);
        if (data.aspectRatio) setAspectRatio(data.aspectRatio);
        if (data.resolution) setResolution(data.resolution);
        if (data.batchSize) setBatchSize(data.batchSize);
        if (data.history) setHistory(data.history);
      }
    } catch (err) {
      console.warn("Failed to load ProductCardStudio persistence:", err);
    }
  }, []);

  // ── Persistence: Save ────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          PERSIST_KEY,
          JSON.stringify({
            productImages,
            productName,
            category,
            contentType,
            showMode,
            wishes,
            modelPhoto,
            environmentPhoto,
            photoStyle,
            aspectRatio,
            resolution,
            batchSize,
            history,
          }),
        );
      } catch (err) {
        console.warn("Failed to save ProductCardStudio persistence:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    productImages,
    productName,
    category,
    contentType,
    showMode,
    wishes,
    modelPhoto,
    environmentPhoto,
    photoStyle,
    aspectRatio,
    resolution,
    batchSize,
    history,
  ]);

  // ── Category change: keep showMode valid for the new category ───────────
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const validModes = CATEGORY_SHOW_MODES[newCategory] || CATEGORY_SHOW_MODES.other;
    if (!validModes.includes(showMode)) {
      setShowMode(validModes[0]);
    }
  };

  // ── Textarea auto-resize ─────────────────────────────────────────────────
  const handleTextareaInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  // ── Upload handling ──────────────────────────────────────────────────────
  const uploadFiles = useCallback(
    async (files) => {
      if (!files.length) return;

      const tooLarge = files.filter((f) => f.size > MAX_IMAGE_SIZE);
      if (tooLarge.length > 0) {
        alert(t('upload.tooLarge')(tooLarge.map((f) => f.name).join(", ")));
        return;
      }

      const room = MAX_PRODUCT_IMAGES - productImages.length;
      if (room <= 0) return;
      const toUpload = files.slice(0, room);

      setUploading(true);
      setUploadProgress(0);
      try {
        const uploaded = await Promise.all(
          toUpload.map((file) =>
            uploadFile(apiKey, file, (pct) => setUploadProgress(pct)),
          ),
        );
        setProductImages((prev) => [
          ...prev,
          ...uploaded.map((url) => ({ url })),
        ]);
      } catch (err) {
        alert(t('upload.failed')(err.message));
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [apiKey, productImages, t],
  );

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    uploadFiles(files);
  };

  const handleRemoveImage = (idx) => {
    setProductImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearImages = () => {
    setProductImages([]);
  };

  // ── Single-slot uploads (model / environment reference photos) ──────────
  const uploadSingleFile = useCallback(
    async (file, setSlot) => {
      if (!file) return;
      if (file.size > MAX_IMAGE_SIZE) {
        alert(t('upload.tooLarge')(file.name));
        return;
      }
      try {
        const url = await uploadFile(apiKey, file);
        setSlot({ url });
      } catch (err) {
        alert(t('upload.failed')(err.message));
      }
    },
    [apiKey, t],
  );

  const handleModelPhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadSingleFile(file, setModelPhoto);
  };

  const handleEnvironmentPhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadSingleFile(file, setEnvironmentPhoto);
  };

  // ── Handle dropped files (drag-and-drop from shell) ─────────────────────
  useEffect(() => {
    if (droppedFiles && droppedFiles.length > 0) {
      const imageFiles = droppedFiles.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length > 0) uploadFiles(imageFiles);
      onFilesHandled?.();
    }
  }, [droppedFiles, onFilesHandled, uploadFiles]);

  // ── Prompt composition ───────────────────────────────────────────────────
  const buildPrompt = () => {
    const mode = MODE_DEFS[showMode];
    const style = PHOTOGRAPHY_STYLES.find((s) => s.id === photoStyle);
    const parts = [];
    if (productName.trim()) {
      parts.push(`Product: ${productName.trim()}`);
    }
    parts.push(`Category: ${t(`category.${category}`)}`);
    if (mode) parts.push(mode.promptFragment);
    if (style) parts.push(style.promptFragment);
    if (modelPhoto) parts.push("Use the additional reference photo of the model's appearance for how the model should look");
    if (environmentPhoto) parts.push("Use the additional reference photo of the environment for the background and setting");
    if (wishes.trim()) parts.push(wishes.trim());
    parts.push(
      "Keep the product's shape, proportions, materials, colors, logos and labels exactly as shown in the reference photos.",
    );
    return parts.join(". ");
  };

  // ── Generation ───────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (generating) return;
    if (productImages.length === 0) {
      alert(t('alert.uploadProductFirst'));
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    const finalPrompt = buildPrompt();
    const imageUrls = [
      ...productImages.map((p) => p.url),
      ...(modelPhoto ? [modelPhoto.url] : []),
      ...(environmentPhoto ? [environmentPhoto.url] : []),
    ];

    try {
      const results = await Promise.all(
        Array.from({ length: batchSize }).map(() =>
          generateI2I(apiKey, {
            model: MODEL_ID,
            images_list: imageUrls,
            prompt: finalPrompt,
            aspect_ratio: aspectRatio,
            resolution,
          }),
        ),
      );

      results.forEach((res) => {
        if (res && res.url) {
          const entry = {
            id: res.id || Math.random().toString(36).substring(7),
            url: res.url,
            prompt: finalPrompt,
            category,
            showMode,
            aspect_ratio: aspectRatio,
            resolution,
            timestamp: new Date().toISOString(),
          };
          setHistory((prev) => [entry, ...prev.slice(0, 49)]);
          onGenerationComplete?.({
            url: res.url,
            model: MODEL_ID,
            prompt: finalPrompt,
            type: "image",
          });
        }
      });
    } catch (e) {
      console.error("[ProductCardStudio] Generation failed:", e);
      setGenerateError(e.message.slice(0, 80));
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setGenerating(false);
    }
  };

  const categoryOptions = CATEGORY_IDS.map((id) => ({
    value: id,
    label: t(`category.${id}`),
  }));
  const categoryLabel = t(`category.${category}`);

  const arOptions = aspectRatios.map((ar) => ({ value: ar, label: ar }));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full overflow-y-auto custom-scrollbar bg-app-bg">
      {/* Decorative grid + glow background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:gap-6 lg:gap-12 p-4 md:p-6 lg:p-8">
        {/* ── LEFT: config column, natural width, flows with the page ── */}
        <div className="space-y-4 sm:w-[320px] lg:w-[380px] sm:flex-shrink-0">
        {/* 01 — Your product */}
        <section className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-card-bg p-4 md:p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">{t('section.yourProduct')}</span>
            <span className="text-xs font-black text-muted">01</span>
          </div>

          <div className="flex items-start gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={productImages.length >= MAX_PRODUCT_IMAGES}
              className="relative w-16 h-16 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center overflow-hidden shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title={t('upload.upToPhotos')(MAX_PRODUCT_IMAGES)}
            >
              {productImages[0]?.url ? (
                <img src={productImages[0].url} alt="" className="w-full h-full object-cover" />
              ) : uploading ? (
                <span className="text-[10px] font-black text-primary">{uploadProgress}%</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
              {productImages.length > 1 && (
                <div className="absolute bottom-0.5 right-0.5 min-w-[16px] h-4 bg-primary rounded-full flex items-center justify-center px-0.5">
                  <span className="text-[9px] font-black text-black leading-none">{productImages.length}</span>
                </div>
              )}
            </button>

            {productImages.length > 1 && (
              <div className="flex flex-wrap gap-1.5 flex-1">
                {productImages.slice(1).map((img, idx) => (
                  <div key={img.url} className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx + 1)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>{t('upload.upToPhotos')(MAX_PRODUCT_IMAGES)}</span>
          </div>
          {productImages.length > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-secondary">{t('upload.ofMax')(productImages.length, MAX_PRODUCT_IMAGES)}</span>
              <button
                type="button"
                onClick={handleClearImages}
                className="text-primary hover:underline"
              >
                {t('upload.clear')}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted">{t('field.thisIs')}</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t('field.productNamePlaceholder')}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="relative flex flex-col gap-1.5">
            <label className="text-xs text-muted">{t('field.category')}</label>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((o) => (o === "category" ? null : "category"));
              }}
              className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:border-primary/40 transition-colors"
            >
              <span>{categoryLabel}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-50">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {dropdownOpen === "category" && (
              <div
                ref={dropdownRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-[#111] rounded-lg p-2 shadow-2xl border border-white/10"
              >
                <SimpleDropdown
                  title={t('field.category')}
                  options={categoryOptions}
                  selected={category}
                  onSelect={handleCategoryChange}
                  onClose={() => setDropdownOpen(null)}
                />
              </div>
            )}
          </div>
        </section>

        {/* 02 — Configure generation */}
        <section className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-card-bg p-4 md:p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">{t('section.configureGeneration')}</span>
            <span className="text-xs font-black text-muted">02</span>
          </div>

          {/* Content type */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted">{t('contentType.title')}</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: "photo", label: t('contentType.photo'), enabled: true },
                { id: "card", label: t('contentType.card'), enabled: false },
                { id: "video", label: t('contentType.video'), enabled: false },
              ].map((ct) => (
                <button
                  key={ct.id}
                  type="button"
                  disabled={!ct.enabled}
                  title={ct.enabled ? undefined : t('contentType.comingSoon')}
                  onClick={() => ct.enabled && setContentType(ct.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    contentType === ct.id && ct.enabled
                      ? "bg-white text-black"
                      : ct.enabled
                        ? "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                        : "bg-white/[0.02] text-white/20 cursor-not-allowed"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* How to show — options depend on the selected category */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted">{t('howToShow.title')}</span>
            <div className="grid grid-cols-1 gap-2">
              {showModesForCategory.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setShowMode(mode.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                    showMode === mode.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{t(mode.titleKey)}</span>
                    <span className="text-[11px] text-muted">{t(mode.subtitleKey)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Wishes — placeholder text tuned to the selected category */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{t('wishes.title')}</span>
              <span className="text-[10px] text-white/20">{wishes.length}/{wishesMax}</span>
            </div>
            <textarea
              ref={textareaRef}
              value={wishes}
              onChange={(e) => setWishes(e.target.value.slice(0, wishesMax))}
              onInput={handleTextareaInput}
              placeholder={t(WISHES_PLACEHOLDER_KEY[category] || 'wishes.placeholder')}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none max-h-40 overflow-y-auto custom-scrollbar transition-colors"
            />
          </div>

          {/* Advanced settings */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className={`transition-transform ${advancedOpen ? "rotate-0" : "-rotate-90"}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
              {t('advanced.title')}
            </button>

            {advancedOpen && (
              <div className="flex flex-col gap-4 pl-1">
                {/* Reference photos: model + environment */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-white">{t('advanced.modelPhoto')}</span>
                    <input
                      ref={modelPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleModelPhotoChange}
                    />
                    <button
                      type="button"
                      onClick={() => modelPhotoInputRef.current?.click()}
                      className="relative w-[72px] h-24 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] flex items-center justify-center overflow-hidden transition-all"
                    >
                      {modelPhoto?.url ? (
                        <img src={modelPhoto.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                          <path d="M16 5h6" />
                          <path d="M19 2v6" />
                          <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          <circle cx="9" cy="9" r="2" />
                        </svg>
                      )}
                    </button>
                    <span className="text-xs text-muted">{t('advanced.optional')}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-white">{t('advanced.environmentPhoto')}</span>
                    <input
                      ref={environmentPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEnvironmentPhotoChange}
                    />
                    <button
                      type="button"
                      onClick={() => environmentPhotoInputRef.current?.click()}
                      className="relative w-[72px] h-24 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] flex items-center justify-center overflow-hidden transition-all"
                    >
                      {environmentPhoto?.url ? (
                        <img src={environmentPhoto.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                          <path d="M16 5h6" />
                          <path d="M19 2v6" />
                          <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          <circle cx="9" cy="9" r="2" />
                        </svg>
                      )}
                    </button>
                    <span className="text-xs text-muted">{t('advanced.optional')}</span>
                  </div>
                </div>

                {/* Photography style toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted">{t('advanced.style')}</label>
                  <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                    {PHOTOGRAPHY_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setPhotoStyle(style.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          photoStyle === style.id
                            ? "bg-white text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {t(style.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format (aspect ratio) — visual widths per ratio, like the reference design */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted">{t('advanced.format')}</label>
                  <div className="flex items-end justify-center gap-1.5">
                    {FORMAT_OPTIONS.filter((f) => aspectRatios.includes(f.ratio)).map((f) => (
                      <button
                        key={f.ratio}
                        type="button"
                        onClick={() => setAspectRatio(f.ratio)}
                        aria-pressed={aspectRatio === f.ratio}
                        style={{ width: f.width, height: FORMAT_HEIGHT }}
                        className={`flex items-center justify-center rounded-lg border transition-all ${
                          aspectRatio === f.ratio
                            ? "border-primary bg-primary text-black"
                            : "bg-white/5 hover:border-white/30 border-white/10 text-white/60"
                        }`}
                      >
                        <span className="text-xs font-medium">{f.ratio}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                {resolutions.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted">{t('advanced.resolution')}</label>
                    <div className="flex gap-2">
                      {resolutions.map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setResolution(res)}
                          aria-pressed={resolution === res}
                          className={`flex-1 flex items-center justify-center rounded-lg border py-2 transition-all ${
                            resolution === res
                              ? "border-primary bg-primary text-black"
                              : "bg-white/5 hover:border-white/30 border-white/10 text-white/60"
                          }`}
                        >
                          <span className="text-sm font-semibold uppercase">{res}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted">{t('advanced.variants')}</label>
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10 w-fit">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBatchSize(num)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-black transition-all ${
                          batchSize === num
                            ? "bg-primary text-black"
                            : "text-white/40 hover:text-white/80 hover:bg-white/5"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-primary text-black px-4 py-3 rounded-xl font-bold text-sm hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <span className="animate-spin inline-block">◌</span>
                {t('generate.generating')}
              </>
            ) : generateError ? (
              t('generate.error')(generateError)
            ) : (
              <>
                <span>{t('generate.generate')}</span>
                <span className="bg-black/10 text-black/70 rounded-full px-1.5 py-0.5 text-[10px] font-black">×{batchSize}</span>
              </>
            )}
          </button>
        </section>
        </div>

        {/* ── RIGHT: results panel — sticky alongside the config column, like the reference ── */}
        <div
          className={`mt-4 sm:sticky sm:top-[88px] sm:mt-0 sm:min-w-0 sm:flex-1 sm:self-start relative rounded-2xl border border-white/5 bg-card-bg p-4 md:p-5 transition-opacity ${
            history.length === 0 ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-bold text-white">{t('section.results')}</span>
            <span className="text-xs font-black text-muted">03</span>
          </div>

          {history.length > 0 ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
              {history.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-xl hover:border-primary/50 transition-all duration-300"
                >
                  <img
                    src={entry.url}
                    alt={t('gallery.generatedImageAlt')}
                    className="w-full aspect-square object-cover bg-black/40 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setFullscreenUrl(entry.url)}
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title={t('action.fullscreen')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenUrl(entry.url);
                      }}
                      className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-all border border-white/10"
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
                        downloadImage(entry.url, `product-${entry.id || idx}.jpg`);
                      }}
                      className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-all border border-white/10"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-secondary text-sm">{t('results.empty')}</p>
              <p className="text-muted text-xs max-w-sm mx-auto mt-1">{t('results.emptyHint')}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── FULLSCREEN IMAGE MODAL ── */}
      {fullscreenUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
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
            className="max-w-[95vw] max-h-[95vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

