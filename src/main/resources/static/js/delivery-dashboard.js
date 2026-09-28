let session = null;
let state = { driver: {}, orders: [], earnings: 0, online: false };
let query = '';
let filter = 'all';
let route = 'dashboard';
let routeMap = null;
const geocodeCache = new Map();

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const statusLabel = (status) => String(status || 'CONFIRMED').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const terminal = (order) => ['DELIVERED', 'FAILED', 'CUSTOMER_UNAVAILABLE', 'COMPLETED', 'CANCELLED'].includes(String(order.status || '').toUpperCase());
const activeOrders = () => state.orders.filter((order) => !terminal(order));
const earning = (order) => String(order.status || '').toUpperCase() === 'DELIVERED' ? Number(order.total || 0) * 0.03 : 0;

function toast(message) {
  const node = document.createElement('div'); node.className = 'toast'; node.textContent = message; $('#toast-stack')?.append(node);
  setTimeout(() => node.remove(), 3200);
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Could not connect to the driver service.');
  return data;
}

async function loadDashboard() {
  const data = await api(`/api/driver/${encodeURIComponent(session.id)}/dashboard`);
  state = { ...state, ...data, orders: Array.isArray(data.orders) ? data.orders : [] };
  syncHeader(); render();
}

function syncHeader() {
  const name = state.driver.name || session.name || session.fullName || 'Driver';
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  document.querySelectorAll('.profile-avatar, #profile').forEach((node) => { node.textContent = initials; });
  const profileName = $('.driver-profile strong'); if (profileName) profileName.textContent = name;
  const profileMeta = $('.driver-profile small'); if (profileMeta) profileMeta.textContent = state.driver.vehicleNumber || 'Approved driver';
  $('#today').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const available = $('#availability'); if (available) { available.setAttribute('aria-checked', String(Boolean(state.online))); available.classList.toggle('on', Boolean(state.online)); }
  $('#order-badge').textContent = activeOrders().length;
}

function renderStats() {
  const delivered = state.orders.filter((order) => ['DELIVERED', 'COMPLETED'].includes(String(order.status || '').toUpperCase())).length;
  const failed = state.orders.filter((order) => ['FAILED', 'CUSTOMER_UNAVAILABLE'].includes(String(order.status || '').toUpperCase())).length;
  return `<div class="grid stats-grid">
    <article class="stat-card"><span class="stat-change">Live</span><span class="stat-icon">↗</span><span class="stat-label">Assigned orders</span><strong class="stat-value">${state.orders.length}</strong></article>
    <article class="stat-card"><span class="stat-change">Completed</span><span class="stat-icon">✓</span><span class="stat-label">Delivered orders</span><strong class="stat-value">${delivered}</strong></article>
    <article class="stat-card"><span class="stat-change">Attention</span><span class="stat-icon">!</span><span class="stat-label">Failed / unavailable</span><strong class="stat-value">${failed}</strong></article>
    <article class="stat-card"><span class="stat-change">3% per delivery</span><span class="stat-icon">$</span><span class="stat-label">Delivered earnings</span><strong class="stat-value">${money(state.earnings)}</strong></article>
  </div>`;
}

function renderDashboard() {
  const active = activeOrders();
  const delivered = state.orders.filter((order) => String(order.status || '').toUpperCase() === 'DELIVERED');
  return `${renderStats()}<div class="grid two-col">
    <article class="card"><div class="card-header"><div><h3>Delivery performance</h3><p>Calculated from your assigned orders</p></div><span class="positive">${state.online ? 'Online' : 'Offline'}</span></div><div class="score-row"><strong class="score">${state.orders.length ? Math.round(delivered.length / state.orders.length * 100) : 0}<span>%</span></strong><div class="score-copy"><strong>Live delivery completion</strong><small>${delivered.length} delivered of ${state.orders.length} assigned</small><div class="progress"><i style="width:${state.orders.length ? Math.round(delivered.length / state.orders.length * 100) : 0}%"></i></div></div></div></article>
    <article class="card"><div class="card-header"><div><h3>Orders by status</h3><p>Current database workload</p></div></div><div class="bar-list">${['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CUSTOMER_UNAVAILABLE'].map((status) => { const count = state.orders.filter((order) => String(order.status || '').toUpperCase() === status).length; return `<div class="bar-line"><strong>${statusLabel(status)}</strong><div class="bar"><i style="width:${state.orders.length ? Math.max(3, count / state.orders.length * 100) : 0}%"></i></div><span>${count}</span></div>`; }).join('')}</div></article>
  </div><div class="section-row"><div><h2>Today at a glance</h2><p>Only real assigned orders are shown.</p></div><button class="outline-button" data-go="orders">View orders</button></div>
  <div class="grid glance-grid"><article class="card glance"><span class="glance-icon">⌖</span><label>Active stops</label><strong>${active.length}</strong><small>${state.online ? 'You are online for assignments' : 'Go online to receive new assignments'}</small></article><article class="card glance"><span class="glance-icon">$</span><label>Delivered earnings</label><strong>${money(state.earnings)}</strong><small>3% of delivered order total</small></article><article class="card glance"><span class="glance-icon">✓</span><label>Completed today</label><strong>${delivered.filter((order) => order.deliveredAt && String(order.deliveredAt).slice(0, 10) === new Date().toISOString().slice(0, 10)).length}</strong><small>Database-confirmed deliveries</small></article><article class="card glance"><span class="glance-icon">!</span><label>Needs attention</label><strong>${state.orders.filter((order) => ['FAILED', 'CUSTOMER_UNAVAILABLE'].includes(String(order.status || '').toUpperCase())).length}</strong><small>Include a note when reporting</small></article></div>`;
}

function matches(order) {
  const text = `${order.orderNumber} ${order.trackingNumber} ${order.customerName} ${order.shippingAddress} ${(order.items || []).map((item) => item.productName).join(' ')}`.toLowerCase();
  return (filter === 'all' || String(order.status || '').toLowerCase() === filter.toLowerCase()) && (!query || text.includes(query.toLowerCase()));
}

function renderOrders() {
  const list = state.orders.filter(matches);
  return `<div class="section-row"><div><h2>Assigned orders</h2><p>Status changes are saved to the shared order record for customer and seller views.</p></div><span class="positive">● Database connected</span></div><div class="toolbar"><label class="search-control">⌕<input id="order-query" value="${esc(query)}" placeholder="Search order, tracking, or customer"></label><select id="status-filter" class="select"><option value="all">All statuses</option>${['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CUSTOMER_UNAVAILABLE'].map((status) => `<option value="${status}" ${filter === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></div><article class="card table-wrap"><table class="order-table"><thead><tr><th>Order</th><th>Customer</th><th>Drop-off</th><th>Status</th><th>Pay</th><th>Actions</th></tr></thead><tbody>${list.map((order) => `<tr><td><strong>${esc(order.orderNumber || `JB-${order.id}`)}</strong><small>${esc(order.trackingNumber || '')}</small></td><td><strong>${esc(order.customerName || 'Customer')}</strong><small>${esc(order.customerEmail || '')}</small></td><td><strong>${esc((order.items || []).map((item) => `${item.productName} x${item.quantity}`).join(', '))}</strong><small>${esc(order.shippingAddress || '')}</small></td><td><span class="status ${String(order.status || '').toLowerCase()}">${statusLabel(order.status)}</span></td><td><strong>${money(earning(order))}</strong></td><td><button class="action-button" data-view="${order.id}">View / update</button></td></tr>`).join('')}</tbody></table>${list.length ? '' : '<div class="empty">No assigned orders found.</div>'}</article>`;
}

function renderDelivery() {
  const active = activeOrders();
  return `<div class="section-row"><div><h2>Delivery route</h2><p>Real map markers are created from saved customer delivery addresses.</p></div><span class="positive">${active.length} active deliveries</span></div><div class="grid route-grid"><article class="card"><div id="route-map" class="real-map" aria-label="Live delivery route map"></div><div class="map-caption"><strong>${active.length ? 'Current assigned route' : 'No active route'}</strong><span>${active.length ? 'Estimated stop sequence' : 'Waiting for assignments'}</span></div></article><article class="card"><div class="card-header"><div><h3>Next stops</h3><p>Assigned order sequence</p></div></div>${active.slice(0, 8).map((order, index) => `<div class="stop"><span class="stop-number">${index + 1}</span><div><strong>${esc(order.customerName || 'Customer')}</strong><span>${esc(order.shippingAddress || 'Address unavailable')}</span></div><time>${statusLabel(order.status)}</time></div>`).join('') || '<div class="empty">No active deliveries.</div>'}</article></div>`;
}

async function geocodeAddress(address) {
  const query = `${address || ''}, Sri Lanka`.trim();
  if (!address) return null;
  if (geocodeCache.has(query)) return geocodeCache.get(query);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=lk&q=${encodeURIComponent(query)}`);
    const results = await response.json();
    const point = results?.[0] ? { lat: Number(results[0].lat), lon: Number(results[0].lon), label: results[0].display_name } : null;
    geocodeCache.set(query, point);
    return point;
  } catch (_) { return null; }
}

async function initializeRouteMap() {
  const element = document.getElementById('route-map');
  if (!element || !window.L) return;
  if (routeMap) { routeMap.remove(); routeMap = null; }
  routeMap = L.map(element).setView([7.8731, 80.7718], 7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(routeMap);
  const points = [];
  for (const [index, order] of activeOrders().slice(0, 8).entries()) {
    const point = await geocodeAddress(order.shippingAddress);
    if (!point) continue;
    points.push([point.lat, point.lon]);
    L.marker([point.lat, point.lon]).addTo(routeMap).bindPopup(`<strong>Stop ${index + 1}: ${esc(order.customerName || 'Customer')}</strong><br>${esc(order.shippingAddress || '')}<br><small>${esc(statusLabel(order.status))}</small>`);
  }
  if (points.length > 1) L.polyline(points, { color: '#ee6b2f', weight: 4, dashArray: '8 8' }).addTo(routeMap);
  if (points.length) routeMap.fitBounds(points, { padding: [30, 30], maxZoom: 14 });
  else L.popup().setLatLng([7.8731, 80.7718]).setContent('No geocoded delivery addresses yet.').openOn(routeMap);
}

function renderFinance() {
  const delivered = state.orders.filter((order) => String(order.status || '').toUpperCase() === 'DELIVERED');
  return `<div class="section-row"><div><h2>Driver finance</h2><p>Every completed delivery earns 3% of the order total.</p></div><button id="export" class="primary-button">Export earnings</button></div><div class="grid finance-stats"><article class="card finance-stat"><span>Total earnings</span><strong>${money(state.earnings)}</strong><small>Database calculated</small></article><article class="card finance-stat"><span>Delivery pay</span><strong>${money(state.earnings)}</strong><small>3% commission</small></article><article class="card finance-stat"><span>Tips</span><strong>$0.00</strong><small>No tips recorded</small></article></div><div class="grid finance-grid"><article class="card"><div class="card-header"><div><h3>Earnings history</h3><p>Delivered orders only</p></div></div>${delivered.map((order) => `<div class="activity"><div><strong>${esc(order.orderNumber)}</strong><span>${esc(order.deliveredAt || order.updatedAt || '')}</span></div><b class="positive">+ ${money(earning(order))}</b></div>`).join('') || '<div class="empty">No completed deliveries yet.</div>'}</article></div>`;
}

function renderSettings() {
  const driver = state.driver;
  return `<div class="section-row"><div><h2>Driver profile and settings</h2><p>Availability is saved in the database and controls automatic assignment.</p></div></div><div class="grid settings-grid"><article class="card"><div class="card-header"><div><h3>Driver profile</h3><p>Current account information</p></div></div><div class="setting-row"><span><strong>${esc(driver.name || 'Driver')}</strong><small>${esc(driver.email || '')}</small></span></div><div class="setting-row"><span><strong>Vehicle</strong><small>${esc(driver.vehicleNumber || 'Not provided')}</small></span></div><div class="setting-row"><span><strong>Phone</strong><small>${esc(driver.phoneNumber || 'Not provided')}</small></span></div></article><article class="card"><h3>Work availability</h3><div class="setting-row"><span><strong>${state.online ? 'Online' : 'Offline'}</strong><small>${state.online ? 'You can receive automatic assignments.' : 'You will not receive new assignments.'}</small></span><button id="settings-availability" type="button" class="toggle ${state.online ? 'on' : ''}" aria-checked="${state.online}"><i></i></button></div></article></div>`;
}

function notifications() {
  return state.orders.filter((order) => !terminal(order)).map((order) => ({ order, title: `Order ${order.orderNumber || order.id} needs delivery`, text: `${order.customerName || 'Customer'} · ${order.shippingAddress || 'Address unavailable'}` }));
}
function renderNotifications() {
  const items = notifications(); $('#notification-badge').textContent = items.length; $('#top-notification-badge').textContent = items.length;
  return `<div class="section-row"><div><h2>Notifications</h2><p>Live alerts generated from assigned orders.</p></div></div><div class="grid notification-grid"><article class="card">${items.map(({ order, title, text }) => `<div class="notification"><span class="notification-icon">!</span><div><strong>${esc(title)}</strong><p>${esc(text)}</p><time>${esc(order.updatedAt || order.createdAt || '')}</time></div><button class="action-button" data-view="${order.id}">View</button></div>`).join('') || '<div class="empty">No pending delivery alerts.</div>'}</article></div>`;
}

function render() {
  const meta = { dashboard: ['Dashboard', 'Your live delivery progress', 'All information below comes from the database.'], orders: ['Orders', 'Assigned orders', 'Manage the orders assigned to you.'], delivery: ['Delivery', 'Your delivery route', 'Follow your active stops and update outcomes.'], finance: ['Finance', 'Driver earnings', 'Track your 3% delivery earnings.'], settings: ['Settings', 'Driver profile and settings', 'Manage availability and account information.'], notifications: ['Notifications', 'Delivery alerts', 'Orders and updates that need your attention.'] };
  if (!meta[route]) route = 'dashboard';
  document.querySelectorAll('.view').forEach((view) => { view.hidden = view.id !== `${route}-view`; });
  document.querySelectorAll('[data-route]').forEach((link) => link.classList.toggle('active', link.dataset.route === route));
  $('#route-title').textContent = meta[route][0]; $('#greeting').textContent = meta[route][1]; $('#subtitle').textContent = meta[route][2];
  const views = { dashboard: renderDashboard, orders: renderOrders, delivery: renderDelivery, finance: renderFinance, settings: renderSettings, notifications: renderNotifications };
  $(`#${route}-view`).innerHTML = views[route](); bindView(); syncHeader();
  if (route === 'delivery') initializeRouteMap();
}

function openOrder(order) {
  const current = String(order.status || 'CONFIRMED').toUpperCase();
  const options = current === 'SHIPPED' || current === 'CONFIRMED' || current === 'PROCESSING' ? ['IN_TRANSIT', 'FAILED', 'CUSTOMER_UNAVAILABLE'] : current === 'IN_TRANSIT' ? ['OUT_FOR_DELIVERY', 'FAILED', 'CUSTOMER_UNAVAILABLE'] : current === 'OUT_FOR_DELIVERY' ? ['DELIVERED', 'FAILED', 'CUSTOMER_UNAVAILABLE'] : [];
  $('#modal').innerHTML = `<h2>${esc(order.orderNumber || order.id)}</h2><p>${esc((order.items || []).map((item) => `${item.productName} x${item.quantity}`).join(', '))}</p><div class="payout-row"><span>Customer</span><strong>${esc(order.customerName || 'Customer')}</strong></div><div class="payout-row"><span>Drop-off</span><strong>${esc(order.shippingAddress || 'Address unavailable')}</strong></div><div class="payout-row"><span>Current status</span><strong>${statusLabel(current)}</strong></div><div class="field"><span>New status</span><select id="driver-status">${options.map((status) => `<option value="${status}">${statusLabel(status)}</option>`).join('')}</select></div><div class="field"><span>Delivery note</span><textarea id="driver-note" rows="3" placeholder="Add a delivery note or reason"></textarea></div><div class="field"><span>Optional delivery photo</span><input id="driver-proof" type="file" accept="image/*"></div><div class="modal-actions"><button id="close-modal" class="outline-button">Close</button>${options.length ? '<button id="save-driver-status" class="primary-button">Confirm update</button>' : ''}</div>`;
  $('#modal-layer').hidden = false; $('#close-modal').onclick = closeModal; $('#save-driver-status')?.addEventListener('click', () => saveStatus(order));
}

async function saveStatus(order) {
  const form = new FormData(); form.append('status', $('#driver-status').value); form.append('note', $('#driver-note').value || '');
  const proof = $('#driver-proof').files?.[0]; if (proof) form.append('proof', proof);
  const button = $('#save-driver-status'); button.disabled = true;
  try { await api(`/api/driver/${encodeURIComponent(session.id)}/orders/${encodeURIComponent(order.id)}/status`, { method: 'PATCH', body: form }); closeModal(); toast('Order status updated for customer and seller views.'); await loadDashboard(); }
  catch (error) { toast(error.message); button.disabled = false; }
}
function closeModal() { $('#modal-layer').hidden = true; }

function bindView() {
  document.querySelectorAll('[data-go]').forEach((button) => button.onclick = () => { route = button.dataset.go; render(); });
  $('#order-query')?.addEventListener('input', (event) => { query = event.target.value; render(); });
  $('#status-filter')?.addEventListener('change', (event) => { filter = event.target.value; render(); });
  document.querySelectorAll('[data-view]').forEach((button) => button.onclick = () => { const order = state.orders.find((item) => String(item.id) === String(button.dataset.view)); if (order) openOrder(order); });
  $('#settings-availability')?.addEventListener('click', toggleAvailability);
  $('#export')?.addEventListener('click', () => toast('Export is available from the live earnings data shown here.'));
}

async function toggleAvailability() {
  const online = !state.online;
  try { const result = await api(`/api/driver/${encodeURIComponent(session.id)}/availability`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ online }) }); state.online = result.online; syncHeader(); render(); toast(result.message); }
  catch (error) { toast(error.message); }
}

function init() {
  session = JSON.parse(localStorage.getItem('jb_user') || 'null');
  if (!session || !['driver', 'delivery'].includes(String(session.role || '').toLowerCase())) { window.location.replace('/HTML/login.html'); return; }
  document.querySelectorAll('[data-route]').forEach((link) => link.onclick = (event) => { event.preventDefault(); route = link.dataset.route; render(); });
  $('#global-search').onsubmit = (event) => { event.preventDefault(); query = $('#global-query').value.trim(); route = 'orders'; render(); };
  $('#notifications').onclick = () => { route = 'notifications'; render(); };
  $('#profile').onclick = () => { route = 'settings'; render(); };
  $('#availability').onclick = toggleAvailability;
  $('#theme').onclick = () => { document.body.classList.toggle('dark'); localStorage.setItem('jb_driver_theme', document.body.classList.contains('dark') ? 'dark' : 'light'); };
  if (localStorage.getItem('jb_driver_theme') === 'dark') document.body.classList.add('dark');
  $('#logout').onclick = () => { localStorage.removeItem('jb_user'); localStorage.removeItem('jb_seller'); window.location.href = '/HTML/login.html'; };
  $('#menu').onclick = () => { $('#driver-sidebar').classList.add('open'); $('#backdrop').classList.add('open'); };
  $('#backdrop').onclick = () => { $('#driver-sidebar').classList.remove('open'); $('#backdrop').classList.remove('open'); };
  $('#modal-layer').onclick = (event) => { if (event.target.id === 'modal-layer') closeModal(); };
  window.addEventListener('hashchange', () => { route = location.hash.slice(1) || 'dashboard'; render(); });
  route = location.hash.slice(1) || 'dashboard';
  loadDashboard().catch((error) => { toast(error.message); render(); });
}

document.addEventListener('DOMContentLoaded', init);
