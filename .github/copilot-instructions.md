# Copilot Instructions for the Hoyo Buddy Website

See [CLAUDE.md](../CLAUDE.md) for the architecture, design language, commands and i18n workflow. In short:

- Astro 7 + Tailwind CSS v4, static output, one pre-rendered page per language.
- `locales/en.yml` is the source of truth for copy (Transifex syncs the rest); use `t("key")` from `src/i18n`.
- Each game is a "world" (`src/data/worlds.ts`); the selected game is shared via `src/scripts/game.ts`.
- Interactions are click-driven, and content that changes per game is pre-rendered as stacked variants so the layout never shifts.
