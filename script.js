/* ============================================
   THE AWAKE CLUB — script.js  v1.1
   QA fixes: checklist full-row click,
   nav toggle, quiz scoring, blog filter
   ============================================ */

(function () {
  'use strict';

  /* ---- MOBILE NAV TOGGLE ---- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.nav-mobile');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      var spans = toggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(4.5px, 4.5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(4.5px, -4.5px)';
        /* FIX: prevent body scroll while mobile nav is open */
        document.body.style.overflow = 'hidden';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
        document.body.style.overflow = '';
      }
    });

    /* Close nav and restore scroll when a link is tapped */
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        var spans = toggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });

    /* FIX: close on outside tap (tap overlay behind nav on mobile) */
    document.addEventListener('click', function (e) {
      if (
        mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        var spans = toggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
  }

  /* ---- ACTIVE NAV LINK ---- */
  (function () {
    var path = window.location.pathname.replace(/\/$/, '');
    var filename = path.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      var hrefFile = href.replace(/\/$/, '').split('/').pop() || 'index.html';
      if (hrefFile === filename || (filename === '' && hrefFile === 'index.html')) {
        a.classList.add('active');
      }
    });
  })();

  /* ---- SCROLL: NAV BACKGROUND ---- */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.background = window.scrollY > 60
        ? 'rgba(12,12,12,0.98)'
        : 'rgba(12,12,12,0.93)';
    }, { passive: true });
  }

  /* ---- SCROLL REVEAL ---- */
  if ('IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (revealEls.length) {
      var revealStyle = document.createElement('style');
      revealStyle.textContent =
        '[data-reveal]{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease}' +
        '[data-reveal].revealed{opacity:1;transform:translateY(0)}' +
        '[data-reveal][data-delay="1"]{transition-delay:.1s}' +
        '[data-reveal][data-delay="2"]{transition-delay:.2s}' +
        '[data-reveal][data-delay="3"]{transition-delay:.32s}' +
        '[data-reveal][data-delay="4"]{transition-delay:.44s}';
      document.head.appendChild(revealStyle);
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---- EMAIL FORMS
     TODO: Replace the commented block below with your
     email provider endpoint (Mailchimp, Buttondown, ConvertKit)
     ---- */
  document.querySelectorAll('.email-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button');
      if (!input || !input.value.trim()) return;

      /* --- EMAIL PROVIDER INTEGRATION POINT ---
      fetch('https://YOUR_PROVIDER_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value })
      });
      --- END INTEGRATION POINT --- */

      btn.textContent = 'Sent ✓';
      btn.style.background = '#2a8a4a';
      btn.style.color = '#fff';
      input.value = '';
      input.disabled = true;
      btn.disabled = true;
    });
  });

  /* ---- QUIZ (Find Your 4AM) ---- */
  var quizForm = document.getElementById('quiz-form');
  var quizResult = document.getElementById('quiz-result');

  if (quizForm && quizResult) {
    quizForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(quizForm);
      var score = 0;
      var dCount = 0;
      var totalAnswered = 0;

      for (var pair of data.entries()) {
        totalAnswered++;
        if (pair[1] === 'A') score += 3;
        else if (pair[1] === 'B') score += 2;
        else if (pair[1] === 'C') score += 1;
        else if (pair[1] === 'D') dCount++;
      }

      var result;
      if (dCount >= 4) {
        result = {
          type: 'The Night Claimer',
          tagline: 'Your rhythm doesn\'t follow the sun — and it doesn\'t have to.',
          body: 'Your 4AM might be 10PM, midnight, or a window in the afternoon. The Awake Club framework works on any clock. What matters is that you name your window and protect it.',
          challenge: 'Building structure that doesn\'t assume a standard schedule.',
          start: 'The Awake Code'
        };
      } else if (score >= 19) {
        result = {
          type: 'The Early Claimer',
          tagline: 'You already have the instinct. Now build the system around it.',
          body: 'You know what it feels like to own the morning — or you\'re close. Your next move isn\'t finding your 4AM, it\'s protecting what you\'ve already built. The Awake Code turns instinct into a repeatable system.',
          challenge: 'Protecting your window from slow creep.',
          start: 'The Awake Code'
        };
      } else if (score >= 13) {
        result = {
          type: 'The Builder',
          tagline: 'You know what you want. The gap is structure, not motivation.',
          body: 'You\'ve seen what a good morning can do. The problem isn\'t willpower — it\'s that you don\'t have a framework that holds when life gets complicated. The 7-Day Plan gives you that structure.',
          challenge: 'Bridging the gap between "I\'ll start tomorrow" and today.',
          start: '7-Day Starter Plan'
        };
      } else {
        result = {
          type: 'The Reclaimer',
          tagline: 'Life has a real claim on your time right now. Let\'s find your window anyway.',
          body: 'You\'re not behind. You\'re working with harder constraints. Your 4AM isn\'t about optimization — it\'s about finding any 15–20 minutes that belong to you and protecting them.',
          challenge: 'Lowering the bar enough to actually start.',
          start: '7-Day Starter Plan (Days 1–3 require no equipment)'
        };
      }

      quizResult.innerHTML =
        '<div class="quiz-result-card">' +
          '<p class="eyebrow" style="margin-bottom:14px;">Your Result</p>' +
          '<div class="display-md" style="margin-bottom:12px;">' + result.type + '</div>' +
          '<p style="font-family:var(--font-display);font-weight:700;font-size:1.05rem;text-transform:uppercase;letter-spacing:.04em;color:var(--orange);margin-bottom:20px;line-height:1.3;">' + result.tagline + '</p>' +
          '<p class="body-text" style="margin-bottom:18px;">' + result.body + '</p>' +
          '<p style="font-size:.82rem;color:var(--steel);margin-bottom:8px;"><strong style="color:var(--silver);">Your challenge:</strong> ' + result.challenge + '</p>' +
          '<p style="font-size:.82rem;color:var(--steel);margin-bottom:28px;"><strong style="color:var(--silver);">Start here:</strong> ' + result.start + '</p>' +
          '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
            '<a href="tools.html" class="btn btn-primary btn-arrow">Explore Tools</a>' +
            '<a href="start-here.html" class="btn btn-ghost">Start Here</a>' +
          '</div>' +
        '</div>';

      quizResult.style.display = 'block';
      quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---- BLOG CATEGORY FILTER ---- */
  var catTabs = document.querySelectorAll('.category-tab');
  var articleCards = document.querySelectorAll('.article-card[data-cat]');

  if (catTabs.length && articleCards.length) {
    catTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        catTabs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        var cat = tab.dataset.filter;
        articleCards.forEach(function (card) {
          card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ============================================================
     FIX #2 — CHECKLIST: full-row click including checkbox itself
     The original toggleCheck(this) on onclick worked for clicks on
     the label text but the checkbox element itself didn't propagate
     correctly in all browsers. We now use a proper change listener
     on the checkbox and pointer events on the row.
     ============================================================ */
  document.querySelectorAll('.checklist-item').forEach(function (item) {
    var cb = item.querySelector('input[type="checkbox"]');
    if (!cb) return;

    /* Clicking anywhere in the row toggles the checkbox */
    item.addEventListener('click', function (e) {
      /* If click landed directly on checkbox, let the browser handle it
         (it already toggled); just sync the visual state */
      if (e.target !== cb) {
        cb.checked = !cb.checked;
      }
      syncChecklist(item, cb);
    });

    /* Also listen to keyboard/programmatic changes */
    cb.addEventListener('change', function () {
      syncChecklist(item, cb);
    });
  });

  function syncChecklist(item, cb) {
    item.classList.toggle('checked', cb.checked);
    /* Check if all items are complete */
    var all = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    var allChecked = Array.prototype.every.call(all, function (c) { return c.checked; });
    var complete = document.getElementById('checklist-complete');
    if (complete) complete.style.display = allChecked ? 'block' : 'none';
  }

})();
