/* Gursimran Singh, personal site
   Theme toggle, scroll reveal, and nav scrollspy. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- Theme toggle ---------- */

  var toggle = document.getElementById('theme-toggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function updateToggleLabel() {
    if (!toggle) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) { /* storage unavailable, theme still applies for this visit */ }
      updateToggleLabel();
    });
    updateToggleLabel();
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fade-in on scroll ---------- */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Scrollspy for the header nav ---------- */

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.site-nav a[href^="#"]')
  );
  var spyPairs = [];

  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section) spyPairs.push({ link: link, section: section });
  });

  function setActive(section) {
    navLinks.forEach(function (l) {
      l.classList.remove('active');
      l.removeAttribute('aria-current');
    });
    spyPairs.forEach(function (pair) {
      if (pair.section === section) {
        pair.link.classList.add('active');
        pair.link.setAttribute('aria-current', 'true');
      }
    });
  }

  if ('IntersectionObserver' in window && spyPairs.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target);
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    spyPairs.forEach(function (pair) { spy.observe(pair.section); });
  }

  /* ---------- Projects: live from the GitHub API ----------
     Rebuilds the card grid from the user's public repos so the section
     always reflects the latest state of GitHub. Repos listed in OVERRIDES
     keep their handwritten titles/descriptions; any other public, non-fork
     repo pushed since RECENT_CUTOFF appears automatically. If the API is
     unreachable (offline, rate limit), the static cards remain as-is. */

  var grid = document.getElementById('gh-projects');

  var OVERRIDES = {
    'bfsde': { title: 'bfsde', desc: 'Barefoot/Intel Tofino SDE working files.' },
    'Malanalysis_tools_and_frameworks': { title: 'Malanalysis Tools & Frameworks', desc: 'Malware-analysis frameworks and usage reports.' },
    'Network-Analysis-Reports': { title: 'Network Analysis Reports', desc: 'Custom VirtualBox network to analyze malicious pcaps with technical write-ups and mitigations.' },
    'Quantitative_Foundations': { title: 'Quantitative Foundations', desc: 'Linear regression, gradient descent, face recognition/detection.', tag: 'MATLAB' },
    'Logistic-Regression-Cancer-Data': { title: 'Logistic Regression on Cancer Data', desc: 'Logistic regression from scratch on the Wisconsin Diagnostic Breast Cancer dataset.', tag: 'Jupyter' }
  };
  var HIDDEN = ['Gursimran15.github.io', 'gursimran.github.io', 'DeeP4R'];
  var RECENT_CUTOFF = '2025-01-01';

  function projectCard(repo) {
    var o = OVERRIDES[repo.name] || {};
    var card = document.createElement('article');
    card.className = 'card';

    var h4 = document.createElement('h4');
    h4.textContent = o.title || repo.name.replace(/[-_]/g, ' ');
    var tag = o.tag || repo.language;
    if (tag) {
      var tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      h4.appendChild(document.createTextNode(' '));
      h4.appendChild(tagEl);
    }
    card.appendChild(h4);

    var desc = document.createElement('p');
    desc.textContent = o.desc || repo.description || 'View on GitHub.';
    card.appendChild(desc);

    var link = document.createElement('a');
    link.className = 'card-link';
    link.href = repo.html_url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', (o.title || repo.name) + ' on GitHub (opens in a new tab)');
    link.innerHTML = 'GitHub →';
    card.appendChild(link);

    return card;
  }

  if (grid && 'fetch' in window) {
    var user = grid.getAttribute('data-github-user');
    fetch('https://api.github.com/users/' + user + '/repos?sort=pushed&per_page=100')
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        return res.json();
      })
      .then(function (repos) {
        var shown = repos.filter(function (r) {
          if (r.fork || HIDDEN.indexOf(r.name) !== -1) return false;
          return OVERRIDES.hasOwnProperty(r.name) || r.pushed_at >= RECENT_CUTOFF;
        });
        if (!shown.length) return;
        grid.textContent = '';
        shown.forEach(function (r) { grid.appendChild(projectCard(r)); });
      })
      .catch(function () { /* keep the static fallback cards */ });
  }
})();
