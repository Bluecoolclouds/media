"use client";

import { useState, useEffect } from 'react';
import { getLang, subscribeLang } from './core';

/** Re-renders the component whenever the app language changes. */
export function useLang() {
    const [lang, setLangState] = useState('en');

    useEffect(() => {
        setLangState(getLang());
        return subscribeLang(setLangState);
    }, []);

    return lang;
}

/** Builds a `t(key)` lookup bound to the given per-component dictionary. */
export function makeT(dict, lang) {
    return (key) => {
        const table = dict[lang] || dict.en;
        const val = table[key];
        if (val !== undefined) return val;
        return dict.en[key] !== undefined ? dict.en[key] : key;
    };
}
