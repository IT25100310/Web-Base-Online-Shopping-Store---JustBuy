// ============================================
// JustBuy — Screen: Flash Deals & Coupons
// ============================================

import { API } from '../api.js';
import { Store } from '../store.js';

export const DealsScreen = {
  async render() {
    const deals = await API.getFlashDeals();

    return `
      <div class="deals-page">
        <!-- Hero Header -->
        <div class="deals-hero-banner glass-lg">
          <span class="badge-pill-orange">⚡ Lightning Clearance</span>
          <h1>Limited-Time Flash Deals</h1>
          <p>Curated seasonal discounts up to 40% off. Refreshed every 12 hours.</p>

          <div class="coupons-row">
            <div class="coupon-ticket glass">
              <div class="coupon-left">
                <span class="disc-val">20% OFF</span>
                <span class="disc-cond">Min. spend $100</span>
              </div>
              <div class="coupon-right">
                <code>JUST20</code>
                <button class="copy-coupon-btn btn-sm" data-code="JUST20">Copy Code</button>
              </div>
            </div>

            <div class="coupon-ticket glass">
              <div class="coupon-left">
                <span class="disc-val">FREE AIR</span>
                <span class="disc-cond">All international orders</span>
              </div>
              <div class="coupon-right">
                <code>FREESHIP</code>
                <button class="copy-coupon-btn btn-sm" data-code="FREESHIP">Copy Code</button>
              </div>
            </div>
          </div>
        </div>

        <section class="section-container">
          <div class="product-grid">
            ${deals.map(p => this.renderProductCard(p)).join('')}
          </div>
        </section>
      </div>
    `;
  },

  renderProductCard(product) {
    const priceFormatted = Store.formatPrice(product.price);
    const origFormatted = product.originalPrice ? Store.formatPrice(product.originalPrice) : null;
    const isWished = Store.isInWishlist(product.id);

    return `
      <div class="product-card glass" data-id="${product.id}">
        <div class="product-badge-stack">
          <span class="discount-tag">-${product.discountPercent || 25}%</span>
          <span class="product-tag">Flash Deal</span>
        </div>

        <button class="wishlist-toggle-btn ${isWished ? 'active' : ''}" data-wishlist-id="${product.id}">
          ${isWished ? '❤️' : '🤍'}
        </button>

        <a href="#/product/${product.id}" class="product-thumb-wrap">
          <img src="${product.thumbnailUrl}" alt="${product.name}" class="product-thumb" />
        </a>

        <div class="product-details">
          <span class="product-category">${product.category?.name || 'Artifact'}</span>
          <h4 class="product-name"><a href="#/product/${product.id}">${product.name}</a></h4>
          <div class="product-price-row">
            <div class="price-box">
              <span class="current-price">${priceFormatted}</span>
              ${origFormatted ? `<span class="orig-price">${origFormatted}</span>` : ''}
            </div>
            <button class="add-to-cart-btn btn-liquid" data-add-id="${product.id}">+ Cart</button>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    document.querySelectorAll('.copy-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        navigator.clipboard?.writeText(code);
        Store.applyCoupon(code);
        btn.textContent = '✓ Applied!';
      });
    });

    document.querySelectorAll('[data-add-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const p = await API.getProductById(btn.dataset.addId);
        if (p) Store.addToCart(p, { quantity: 1 });
      });
    });
  }
};
