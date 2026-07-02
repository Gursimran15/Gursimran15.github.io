# gursimran15.github.io

Personal academic website of **Gursimran Singh** — Ph.D. student in Computer Science at
Oklahoma State University. Served at <https://gursimran15.github.io>.

Self-contained static site: hand-written HTML/CSS/JS, no frameworks, no build step.
The `.nojekyll` file tells GitHub Pages to serve the files verbatim (no Jekyll processing).

## Structure

```
index.html                    — all site content (single page)
assets/css/style.css          — styles + light/dark theme tokens (CSS variables)
assets/js/main.js             — theme toggle, scroll reveal, nav scrollspy
assets/img/profile.png        — profile photo
assets/img/favicon.svg        — "GS" monogram favicon
assets/Gursimran_Singh_CV.pdf — CV linked from the profile rail
```

## Editing

- **Content** (publications, teaching, projects, etc.): edit the corresponding
  `<section>` in `index.html`. Everything is plain HTML — no templates.
- **Colors/theme**: change the CSS custom properties at the top of
  `assets/css/style.css` (`:root` = light theme, `[data-theme="dark"]` = dark theme).
- **CV**: replace `assets/Gursimran_Singh_CV.pdf` with a new file of the same name.
- **Social links**: edit the `mailto:`, GitHub, and LinkedIn `<a>` tags in the
  profile rail near the top of `index.html`.

## Deploying

Push to the `main` branch of the `Gursimran15.github.io` repository; GitHub Pages
publishes it automatically (Settings → Pages → Deploy from branch `main`, root).
Changes go live within a minute or two.
