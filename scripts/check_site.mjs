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
for (const item of ['404.html', 'robots.txt', 'sitemap-index.xml', 'ilian-aigner-cv.pdf', 'assets/images/social-preview.png']) {
  if (!fs.existsSync(path.join(root, item))) throw new Error(`Missing output: ${item}`);
}
const home = fs.readFileSync(htmlFor('/'), 'utf8');
const experience = fs.readFileSync(htmlFor('/experience/'), 'utf8');
const cv = fs.readFileSync(htmlFor('/cv/'), 'utf8');
if (!cv.includes('Open PDF') || !cv.includes('href="/ilian-aigner-cv.pdf"')) throw new Error('CV must expose the generated PDF');
if (!home.includes('team discovery effort spanning 80+')) throw new Error('Interview count must be attributed to the team');
for (const [name, text] of [['home', home], ['experience', experience], ['cv', cv]]) {
  if (!text.includes('Fall 2028')) throw new Error(`${name}: wrong graduation date`);
  if (!text.includes('80+')) throw new Error(`${name}: missing team discovery figure`);
  if (!text.includes('Top 20')) throw new Error(`${name}: missing competition result`);
}
console.log(`${routes.length} routes, ${checks} internal links/assets, and key facts checked`);
