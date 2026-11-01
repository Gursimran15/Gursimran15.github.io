/* Gursimran Singh · personal research site (design v2)
   Theme toggle, scroll progress, reveal + stagger, nav/rail scrollspy, hero
   typewriter, count-up stats, constellation canvas, interactive P4 pipeline
   (animation, explainer, counters), publication toggles with copy, and the
   live GitHub projects grid. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motionPaused = false;
  var pauseListeners = [];
  var motionBtn = document.getElementById('motion-toggle');
  if (motionBtn && !reduceMotion) {
    motionBtn.removeAttribute('hidden');
    motionBtn.addEventListener('click', function () {
      motionPaused = !motionPaused;
      document.documentElement.classList.toggle('motion-paused', motionPaused);
      motionBtn.setAttribute('aria-pressed', motionPaused ? 'true' : 'false');
      motionBtn.textContent = motionPaused ? 'Resume' : 'Pause';
      pauseListeners.forEach(function (fn) { fn(motionPaused); });
    });
  }

  /* ---------- Theme toggle ---------- */

  var toggle = document.getElementById('theme-toggle');
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function updateToggleLabel() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', 'Switch to ' + (currentTheme() === 'dark' ? 'light' : 'dark') + ' theme');
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
      bar.style.width = (max > 0 ? (h.scrollTop || document.body.scrollTop) / max * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal on scroll, with staggered children ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('.stagger'), function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--d', Math.min(i, 9) * 70 + 'ms');
    });
  });

  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal, .stagger'));
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    // Safety net: anything still hidden after a while becomes visible
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('visible'); }); }, 6000);
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Scrollspy for the header nav and the rail ---------- */

  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"], .rail-list a[href^="#"]'));
  var sections = [];
  spyLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section && sections.indexOf(section) === -1) sections.push(section);
  });
  function setActive(section) {
    var id = '#' + section.id;
    spyLinks.forEach(function (l) {
      var on = l.getAttribute('href') === id;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setActive(entry.target); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Count-up stats ---------- */

  var nums = Array.prototype.slice.call(document.querySelectorAll('.stat-num[data-count]'));
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    el.textContent = '0';
    var start = null, dur = 900;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
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
      setTimeout(countAll, 4000);
    } else { countAll(); }
  }

  /* ---------- Hero constellation canvas ---------- */

  var canvas = document.getElementById('hero-canvas');
  if (canvas && !reduceMotion && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var hero = canvas.parentNode;
    var nodes = [], W = 0, H = 0, dpr = 1, running = false, raf = 0, inView = false;
    var mouse = { x: -1, y: -1 };
    var resize = function () {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(18, Math.min(60, Math.round(W * H / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 1.2 + Math.random() * 1.6 });
    };
    var rgb = function () { return getComputedStyle(root).getPropertyValue('--canvas-node').trim() || '14, 110, 140'; };
    var draw = function () {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      var c = rgb(), link = 120, i, j;
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i]; n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = W + 10; else if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10; else if (n.y > H + 10) n.y = -10;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) for (j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < link) { ctx.strokeStyle = 'rgba(' + c + ',' + (0.16 * (1 - d / link)).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke(); }
      }
      for (i = 0; i < nodes.length; i++) {
        var p = nodes[i], boost = 0;
        if (mouse.x >= 0) { var mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = Math.sqrt(mdx * mdx + mdy * mdy); if (md < 140) boost = (1 - md / 140) * 0.5; }
        ctx.fillStyle = 'rgba(' + c + ',' + (0.35 + boost).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + boost * 1.5, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    var start = function () { if (!running && !motionPaused && inView) { running = true; raf = requestAnimationFrame(draw); } };
    var stop = function () { running = false; if (raf) cancelAnimationFrame(raf); };
    pauseListeners.push(function (paused) { if (paused) stop(); else start(); });
    hero.addEventListener('mousemove', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('mouseleave', function () { mouse.x = -1; mouse.y = -1; });
    window.addEventListener('resize', resize);
    resize();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { entries.forEach(function (e) { inView = e.isIntersecting; if (inView && !document.hidden) start(); else stop(); }); }, { threshold: 0.05 }).observe(hero);
    } else { inView = true; start(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  }

  /* ---------- Interactive P4 pipeline ---------- */

  var pipeControl = null;           // set by the pipeline block; used by the scene slider
  var svg = document.getElementById('pipeline');
  var packetsLayer = document.getElementById('packets');
  var info = document.getElementById('pipe-info');
  var INFO = {
    parser: '<strong>Parser.</strong> Slices header fields out of the packet by offset and length at line rate. It cannot parse free-form payloads such as HTTP, which is why payload inspection in a switch needs workarounds such as recirculate-and-truncate.',
    stage: '<strong>Match-action stage.</strong> Looks a key up in SRAM/TCAM tables and applies a handful of ALU operations. Every pass gets a fixed number of stages, so richer logic has to be spread across stages or across passes.',
    deparser: '<strong>Deparser.</strong> Reassembles the packet and sends it out of a port, mirrors it, or loops it back into the pipeline for another pass.',
    loop: '<strong>Additional processing pass.</strong> Recirculation sends a packet through the pipeline again when one pass is not enough. It buys expressiveness (longer pattern matches, multi-step checks) at the price of pipeline bandwidth.',
    drop: '<strong>Discard.</strong> A packet can be discarded when an applicable verdict is available before release. Enforcement timing depends on the design: some verdicts arrive only after a packet has already been forwarded.',
    memory: '<strong>On-chip memory and per-flow state.</strong> A few MB of SRAM and TCAM shared between forwarding tables, per-flow registers, and whatever a security function needs. State kept across packets of a flow lives here, and this budget is what every in-switch function competes for.'
  };
  var defaultInfo = info ? info.innerHTML : '';

  if (svg && packetsLayer) {
    var NS = 'http://www.w3.org/2000/svg';
    var Y = 190;
    var ROUTES = {
      pass:   [[-12, Y], [712, Y]],
      late:   [[-12, Y], [712, Y]],
      recirc: [[-12, Y], [548, Y], [548, 96], [540, 86], [144, 86], [136, 96], [136, Y], [712, Y]],
      drop:   [[-12, Y], [295, Y], [295, 258]]
    };
    var STAGE_X = { 1: 204, 2: 296, 3: 388, 4: 480 };
    var stages = {};
    Array.prototype.forEach.call(svg.querySelectorAll('.block-stage'), function (g) { stages[g.getAttribute('data-stage')] = g; });

    // explainer: hover / focus / click / keyboard on any "hot" element
    var hots = Array.prototype.slice.call(svg.querySelectorAll('.hot'));
    var pinned = null;
    function show(el) {
      if (!info) return;
      var key = el ? el.getAttribute('data-info') : null;
      hots.forEach(function (h) { h.classList.toggle('active', h === el); });
      info.innerHTML = key && INFO[key] ? INFO[key] : defaultInfo;
    }
    hots.forEach(function (h) {
      h.addEventListener('mouseenter', function () { if (!pinned) show(h); });
      h.addEventListener('mouseleave', function () { if (!pinned) show(null); });
      h.addEventListener('focus', function () { show(h); });
      h.addEventListener('blur', function () { if (pinned !== h) show(pinned); });
      h.addEventListener('click', function () { pinned = (pinned === h) ? null : h; show(pinned || h); if (!pinned) show(null); });
      h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h.click(); } });
    });

    var counters = { pass: document.getElementById('cnt-pass'), recirc: document.getElementById('cnt-recirc'), drop: document.getElementById('cnt-drop'), late: document.getElementById('cnt-late') };
    var counts = { pass: 0, recirc: 0, drop: 0, late: 0 };
    function bump(k) { counts[k]++; if (counters[k]) counters[k].textContent = String(counts[k]); }

    function routeLength(pts) { var L = 0; for (var i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
    function pointAt(pts, dist) {
      for (var i = 1; i < pts.length; i++) {
        var seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (dist <= seg) { var t = seg ? dist / seg : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; }
        dist -= seg;
      }
      var last = pts[pts.length - 1]; return [last[0], last[1]];
    }

    if (reduceMotion) {
      [[18, 'pass'], [146, 'recirc'], [342, 'pass'], [539, 'pass'], [682, 'pass']].forEach(function (p) {
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', p[0]); c.setAttribute('cy', Y); c.setAttribute('r', 6); c.setAttribute('class', 'pk pk-' + p[1]);
        packetsLayer.appendChild(c);
      });
    } else {
      var packets = [], lastSpawn = 0, lastTs = 0, animating = false, pr = 0, pipeInView = false, pipeActive = true;
      var SPEED = 150;
      function spawn(now) {
        var r = Math.random();
        var type = r < 0.5 ? 'pass' : (r < 0.74 ? 'recirc' : (r < 0.88 ? 'drop' : 'late'));
        var el = document.createElementNS(NS, 'circle');
        el.setAttribute('r', type === 'drop' ? 5.5 : 6);
        el.setAttribute('class', 'pk packet pk-' + type);
        packetsLayer.appendChild(el);
        packets.push({ el: el, type: type, dist: 0, len: routeLength(ROUTES[type]), pts: ROUTES[type], hits: {}, loopedBack: false, counted: false, born: now });
      }
      function flash(stage) { var g = stages[stage]; if (!g) return; g.classList.add('hit'); setTimeout(function () { g.classList.remove('hit'); }, 160); }
      function frame(ts) {
        if (!animating) return;
        var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0;
        lastTs = ts;
        if (ts - lastSpawn > 620 && packets.length < 14) { spawn(ts); lastSpawn = ts; }
        for (var i = packets.length - 1; i >= 0; i--) {
          var p = packets[i];
          p.dist += SPEED * dt;
          var pos = pointAt(p.pts, p.dist);
          p.el.setAttribute('cx', pos[0].toFixed(1)); p.el.setAttribute('cy', pos[1].toFixed(1));
          if (Math.abs(pos[1] - Y) < 1) {
            for (var s in STAGE_X) {
              if (!p.hits[s + ':' + p.loopedBack] && Math.abs(pos[0] - STAGE_X[s]) < 4) { p.hits[s + ':' + p.loopedBack] = true; flash(s); }
            }
          }
          if (p.type === 'recirc' && !p.loopedBack && p.dist > 560 + 94 + 400 + 94 + 20) { p.loopedBack = true; p.el.setAttribute('class', 'pk packet pk-pass'); bump('recirc'); }
          if (p.type === 'drop' && pos[1] > Y + 1) { p.el.style.opacity = Math.max(0, 1 - (pos[1] - Y) / 70).toFixed(2); }
          if (p.dist >= p.len) {
            if (!p.counted) { p.counted = true; bump(p.type === 'drop' ? 'drop' : (p.type === 'late' ? 'late' : 'pass')); }
            packetsLayer.removeChild(p.el); packets.splice(i, 1);
          }
        }
        pr = requestAnimationFrame(frame);
      }
      var startPipe = function () { if (!animating && !motionPaused && pipeInView && pipeActive) { animating = true; lastTs = 0; pr = requestAnimationFrame(frame); } };
      pipeControl = { setActive: function (on) { pipeActive = on; if (on) startPipe(); else stopPipe(); } };
      var stopPipe = function () { animating = false; if (pr) cancelAnimationFrame(pr); };
      pauseListeners.push(function (paused) { if (paused) stopPipe(); else startPipe(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) { entries.forEach(function (e) { pipeInView = e.isIntersecting; if (pipeInView && !document.hidden) startPipe(); else stopPipe(); }); }, { threshold: 0.1 }).observe(svg);
      } else { pipeInView = true; startPipe(); }
      document.addEventListener('visibilitychange', function () { if (document.hidden) stopPipe(); else startPipe(); });
    }
  }

  /* ---------- Scene slider in the hero panel ---------- */

  var device = document.getElementById('device');
  if (device) {
    var slides = Array.prototype.slice.call(device.querySelectorAll('.device-slide'));
    var tabs = Array.prototype.slice.call(device.querySelectorAll('.device-tab'));
    var infos = Array.prototype.slice.call(device.querySelectorAll('.device-info'));
    var countersRow = device.querySelector('.device-counters');
    var titleEl = document.getElementById('device-title');
    var cur = 0, autoTimer = 0, AUTO_MS = 9000, engaged = false, deviceInView = false;

    function render(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (sl, i) {
        sl.classList.toggle('is-active', i === cur);
        sl.classList.toggle('is-left', i < cur);
        sl.classList.toggle('is-right', i > cur);
        if (i === cur) sl.removeAttribute('inert'); else sl.setAttribute('inert', '');
      });
      tabs.forEach(function (t, i) {
        t.setAttribute('aria-selected', i === cur ? 'true' : 'false');
        t.setAttribute('tabindex', i === cur ? '0' : '-1');
      });
      var key = String(cur + 1);
      infos.forEach(function (el) { if (el.getAttribute('data-slide') === key) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); });
      if (countersRow) { if (cur === 0) countersRow.removeAttribute('hidden'); else countersRow.setAttribute('hidden', ''); }
      if (titleEl) titleEl.textContent = slides[cur].getAttribute('data-title') || '';
      if (pipeControl) pipeControl.setActive(cur === 0);
      // restart the active scene's CSS timeline from the beginning
      var active = slides[cur];
      active.classList.add('replay');
      void active.offsetWidth;
      requestAnimationFrame(function () { active.classList.remove('replay'); });
      schedule();
    }
    function schedule() {
      clearTimeout(autoTimer);
      if (reduceMotion || motionPaused || engaged || !deviceInView || document.hidden) return;
      autoTimer = setTimeout(function () { render(cur + 1); }, AUTO_MS);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { render(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          render(cur + (e.key === 'ArrowRight' ? 1 : -1));
          tabs[cur].focus();
        }
      });
    });
    Array.prototype.forEach.call(device.querySelectorAll('.device-arrow'), function (b) {
      b.addEventListener('click', function () { render(cur + parseInt(b.getAttribute('data-dir'), 10)); });
    });
    device.addEventListener('mouseenter', function () { engaged = true; clearTimeout(autoTimer); });
    device.addEventListener('mouseleave', function () { engaged = false; schedule(); });
    device.addEventListener('focusin', function () { engaged = true; clearTimeout(autoTimer); });
    device.addEventListener('focusout', function (e) { if (!device.contains(e.relatedTarget)) { engaged = false; schedule(); } });
    pauseListeners.push(function (paused) { if (paused) clearTimeout(autoTimer); else schedule(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(autoTimer); else schedule(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { deviceInView = e.isIntersecting; if (deviceInView) schedule(); else clearTimeout(autoTimer); });
      }, { threshold: 0.3 }).observe(device);
    } else { deviceInView = true; schedule(); }
  }

  /* ---------- Publication toggles + copy ---------- */

  var toast = document.getElementById('toast');
  var toastTimer = 0;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else { fallbackCopy(text, done); }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { showToast('Select the text and copy it manually'); }
    document.body.removeChild(ta);
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
      if (code) copyText(code.textContent, function () { showToast('BibTeX copied to clipboard'); });
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.copy-text'), function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy-text') || '', function () { showToast('Citation copied to clipboard'); });
    });
  });

  /* ---------- Footer year ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Projects: live from the GitHub API ---------- */

  var grid = document.getElementById('gh-projects');
  var OVERRIDES = {
    'MNC_PA2_PROTOCOLS': { title: 'Reliable transport protocols', desc: 'Alternating-Bit, Go-Back-N, and Selective-Repeat over an unreliable channel.', tag: 'C++' },
    'MNC-PA1-ORIGNAL': { title: 'Multi-client TCP chat', desc: 'Text chat application with a server and multiple clients.', tag: 'C/C++' },
    'Quantitative_Foundations': { title: 'Quantitative Foundations', desc: 'Linear regression, gradient descent, face recognition and detection.', tag: 'MATLAB' },
    'Logistic-Regression-Cancer-Data': { title: 'Logistic regression from scratch', desc: 'Logistic regression on the Wisconsin Diagnostic Breast Cancer dataset, implemented without ML libraries.', tag: 'Jupyter' }
  };
  var ORDER = Object.keys(OVERRIDES);   // strict allowlist: only these repositories are ever shown

  function projectCard(repo) {
    var o = OVERRIDES[repo.name] || {};
    var card = document.createElement('article'); card.className = 'card';
    var h = document.createElement('h3'); h.textContent = o.title || repo.name.replace(/[-_]/g, ' ');
    var tag = o.tag || repo.language;
    if (tag) { var tagEl = document.createElement('span'); tagEl.className = 'tag'; tagEl.textContent = tag; h.appendChild(document.createTextNode(' ')); h.appendChild(tagEl); }
    card.appendChild(h);
    var desc = document.createElement('p'); desc.textContent = o.desc || repo.description || 'View on GitHub.'; card.appendChild(desc);
    var link = document.createElement('a'); link.className = 'card-link'; link.href = repo.html_url; link.target = '_blank'; link.rel = 'noopener';
    link.setAttribute('aria-label', (o.title || repo.name) + ' on GitHub (opens in a new tab)'); link.textContent = 'GitHub →'; card.appendChild(link);
    return card;
  }
  if (grid && 'fetch' in window) {
    var user = grid.getAttribute('data-github-user');
    fetch('https://api.github.com/users/' + user + '/repos?sort=pushed&per_page=100')
      .then(function (res) { if (!res.ok) throw new Error('GitHub API ' + res.status); return res.json(); })
      .then(function (repos) {
        var shown = repos.filter(function (r) { return !r.fork && OVERRIDES.hasOwnProperty(r.name); });
        if (!shown.length) return;
        shown.sort(function (a, b) { return ORDER.indexOf(a.name) - ORDER.indexOf(b.name); });
        grid.textContent = '';
        shown.forEach(function (r, i) { var c = projectCard(r); c.style.setProperty('--d', Math.min(i, 9) * 70 + 'ms'); grid.appendChild(c); });
        grid.classList.add('visible');
      })
      .catch(function () { /* keep the static fallback cards */ });
  }
})();
