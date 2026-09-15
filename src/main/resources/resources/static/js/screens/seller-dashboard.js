import { API } from '../api.js';
import { Store } from '../store.js';

export const SellerDashboardScreen = {
  deliveries: [],
  editingId: null,

  render() {
    if (!Store.state.seller) return this.renderLogin();

    const seller = Store.state.seller;
    return `
      <div class="seller-dashboard-page">
        <div class="dashboard-header glass-lg">
          <div>
            <span class="eyebrow">SELLER CENTER</span>
            <h1>${seller.name} dashboard</h1>
            <p>Manage delivery status and keep customers informed.</p>
          </div>
          <div class="dashboard-actions">
            <a href="#/seller/${seller.id}" class="btn btn-glass">View Storefront</a>
            <button id="seller-logout-btn" class="btn btn-primary btn-liquid">Log out</button>
          </div>
        </div>

        <div class="dashboard-stats">
          <div class="dashboard-stat glass"><span>Total deliveries</span><strong id="delivery-total">0</strong></div>
          <div class="dashboard-stat glass"><span>In transit</span><strong id="delivery-transit">0</strong></div>
          <div class="dashboard-stat glass"><span>Delivered</span><strong id="delivery-delivered">0</strong></div>
        </div>

        <section class="dashboard-panel glass-lg">
          <div class="dashboard-panel-heading">
            <div><h2 id="delivery-form-title">Add delivery</h2><p>Create or update a shipment record.</p></div>
            <button id="delivery-cancel-btn" class="btn btn-glass" hidden>Cancel edit</button>
          </div>
          <form id="delivery-form" class="delivery-form">
            <input type="hidden" id="delivery-id" />
            <label>Order number<input id="delivery-order-number" required placeholder="JB-10001" /></label>
            <label>Tracking number<input id="delivery-tracking" required placeholder="TRK-JUSTBUY-123" /></label>
            <label>Carrier<input id="delivery-carrier" required placeholder="DHL, FedEx, UPS" /></label>
            <label>Status<select id="delivery-status"><option>PENDING</option><option>SHIPPED</option><option>IN_TRANSIT</option><option>DELIVERED</option><option>CANCELLED</option></select></label>
            <label>Recipient<input id="delivery-recipient" required placeholder="Customer name" /></label>
            <label>Estimated delivery<input id="delivery-estimated" type="date" required /></label>
            <label class="delivery-address-field">Address<input id="delivery-address" required placeholder="Shipping address" /></label>
            <button class="btn btn-primary btn-liquid" type="submit">Save delivery</button>
          </form>
          <p id="delivery-message" class="form-message" role="status"></p>
        </section>

        <section class="dashboard-panel glass-lg">
          <div class="dashboard-panel-heading"><div><h2>Delivery records</h2><p>Update status or remove completed records.</p></div></div>
          <div id="delivery-list" class="delivery-list"><p class="dashboard-empty">Loading deliveries...</p></div>
        </section>
      </div>
    `;
  },

  renderLogin() {
    return `
      <div class="seller-login-page glass-lg">
        <span class="eyebrow">SELLER CENTER</span>
        <h1>Sign in to your seller account</h1>
        <p>Open your dashboard to manage deliveries and your storefront.</p>
        <form id="seller-login-form" class="seller-login-form">
          <label>Email<input id="seller-email" type="email" value="seller@justbuy.com" required /></label>
          <label>Password<input id="seller-password" type="password" value="seller123" required /></label>
          <button class="btn btn-primary btn-liquid btn-block" type="submit">Sign in</button>
        </form>
        <p class="login-hint">Demo seller: seller@justbuy.com / seller123</p>
        <p id="seller-login-message" class="form-message" role="alert"></p>
      </div>
    `;
  },

  async afterRender() {
    if (!Store.state.seller) {
      document.getElementById('seller-login-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = document.getElementById('seller-login-message');
        try {
          const result = await API.sellerLogin(document.getElementById('seller-email').value, document.getElementById('seller-password').value);
          Store.setSeller(result.seller);
          window.dispatchEvent(new Event('hashchange'));
        } catch (error) {
          message.textContent = error.message;
          message.className = 'form-message error';
        }
      });
      return;
    }

    document.getElementById('seller-logout-btn')?.addEventListener('click', () => {
      Store.logout();
      window.location.hash = '#/';
    });
    document.getElementById('delivery-form')?.addEventListener('submit', (event) => this.saveDelivery(event));
    document.getElementById('delivery-cancel-btn')?.addEventListener('click', () => this.resetForm());
    await this.loadDeliveries();
  },

  async loadDeliveries() {
    try {
      this.deliveries = await API.getDeliveries(Store.state.seller.id);
      this.renderDeliveries();
    } catch (error) {
      document.getElementById('delivery-message').textContent = error.message;
    }
  },

  renderDeliveries() {
    const counts = {
      total: this.deliveries.length,
      transit: this.deliveries.filter(item => ['SHIPPED', 'IN_TRANSIT'].includes(item.status)).length,
      delivered: this.deliveries.filter(item => item.status === 'DELIVERED').length
    };
    document.getElementById('delivery-total').textContent = counts.total;
    document.getElementById('delivery-transit').textContent = counts.transit;
    document.getElementById('delivery-delivered').textContent = counts.delivered;

    const list = document.getElementById('delivery-list');
    list.innerHTML = this.deliveries.length ? this.deliveries.map(delivery => `
      <article class="delivery-row glass">
        <div><strong>${delivery.orderNumber || 'Unassigned order'}</strong><span>${delivery.recipientName} · ${delivery.carrier}</span></div>
        <div><span class="status-pill delivery-status-${delivery.status.toLowerCase()}">${delivery.status.replace('_', ' ')}</span><span>${delivery.trackingNumber}</span></div>
        <div><span>${delivery.estimatedDelivery || 'No date'}</span><span>${delivery.deliveryAddress}</span></div>
        <div class="delivery-row-actions"><button class="btn btn-glass btn-sm" data-edit-delivery="${delivery.id}">Edit</button><button class="btn btn-danger btn-sm" data-delete-delivery="${delivery.id}">Delete</button></div>
      </article>
    `).join('') : '<p class="dashboard-empty">No delivery records yet.</p>';

    list.querySelectorAll('[data-edit-delivery]').forEach(button => button.addEventListener('click', () => this.editDelivery(Number(button.dataset.editDelivery))));
    list.querySelectorAll('[data-delete-delivery]').forEach(button => button.addEventListener('click', () => this.deleteDelivery(Number(button.dataset.deleteDelivery))));
  },

  async saveDelivery(event) {
    event.preventDefault();
    const id = document.getElementById('delivery-id').value;
    const payload = {
      sellerId: Store.state.seller.id,
      orderNumber: document.getElementById('delivery-order-number').value,
      trackingNumber: document.getElementById('delivery-tracking').value,
      carrier: document.getElementById('delivery-carrier').value,
      status: document.getElementById('delivery-status').value,
      recipientName: document.getElementById('delivery-recipient').value,
      estimatedDelivery: document.getElementById('delivery-estimated').value,
      deliveryAddress: document.getElementById('delivery-address').value
    };
    try {
      if (id) await API.updateDelivery(id, payload); else await API.createDelivery(payload);
      this.resetForm();
      await this.loadDeliveries();
    } catch (error) {
      document.getElementById('delivery-message').textContent = error.message;
    }
  },

  editDelivery(id) {
    const delivery = this.deliveries.find(item => item.id === id);
    if (!delivery) return;
    document.getElementById('delivery-id').value = delivery.id;
    document.getElementById('delivery-order-number').value = delivery.orderNumber || '';
    document.getElementById('delivery-tracking').value = delivery.trackingNumber || '';
    document.getElementById('delivery-carrier').value = delivery.carrier || '';
    document.getElementById('delivery-status').value = delivery.status || 'PENDING';
    document.getElementById('delivery-recipient').value = delivery.recipientName || '';
    document.getElementById('delivery-estimated').value = delivery.estimatedDelivery || '';
    document.getElementById('delivery-address').value = delivery.deliveryAddress || '';
    document.getElementById('delivery-form-title').textContent = 'Edit delivery';
    document.getElementById('delivery-cancel-btn').hidden = false;
    document.getElementById('delivery-form').scrollIntoView({ behavior: 'smooth' });
  },

  resetForm() {
    document.getElementById('delivery-form').reset();
    document.getElementById('delivery-id').value = '';
    document.getElementById('delivery-form-title').textContent = 'Add delivery';
    document.getElementById('delivery-cancel-btn').hidden = true;
    document.getElementById('delivery-status').value = 'PENDING';
  },

  async deleteDelivery(id) {
    if (!window.confirm('Delete this delivery record?')) return;
    try {
      await API.deleteDelivery(id);
      await this.loadDeliveries();
    } catch (error) {
      document.getElementById('delivery-message').textContent = error.message;
    }
  }
};
