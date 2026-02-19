/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  PROJECT   :  Dosmac Electrical — Main JavaScript                   ║
 * ║  FILE      :  assets/js/main.js                                     ║
 * ║  VERSION   :  2.0 (Production)                                      ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  TABLE OF CONTENTS                                                   ║
 * ║  1. CONFIG — edit all business values here                          ║
 * ║  2. init() — main entry point, wires up all features                ║
 * ║  3. handleNavbarScroll() — solid bg after 80px scroll               ║
 * ║  4. initMobileMenu() — hamburger open/close                         ║
 * ║  5. initSmoothScroll() — anchor links with navbar offset            ║
 * ║  6. animateCounters() — stats count up on scroll into view          ║
 * ║  7. initScrollAnimations() — fade-in elements on scroll             ║
 * ║  8. filterPortfolio() — tab-based portfolio filtering               ║
 * ║  9. handleContactForm() — validation + submission                   ║
 * ║  10. updateCopyrightYear() — auto-updates footer year               ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  NOTES                                                               ║
 * ║  • Pure vanilla JS — no jQuery, no libraries needed.                ║
 * ║  • All DOM queries are cached to avoid repeated lookups.            ║
 * ║  • Intersection Observer used for scroll triggers (better than      ║
 * ║    scroll event listeners — no performance jank).                   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

'use strict'; // Catches common mistakes (undeclared variables etc.)


/* ═══════════════════════════════════════════════════════════════
   1. CONFIG — Business values that may need editing
   ───────────────────────────────────────────────────────────────
   All editable values are centralised here so you never have
   to dig through logic code to update a phone number or endpoint.
═══════════════════════════════════════════════════════════════ */
const CONFIG = {

  /**
   * WHATSAPP_NUMBER — Your number without spaces, dashes, or +
   * e.g. Zimbabwe +263 717 675 763 → '263717675763'
   * Used to build all WhatsApp links programmatically.
   */
  WHATSAPP_NUMBER: '263717675763',

  /**
   * FORM_ACTION_URL — Where the contact form POSTs to.
   *
   * Option A (recommended): Formspree — https://formspree.io
   *   Free tier: 50 submissions/month. No backend needed.
   *   Steps: 1. Create account  2. Create form  3. Copy endpoint URL
   *   Set this to: 'https://formspree.io/f/YOUR_FORM_ID'
   *
   * Option B: Netlify Forms — set to 'netlify' if hosting on Netlify.
   *   Then add data-netlify="true" to the <form> element in index.html.
   *
   * Option C: Leave empty '' — form falls back to WhatsApp redirect.
   *   User's data is pre-filled in a WhatsApp message instead.
   *   This always works even with no backend.
   */
  FORM_ACTION_URL: '',

  /**
   * WHATSAPP_DEFAULT_MESSAGE — Pre-filled message for floating FAB
   * and hero buttons. Encoded for URL (spaces = %20).
   */
  WHATSAPP_DEFAULT_MESSAGE: 'Hi%20Dosmac!%20I%20need%20a%20quote%20for%20electrical%20work%20at%20my%20property.',

  /**
   * NAVBAR_SCROLL_THRESHOLD — how many pixels before navbar
   * changes from transparent to solid dark background.
   */
  NAVBAR_SCROLL_THRESHOLD: 80,

  /**
   * COUNTER_DURATION_MS — total time in milliseconds for
   * the stats counters to count from 0 to their target.
   */
  COUNTER_DURATION_MS: 2000,
};


/* ═══════════════════════════════════════════════════════════════
   2. init() — MAIN ENTRY POINT
   ───────────────────────────────────────────────────────────────
   Called once the DOM is fully loaded.
   Sets up all features in order.
═══════════════════════════════════════════════════════════════ */
function init() {
  handleNavbarScroll();
  initMobileMenu();
  initSmoothScroll();
  animateCounters();
  initScrollAnimations();
  initPortfolioFilter();
  handleContactForm();
  updateCopyrightYear();
}

// Wait for DOM to be ready before running init
document.addEventListener('DOMContentLoaded', init);


/* ═══════════════════════════════════════════════════════════════
   3. handleNavbarScroll()
   ───────────────────────────────────────────────────────────────
   Adds .navbar--scrolled class to the navbar when the user
   scrolls past CONFIG.NAVBAR_SCROLL_THRESHOLD pixels.
   That class (in CSS) applies solid background + blur.
   Uses debounce to avoid firing on every single scroll event.
═══════════════════════════════════════════════════════════════ */
function handleNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNavbar() {
    if (window.scrollY > CONFIG.NAVBAR_SCROLL_THRESHOLD) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  // Run once on load in case page loads mid-scroll (e.g. browser back button)
  updateNavbar();

  // passive: true tells browser this listener won't call preventDefault(),
  // allowing it to optimise scrolling performance (no jank)
  window.addEventListener('scroll', debounce(updateNavbar, 10), { passive: true });
}


/* ═══════════════════════════════════════════════════════════════
   4. initMobileMenu()
   ───────────────────────────────────────────────────────────────
   Handles the hamburger button toggling the mobile nav open/closed.
   Also closes the menu when:
     • A nav link is clicked
     • Escape key is pressed
     • User clicks outside the navbar area
═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const toggle   = document.getElementById('navToggle');
  const menu     = document.getElementById('mobileMenu');
  const navbar   = document.getElementById('navbar');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  function toggleMenu() {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  }

  // Hamburger click
  toggle.addEventListener('click', toggleMenu);

  // Close when any nav link inside the mobile menu is clicked
  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });

  // Close when clicking outside the navbar (on the page content)
  document.addEventListener('click', e => {
    if (navbar && !navbar.contains(e.target) && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}


/* ═══════════════════════════════════════════════════════════════
   5. initSmoothScroll()
   ───────────────────────────────────────────────────────────────
   Intercepts all anchor links (href starting with #) and
   scrolls to the target section with the correct offset for
   the fixed navbar. Native CSS scroll-behavior: smooth is set
   in the stylesheet but this JS version handles the offset.
═══════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');

      // Skip if it's just "#" with no target
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      // Calculate the correct scroll position accounting for fixed navbar height
      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '72'
      );
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   6. animateCounters()
   ───────────────────────────────────────────────────────────────
   Finds all elements with data-target attribute (the stats bar)
   and animates them counting up from 0 to their target value
   when they scroll into the viewport.

   Uses Intersection Observer — far more performant than a
   scroll event listener because the browser handles detection
   natively without blocking the main thread.

   easeOutQuart: starts fast, decelerates as it reaches the end.
   Formula: 1 - (1-t)^4  where t = progress 0→1
═══════════════════════════════════════════════════════════════ */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-item__number[data-target]');
  if (!counters.length) return;

  /**
   * Counts a single element from 0 to its data-target value.
   * @param {HTMLElement} el - The element whose textContent to animate.
   */
  function countUp(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = CONFIG.COUNTER_DURATION_MS;
    let startTime  = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuart easing: fast start, smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);

      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step); // continue animating
      } else {
        el.textContent = target; // ensure final value is exact
      }
    }

    requestAnimationFrame(step);
  }

  // Observe each counter — trigger countUp when it enters the viewport
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.5 } // trigger when 50% of element is visible
  );

  counters.forEach(counter => observer.observe(counter));
}


/* ═══════════════════════════════════════════════════════════════
   7. initScrollAnimations()
   ───────────────────────────────────────────────────────────────
   Adds .fade-in class to key page elements, then uses
   Intersection Observer to add .is-visible (which triggers
   the CSS opacity + translateY transition) when they scroll
   into view.

   CSS for .fade-in and .is-visible is in styles.css section 3.
═══════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  // Elements to animate — add selectors here to animate more elements
  const animatableSelectors = [
    '.service-card',
    '.testimonial-card',
    '.portfolio-item',
    '.trust-pillar',
    '.stat-item',
    '.contact__form-col',
    '.contact__info-col',
  ];

  const elements = document.querySelectorAll(animatableSelectors.join(', '));
  if (!elements.length) return;

  // Apply initial hidden state to each element
  elements.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Small delay so staggered elements don't all pop in at once
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 } // trigger when 12% of element is visible
  );

  elements.forEach(el => observer.observe(el));
}


/* ═══════════════════════════════════════════════════════════════
   8. initPortfolioFilter()
   ───────────────────────────────────────────────────────────────
   Filter tabs control which .portfolio-item elements are shown.
   Each item has a data-category attribute (e.g. "solar").
   Each tab button has a data-filter attribute.

   Clicking a tab:
     1. Marks that tab as active (.portfolio-tab--active)
     2. Shows items whose data-category matches data-filter
     3. Hides all other items (adds .hidden class → display:none in CSS)
     4. "all" filter shows everything

   ARIA: aria-selected updated on tabs for screen readers.
═══════════════════════════════════════════════════════════════ */
function initPortfolioFilter() {
  const tabs  = document.querySelectorAll('.portfolio-tab');
  const items = document.querySelectorAll('.portfolio-item');
  if (!tabs.length || !items.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');

      // Update tab active state + ARIA
      tabs.forEach(t => {
        t.classList.remove('portfolio-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('portfolio-tab--active');
      tab.setAttribute('aria-selected', 'true');

      // Show/hide portfolio items based on filter
      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   9. handleContactForm()
   ───────────────────────────────────────────────────────────────
   Handles the #contactForm:
     a) Validates all required fields client-side
     b) If CONFIG.FORM_ACTION_URL is set → POSTs data as JSON
        and shows success/error feedback
     c) If no endpoint → builds a WhatsApp message from the
        form fields and redirects user to WhatsApp chat.
        This fallback ALWAYS works with zero backend setup.
═══════════════════════════════════════════════════════════════ */
function handleContactForm() {
  const form     = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  /**
   * Validates a single field and shows/clears its error message.
   * @param {string} fieldId  - id of the <input>/<select>
   * @param {string} errorId  - id of the <span class="form-error">
   * @param {string} message  - error text to show if invalid
   * @returns {boolean} - true if field is valid
   */
  function validateField(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (!field || !error) return true;

    const isEmpty = field.value.trim() === '' || field.value === '';
    error.textContent = isEmpty ? message : '';
    field.style.borderColor = isEmpty ? '#FF5555' : '';
    return !isEmpty;
  }

  /**
   * Runs validation on all required form fields.
   * @returns {boolean} - true if all fields are valid
   */
  function validateForm() {
    const nameOk    = validateField('clientName',  'nameError',    'Please enter your name.');
    const phoneOk   = validateField('clientPhone', 'phoneError',   'Please enter your phone number.');
    const serviceOk = validateField('serviceType', 'serviceError', 'Please select a service type.');
    const areaOk    = validateField('clientArea',  'areaError',    'Please enter your area or suburb.');
    return nameOk && phoneOk && serviceOk && areaOk;
  }

  /**
   * Shows a feedback message below the form.
   * @param {string} message - text to display
   * @param {'success'|'error'} type - controls colour via CSS class
   */
  function showFeedback(message, type) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className   = `form-feedback ${type}`;
  }

  /**
   * Falls back to WhatsApp when no form endpoint is configured.
   * Reads the form fields and pre-fills a formatted WhatsApp message.
   */
  function fallbackToWhatsApp() {
    const name    = document.getElementById('clientName')?.value.trim()  || '';
    const phone   = document.getElementById('clientPhone')?.value.trim() || '';
    const service = document.getElementById('serviceType')?.value        || '';
    const area    = document.getElementById('clientArea')?.value.trim()  || '';
    const message = document.getElementById('clientMessage')?.value.trim() || '';

    // Map option values to human-readable service names
    const serviceLabels = {
      'solar':      'Solar Installation',
      'wiring':     'House Wiring / Rewire',
      'industrial': 'Industrial / Commercial',
      'lighting':   'Lighting Installation',
      'ac':         'AC Installation / Repair',
      'db-board':   'DB Board Upgrade',
      'other':      'Other / Not Sure',
    };
    const serviceLabel = serviceLabels[service] || service;

    // Build the WhatsApp message text
    const waText = [
      `Hi Dosmac! I'd like a quote for:`,
      `Service: ${serviceLabel}`,
      `Area: ${area}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      message ? `Details: ${message}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

    showFeedback(
      '✓ Opening WhatsApp with your details pre-filled. We\'ll reply within the hour!',
      'success'
    );

    // Small delay so the success message is visible before redirect
    setTimeout(() => window.open(waUrl, '_blank'), 1500);
  }

  // ── Form submit handler ──
  form.addEventListener('submit', async function (e) {
    e.preventDefault(); // stop default browser form submission

    // Validate first — abort if any required field is empty
    if (!validateForm()) return;

    // Disable submit button to prevent double submission
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    // If no endpoint is configured, fall back to WhatsApp
    if (!CONFIG.FORM_ACTION_URL) {
      fallbackToWhatsApp();
      // Re-enable button after delay
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled   = false;
          submitBtn.innerHTML  = '<i class="fa-solid fa-paper-plane"></i> Send My Enquiry — We\'ll Reply Within 1 Hour';
        }
      }, 3000);
      return;
    }

    // POST to Formspree / configured endpoint
    try {
      const formData = new FormData(form);
      const response = await fetch(CONFIG.FORM_ACTION_URL, {
        method:  'POST',
        body:    formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        // Success: clear form and show confirmation
        form.reset();
        showFeedback(
          '✓ Message sent! We\'ll be in touch within the hour. For urgent jobs call us directly.',
          'success'
        );
      } else {
        // Server returned an error — fall back to WhatsApp
        fallbackToWhatsApp();
      }
    } catch (err) {
      // Network error (no internet etc.) — fall back to WhatsApp
      console.warn('Form submission error, falling back to WhatsApp:', err);
      fallbackToWhatsApp();
    } finally {
      // Re-enable the submit button regardless of outcome
      if (submitBtn) {
        submitBtn.disabled   = false;
        submitBtn.innerHTML  = '<i class="fa-solid fa-paper-plane"></i> Send My Enquiry — We\'ll Reply Within 1 Hour';
      }
    }
  });

  // Clear field error styling when user starts typing in a field
  ['clientName', 'clientPhone', 'serviceType', 'clientArea'].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      const errorId = fieldId.replace('client', '').replace('Type', '').toLowerCase() + 'Error';
      const error   = document.getElementById(
        // Map field IDs to their matching error span IDs
        { clientName: 'nameError', clientPhone: 'phoneError', serviceType: 'serviceError', clientArea: 'areaError' }[fieldId]
      );
      if (error) error.textContent = '';
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   10. updateCopyrightYear()
   ───────────────────────────────────────────────────────────────
   Automatically updates the copyright year in the footer
   to the current year. So you never need to edit it manually.
═══════════════════════════════════════════════════════════════ */
function updateCopyrightYear() {
  const yearEl = document.getElementById('copyrightYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}


/* ═══════════════════════════════════════════════════════════════
   UTILITY: debounce()
   ───────────────────────────────────────────────────────────────
   Limits how often a function can fire. Used on scroll listener
   to prevent it from running hundreds of times per second.

   @param {Function} fn    - function to debounce
   @param {number}   delay - milliseconds to wait
   @returns {Function}     - debounced version of fn
═══════════════════════════════════════════════════════════════ */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
