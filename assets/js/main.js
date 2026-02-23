/* ========================================
   GURUKUL MISSION SCHOOL — Main JS v2.0
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Determine asset path prefix ----
  const depth = getPathDepth();
  const prefix = depth === 0 ? '' : '../'.repeat(depth);

  // ---- Load Header & Footer ----
  loadComponent('site-header', prefix + 'components/header.html', () => {
    initNavigation();
    initStickyHeader();
    setActiveNavLink();
  });
  loadComponent('site-footer', prefix + 'components/footer.html');

  // ---- Init global features ----
  initScrollReveal();
  initBackToTop();
  initCounters();
  initFormValidation();
  initTickerDuplicate();
});

/* ---- Helpers ---- */
function getPathDepth() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(p => p && !p.includes('.'));
  // If in pages/about/xyz.html => depth=2, pages/xyz.html => depth=1, index.html => depth=0
  if (path.includes('/pages/')) {
    const afterPages = path.split('/pages/')[1];
    const subParts = afterPages ? afterPages.split('/').filter(p => p && !p.includes('.')) : [];
    return 1 + subParts.length; // pages/ = 1 + sub-dirs
  }
  return 0;
}

/* ---- Component Loader ---- */
function loadComponent(id, url, callback) {
  const el = document.getElementById(id);
  if (!el) return;
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Component not found');
      return r.text();
    })
    .then(html => {
      // Fix relative paths based on depth
      const depth = getPathDepth();
      const prefix = depth === 0 ? '' : '../'.repeat(depth);
      // Replace href="pages/ and src="assets/ with correct relative paths
      let fixed = html.replace(/href="pages\//g, 'href="' + prefix + 'pages/');
      fixed = fixed.replace(/href="index\.html"/g, 'href="' + prefix + 'index.html"');
      fixed = fixed.replace(/src="assets\//g, 'src="' + prefix + 'assets/');
      fixed = fixed.replace(/href="(#[^"]+)"/g, 'href="' + prefix + 'index.html$1"');
      el.innerHTML = fixed;
      if (callback) callback();
    })
    .catch(() => {
      console.warn(`Could not load component: ${url}`);
    });
}

/* ---- Navigation ---- */
function initNavigation() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('mobileOverlay');

  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle.classList.toggle('active');
      menu.classList.toggle('active');
      overlay && overlay.classList.toggle('active');
      document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
  }

  // Mobile accordion dropdowns
  const dropdownLinks = document.querySelectorAll('.nav-list > li.dropdown > .nav-link');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const parent = link.parentElement;
        const wasOpen = parent.classList.contains('open');
        // Close all
        document.querySelectorAll('.nav-list > li.dropdown').forEach(d => d.classList.remove('open'));
        if (!wasOpen) parent.classList.add('open');
      }
    });
  });

  // Close menu on overlay click
  if (overlay) {
    overlay.addEventListener('click', () => {
      toggle && toggle.classList.remove('active');
      menu && menu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close menu on link click (mobile)
  document.querySelectorAll('.dropdown-menu a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        toggle && toggle.classList.remove('active');
        menu && menu.classList.remove('active');
        overlay && overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

/* ---- Sticky Header ---- */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ---- Active Nav Link ---- */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link, .dropdown-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && currentPath.includes(href.replace(/^\.\.\//, '').replace(/^\.\//,''))) {
      link.classList.add('active');
    }
  });
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ---- Back to Top ---- */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  btn.setAttribute('aria-label', 'Back to top');
  btn.id = 'backToTop';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---- Counter Animation ---- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el, target, suffix) {
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current + suffix;
  }, 25);
}

/* ---- Form Validation ---- */
function initFormValidation() {
  // Admission form
  const admissionForm = document.getElementById('admissionForm');
  if (admissionForm) {
    admissionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(admissionForm);
      let isValid = true;

      // Clear previous errors
      admissionForm.querySelectorAll('.error-msg').forEach(el => el.remove());
      admissionForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      // Validate required fields
      admissionForm.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          const msg = document.createElement('span');
          msg.className = 'error-msg';
          msg.style.cssText = 'color: #C0392B; font-size: 0.78rem; margin-top: 4px; display: block;';
          msg.textContent = 'This field is required';
          field.parentElement.appendChild(msg);
        }
      });

      if (isValid) {
        // Show success
        admissionForm.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <i class="fas fa-check-circle" style="font-size: 4rem; color: #27AE60; margin-bottom: 16px;"></i>
            <h3>Application Submitted Successfully!</h3>
            <p style="margin-top: 12px;">Thank you for applying to Gurukul Mission School. We will contact you shortly regarding the next steps in the admission process.</p>
          </div>
        `;
      }
    });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <i class="fas fa-check-circle" style="font-size: 4rem; color: #27AE60; margin-bottom: 16px;"></i>
          <h3>Message Sent!</h3>
          <p style="margin-top: 12px;">Thank you for contacting us. We will get back to you soon.</p>
        </div>
      `;
    });
  }
}

/* ---- Ticker Duplicate ---- */
function initTickerDuplicate() {
  const tickerContent = document.querySelector('.ticker-content');
  if (!tickerContent) return;
  // Duplicate content for infinite scroll
  const items = tickerContent.innerHTML;
  tickerContent.innerHTML = items + items;
}
