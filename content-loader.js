/* ============================================
   ZANDF — Content Loader
   Applies any content saved from admindashboard.html
   (stored in localStorage) onto index.html.
   Include this BEFORE script.js, right after <body> opens
   or anywhere before </body>.
   ============================================ */

(function () {
  const CONTENT_KEY = 'zandf_content';

  const raw = localStorage.getItem(CONTENT_KEY);
  if (!raw) return; // nothing saved yet — keep the hardcoded HTML as-is

  let content;
  try {
    content = JSON.parse(raw);
  } catch {
    return;
  }

  function setText(id, value) {
    if (value === undefined || value === null || value === '') return;
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Hero
    if (content.hero) {
      setText('hero-gradient-text', content.hero.gradientText);
      setText('hero-description', content.hero.description);
      setText('stat-projects', content.hero.statProjects);
      setText('stat-clients', content.hero.statClients);
      setText('stat-years', content.hero.statYears);
    }

    // About
    if (content.about) {
      setText('about-gradient-text', content.about.gradientText);
      setText('about-subtitle', content.about.subtitle);
    }

    // Services (in DOM order: service-web-store, service-landing-page, service-web-system, service-menu)
    if (Array.isArray(content.services)) {
      const serviceIds = ['service-web-store', 'service-landing-page', 'service-web-system', 'service-menu'];
      serviceIds.forEach((id, i) => {
        const card = document.getElementById(id);
        const data = content.services[i];
        if (!card || !data) return;
        const h3 = card.querySelector('h3');
        const p = card.querySelector('p');
        if (h3 && data.title) h3.textContent = data.title;
        if (p && data.desc) p.textContent = data.desc;
      });
    }

    // Testimonials (testimonial-1, testimonial-2, testimonial-3)
    if (Array.isArray(content.testimonials)) {
      content.testimonials.forEach((data, i) => {
        const card = document.getElementById(`testimonial-${i + 1}`);
        if (!card || !data) return;
        const text = card.querySelector('.testimonial-text');
        const author = card.querySelector('.testimonial-info h4');
        const role = card.querySelector('.testimonial-info p');
        const avatar = card.querySelector('.testimonial-avatar');
        if (text && data.text) text.textContent = `"${data.text}"`;
        if (author && data.author) author.textContent = data.author;
        if (role && data.role) role.textContent = data.role;
        if (avatar && data.author) {
          avatar.textContent = data.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        }
      });
    }

    // Contact info
    if (content.contact) {
      const emailLink = document.getElementById('cta-email');
      const phoneLink = document.getElementById('cta-phone');
      if (emailLink && content.contact.email) {
        emailLink.href = `mailto:${content.contact.email}`;
        // keep the icon, replace only the trailing text node
        emailLink.childNodes[emailLink.childNodes.length - 1].textContent = ' ' + content.contact.email;
      }
      if (phoneLink && content.contact.phone) {
        phoneLink.href = `tel:${content.contact.phone.replace(/\s+/g, '')}`;
        phoneLink.childNodes[phoneLink.childNodes.length - 1].textContent = ' ' + content.contact.phone;
      }
    }
  });
})();
