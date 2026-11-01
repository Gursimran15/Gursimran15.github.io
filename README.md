# gursimran15.github.io

Personal research website of **Gursimran Singh**, Ph.D. student in Computer Science at
Oklahoma State University (programmable data-plane security, P4 / Intel Tofino, Internet
measurement). Served at <https://gursimran15.github.io>.

Self-contained static site: hand-written HTML/CSS/JS, no frameworks, no build step.
The `.nojekyll` file tells GitHub Pages to serve the files verbatim (no Jekyll processing).

## Structure

```
index.html                     all site content (single page)
assets/css/style.css           styles, light/dark theme tokens (CSS variables), animations
assets/js/main.js              theme toggle, scroll progress, scroll reveal, nav scrollspy,
                               hero typewriter, count-up stats, constellation canvas,
                               animated P4 pipeline, abstract/BibTeX toggles + copy,
                               live GitHub projects grid
assets/img/profile.jpg         profile photo
assets/img/favicon.svg         "GS" monogram favicon
assets/img/og-card.png         1200x630 preview card for link sharing (Open Graph / Twitter)
assets/Gursimran_Singh_CV.pdf  CV linked from the site (built from cv/)
cv/Gursimran_Singh_CV.tex      LaTeX source of the CV
404.html                       custom not-found page (GitHub Pages serves it automatically)
robots.txt, sitemap.xml        search-engine hints
```

## Sections

Hero with a sliding panel of five animated research scenes (interactive P4 pipeline with
packet counters and stage explainer, in-network collective computation, Internet resilience
under disaster, Internet measurement, security & privacy; tabs, arrows, keyboard, auto-advance,
pause) · at-a-glance stats · on-this-page rail (wide screens) · About · Research (three feature
rows with animated illustrations, plus open directions) · News · Publications (cover tiles,
abstract, BibTeX, plain-text citation) · Experience & education (timeline with monogram tiles) ·
Teaching & mentoring · Service & leadership · Projects & code · Skills · Contact.

All motion respects `prefers-reduced-motion` (animations are replaced by static
illustrations) and pauses when the hero is scrolled out of view or the tab is hidden.

## Editing

- **Content** (publications, teaching, service, news, etc.): edit the corresponding
  `<section>` in `index.html`. Everything is plain HTML, no templates.
- **News**: add a `<li>` at the top of the `#news` list with a `<time datetime="YYYY-MM">`.
- **Publications**: copy a `<li class="pub">` block; give the abstract and BibTeX blocks
  unique ids and point the `data-toggle` / `data-copy` buttons at them.
- **Projects**: the "Projects & code" grid updates itself from the GitHub API at page load
  (public, non-fork repos; handwritten entries in `OVERRIDES` first, then anything pushed
  since `RECENT_CUTOFF`). Edit `OVERRIDES` / `HIDDEN` in `assets/js/main.js`; the static
  cards in `index.html` are only the offline/rate-limit fallback.
- **Hero typewriter phrases**: `PHRASES` in `assets/js/main.js`.
- **Hero scenes**: each `<div class="device-slide">` in `index.html` holds one SVG scene; its
  caption is the matching `<p class="device-info" data-slide="N">`, its tab the matching
  `.device-tab`. Scene animations are CSS keyframes in `assets/css/style.css` (`scene-*`).
- **Cache-busting**: after editing CSS or JS, bump the `?v=` query on the `<link>`/`<script>`
  tags in `index.html` and `404.html` so browsers fetch the new files.
- **Colors/theme**: change the CSS custom properties at the top of
  `assets/css/style.css` (`:root` is the light theme, `[data-theme="dark"]` is dark).
- **CV**: edit `cv/Gursimran_Singh_CV.tex`, build with `pdflatex Gursimran_Singh_CV.tex`
  (run twice so the page total resolves; needs `texlive-latex-extra` and, optionally,
  `tex-gyre` for the Pagella font, otherwise it falls back to Palatino), then copy the PDF
  to `assets/Gursimran_Singh_CV.pdf`.
- **Social links**: the `mailto:`, GitHub, LinkedIn, Google Scholar, and ORCID links appear
  in the hero, the About card, and the Contact section of `index.html`.

## Deploying

Push to the `main` branch of the `Gursimran15.github.io` repository; GitHub Pages
publishes it automatically (Settings > Pages > Deploy from branch `main`, root).
Changes go live within a minute or two.
