// ============================================
// JustBuy — Screen: User Account & Orders
// ============================================

import { Store } from '../store.js';
import { API } from '../api.js';

export const AccountScreen = {
  render() {
    const user = Store.state.user || {
      name: 'Guest shopper',
      email: 'Sign in to manage your account',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      address: 'No saved delivery address'
    };
    const role = user.role || 'customer';
    const isCustomer = role === 'customer';
    const dashboardLink = role === 'seller'
      ? '<a href="/HTML/seller-dashboard.html" class="btn btn-primary btn-liquid">Open Seller Dashboard</a>'
      : role === 'driver'
        ? '<a href="/HTML/delivery-dashboard.html" class="btn btn-primary btn-liquid">Open Delivery Dashboard</a>'
        : '';
    const applicationState = JSON.parse(localStorage.getItem('jb_account_application') || 'null');

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
              <span class="heading-icon">${isCustomer ? '🪪' : role === 'seller' ? '🏪' : '🚚'}</span>
              <h2>${isCustomer ? 'Become a JustBuy partner' : role === 'seller' ? 'Seller account' : 'Delivery account'}</h2>
            </div>
            ${isCustomer ? `<p class="account-help">Apply to sell products or deliver orders. An administrator reviews every application before access is granted.</p>
            <form id="account-application-form" class="account-application-form">
              <label>Apply as<select id="application-role"><option value="SELLER">Seller</option><option value="DELIVERY">Delivery driver</option></select></label>
              <label>Full name<input name="applicantName" value="${user.name || ''}" required></label>
              <label>Email<input name="email" type="email" value="${user.email || ''}" required></label>
              <label>Address<input name="address" required placeholder="Your full address"></label>
              <label>ID number<input name="idNumber" minlength="5" required placeholder="Government ID number"></label>
              <label>Phone number<input name="phoneNumber" required placeholder="+1 555 000 0000"></label>
              <div id="seller-application-fields"><label>Payment method<input name="paymentMethod" placeholder="Bank account or payment details"></label><label>Seller details<textarea name="businessDetails" rows="3" placeholder="Tell us about your store and products"></textarea></label></div>
              <div id="delivery-application-fields" hidden><label>Vehicle number<input name="vehicleNumber" placeholder="Vehicle registration number"></label></div>
              <button class="btn btn-primary btn-liquid" type="submit">Submit application</button><p id="application-message" class="account-help" aria-live="polite">${applicationState?.status === 'PENDING' ? `Pending ${applicationState.requestedRole.toLowerCase()} application${applicationState.generatedSellerId ? ` · ${applicationState.generatedSellerId}` : ''}.` : ''}</p>
            </form>` : `<p class="account-help">${role === 'seller' ? 'Manage your products, orders, and store earnings.' : 'Manage your assigned route and delivery earnings.'}</p><div class="account-actions">${dashboardLink}<button id="logout-btn" class="btn btn-glass">Log out</button></div>`}
            ${isCustomer ? '<div class="account-actions"><button id="logout-btn" class="btn btn-glass">Log out</button></div>' : ''}
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
    const applicationForm = document.getElementById('account-application-form');
    const applicationRole = document.getElementById('application-role');
    const applicationMessage = document.getElementById('application-message');
    const updateApplicationFields = () => {
      const sellerFields = document.getElementById('seller-application-fields');
      const deliveryFields = document.getElementById('delivery-application-fields');
      const seller = applicationRole.value === 'SELLER';
      sellerFields.hidden = !seller;
      deliveryFields.hidden = seller;
      sellerFields.querySelectorAll('input,textarea').forEach(field => field.required = seller);
      deliveryFields.querySelectorAll('input').forEach(field => field.required = !seller);
    };
    applicationRole?.addEventListener('change', updateApplicationFields);
    updateApplicationFields();
    applicationForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(applicationForm);
      const application = Object.fromEntries(formData.entries());
      application.requestedRole = applicationRole.value;
      applicationMessage.textContent = 'Submitting application...';
      try {
        const saved = await API.submitAccountApplication(application);
        localStorage.setItem('jb_account_application', JSON.stringify(saved));
        applicationMessage.textContent = `Application submitted for admin review${saved.generatedSellerId ? ` · Seller ID: ${saved.generatedSellerId}` : ''}.`;
        applicationForm.querySelector('button[type="submit"]').disabled = true;
      } catch (error) {
        applicationMessage.textContent = error.message;
      }
    });
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      Store.logout();
      window.location.href = '/HTML/login.html';
    });
  }
};
