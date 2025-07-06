# GEMINI.md

## Project Overview

This is the Hoyo Buddy website - a static landing page for a Discord bot focused on Hoyoverse games. The site is built using modern web technologies including TailwindCSS, i18next for internationalization, and a responsive design.

## Development Commands

### Building CSS

```bash
npm run build-css
```

Builds the Tailwind CSS from `src/tailwind.css` to `assets/css/tailwind.css` with watch mode enabled.

### Local Development Server

```bash
npm start
```

Starts an HTTP server on port 8080 for local development.

### Code Formatting

```bash
npx prettier --write .
```

Formats all code using Prettier with TailwindCSS plugin.

## Architecture & Structure

### Multi-language Support

- **i18next Integration**: The site uses i18next for internationalization with YAML locale files
- **Supported Languages**: English (en), Vietnamese (vi), Traditional Chinese (zh-tw)
- **Locale Files**: Located in `locales/` directory as `.yml` files
- **Language Detection**: Automatic detection from URL parameters (`?lang=`) or browser settings
- **Dynamic Language Switching**: Floating language selector component that updates content without page reload

### Styling System

- **TailwindCSS**: Custom configuration with extended color palette and responsive breakpoints
- **Dark Mode**: Class-based dark mode support with theme switching
- **Custom Colors**: Brand colors including primary (#4B56C0), secondary (#13C296), and dark theme variants
- **Responsive Design**: Custom breakpoints from 540px to 1320px

### JavaScript Architecture

- **Modular Components**: Separate files for language selection, theme switching, and main functionality
- **main.js**: Core initialization, i18next setup, sticky header, and content updates
- **language-selector.js**: Floating language selector with theme-aware styling
- **Theme System**: Automatic theme detection and switching with logo changes

### Content Management

- **Data-driven**: All text content is managed through YAML locale files
- **Translation Keys**: Use `data-i18n`, `data-i18n-meta`, and `data-i18n-alt` attributes
- **SEO-friendly**: Meta tags and titles are dynamically translated

## Key Technical Details

### i18next Configuration

- Uses custom YAML backend loader with js-yaml parsing
- Fallback language is English
- Stores language preference in localStorage
- Custom request handler for YAML file loading

### CSS Build Process

- Source: `src/tailwind.css`
- Output: `assets/css/tailwind.css`
- Watch mode enabled during development
- PostCSS with Tailwind and Autoprefixer

### Theme Implementation

- Uses `documentElement.classList.contains("dark")` for detection
- Logo switching based on theme and scroll position
- Language selector adapts styling to current theme

## Development Guidelines

### Adding New Languages

1. Create new YAML file in `locales/` directory
2. Update language list in `language-selector.js`
3. Add language code to detection logic in `main.js`

### Modifying Styles

- Edit `src/tailwind.css` for custom styles
- Use existing color tokens from `tailwind.config.js`
- Run `npm run build-css` after changes

### Content Updates

- Edit appropriate YAML files in `locales/` directory
- Use existing translation key structure
- Test language switching functionality

## Dependencies

### Production Dependencies

- **i18next-fs-backend**: For YAML locale file loading
- **js-yaml**: YAML parsing for translation files

### Development Dependencies

- **tailwindcss**: CSS framework
- **prettier**: Code formatting
- **prettier-plugin-tailwindcss**: TailwindCSS class sorting
- **http-server**: Local development server
