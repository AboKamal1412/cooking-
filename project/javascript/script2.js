/* ================================================================
   AL-TABIKH — Recipe Page Script
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

  /* ── Toast ──────────────────────────────────────────────────── */
  window.showToast = function(msg, type = 'success') {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = (type === 'success' ? '✅ ' : '❌ ') + msg;
    t.className = `toast ${type}`;
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => t.classList.remove('show'), 3000);
  };

  /* ── Save Recipe ────────────────────────────────────────────── */
  const saveBtn  = document.querySelector('.save-recipe-btn');
  if (saveBtn) {
    const rid = saveBtn.dataset.id;
    let saved = JSON.parse(localStorage.getItem('altabikh-saved') || '[]');
    const isSaved = () => saved.includes(rid);
    const updateUI = () => {
      saveBtn.classList.toggle('saved', isSaved());
      saveBtn.innerHTML = isSaved() ? '❤️ Saved' : '🤍 Save';
    };
    updateUI();
    saveBtn.addEventListener('click', () => {
      saved = isSaved() ? saved.filter(r => r !== rid) : [...saved, rid];
      localStorage.setItem('altabikh-saved', JSON.stringify(saved));
      updateUI();
      showToast(isSaved() ? 'Recipe saved! ❤️' : 'Removed from saved');
    });
  }

  /* ── Cooking Timer ──────────────────────────────────────────── */
  const display  = document.getElementById('timer-display');
  const startBtn = document.getElementById('start-timer');
  const resetBtn = document.getElementById('reset-timer');
  const cookEl   = document.getElementById('cook-time-value');

  if (display && startBtn && resetBtn && cookEl) {
    const cookMins  = parseInt(cookEl.textContent.trim().split('-')[0]) || 20;
    let totalSecs   = cookMins * 60;
    let remaining   = totalSecs;
    let interval    = null;
    let running     = false;

    const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    display.textContent = fmt(remaining);

    const tick = () => {
      if (remaining <= 0) {
        clearInterval(interval); interval = null; running = false;
        display.textContent = 'Done! 🎉';
        display.classList.remove('running'); display.classList.add('done');
        startBtn.textContent = 'Start';
        showToast('Cooking time is up! 🍽️');
        return;
      }
      remaining--;
      display.textContent = fmt(remaining);
    };

    startBtn.addEventListener('click', () => {
      if (running) {
        clearInterval(interval); interval = null; running = false;
        startBtn.textContent = 'Resume';
        display.classList.remove('running');
      } else {
        if (remaining <= 0) return;
        interval = setInterval(tick, 1000); running = true;
        startBtn.textContent = 'Pause';
        display.classList.add('running'); display.classList.remove('done');
      }
    });
    resetBtn.addEventListener('click', () => {
      clearInterval(interval); interval = null; running = false;
      remaining = totalSecs;
      display.textContent = fmt(remaining);
      display.classList.remove('running','done');
      startBtn.textContent = 'Start';
    });
  }

  /* ── Ingredient Checkboxes ──────────────────────────────────── */
  document.querySelectorAll('.ingredients-list li').forEach(li => {
    li.addEventListener('click', () => li.classList.toggle('checked'));
  });

  /* ── Star Rating Picker ─────────────────────────────────────── */
  const starPicks = document.querySelectorAll('.star-pick');
  let selectedRating = 0;

  starPicks.forEach((star, idx) => {
    star.addEventListener('mouseenter', () => starPicks.forEach((s,i) => s.classList.toggle('active', i<=idx)));
    star.addEventListener('mouseleave', () => starPicks.forEach((s,i) => s.classList.toggle('active', i<selectedRating)));
    star.addEventListener('click', () => {
      selectedRating = idx + 1;
      starPicks.forEach((s,i) => s.classList.toggle('active', i < selectedRating));
    });
  });

  /* ── Write Review Toggle ─────────────────────────────────────── */
  const writeBtn   = document.querySelector('.write-review-btn');
  const reviewForm = document.querySelector('.review-form');
  if (writeBtn && reviewForm) {
    writeBtn.addEventListener('click', () => {
      reviewForm.classList.toggle('open');
      if (reviewForm.classList.contains('open')) reviewForm.scrollIntoView({ behavior:'smooth', block:'nearest' });
    });
  }

  /* ── Submit Review ───────────────────────────────────────────── */
  const submitBtn = document.querySelector('.submit-review-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const nameEl = document.getElementById('reviewer-name');
      const textEl = document.getElementById('review-text');
      const name   = nameEl?.value.trim();
      const text   = textEl?.value.trim();
      if (!selectedRating) { showToast('Please select a star rating','error'); return; }
      if (!name)            { showToast('Please enter your name','error'); return; }
      if (!text)            { showToast('Please write your review','error'); return; }

      const recipeId = document.body.dataset.recipe || window.location.pathname;
      const key = 'altabikh-reviews-' + recipeId;
      const reviews = JSON.parse(localStorage.getItem(key) || '[]');
      reviews.unshift({ name, text, rating: selectedRating, date: new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) });
      localStorage.setItem(key, JSON.stringify(reviews));

      if (nameEl) nameEl.value = '';
      if (textEl) textEl.value = '';
      selectedRating = 0;
      starPicks.forEach(s => s.classList.remove('active'));
      if (reviewForm) reviewForm.classList.remove('open');
      showToast('Review submitted! Thank you 🙏');

      renderReviews(recipeId);
      updateRatingSummary(recipeId);
    });
  }

  /* ── Reviews ─────────────────────────────────────────────────── */
  const recipeId = document.body.dataset.recipe || window.location.pathname;
  renderReviews(recipeId);
  updateRatingSummary(recipeId);
});

function renderReviews(recipeId) {
  const list = document.querySelector('.reviews-list');
  if (!list) return;
  const reviews = JSON.parse(localStorage.getItem('altabikh-reviews-' + recipeId) || '[]');
  if (reviews.length === 0) {
    list.innerHTML = '<p style="color:var(--mid-brown);font-size:14px;padding:16px 0;">Be the first to review this recipe!</p>';
    return;
  }
  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-card-header">
        <div class="reviewer-info">
          <div class="reviewer-avatar">${r.name.charAt(0).toUpperCase()}</div>
          <div><div class="reviewer-name">${esc(r.name)}</div><div class="review-date">${r.date}</div></div>
        </div>
        <div class="review-stars">${'⭐'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      </div>
      <p class="review-text">${esc(r.text)}</p>
    </div>`).join('');
}

function updateRatingSummary(recipeId) {
  const reviews = JSON.parse(localStorage.getItem('altabikh-reviews-' + recipeId) || '[]');
  const avgEl   = document.querySelector('.avg-rating-big');
  const countEl = document.querySelector('.avg-count');
  const starsEl = document.querySelector('.avg-stars');
  if (!avgEl || reviews.length === 0) return;
  const avg = reviews.reduce((s,r) => s + r.rating, 0) / reviews.length;
  avgEl.textContent = avg.toFixed(1);
  if (countEl) countEl.textContent = `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
  if (starsEl) starsEl.innerHTML = [1,2,3,4,5].map(i => `<span class="avg-star">${i<=Math.round(avg)?'⭐':'☆'}</span>`).join('');
  [1,2,3,4,5].forEach(n => {
    const bar = document.getElementById(`bar-${n}`);
    if (bar) bar.style.width = `${(reviews.filter(r=>r.rating===n).length / reviews.length)*100}%`;
  });
}

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
