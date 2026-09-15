// ============================================
// JustBuy — Screen: User Account & Orders
// ============================================

import { Store } from '../store.js';

export const AccountScreen = {
  render() {
    const user = Store.state.user || {
      name: 'Guest shopper',
      email: 'Sign in to manage your account',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      address: 'No saved delivery address'
    };

    return `
      <div class="account-page">
        <!-- Profile Banner -->
        <div class="account-header glass-lg">
          <img src="${user.avatar}" alt="${user.name}" class="account-avatar" />
          <div class="account-info">
            <div class="account-name-row">
              <h1>${user.name}</h1>
              <span class="verified-pill">🛡️ Tier 1 Verified Member</span>
            </div>
            <p class="account-email">${user.email}</p>
            <span class="account-meta">Default Shipping: ${user.address}</span>
          </div>
        </div>

        <!-- Orders & Account Sections -->
        <div class="account-grid">
          <!-- Order History -->
          <div class="account-card glass">
            <div class="card-heading-row">
              <span class="heading-icon">📦</span>
              <h2>Recent Orders</h2>
            </div>

            <div class="orders-list">
              <div class="order-item-card glass">
                <div class="order-item-header">
                  <div>
                    <strong>Order #JB-992014</strong>
                    <span class="order-date">Placed on Sept 12, 2026</span>
                  </div>
                  <span class="status-pill status-shipped">🚚 In Transit</span>
                </div>
                <div class="order-item-body">
                  <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=80" alt="Product" class="order-thumb" />
                  <div class="order-details">
                    <h4>Aether Aura Pro ANC Wireless Headphones</h4>
                    <span>Qty: 1 • Matte Charcoal • Total: $249.00</span>
                  </div>
                  <a href="#/order-success/JB-992014" class="btn btn-glass btn-sm">Track Package</a>
                </div>
              </div>

              <div class="order-item-card glass">
                <div class="order-item-header">
                  <div>
                    <strong>Order #JB-841920</strong>
                    <span class="order-date">Placed on Aug 28, 2026</span>
                  </div>
                  <span class="status-pill status-delivered">✓ Delivered</span>
                </div>
                <div class="order-item-body">
                  <img src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&auto=format&fit=crop&q=80" alt="Product" class="order-thumb" />
                  <div class="order-details">
                    <h4>Keystroke Nuance Mechanical Keyboard 75%</h4>
                    <span>Qty: 1 • Retro Cream • Total: $159.00</span>
                  </div>
                  <button class="btn btn-glass btn-sm" onclick="alert('Receipt downloaded')">Receipt</button>
                </div>
              </div>
            </div>
          </div>

          <div class="account-card glass seller-account-card">
            <div class="card-heading-row">
              <span class="heading-icon">🏪</span>
              <h2>Seller account</h2>
            </div>
            <p class="account-help">Manage deliveries and keep your storefront moving.</p>
            <div class="account-actions">
              <a href="#/seller-dashboard" class="btn btn-primary btn-liquid">Open Seller Dashboard</a>
              <button id="logout-btn" class="btn btn-glass">Log out</button>
            </div>
          </div>

          <!-- Saved Shipping Address -->
          <div class="account-card glass">
            <div class="card-heading-row">
              <span class="heading-icon">📍</span>
              <h2>Primary Delivery Hub</h2>
            </div>
            <div class="address-preview glass">
              <strong>${user.name}</strong>
              <p>${user.address}</p>
              <p>United States</p>
              <button class="btn btn-glass btn-sm mt-3" onclick="alert('Address updated')">Edit Address</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      Store.logout();
      window.location.hash = '#/';
      Store.toast('You have been logged out.', 'info');
    });
  }
};
