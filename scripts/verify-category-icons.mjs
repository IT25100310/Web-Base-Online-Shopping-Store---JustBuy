import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CategoryIcons } from '../src/main/resources/static/js/category-icons.js';

const expected = [
  [{ name: 'Audio & Sound', slug: 'audio-sound', icon: '??' }, '🎧', 'audio'],
  [{ name: 'Wearables & Tech', slug: 'wearables-tech', icon: '??' }, '⌚', 'wearables'],
  [{ name: 'Smart Home & Living', slug: 'smart-home-living', icon: '???' }, '🏠', 'home'],
  [{ name: 'Work & Desk Setup', slug: 'work-desk-setup', icon: '??' }, '🖥️', 'desk'],
  [{ name: 'Photography & Gear', slug: 'photography-gear', icon: '??' }, '📷', 'photo'],
];

for (const [category, glyph, tone] of expected) {
  assert.equal(CategoryIcons.glyph(category), glyph, `wrong glyph for ${category.name}`);
  assert.equal(CategoryIcons.tone(category), tone, `wrong visual tone for ${category.name}`);
}
assert.equal(CategoryIcons.glyph({ name: 'New Category', icon: '??' }), '📦', 'broken question-mark data should not render');
assert.equal(CategoryIcons.glyph({ name: 'New Category', icon: '⭐' }), '⭐', 'valid custom icons should remain supported');

const products = readFileSync(new URL('../src/main/resources/static/js/screens/products.js', import.meta.url), 'utf8');
const home = readFileSync(new URL('../src/main/resources/static/js/screens/home.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/main/resources/static/css/customer-polish.css', import.meta.url), 'utf8');
assert.match(products, /CategoryIcons\.glyph\(c\)/, 'marketplace sidebar must use local mapping');
assert.match(products, /category-filter-icon tone-\$\{CategoryIcons\.tone\(c\)\}/, 'sidebar icons must get tone styling');
assert.match(home, /CategoryIcons\.glyph\(cat\)/, 'home category cards must use local mapping');
assert.match(css, /\.category-filter-icon/, 'category icon styles must exist');
console.log('PASS: category icons ignore corrupted database placeholders and map all five seeded categories');
console.log('PASS: marketplace sidebar and home category tiles use the shared icon mapping');
