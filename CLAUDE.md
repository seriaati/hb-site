# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multilingual static website for Hoyo Buddy, a Discord bot for Hoyoverse gamers. The site is built with HTML, TailwindCSS, and JavaScript, featuring internationalization support for English, Vietnamese, and Traditional Chinese.

## Development Commands

### Build CSS
```bash
npm run build-css
```
This watches for changes and builds TailwindCSS from `src/tailwind.css` to `assets/css/tailwind.css`.

### Code Formatting
```bash
npx prettier --write .
```
Uses Prettier with TailwindCSS plugin for consistent code formatting.

## Architecture

### File Structure
- `index.html` - Main landing page with internationalization attributes
- `assets/js/` - JavaScript modules for functionality
  - `main.js` - Core UI interactions (sticky header, navbar, theme switching)
  - `localization.js` - I18n system with YAML parsing and DOM updates
  - `language-selector.js` - Floating language selector component
- `locales/` - Translation files
- `assets/css/` - Stylesheets including compiled TailwindCSS
- `assets/images/` - Static assets organized by page sections

### Internationalization System
The site uses a custom i18n system:
- Translation keys are stored in YAML files under `locales/`
- DOM elements use `data-i18n` attributes for translation targets
- Language preference is persisted in localStorage
- Supports nested translation keys (e.g., `navbar.home`)

### JavaScript Architecture
- No build system or bundler - vanilla JavaScript with ES6 classes
- Modular design with separate concerns (UI, i18n, language selection)
- Event-driven architecture with DOM event listeners
- Theme-aware components that respond to dark/light mode changes

### TailwindCSS Configuration
- Custom color palette with dark theme support
- Extended breakpoints and shadows
- Content scanning includes HTML files and JavaScript assets
- Uses PostCSS for processing

## Development Notes

### Adding New Languages
1. Create new YAML file in `locales/` directory
2. Add language option to `LanguageSelector` class in `language-selector.js`
3. Update HTML lang attribute switching logic if needed

### Styling Guidelines
- Uses TailwindCSS utility classes exclusively
- Custom colors defined in `tailwind.config.js`
- Responsive design with custom breakpoints
- Dark mode support via `dark:` prefixes

### Image Assets
- Logo variants for light/dark themes in `assets/images/logo/`
- Section-specific images organized by purpose
- Favicon and meta image assets included