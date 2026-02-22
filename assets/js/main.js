/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  PROJECT   :  Dosmac Electrical — Main JavaScript                   ║
 * ║  VERSION   :  3.5 (The "Stay on Page" Edition)                       ║
 * ║  GOAL      :  Ensure site stability on Econet/iOS Safari             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const CONFIG = {
  WHATSAPP_NUMBER: '263717675763',
  FORM_ACTION_URL: '', // Keep empty if you only want WhatsApp fallback for the form
  NAVBAR_SCROLL_THRESHOLD: 80,
  COUNTER_DURATION_MS: 2000,
  FETCH_TIMEOUT_MS: 10000, 
};

/**
 * 1. CRITICAL INITIALIZATION
 * Wrapped in a try/catch to ensure one failing module doesn't kill the whole site.
 */
function init() {
  const modules = [
    handleNavbarScroll,
    initMobileMenu,
    initSmoothScroll,
    animateCounters,
    initScrollAnimations,
    initPortfolioFilter,
    handleContactForm,
    updateCopyrightYear
  ];

  modules.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error(`Module Failed: ${fn.name}`, e);
    }
  });
}

// High-speed execution for Econet
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/**
 * 2. NAVBAR SCROLL
 * Uses a robust check to prevent "flickering" on mobile Safari.
 */
function handleNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const updateNavbar = () => {
    const isScrolled = window.scrollY > CONFIG.NAVBAR_SCROLL_THRESHOLD;
    if (navbar.classList.contains('navbar--scrolled') !== isScrolled) {
      navbar.classList.toggle('navbar--scrolled', isScrolled);
    }
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
}

/**
 * 3. MOBILE MENU
 * Fixed for iPhone "Rubber-banding" and touch events.
 */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const toggleMenu = (e) => {
    if (e) e.preventDefault();
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-open');
    
    // Prevent background scrolling on iOS when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggle.addEventListener('click', toggleMenu);

  // Close menu when clicking a link
  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

/**
 * 4. SMOOTH SCROLL
 * Replaces the jumpy default with a calculated offset.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const navbar = document.getElementById('navbar');
      const offset = navbar ? navbar.offsetHeight : 70;
      const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * 5. CONTACT FORM
 * Only redirects if the network fails. Otherwise, it keeps them on the site.
 */
function handleContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="loader"></span> Connecting...';
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // If no URL is set, we do a "Soft Fallback" to WhatsApp
    if (!CONFIG.FORM_ACTION_URL) {
      const text = `Hi Dosmac! Name: ${data.clientName}. Needs: ${data.serviceType} in ${data.clientArea}.`;
      window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.dataset.originalText;
      }
      return;
    }

    // Try sending via network
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

      const response = await fetch(CONFIG.FORM_ACTION_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(id);

      if (response.ok) {
        form.reset();
        const feedback = document.getElementById('formFeedback');
        if (feedback) feedback.textContent = "Thank you! We've received your inquiry.";
      } else {
        throw new Error();
      }
    } catch (err) {
      // Only now, if the network is dead, do we offer the WhatsApp escape hatch
      console.error("Network too slow, use WhatsApp fallback.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.dataset.originalText;
      }
    }
  });
}

/**
 * 6. ANIMATIONS & UI
 */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-item__number[data-target]');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.getAttribute('data-target');
        const count = () => {
          const current = +el.innerText;
          const inc = target / 40;
          if (current < target) {
            el.innerText = Math.ceil(current + inc);
            setTimeout(count, 30);
          } else {
            el.innerText = target;
          }
        };
        count();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.8 });

  counters.forEach(c => observer.observe(c));
}

function initPortfolioFilter() {
  const tabs = document.querySelectorAll('.portfolio-tab');
  const items = document.querySelectorAll('.portfolio-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');
      tabs.forEach(t => t.classList.remove('portfolio-tab--active'));
      tab.classList.add('portfolio-tab--active');

      items.forEach(item => {
        const cat = item.getAttribute('data-category');
        item.style.display = (filter === 'all' || cat === filter) ? 'block' : 'none';
      });
    });
  });
}

function initScrollAnimations() {
    const elements = document.querySelectorAll('.service-card, .portfolio-item, .trust-pillar');
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}

function updateCopyrightYear() {
  const el = document.getElementById('copyrightYear');
  if (el) el.textContent = new Date().getFullYear();
}