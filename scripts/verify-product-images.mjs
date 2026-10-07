import assert from 'node:assert/strict';

globalThis.window = {};
const { ProductImages } = await import('../src/main/resources/static/js/product-images.js');

const product = {
  slug: 'sony-wh1000xm5',
  name: 'Sony WH-1000XM5 Headphones',
  category: { name: 'Audio' },
  thumbnailUrl: 'https://broken.example/primary.jpg',
  imageUrls: ['https://broken.example/alternate.jpg']
};
const candidates = ProductImages.candidates(product);
assert.equal(candidates[0], product.thumbnailUrl, 'primary stored image should be attempted first');
assert.equal(candidates[1], product.imageUrls[0], 'alternate stored image should be attempted next');
assert.ok(candidates.some((url) => url.includes('sony.co.nz')), 'known-product alternative should be included');
assert.ok(candidates.some((url) => url.endsWith('/assets/images/fallback-audio.svg')), 'local category fallback should be included');
assert.ok(candidates.includes('/assets/images/product-placeholder.svg'), 'generic local fallback should always be included');

const attrs = ProductImages.attributes(product);
assert.ok(attrs.includes('data-image-candidates='), 'image tag attributes should include the retry list');
assert.ok(attrs.includes('JustBuyProductImages.handleError(this)'), 'image tag should bind the retry handler');

const image = {
  dataset: { imageCandidates: JSON.stringify(candidates), imageIndex: '1' },
  _src: candidates[0],
  currentSrc: candidates[0],
  onerror: () => {},
  get src() { return this._src; },
  set src(value) { this._src = value; this.currentSrc = value; },
  closest() { return { classList: { add() {} } }; }
};
ProductImages.handleError(image);
assert.equal(image.src, candidates[1], 'first failure should advance to next source');
ProductImages.handleError(image);
assert.equal(image.src, candidates[2], 'second failure should try product-specific alternative');
while (image.dataset.imageFallbackDone !== 'true') ProductImages.handleError(image);
assert.equal(image.src, '/assets/images/product-placeholder.svg', 'exhausted sources should finish on local placeholder');
assert.equal(image.onerror, null, 'stop repeated errors after local fallback is reached');

const categoryOnly = ProductImages.candidates({ name: 'Bluetooth Headphones', category: 'Audio' });
assert.ok(categoryOnly.some((url) => url.endsWith('/assets/images/fallback-audio.svg')), 'missing image metadata should still get local category art');
console.log('PASS: product image source candidates, retries, product-specific alternatives, local category fallbacks and final placeholder');
