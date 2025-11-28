# Copilot Instructions for Hoyo Buddy Website

## Project Overview
Static multilingual landing page for Hoyo Buddy Discord bot. Built with vanilla HTML/JS + TailwindCSS. No build system or bundler—pure ES6 modules loaded directly in browser.

## Architecture

### Custom I18n System
- **Translation files**: `locales/{lang}.yml` (YAML format)
- **DOM binding**: Elements use `data-i18n="key.path"` attributes
- **Custom YAML parser**: `localization.js` includes bespoke parser (lines 1-80) that handles nested keys and multiline `|` syntax
- **Meta tags**: Automatically translated via `translations.meta` object
- Language preference persisted in `localStorage.getItem('lang')`

**Example translation usage:**
```html
<span data-i18n="navbar.home">Home</span>
```

### Component Architecture
Three independent modules, no framework:
- `main.js`: Sticky header, navbar toggle, theme switcher, FAQ accordion
- `localization.js`: YAML parsing + DOM translation updates
- `language-selector.js`: Floating language selector (ES6 class, dynamically injected into DOM)

### Theme System
- Dark mode via `document.documentElement.classList` (add/remove 'dark')
- Persisted in `localStorage.getItem('theme')`
- Logo swaps between `logo.svg` (light) and `logo-white.svg` (dark) based on sticky header state + theme
- TailwindCSS `dark:` prefixes for styling

## Development Workflow

### Essential Commands
```bash
npm run build-css    # Watch mode: compiles src/tailwind.css → assets/css/tailwind.css
npm run dev         # http-server on port 8080
npx prettier --write .  # Format with Prettier + TailwindCSS plugin
```

### TailwindCSS Configuration
- **Content sources**: `./*.html` and `./assets/**/*.js` (see `tailwind.config.js`)
- **Custom breakpoints**: `sm:540px`, `md:720px`, `lg:960px`, `xl:1140px`, `2xl:1320px`
- **Custom colors**: Extended palette with dark mode variants (dark-700, primary:#4B56C0, secondary:#13C296)
- Always rebuild CSS after editing utilities in HTML/JS

### Translation Management
- **Transifex integration**: Configured in `transifex.yml` for managing translations
- **Source language**: `en.yml` is the base (English)
- **Supported locales**: en, vi, zh-tw, zh-cn, ja, pt-br, es-es
- When adding languages: Update `LanguageSelector.languages` array in `language-selector.js` (lines 7-14)

## Key Patterns

### Event-Driven UI
All interactions use vanilla DOM events—no jQuery or frameworks:
```javascript
navbarToggler.addEventListener("click", () => { /* ... */ });
```

### State Management
Simple localStorage for persistence:
- `theme`: 'light' | 'dark'
- `lang`: language code (e.g., 'en', 'vi')

### Responsive Design
Mobile-first with hamburger menu toggling via `.hidden` class on `#navbarCollapse`

### Logo Switching Logic
Header logo changes based on:
1. Scroll position (sticky class)
2. Theme (dark mode overrides)
See `main.js` lines 15-34 for implementation

## Common Tasks

### Adding New Translations
1. Add key-value pairs to `locales/en.yml`
2. Add corresponding `data-i18n` attributes to HTML elements
3. Sync translations via Transifex or manually update other locale files

### Styling Changes
- Use TailwindCSS utilities exclusively (no custom CSS unless in `src/tailwind.css`)
- Check `tailwind.config.js` for available custom colors/utilities
- Run `npm run build-css` to see changes

### Adding Language Support
1. Create `locales/{lang-code}.yml` with all translation keys
2. Add language object to `LanguageSelector` constructor (flag emoji, code, name)
3. No routing needed—single-page app switches content dynamically

## Important Constraints
- **No bundler**: Don't suggest import statements that require compilation
- **Browser-native modules**: Scripts use `<script>` tags, not webpack/vite
- **Vanilla JS only**: No frameworks (React/Vue/etc.) or jQuery
- **YAML parser is custom**: Don't replace with library—tightly coupled to current format
