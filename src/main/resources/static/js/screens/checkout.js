// ============================================
// JustBuy — Screen: Seamless Checkout
// ============================================

import { API } from '../api.js';
import { Store } from '../store.js';

export const CheckoutScreen = {
    currentStep: 1,

    render() {
        const items = Store.state.cart;
        const totals = Store.getCartTotals();
        const user = Store.state.user || {};
        const userName = user.fullName || user.name || '';
        const userEmail = user.email || '';
        const userAddress = user.address || '';

        if (!items.length) {
            return `
        <div class="cart-empty-view glass-lg">
          <h2>Your bag is empty</h2>
          <p>Please add items before proceeding to checkout.</p>
          <a href="#/products" class="btn btn-primary btn-liquid">Browse Products</a>
        </div>
      `;
        }

        return `
      <div class="checkout-page">
        <!-- Stepper Header -->
        <div class="checkout-stepper-wrap glass">
          <div class="step-indicator active">
            <span class="step-num">1</span>
            <span class="step-name">Shipping</span>
          </div>
          <div class="step-line active"></div>
          <div class="step-indicator active">
            <span class="step-num">2</span>
            <span class="step-name">Payment</span>
          </div>
          <div class="step-line"></div>
          <div class="step-indicator">
            <span class="step-num">3</span>
            <span class="step-name">Confirmation</span>
          </div>
        </div>

        <div class="checkout-layout">
          <!-- Main Form Column -->
          <div class="checkout-forms-column">
            <!-- 1. Shipping Details -->
            <section class="checkout-card glass-lg">
              <div class="card-heading-row">
                <span class="heading-icon">📍</span>
                <h2>1. Shipping Destination</h2>
              </div>

              <div class="form-grid">
                <div class="form-field full">
                  <label>Full Recipient Name</label>
                  <input type="text" id="ship-name" value="${userName}" class="form-input glass" required />
                </div>

                <div class="form-field half">
                  <label>Email Address (For Tracking & Invoice)</label>
                  <input type="email" id="ship-email" value="${userEmail}" class="form-input glass" required />
                </div>

                <div class="form-field half">
                  <label>Phone Number</label>
                  <input type="tel" id="ship-phone" value="+1 (555) 234-8900" class="form-input glass" />
                </div>

                <div class="form-field full">
                  <label>Street Address</label>
                  <input type="text" id="ship-address" value="${userAddress}" class="form-input glass" required />
                </div>

                <div class="form-field third">
                  <label>City</label>
                  <input type="text" id="ship-city" value="New York" class="form-input glass" />
                </div>

                <div class="form-field third">
                  <label>State / Province</label>
                  <input type="text" id="ship-state" value="NY" class="form-input glass" />
                </div>

                <div class="form-field third">
                  <label>Postal Code</label>
                  <input type="text" id="ship-zip" value="10001" class="form-input glass" />
                </div>
              </div>
            </section>

            <!-- 2. Delivery Options -->
            <section class="checkout-card glass-lg">
              <div class="card-heading-row">
                <span class="heading-icon">🚚</span>
                <h2>2. Delivery Speed</h2>
              </div>

              <div class="delivery-choices">
                <label class="delivery-radio-card glass active">
                  <input type="radio" name="shipping-method" value="express" checked />
                  <div class="delivery-radio-content">
                    <strong>JustBuy Priority Air (2-3 Business Days)</strong>
                    <span>GPS End-to-End Tracking + Carbon Neutral Offset</span>
                  </div>
                  <strong class="delivery-cost">${totals.shipping === 0 ? 'FREE' : Store.formatPrice(totals.shipping)}</strong>
                </label>

                <label class="delivery-radio-card glass">
                  <input type="radio" name="shipping-method" value="standard" />
                  <div class="delivery-radio-content">
                    <strong>Standard Ground (4-7 Business Days)</strong>
                    <span>Standard courier tracking</span>
                  </div>
                  <strong class="delivery-cost">FREE</strong>
                </label>
              </div>
            </section>

            <!-- 3. Payment Method with Liquid Glass Card Preview -->
            <section class="checkout-card glass-lg">
              <div class="card-heading-row">
                <span class="heading-icon">💳</span>
                <h2>3. Payment Method</h2>
              </div>

              <!-- Interactive Visual Credit Card (Liquid Glass Aesthetics) -->
              <div class="liquid-credit-card glass">
                <div class="card-chip"></div>
                <div class="card-brand-logo">JUSTBUY PLATINUM</div>
                <div class="card-number-display" id="cc-number-preview">•••• •••• •••• 4242</div>
                <div class="card-meta-row">
                  <div>
                    <span class="card-label">CARDHOLDER</span>
                    <span class="card-holder-name" id="cc-name-preview">${userName}</span>
                  </div>
                  <div>
                    <span class="card-label">EXPIRES</span>
                    <span class="card-expiry-val" id="cc-exp-preview">12/28</span>
                  </div>
                </div>
              </div>

              <!-- Payment Inputs -->
              <div class="form-grid">
                <div class="form-field full">
                  <label>Card Number</label>
                  <input type="text" id="cc-number" placeholder="4242 •••• •••• 4242" 
                         value="4242 8820 9134 4242" class="form-input glass" />
                </div>

                <div class="form-field half">
                  <label>Expiry (MM/YY)</label>
                  <input type="text" id="cc-exp" placeholder="MM/YY" value="12/28" class="form-input glass" />
                </div>

                <div class="form-field half">
                  <label>Security Code (CVV)</label>
                  <input type="password" id="cc-cvv" placeholder="•••" value="882" class="form-input glass" maxlength="4" />
                </div>
              </div>
            </section>
          </div>

          <!-- Checkout Order Summary -->
          <div class="checkout-summary-column">
            <div class="summary-card glass-lg">
              <h3>Order Review (${items.length} unique items)</h3>

              <div class="checkout-items-mini">
                ${items.map(item => `
                  <div class="mini-item-row">
                    <img src="${item.thumbnailUrl}" alt="${item.name}" class="mini-item-img" />
                    <div class="mini-item-details">
                      <span class="mini-item-title">${item.name}</span>
                      <span class="mini-item-meta">Qty: ${item.quantity} | ${item.color}</span>
                    </div>
                    <span class="mini-item-price">${Store.formatPrice(item.price * item.quantity)}</span>
                  </div>
                `).join('')}
              </div>

              <div class="summary-divider"></div>

              <div class="summary-rows">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>${Store.formatPrice(totals.subtotal)}</span>
                </div>
                ${totals.discount > 0 ? `
                  <div class="summary-row discount">
                    <span>Discount</span>
                    <span>-${Store.formatPrice(totals.discount)}</span>
                  </div>
                ` : ''}
                <div class="summary-row">
                  <span>Shipping</span>
                  <span>${totals.shipping === 0 ? '<strong class="green-text">FREE</strong>' : Store.formatPrice(totals.shipping)}</span>
                </div>
                <div class="summary-row">
                  <span>Sales Tax</span>
                  <span>${Store.formatPrice(totals.estimatedTax)}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total-row">
                  <span>Total Due</span>
                  <span class="total-amount">${Store.formatPrice(totals.total)}</span>
                </div>
              </div>

              <button id="place-order-btn" class="btn btn-primary btn-liquid btn-large btn-block">
                <span>🔒 Complete Order (${Store.formatPrice(totals.total)})</span>
              </button>

              <p class="terms-note">
                By placing this order, you agree to JustBuy's 2026 Terms of Commerce and Escrow Protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    afterRender() {
        // 1. Live credit card update on typing
        const numInput = document.getElementById('cc-number');
        const numPreview = document.getElementById('cc-number-preview');
        if (numInput && numPreview) {
            numInput.addEventListener('input', (e) => {
                numPreview.textContent = e.target.value || '•••• •••• •••• 4242';
            });
        }

        const nameInput = document.getElementById('ship-name');
        const namePreview = document.getElementById('cc-name-preview');
        if (nameInput && namePreview) {
            nameInput.addEventListener('input', (e) => {
                namePreview.textContent = e.target.value || 'Alexander Wright';
            });
        }

        const expInput = document.getElementById('cc-exp');
        const expPreview = document.getElementById('cc-exp-preview');
        if (expInput && expPreview) {
            expInput.addEventListener('input', (e) => {
                expPreview.textContent = e.target.value || '12/28';
            });
        }

        // 2. Place Order button -> call API & redirect
        const placeBtn = document.getElementById('place-order-btn');
        if (placeBtn) {
            placeBtn.addEventListener('click', async () => {
                placeBtn.disabled = true;
                placeBtn.innerHTML = '<span>⚡ Processing Secure Payment...</span>';

                const totals = Store.getCartTotals();
                const session = Store.state.user || {};
                const orderData = {
                    customerName: document.getElementById('ship-name')?.value || session.fullName || session.name,
                    customerEmail: document.getElementById('ship-email')?.value || session.email,
                    shippingAddress: document.getElementById('ship-address')?.value || session.address,
                    customerId: session.id || null,
                    placedByRole: (session.role || 'CUSTOMER').toUpperCase(),
                    paymentMethod: 'Credit Card (Visa •••• 4242)',
                    subtotal: totals.subtotal,
                    shippingCost: totals.shipping,
                    discount: totals.discount,
                    total: totals.total,
                    promoCode: Store.state.activePromo,
                    items: Store.state.cart.map(item => ({
                        productId: item.id,
                        productName: item.name,
                        productImage: item.thumbnailUrl,
                        selectedColor: item.color,
                        selectedSize: item.size,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.price * item.quantity
                    }))
                };

                try {
                    const result = await API.createOrder(orderData);
                    Store.clearCart();
                    window.location.hash = `#/order-success/${result.id}`;
                } catch (error) {
                    placeBtn.disabled = false;
                    placeBtn.innerHTML = `<span>🔒 Try Again</span>`;
                    Store.toast(error.message || 'Could not place order', 'warning');
                }
            });
        }
    }
};
