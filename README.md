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

Hero with a sliding panel of four animated research scenes (interactive P4 pipeline with
illustrative packet counters and a stage explainer, reliable in-network computation with a
failure-and-recovery sequence, Internet resilience under disruption including an inconclusive
outcome, Internet measurement with an inconclusive verdict; tabs, arrows, and keyboard switch scenes
manually, and a Pause control freezes both the JavaScript and CSS animations). The scenes are labelled as conceptual
illustrations with Published / Ongoing / Industry status badges · at-a-glance stats · on-this-page rail (wide screens) · About · Research (three feature
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
- **Projects**: the systems and security projects are a hand-written list in `index.html`.
  The "Earlier coursework on GitHub" grid refreshes descriptions from the GitHub API at page
  load but is a strict allowlist: only repositories named in `OVERRIDES` in
  `assets/js/main.js` are ever shown. The static cards in `index.html` are the offline fallback.
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
