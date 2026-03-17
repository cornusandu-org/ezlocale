import { format } from './src/format.js';

const uninitialised = Symbol("uninitialised");

let languages = uninitialised;
let translations = uninitialised;
let _config = uninitialised;



function get(obj, path) {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current == null) return uninitialised;
    current = current[part];
  }

  return current === undefined ? uninitialised : current;
}

function set(obj, path, value) {
  const parts = path.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in current)) current[key] = {};
    current = current[key];
  }

  current[parts.at(-1)] = value;
}



function isinit() {
    if (languages === uninitialised) return false;
    if (translations === uninitialised) return false;
    if (_config === uninitialised) return false;
    return true;
}

let reinit_twice = false;

export async function init() {
    if (isinit()) {
        if (reinit_twice === true) return;
        console.error("ezlocale: attempted to reinitialise. Ignoring second init() call.");
        reinit_twice = true;
        return;
    }

    languages = new Set();
    translations = new Map();
    _config = {};
}

export async function add_locale(language_code, locale) {
    if (languages.has(language_code)) {
        console.error(`ezlocale: attempted to add locale for ${language_code} (already added, ignoring).`);
        return;
    }
    languages.add(language_code);
    translations.set(language_code, locale);
}

export async function config(options) {
    if (options == undefined || options == null) {
        console.warn("ezlocale: config(undefined || null) called.");
        return;
    }
    for (const [key, value] of Object.entries(options)) {
        if (key === undefined || key === null || value === undefined || value === null) continue;
        set(_config, key, value);
    }
}

function fmt_locale_fallback(key, ...format) {
    const fallbacklang = get(_config, "lang.fallback");
    if (fallbacklang === uninitialised) {
        console.error(`ezlocale: invalid fallback locale ${fallbacklang} (uninitialised).`);
        return '';
    }
    const fallbacklocale = translations.get(fallbacklang);
    if (fallbacklocale === uninitialised || fallbacklocale == undefined || fallbacklocale == null) {
        console.error(`ezlocale: invalid fallback locale ${fallbacklang} (missing translation).`);
        return '';
    }
    const msg = get(fallbacklocale, key);
    if (msg === uninitialised) {
        console.error(`ezlocale: missing key \`${key}\` in fallback locale.`);
        return '';
    }
    return format(String(msg), ...format);
}

export function fmt_locale_specific(language, key, ...format) {
    const locale = translations.get(language);
    if (locale === undefined) {
        return fmt_locale_fallback(key, ...format);
    }
    const msg = get(locale, key);
    if (msg === uninitialised) {
        console.error(`ezlocale: missing key \`${key}\` for locale ${language}.`);
        return fmt_locale_fallback(key, ...format);
    }
    return format(String(msg), ...format);
}

export function fmt_locale(key, ...format) {
    const language = get(_config, "lang.current");
    
    return fmt_locale_specific(language, key, ...format);
}
