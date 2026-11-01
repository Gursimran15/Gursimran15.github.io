/* Gursimran Singh · personal research site
   Theme toggle, scroll progress, scroll reveal, nav scrollspy, hero typewriter,
   count-up stats, hero constellation canvas, animated P4 pipeline, publication
   toggles with BibTeX copy, and the live GitHub projects grid. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      updateToggleLabel();
    });
    updateToggleLabel();
  }

  /* ---------- Scroll progress bar ---------- */

  var bar = document.getElementById('scroll-progress-bar');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

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
    }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Scrollspy for the header nav ---------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  var spyPairs = [];

  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section) spyPairs.push({ link: link, section: section });
  });

  function setActive(section) {
    navLinks.forEach(function (l) { l.classList.remove('active'); l.removeAttribute('aria-current'); });
    spyPairs.forEach(function (pair) {
      if (pair.section === section) {
        pair.link.classList.add('active');
        pair.link.setAttribute('aria-current', 'true');
      }
    });
  }

  if ('IntersectionObserver' in window && spyPairs.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setActive(entry.target); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    spyPairs.forEach(function (pair) { spy.observe(pair.section); });
  }

  /* ---------- Hero typewriter ---------- */

  var typed = document.getElementById('typed');
  var PHRASES = [
    'line-rate deep packet inspection on Intel Tofino',
    'stateful firewalls inside a P4 match-action pipeline',
    'measurement tools that locate Internet censorship',
    'intent that compiles down to programmable hardware',
    'security functions that stay correct under hardware limits'
  ];

  if (typed && !reduceMotion) {
    var pi = 0, ci = PHRASES[0].length, deleting = false, holdUntil = 0;
    typed.textContent = PHRASES[0];
    var tick = function () {
      var now = Date.now();
      if (now < holdUntil) { setTimeout(tick, 60); return; }
      var phrase = PHRASES[pi];
      if (!deleting) {
        ci++;
        typed.textContent = phrase.slice(0, ci);
        if (ci >= phrase.length) { deleting = true; holdUntil = now + 2600; }
        setTimeout(tick, 38);
      } else {
        ci--;
        typed.textContent = phrase.slice(0, ci);
        if (ci <= 0) { deleting = false; pi = (pi + 1) % PHRASES.length; holdUntil = now + 250; }
        setTimeout(tick, 18);
      }
    };
    holdUntil = Date.now() + 2600;
    deleting = true;
    setTimeout(tick, 600);
  }

  /* ---------- Count-up stats ---------- */

  var nums = Array.prototype.slice.call(document.querySelectorAll('.stat-num[data-count]'));
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 900;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (nums.length) {
    var counted = false;
    var countAll = function () { if (counted) return; counted = true; nums.forEach(countUp); };
    if ('IntersectionObserver' in window && !reduceMotion) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { countAll(); cio.disconnect(); } });
      }, { threshold: 0.2 });
      nums.forEach(function (n) { cio.observe(n); });
      // Safety net: never leave the figures at zero (e.g. printing, odd scroll containers)
      setTimeout(countAll, 4000);
    } else {
      countAll();
    }
  }

  /* ---------- Hero constellation canvas ---------- */

  var canvas = document.getElementById('hero-canvas');
  if (canvas && !reduceMotion && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var hero = canvas.parentNode;
    var nodes = [], W = 0, H = 0, dpr = 1, running = false, raf = 0;
    var mouse = { x: -1, y: -1 };

    var resize = function () {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(18, Math.min(60, Math.round(W * H / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 1.2 + Math.random() * 1.6 });
      }
    };

    var rgb = function () {
      return getComputedStyle(root).getPropertyValue('--canvas-node').trim() || '14, 110, 140';
    };

    var draw = function () {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      var c = rgb();
      var link = 120;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = W + 10; else if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10; else if (n.y > H + 10) n.y = -10;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < link) {
            ctx.strokeStyle = 'rgba(' + c + ',' + (0.16 * (1 - d / link)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        var p = nodes[i];
        var boost = 0;
        if (mouse.x >= 0) {
          var mdx = p.x - mouse.x, mdy = p.y - mouse.y;
          var md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < 140) boost = (1 - md / 140) * 0.5;
        }
        ctx.fillStyle = 'rgba(' + c + ',' + (0.35 + boost).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + boost * 1.5, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    var start = function () { if (!running) { running = true; raf = requestAnimationFrame(draw); } };
    var stop = function () { running = false; if (raf) cancelAnimationFrame(raf); };

    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', function () { mouse.x = -1; mouse.y = -1; });

    window.addEventListener('resize', resize);
    resize();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting && !document.hidden) start(); else stop(); });
      }, { threshold: 0.05 }).observe(hero);
    } else { start(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  }

  /* ---------- Animated P4 pipeline (hero) ---------- */

  var svg = document.getElementById('pipeline');
  var packetsLayer = document.getElementById('packets');
  if (svg && packetsLayer) {
    var NS = 'http://www.w3.org/2000/svg';
    var Y = 190;
    var ROUTES = {
      pass:   [[-12, Y], [712, Y]],
      recirc: [[-12, Y], [548, Y], [548, 96], [540, 86], [144, 86], [136, 96], [136, Y], [712, Y]],
      drop:   [[-12, Y], [295, Y], [295, 276]]
    };
    var STAGE_X = { 1: 204, 2: 296, 3: 388, 4: 480 };
    var stages = {};
    Array.prototype.forEach.call(svg.querySelectorAll('.block-stage'), function (g) { stages[g.getAttribute('data-stage')] = g; });

    function routeLength(pts) {
      var L = 0;
      for (var i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      return L;
    }
    function pointAt(pts, dist) {
      for (var i = 1; i < pts.length; i++) {
        var seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (dist <= seg) {
          var t = seg ? dist / seg : 0;
          return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
        }
        dist -= seg;
      }
      var last = pts[pts.length - 1];
      return [last[0], last[1]];
    }

    if (reduceMotion) {
      // Static illustration: a few packets parked along the wire.
      [[18, 'pass'], [146, 'recirc'], [342, 'pass'], [539, 'pass'], [682, 'pass']].forEach(function (p) {
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', p[0]); c.setAttribute('cy', Y); c.setAttribute('r', 6);
        c.setAttribute('class', 'pk pk-' + p[1]);
        packetsLayer.appendChild(c);
      });
    } else {
      var packets = [], lastSpawn = 0, lastTs = 0, animating = false, pr = 0;
      var SPEED = 150; // px per second

      function spawn(now) {
        var r = Math.random();
        var type = r < 0.58 ? 'pass' : (r < 0.84 ? 'recirc' : 'drop');
        var el = document.createElementNS(NS, 'circle');
        el.setAttribute('r', type === 'drop' ? 5.5 : 6);
        el.setAttribute('class', 'pk packet pk-' + type);
        packetsLayer.appendChild(el);
        packets.push({ el: el, type: type, dist: 0, len: routeLength(ROUTES[type]), pts: ROUTES[type], hits: {}, loopedBack: false, born: now });
      }

      function flash(stage) {
        var g = stages[stage];
        if (!g) return;
        g.classList.add('hit');
        setTimeout(function () { g.classList.remove('hit'); }, 160);
      }

      function frame(ts) {
        if (!animating) return;
        var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0;
        lastTs = ts;
        if (ts - lastSpawn > 620 && packets.length < 14) { spawn(ts); lastSpawn = ts; }

        for (var i = packets.length - 1; i >= 0; i--) {
          var p = packets[i];
          p.dist += SPEED * dt;
          var pos = pointAt(p.pts, p.dist);
          p.el.setAttribute('cx', pos[0].toFixed(1));
          p.el.setAttribute('cy', pos[1].toFixed(1));

          // Stage flashes when a packet is on the wire at a stage centre
          if (Math.abs(pos[1] - Y) < 1) {
            for (var s in STAGE_X) {
              if (!p.hits[s + ':' + p.loopedBack] && Math.abs(pos[0] - STAGE_X[s]) < 4) { p.hits[s + ':' + p.loopedBack] = true; flash(s); }
            }
          }
          // A recirculated packet re-enters the parser as "inspected": recolour it
          if (p.type === 'recirc' && !p.loopedBack && pos[1] < Y - 1) { p.el.setAttribute('class', 'pk packet pk-recirc'); }
          if (p.type === 'recirc' && !p.loopedBack && p.dist > 560 + 94 + 400 + 94 + 20) { p.loopedBack = true; p.el.setAttribute('class', 'pk packet pk-pass'); }
          // Dropped packets fade as they fall into the bin
          if (p.type === 'drop' && pos[1] > Y + 1) { p.el.style.opacity = Math.max(0, 1 - (pos[1] - Y) / 80).toFixed(2); }

          if (p.dist >= p.len) { packetsLayer.removeChild(p.el); packets.splice(i, 1); }
        }
        pr = requestAnimationFrame(frame);
      }

      var startPipe = function () { if (!animating) { animating = true; lastTs = 0; pr = requestAnimationFrame(frame); } };
      var stopPipe = function () { animating = false; if (pr) cancelAnimationFrame(pr); };

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting && !document.hidden) startPipe(); else stopPipe(); });
        }, { threshold: 0.1 }).observe(svg);
      } else { startPipe(); }
      document.addEventListener('visibilitychange', function () { if (document.hidden) stopPipe(); else startPipe(); });
    }
  }

  /* ---------- Publication toggles + BibTeX copy ---------- */

  var toast = document.getElementById('toast');
  var toastTimer = 0;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-toggle]'), function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-toggle'));
      if (!target) return;
      var open = target.hasAttribute('hidden');
      if (open) target.removeAttribute('hidden'); else target.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('.copy-bib'), function (btn) {
    btn.addEventListener('click', function () {
      var box = document.getElementById(btn.getAttribute('data-copy'));
      var code = box && box.querySelector('code');
      if (!code) return;
      var text = code.textContent;
      var done = function () { showToast('BibTeX copied to clipboard'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else { fallbackCopy(text, done); }
    });
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { showToast('Select the text and copy it manually'); }
    document.body.removeChild(ta);
  }

  /* ---------- Footer year ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Projects: live from the GitHub API ----------
     Rebuilds the card grid from the user's public repos so the section always
     reflects GitHub. Repos listed in OVERRIDES keep their handwritten titles and
     descriptions and are shown in the order given; any other public, non-fork
     repo pushed since RECENT_CUTOFF appears automatically. If the API is
     unreachable (offline, rate limit), the static cards remain as-is. */

  var grid = document.getElementById('gh-projects');

  var OVERRIDES = {
    'Network-Analysis-Reports': { title: 'Network Analysis Reports', desc: 'Custom VirtualBox network to analyze three malicious packet captures, with technical write-ups and mitigations.' },
    'Malanalysis_tools_and_frameworks': { title: 'Malware-analysis tools & frameworks', desc: 'Malware-analysis frameworks and usage reports.' },
    'MNC_PA2_PROTOCOLS': { title: 'Reliable transport protocols', desc: 'Alternating-Bit, Go-Back-N, and Selective-Repeat over an unreliable channel.', tag: 'C++' },
    'MNC-PA1-ORIGNAL': { title: 'Multi-client TCP chat', desc: 'Text chat application with a server and multiple clients.', tag: 'C/C++' },
    'Quantitative_Foundations': { title: 'Quantitative Foundations', desc: 'Linear regression, gradient descent, face recognition and detection.', tag: 'MATLAB' },
    'Logistic-Regression-Cancer-Data': { title: 'Logistic regression from scratch', desc: 'Logistic regression on the Wisconsin Diagnostic Breast Cancer dataset, implemented without ML libraries.', tag: 'Jupyter' },
    'SysSec': { title: 'Network defense reports', desc: 'Reports from the UBNetDef network-defense course at the University at Buffalo.' }
  };
  var ORDER = Object.keys(OVERRIDES);
  var HIDDEN = ['Gursimran15.github.io', 'gursimran.github.io', 'DeeP4R', 'bfsde', 'coursera-new', 'coursera-test', 'Hello'];
  var RECENT_CUTOFF = '2025-01-01';

  function projectCard(repo) {
    var o = OVERRIDES[repo.name] || {};
    var card = document.createElement('article');
    card.className = 'card';

    var h4 = document.createElement('h3');
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
    link.textContent = 'GitHub →';
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
        shown.sort(function (a, b) {
          var ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name);
          if (ia === -1 && ib === -1) return a.pushed_at < b.pushed_at ? 1 : -1;
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });
        grid.textContent = '';
        shown.forEach(function (r) { grid.appendChild(projectCard(r)); });
      })
      .catch(function () { /* keep the static fallback cards */ });
  }
})();
