/* ============================================
   THE AWAKE CLUB — script.js  v1.2
   Changes:
   - Quiz: 5-option scoring, progress bar,
     question-by-question UX, richer results
   - Email: consistent handler with form IDs
   - Nav: same as v1.1
   - Blog filter, checklist, timer: same as v1.1
   ============================================ */

(function () {
  'use strict';

  /* ============================================================
     MOBILE NAV
     ============================================================ */
  var toggle    = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.nav-mobile');

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    var spans = toggle ? toggle.querySelectorAll('span') : [];
    if (spans[0]) { spans[0].style.transform = ''; spans[1].style.opacity = ''; spans[2].style.transform = ''; }
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      var spans = toggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(4.5px, 4.5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(4.5px, -4.5px)';
        document.body.style.overflow = 'hidden';
      } else {
        closeNav();
      }
    });
    mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('click', function (e) {
      if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && !toggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  /* ============================================================
     ACTIVE NAV LINK
     ============================================================ */
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

  /* ============================================================
     SCROLL: NAV BACKGROUND
     ============================================================ */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.background = window.scrollY > 60 ? 'rgba(12,12,12,0.98)' : 'rgba(12,12,12,0.93)';
    }, { passive: true });
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (revealEls.length) {
      var rs = document.createElement('style');
      rs.textContent =
        '[data-reveal]{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease}' +
        '[data-reveal].revealed{opacity:1;transform:translateY(0)}' +
        '[data-reveal][data-delay="1"]{transition-delay:.1s}' +
        '[data-reveal][data-delay="2"]{transition-delay:.2s}' +
        '[data-reveal][data-delay="3"]{transition-delay:.32s}' +
        '[data-reveal][data-delay="4"]{transition-delay:.44s}';
      document.head.appendChild(rs);
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { revealObs.observe(el); });
    }
  }

  /* ============================================================
     EMAIL FORMS
     ------------------------------------------------------------
     All forms share .email-form class and a data-form-id attr.
     data-form-id values:
       "starter-plan"  — 7-Day Plan capture (index, tools, start-here)
       "join-list"     — Community/join list
       "quiz-result"   — After quiz result
       "daily-growth"  — Blog subscriber

     TODO: When you choose a provider, replace the integration
     block below with the real fetch/POST call. Each form's
     data-form-id can be used to tag subscribers in your provider.

     Example (Buttondown):
       fetch('https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME', {
         method: 'POST', body: new FormData(form)
       });

     Example (ConvertKit):
       fetch('https://api.convertkit.com/v3/forms/FORM_ID/subscribe', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ api_key: 'YOUR_KEY', email: emailVal, tags: [formId] })
       });
     ============================================================ */
  document.querySelectorAll('.email-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input  = form.querySelector('input[type="email"]');
      var btn    = form.querySelector('button[type="submit"]');
      var formId = form.dataset.formId || 'general';
      if (!input || !input.value.trim()) return;

      /* ---- EMAIL PROVIDER INTEGRATION POINT ----
      fetch('https://YOUR_PROVIDER_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value.trim(), form: formId })
      })
      .then(function() { showSuccess(); })
      .catch(function() { btn.textContent = 'Try Again'; });
      ---- END INTEGRATION POINT ---- */

      // Temporary success state until provider is connected
      showSuccess();

      function showSuccess() {
        btn.textContent = 'You\'re on the list ✓';
        btn.classList.add('sent');
        btn.disabled = true;
        input.value = '';
        input.disabled = true;
      }
    });
  });

  /* ============================================================
     QUIZ — V1.2
     ------------------------------------------------------------
     5 options per question: A(4) B(3) C(2) D(1) E(0/special)
     E is the "night shift / non-traditional schedule" option.

     Scoring:
       A = 4 pts (very locked in)
       B = 3 pts (mostly good, inconsistent)
       C = 2 pts (trying but scattered)
       D = 1 pt  (struggling/reactive)
       E = 0 pts + eCount++ (non-traditional schedule flag)

     Result thresholds (8 questions, max 32 pts):
       Early Claimer  : score >= 26
       Builder        : score >= 18
       Reclaimer      : score >= 9
       Night Claimer  : eCount >= 4 (regardless of score)
       Struggling     : score < 9 (less than Reclaimer)
         → same as Reclaimer with different messaging
     ============================================================ */
  var quizForm    = document.getElementById('quiz-form');
  var quizResult  = document.getElementById('quiz-result');
  var progressFill = document.getElementById('quiz-progress-fill');
  var progressText = document.getElementById('quiz-progress-text');

  if (quizForm && quizResult) {
    var questions   = Array.from(quizForm.querySelectorAll('.quiz-question'));
    var totalQ      = questions.length;
    var currentQ    = 0;
    var answers     = {}; // { q1: 'A', q2: 'C', ... }

    // Show only first question
    function showQuestion(idx) {
      questions.forEach(function (q, i) { q.classList.toggle('active', i === idx); });
      updateProgress(idx);

      // Scroll to quiz top on mobile when navigating
      if (window.innerWidth <= 768) {
        var quizSection = document.getElementById('quiz');
        if (quizSection) quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function updateProgress(idx) {
      var pct = Math.round((idx / totalQ) * 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressText) progressText.textContent = (idx + 1) + ' of ' + totalQ;
      // Button visibility is set per-question in HTML; no getElementById needed here.
    }

    // Wire up option selection + navigation buttons directly per question.
    // Event delegation via document.addEventListener + duplicate IDs was the bug:
    // getElementById always returned Q1's buttons, leaving Q2+ buttons unmanaged.
    questions.forEach(function (q, qIdx) {
      var opts = q.querySelectorAll('.quiz-option');
      var name = q.dataset.name;
      opts.forEach(function (opt) {
        opt.addEventListener('click', function () {
          opts.forEach(function (o) { o.classList.remove('selected'); });
          opt.classList.add('selected');
          var radio = opt.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          if (name) answers[name] = radio ? radio.value : '';
        });
      });

      // Direct Next listener scoped to this question's div
      var nextBtn = q.querySelector('button.quiz-nav-next[type="button"]');
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          var radios   = q.querySelectorAll('input[type="radio"]');
          var answered = Array.from(radios).some(function (r) { return r.checked; });
          if (!answered) {
            q.style.borderColor = 'var(--orange)';
            setTimeout(function () { q.style.borderColor = ''; }, 1200);
            return;
          }
          currentQ = qIdx + 1;
          showQuestion(currentQ);
        });
      }

      // Direct Back listener scoped to this question's div
      var backBtn = q.querySelector('button.quiz-nav-back');
      if (backBtn) {
        backBtn.addEventListener('click', function () {
          if (qIdx > 0) { currentQ = qIdx - 1; showQuestion(currentQ); }
        });
      }
    });

    // Submit
    quizForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Collect all answers
      var data   = new FormData(quizForm);
      var score  = 0;
      var eCount = 0;

      for (var pair of data.entries()) {
        var val = pair[1];
        if      (val === 'A') score += 4;
        else if (val === 'B') score += 3;
        else if (val === 'C') score += 2;
        else if (val === 'D') score += 1;
        else if (val === 'E') eCount++;
      }

      // Determine result
      var result;

      if (eCount >= 4) {
        result = {
          type:      'The Night Claimer',
          identity:  'Your schedule runs opposite to the standard world — and that doesn\'t make you behind.',
          window:    'Your 4AM might be 10PM, noon, or a 20-minute window between a night shift and sleep. The clock doesn\'t matter. The claiming does.',
          challenge: 'Building consistent structure without assuming a standard wake/sleep cycle.',
          action:    'Name your window — whatever time it is. Write it down. That\'s your 4AM.',
          link:      'start-here.html',
          linkText:  'Read The Awake Code'
        };
      } else if (score >= 26) {
        result = {
          type:      'The Early Claimer',
          identity:  'You already have the instinct. The window exists — you just need to protect it.',
          window:    'You\'re likely up before most. The morning feels like yours. The risk is slow drift — the small habits that start eating the edges.',
          challenge: 'Protecting your window from creep: the phone that comes out a little earlier each week, the late nights that shorten it.',
          action:    'Define what your Claim block is for — and write what is off-limits during it.',
          link:      'tools.html',
          linkText:  'Explore Tools'
        };
      } else if (score >= 18) {
        result = {
          type:      'The Builder',
          identity:  'You know what you want. The gap between intention and consistency is structure, not willpower.',
          window:    'You\'ve had good mornings. You know what they feel like. You just haven\'t made them repeatable yet.',
          challenge: 'Bridging the gap between "I\'ll start properly tomorrow" and doing something imperfect today.',
          action:    'Start the 7-Day Plan. It\'s built for the exact gap you\'re in.',
          link:      'tools.html',
          linkText:  'Get the 7-Day Plan'
        };
      } else {
        result = {
          type:      'The Reclaimer',
          identity:  'Life has a real claim on your time right now. You\'re not behind — you\'re working with harder constraints.',
          window:    'Your 4AM isn\'t about optimization. It\'s about finding any 15–20 minutes that belong to you before the world takes over. That window exists. It just needs to be found.',
          challenge: 'Lowering the bar enough to actually start. Not a perfect routine — any routine.',
          action:    'Try Days 1–3 of the Starter Plan. No equipment required. Under 20 minutes each day.',
          link:      'tools.html',
          linkText:  'Get the 7-Day Plan'
        };
      }

      // Render result
      quizResult.innerHTML =
        '<div class="quiz-result-card">' +
          '<p class="quiz-result-type">Your Result</p>' +
          '<h2 class="quiz-result-name">' + result.type + '</h2>' +
          '<p class="quiz-result-tagline">' + result.identity + '</p>' +
          '<p class="quiz-result-body">' + result.window + '</p>' +
          '<div class="quiz-result-meta">' +
            '<div class="quiz-result-row">' +
              '<span class="quiz-result-row-label">Your challenge</span>' +
              '<span class="quiz-result-row-val">' + result.challenge + '</span>' +
            '</div>' +
            '<div class="quiz-result-row">' +
              '<span class="quiz-result-row-label">First action</span>' +
              '<span class="quiz-result-row-val">' + result.action + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="quiz-result-actions">' +
            '<a href="' + result.link + '" class="btn btn-primary btn-arrow">' + result.linkText + '</a>' +
            '<a href="start-here.html" class="btn btn-ghost">Start Here</a>' +
          '</div>' +
        '</div>';

      quizResult.style.display = 'block';
      quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update progress to 100%
      if (progressFill) progressFill.style.width = '100%';
      if (progressText) progressText.textContent = 'Done';
    });

    // Init
    showQuestion(0);
  }

  /* ============================================================
     BLOG CATEGORY FILTER
     ============================================================ */
  var catTabs    = document.querySelectorAll('.category-tab');
  var articleCards = document.querySelectorAll('.article-card[data-cat]');

  if (catTabs.length && articleCards.length) {
    catTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        catTabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        var cat = tab.dataset.filter;
        articleCards.forEach(function (card) {
          card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ============================================================
     CHECKLIST (full-row click)
     ============================================================ */
  document.querySelectorAll('.checklist-item').forEach(function (item) {
    var cb = item.querySelector('input[type="checkbox"]');
    if (!cb) return;
    item.addEventListener('click', function (e) {
      if (e.target !== cb) cb.checked = !cb.checked;
      syncCheck(item, cb);
    });
    cb.addEventListener('change', function () { syncCheck(item, cb); });
  });

  function syncCheck(item, cb) {
    item.classList.toggle('checked', cb.checked);
    var all = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    var allDone = Array.prototype.every.call(all, function (c) { return c.checked; });
    var complete = document.getElementById('checklist-complete');
    if (complete) complete.style.display = allDone ? 'block' : 'none';
  }

})(); // end IIFE
