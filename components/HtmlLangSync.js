"use client";

import { useEffect } from 'react';
// Deep imports, not the `studio` barrel — see the note in components/StandaloneShell.js.
import { useLang } from 'studio/src/i18n/useLang';

/**
 * Keeps <html lang> in sync with the app language.
 *
 * app/layout.js is a server component, so it can only emit a static lang attribute.
 * useLang resolves the real language on the client (localStorage, else browser locale)
 * and re-fires on every og_lang_change — the event the nav toggles dispatch. Without
 * this, a screen reader announces Russian copy with an English voice.
 *
 * Renders nothing.
 */
export default function HtmlLangSync() {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
