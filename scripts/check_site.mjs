import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const routes = ['/', '/work/', '/work/strk/', '/experience/', '/about/', '/cv/'];
const htmlFor = pathname => path.join(root, pathname, 'index.html');
let checks = 0;
for (const route of routes) {
  const file = htmlFor(route);
  if (!fs.existsSync(file)) throw new Error(`Missing route: ${route}`);
  const html = fs.readFileSync(file, 'utf8');
  if (!/href="\/_astro\/Base\.css\?v=[a-f0-9]{10}"/.test(html)) throw new Error(`Missing versioned stable stylesheet: ${route}`);
  if (/href="\/_astro\/Base\.[\w-]+\.css"/.test(html)) throw new Error(`Hashed stylesheet will break cached HTML: ${route}`);
  if (!/<h1\b/.test(html)) throw new Error(`Missing h1: ${route}`);
  if (!/rel="canonical"/.test(html)) throw new Error(`Missing canonical: ${route}`);
  if (!/application\/ld\+json/.test(html)) throw new Error(`Missing structured data: ${route}`);
  if (!html.includes('class="contact-picker"') || !html.includes('mailto:ilianaigner@gmail.com') || !html.includes('https://www.linkedin.com/in/ilianaigner/')) throw new Error(`Missing contact choices: ${route}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (/^(mailto:|data:|javascript:)/.test(raw)) continue;
    const url = new URL(raw, `https://ilian-aigner.github.io${route}`);
    if (url.origin !== 'https://ilian-aigner.github.io') continue;
    const target = url.pathname.endsWith('/') ? htmlFor(url.pathname) : path.join(root, url.pathname);
    if (!fs.existsSync(target)) throw new Error(`Broken link on ${route}: ${raw}`);
    if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (id && !fs.readFileSync(target, 'utf8').includes(`id="${id}"`)) {
        throw new Error(`Missing anchor on ${route}: ${raw}`);
      }
    }
    checks++;
  }
}
for (const item of ['404.html', 'robots.txt', 'sitemap-index.xml', 'ilian-aigner-cv.pdf', 'assets/images/social-preview.png', '_astro/Base.CVtFmUFJ.css']) {
  if (!fs.existsSync(path.join(root, item))) throw new Error(`Missing output: ${item}`);
}
const stylesheet = fs.readFileSync(path.join(root, '_astro', 'Base.css'), 'utf8');
for (const match of stylesheet.matchAll(/url\((\/_astro\/[^)]+)\)/g)) {
  if (!fs.existsSync(path.join(root, match[1]))) throw new Error(`Missing stable CSS asset: ${match[1]}`);
}
const home = fs.readFileSync(htmlFor('/'), 'utf8');
const work = fs.readFileSync(htmlFor('/work/'), 'utf8');
const experience = fs.readFileSync(htmlFor('/experience/'), 'utf8');
const cv = fs.readFileSync(htmlFor('/cv/'), 'utf8');
if (!cv.includes('Download PDF') || !cv.includes('Preview the PDF') || !cv.includes('href="/ilian-aigner-cv.pdf"')) throw new Error('CV must expose the generated PDF');
if (!cv.includes('Email me') || !cv.includes('Connect on LinkedIn')) throw new Error('CV must expose direct contact options');
if (!home.includes('team discovery effort spanning 80+')) throw new Error('Interview count must be attributed to the team');
if (!home.includes('class="story-chapter founder-story"') || !home.includes('data-journey-label="Building STRK"')) throw new Error('STRK must complete the scrolling story');
if (!work.includes('Top 20 of 122') || !work.includes('Read the STRK case study')) throw new Error('Work opening must show evidence and a case-study action');
for (const [name, text] of [['home', home], ['experience', experience], ['cv', cv]]) {
  if (!text.includes('Fall 2028')) throw new Error(`${name}: wrong graduation date`);
  if (!text.includes('80+')) throw new Error(`${name}: missing team discovery figure`);
  if (!text.includes('Top 20')) throw new Error(`${name}: missing competition result`);
}
console.log(`${routes.length} routes, ${checks} internal links/assets, and key facts checked`);
