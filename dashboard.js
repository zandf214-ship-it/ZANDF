/* ============================================
   ZANDF Admin — Login & Dashboard Logic
   ============================================

   ⚠️ IMPORTANT — READ BEFORE USING IN PRODUCTION ⚠️
   The username/password check below runs entirely in the visitor's
   browser. Anyone can open dev tools, view this file, or read
   localStorage/sessionStorage and see the credentials or bypass the
   check. This is fine for a local test/demo, but it is NOT real
   access control. For a real deployment you would need a server
   (or a service like Firebase Auth) to verify the login instead of
   checking it in JavaScript.
   ============================================ */

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '12345';

const AUTH_KEY = 'zandf_admin_session';
const AUTH_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const CONTENT_KEY = 'zandf_content';

/* Default content mirrors what's currently hardcoded in index.html.
   "Reset to Defaults" in the dashboard restores these values, and
   content-loader.js falls back to them if nothing is saved yet. */
const DEFAULT_CONTENT = {
  hero: {
    gradientText: 'Digital Experiences',
    description: "ZANDF delivers premium web solutions — from stunning websites to powerful applications — engineered with precision, designed with passion.",
    statProjects: '150+',
    statClients: '80+',
    statYears: '8+'
  },
  about: {
    gradientText: 'Excellence',
    subtitle: "ZANDF is a forward-thinking web solutions agency dedicated to transforming ideas into powerful digital realities. We combine creativity, engineering rigor, and deep industry insight."
  },
  services: [
    { title: 'Web Store', desc: 'Full-featured online shops with secure checkout, product catalogs, and inventory tools — built to convert visitors into loyal customers.' },
    { title: 'Landing Page', desc: 'High-impact single-page experiences designed to capture attention, communicate your value, and drive sign-ups, sales, or leads.' },
    { title: 'Web System', desc: 'Custom dashboards, admin panels, and business platforms that streamline operations and scale with your workflow.' },
    { title: 'Menu', desc: "Beautiful digital menus for restaurants and cafés — easy to browse, mobile-friendly, and ready for WhatsApp or online ordering." }
  ],
  testimonials: [
    { text: 'ZANDF transformed our outdated website into a modern, high-converting platform. Sales increased by 180% within the first quarter after launch.', author: 'Ahmed Khalil', role: 'CEO, TechVentures Inc.' },
    { text: 'Their team delivered our complex dashboard application on time and under budget. The attention to detail and code quality was exceptional.', author: 'Sara Hassan', role: 'CTO, DataStream Analytics' },
    { text: 'Working with ZANDF was a game-changer for our startup. They understood our vision and built a product that exceeded every expectation.', author: 'Mohamed Rami', role: 'Founder, FinFlow' }
  ],
  contact: {
    email: 'arkal10293@gmail.com',
    phone: '01223285381'
  }
};

/* ---------- Auth helpers (shared by login.html & admindashboard.html) ---------- */

function isAuthenticated() {
  const raw = sessionStorage.getItem(AUTH_KEY);
  if (!raw) return false;
  try {
    const { expires } = JSON.parse(raw);
    if (Date.now() > expires) {
      sessionStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function setAuthenticated() {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({ expires: Date.now() + AUTH_TTL_MS }));
}

function clearAuthenticated() {
  sessionStorage.removeItem(AUTH_KEY);
}

/* ---------- Content storage helpers ---------- */

function loadContent() {
  const raw = localStorage.getItem(CONTENT_KEY);
  if (!raw) return structuredClone(DEFAULT_CONTENT);
  try {
    const parsed = JSON.parse(raw);
    // Shallow-merge with defaults so older saved data won't break new fields
    return {
      hero: { ...DEFAULT_CONTENT.hero, ...(parsed.hero || {}) },
      about: { ...DEFAULT_CONTENT.about, ...(parsed.about || {}) },
      services: Array.isArray(parsed.services) && parsed.services.length === 4 ? parsed.services : structuredClone(DEFAULT_CONTENT.services),
      testimonials: Array.isArray(parsed.testimonials) && parsed.testimonials.length === 3 ? parsed.testimonials : structuredClone(DEFAULT_CONTENT.testimonials),
      contact: { ...DEFAULT_CONTENT.contact, ...(parsed.contact || {}) }
    };
  } catch {
    return structuredClone(DEFAULT_CONTENT);
  }
}

function saveContent(content) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
}

/* ============================================
   LOGIN PAGE LOGIC
   ============================================ */

function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return; // not on the login page

  // Already logged in? Skip straight to the dashboard.
  if (isAuthenticated()) {
    window.location.href = 'admindashboard.html';
    return;
  }

  const statusEl = document.getElementById('loginStatus');
  const submitBtn = document.getElementById('loginSubmit');
  const pwInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePw');

  toggleBtn.addEventListener('click', () => {
    const isPw = pwInput.type === 'password';
    pwInput.type = isPw ? 'text' : 'password';
    toggleBtn.innerHTML = isPw
      ? '<i class="fa-solid fa-eye-slash"></i>'
      : '<i class="fa-solid fa-eye"></i>';
  });

  // Simple client-side throttle after repeated failed attempts.
  let attempts = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = pwInput.value;

    statusEl.textContent = '';
    statusEl.className = 'login-status';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      statusEl.textContent = 'Signed in. Redirecting…';
      statusEl.classList.add('success');
      setAuthenticated();
      submitBtn.disabled = true;
      setTimeout(() => {
        window.location.href = 'admindashboard.html';
      }, 400);
      return;
    }

    attempts += 1;
    statusEl.textContent = attempts >= 3
      ? 'Incorrect username or password. Double-check and try again.'
      : 'Incorrect username or password.';
    statusEl.classList.add('error');
    form.classList.remove('shake');
    void form.offsetWidth; // restart animation
    form.classList.add('shake');
  });
}

/* ============================================
   DASHBOARD PAGE LOGIC
   ============================================ */

function initDashboardPage() {
  const app = document.getElementById('dashboardApp');
  const gate = document.getElementById('authGate');
  if (!app) return; // not on the dashboard page

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  gate.hidden = true;
  app.hidden = false;

  let content = loadContent();

  // ---- Panel switching ----
  const panelInfo = {
    'panel-hero': { title: 'Hero Section', desc: 'Edit the headline visitors see first.' },
    'panel-about': { title: 'About Section', desc: 'Tell visitors who ZANDF is.' },
    'panel-services': { title: 'Services', desc: 'Edit the four service cards.' },
    'panel-testimonials': { title: 'Testimonials', desc: 'Edit client reviews shown on the site.' },
    'panel-contact': { title: 'Contact Info', desc: 'Update the email and phone shown to visitors.' }
  };

  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.dataset.panel;
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
      document.getElementById('panelTitle').textContent = panelInfo[targetId].title;
      document.getElementById('panelDesc').textContent = panelInfo[targetId].desc;
    });
  });

  // ---- Render repeatable fields (services / testimonials) ----
  function renderServiceFields() {
    const wrap = document.getElementById('servicesFields');
    wrap.innerHTML = content.services.map((s, i) => `
      <div class="repeat-card">
        <p class="repeat-card-title">Service ${i + 1}</p>
        <div class="field-group">
          <label for="service_${i}_title">Title</label>
          <input type="text" id="service_${i}_title" maxlength="40" value="${escapeAttr(s.title)}">
        </div>
        <div class="field-group" style="margin-bottom:0">
          <label for="service_${i}_desc">Description</label>
          <textarea id="service_${i}_desc" rows="3" maxlength="220">${escapeHtml(s.desc)}</textarea>
        </div>
      </div>
    `).join('');
  }

  function renderTestimonialFields() {
    const wrap = document.getElementById('testimonialsFields');
    wrap.innerHTML = content.testimonials.map((t, i) => `
      <div class="repeat-card">
        <p class="repeat-card-title">Testimonial ${i + 1}</p>
        <div class="field-group">
          <label for="testi_${i}_text">Quote</label>
          <textarea id="testi_${i}_text" rows="3" maxlength="260">${escapeHtml(t.text)}</textarea>
        </div>
        <div class="field-row" style="grid-template-columns:1fr 1fr;">
          <div class="field-group" style="margin-bottom:0">
            <label for="testi_${i}_author">Author name</label>
            <input type="text" id="testi_${i}_author" maxlength="40" value="${escapeAttr(t.author)}">
          </div>
          <div class="field-group" style="margin-bottom:0">
            <label for="testi_${i}_role">Author role / company</label>
            <input type="text" id="testi_${i}_role" maxlength="50" value="${escapeAttr(t.role)}">
          </div>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str = '') {
    return str.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }
  function escapeAttr(str = '') {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  // ---- Populate all fields from `content` ----
  function populateForm() {
    document.getElementById('hero_gradientText').value = content.hero.gradientText;
    document.getElementById('hero_description').value = content.hero.description;
    document.getElementById('hero_statProjects').value = content.hero.statProjects;
    document.getElementById('hero_statClients').value = content.hero.statClients;
    document.getElementById('hero_statYears').value = content.hero.statYears;

    document.getElementById('about_gradientText').value = content.about.gradientText;
    document.getElementById('about_subtitle').value = content.about.subtitle;

    document.getElementById('contact_email').value = content.contact.email;
    document.getElementById('contact_phone').value = content.contact.phone;

    renderServiceFields();
    renderTestimonialFields();
  }

  // ---- Read all fields back into a content object ----
  function readForm() {
    const services = content.services.map((_, i) => ({
      title: document.getElementById(`service_${i}_title`).value.trim(),
      desc: document.getElementById(`service_${i}_desc`).value.trim()
    }));
    const testimonials = content.testimonials.map((_, i) => ({
      text: document.getElementById(`testi_${i}_text`).value.trim(),
      author: document.getElementById(`testi_${i}_author`).value.trim(),
      role: document.getElementById(`testi_${i}_role`).value.trim()
    }));

    return {
      hero: {
        gradientText: document.getElementById('hero_gradientText').value.trim(),
        description: document.getElementById('hero_description').value.trim(),
        statProjects: document.getElementById('hero_statProjects').value.trim(),
        statClients: document.getElementById('hero_statClients').value.trim(),
        statYears: document.getElementById('hero_statYears').value.trim()
      },
      about: {
        gradientText: document.getElementById('about_gradientText').value.trim(),
        subtitle: document.getElementById('about_subtitle').value.trim()
      },
      services,
      testimonials,
      contact: {
        email: document.getElementById('contact_email').value.trim(),
        phone: document.getElementById('contact_phone').value.trim()
      }
    };
  }

  function showToast(message, isError = false) {
    const toast = document.getElementById('saveToast');
    toast.textContent = message;
    toast.className = 'save-toast' + (isError ? ' error' : '');
    setTimeout(() => { toast.textContent = ''; }, 3500);
  }

  populateForm();

  // ---- Save ----
  document.getElementById('saveBtn').addEventListener('click', () => {
    content = readForm();
    saveContent(content);
    showToast('Changes saved. Open "View Site" (or refresh it) to see them live.');
  });

  // ---- Reset to defaults ----
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all fields to the site\'s original default content? This cannot be undone.')) return;
    content = structuredClone(DEFAULT_CONTENT);
    saveContent(content);
    populateForm();
    showToast('Content reset to defaults.');
  });

  // ---- Logout ----
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearAuthenticated();
    window.location.href = 'login.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initDashboardPage();
});
