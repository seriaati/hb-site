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

    if (logo.length) {
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
      if (logo.length) {
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

  // ===== scroll reveal
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  // ===== commands carousel controls
  const commandsCarousel = document.getElementById("commandsCarousel");
  const commandsCarouselPrev = document.getElementById("commandsCarouselPrev");
  const commandsCarouselNext = document.getElementById("commandsCarouselNext");

  if (commandsCarousel && commandsCarouselPrev && commandsCarouselNext) {
    const updateCarouselButtons = () => {
      const items = commandsCarousel.querySelectorAll(".commands-carousel-item");
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      let atStart = false;
      let atEnd = false;

      if (firstItem && lastItem) {
        const carouselRect = commandsCarousel.getBoundingClientRect();
        const firstRect = firstItem.getBoundingClientRect();
        const lastRect = lastItem.getBoundingClientRect();

        atStart = firstRect.left >= carouselRect.left - 2;
        atEnd = lastRect.right <= carouselRect.right + 2;
      } else {
        const maxScrollLeft = commandsCarousel.scrollWidth - commandsCarousel.clientWidth;
        atStart = commandsCarousel.scrollLeft <= 2;
        atEnd = commandsCarousel.scrollLeft >= maxScrollLeft - 2;
      }

      commandsCarouselPrev.disabled = atStart;
      commandsCarouselNext.disabled = atEnd;
      commandsCarouselPrev.setAttribute("aria-disabled", String(atStart));
      commandsCarouselNext.setAttribute("aria-disabled", String(atEnd));
    };

    const getScrollAmount = () => {
      const firstItem = commandsCarousel.querySelector(".commands-carousel-item");
      if (!firstItem) {
        return 300;
      }

      const itemWidth = firstItem.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(commandsCarousel).gap) || 0;
      return itemWidth + gap;
    };

    commandsCarouselPrev.addEventListener("click", () => {
      commandsCarousel.scrollBy({
        left: -getScrollAmount(),
        behavior: "smooth",
      });
      setTimeout(updateCarouselButtons, 350);
    });

    commandsCarouselNext.addEventListener("click", () => {
      commandsCarousel.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth",
      });
      setTimeout(updateCarouselButtons, 350);
    });

    commandsCarousel.addEventListener("scroll", updateCarouselButtons, { passive: true });
    window.addEventListener("resize", updateCarouselButtons);
    updateCarouselButtons();
  }


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
})();
