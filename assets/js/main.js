(function () {
  "use strict";

  // ======= Sticky
  window.onscroll = function () {
    const ud_header = document.querySelector(".ud-header");
    const sticky = ud_header.offsetTop;
    const logo = document.querySelectorAll(".header-logo");

    if (window.pageYOffset > sticky) {
      ud_header.classList.add("sticky");
    } else {
      ud_header.classList.remove("sticky");
    }

    if(logo.length) {
      // === logo change
      if (ud_header.classList.contains("sticky")) {
        document.querySelector(".header-logo").src =
          "assets/images/logo/logo.svg"
      } else {
        document.querySelector(".header-logo").src =
          "assets/images/logo/logo-white.svg"
      }
    }

    if (document.documentElement.classList.contains("dark")) {
      if(logo.length) {
        // === logo change
        if (ud_header.classList.contains("sticky")) {
          document.querySelector(".header-logo").src =
            "assets/images/logo/logo-white.svg"
        } 
      }
    }

  };

  // ===== responsive navbar
  let navbarToggler = document.querySelector("#navbarToggler");
  const navbarCollapse = document.querySelector("#navbarCollapse");

  navbarToggler.addEventListener("click", () => {
    navbarToggler.classList.toggle("navbarTogglerActive");
    navbarCollapse.classList.toggle("hidden");
  });

  //===== close navbar-collapse when a  clicked
  document
    .querySelectorAll("#navbarCollapse ul li:not(.submenu-item) a")
    .forEach((e) =>
      e.addEventListener("click", () => {
        navbarToggler.classList.remove("navbarTogglerActive");
        navbarCollapse.classList.add("hidden");
      })
    );

  // ===== Sub-menu
  const submenuItems = document.querySelectorAll(".submenu-item");
  submenuItems.forEach((el) => {
    el.querySelector("a").addEventListener("click", () => {
      el.querySelector(".submenu").classList.toggle("hidden");
    });
  });

  // ===== Faq accordion
  const faqs = document.querySelectorAll(".single-faq");
  faqs.forEach((el) => {
    el.querySelector(".faq-btn").addEventListener("click", () => {
      el.querySelector(".icon").classList.toggle("rotate-180");
      el.querySelector(".faq-content").classList.toggle("hidden");
    });
  });

  // ===== wow js
  new WOW().init();


    /* ========  themeSwitcher start ========= */

  // themeSwitcher
  const themeSwitcher = document.getElementById('themeSwitcher');

  // Theme Vars
  const userTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initial Theme Check
  const themeCheck = () => {
    if (userTheme === 'dark' || (!userTheme && systemTheme)) {
      document.documentElement.classList.add('dark');
    }
  };

  // Manual Theme Switch
  const themeSwitch = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      return;
    }

    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  };

  // call theme switch on clicking buttons
  themeSwitcher.addEventListener('click', () => {
    themeSwitch();
  });

  // invoke theme check on initial load
  themeCheck();
  /* ========  themeSwitcher End ========= */

  // ===== Locale-aware install link handler
  function getCurrentLocale() {
    const supportedLocales = ['en', 'vi', 'zh-TW', 'zh-CN', 'ja', 'pt', 'es'];
    const storedLang = localStorage.getItem('lang');
    return supportedLocales.includes(storedLang) ? storedLang : 'en';
  }

  function handleInstallRedirect(event) {
    event.preventDefault();
    const currentLocale = getCurrentLocale();
    const baseUrl = 'https://one.hb.seria.moe';
    const installUrl = `${baseUrl}/${currentLocale}/install`;
    window.open(installUrl, '_blank', 'noopener');
  }

  // Attach event listeners to install buttons
  document.addEventListener('DOMContentLoaded', () => {
    const installButtons = document.querySelectorAll('a[href="https://one.hb.seria.moe/install"]');
    installButtons.forEach(button => {
      button.addEventListener('click', handleInstallRedirect);
    });
  });

})();
