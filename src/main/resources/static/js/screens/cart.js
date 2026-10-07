// ============================================
// JustBuy — Screen: Shopping Cart
// ============================================

import { Store } from '../store.js';

export const CartScreen = {
  render() {
    const items = Store.state.cart;
    const totals = Store.getCartTotals();

    if (!items.length) {
      return `
        <div class="cart-empty-view glass-lg">
          <div class="empty-cart-icon">🛒</div>
          <h2>Your Cart is Pure Potential</h2>
          <p>Explore our curated collections and add precision-crafted artifacts.</p>
          <a href="#/products" class="btn btn-primary btn-liquid">
            Start Shopping →
          </a>
        </div>
      `;
    }

    return `
      <div class="cart-page">
        <div class="cart-header glass">
          <h1>Shopping Bag (${Store.getCartCount()} items)</h1>
          <p>Carefully reviewed and protected under JustBuy buyer guarantee.</p>
        </div>

        <!-- Free Shipping Progress Tracker -->
        <div class="shipping-progress-banner glass">
          <div class="progress-info">
            <span class="truck-icon">🚚</span>
            ${totals.freeShippingRemaining <= 0
              ? '<span><strong>Congratulations!</strong> You have unlocked <strong>Free Priority Express Shipping</strong>!</span>'
              : `<span>Add <strong>${Store.formatPrice(totals.freeShippingRemaining)}</strong> more to unlock <strong>Free Express Shipping</strong>!</span>`
            }
          </div>
          <div class="progress-track">
            <div class="progress-bar-fill" style="width: ${totals.freeShippingProgress}%;"></div>
          </div>
        </div>

        <div class="cart-layout">
          <!-- Items List -->
          <div class="cart-items-list">
            ${items.map((item, index) => `
              <div class="cart-item-card glass" data-index="${index}">
                <img src="${item.thumbnailUrl}" alt="${item.name}" class="cart-item-thumb" />

                <div class="cart-item-info">
                  <h3 class="cart-item-title">
                    <a href="#/product/${item.id}">${item.name}</a>
                  </h3>
                  <div class="cart-item-specs">
                    <span class="spec-pill">Color: ${item.color}</span>
                    <span class="spec-pill">Size: ${item.size}</span>
                  </div>
                  <div class="cart-item-price-row">
                    <span class="item-unit-price">${Store.formatPrice(item.price)} each</span>
                  </div>
                </div>

                <div class="cart-item-actions">
                  <div class="qty-stepper glass">
                    <button class="cart-qty-btn" data-action="minus" data-index="${index}">−</button>
                    <span class="cart-qty-val">${item.quantity}</span>
                    <button class="cart-qty-btn" data-action="plus" data-index="${index}">+</button>
                  </div>
                  <span class="item-subtotal">${Store.formatPrice(item.price * item.quantity)}</span>
                  <button class="cart-remove-btn" data-remove-index="${index}" title="Remove item">✕</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Order Summary Sidebar -->
          <div class="cart-summary-sidebar">
            <div class="summary-card glass-lg">
              <h2 class="summary-heading">Order Summary</h2>

              <!-- Promo Code Input -->
              <div class="coupon-box glass">
                <input type="text" id="promo-input" placeholder="Promo code (e.g. JUST20)" 
                       value="${Store.state.activePromo || ''}" class="coupon-input" />
                <button id="apply-promo-btn" class="btn btn-glass btn-sm">Apply</button>
              </div>

              <!-- Calculations -->
              <div class="summary-rows">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>${Store.formatPrice(totals.subtotal)}</span>
                </div>

                ${totals.discount > 0 ? `
                  <div class="summary-row discount">
                    <span>Discount (${Store.state.activePromo})</span>
                    <span>-${Store.formatPrice(totals.discount)}</span>
                  </div>
                ` : ''}

                <div class="summary-row">
                  <span>Estimated Shipping</span>
                  <span>${totals.shipping === 0 ? '<strong class="green-text">FREE</strong>' : Store.formatPrice(totals.shipping)}</span>
                </div>

                <div class="summary-row">
                  <span>Estimated Tax (8.25%)</span>
                  <span>${Store.formatPrice(totals.estimatedTax)}</span>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-row total-row">
                  <span>Total Amount</span>
                  <span class="total-amount">${Store.formatPrice(totals.total)}</span>
                </div>
              </div>

              <a href="#/checkout" class="btn btn-primary btn-liquid btn-large btn-block">
                Proceed to Checkout →
              </a>

              <div class="payment-guarantee-note">
                <span>🔒 256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    // 1. Qty buttons
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = Number(btn.dataset.index);
        const action = btn.dataset.action;
        const currentQty = Store.state.cart[index].quantity;
        const newQty = action === 'plus' ? currentQty + 1 : currentQty - 1;
        Store.updateQuantity(index, newQty);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });

    // 2. Remove buttons
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = Number(btn.dataset.removeIndex);
        Store.removeFromCart(index);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    });

    // 3. Apply promo
    document.getElementById('apply-promo-btn')?.addEventListener('click', () => {
      const code = document.getElementById('promo-input')?.value;
      const res = Store.applyCoupon(code);
      if (res.success) {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    });
  }
};
