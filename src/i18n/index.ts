import { load } from "js-yaml";

// locales/*.yml is the source of truth (synced with Transifex, see transifex.yml).
// Missing or empty keys fall back to English.
const files = import.meta.glob("/locales/*.yml", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export interface Locale {
  code: string; // URL segment and locales/<code>.yml
  lang: string; // <html lang>
  og: string; // og:locale
  label: string; // shown in the language picker
}

export const LOCALES: Locale[] = [
  { code: "en", lang: "en", og: "en_US", label: "English" },
  { code: "zh-tw", lang: "zh-Hant", og: "zh_TW", label: "繁體中文" },
  { code: "zh-cn", lang: "zh-Hans", og: "zh_CN", label: "简体中文" },
  { code: "ja", lang: "ja", og: "ja_JP", label: "日本語" },
  { code: "ko", lang: "ko", og: "ko_KR", label: "한국어" },
  { code: "vi", lang: "vi", og: "vi_VN", label: "Tiếng Việt" },
  { code: "es-es", lang: "es", og: "es_ES", label: "Español" },
  { code: "pt-br", lang: "pt-BR", og: "pt_BR", label: "Português (Brasil)" },
  { code: "nl", lang: "nl", og: "nl_NL", label: "Nederlands" },
];

export const DEFAULT_LOCALE = "en";

type Tree = { [key: string]: string | Tree };

const trees: Record<string, Tree> = {};
for (const [path, raw] of Object.entries(files)) {
  const code = path
    .split("/")
    .pop()!
    .replace(/\.yml$/, "");
  trees[code] = (load(raw) as Tree) ?? {};
}

function lookup(tree: Tree | undefined, key: string): string | undefined {
  let node: string | Tree | undefined = tree;
  for (const part of key.split(".")) {
    if (!node || typeof node === "string") return undefined;
    node = node[part];
  }
  return typeof node === "string" && node.trim() !== "" ? node : undefined;
}

export function localeOf(code: string | undefined): Locale {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function useTranslations(code: string) {
  return function t(
    key: string,
    vars?: Record<string, string | number>,
  ): string {
    let value = lookup(trees[code], key) ?? lookup(trees[DEFAULT_LOCALE], key);
    if (value === undefined) {
      if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
      return key;
    }
    value = value.trim();
    if (vars)
      for (const [k, v] of Object.entries(vars))
        value = value.replaceAll(`{${k}}`, String(v));
    return value;
  };
}

export type T = ReturnType<typeof useTranslations>;

export function pathFor(code: string, hash = ""): string {
  return (code === DEFAULT_LOCALE ? "/" : `/${code}/`) + hash;
}
