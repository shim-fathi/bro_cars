/* ============================================================
   BRO CARS — Main JavaScript
   Features: Navbar, Scroll Reveal, Car Filter, Form Validation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. NAVBAR ──────────────────────────────────────────── */
  const navbar  = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Scroll state
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile toggle
  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on link click
  navLinks?.querySelectorAll('.nav-link, .btn-nav').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks?.classList.remove('open');
    });
  });

  // Active link detection
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });


  /* ── 2. SCROLL REVEAL ───────────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(delay, 320));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));


  /* ── 3. CAR FILTER ──────────────────────────────────────── */
  const filterBtns = document.getElementById('filterBtns');
  const carsGrid   = document.getElementById('carsGrid');
  const noResults  = document.getElementById('noResults');

  if (filterBtns && carsGrid) {
    filterBtns.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      // Update active state
      filterBtns.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = carsGrid.querySelectorAll('.car-card');
      let visible  = 0;

      cards.forEach(card => {
        const cat = card.dataset.category || '';
        const show = filter === 'all' || cat === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible++;
          // Re-trigger reveal for newly shown cards
          card.classList.remove('visible');
          requestAnimationFrame(() => {
            setTimeout(() => card.classList.add('visible'), 50);
          });
        }
      });

      // No results state
      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    });
  }


  /* ── 4. CONTACT FORM VALIDATION ─────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {

    const validate = (field) => {
      const group = field.closest('.form-group');
      if (!group) return true;

      const val = field.value.trim();
      let ok = true;

      if (field.required && !val) ok = false;

      if (field.type === 'email' && val) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }

      if (field.name === 'fphone' && val) {
        ok = /^[\d\s\+\-\(\)]{7,16}$/.test(val);
      }

      group.classList.toggle('has-error', !ok);
      return ok;
    };

    // Live validation on blur
    contactForm.querySelectorAll('.form-input').forEach(f => {
      f.addEventListener('blur', () => validate(f));
      f.addEventListener('input', () => {
        if (f.closest('.form-group')?.classList.contains('has-error')) {
          validate(f);
        }
      });
    });

    // Submit
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let allOk = true;
      contactForm.querySelectorAll('.form-input').forEach(f => {
        if (!validate(f)) allOk = false;
      });

      if (!allOk) return;

      // Simulate submission
      const submitBtn = contactForm.querySelector('.btn-submit');
      const btnText   = submitBtn?.querySelector('.btn-submit-text');
      const btnLoad   = submitBtn?.querySelector('.btn-submit-loading');

      if (submitBtn) {
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoad) btnLoad.style.display = 'inline';
      }

      setTimeout(() => {
        contactForm.style.display  = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
      }, 1000);
    });
  }


  /* ── 5. LAZY LOAD IMAGES ────────────────────────────────── */
  const lazyImgs = document.querySelectorAll('img[data-src]');
  if (lazyImgs.length) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(img => imgObserver.observe(img));
  }


  /* ── 6. SMOOTH ANCHOR SCROLL ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
