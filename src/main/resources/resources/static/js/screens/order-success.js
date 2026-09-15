// ============================================
// JustBuy — Screen: Order Success & Live Tracking
// ============================================

import { Store } from '../store.js';

export const OrderSuccessScreen = {
  render() {
    const orderId = window.location.hash.split('/')[2] || 'JB-883921';
    const trackingNo = 'TRK-JUSTBUY-' + Math.floor(10000000 + Math.random() * 90000000);
    const user = Store.state.user;

    return `
      <div class="success-page">
        <div class="success-card glass-lg">
          <!-- Animated Checkmark -->
          <div class="checkmark-circle">
            <span class="checkmark-icon">✓</span>
          </div>

          <span class="success-pill">Order Confirmed & Escrow Secured</span>
          <h1 class="success-title">Thank You for Your Order!</h1>
          <p class="success-sub">
            We have emailed your tax invoice and real-time tracking link to <strong>${user.email}</strong>.
          </p>

          <!-- Order Details Card -->
          <div class="order-meta-box glass">
            <div class="meta-col">
              <span class="meta-label">ORDER NUMBER</span>
              <strong class="meta-val">#${orderId}</strong>
            </div>
            <div class="meta-col">
              <span class="meta-label">TRACKING ID</span>
              <strong class="meta-val tracking-code">${trackingNo}</strong>
            </div>
            <div class="meta-col">
              <span class="meta-label">ESTIMATED DELIVERY</span>
              <strong class="meta-val green-text">Thursday, Sept 18</strong>
            </div>
            <div class="meta-col">
              <span class="meta-label">SHIPPING TO</span>
              <strong class="meta-val">${user.address}</strong>
            </div>
          </div>

          <!-- Live Fulfillment Stepper Timeline -->
          <div class="tracking-stepper-box glass">
            <h3>Live Fulfillment Status</h3>
            <div class="timeline-steps">
              <div class="t-step completed">
                <div class="t-circle">✓</div>
                <div class="t-label">
                  <strong>Order Placed</strong>
                  <span>Just now</span>
                </div>
              </div>
              <div class="t-line completed"></div>

              <div class="t-step completed">
                <div class="t-circle">✓</div>
                <div class="t-label">
                  <strong>Escrow Verified</strong>
                  <span>Protected</span>
                </div>
              </div>
              <div class="t-line active"></div>

              <div class="t-step active">
                <div class="t-circle pulse">📦</div>
                <div class="t-label">
                  <strong>Packaging Gear</strong>
                  <span>In progress</span>
                </div>
              </div>
              <div class="t-line"></div>

              <div class="t-step">
                <div class="t-circle">🚚</div>
                <div class="t-label">
                  <strong>Out for Delivery</strong>
                  <span>Sept 17</span>
                </div>
              </div>
              <div class="t-line"></div>

              <div class="t-step">
                <div class="t-circle">🏡</div>
                <div class="t-label">
                  <strong>Delivered</strong>
                  <span>Sept 18</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="success-actions">
            <a href="#/products" class="btn btn-primary btn-liquid">
              Continue Shopping →
            </a>
            <button class="btn btn-glass" onclick="window.print()">
              🖨️ Print Receipt
            </button>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {}
};
