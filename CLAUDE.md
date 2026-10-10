# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The marketing site for Hoyo Buddy, a Discord app for Hoyoverse players. It is built with **Astro 7** and **Tailwind CSS v4**, renders one pre-built page per language, and is deployed on Cloudflare Pages (build `bun run build`, output `dist`).

## Commands

```bash
bun run dev       # dev server at http://localhost:4321
bun run build     # static build into dist/
bun run preview   # serve dist/
bun run check     # astro check (TypeScript + templates)
bun run format    # prettier (astro + tailwind plugins)
```

## Design language ("Converge")

- The site is dark-only. The neutral page uses Funnel Display, Funnel Sans and Geist Mono. Tokens live in `src/styles/global.css` (`--bg`, `--fg`, `--mute`, `--accent`, `--line`, `--surface`). Tailwind exposes them as `bg-bg`, `text-mute`, and so on.
- Each game has a **world** (`src/data/worlds.ts`): a palette, a typeface, a place name, and an ambient canvas motif (`src/scripts/scenes.ts`). An element becomes a world through `applyVars(el, worldVars(world))`.
- The selected game is shared page-wide (`src/scripts/game.ts`: `setGame`/`onGame`). The hero emblems and every `GamePicker` stay in sync.
- Interactions are click-driven. Hover only previews.
- **No layout shift**: content that changes per game or command is pre-rendered as variants stacked in one grid cell (`.stack` with `[data-v]` children, toggled by `showVariant`). The slot is always as tall as its tallest variant.
- Canvas painters run only while on screen and respect `prefers-reduced-motion`.
- The hero's painter also draws set pieces (`new Painter(canvas, host, true, avoid)`): a Seelie in Teyvat that leads the cursor to a chest, the Astral Express crossing Star Rail's sky, and bangboo silhouettes peeking into ZZZ's TVs. The Seelie and bangboos stay clear of the elements `avoid` returns.

## Structure

- `src/pages/index.astro` (English) and `src/pages/[lang]/index.astro` (other locales) both render `src/components/Home.astro`.
- The sections are, in order: `Hero` (Converge: emblems merge into the mark, then clicking one enters that world), `Commands` (pick a game and a command to see the real reply), `Reminders` (24-hour timeline of reminder DMs), `AutoTasks` (the overnight DMs from each auto task the game supports), `OpenSource`, `Faq`, and `Footer`.
- `src/components/discord/` holds the Discord message and embed chrome. `src/components/replies/` holds the bot replies, recreated from the bot's source (hoyo_buddy/draw, ui, auto_tasks). Keep labels, layout and colors faithful to the bot.
- `src/assets/cards/` holds the bot's default build-card template previews, optimized at build time by `astro:assets`.
- `src/assets/notes/` holds real `/notes` images from the bot (GI, HSR, ZZZ); the embed text above each one matches its numbers.
- Every image is stored locally (`src/assets/` for optimized images, `public/` for the favicon, team avatars and `og.png`). Don't hotlink.
- `src/assets/games/` holds the game icons the bot uses (from hb-app). `src/assets/items/` holds the stamina and currency icons from the bot's `icons.py` and emojis.
- `src/pages/sitemap.xml.ts` generates the sitemap. `public/_redirects` handles the Cloudflare redirects from the old `index-*.html` URLs.

## Internationalization

- `locales/*.yml` is the source of truth and is synced with Transifex (`transifex.yml`). `en.yml` is the source file. Edit only `en.yml` by hand; Transifex writes the other files.
- `src/i18n/index.ts` loads the YAML at build time. `useTranslations(code)` returns `t(key, vars)`, and missing or empty keys fall back to English. `LOCALES` lists the URL code, `<html lang>` and picker label for each language.
- To add a language: add its YAML file (via Transifex) and an entry in `LOCALES`.
- Strings rendered by client scripts are passed in through `data-*` JSON attributes.
- World place names and game titles are localized under the `worlds` dictionary in `locales/*.yml`.
