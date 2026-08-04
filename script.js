/* ============================================
   ZANDF Website — Interactive JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ——— Navbar scroll effect ———
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ——— Mobile nav toggle ———
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ——— Scroll-reveal animations ———
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ——— Counter animation for hero stats ———
  const animateCounter = (element, target, suffix = '') => {
    const duration = 2000;
    const startTime = performance.now();
    const startVal = 0;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startVal + (target - startVal) * eased);
      element.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Observe hero stats section
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    let statsAnimated = false;
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          animateCounter(document.getElementById('stat-projects'), 150, '+');
          animateCounter(document.getElementById('stat-clients'), 80, '+');
          animateCounter(document.getElementById('stat-years'), 8, '+');
        }
      });
    }, { threshold: 0.5 });
    statsObserver.observe(heroStats);
  }

  // ——— Smooth scrolling for all anchor links ———
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ——— Parallax effect on hero background ———
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.05)`;
      }
    }, { passive: true });
  }

  // ——— Tilt effect on service cards ———
  const tiltCards = document.querySelectorAll('.service-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ——— Active nav link highlighting ———
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = 'var(--teal-300)';
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ——— Cursor glow on CTA container ———
  const ctaContainer = document.querySelector('.cta-container');
  if (ctaContainer) {
    ctaContainer.addEventListener('mousemove', (e) => {
      const rect = ctaContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctaContainer.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(45,181,199,0.08), transparent 40%), var(--gradient-card)`;
    });

    ctaContainer.addEventListener('mouseleave', () => {
      ctaContainer.style.background = '';
    });
  }
  // ——— EmailJS contact form (Get in Touch section) ———
  // 1. Create a free account at https://www.emailjs.com
  // 2. Add an Email Service (Gmail, Outlook, etc.) -> get your SERVICE_ID
  // 3. Create an Email Template with variables: from_name, from_email, phone, service, message -> get your TEMPLATE_ID
  // 4. Get your PUBLIC_KEY from Account > General
  // 5. Replace the three placeholders below.
  const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

  if (window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('contact-submit');
    const submitBtnText = submitBtn.querySelector('.btn-text');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      formStatus.textContent = '';
      formStatus.className = 'form-status';
      submitBtn.disabled = true;
      submitBtnText.textContent = 'Sending...';

      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
        .then(() => {
          formStatus.textContent = 'Thanks! Your message has been sent — we\'ll be in touch soon.';
          formStatus.classList.add('success');
          contactForm.reset();
        })
        .catch((error) => {
          formStatus.textContent = 'Something went wrong. Please try again or email us directly.';
          formStatus.classList.add('error');
          console.error('EmailJS error:', error);
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtnText.textContent = 'Send Message';
        });
    });
  }
  // ——— Year auto-update ———
  const yearEl = document.querySelector('.footer-bottom p');
  if (yearEl) {
    yearEl.innerHTML = yearEl.innerHTML.replace('2026', new Date().getFullYear());
  }

});
