import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve('dist');
const assets = path.join(root, '_astro');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const match = home.match(/href="\/_astro\/(Base\.[\w-]+\.css)"/);
if (!match) throw new Error('Could not find the generated stylesheet in the homepage');
const source = match[1];
if (!fs.existsSync(path.join(assets, source))) throw new Error(`Missing generated stylesheet: ${source}`);
let css = fs.readFileSync(path.join(assets, source), 'utf8');

// GitHub Pages caches HTML across deployments. Keep the CSS and its font URLs
// stable so cached HTML never points at a removed content-hashed asset.
css = css.replace(/\/_astro\/([\w-]+)\.([\w-]+)\.(woff2?)/g, (match, name, hash, extension) => {
  const original = path.join(assets, `${name}.${hash}.${extension}`);
  const stable = path.join(assets, `${name}.${extension}`);
  if (!fs.existsSync(original)) throw new Error(`Missing generated font: ${original}`);
  fs.copyFileSync(original, stable);
  return `/_astro/${name}.${extension}`;
});
fs.writeFileSync(path.join(assets, 'Base.css'), css);
const version = createHash('sha256').update(css).digest('hex').slice(0, 10);

function rewriteHtml(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) rewriteHtml(filename);
    else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(filename, 'utf8');
      const oldUrl = `/_astro/${source}`;
      if (!html.includes(oldUrl)) throw new Error(`Stylesheet link not found in ${filename}`);
      fs.writeFileSync(filename, html.replaceAll(oldUrl, `/_astro/Base.css?v=${version}`));
    }
  }
}
rewriteHtml(root);
console.log(`Stable stylesheet: /_astro/Base.css?v=${version} (${source} retained for cached pages)`);
