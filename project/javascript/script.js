/* ================================================================
   AL-TABIKH — Main Script
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Dark Mode ──────────────────────────────────────────────── */
  const html = document.documentElement;
  html.setAttribute('data-theme', localStorage.getItem('altabikh-theme') || 'light');
  document.querySelectorAll('.dark-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('altabikh-theme', next);
    });
  });

  /* ── Mobile Nav ─────────────────────────────────────────────── */
  const burger   = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open'); navLinks.classList.remove('open');
    }));
  }

  /* ── Sticky Nav shadow ──────────────────────────────────────── */
  const header = document.querySelector('.header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 30));

  /* ── Scroll Reveal ──────────────────────────────────────────── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* ── Smooth Scroll ──────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }
    });
  });

  /* ── Toast ──────────────────────────────────────────────────── */
  window.showToast = function(msg, type = 'success') {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = (type === 'success' ? '✅ ' : '❌ ') + msg;
    t.className = `toast ${type}`;
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => t.classList.remove('show'), 3200);
  };

  /* ── Save Recipes ───────────────────────────────────────────── */
  let saved = JSON.parse(localStorage.getItem('altabikh-saved') || '[]');
  function updateSaveBtns() {
    document.querySelectorAll('.save-btn').forEach(btn => {
      const s = saved.includes(btn.dataset.id);
      btn.classList.toggle('saved', s);
      btn.innerHTML = s ? '❤️' : '🤍';
    });
  }
  updateSaveBtns();
  document.addEventListener('click', e => {
    const btn = e.target.closest('.save-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    saved = saved.includes(id) ? saved.filter(r => r !== id) : [...saved, id];
    localStorage.setItem('altabikh-saved', JSON.stringify(saved));
    updateSaveBtns();
    showToast(saved.includes(id) ? 'Recipe saved! ❤️' : 'Removed from saved');
  });

  /* ── Search & Filter ─────────────────────────────────────────── */
  const searchInput = document.getElementById('search-input');
  const catFilter   = document.getElementById('cat-filter');
  const timeFilter  = document.getElementById('time-filter');
  const noResults   = document.getElementById('no-results');

  function filterRecipes() {
    const q    = (searchInput?.value || '').toLowerCase().trim();
    const cat  = catFilter?.value  || 'all';
    const time = timeFilter?.value || 'all';
    let visible = 0;

    document.querySelectorAll('.menu-item[data-name]').forEach(item => {
      const name = (item.dataset.name || '').toLowerCase();
      const tags = (item.dataset.tags || '').toLowerCase();
      const mins = parseInt(item.dataset.time || '999');

      const matchQ    = !q || name.includes(q) || tags.includes(q);
      const matchCat  = cat === 'all' || tags.includes(cat);
      const matchTime = time === 'all' || (time === '30' && mins <= 30) || (time === '60' && mins <= 60);

      const show = matchQ && matchCat && matchTime;
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Also filter community cards
    document.querySelectorAll('.community-card').forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();
      const matchQ   = !q || name.includes(q) || tags.includes(q);
      const matchCat = cat === 'all' || tags.includes(cat);
      const show = matchQ && matchCat;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }

  if (searchInput) searchInput.addEventListener('input', filterRecipes);
  if (catFilter)   catFilter.addEventListener('change', filterRecipes);
  if (timeFilter)  timeFilter.addEventListener('change', filterRecipes);

  /* ── Category Chips ─────────────────────────────────────────── */
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (catFilter) { catFilter.value = chip.dataset.cat; filterRecipes(); }
    });
  });

  /* ── Contact Form ────────────────────────────────────────────── */
  const form = document.querySelector('.contact-form-el');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.querySelector('input[name="name"]').value;
      if (name) { showToast(`Thanks ${name}! We'll be in touch soon.`); form.reset(); }
    });
  }

  /* ── Active Nav on scroll ───────────────────────────────────── */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  });

  /* ── Load Community Recipes onto homepage ───────────────────── */
  loadCommunityRecipes();
});

/* ── Community Recipes ──────────────────────────────────────── */
function loadCommunityRecipes() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  const recipes = JSON.parse(localStorage.getItem('altabikh-community-recipes') || '[]');
  if (recipes.length === 0) return;

  // Section label
  const label = document.createElement('div');
  label.className = 'recipes-section-label';
  label.innerHTML = '<span>🌟 Community Recipes</span>';
  grid.appendChild(label);

  recipes.forEach(r => {
    const card = document.createElement('div');
    card.className = 'menu-item community-card reveal';
    card.dataset.name = (r.title || '').toLowerCase();
    card.dataset.tags = (r.category + ' ' + (r.tags || []).join(' ')).toLowerCase();
    card.dataset.time = ((parseInt(r.prepTime) || 0) + (parseInt(r.cookTime) || 0)).toString();

    const imgEl = r.imageData
      ? `<img src="${r.imageData}" alt="${escHtml(r.title)}">`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--amber),var(--terracotta));display:flex;align-items:center;justify-content:center;font-size:60px">${getCategoryEmoji(r.category)}</div>`;

    const totalMins = (parseInt(r.prepTime) || 0) + (parseInt(r.cookTime) || 0);
    const timeStr = totalMins ? `${totalMins} min` : '–';
    const author = r.author || 'Community';
    const initials = author.charAt(0).toUpperCase();
    const stars = r.avgRating ? '⭐'.repeat(Math.round(r.avgRating)) : '☆☆☆☆☆';

    card.innerHTML = `
      <div class="menu-item-img-wrap">
        <span class="menu-item-badge community-badge">Community</span>
        <button class="save-btn" data-id="community-${r.id}" aria-label="Save">🤍</button>
        ${imgEl}
      </div>
      <div class="menu-item-body">
        <div class="menu-item-meta">
          <span class="meta-pill">⏱ ${timeStr}</span>
          <span class="meta-pill">👤 ${escHtml(r.servings || '?')} servings</span>
        </div>
        <h3>${escHtml(r.title)}</h3>
        <p>${escHtml(r.description || '')}</p>
      </div>
      <div class="menu-item-footer">
        <div class="author-row">
          <div class="author-avatar">${initials}</div>
          <span class="author-name">${escHtml(author)}</span>
        </div>
        <div class="star-rating">${stars}</div>
      </div>
      <a href="recipe.html?id=${r.id}" class="recipe-link">View Full Recipe →</a>`;

    grid.appendChild(card);

    // Trigger reveal observer
    const obs2 = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs2.unobserve(e.target); } });
    }, { threshold: 0.1 });
    obs2.observe(card);
  });
}

function getCategoryEmoji(cat) {
  const map = { Seafood:'🐟', Chicken:'🍗', Pasta:'🍝', Dessert:'🍰', Vegan:'🥗', Drinks:'☕', Soups:'🍲', Salads:'🥙', Breakfast:'🍳' };
  return map[cat] || '🍽️';
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
