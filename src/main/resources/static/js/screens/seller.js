// ============================================
// JustBuy — Screen: Seller Storefront Profile
// ============================================

import { API } from '../api.js';
import { Store } from '../store.js';

export const SellerScreen = {
  async render() {
    const id = window.location.hash.split('/')[2] || 1;
    const seller = await API.getSeller(id);
    const products = await API.getProducts();

    return `
      <div class="seller-page">
        <!-- Storefront Banner -->
        <div class="storefront-hero glass-lg" style="background-image: linear-gradient(rgba(26,26,26,0.6), rgba(26,26,26,0.8)), url('${seller.banner}');">
          <div class="storefront-header-content">
            <img src="${seller.avatar}" alt="${seller.name}" class="store-avatar" />
            <div class="store-main-info">
              <div class="store-title-row">
                <h1>${seller.name}</h1>
                <span class="store-verified-pill">🛡️ Verified Brand Flagship</span>
              </div>
              <p class="store-bio">${seller.bio}</p>

              <div class="store-stats-pills">
                <span class="store-stat glass">★ <strong>${seller.rating}</strong> (14K+ Reviews)</span>
                <span class="store-stat glass">👥 <strong>${(seller.followers / 1000).toFixed(1)}K</strong> Followers</span>
                <span class="store-stat glass">⚡ Replies in <strong>${seller.responseTime}</strong></span>
              </div>
            </div>

            <div class="store-actions">
              <button class="btn btn-primary btn-liquid" id="follow-seller-btn">+ Follow Store</button>
              <button class="btn btn-glass" id="contact-seller-btn">💬 Chat with Designer</button>
            </div>
          </div>
        </div>

        <!-- Catalog by this Seller -->
        <section class="section-container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Official Product Lineup</h2>
              <p class="section-subtitle">Direct from the design laboratory with standard 2-year warranty.</p>
            </div>
          </div>

          <div class="product-grid">
            ${products.slice(0, 6).map(p => this.renderProductCard(p)).join('')}
          </div>
        </section>
      </div>
    `;
  },

  renderProductCard(product) {
    const isWished = Store.isInWishlist(product.id);
    return `
      <div class="product-card glass" data-id="${product.id}">
        <button class="wishlist-toggle-btn ${isWished ? 'active' : ''}" data-wishlist-id="${product.id}">
          ${isWished ? '❤️' : '🤍'}
        </button>
        <a href="#/product/${product.id}" class="product-thumb-wrap">
          <img src="${product.thumbnailUrl}" alt="${product.name}" class="product-thumb" />
        </a>
        <div class="product-details">
          <span class="product-category">${product.category?.name || 'Studio'}</span>
          <h4 class="product-name"><a href="#/product/${product.id}">${product.name}</a></h4>
          <div class="product-price-row">
            <span class="current-price">${Store.formatPrice(product.price)}</span>
            <button class="add-to-cart-btn btn-liquid" data-add-id="${product.id}">+ Cart</button>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    document.getElementById('follow-seller-btn')?.addEventListener('click', (e) => {
      e.target.textContent = '✓ Following';
      Store.toast('Added to followed flagship stores!', 'success');
    });

    document.getElementById('contact-seller-btn')?.addEventListener('click', () => {
      Store.toast('Opening live encrypted artisan chat...', 'info');
      document.getElementById('chat-widget')?.classList.add('open');
    });
  }
};
