document.addEventListener('DOMContentLoaded', () => {
  // Reveal-on-scroll animations
  const revealItems = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => observer.observe(item));

  // Topbar scroll effect
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 40) {
            topbar.classList.add('is-scrolled');
          } else {
            topbar.classList.remove('is-scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Mobile hamburger menu
  const nav = document.querySelector('.nav');
  if (nav && topbar) {
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    topbar.appendChild(toggle);

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.innerHTML = isOpen
        ? '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });

    // Close menu on link click
    nav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!topbar.contains(e.target) && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
      }
    });
  }

  const currentPath = window.location.pathname;
  const isNestedLocale = currentPath.includes('/fr/') || currentPath.includes('/ar/');
  const sitePrefix = isNestedLocale ? '../' : './';

  const languageLinks = Array.from(document.querySelectorAll('.nav-link')).filter((link) => {
    const href = link.getAttribute('href') || '';
    return href.endsWith('/index.html') || href.endsWith('/fr/index.html') || href.endsWith('/ar/index.html');
  });

  languageLinks.forEach((link) => link.classList.add('lang-pill'));

  // Add legal link before language pills
  if (nav && !nav.querySelector('[data-legal-link="true"]')) {
    const legalLink = document.createElement('a');
    legalLink.className = 'nav-link nav-legal';
    legalLink.setAttribute('data-legal-link', 'true');
    legalLink.href = `${sitePrefix}terms.html`;
    legalLink.textContent = 'Legal';
    if (currentPath.includes('/terms') || currentPath.includes('/privacy')) {
      legalLink.classList.add('active');
    }
    const firstLanguageLink = nav.querySelector('.lang-pill');
    if (firstLanguageLink) {
      nav.insertBefore(legalLink, firstLanguageLink);
    } else {
      nav.appendChild(legalLink);
    }
  }

  // Auto-generate footer if none exists
  const footer = document.querySelector('.site-footer');
  if (!footer) {
    const footerNav = document.createElement('footer');
    footerNav.className = 'site-shell footer site-footer';

    const left = document.createElement('div');
    left.className = 'footer-brand';
    left.innerHTML = '<strong>Waloo</strong><span>Local store deals for Algeria — reduce waste, save money.</span>';

    const right = document.createElement('div');
    right.className = 'footer-links';
    right.innerHTML = `
      <a href="${sitePrefix}terms.html">Terms</a>
      <a href="${sitePrefix}privacy.html">Privacy</a>
      <a href="${sitePrefix}contact.html">Contact</a>
      <a href="${sitePrefix}fr/index.html">FR</a>
      <a href="${sitePrefix}ar/index.html">AR</a>
    `;

    footerNav.append(left, right);
    document.body.appendChild(footerNav);
  }
});
