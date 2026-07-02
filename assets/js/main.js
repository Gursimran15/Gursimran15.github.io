/* Gursimran Singh — personal site
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
      } catch (e) { /* storage unavailable — theme still applies for this visit */ }
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
})();
