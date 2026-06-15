(async function () {
  const topic = new URLSearchParams(location.search).get('topic') || '';
  if (!topic) {
    document.getElementById('study-area').innerHTML = '<p style="color:#c00;padding:24px">Parametro topic mancante nell\'URL.</p>';
    return;
  }

  let QUIZ, contentHtml;
  try {
    const [contentRes, quizRes] = await Promise.all([
      fetch('content/' + topic + '.html'),
      fetch('data/' + topic + '.json'),
    ]);
    if (!contentRes.ok || !quizRes.ok) throw new Error('fetch failed');
    [contentHtml, QUIZ] = await Promise.all([contentRes.text(), quizRes.json()]);
  } catch (e) {
    document.getElementById('study-area').innerHTML = '<p style="color:#c00;padding:24px">Errore nel caricamento del topic: ' + topic + '</p>';
    return;
  }

  document.getElementById('study-area').innerHTML = contentHtml;

  /* ── DOM refs ── */
  function loadState(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; } }
  function saveState(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

  const revealToggle = document.getElementById('reveal-toggle');
  const panel        = document.getElementById('quiz-panel');
  const panelBody    = document.getElementById('panel-body');
  const panelTitle   = document.getElementById('panel-title');
  const panelClose   = document.getElementById('panel-close');
  const panelOpenBtn = document.getElementById('panel-open');

  revealToggle.checked = localStorage.getItem('nautica-reveal') === '1';
  revealToggle.addEventListener('change', () => {
    localStorage.setItem('nautica-reveal', revealToggle.checked ? '1' : '0');
    if (activeSec) renderPanel(activeSec);
  });

  function setPanel(open) {
    panel.classList.toggle('closed', !open);
    panelOpenBtn.style.display = open ? 'none' : 'block';
    localStorage.setItem('nautica-panel', open ? '1' : '0');
  }
  panelClose.addEventListener('click', () => setPanel(false));
  panelOpenBtn.addEventListener('click', () => setPanel(true));
  setPanel(localStorage.getItem('nautica-panel') !== '0');

  /* ── Scroll sync ── */
  let activeSec = null;
  const studyArea   = document.getElementById('study-area');
  const allSections = [...studyArea.querySelectorAll('section[id]')];

  function updateActive() {
    if (studyArea.scrollTop + studyArea.clientHeight >= studyArea.scrollHeight - 60) {
      const lastSec = allSections[allSections.length - 1];
      if (lastSec && lastSec.id !== activeSec) {
        activeSec = lastSec.id;
        renderPanel(activeSec);
      }
      return;
    }
    const areaTop = studyArea.getBoundingClientRect().top;
    const threshold = areaTop + 100;
    let newActive = allSections[0]?.id || null;
    for (const sec of allSections) {
      if (sec.getBoundingClientRect().top <= threshold) newActive = sec.id;
      else break;
    }
    if (newActive && newActive !== activeSec) {
      activeSec = newActive;
      renderPanel(activeSec);
    }
  }

  studyArea.addEventListener('scroll', updateActive, { passive: true });

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderPanel(secId) {
    const questions = QUIZ[secId] || [];
    const sec = document.getElementById(secId);
    const h2  = sec && sec.querySelector('h2');
    if (h2) panelTitle.textContent = h2.textContent.replace(/\(\d+ domande\)/, '').trim();

    const revealed = revealToggle.checked;

    if (!questions.length) {
      panelBody.innerHTML = '<p class="no-quiz">Nessuna domanda associata a questa sezione.</p>';
      return;
    }

    const ans = loadState('nautica-ans');
    const rat = loadState('nautica-rat');

    const countText = questions.length === 1 ? '1 domanda' : questions.length + ' domande';
    panelBody.innerHTML = '<p class="quiz-count">' + countText +
      ' <a class="stats-link" href="statistiche.html">📊 Statistiche</a></p>' +
      questions.map(function (q, qi) {
        const qid     = q.id || '';
        const lastAns = qid ? ans[qid] : null;
        const lastAttr = lastAns != null ? ' data-last="' + (lastAns.c ? '1' : '0') + '"' : '';
        const rating   = qid ? (rat[qid] || '') : '';
        const ratingHtml = qid
          ? '<div class="q-rating"><span class="rating-label">Difficoltà:</span>' +
            [['green', '🟢', 'Facile'], ['yellow', '🟡', 'Media'], ['red', '🔴', 'Difficile']].map(function (rv) {
              return '<button class="rating-btn' + (rating === rv[0] ? ' active' : '') +
                '" data-r="' + rv[0] + '" data-qid="' + qid + '" title="' + rv[2] + '">' + rv[1] + '</button>';
            }).join('') + '</div>'
          : '';
        const resetBtn = qid
          ? '<button class="q-reset" data-qid="' + qid + '" title="Cancella risposta">↺</button>'
          : '';
        return '<div class="quiz-item" data-qi="' + qi + '" data-qid="' + qid + '"' + lastAttr + '>' +
          (q.img ? '<img class="quiz-img" src="' + q.img + '" alt="" data-lightbox>' : '') +
          resetBtn +
          '<div class="quiz-q">' + escHtml(q.q) + '</div>' +
          q.a.map(function (ansText, ai) {
            let cls = 'ans-btn';
            if (revealed) cls += ai === q.c ? ' show-correct' : '';
            const dis = revealed ? ' disabled' : '';
            return '<button class="' + cls + '" data-ai="' + ai + '" data-correct="' + q.c + '"' + dis + '>' + escHtml(ansText) + '</button>';
          }).join('') +
          ratingHtml + '</div>';
      }).join('');

    panelBody.scrollTop = 0;

    if (!revealed) {
      panelBody.querySelectorAll('.quiz-item').forEach(function (item) {
        item.querySelectorAll('.ans-btn').forEach(function (btn) { btn.addEventListener('click', onAnswer); });
      });
    }
    panelBody.querySelectorAll('img[data-lightbox]').forEach(function (img) {
      img.addEventListener('click', function () { openLightbox(img.src); });
    });
    panelBody.querySelectorAll('.rating-btn').forEach(function (btn) {
      btn.addEventListener('click', onRating);
    });
    panelBody.querySelectorAll('.q-reset').forEach(function (btn) {
      btn.addEventListener('click', onResetQuestion);
    });
  }

  function onAnswer(e) {
    const btn  = e.currentTarget;
    const item = btn.closest('.quiz-item');
    if (item.dataset.done) return;
    item.dataset.done = '1';
    const correct   = parseInt(btn.dataset.correct);
    const clicked   = parseInt(btn.dataset.ai);
    const isCorrect = clicked === correct;
    item.querySelectorAll('.ans-btn').forEach(function (b) {
      b.disabled = true;
      const ai = parseInt(b.dataset.ai);
      if (ai === correct)      b.classList.add('show-correct');
      else if (ai === clicked) b.classList.add('show-wrong');
      else                     b.classList.add('show-neutral');
    });
    const qid = item.dataset.qid;
    if (qid) {
      const anss = loadState('nautica-ans');
      anss[qid] = { c: isCorrect, ts: Date.now() };
      saveState('nautica-ans', anss);
      item.dataset.last = isCorrect ? '1' : '0';
    }
  }

  function onResetQuestion(e) {
    const btn  = e.currentTarget;
    const qid  = btn.dataset.qid;
    const item = btn.closest('.quiz-item');
    const anss = loadState('nautica-ans');
    delete anss[qid];
    saveState('nautica-ans', anss);
    delete item.dataset.done;
    delete item.dataset.last;
    item.querySelectorAll('.ans-btn').forEach(function (b) {
      b.disabled = false;
      b.classList.remove('show-correct', 'show-wrong', 'show-neutral');
      b.addEventListener('click', onAnswer);
    });
  }

  function onRating(e) {
    const btn  = e.currentTarget;
    const qid  = btn.dataset.qid;
    const r    = btn.dataset.r;
    const rats = loadState('nautica-rat');
    if (rats[qid] === r) delete rats[qid];
    else rats[qid] = r;
    saveState('nautica-rat', rats);
    const item = btn.closest('.quiz-item');
    item.querySelectorAll('.rating-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.r === rats[qid]);
    });
  }

  /* ── Lightbox ── */
  const overlay    = document.getElementById('fig-overlay');
  const overlayImg = document.getElementById('fig-overlay-img');
  overlay.addEventListener('click', () => overlay.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('open'); });

  function openLightbox(src) { overlayImg.src = src; overlay.classList.add('open'); }

  studyArea.querySelectorAll('.section-fig').forEach(img => {
    const m = img.src.match(/\/(\d+)\.png$/);
    if (m) {
      const badge = document.createElement('span');
      badge.className = 'fig-num';
      badge.textContent = m[1];
      img.parentElement.appendChild(badge);
    }
    img.addEventListener('click', () => openLightbox(img.src));
  });

  /* ── Init ── */
  updateActive();

  /* ── Resize handle ── */
  (function () {
    const handle = document.getElementById('resize-handle');
    let dragging = false, startX = 0, startW = 0;

    const savedW = localStorage.getItem('nautica-panel-w');
    if (savedW && !panel.classList.contains('closed')) panel.style.width = savedW + 'px';

    handle.addEventListener('mousedown', e => {
      if (panel.classList.contains('closed')) return;
      dragging = true; startX = e.clientX; startW = panel.offsetWidth;
      handle.classList.add('dragging');
      document.body.style.cssText += ';cursor:col-resize;user-select:none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const newW = Math.max(200, Math.min(640, startW + (startX - e.clientX)));
      panel.style.width = newW + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('nautica-panel-w', panel.offsetWidth);
    });
  })();
})();
