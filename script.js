/**
 * DAIVIK K P - PORTFOLIO SCRIPT
 * Vertical Navigation, Mobile Drawer, Theme Controller & Terminal Chat
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. NIGHT MODE CONTROLLER (CSS Media Query Detection + Manual Toggle)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle-btn');
  const themeModeLabel = document.getElementById('theme-mode-label');
  const prefersDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const THEME_STORAGE_KEY = 'portfolio_theme_mode';

  function getSavedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
  }

  function getEffectiveTheme(mode) {
    if (mode === 'auto') {
      return prefersDarkMediaQuery.matches ? 'dark' : 'light';
    }
    return mode;
  }

  function updateThemeUI(mode) {
    const root = document.documentElement;
    const effectiveTheme = getEffectiveTheme(mode);

    if (mode === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }

    if (themeModeLabel) {
      const modeTextSpan = themeModeLabel.querySelector('.current-mode-text');
      if (modeTextSpan) {
        modeTextSpan.textContent = mode.toUpperCase();
      } else {
        themeModeLabel.textContent = `THEME: ${mode.toUpperCase()}`;
      }
    }

    const titleText = `Theme: ${mode.toUpperCase()} (Click to toggle)`;
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-pressed', effectiveTheme === 'dark');
      themeToggleBtn.title = titleText;
    }
    if (mobileThemeToggleBtn) {
      mobileThemeToggleBtn.setAttribute('aria-pressed', effectiveTheme === 'dark');
      mobileThemeToggleBtn.title = titleText;
    }
  }

  function cycleTheme() {
    const currentMode = getSavedTheme();
    let nextMode = 'dark';

    // Cycle: auto -> dark -> light -> auto
    if (currentMode === 'auto') {
      nextMode = prefersDarkMediaQuery.matches ? 'light' : 'dark';
    } else if (currentMode === 'dark') {
      nextMode = 'light';
    } else if (currentMode === 'light') {
      nextMode = 'auto';
    }

    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    updateThemeUI(nextMode);
  }

  // Initialize theme on load
  const initialTheme = getSavedTheme();
  updateThemeUI(initialTheme);

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', cycleTheme);
  if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', cycleTheme);

  // Listen for live OS/Browser theme changes
  prefersDarkMediaQuery.addEventListener('change', () => {
    if (getSavedTheme() === 'auto') {
      updateThemeUI('auto');
    }
  });

  // =========================================================================
  // 2. VERTICAL NAVIGATION & MOBILE DRAWER LOGIC
  // =========================================================================
  const verticalNavbar = document.getElementById('vertical-navbar');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const navLinks = document.querySelectorAll('.vertical-nav-link');

  function openSidebar() {
    if (verticalNavbar) verticalNavbar.classList.add('is-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('is-active');
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = window.innerWidth < 1024 ? 'hidden' : '';
  }

  function closeSidebar() {
    if (verticalNavbar) verticalNavbar.classList.remove('is-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('is-active');
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = verticalNavbar && verticalNavbar.classList.contains('is-open');
      isOpen ? closeSidebar() : openSidebar();
    });
  }

  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // Close sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && verticalNavbar && verticalNavbar.classList.contains('is-open')) {
      closeSidebar();
    }
  });

  // Smooth scroll and auto-close sidebar on mobile
  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          if (window.innerWidth < 1024) {
            closeSidebar();
          }
        }
      }
    });
  });

  // =========================================================================
  // 3. SCROLL-SPY: HIGHLIGHT ACTIVE VERTICAL NAV LINK
  // =========================================================================
  const sectionIds = [
    'hero',
    'about',
    'skills',
    'timeline',
    'projects',
    'testimonials',
    'chat',
    'contact',
  ];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveNavLink(activeId) {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNavLink(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    // Fallback scroll listener
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.offsetTop <= scrollPos) {
          setActiveNavLink(section.id);
          break;
        }
      }
    });
  }

  // =========================================================================
  // 4. INTERACTIVE TERMINAL CHAT
  // =========================================================================
  const chatForm = document.getElementById('terminal-chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatContainer = document.getElementById('chat-messages-container');

  if (chatForm && chatInput && chatContainer) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;

      // Append user message
      const userMsgDiv = document.createElement('div');
      userMsgDiv.className = 'chat-message user-msg';
      userMsgDiv.innerHTML = `<span class="msg-sender">[YOU]:</span> <span class="msg-text">${escapeHtml(message)}</span>`;
      chatContainer.appendChild(userMsgDiv);
      chatInput.value = '';
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // Simulated smart bot response
      setTimeout(() => {
        let replyText = "Thanks for your message! Daivik will review it and get back to you shortly.";
        const lower = message.toLowerCase();

        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
          replyText = "Greetings! Welcome to Daivik's developer terminal. How can I help you today?";
        } else if (lower.includes('skill') || lower.includes('stack')) {
          replyText = "Daivik specializes in React, Next.js, Node.js, TypeScript, PostgreSQL, Docker, and Cloud architecture.";
        } else if (lower.includes('project') || lower.includes('work')) {
          replyText = "Featured projects include Cloud Monitoring Dashboard, Microservices E-Commerce API, and Developer Productivity CLI!";
        } else if (lower.includes('hire') || lower.includes('contact') || lower.includes('email')) {
          replyText = "You can reach Daivik directly at daivikkp007@gmail.com or via the Contact form below! Also connect on LinkedIn: linkedin.com/in/daivikkp-gowda-4b11433a0";
        }

        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'chat-message bot-msg';
        botMsgDiv.innerHTML = `<span class="msg-sender">[DAIVIK_BOT]:</span> <span class="msg-text">${escapeHtml(replyText)}</span>`;
        chatContainer.appendChild(botMsgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 500);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // =========================================================================
  // 5. INTERACTIVE AVATAR SWITCHER (PIXEL ART <-> REAL PHOTO)
  // =========================================================================
  const avatarToggleBtn = document.getElementById('avatar-toggle-btn');
  const aboutAvatarImg = document.getElementById('about-avatar-img');
  const avatarTagOverlay = document.getElementById('avatar-tag-overlay');

  if (avatarToggleBtn && aboutAvatarImg) {
    let isPixelAvatar = true;
    avatarToggleBtn.addEventListener('click', () => {
      isPixelAvatar = !isPixelAvatar;
      if (isPixelAvatar) {
        aboutAvatarImg.src = 'pixel_avatar.jpg';
        aboutAvatarImg.alt = 'Daivik Gowda - Pixel Art Software Engineer Avatar';
        if (avatarTagOverlay) avatarTagOverlay.textContent = '[16-BIT DEVELOPER]';
        avatarToggleBtn.innerHTML = '<span class="pixel-btn-icon">&#8635;</span> REAL PHOTO';
      } else {
        aboutAvatarImg.src = 'daivikkp prof picture.jpeg';
        aboutAvatarImg.alt = 'Daivik Gowda - Software Engineer Portrait';
        if (avatarTagOverlay) avatarTagOverlay.textContent = '[REAL PORTRAIT]';
        avatarToggleBtn.innerHTML = '<span class="pixel-btn-icon">&#8635;</span> PIXEL AVATAR';
      }
    });
  }

  // =========================================================================
  // 6. INTERACTIVE SKILLS FILTER TABS
  // =========================================================================
  const skillTabs = document.querySelectorAll('.skills-filter-tabs .pixel-tab-btn');
  const skillCards = document.querySelectorAll('#skills-grid .skill-category-card');

  if (skillTabs.length > 0 && skillCards.length > 0) {
    skillTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        skillTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        skillCards.forEach((card) => {
          const category = card.dataset.category;
          if (filter === 'all' || category === filter) {
            card.classList.remove('is-hidden');
            // Re-trigger progress bar animation
            const fills = card.querySelectorAll('.pixel-progress-fill');
            fills.forEach((fill) => {
              const currentWidth = fill.style.getPropertyValue('--skill-pct');
              fill.style.width = '0%';
              setTimeout(() => {
                fill.style.width = currentWidth;
              }, 50);
            });
          } else {
            card.classList.add('is-hidden');
          }
        });
      });
    });
  }

  // =========================================================================
  // 7. INTERACTIVE TIMELINE FILTER TABS
  // =========================================================================
  const timelineTabs = document.querySelectorAll('.timeline-filter-tabs .pixel-tab-btn');
  const timelineItems = document.querySelectorAll('#timeline-container .timeline-item');

  if (timelineTabs.length > 0 && timelineItems.length > 0) {
    timelineTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.timelineFilter;

        timelineTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        timelineItems.forEach((item) => {
          const category = item.dataset.category;
          if (filter === 'all' || category === filter) {
            item.classList.remove('is-hidden');
          } else {
            item.classList.add('is-hidden');
          }
        });
      });
    });
  }
})();
