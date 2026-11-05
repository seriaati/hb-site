import type { APIRoute } from "astro";
import { LOCALES, pathFor } from "../i18n";

const PAGES = ["", "members/"];

// One URL per page and language, each listing every alternate.
export const GET: APIRoute = ({ site }) => {
  const url = (code: string, page: string) =>
    new URL(pathFor(code, page), site).href;
  const body = PAGES.flatMap((page) => {
    const alternates = LOCALES.map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${l.lang}" href="${url(l.code, page)}" />`,
    ).join("\n");
    return LOCALES.map(
      (l) =>
        `  <url>\n    <loc>${url(l.code, page)}</loc>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url("en", page)}" />\n  </url>`,
    );
  }).join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
