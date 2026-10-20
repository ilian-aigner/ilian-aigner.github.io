import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const routes = ['/', '/about/', '/work/', '/work/strk/', '/experience/', '/resume/'];
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
for (const item of ['404.html', 'robots.txt', 'sitemap-index.xml', 'ilian-aigner-resume.pdf', 'ilian-aigner-cv.pdf', 'assets/images/social-preview.png', 'assets/images/travel-coast.jpg', '_astro/Base.CVtFmUFJ.css']) {
  if (!fs.existsSync(path.join(root, item))) throw new Error(`Missing output: ${item}`);
}
const stylesheet = fs.readFileSync(path.join(root, '_astro', 'Base.css'), 'utf8');
for (const match of stylesheet.matchAll(/url\((\/_astro\/[^)]+)\)/g)) {
  if (!fs.existsSync(path.join(root, match[1]))) throw new Error(`Missing stable CSS asset: ${match[1]}`);
}
const home = fs.readFileSync(htmlFor('/'), 'utf8');
const about = fs.readFileSync(htmlFor('/about/'), 'utf8');
const work = fs.readFileSync(htmlFor('/work/'), 'utf8');
const experience = fs.readFileSync(htmlFor('/experience/'), 'utf8');
const resume = fs.readFileSync(htmlFor('/resume/'), 'utf8');
const legacy = fs.readFileSync(htmlFor('/cv/'), 'utf8');
if (!resume.includes('Download PDF') || !resume.includes('Preview the PDF') || !resume.includes('href="/ilian-aigner-resume.pdf"')) throw new Error('Resume must expose the generated PDF');
if (!resume.includes('Email me') || !resume.includes('Connect on LinkedIn')) throw new Error('Resume must expose direct contact options');
if (!legacy.includes('url=/resume/') || !legacy.includes('noindex')) throw new Error('Old CV route must lead to Resume');
if (!home.includes('team discovery effort spanning 80+')) throw new Error('Interview count must be attributed to the team');
if (!home.includes('class="story-chapter founder-story"') || !home.includes('data-journey-label="Building STRK"')) throw new Error('STRK must complete the scrolling story');
if (!home.includes('German') || !home.includes('English') || !home.includes('French') || home.indexOf('German') > home.indexOf('class="story-journey')) throw new Error('Languages must appear early on Home');
if (home.includes('basketball-hamburg-real.jpg') || fs.existsSync(path.join(root, 'assets/images/basketball-hamburg-real.jpg'))) throw new Error('Retired basketball photo must be removed');
if (about.includes('Lerner Sales Competition') || about.includes('Horbach')) throw new Error('About should stay personal, not repeat Work');
if (experience.includes('Top 20') || experience.includes('German · English · French')) throw new Error('Experience should focus on roles and education');
if (!work.includes('Top 20 of 122') || !work.includes('Read the STRK case study')) throw new Error('Work opening must show evidence and a case-study action');
for (const [name, text] of [['home', home], ['resume', resume]]) {
  if (!text.includes('Fall 2028')) throw new Error(`${name}: wrong graduation date`);
  if (!text.includes('80+')) throw new Error(`${name}: missing team discovery figure`);
  if (!text.includes('Top 20')) throw new Error(`${name}: missing competition result`);
}
if (!experience.includes('Fall 2028')) throw new Error('Experience: wrong graduation date');
console.log(`${routes.length} routes, ${checks} internal links/assets, and key facts checked`);
