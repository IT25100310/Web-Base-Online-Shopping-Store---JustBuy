import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
  clear() { storage.clear(); }
};
globalThis.document = {
  getElementById() { return null; },
  querySelectorAll() { return []; },
  body: { classList: { add() {}, remove() {} } },
  createElement() { return {}; }
};
globalThis.window = {
  location: { hash: '#/products' },
  addEventListener() {}
};

const { Store } = await import('../src/main/resources/static/js/store.js');
const { ProductsScreen } = await import('../src/main/resources/static/js/screens/products.js');
const { API } = await import('../src/main/resources/static/js/api.js');

function product(id, category, extras = {}) {
  return {
    id, name: `Product ${id}`, price: 100, stock: 10, rating: 4.8, soldCount: id,
    freeShipping: false, active: true, category, seller: { id: 1, verified: true },
    thumbnailUrl: '/assets/images/product-placeholder.svg', ...extras
  };
}

// API client: object response is normalized to the product array.
let requestedUrl = '';
globalThis.fetch = async (url) => {
  requestedUrl = String(url);
  return { ok: true, async json() { return { products: [product(1, { id: 7, name: 'Audio & Sound', slug: 'audio-sound' })] }; } };
};
const apiResult = await API.getProducts({ categoryId: 7, category: 'Audio & Sound', size: 100 });
assert.equal(apiResult.length, 1);
assert.match(requestedUrl, /categoryId=7/);
assert.match(requestedUrl, /category=Audio\+%26\+Sound/);

// Product catalog: canonical category resolution uses the selected category record.
const categories = [{ id: 7, name: 'Audio & Sound', slug: 'audio-sound', icon: '🎧' }];
API.getCategories = async () => categories;
let productCalls = [];
API.getProducts = async (params = {}) => {
  productCalls.push(params);
  return [product(11, categories[0])];
};
window.location.hash = '#/products?categoryId=999&category=Audio%20%26%20Sound';
const html = await ProductsScreen.render();
assert.match(html, /Product 11/);
assert.equal(productCalls[0].categoryId, 7);
assert.equal(productCalls[0].category, 'audio-sound');

// Product catalog fallback: an empty category API result falls back to the active catalog.
productCalls = [];
API.getProducts = async (params = {}) => {
  productCalls.push(params);
  if (params.categoryId) return [];
  return [
    product(21, categories[0]),
    product(22, { id: 8, name: 'Wearables & Tech', slug: 'wearables-tech' })
  ];
};
window.location.hash = '#/products?categoryId=7&category=Audio%20%26%20Sound';
const fallbackHtml = await ProductsScreen.render();
assert.match(fallbackHtml, /Product 21/);
assert.doesNotMatch(fallbackHtml, /Product 22/);
assert.equal(productCalls.length, 2);

// Local filter logic: price, shipping and verified seller statuses all compose.
const filtered = ProductsScreen.applyLocalFilters([
  product(31, categories[0], { price: 50, freeShipping: true, soldCount: 3 }),
  product(32, categories[0], { price: 150, freeShipping: true, soldCount: 9 }),
  product(33, categories[0], { price: 40, freeShipping: false, seller: { id: 2, verified: false }, soldCount: 12 }),
  product(34, categories[0], { price: 60, freeShipping: true, seller: { id: 3, verified: 'false' }, soldCount: 4 }),
  product(35, categories[0], { price: 70, freeShipping: true, seller: { id: 4 }, soldCount: 5 })
], { maxPrice: 100, freeShipping: true, verified: true, sort: 'price-low' }, new Set(['4']));
assert.deepEqual(filtered.map(x => x.id), [31, 35]);
assert.equal(ProductsScreen.isSellerVerified({ seller: { verified: 'false' } }), false);
assert.equal(ProductsScreen.isSellerVerified({ seller: { verified: 'true' } }), true);
assert.equal(ProductsScreen.isSellerVerified({ sellerId: 4 }, new Set(['4'])), true);
assert.equal(ProductsScreen.isSellerVerified({ seller: 4 }, new Set(['4'])), true);
assert.equal(ProductsScreen.isSellerVerified({ sellerId: 9 }, new Set(['4'])), false);
const originalGetSellers = API.getSellers;
API.getSellers = async () => [
  { id: 8, verified: true },
  { id: 9, verified: 'false' },
  { id: 10, verified: 'approved' }
];
ProductsScreen.verifiedSellerIdsPromise = null;
assert.deepEqual([...(await ProductsScreen.getVerifiedSellerIds())], ['8', '10']);
API.getSellers = originalGetSellers;
ProductsScreen.verifiedSellerIdsPromise = null;

// Cart behavior and totals.
Store.state.cart = [];
const added = Store.addToCart(product(41, categories[0], { price: 25, stock: 2 }), { quantity: 5 });
assert.equal(added, true);
assert.equal(Store.state.cart[0].quantity, 2);
assert.equal(Store.getCartSubtotal(), 50);
Store.clearCart();
assert.equal(Store.getCartCount(), 0);

console.log('PASS: frontend runtime verification');
console.log('PASS: API category request/response normalization');
console.log('PASS: category ID/name/slug canonical resolution');
console.log('PASS: empty-category fallback rendering');
console.log('PASS: price/shipping/verified/local sorting filters');
console.log('PASS: string verification values and missing seller status fallback');
console.log('PASS: verified seller lookup and ID fallback');
console.log('PASS: cart stock cap and totals');

// Reset button: clear local filter state and navigate out of a selected category.
const resetElements = {
  'reset-filters-btn': { addEventListener(type, callback) { if (type === 'click') this.onClick = callback; } },
  'sort-select': { value: 'price-low', addEventListener() {} },
  'price-range': { value: '120', addEventListener() {} },
  'price-slider-val': { textContent: '' },
  'filter-freeship': { checked: true, addEventListener() {} },
  'filter-verified': { checked: true, addEventListener() {} },
  'catalog-products-grid': { innerHTML: '' },
  'product-count-display': { textContent: '' }
};
document.getElementById = (id) => resetElements[id] || null;
document.querySelectorAll = () => [];
window.location.hash = '#/products?categoryId=7&category=Audio%20%26%20Sound';
ProductsScreen.currentFilters = { category: 'Audio & Sound', categoryId: '7', search: '' };
ProductsScreen.localFilterState = { maxPrice: 120, freeShipping: true, verified: true, sort: 'price-low' };
ProductsScreen.afterRender();
assert.equal(typeof resetElements['reset-filters-btn'].onClick, 'function');
resetElements['reset-filters-btn'].onClick();
assert.equal(window.location.hash, '#/products');
assert.deepEqual(ProductsScreen.localFilterState, { maxPrice: 800, freeShipping: false, verified: false, sort: 'featured' });
assert.equal(ProductsScreen.currentFilters.category, '');
assert.equal(ProductsScreen.currentFilters.categoryId, '');
assert.equal(resetElements['price-range'].value, '800');
assert.equal(resetElements['sort-select'].value, 'featured');
assert.equal(resetElements['filter-freeship'].checked, false);
assert.equal(resetElements['filter-verified'].checked, false);
console.log('PASS: Reset clears category URL and all catalog filters');
