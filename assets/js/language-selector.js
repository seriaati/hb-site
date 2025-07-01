/**
 * Floating Language Selector Component
 * A reusable component that can be included in any page to provide language selection
 */

class LanguageSelector {
  constructor(options = {}) {
    this.currentPage = options.currentPage || 'index.html';
    this.languages = [
      { code: 'en', file: 'index.html', name: 'English', flag: '🇺🇸' },
      { code: 'vi', file: 'index-vi-vn.html', name: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'zh-tw', file: 'index-zh-tw.html', name: '繁體中文', flag: '🇹🇼' }
    ];
    this.isOpen = false;
    this.init();
    this.updateTheme();
  }

  updateTheme() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    this.dropdown.style.backgroundColor = isDarkMode ? '#1a202c' : 'white';
    this.dropdown.style.borderColor = isDarkMode ? '#2d3748' : '#e5e7eb';

    const links = this.dropdown.querySelectorAll('a');
    links.forEach(link => {
      link.style.color = isDarkMode ? '#a0aec0' : '#6b7280';
      link.addEventListener('mouseenter', () => {
        link.style.color = '#3c82f6';
        link.style.backgroundColor = isDarkMode ? '#2d3748' : '#f9fafb';
      });
      link.addEventListener('mouseleave', () => {
        link.style.color = isDarkMode ? '#a0aec0' : '#6b7280';
        link.style.backgroundColor = 'transparent';
      });
    });
  }

  init() {
    this.createHTML();
    this.attachEventListeners();
    this.updateTheme();

    // Listen for theme changes
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (themeSwitcher) {
      themeSwitcher.addEventListener('click', () => {
        // Delay to allow the theme to switch before updating
        setTimeout(() => this.updateTheme(), 100);
      });
    }
  }

  createHTML() {
    // Create the floating language selector container
    const container = document.createElement('div');
    container.id = 'languageSelector';
    container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999;';

    // Create the relative wrapper
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position: relative;';

    // Create the button
    const button = document.createElement('button');
    button.id = 'languageButton';
    button.setAttribute('aria-label', 'Language Selector');
    button.style.cssText = `
      background-color: #3c82f6; 
      color: white; 
      border-radius: 50%; 
      padding: 12px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
      border: none; 
      cursor: pointer; 
      transition: all 0.3s ease;
    `;

    // Add hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    // Create the globe icon
    button.innerHTML = `
      <svg style="width: 24px; height: 24px;" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-4 0 2 2 0 00-1.668-1.973z" clip-rule="evenodd"></path>
      </svg>
    `;

    // Create the dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'languageDropdown';
    dropdown.style.cssText = `
      position: absolute; 
      bottom: 100%; 
      right: 0; 
      margin-bottom: 8px; 
      background: white; 
      border-radius: 8px; 
      box-shadow: 0 20px 25px rgba(0,0,0,0.15); 
      border: 1px solid #e5e7eb; 
      min-width: 150px; 
      opacity: 0; 
      visibility: hidden; 
      transition: all 0.3s ease; 
      transform: translateY(8px);
    `;

    // Create dropdown content
    const dropdownContent = document.createElement('div');
    dropdownContent.style.cssText = 'padding: 8px 0;';

    // Add language options
    this.languages.forEach(lang => {
      const link = document.createElement('a');
      link.href = lang.file;
      link.style.cssText = `
        display: flex; 
        align-items: center; 
        padding: 12px 16px; 
        text-decoration: none; 
        font-size: 14px; 
        transition: all 0.2s ease;
      `;

      link.innerHTML = `
        <span style="margin-right: 8px;">${lang.flag}</span>
        ${lang.name}
      `;

      dropdownContent.appendChild(link);
    });

    dropdown.appendChild(dropdownContent);
    wrapper.appendChild(button);
    wrapper.appendChild(dropdown);
    container.appendChild(wrapper);

    // Add to page
    document.body.appendChild(container);

    // Store references
    this.button = button;
    this.dropdown = dropdown;
    this.container = container;
  }

  attachEventListeners() {
    // Button click
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.openDropdown();
    } else {
      this.closeDropdown();
    }
  }

  openDropdown() {
    this.dropdown.style.opacity = '1';
    this.dropdown.style.visibility = 'visible';
    this.dropdown.style.transform = 'translateY(0)';
  }

  closeDropdown() {
    this.isOpen = false;
    this.dropdown.style.opacity = '0';
    this.dropdown.style.visibility = 'hidden';
    this.dropdown.style.transform = 'translateY(8px)';
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Detect current page from URL
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  
  // Initialize the language selector
  window.languageSelector = new LanguageSelector({
    currentPage: currentPage
  });
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageSelector;
}