"use client";

const LANG_KEY = 'og_lang';
const EVENT = 'og_lang_change';

/** Normalize browser locales to a supported code. */
export function normalizeLang(raw) {
    if (!raw) return 'en';
    const lower = String(raw).toLowerCase();
    if (lower === 'ru' || lower.startsWith('ru-') || lower.startsWith('ru_')) return 'ru';
    return 'en';
}

export function getLang() {
    if (typeof localStorage === 'undefined') return 'en';
    const stored = localStorage.getItem(LANG_KEY);
    if (stored) return normalizeLang(stored);
    const detected = typeof navigator !== 'undefined' ? normalizeLang(navigator.language) : 'en';
    localStorage.setItem(LANG_KEY, detected);
    return detected;
}

export function setLang(lang) {
    if (typeof localStorage === 'undefined') return;
    const normalized = normalizeLang(lang);
    localStorage.setItem(LANG_KEY, normalized);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(EVENT, { detail: normalized }));
    }
}

export function subscribeLang(callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = () => callback(getLang());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
}

export const LANG_CYCLE = ['en', 'ru'];
export const LANG_LABEL = { en: 'EN', ru: 'RU' };
