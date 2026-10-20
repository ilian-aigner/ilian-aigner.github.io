# Ilian Aigner portfolio

Astro source for [ilian-aigner.github.io](https://ilian-aigner.github.io/). The website is static and deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Local development

```sh
npm ci
npm run dev
```

Before publishing:

```sh
npm run build
npm run check
```

Factual profile and résumé data live in `src/data/profile.json`. The STRK narrative is in `src/content/strk.md`; it must remain a public summary, not a copy of private research material. To rebuild the PDF after changing résumé data, run `python3 scripts/build_cv.py` with ReportLab installed. The committed PDF at `public/ilian-aigner-cv.pdf` is served at a stable URL.

The site origin is set in `astro.config.mjs`. Change that value when switching to a custom domain, then update GitHub Pages' domain setting and DNS. The generated canonical URLs, sitemap, structured data, and robots file derive from it.

The prior single-page site is preserved in Git history. The redesign began from commit `89aa09e`, which provides a rollback point.
