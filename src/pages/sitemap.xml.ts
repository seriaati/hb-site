import type { APIRoute } from "astro";
import { LOCALES, pathFor } from "../i18n";

// One URL per language, each listing every alternate.
export const GET: APIRoute = ({ site }) => {
  const url = (code: string) => new URL(pathFor(code), site).href;
  const alternates = LOCALES.map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${l.lang}" href="${url(l.code)}" />`,
  ).join("\n");
  const body = LOCALES.map(
    (l) =>
      `  <url>\n    <loc>${url(l.code)}</loc>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url("en")}" />\n  </url>`,
  ).join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
