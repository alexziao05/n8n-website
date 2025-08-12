function initNav() {
  const nav = document.querySelector('nav');
  const btn = document.getElementById('menu-button');
  const panel = document.getElementById('primary-menu');
  const desktopLinks = [...document.querySelectorAll('nav a[href^="#"]')];

  // Shadow on scroll
  const onScroll = () => {
    if (window.scrollY > 8) nav?.classList.add('is-scrolled');
    else nav?.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  if (btn && panel) {
    const iconOpen = btn.querySelector('[data-icon="open"]');
    const iconClose = btn.querySelector('[data-icon="close"]');

    const openMenu = () => {
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      panel.classList.add('show');
      iconOpen?.classList.add('hidden');
      iconClose?.classList.remove('hidden');
    };
    const closeMenu = () => {
      btn.setAttribute('aria-expanded', 'false');
      panel.classList.remove('show');
      iconClose?.classList.add('hidden');
      iconOpen?.classList.remove('hidden');
      // Delay hiding to allow transition to finish
      window.setTimeout(() => { panel.hidden = true; }, 180);
    };

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });

    // Close on link click (mobile panel)
    panel.addEventListener('click', (e) => {
      const t = e.target;
      if (t instanceof HTMLElement && t.tagName === 'A') closeMenu();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) closeMenu();
    }, true);
  }

  // Simple scroll spy for desktop nav
  const links = desktopLinks;
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = '#' + entry.target.id;
        const link = links.find(a => a.getAttribute('href') === id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(a => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
    sections.forEach(sec => io.observe(sec));
  }
}

// Auto-init if not using main.js
document.addEventListener('DOMContentLoaded', initNav);
