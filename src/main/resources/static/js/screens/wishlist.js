// ============================================
// JustBuy — Screen: Wishlist & Saved Items
// ============================================

import { API } from '../api.js';
import { Store } from '../store.js';

export const WishlistScreen = {
  render() {
    const list = Store.state.wishlist;

    if (!list.length) {
      return `
        <div class="cart-empty-view glass-lg">
          <div class="empty-cart-icon">🤍</div>
          <h2>Your Wishlist is Empty</h2>
          <p>Tap the heart icon on any product to save it for later review.</p>
          <a href="#/products" class="btn btn-primary btn-liquid">Explore Artifacts →</a>
        </div>
      `;
    }

    return `
      <div class="wishlist-page">
        <div class="catalog-header glass">
          <h1>Saved Artifacts (${list.length})</h1>
          <p>Items saved to your private collection.</p>
        </div>

        <section class="section-container">
          <div class="product-grid">
            ${list.map(p => `
              <div class="product-card glass">
                <button class="wishlist-toggle-btn active" data-remove-wish="${p.id}" title="Remove">❤️</button>
                <a href="#/product/${p.id}" class="product-thumb-wrap">
                  <img src="${p.thumbnailUrl}" alt="${p.name}" class="product-thumb" />
                </a>
                <div class="product-details">
                  <span class="product-category">${p.category || 'Hardware'}</span>
                  <h4 class="product-name"><a href="#/product/${p.id}">${p.name}</a></h4>
                  <div class="product-price-row">
                    <span class="current-price">${Store.formatPrice(p.price)}</span>
                    <button class="add-to-cart-btn btn-liquid" data-add-wish="${p.id}">+ Cart</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  },

  afterRender() {
    document.querySelectorAll('[data-remove-wish]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const p = await API.getProductById(btn.dataset.removeWish);
        if (p) {
          Store.toggleWishlist(p);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
    });

    document.querySelectorAll('[data-add-wish]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const p = await API.getProductById(btn.dataset.addWish);
        if (p) Store.addToCart(p, { quantity: 1 });
      });
    });
  }
};
