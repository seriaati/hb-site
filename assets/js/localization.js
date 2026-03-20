// Function to load YAML file
async function loadLocale(lang) {
    const response = await fetch(`locales/${lang}.yml`);
    const text = await response.text();
    // Simple YAML parser for this specific structure
    const lines = text.split('\n');
    const translations = {};
    const stack = [{ obj: translations, indent: -1 }];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmedLine = line.trim();

        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            i++;
            continue;
        }

        const indent = line.search(/\S/);
        const colonIndex = trimmedLine.indexOf(':');

        if (colonIndex === -1) {
            i++;
            continue;
        }

        const key = trimmedLine.substring(0, colonIndex).trim();
        const value = trimmedLine.substring(colonIndex + 1).trim();

        // Pop stack until we find the right parent level
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
            stack.pop();
        }

        const parent = stack[stack.length - 1].obj;

        if (value === '') { // This is a new section/object
            parent[key] = {};
            stack.push({ obj: parent[key], indent: indent });
        } else if (value === '|') { // This is a multi-line string
            // Collect all subsequent lines with greater indentation
            const multilineContent = [];
            i++; // Move to next line

            while (i < lines.length) {
                const nextLine = lines[i];
                const nextTrimmed = nextLine.trim();

                if (nextTrimmed === '' || nextTrimmed.startsWith('#')) {
                    i++;
                    continue;
                }

                const nextIndent = nextLine.search(/\S/);
                if (nextIndent <= indent) {
                    break; // End of multiline content
                }

                multilineContent.push(nextLine.substring(indent + 2)); // Remove base indentation
                i++;
            }

            parent[key] = multilineContent.join('\n').trim();
            continue; // Don't increment i again
        } else { // This is a key-value pair
            // Remove surrounding quotes if present
            let finalValue = value;
            if ((finalValue.startsWith('"') && finalValue.endsWith('"')) ||
                (finalValue.startsWith("'") && finalValue.endsWith("'"))) {
                finalValue = finalValue.slice(1, -1);
            }
            parent[key] = finalValue;
        }

        i++;
    }
    return translations;
}

// Function to apply translations
async function applyTranslations(lang) {
    const fallbackLang = 'en';
    let translations;

    try {
        translations = await loadLocale(lang);
    } catch (error) {
        console.error(`Failed to load locale: ${lang}`, error);
        if (lang !== fallbackLang) {
            translations = await loadLocale(fallbackLang);
            lang = fallbackLang;
        } else {
            throw error;
        }
    }

    document.documentElement.setAttribute('lang', lang);

    // Update meta tags
    if (translations.meta) {
        const titleTag = document.querySelector('title');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogImageAlt = document.querySelector('meta[property="og:image:alt"]');

        if (titleTag) {
            titleTag.innerHTML = translations.meta.title;
        }
        if (ogTitle) {
            ogTitle.setAttribute('content', translations.meta.title);
        }
        if (ogDescription) {
            ogDescription.setAttribute('content', translations.meta.description);
        }
        if (ogImageAlt) {
            ogImageAlt.setAttribute('content', translations.meta.title);
        }
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        let translatedText = translations;
        const keyParts = key.split('.');
        for (const part of keyParts) {
            if (translatedText && translatedText[part] !== undefined) {
                translatedText = translatedText[part];
            } else {
                translatedText = null;
                break;
            }
        }

        if (translatedText) {
            element.innerHTML = translatedText;
        } else {
            console.warn(`Translation key not found: ${key}`);
        }
    });
}

// Function to detect user's preferred language
function detectUserLocale() {
    const supportedLanguages = ['en', 'vi', 'zh-tw', 'zh-cn', 'ja', 'pt-br', 'es-es'];

    // Get browser languages in order of preference
    const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];

    for (const browserLang of browserLanguages) {
        // Check exact match first
        if (supportedLanguages.includes(browserLang)) {
            return browserLang;
        }

        // Check language code without region (e.g., 'en-US' -> 'en')
        const langCode = browserLang.split('-')[0];
        if (supportedLanguages.includes(langCode)) {
            return langCode;
        }

        // Handle Chinese language variants
        if (browserLang.startsWith('zh')) {
            // Traditional Chinese regions
            if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO')) {
                return 'zh-tw';
            }
            // Simplified Chinese (default for other Chinese variants)
            return 'zh-cn';
        }

        // Handle Portuguese (Brazil)
        if (browserLang.startsWith('pt')) {
            return 'pt-br';
        }

        // Handle Spanish (default to Spain)
        if (browserLang.startsWith('es')) {
            return 'es-es';
        }
    }

    // Default to English if no supported language found
    return 'en';
}

// Language switcher logic
const initialLang = window.__HB_INITIAL_LANG__ || localStorage.getItem('lang') || detectUserLocale();

applyTranslations(initialLang)
    .catch((error) => {
        console.error('Failed to apply translations:', error);
    })
    .finally(() => {
        document.documentElement.style.visibility = 'visible';
    });
