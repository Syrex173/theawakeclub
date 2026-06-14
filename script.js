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
     EMAIL FORMS — Buttondown (live)
     ------------------------------------------------------------
     Forms now submit natively via HTML POST to Buttondown.
     No JavaScript interception needed or wanted — e.preventDefault()
     has been removed so the browser POSTs directly to:
       https://buttondown.com/api/emails/embed-subscribe/theawakeclub

     Each form includes:
       name="email"                  — the subscriber's email
       name="tag"                    — source tag (starter-plan, quiz-result, etc.)
       name="referrer_url"           — the page the form lives on

     Buttondown will redirect to its own confirmation page after submit.
     That redirect is intentional for V1 — no custom success page yet.

     data-form-id values (kept on elements for future analytics):
       "starter-plan"  — index, tools, start-here, find-your-4am (bottom)
       "quiz-result"   — find-your-4am (post-quiz capture)
       "daily-growth"  — daily-growth page
       "join-list"     — community section (future)
     ============================================================ */
  // No JS handler needed — forms POST natively to Buttondown.

  /* ============================================================
     QUIZ — V1.2.1
     ------------------------------------------------------------
     FIXES:
     1. 6 result types (was 4)
     2. Per-answer-type counting (aCount/bCount/cCount/dCount/eCount)
        drives richer result logic
     3. Single shared nav bar (no duplicate IDs) — fixes desktop
        showing all questions and broken button states
     4. Scroll targets the progress bar / nav bar, not quiz section
        top — fixes mobile jump-to-intro bug
     5. Button styling: .quiz-nav-submit class for See My Result
     ------------------------------------------------------------
     5 options per question:
       A = very locked in / already doing well
       B = mostly good, inconsistent
       C = trying but scattered / start-stop
       D = struggling / reactive / phone-pulled
       E = non-traditional schedule / night shift

     Scoring weights:
       A = 4 pts, B = 3 pts, C = 2 pts, D = 1 pt, E = 0 pts

     6 Results (8 questions, max 32 pts):
       Night Claimer       : eCount >= 4
       Early Claimer       : score >= 26
       Builder             : score >= 20
       Drifter             : score < 20 AND dCount >= 3
                             (phone/reactive pattern dominates)
       Restarting Beginner : score < 20 AND cCount >= 3
                             (start-stop pattern dominates)
       Reclaimer           : everything else below Builder
     ============================================================ */
  var quizForm     = document.getElementById('quiz-form');
  var quizResult   = document.getElementById('quiz-result');
  var progressFill = document.getElementById('quiz-progress-fill');
  var progressText = document.getElementById('quiz-progress-text');

  if (quizForm && quizResult) {
    var questions  = Array.from(quizForm.querySelectorAll('.quiz-question'));
    var totalQ     = questions.length;
    var currentQ   = 0;

    // Single shared nav elements (no duplicate IDs)
    var backBtn    = document.getElementById('quiz-back');
    var nextBtn    = document.getElementById('quiz-next');
    var submitBtn  = document.getElementById('quiz-submit');
    var navBar     = document.getElementById('quiz-nav-bar');

    /* ----------------------------------------------------------
       showQuestion(idx)
       Show one question at a time on both desktop and mobile.
       Scroll: targets the progress bar wrapper (sits above the
       question card) so the user sees the question, not the
       section intro or page top.
    ---------------------------------------------------------- */
    function showQuestion(idx) {
      // Hide all, show active
      questions.forEach(function (q, i) {
        q.classList.toggle('active', i === idx);
      });

      updateProgress(idx);

      // Scroll to progress bar — works on both desktop and mobile.
      // Uses the progress wrapper so the nav context is visible.
      // Small offset so top of question is comfortably below the fixed nav.
      var progressWrap = document.querySelector('.quiz-progress-wrap');
      var scrollTarget = progressWrap || navBar;
      if (scrollTarget) {
        var navH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 64;
        var top = scrollTarget.getBoundingClientRect().top
                  + window.pageYOffset
                  - navH - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }

    function updateProgress(idx) {
      var pct = Math.round((idx / totalQ) * 100);
      if (progressFill) {
        progressFill.style.width = pct + '%';
        var bar = progressFill.closest('[role=progressbar]');
        if (bar) bar.setAttribute('aria-valuenow', pct);
      }
      if (progressText) progressText.textContent = (idx + 1) + ' of ' + totalQ;

      // Show/hide Back
      if (backBtn) backBtn.style.display = idx === 0 ? 'none' : '';
      // Show Next or Submit
      var isLast = idx === totalQ - 1;
      if (nextBtn)   nextBtn.style.display   = isLast ? 'none' : '';
      if (submitBtn) submitBtn.style.display = isLast ? ''     : 'none';
    }

    /* Highlight selected option visually */
    questions.forEach(function (q) {
      var opts = q.querySelectorAll('.quiz-option');
      opts.forEach(function (opt) {
        opt.addEventListener('click', function () {
          opts.forEach(function (o) { o.classList.remove('selected'); });
          opt.classList.add('selected');
          var radio = opt.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
        });
      });
    });

    /* Back button */
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (currentQ > 0) { currentQ--; showQuestion(currentQ); }
      });
    }

    /* Next button */
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var current  = questions[currentQ];
        var answered = Array.from(current.querySelectorAll('input[type="radio"]'))
                           .some(function (r) { return r.checked; });
        if (!answered) {
          // Shake the active question border to indicate required
          current.style.borderColor = 'var(--orange)';
          setTimeout(function () { current.style.borderColor = ''; }, 1400);
          return;
        }
        currentQ++;
        showQuestion(currentQ);
      });
    }

    /* Submit */
    quizForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Require answer on last question
      var lastQ    = questions[totalQ - 1];
      var answered = Array.from(lastQ.querySelectorAll('input[type="radio"]'))
                         .some(function (r) { return r.checked; });
      if (!answered) {
        lastQ.style.borderColor = 'var(--orange)';
        setTimeout(function () { lastQ.style.borderColor = ''; }, 1400);
        return;
      }

      // Tally answers by letter
      var data   = new FormData(quizForm);
      var score  = 0;
      var aCount = 0, bCount = 0, cCount = 0, dCount = 0, eCount = 0;

      for (var pair of data.entries()) {
        var val = pair[1];
        if      (val === 'A') { score += 4; aCount++; }
        else if (val === 'B') { score += 3; bCount++; }
        else if (val === 'C') { score += 2; cCount++; }
        else if (val === 'D') { score += 1; dCount++; }
        else if (val === 'E') {             eCount++; }
      }

      /* ----------------------------------------------------------
         RESULT LOGIC — 6 types
         Priority order matters:
         1. Night Claimer  — E-dominant (schedule mismatch)
         2. Early Claimer  — very high score
         3. Builder        — solid score
         4. Drifter        — D-dominant (phone/reactive pattern)
         5. Restarting     — C-dominant (start-stop pattern)
         6. Reclaimer      — everyone else
      ---------------------------------------------------------- */
      var result;

      if (eCount >= 4) {
        /* NIGHT CLAIMER */
        result = {
          type:      'The Night Claimer',
          identity:  'Your schedule runs opposite to the standard world — and that doesn\'t make you behind.',
          window:    'Your 4AM might be 10PM, noon, or a gap between a night shift and sleep. The framework works on any clock. What matters isn\'t the hour — it\'s that you name the window and protect it.',
          challenge: 'Building consistent structure without assuming a standard wake/sleep cycle.',
          action:    'Name your window right now — whatever time it is. Write it down. That\'s your 4AM. Then read The Awake Code.',
          link:      'start-here.html',
          linkText:  'Read The Awake Code'
        };
      } else if (score >= 26) {
        /* EARLY CLAIMER */
        result = {
          type:      'The Early Claimer',
          identity:  'You already have the instinct and the window. Your job is protection, not discovery.',
          window:    'You\'re likely up before most people. The morning feels like yours. The risk is slow creep — the small habits that start eating the edges of what you\'ve built.',
          challenge: 'Protecting your window from drift: the phone that moves earlier each week, the late nights that shorten it.',
          action:    'Define exactly what your Claim block is for — and write what is permanently off-limits during it.',
          link:      'tools.html',
          linkText:  'Explore Free Tools'
        };
      } else if (score >= 20) {
        /* BUILDER */
        result = {
          type:      'The Builder',
          identity:  'You know what a good morning feels like. The gap between knowing and doing it consistently is structure, not willpower.',
          window:    'You\'ve had great mornings. You know what they feel like. You just haven\'t made them repeatable under stress yet.',
          challenge: 'Closing the gap between "I\'ll do it properly starting Monday" and doing something imperfect today.',
          action:    'Start the 7-Day Plan. It\'s built exactly for the gap you\'re in — a bridge from intention to habit.',
          link:      'tools.html',
          linkText:  'Get the 7-Day Plan'
        };
      } else if (dCount >= 3) {
        /* DRIFTER — phone/reactive/distraction-dominant */
        result = {
          type:      'The Drifter',
          identity:  'Your attention is being pulled before you can direct it. This isn\'t a willpower problem — it\'s an environment problem.',
          window:    'Right now the phone and the reactive loop are winning. Your 4AM exists, but it\'s getting claimed by something else before you can use it.',
          challenge: 'Breaking the reflex — the automatic reach for the phone, the immediate reaction to every notification.',
          action:    'Try one thing tomorrow: don\'t touch your phone for the first 15 minutes after waking. That\'s Claim. Start there.',
          link:      'tools.html#daily-checklist',
          linkText:  'Use the Daily Checklist'
        };
      } else if (cCount >= 3) {
        /* RESTARTING BEGINNER — start-stop pattern dominant */
        result = {
          type:      'The Restarting Beginner',
          identity:  'You keep starting, which means you haven\'t given up. The problem isn\'t motivation — it\'s that the bar is set too high.',
          window:    'Every restart is a signal that the habit is trying to form. The problem isn\'t you — it\'s that the structure you\'re trying to build is too ambitious for where you\'re starting.',
          challenge: 'Lowering the bar far enough that you actually stay consistent, instead of setting a perfect standard that breaks every time.',
          action:    'Dress Up. Show Up. That\'s the whole plan for now. Get dressed for movement, then go. Nothing else required yet.',
          link:      'tools.html#starter-plan',
          linkText:  'Get the 7-Day Plan'
        };
      } else {
        /* RECLAIMER — life obligations / time constraints */
        result = {
          type:      'The Reclaimer',
          identity:  'Life has a real claim on your time right now. You\'re not behind — you\'re working with harder constraints than most.',
          window:    'Your 4AM isn\'t about optimization. It\'s about finding any 15–20 minutes that belong to you before the day takes over. That window exists — it just needs to be claimed.',
          challenge: 'Finding even a small protected window inside a schedule that feels like it belongs to everyone else.',
          action:    'Try Days 1–3 of the Starter Plan. No equipment. Under 20 minutes each. That\'s the re-entry point.',
          link:      'tools.html#starter-plan',
          linkText:  'Get the 7-Day Plan'
        };
      }

      /* Render result card */
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

      // Progress to 100%
      if (progressFill) progressFill.style.width = '100%';
      if (progressText) progressText.textContent = 'Done';

      // Hide the nav bar now that we're done
      if (navBar) navBar.style.display = 'none';

      // Scroll to result
      quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Show post-result email capture
      var emailCapture = document.getElementById('quiz-email-capture');
      if (emailCapture) {
        emailCapture.style.display = 'block';
      }
    });

    // Init: show first question, set button states
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
