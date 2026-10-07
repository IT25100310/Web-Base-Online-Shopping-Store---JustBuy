import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/main/resources/static');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full); else files.push(full);
  }
}
walk(root);
const hrefRe = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const missing = [];
const checked = new Set();
for (const file of files.filter(f => /\.html$/i.test(f))) {
  const html = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = hrefRe.exec(html))) {
    const ref = m[1].split('#')[0].split('?')[0];
    if (!ref || ref.startsWith('/api/') || ref === '/api' || ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('//') || ref.startsWith('data:') || ref.startsWith('mailto:') || ref.startsWith('javascript:')) continue;
    const target = ref.startsWith('/') ? path.join(root, ref.slice(1)) : path.resolve(path.dirname(file), ref);
    const key = `${file} -> ${ref}`;
    checked.add(key);
    if (!fs.existsSync(target)) missing.push(key);
  }
}
if (missing.length) {
  console.error('FAIL: missing static references');
  for (const x of missing) console.error(x);
  process.exit(1);
}
console.log(`PASS: ${files.filter(f => /\.html$/i.test(f)).length} HTML files and ${checked.size} local references resolve`);
console.log(`PASS: ${files.length} static files discovered`);
