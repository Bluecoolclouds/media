"use client";

import { useState, useEffect } from "react";

// Feature flag for dynamic (DB-backed) models. When disabled, every studio
// uses its bundled hardcoded model list from models.js.
export const USE_DYNAMIC_MODELS =
  typeof process !== "undefined" &&
  process.env?.NEXT_PUBLIC_USE_DYNAMIC_MODELS === "true";

/**
 * Fetch the list of models for a given studio `type` from /api/models,
 * falling back to the bundled hardcoded list if the dynamic flag is off,
 * the request fails, or the API returns an empty list.
 *
 * @param {string} type - one of: text-to-image, image-to-image,
 *   text-to-video, image-to-video, audio, lipsync, avatar, recast,
 *   product-card
 * @param {Array} fallbackModels - hardcoded models from models.js
 */
export function useDynamicModels(type, fallbackModels) {
  const [models, setModels] = useState(fallbackModels);
  const [loading, setLoading] = useState(USE_DYNAMIC_MODELS);

  useEffect(() => {
    if (!USE_DYNAMIC_MODELS) {
      setModels(fallbackModels);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchModels() {
      try {
        const response = await fetch(`/api/models?type=${type}`);
        const data = await response.json();

        if (mounted && data.success && data.models?.length > 0) {
          setModels(data.models);
        } else if (mounted) {
          setModels(fallbackModels);
        }
      } catch (err) {
        console.error(`Failed to fetch ${type} models, using fallback:`, err);
        if (mounted) setModels(fallbackModels);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchModels();

    return () => {
      mounted = false;
    };
  }, [type, fallbackModels]);

  return { models, loading };
}
