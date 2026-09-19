// ============================================
// JustBuy — Seller Dashboard
// Uses the same Store (theme, currency, toast) as the storefront.
// Charts are plain SVG — no extra libraries needed.
// ============================================

import { Store } from './store.js';
import { ShaderGradient } from './shader-gradient.js';

// ── Config ──────────────────────────────────────────
const CONFIG = {
  // Set to true to pull products/orders from the Spring Boot API
  // (/api/products, /api/orders). Falls back to mock data if it fails.
  useLiveApi: false,
  lowStockThreshold: 10,
  commissionRate: 0.10,
  storeName: 'TechNova Store',
  storeLogo: 'https://picsum.photos/seed/technova/80/80'
};

const IMG = 'https://picsum.photos/seed/';
const COLORS = ['#F26B1D', '#C2532D', '#F5A623', '#8B7355', '#6B7B5C', '#7B6F8A'];

// ── Small helpers ───────────────────────────────────
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

function money(n, dec) {
  const info = Store.getCurrencyInfo();
  const d = dec ?? (Store.state.currency === 'JPY' ? 0 : 2);
  const v = Number(n) * info.rate;
  return info.symbol + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function compact(v) {
  if (v >= 1000) return `${+(v / 1000).toFixed(1)}k`;
  return `${+v.toFixed(v < 10 ? 1 : 0)}`;
}
function moneyAxis(n) {
  const info = Store.getCurrencyInfo();
  return info.symbol + compact(n * info.rate);
}
function initials(name) {
  return String(name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}
function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (!t) return '';
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

// ── Mock data (matches the seeded TechNova products) ─
function buildMock() {
  const daySales    = [38, 52, 41, 60, 47, 66, 72, 44, 58, 63, 55, 71, 79, 64];
  const dayOrders   = [1, 2, 1, 1, 1, 2, 2, 1, 1, 2, 1, 2, 2, 2];
  const weekSales   = [240, 255, 262, 280, 290, 305, 300, 318, 325, 340, 352, 331];
  const weekOrders  = [5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 8];
  const monthSales  = [700, 760, 740, 850, 930, 980, 1040, 1120, 1190, 1240, 1520, 1380];
  const monthOrders = [14, 15, 15, 17, 18, 19, 21, 22, 23, 25, 27, 32];

  return {
    series: {
      day:   { sales: daySales,   orders: dayOrders },
      week:  { sales: weekSales,  orders: weekOrders },
      month: { sales: monthSales, orders: monthOrders }
    },
    productCount: 86,
    pendingOrders: 12,
    pendingDeliveries: 7,
    newReviews: 6,
    pendingWithdrawals: { count: 1, amount: 450 },
    categories: [
      { name: 'Wearables', value: 3066 },
      { name: 'Audio', value: 2969.67 },
      { name: 'Tablets', value: 2443 },
      { name: 'Accessories', value: 1633.62 },
      { name: 'Lighting', value: 1559.76 },
      { name: 'Other', value: 777.95 }
    ],
    topProducts: [
      { name: 'ZenWatch 3 — Minimalist Smart Watch', units: 14, revenue: 3066, img: 'watch' },
      { name: 'AuraSound Pro Wireless Earbuds', units: 33, revenue: 2969.67, img: 'earbuds' },
      { name: 'SlimPad Ultra Tablet 11"', units: 7, revenue: 2443, img: 'tablet' },
      { name: 'MicroHub 8-in-1 USB-C Dock', units: 38, revenue: 1633.62, img: 'hub' },
      { name: 'FocusDesk Lamp — Wireless Charging', units: 24, revenue: 1559.76, img: 'lamp' }
    ],
    recentOrders: [
      { id: 'JB-10240', customer: 'Nimali Perera', items: 'AuraSound Pro Wireless Earbuds', total: 89.99, status: 'pending', time: '4 min ago' },
      { id: 'JB-10239', customer: 'Kasun Ranasinghe', items: 'ZenWatch 3 — Minimalist Smart Watch', total: 219, status: 'processing', time: '38 min ago' },
      { id: 'JB-10238', customer: 'Amara Silva', items: 'MicroHub 8-in-1 USB-C Dock × 2', total: 85.98, status: 'shipped', time: '2 h ago' },
      { id: 'JB-10237', customer: 'Dinuk Wijesinghe', items: 'SlimPad Ultra Tablet 11"', total: 349, status: 'pending', time: '3 h ago' },
      { id: 'JB-10236', customer: 'Shanika Fernando', items: 'FocusDesk Lamp — Wireless Charging', total: 64.99, status: 'delivered', time: 'Yesterday' },
      { id: 'JB-10235', customer: 'Ravi Mendis', items: 'AuraSound Pro Wireless Earbuds × 2', total: 179.98, status: 'cancelled', time: 'Yesterday' }
    ],
    lowStock: [
      { name: 'AuraSound Pro Earbuds', variant: 'Midnight Black', stock: 0 },
      { name: 'MicroHub USB-C Dock', variant: 'Space Gray', stock: 0 },
      { name: 'SlimPad Ultra Tablet', variant: 'Silver', stock: 3 },
      { name: 'FocusDesk Lamp', variant: 'White', stock: 4 },
      { name: 'ZenWatch 3', variant: '45mm · Gold', stock: 5 },
      { name: 'AuraSound Pro Earbuds', variant: 'Rose Gold', stock: 6 },
      { name: 'MicroHub USB-C Dock', variant: 'Silver', stock: 8 }
    ],
    messages: [
      { from: 'Nimali Perera', text: 'Hi! Does the earbuds case come with a USB-C cable?', time: '12 min ago', unread: true },
      { from: 'Kasun Ranasinghe', text: 'Can I change the strap size on my ZenWatch order?', time: '1 h ago', unread: true },
      { from: 'Amara Silva', text: 'Thanks, the dock arrived. Works great.', time: '5 h ago', unread: true },
      { from: 'Dinuk Wijesinghe', text: 'Is the tablet stylus included in the box?', time: 'Yesterday', unread: true },
      { from: 'Shanika Fernando', text: 'Where can I download the invoice?', time: '2 d ago', unread: false }
    ],
    reviews: [
      { product: 'ZenWatch 3', rating: 5, text: 'Ceramic bezel feels premium and the battery easily lasts 5 days.', who: 'Sarah L.', time: '2 h ago' },
      { product: 'AuraSound Pro Earbuds', rating: 4, text: 'Great sound and ANC. The app could use some polish.', who: 'David K.', time: '6 h ago' },
      { product: 'MicroHub USB-C Dock', rating: 5, text: 'Plug and play, all 8 ports work with my laptop.', who: 'Omar R.', time: 'Yesterday' },
      { product: 'FocusDesk Lamp', rating: 3, text: 'Good lamp, but the wireless charger runs a bit warm.', who: 'Chris W.', time: '2 d ago' }
    ],
    notifications: [
      { icon: '🛒', text: 'New order JB-10240 from Nimali Perera', time: '4 min ago', unread: true },
      { icon: '📦', text: 'SlimPad Ultra Tablet is low on stock (3 left)', time: '1 h ago', unread: true },
      { icon: '💬', text: 'Kasun Ranasinghe sent you a message', time: '1 h ago', unread: true },
      { icon: '⭐', text: 'New 5-star review on ZenWatch 3', time: '2 h ago', unread: false },
      { icon: '🏦', text: 'Withdrawal request received and pending review', time: 'Yesterday', unread: false }
    ]
  };
}

// Optional: replace some of the mock data with real API data
async function tryLive(data) {
  try {
    const [p, o] = await Promise.all([
      fetch('/api/products?size=200'),
      fetch('/api/orders')
    ]);

    if (p.ok) {
      const j = await p.json();
      const list = Array.isArray(j) ? j : (j.products || []);
      if (list.length) {
        data.productCount = list.length;
        data.lowStock = list
          .filter((x) => (x.stock ?? 0) <= CONFIG.lowStockThreshold)
          .map((x) => ({ name: x.name, variant: x.category?.name || '', stock: x.stock ?? 0 }));
      }
    }

    if (o.ok) {
      const list = await o.json();
      if (Array.isArray(list) && list.length) {
        data.recentOrders = list.slice(-6).reverse().map((x) => ({
          id: x.orderNumber || `JB-${x.id}`,
          customer: x.customerName || 'Customer',
          items: (x.items || []).map((i) => i.productName).join(', ') || '—',
          total: Number(x.total) || 0,
          status: String(x.status || 'pending').toLowerCase(),
          time: timeAgo(x.createdAt)
        }));
        data.pendingOrders = list.filter((x) => ['PENDING', 'CONFIRMED'].includes(x.status)).length;
      }
    }
  } catch (e) {
    console.warn('Live API unavailable, using mock dashboard data:', e);
  }
}

// ── State ───────────────────────────────────────────
let data;
const state = { period: 'day' };
let currentRoute = 'dashboard';

const PERIODS = {
  day:   { caption: 'Last 14 days',   labels: () => dateLabels(14, 1, { month: 'short', day: 'numeric' }) },
  week:  { caption: 'Last 12 weeks',  labels: () => dateLabels(12, 7, { month: 'short', day: 'numeric' }) },
  month: { caption: 'Last 12 months', labels: () => monthLabels(12) }
};

function dateLabels(n, stepDays, opts) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * stepDays);
    out.push(d.toLocaleDateString('en-US', opts));
  }
  return out;
}
function monthLabels(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    out.push(d.toLocaleDateString('en-US', { month: 'short' }));
  }
  return out;
}

// ── Sidebar navigation ──────────────────────────────
// Add real page URLs in `href` when the other seller pages exist.
const NAV = [
  { label: 'Dashboard', icon: '📊', key: 'dashboard' },
  { label: 'Sales', icon: '🛒', children: [
    { label: 'Orders', key: 'sales-orders' },
    { label: 'Returns & Refunds', key: 'sales-returns' },
    { label: 'Cancellations', key: 'sales-cancellations' }] },
  { label: 'Products', icon: '📦', children: [
    { label: 'All Products', key: 'products-all' },
    { label: 'Add Product', key: 'products-add' },
    { label: 'Categories', key: 'products-categories' },
    { label: 'Attributes', key: 'products-attributes' },
    { label: 'Inventory', key: 'products-inventory' }] },
  { label: 'Delivery', icon: '🚚', children: [
    { label: 'All Deliveries', key: 'delivery-all' },
    { label: 'Processing', key: 'delivery-processing' },
    { label: 'Shipped', key: 'delivery-shipped' },
    { label: 'Out for Delivery', key: 'delivery-out' },
    { label: 'Delivered', key: 'delivery-delivered' }] },
  { label: 'Messages', icon: '💬', badge: 'messages', key: 'messages' },
  { label: 'Finance', icon: '💰', children: [
    { label: 'Sales', key: 'finance-sales' },
    { label: 'Earnings', key: 'finance-earnings' },
    { label: 'Commissions', key: 'finance-commissions' },
    { label: 'Withdrawals', key: 'finance-withdrawals' }] },
  { label: 'Marketing', icon: '🏷️', children: [
    { label: 'Discounts', key: 'marketing-discounts' },
    { label: 'Coupons', key: 'marketing-coupons' },
    { label: 'Vouchers', key: 'marketing-vouchers' }] },
  { label: 'Store', icon: '⭐', children: [
    { label: 'My Store', key: 'store-mystore' },
    { label: 'Reviews', key: 'store-reviews' },
    { label: 'Analytics', key: 'store-analytics' }] },
  { label: 'Settings', icon: '⚙️', children: [
    { label: 'Profile', key: 'settings-profile' },
    { label: 'Store Settings', key: 'settings-store' },
    { label: 'Payment', key: 'settings-payment' },
    { label: 'Delivery', key: 'settings-delivery' },
    { label: 'Shop Managers', key: 'settings-managers' },
    { label: 'Security', key: 'settings-security' },
    { label: 'Vacation Mode', key: 'settings-vacation' }] }
];

// Flat lookup of every route -> its label + group label, used for the
// topbar title/subtitle when a page (rather than the Dashboard) is open.
const ROUTE_META = {};
NAV.forEach((item) => {
  if (item.children) {
    item.children.forEach((c) => { ROUTE_META[c.key] = { label: c.label, group: item.label }; });
  } else {
    ROUTE_META[item.key] = { label: item.label, group: null };
  }
});

function renderNav() {
  const unread = data.messages.filter((m) => m.unread).length;
  const link = (item) => {
    const active = currentRoute === item.key;
    return `<a href="#/${item.key}" class="${active ? 'active' : ''}" ${active ? 'aria-current="page"' : ''}>${esc(item.label)}</a>`;
  };

  $('#sd-nav').innerHTML = NAV.map((item, i) => {
    if (item.children) {
      const isOpenGroup = item.children.some((c) => c.key === currentRoute);
      return `
        <div class="sd-nav-group ${isOpenGroup ? 'open' : ''}" data-group="${i}">
          <button class="sd-nav-toggle" aria-expanded="${isOpenGroup}" aria-controls="sd-sub-${i}">
            <span class="sd-nav-icon" aria-hidden="true">${item.icon}</span>
            <span>${esc(item.label)}</span>
            <span class="sd-chevron" aria-hidden="true">▶</span>
          </button>
          <div class="sd-subnav" id="sd-sub-${i}">
            <div class="sd-subnav-inner">
              ${item.children.map((c) => link(c)).join('')}
            </div>
          </div>
        </div>`;
    }
    const count = item.badge === 'messages' && unread ? `<span class="sd-nav-count">${unread}</span>` : '';
    const active = currentRoute === item.key;
    return `
      <a href="#/${item.key}" class="sd-nav-link ${active ? 'active' : ''}" ${active ? 'aria-current="page"' : ''}>
        <span class="sd-nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${esc(item.label)}</span>${count}
      </a>`;
  }).join('');
}

// ── Summary cards ───────────────────────────────────
function spark(values, color) {
  const W = 96, H = 32;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - 3 - ((v - min) / range) * (H - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg class="sd-spark" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>
  </svg>`;
}

function totals() {
  const m = data.series.month;
  const totalSales = sum(m.sales);
  return {
    totalSales,
    totalOrders: sum(m.orders),
    earnings: totalSales * (1 - CONFIG.commissionRate),
    monthlySales: m.sales[m.sales.length - 1],
    todaySales: data.series.day.sales.at(-1),
    todayOrders: data.series.day.orders.at(-1)
  };
}

function renderStats() {
  const t = totals();
  const d = data.series.day;
  const net = d.sales.map((v) => v * (1 - CONFIG.commissionRate));
  const cards = [
    { icon: '💰', label: 'Total sales', value: money(t.totalSales, 0), delta: '▲ 12.4%', tone: 'up', foot: 'Last 12 months', line: d.sales },
    { icon: '🛒', label: 'Total orders', value: t.totalOrders.toLocaleString('en-US'), delta: '▲ 8.1%', tone: 'up', foot: 'Last 12 months', line: d.orders },
    { icon: '📦', label: 'Products', value: String(data.productCount), delta: '▲ 3 new', tone: 'up', foot: 'Listed in your store', line: [70, 72, 75, 78, 80, 83, data.productCount] },
    { icon: '💵', label: 'Earnings', value: money(t.earnings, 0), delta: '▲ 11.8%', tone: 'up', foot: `After ${Math.round(CONFIG.commissionRate * 100)}% commission`, line: net }
  ];

  $('#sd-stats').innerHTML = cards.map((c) => `
    <article class="sd-stat glass">
      <div class="sd-stat-top">
        <span class="sd-stat-icon" aria-hidden="true">${c.icon}</span>
        <span class="sd-delta ${c.tone}">${c.delta}</span>
      </div>
      <p class="sd-stat-label">${c.label}</p>
      <p class="sd-stat-value">${c.value}</p>
      <div class="sd-stat-foot"><span>${c.foot}</span>${spark(c.line, 'var(--accent-orange)')}</div>
    </article>
  `).join('');
}

// ── Metric tiles ────────────────────────────────────
function renderMetrics() {
  const t = totals();
  const unread = data.messages.filter((m) => m.unread).length;
  const out = data.lowStock.filter((p) => p.stock === 0).length;
  const low = data.lowStock.length - out;

  const tiles = [
    { icon: '💵', label: "Today's sales", value: money(t.todaySales), route: 'finance-sales' },
    { icon: '🧾', label: "Today's orders", value: t.todayOrders, route: 'sales-orders' },
    { icon: '📅', label: 'Monthly sales', value: money(t.monthlySales, 0), route: 'finance-sales' },
    { icon: '⏳', label: 'Pending orders', value: data.pendingOrders, tone: 'warn', route: 'sales-orders' },
    { icon: '🚚', label: 'Pending deliveries', value: data.pendingDeliveries, tone: 'warn', route: 'delivery-all' },
    { icon: '📉', label: 'Low-stock products', value: low, tone: low ? 'warn' : '', route: 'products-inventory' },
    { icon: '🚫', label: 'Out-of-stock products', value: out, tone: out ? 'danger' : '', route: 'products-inventory' },
    { icon: '💬', label: 'Unread messages', value: unread, tone: unread ? 'warn' : '', route: 'messages' },
    { icon: '⭐', label: 'New reviews', value: data.newReviews, route: 'store-reviews' },
    { icon: '🏦', label: 'Pending withdrawals', value: data.pendingWithdrawals.count, tone: data.pendingWithdrawals.count ? 'warn' : '', route: 'finance-withdrawals' }
  ];

  $('#sd-metrics').innerHTML = tiles.map((m) => `
    <a href="#/${m.route}" class="sd-metric glass ${m.tone || ''}">
      <span class="sd-metric-icon" aria-hidden="true">${m.icon}</span>
      <span class="sd-metric-body">
        <span class="sd-metric-value">${esc(m.value)}</span>
        <span class="sd-metric-label">${esc(m.label)}</span>
      </span>
    </a>
  `).join('');
}

// ── Charts (plain SVG) ──────────────────────────────
function niceScale(max, ticks = 4) {
  const raw = max / ticks;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  return { step, max: Math.ceil(max / step) * step };
}

function chartFrame(el, values, height) {
  const W = Math.max(260, el.clientWidth);
  const m = { t: 14, r: 14, b: 28, l: 46 };
  const iw = W - m.l - m.r;
  const ih = height - m.t - m.b;
  const { step, max } = niceScale(Math.max(...values, 1));
  const y = (v) => m.t + ih - (v / max) * ih;
  return { W, H: height, m, iw, ih, step, max, y };
}

function gridAndAxis(f, axisFmt) {
  let out = '';
  const ticks = Math.round(f.max / f.step);
  for (let k = 0; k <= ticks; k++) {
    const v = k * f.step;
    out += `<line class="sd-grid" x1="${f.m.l}" x2="${f.W - f.m.r}" y1="${f.y(v)}" y2="${f.y(v)}"/>
            <text class="sd-axis" x="${f.m.l - 8}" y="${f.y(v) + 4}" text-anchor="end">${esc(axisFmt(v))}</text>`;
  }
  return out;
}

function xLabels(f, labels, xAt) {
  const n = labels.length;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(f.iw / 64))));
  return labels.map((l, i) => ((n - 1 - i) % every === 0
    ? `<text class="sd-axis" x="${xAt(i)}" y="${f.H - 8}" text-anchor="middle">${esc(l)}</text>` : '')).join('');
}

function lineChart(el, { labels, values, color, fmt, axisFmt, label, height = 250 }) {
  const f = chartFrame(el, values, height);
  const n = values.length;
  const x = (i) => f.m.l + (n === 1 ? f.iw / 2 : (i * f.iw) / (n - 1));
  const colW = n === 1 ? f.iw : f.iw / (n - 1);

  let d = `M${x(0)},${f.y(values[0])}`;
  for (let i = 1; i < n; i++) {
    const cx = (x(i - 1) + x(i)) / 2;
    d += ` C${cx},${f.y(values[i - 1])} ${cx},${f.y(values[i])} ${x(i)},${f.y(values[i])}`;
  }
  const area = `${d} L${x(n - 1)},${f.y(0)} L${x(0)},${f.y(0)} Z`;
  const gid = `sd-grad-${label.replace(/\W/g, '')}`;

  const cols = values.map((v, i) => {
    const tip = esc(`${esc(labels[i])}<strong>${esc(fmt(v))}</strong>`);
    return `<g class="sd-col" data-tip="${tip}">
      <rect class="sd-hit" x="${x(i) - colW / 2}" y="${f.m.t}" width="${colW}" height="${f.ih}"/>
      <line class="sd-guide" x1="${x(i)}" x2="${x(i)}" y1="${f.m.t}" y2="${f.m.t + f.ih}"/>
      <circle class="sd-dot" cx="${x(i)}" cy="${f.y(v)}" r="4.5" style="stroke:${color}"/>
    </g>`;
  }).join('');

  el.innerHTML = `
    <svg viewBox="0 0 ${f.W} ${f.H}" width="${f.W}" height="${f.H}" role="img" aria-label="${esc(label)} chart">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:${color};stop-opacity:.28"/>
          <stop offset="1" style="stop-color:${color};stop-opacity:0"/>
        </linearGradient>
      </defs>
      ${gridAndAxis(f, axisFmt)}
      <path d="${area}" fill="url(#${gid})"/>
      <path d="${d}" fill="none" style="stroke:${color}" stroke-width="2.5" stroke-linecap="round"/>
      ${xLabels(f, labels, x)}
      ${cols}
    </svg>`;
}

function barChart(el, { labels, values, color, fmt, axisFmt, label, height = 250 }) {
  const f = chartFrame(el, values, height);
  const n = values.length;
  const slot = f.iw / n;
  const bw = Math.min(28, slot * 0.62);
  const x = (i) => f.m.l + slot * i + slot / 2;

  const bars = values.map((v, i) => {
    const x0 = x(i) - bw / 2, x1 = x0 + bw;
    const yt = f.y(v), yb = f.y(0);
    const r = Math.max(0, Math.min(5, bw / 2, yb - yt));
    const path = `M${x0},${yb} V${yt + r} Q${x0},${yt} ${x0 + r},${yt} H${x1 - r} Q${x1},${yt} ${x1},${yt + r} V${yb} Z`;
    const tip = esc(`${esc(labels[i])}<strong>${esc(fmt(v))}</strong>`);
    return `<g class="sd-col" data-tip="${tip}">
      <rect class="sd-hit" x="${f.m.l + slot * i}" y="${f.m.t}" width="${slot}" height="${f.ih}"/>
      <path class="sd-bar" d="${path}" style="fill:${color}"/>
    </g>`;
  }).join('');

  el.innerHTML = `
    <svg viewBox="0 0 ${f.W} ${f.H}" width="${f.W}" height="${f.H}" role="img" aria-label="${esc(label)} chart">
      ${gridAndAxis(f, axisFmt)}
      ${bars}
      ${xLabels(f, labels, x)}
    </svg>`;
}

function renderDonut() {
  const items = data.categories;
  const total = sum(items.map((i) => i.value));
  const R = 70, C = 2 * Math.PI * R;
  let offset = 0;

  const arcs = items.map((it, i) => {
    const len = (it.value / total) * C;
    const dash = Math.max(0, len - 2);
    const seg = `<circle cx="90" cy="90" r="${R}" fill="none" stroke="${COLORS[i % COLORS.length]}" stroke-width="22"
      stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 90 90)"/>`;
    offset += len;
    return seg;
  }).join('');

  $('#sd-donut').innerHTML = `
    <div class="sd-donut-wrap">
      <svg class="sd-donut-svg" viewBox="0 0 180 180" role="img" aria-label="Sales by category">
        ${arcs}
        <text class="sd-donut-total" x="90" y="92" text-anchor="middle">${esc(moneyAxis(total))}</text>
        <text class="sd-donut-caption" x="90" y="110" text-anchor="middle">total sales</text>
      </svg>
      <ul class="sd-legend">
        ${items.map((it, i) => `
          <li><i style="background:${COLORS[i % COLORS.length]}"></i>${esc(it.name)}
            <b>${Math.round((it.value / total) * 100)}%</b></li>`).join('')}
      </ul>
    </div>`;
}

function renderTopProducts() {
  const max = Math.max(...data.topProducts.map((p) => p.revenue));
  $('#sd-top-products').innerHTML = data.topProducts.map((p) => `
    <li class="sd-top-item">
      <img src="${IMG}${esc(p.img)}/96/96" alt="" loading="lazy" />
      <div>
        <div class="sd-top-row"><strong>${esc(p.name)}</strong><span>${money(p.revenue, 0)}</span></div>
        <div class="sd-top-meta">${p.units} sold</div>
        <div class="sd-meter"><span style="width:${(p.revenue / max) * 100}%"></span></div>
      </div>
    </li>
  `).join('');
}

function renderCharts() {
  const cfg = PERIODS[state.period];
  const s = data.series[state.period];
  const labels = cfg.labels();
  const revenue = s.sales.map((v) => +(v * (1 - CONFIG.commissionRate)).toFixed(2));

  $('#sd-period-caption').textContent = cfg.caption;
  $('#sd-sales-total').textContent = `${money(sum(s.sales), 0)} in this period`;
  $('#sd-orders-total').textContent = `${sum(s.orders)} orders in this period`;
  $('#sd-revenue-total').textContent = `${money(sum(revenue), 0)} after commission`;

  lineChart($('#sd-chart-sales'), {
    labels, values: s.sales, color: '#F26B1D', label: 'Sales',
    fmt: (v) => money(v), axisFmt: moneyAxis
  });
  barChart($('#sd-chart-orders'), {
    labels, values: s.orders, color: '#C2532D', label: 'Orders',
    fmt: (v) => `${v} order${v === 1 ? '' : 's'}`, axisFmt: (v) => String(v)
  });
  lineChart($('#sd-chart-revenue'), {
    labels, values: revenue, color: '#6B7B5C', label: 'Revenue',
    fmt: (v) => money(v), axisFmt: moneyAxis, height: 250
  });
}

// ── Recent activity ─────────────────────────────────
const STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled'
};

function renderRecentOrders() {
  const rows = data.recentOrders;
  if (!rows.length) {
    $('#sd-recent-orders').innerHTML = '<p class="sd-empty">No orders yet. New orders will show up here.</p>';
    return;
  }
  $('#sd-recent-orders').innerHTML = `
    <table class="sd-table">
      <thead>
        <tr><th>Order</th><th>Customer</th><th>Products</th><th class="sd-num">Total</th><th>Status</th><th><span class="sd-sr-only">Action</span></th></tr>
      </thead>
      <tbody>
        ${rows.map((o) => `
          <tr>
            <td><span class="sd-order-id">${esc(o.id)}</span><br><small>${esc(o.time)}</small></td>
            <td><span class="sd-cell-user"><span class="sd-avatar" aria-hidden="true">${esc(initials(o.customer))}</span>${esc(o.customer)}</span></td>
            <td><div class="sd-order-items" title="${esc(o.items)}">${esc(o.items)}</div></td>
            <td class="sd-num">${money(o.total)}</td>
            <td><span class="sd-pill ${esc(o.status)}">${esc(STATUS_LABEL[o.status] || o.status)}</span></td>
            <td><button class="btn btn-glass btn-sm" data-view-order="${esc(o.id)}">View</button></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderLowStock() {
  const items = [...data.lowStock].sort((a, b) => a.stock - b.stock).slice(0, 5);
  if (!items.length) {
    $('#sd-low-stock').innerHTML = '<li class="sd-empty">All products are well stocked.</li>';
    return;
  }
  $('#sd-low-stock').innerHTML = items.map((p) => {
    const kind = p.stock === 0 ? 'out' : 'low';
    const pct = Math.min(100, (p.stock / CONFIG.lowStockThreshold) * 100);
    return `
      <li class="sd-stock-item ${kind}">
        <div class="sd-stock-info"><strong>${esc(p.name)}</strong><span>${esc(p.variant)}</span></div>
        <a class="btn btn-glass btn-sm" href="#/products-inventory">Restock</a>
        <div class="sd-stock-meter">
          <div class="sd-meter"><span style="width:${Math.max(pct, 3)}%"></span></div>
          <span class="sd-stock-count ${kind}">${p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</span>
        </div>
      </li>`;
  }).join('');
}

function renderFeeds() {
  $('#sd-messages').innerHTML = data.messages.slice(0, 4).map((m) => `
    <li>
      <span class="sd-avatar" aria-hidden="true">${esc(initials(m.from))}</span>
      <div class="sd-feed-body">
        <div class="sd-feed-title"><span>${esc(m.from)}</span>${m.unread ? '<span class="sd-unread" aria-label="Unread"></span>' : ''}</div>
        <p class="sd-feed-text">${esc(m.text)}</p>
        <p class="sd-feed-time">${esc(m.time)}</p>
      </div>
    </li>`).join('');

  $('#sd-reviews').innerHTML = data.reviews.map((r) => `
    <li>
      <span class="sd-feed-icon" aria-hidden="true">⭐</span>
      <div class="sd-feed-body">
        <div class="sd-feed-title"><span>${esc(r.product)}</span></div>
        <span class="sd-stars" role="img" aria-label="${r.rating} out of 5">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <p class="sd-feed-text">${esc(r.text)}</p>
        <p class="sd-feed-time">${esc(r.who)} · ${esc(r.time)}</p>
      </div>
    </li>`).join('');

  $('#sd-notifications').innerHTML = data.notifications.map((n) => `
    <li>
      <span class="sd-feed-icon" aria-hidden="true">${n.icon}</span>
      <div class="sd-feed-body">
        <div class="sd-feed-title"><span>${esc(n.text)}</span>${n.unread ? '<span class="sd-unread" aria-label="Unread"></span>' : ''}</div>
        <p class="sd-feed-time">${esc(n.time)}</p>
      </div>
    </li>`).join('');

  updateBell();
}

function updateBell() {
  const c = data.notifications.filter((n) => n.unread).length;
  const badge = $('#sd-bell-count');
  badge.textContent = c;
  badge.style.display = c > 0 ? 'inline-flex' : 'none';
}

// ── Interactions ────────────────────────────────────
function setupChrome() {
  // Store + user info
  const user = Store.state.user;
  $('#sd-store-name').textContent = CONFIG.storeName;
  $('#sd-store-logo').src = CONFIG.storeLogo;
  $('#sd-user-avatar').src = user.avatar;

  const hr = new Date().getHours();
  const part = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening';
  $('#sd-greeting').textContent = `Good ${part}, ${String(user.name || 'there').split(' ')[0]}`;
  $('#sd-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  // Theme
  const themeBtn = $('#sd-theme-btn');
  const syncTheme = () => { themeBtn.textContent = Store.state.darkMode ? '☀️' : '🌙'; };
  syncTheme();
  themeBtn.addEventListener('click', () => { Store.toggleTheme(); syncTheme(); renderCharts(); });

  // Mobile sidebar
  const sidebar = $('#sd-sidebar');
  const backdrop = $('#sd-backdrop');
  const menuBtn = $('#sd-menu-btn');
  const setMenu = (open) => {
    sidebar.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  backdrop.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Collapsible nav groups
  $('#sd-nav').addEventListener('click', (e) => {
    const btn = e.target.closest('.sd-nav-toggle');
    if (!btn) return;
    const group = btn.parentElement;
    const open = group.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  // Vacation mode (shared with the Settings > Vacation Mode page — see setVacationMode)
  setVacationMode(localStorage.getItem('jb_vacation') === '1', false);
  $('#sd-vacation-switch').addEventListener('click', () => setVacationMode($('#sd-vacation-switch').getAttribute('aria-checked') !== 'true', true));
  $('#sd-vacation-off').addEventListener('click', () => setVacationMode(false, true));

  // Search — looks across products and orders, then opens the best-matching page
  $('#sd-search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#sd-search-input').value.trim();
    if (!q) return;
    performGlobalSearch(q);
  });

  // Bell -> notifications card (jump back to the dashboard first if we've navigated away)
  $('#sd-bell-btn').addEventListener('click', () => {
    if (currentRoute !== 'dashboard') { navigate('dashboard'); }
    requestAnimationFrame(() => {
      $('#sd-notifications-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Close the mobile sidebar whenever a real nav link is followed
  $('#sd-nav').addEventListener('click', (e) => {
    if (e.target.closest('a[href^="#/"]')) setMenu(false);
  });

  // Mark all read
  $('#sd-mark-read').addEventListener('click', () => {
    data.notifications.forEach((n) => { n.unread = false; });
    renderFeeds();
    Store.toast('All notifications marked as read', 'success');
  });

  // Period tabs
  $('#sd-period-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-period]');
    if (!btn) return;
    state.period = btn.dataset.period;
    document.querySelectorAll('#sd-period-tabs button').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
    });
    renderCharts();
  });

  // Placeholder links (anything not yet wired up)
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-soon]');
    if (!el) return;
    e.preventDefault();
    Store.toast(`"${el.dataset.soon}" page is coming soon`, 'info');
    setMenu(false);
  });

  // "View" on a recent order -> full order detail modal
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view-order]');
    if (!btn) return;
    openOrderDetailModal(btn.dataset.viewOrder);
  });

  // Chart tooltip (one shared element)
  const tip = $('#sd-tooltip');
  const analytics = $('#sd-analytics');
  analytics.addEventListener('mousemove', (e) => {
    const col = e.target.closest('.sd-col');
    if (!col) { tip.style.opacity = 0; return; }
    tip.innerHTML = col.dataset.tip;
    tip.style.opacity = 1;
    const w = tip.offsetWidth;
    const left = Math.min(e.clientX + 14, window.innerWidth - w - 12);
    tip.style.left = `${left}px`;
    tip.style.top = `${e.clientY - 12 - tip.offsetHeight}px`;
  });
  analytics.addEventListener('mouseleave', () => { tip.style.opacity = 0; });

  // Redraw charts when the width changes
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(renderCharts, 150);
  });
}

// ── Boot ────────────────────────────────────────────
async function init() {
  const session = JSON.parse(localStorage.getItem('jb_user') || 'null');
  if (!session || session.role !== 'seller') {
    window.location.replace('/HTML/login.html');
    return;
  }
  Store.initTheme();
  try { new ShaderGradient('bg-shader-canvas'); } catch (e) { console.warn('Shader background:', e); }

  data = buildMock();
  Object.assign(data, buildExtraMock());
  if (CONFIG.useLiveApi) await tryLive(data);

  setupChrome();
  setupExtraChrome();
  $('#sd-logout')?.addEventListener('click', (event) => {
    event.preventDefault();
    Store.logout();
    window.location.href = '/HTML/login.html';
  });
  renderNav();
  renderStats();
  renderMetrics();
  renderDonut();
  renderTopProducts();
  renderCharts();
  renderRecentOrders();
  renderLowStock();
  renderFeeds();

  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

document.addEventListener('DOMContentLoaded', init);

// ============================================================
// EXTENDED SELLER DASHBOARD — Sales, Products, Delivery, Finance,
// Marketing, Store and Settings pages.
//
// Everything below mutates the same in-memory `data` object built
// by buildMock()/buildExtraMock() — exactly like the existing
// dashboard code already does for `data.notifications` (mark all
// read) and vacation mode. Nothing here is persisted; a reload
// regenerates fresh mock data, same as today. When the real
// Spring Boot API is ready, replace the relevant data.<x> arrays
// with fetch() results the same way `tryLive()` does above, and
// swap each mutation (e.g. `o.status = val`) for the matching
// PUT/PATCH call.
// ============================================================

let ORIGINAL_GREETING = '';
let ORIGINAL_DATE = '';

// ── Extra mock data ─────────────────────────────────
function buildExtraMock() {
  const now = new Date();
  const daysAgo = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString(); };
  const user = Store.state.user || {};

  const customers = ['Nimali Perera', 'Kasun Ranasinghe', 'Amara Silva', 'Dinuk Wijesinghe',
    'Shanika Fernando', 'Ravi Mendis', 'Tharindu Jayasuriya', 'Iresha Gunawardena',
    'Chamod Abeysekera', 'Sanduni Rathnayake'];

  const products = [
    { id: 'PRD-1001', sku: 'ZW3-BLK-45', name: 'ZenWatch 3 — Minimalist Smart Watch', category: 'Wearables', price: 219, stock: 18, status: 'active', img: 'watch' },
    { id: 'PRD-1002', sku: 'ASP-EAR-BLK', name: 'AuraSound Pro Wireless Earbuds', category: 'Audio', price: 89.99, stock: 0, status: 'active', img: 'earbuds' },
    { id: 'PRD-1003', sku: 'SPU-TAB-11', name: 'SlimPad Ultra Tablet 11"', category: 'Tablets', price: 349, stock: 3, status: 'active', img: 'tablet' },
    { id: 'PRD-1004', sku: 'MH8-DCK-SG', name: 'MicroHub 8-in-1 USB-C Dock', category: 'Accessories', price: 42.99, stock: 0, status: 'active', img: 'hub' },
    { id: 'PRD-1005', sku: 'FDL-LMP-WHT', name: 'FocusDesk Lamp — Wireless Charging', category: 'Lighting', price: 64.99, stock: 4, status: 'active', img: 'lamp' },
    { id: 'PRD-1006', sku: 'ZW3-GLD-45', name: 'ZenWatch 3 — 45mm Gold', category: 'Wearables', price: 229, stock: 5, status: 'active', img: 'watch2' },
    { id: 'PRD-1007', sku: 'ASP-EAR-RG', name: 'AuraSound Pro Earbuds — Rose Gold', category: 'Audio', price: 94.99, stock: 6, status: 'active', img: 'earbuds2' },
    { id: 'PRD-1008', sku: 'MH8-DCK-SLV', name: 'MicroHub USB-C Dock — Silver', category: 'Accessories', price: 42.99, stock: 8, status: 'active', img: 'hub2' },
    { id: 'PRD-1009', sku: 'SPU-CASE', name: 'SlimPad Folio Case', category: 'Accessories', price: 24.99, stock: 32, status: 'active', img: 'case' },
    { id: 'PRD-1010', sku: 'AS-CBL-USBC', name: 'AuraSound USB-C Charging Cable', category: 'Accessories', price: 12.99, stock: 60, status: 'active', img: 'cable' },
    { id: 'PRD-1011', sku: 'FDL-BULB', name: 'FocusDesk Replacement Bulb', category: 'Lighting', price: 8.99, stock: 0, status: 'inactive', img: 'bulb' },
    { id: 'PRD-1012', sku: 'ZW3-STRAP', name: 'ZenWatch Silicone Strap', category: 'Wearables', price: 14.99, stock: 41, status: 'active', img: 'strap' }
  ];

  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled'];
  const orders = [];
  for (let i = 0; i < 24; i++) {
    const cust = customers[i % customers.length];
    const prod = products[i % products.length];
    const qty = 1 + (i % 3);
    const status = orderStatuses[i % orderStatuses.length];
    orders.push({
      id: `JB-${10300 - i}`,
      customer: cust,
      email: cust.toLowerCase().replace(/ /g, '.') + '@example.com',
      address: `${12 + i} Galle Road, Colombo ${(i % 15) + 1}`,
      items: [{ name: prod.name, qty, price: prod.price }],
      total: +(prod.price * qty).toFixed(2),
      status,
      paymentStatus: status === 'cancelled' ? 'refunded' : (status === 'pending' ? 'unpaid' : 'paid'),
      createdAt: daysAgo(i),
      time: timeAgo(daysAgo(i))
    });
  }

  const deliveries = orders
    .filter((o) => !['pending', 'cancelled'].includes(o.status))
    .map((o, i) => ({
      id: `DL-${9000 + i}`,
      orderId: o.id,
      customer: o.customer,
      address: o.address,
      carrier: ['CityExpress', 'IslandPost', 'JustBuy Logistics'][i % 3],
      tracking: `TRK${100000 + i}LK`,
      status: o.status === 'confirmed' || o.status === 'processing' ? 'processing'
        : o.status === 'shipped' ? (i % 2 === 0 ? 'shipped' : 'out_for_delivery')
        : 'delivered',
      updatedAt: o.createdAt
    }));

  const returns = [
    { id: 'RT-501', orderId: orders[2].id, customer: orders[2].customer, product: orders[2].items[0].name, reason: 'Arrived with a scratch on the casing', amount: orders[2].total, status: 'requested', requestedAt: daysAgo(1) },
    { id: 'RT-502', orderId: orders[5].id, customer: orders[5].customer, product: orders[5].items[0].name, reason: 'Ordered the wrong size', amount: orders[5].total, status: 'approved', requestedAt: daysAgo(4) },
    { id: 'RT-503', orderId: orders[9].id, customer: orders[9].customer, product: orders[9].items[0].name, reason: 'No longer needed', amount: orders[9].total, status: 'refunded', requestedAt: daysAgo(9) },
    { id: 'RT-504', orderId: orders[14].id, customer: orders[14].customer, product: orders[14].items[0].name, reason: 'Item did not match description', amount: orders[14].total, status: 'rejected', requestedAt: daysAgo(12) }
  ];

  const cancellations = [
    { id: 'CN-201', orderId: orders[6].id, customer: orders[6].customer, reason: 'Found it cheaper elsewhere', status: 'requested', requestedAt: daysAgo(0) },
    { id: 'CN-202', orderId: orders[11].id, customer: orders[11].customer, reason: 'Ordered by mistake', status: 'approved', requestedAt: daysAgo(3) },
    { id: 'CN-203', orderId: orders[18].id, customer: orders[18].customer, reason: 'Delivery window too long', status: 'rejected', requestedAt: daysAgo(6) }
  ];

  const productCategories = [
    { id: 'CAT-1', name: 'Wearables', status: 'active' },
    { id: 'CAT-2', name: 'Audio', status: 'active' },
    { id: 'CAT-3', name: 'Tablets', status: 'active' },
    { id: 'CAT-4', name: 'Accessories', status: 'active' },
    { id: 'CAT-5', name: 'Lighting', status: 'active' }
  ];

  const attributes = [
    { id: 'ATTR-1', name: 'Color', values: ['Black', 'White', 'Gold', 'Rose Gold', 'Silver'] },
    { id: 'ATTR-2', name: 'Storage', values: ['64GB', '128GB', '256GB'] },
    { id: 'ATTR-3', name: 'Band size', values: ['S/M', 'M/L'] }
  ];

  const withdrawals = [
    { id: 'WD-901', amount: 450, method: 'Commercial Bank •••• 4471', status: 'pending', requestedAt: daysAgo(1) },
    { id: 'WD-902', amount: 620, method: 'Commercial Bank •••• 4471', status: 'paid', requestedAt: daysAgo(18) },
    { id: 'WD-903', amount: 300, method: 'JustBuy Wallet', status: 'paid', requestedAt: daysAgo(32) },
    { id: 'WD-904', amount: 150, method: 'Commercial Bank •••• 4471', status: 'cancelled', requestedAt: daysAgo(40) }
  ];

  const discounts = [
    { id: 'DIS-1', name: 'Wearables spring sale', type: 'percentage', value: 15, scope: 'Wearables', startDate: '2026-09-01', endDate: '2026-10-15', status: 'active' },
    { id: 'DIS-2', name: '$10 off accessories', type: 'fixed', value: 10, scope: 'Accessories', startDate: '2026-08-20', endDate: '2026-09-30', status: 'active' }
  ];
  const coupons = [
    { id: 'CPN-1', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 30, usageLimit: 500, used: 128, expiresAt: '2026-12-31', status: 'active' },
    { id: 'CPN-2', code: 'FREESHIP', type: 'fixed', value: 4.99, minOrder: 0, usageLimit: 200, used: 200, expiresAt: '2026-09-30', status: 'inactive' }
  ];
  const vouchers = [
    { id: 'VCH-1', code: 'GIFT25', value: 25, validUntil: '2026-11-30', usageLimit: 100, used: 12, status: 'active' }
  ];

  const managers = [
    { id: 'MGR-1', name: 'Sahan Kodithuwakku', email: 'sahan@technova.lk', role: 'Manager', permissions: ['orders', 'products', 'finance'], status: 'active' },
    { id: 'MGR-2', name: 'Dilki Wickramasinghe', email: 'dilki@technova.lk', role: 'Support', permissions: ['orders', 'messages'], status: 'active' }
  ];

  const productReviews = [
    { id: 'RV-1', product: 'ZenWatch 3', rating: 5, text: 'Ceramic bezel feels premium and the battery easily lasts 5 days.', who: 'Sarah L.', time: '2 h ago', replied: false, reply: '' },
    { id: 'RV-2', product: 'AuraSound Pro Earbuds', rating: 4, text: 'Great sound and ANC. The app could use some polish.', who: 'David K.', time: '6 h ago', replied: false, reply: '' },
    { id: 'RV-3', product: 'MicroHub USB-C Dock', rating: 5, text: 'Plug and play, all 8 ports work with my laptop.', who: 'Omar R.', time: 'Yesterday', replied: true, reply: 'Thanks Omar — glad it\'s working well for your setup!' },
    { id: 'RV-4', product: 'FocusDesk Lamp', rating: 3, text: 'Good lamp, but the wireless charger runs a bit warm.', who: 'Chris W.', time: '2 d ago', replied: false, reply: '' },
    { id: 'RV-5', product: 'SlimPad Ultra Tablet 11"', rating: 5, text: 'Screen is gorgeous and the stylus is a great bundle.', who: 'Priyanka M.', time: '4 d ago', replied: false, reply: '' }
  ];

  const conversationSeed = [
    { customer: 'Nimali Perera', unread: true, messages: [
      { from: 'customer', text: 'Hi! Does the earbuds case come with a USB-C cable?', at: daysAgo(0) }
    ] },
    { customer: 'Kasun Ranasinghe', unread: true, messages: [
      { from: 'customer', text: 'Can I change the strap size on my ZenWatch order?', at: daysAgo(0) },
      { from: 'seller', text: 'Of course — which size would you like instead?', at: daysAgo(0) }
    ] },
    { customer: 'Amara Silva', unread: false, messages: [
      { from: 'customer', text: 'Thanks, the dock arrived. Works great.', at: daysAgo(1) },
      { from: 'seller', text: 'Wonderful to hear, thanks for letting us know!', at: daysAgo(1) }
    ] },
    { customer: 'Dinuk Wijesinghe', unread: true, messages: [
      { from: 'customer', text: 'Is the tablet stylus included in the box?', at: daysAgo(1) }
    ] },
    { customer: 'Shanika Fernando', unread: false, messages: [
      { from: 'customer', text: 'Where can I download the invoice?', at: daysAgo(2) },
      { from: 'seller', text: 'You can grab it from the order detail page — I\'ve also emailed a copy.', at: daysAgo(2) }
    ] }
  ];
  const conversations = conversationSeed.map((c, i) => ({ id: `CV-${i + 1}`, ...c }));

  return {
    products,
    orders,
    deliveries,
    returns,
    cancellations,
    productCategories,
    attributes,
    withdrawals,
    discounts,
    coupons,
    vouchers,
    managers,
    productReviews,
    conversations,
    storeProfile: {
      name: CONFIG.storeName,
      category: 'Electronics & Gadgets',
      description: 'Curated smart-home and personal-tech accessories, hand-picked for design and durability.',
      contactEmail: 'hello@technova.lk',
      contactPhone: '+94 77 123 4567',
      returnPolicy: 'Returns accepted within 14 days of delivery for unused items in original packaging.'
    },
    storeOpsSettings: { autoAcceptOrders: false, orderNotifications: true, currency: Store.state.currency || 'USD' },
    sellerProfile: {
      name: user.name || 'Seller',
      email: user.email || 'seller@technova.lk',
      phone: '+94 71 987 6543',
      bio: 'Selling curated audio and workspace hardware since 2024. 4.9★ across 617 units sold.'
    },
    paymentMethods: [
      { id: 'PM-1', type: 'Bank Transfer', label: 'Commercial Bank •••• 4471', isDefault: true },
      { id: 'PM-2', type: 'JustBuy Wallet', label: 'JustBuy Wallet', isDefault: false }
    ],
    deliverySettings: {
      options: [
        { id: 'DO-1', name: 'Standard Delivery', days: '3–5 days', fee: 4.99, enabled: true },
        { id: 'DO-2', name: 'Express Delivery', days: '1–2 days', fee: 9.99, enabled: true },
        { id: 'DO-3', name: 'Store Pickup', days: 'Same day', fee: 0, enabled: false }
      ],
      freeShippingThreshold: 75
    },
    securityInfo: {
      twoFactorEnabled: false,
      lastPasswordChange: daysAgo(40),
      sessions: [
        { device: 'Chrome on macOS', location: 'Colombo, LK', current: true, lastActive: 'Now' },
        { device: 'JustBuy App — iPhone', location: 'Colombo, LK', current: false, lastActive: '2 d ago' }
      ]
    },
    vacationDetails: { startDate: '', endDate: '', message: 'We are currently away and will resume shipping soon.' }
  };
}

// Extra status labels used by the new sections (existing pill colors are
// extended below in seller-dashboard.css; anything not styled there still
// renders correctly with the base .sd-pill look).
Object.assign(STATUS_LABEL, {
  requested: 'Requested', approved: 'Approved', refunded: 'Refunded', rejected: 'Rejected',
  out_for_delivery: 'Out for delivery', active: 'Active', inactive: 'Inactive',
  paid: 'Paid', unpaid: 'Unpaid'
});

// ── Small generic helpers ───────────────────────────
function paginate(arr, page, perPage) {
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const p = Math.min(Math.max(1, page), pages);
  const start = (p - 1) * perPage;
  return { rows: arr.slice(start, start + perPage), page: p, pages, total };
}
function matchSearch(item, fields, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return fields.some((f) => String(item[f] ?? '').toLowerCase().includes(needle));
}
function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function toggleCell(id, checked) {
  return `<button type="button" class="sd-switch" data-toggle="${esc(id)}" aria-checked="${checked}"><span class="sd-switch-knob"></span></button>`;
}
function findOrder(id) {
  return (data.orders || []).find((o) => o.id === id) || (data.recentOrders || []).find((o) => o.id === id);
}

// ── Modal system ─────────────────────────────────────
function openModal(html) {
  $('#sd-modal-root').innerHTML = html;
  $('#sd-modal-overlay').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  $('#sd-modal-overlay').hidden = true;
  $('#sd-modal-root').innerHTML = '';
  document.body.style.overflow = '';
}
function confirmAction({ title, message, confirmLabel = 'Delete', danger = true, onConfirm }) {
  openModal(`
    <h2>${esc(title)}</h2>
    <p class="sd-modal-sub">${esc(message)}</p>
    <div class="sd-modal-actions">
      <button type="button" class="btn btn-glass btn-sm" data-modal-cancel>Cancel</button>
      <button type="button" class="btn btn-sm ${danger ? 'sd-btn-danger' : 'btn-primary'}" id="sd-modal-confirm">${esc(confirmLabel)}</button>
    </div>`);
  $('#sd-modal-confirm').addEventListener('click', () => { onConfirm(); closeModal(); });
}
function openFormModal({ title, description, fields, initial = {}, submitLabel = 'Save', onSubmit }) {
  const fieldHtml = fields.map((f) => {
    const val = initial[f.name] ?? f.default ?? '';
    const full = f.full ? ' sd-field-full' : '';
    if (f.type === 'select') {
      return `<label class="sd-field${full}"><span>${esc(f.label)}</span>
        <select name="${f.name}">${f.options.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(val) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>`;
    }
    if (f.type === 'textarea') {
      return `<label class="sd-field${full}"><span>${esc(f.label)}</span><textarea name="${f.name}" rows="${f.rows || 3}">${esc(val)}</textarea></label>`;
    }
    return `<label class="sd-field${full}"><span>${esc(f.label)}</span>
      <input type="${f.type || 'text'}" name="${f.name}" value="${esc(val)}" ${f.step ? `step="${f.step}"` : ''} ${f.min != null ? `min="${f.min}"` : ''} ${f.required ? 'required' : ''}/></label>`;
  }).join('');

  openModal(`
    <h2>${esc(title)}</h2>
    ${description ? `<p class="sd-modal-sub">${esc(description)}</p>` : ''}
    <form class="sd-form" id="sd-modal-form">
      <div class="sd-form-grid">${fieldHtml}</div>
      <div class="sd-modal-actions">
        <button type="button" class="btn btn-glass btn-sm" data-modal-cancel>Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm btn-liquid">${esc(submitLabel)}</button>
      </div>
    </form>`);

  $('#sd-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const values = {};
    fields.forEach((f) => {
      if (f.type === 'number') values[f.name] = fd.get(f.name) === '' ? null : Number(fd.get(f.name));
      else values[f.name] = (fd.get(f.name) || '').toString().trim();
    });
    onSubmit(values);
  });
}

// ── Generic list/table page (search + status tabs + pagination) ────
function renderListPage(container, opts) {
  const pageSize = opts.pageSize || 8;
  const state2 = { q: '', status: 'all', page: 1 };

  function draw() {
    let rows = opts.getRows();
    if (opts.statusFilter && state2.status !== 'all') {
      rows = rows.filter((r) => String(r[opts.statusFilter.field]) === state2.status);
    }
    if (state2.q) rows = rows.filter((r) => matchSearch(r, opts.searchFields || [], state2.q));

    const { rows: pageRows, page, pages, total } = paginate(rows, state2.page, pageSize);
    state2.page = page;

    container.querySelector('.sd-lp-body').innerHTML = pageRows.length ? `
      <table class="sd-table">
        <thead><tr>${opts.columns.map((c) => `<th${c.num ? ' class="sd-num"' : ''}>${esc(c.label)}</th>`).join('')}${opts.rowActions ? '<th><span class="sd-sr-only">Actions</span></th>' : ''}</tr></thead>
        <tbody>
          ${pageRows.map((r) => `
            <tr>
              ${opts.columns.map((c) => `<td${c.num ? ' class="sd-num"' : ''}>${c.render(r)}</td>`).join('')}
              ${opts.rowActions ? `<td class="sd-row-actions">${opts.rowActions(r).map((a) => `<button type="button" class="btn btn-sm ${a.variant === 'danger' ? 'sd-btn-danger' : 'btn-glass'}" data-act="${esc(a.id)}" data-row-id="${esc(r.id)}">${esc(a.label)}</button>`).join('')}</td>` : ''}
            </tr>`).join('')}
        </tbody>
      </table>` : `<p class="sd-empty">${esc(opts.emptyText || 'Nothing here yet.')}</p>`;

    container.querySelector('.sd-lp-pagination').innerHTML = pages > 1 ? `
      <button type="button" class="btn btn-glass btn-sm" data-page-prev ${page <= 1 ? 'disabled' : ''}>‹ Prev</button>
      <span class="sd-page-note">Page ${page} of ${pages} · ${total} total</span>
      <button type="button" class="btn btn-glass btn-sm" data-page-next ${page >= pages ? 'disabled' : ''}>Next ›</button>` : `<span class="sd-page-note">${total} total</span>`;
  }

  container.innerHTML = `
    <div class="sd-section-head sd-section-head-row">
      <div><h2>${esc(opts.title)}</h2>${opts.description ? `<p>${esc(opts.description)}</p>` : ''}</div>
      ${opts.primaryAction ? `<button type="button" class="btn btn-primary btn-sm btn-liquid" data-primary-action>${esc(opts.primaryAction.label)}</button>` : ''}
    </div>
    <div class="sd-card glass">
      <div class="sd-toolbar">
        <div class="sd-search sd-toolbar-search glass">
          <span aria-hidden="true">🔍</span>
          <input type="search" placeholder="${esc(opts.searchPlaceholder || 'Search')}" data-lp-search />
        </div>
        ${opts.statusFilter ? `<div class="sd-seg glass" data-lp-status>
          <button type="button" class="active" data-status-val="all">All</button>
          ${opts.statusFilter.options.map((o) => `<button type="button" data-status-val="${esc(o.value)}">${esc(o.label)}</button>`).join('')}
        </div>` : ''}
      </div>
      <div class="sd-table-wrap sd-lp-body"></div>
      <div class="sd-lp-pagination sd-pagination"></div>
    </div>`;

  if (opts.primaryAction) container.querySelector('[data-primary-action]').addEventListener('click', opts.primaryAction.onClick);

  container.querySelector('[data-lp-search]').addEventListener('input', (e) => { state2.q = e.target.value; state2.page = 1; draw(); });

  if (opts.statusFilter) {
    container.querySelector('[data-lp-status]').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-status-val]');
      if (!btn) return;
      state2.status = btn.dataset.statusVal;
      state2.page = 1;
      container.querySelectorAll('[data-lp-status] button').forEach((b) => b.classList.toggle('active', b === btn));
      draw();
    });
  }

  container.querySelector('.sd-lp-pagination').addEventListener('click', (e) => {
    if (e.target.closest('[data-page-prev]')) { state2.page--; draw(); }
    if (e.target.closest('[data-page-next]')) { state2.page++; draw(); }
  });

  container.querySelector('.sd-lp-body').addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-toggle]');
    if (toggle && opts.onToggle) { opts.onToggle(toggle.dataset.toggle, draw); return; }

    const actBtn = e.target.closest('[data-act]');
    if (actBtn && opts.rowActions) {
      const row = opts.getRows().find((r) => String(r.id) === actBtn.dataset.rowId);
      const action = row && opts.rowActions(row).find((a) => a.id === actBtn.dataset.act);
      if (action) action.onClick(row, draw);
    }
  });

  container.querySelector('.sd-lp-body').addEventListener('change', (e) => {
    const sel = e.target.closest('.sd-status-select');
    if (!sel || !opts.onStatusChange) return;
    const row = opts.getRows().find((r) => String(r.id) === sel.dataset.rowId);
    if (row) opts.onStatusChange(row, sel.value, draw);
  });

  draw();
  return { refresh: draw };
}

// ── Order detail modal + invoice ────────────────────
function openOrderDetailModal(orderId) {
  const o = findOrder(orderId);
  if (!o) { Store.toast('Order not found', 'warning'); return; }
  const items = o.items || [{ name: o.items, qty: 1, price: o.total }];
  const canCancel = ['pending', 'confirmed'].includes(o.status);

  openModal(`
    <h2>Order ${esc(o.id)}</h2>
    <p class="sd-modal-sub">${esc(o.time || fmtDate(o.createdAt))}</p>
    <div class="sd-detail-grid">
      <div><span class="sd-detail-label">Customer</span><strong>${esc(o.customer)}</strong>${o.email ? `<br><span class="sd-detail-sub">${esc(o.email)}</span>` : ''}</div>
      <div><span class="sd-detail-label">Delivery address</span><strong>${esc(o.address || '—')}</strong></div>
      <div><span class="sd-detail-label">Payment</span><span class="sd-pill ${o.paymentStatus === 'paid' ? 'delivered' : (o.paymentStatus === 'refunded' ? 'cancelled' : 'pending')}">${esc((o.paymentStatus || '—').toUpperCase())}</span></div>
      <div><span class="sd-detail-label">Status</span><span class="sd-pill ${o.status}">${esc(STATUS_LABEL[o.status] || o.status)}</span></div>
    </div>
    <table class="sd-table" style="margin-top:16px">
      <thead><tr><th>Product</th><th class="sd-num">Qty</th><th class="sd-num">Price</th></tr></thead>
      <tbody>${items.map((it) => `<tr><td>${esc(it.name)}</td><td class="sd-num">${it.qty || 1}</td><td class="sd-num">${money(it.price ?? o.total)}</td></tr>`).join('')}</tbody>
    </table>
    <div class="sd-modal-actions" style="justify-content:space-between;">
      <button type="button" class="btn btn-glass btn-sm" id="sd-print-invoice">🖨️ Print invoice</button>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-glass btn-sm" data-modal-cancel>Close</button>
        ${canCancel ? '<button type="button" class="btn btn-sm sd-btn-danger" id="sd-cancel-order">Cancel order</button>' : ''}
      </div>
    </div>`);

  $('#sd-print-invoice').addEventListener('click', () => printInvoice(o));
  const cancelBtn = $('#sd-cancel-order');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      o.status = 'cancelled';
      o.paymentStatus = 'refunded';
      closeModal();
      Store.toast(`Order ${o.id} cancelled`, 'warning');
      renderRecentOrders(); renderRoute();
    });
  }
}

function printInvoice(o) {
  const items = o.items || [{ name: o.items, qty: 1, price: o.total }];
  const win = window.open('', '_blank', 'width=420,height=600');
  if (!win) { Store.toast('Please allow pop-ups to print the invoice', 'warning'); return; }
  win.document.write(`
    <html><head><title>Invoice ${esc(o.id)}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#1a1a1a} h1{font-size:18px} table{width:100%;border-collapse:collapse;margin-top:16px} td,th{padding:6px 0;border-bottom:1px solid #ddd;text-align:left} .num{text-align:right}</style>
    </head><body>
      <h1>${esc(CONFIG.storeName)} — Invoice ${esc(o.id)}</h1>
      <p>Customer: ${esc(o.customer)}<br/>${o.address ? esc(o.address) + '<br/>' : ''}Date: ${esc(o.time || fmtDate(o.createdAt))}</p>
      <table><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th></tr></thead>
      <tbody>${items.map((it) => `<tr><td>${esc(it.name)}</td><td class="num">${it.qty || 1}</td><td class="num">${money(it.price ?? o.total)}</td></tr>`).join('')}</tbody></table>
      <p style="text-align:right;margin-top:12px;font-weight:bold;">Total: ${money(o.total)}</p>
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

// ── Sales > Orders ───────────────────────────────────
const ORDER_TRANSITIONS = {
  pending: ['pending', 'confirmed', 'cancelled'],
  confirmed: ['confirmed', 'processing', 'cancelled'],
  processing: ['processing', 'shipped'],
  shipped: ['shipped', 'delivered']
};
function orderStatusCell(o) {
  if (o.status === 'delivered' || o.status === 'cancelled') {
    return `<span class="sd-pill ${o.status}">${esc(STATUS_LABEL[o.status] || o.status)}</span>`;
  }
  const next = ORDER_TRANSITIONS[o.status] || [o.status];
  return `<select class="sd-status-select sd-pill ${o.status}" data-row-id="${esc(o.id)}">
    ${next.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${esc(STATUS_LABEL[s] || s)}</option>`).join('')}
  </select>`;
}
function renderOrdersPage(container) {
  renderListPage(container, {
    title: 'Orders',
    description: 'Every order placed with your store.',
    getRows: () => data.orders,
    searchFields: ['id', 'customer', 'email'],
    searchPlaceholder: 'Search order # or customer',
    statusFilter: { field: 'status', options: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => ({ value: s, label: STATUS_LABEL[s] })) },
    columns: [
      { key: 'id', label: 'Order', render: (o) => `<span class="sd-order-id">${esc(o.id)}</span><br><small>${esc(o.time || fmtDate(o.createdAt))}</small>` },
      { key: 'customer', label: 'Customer', render: (o) => `<span class="sd-cell-user"><span class="sd-avatar" aria-hidden="true">${esc(initials(o.customer))}</span>${esc(o.customer)}</span>` },
      { key: 'items', label: 'Products', render: (o) => `<div class="sd-order-items">${esc((o.items || []).map((i) => i.name).join(', '))}</div>` },
      { key: 'total', label: 'Total', num: true, render: (o) => money(o.total) },
      { key: 'payment', label: 'Payment', render: (o) => `<span class="sd-pill ${o.paymentStatus === 'paid' ? 'delivered' : (o.paymentStatus === 'refunded' ? 'cancelled' : 'pending')}">${esc((o.paymentStatus || '—').toUpperCase())}</span>` },
      { key: 'status', label: 'Status', render: orderStatusCell }
    ],
    rowActions: (o) => [{ id: 'view', label: 'View', onClick: () => openOrderDetailModal(o.id) }],
    onStatusChange: (o, val, refresh) => {
      o.status = val;
      if (val === 'cancelled') o.paymentStatus = 'refunded';
      Store.toast(`Order ${o.id} marked ${(STATUS_LABEL[val] || val).toLowerCase()}`, 'success');
      refresh(); renderRecentOrders(); renderStats(); renderMetrics();
    },
    emptyText: 'No orders yet.'
  });
}

// ── Sales > Returns & Refunds ────────────────────────
const RETURN_TRANSITIONS = { requested: ['requested', 'approved', 'rejected'], approved: ['approved', 'refunded'] };
function returnStatusCell(r) {
  if (['refunded', 'rejected'].includes(r.status)) {
    return `<span class="sd-pill ${r.status === 'refunded' ? 'delivered' : 'cancelled'}">${esc(STATUS_LABEL[r.status])}</span>`;
  }
  const next = RETURN_TRANSITIONS[r.status] || [r.status];
  return `<select class="sd-status-select sd-pill ${r.status === 'approved' ? 'shipped' : 'pending'}" data-row-id="${esc(r.id)}">
    ${next.map((s) => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${esc(STATUS_LABEL[s])}</option>`).join('')}
  </select>`;
}
function renderReturnsPage(container) {
  renderListPage(container, {
    title: 'Returns & Refunds',
    description: 'Review return requests and process refunds.',
    getRows: () => data.returns,
    searchFields: ['id', 'orderId', 'customer', 'product'],
    searchPlaceholder: 'Search return, order # or customer',
    statusFilter: { field: 'status', options: [{ value: 'requested', label: 'Requested' }, { value: 'approved', label: 'Approved' }, { value: 'refunded', label: 'Refunded' }, { value: 'rejected', label: 'Rejected' }] },
    columns: [
      { key: 'id', label: 'Return', render: (r) => `<span class="sd-order-id">${esc(r.id)}</span><br><small>Order ${esc(r.orderId)}</small>` },
      { key: 'customer', label: 'Customer', render: (r) => esc(r.customer) },
      { key: 'product', label: 'Product', render: (r) => esc(r.product) },
      { key: 'reason', label: 'Reason', render: (r) => `<div class="sd-order-items">${esc(r.reason)}</div>` },
      { key: 'amount', label: 'Amount', num: true, render: (r) => money(r.amount) },
      { key: 'status', label: 'Status', render: returnStatusCell }
    ],
    onStatusChange: (r, val, refresh) => { r.status = val; Store.toast(`Return ${r.id} ${STATUS_LABEL[val].toLowerCase()}`, 'success'); refresh(); },
    emptyText: 'No return or refund requests.'
  });
}

// ── Sales > Cancellations ────────────────────────────
const CANCEL_TRANSITIONS = { requested: ['requested', 'approved', 'rejected'] };
function cancelStatusCell(c) {
  if (c.status !== 'requested') return `<span class="sd-pill ${c.status === 'approved' ? 'delivered' : 'cancelled'}">${esc(STATUS_LABEL[c.status])}</span>`;
  return `<select class="sd-status-select sd-pill pending" data-row-id="${esc(c.id)}">
    ${CANCEL_TRANSITIONS.requested.map((s) => `<option value="${s}" ${s === c.status ? 'selected' : ''}>${esc(STATUS_LABEL[s])}</option>`).join('')}
  </select>`;
}
function renderCancellationsPage(container) {
  renderListPage(container, {
    title: 'Cancellations',
    description: 'Customer-requested order cancellations.',
    getRows: () => data.cancellations,
    searchFields: ['id', 'orderId', 'customer'],
    searchPlaceholder: 'Search cancellation, order # or customer',
    statusFilter: { field: 'status', options: [{ value: 'requested', label: 'Requested' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] },
    columns: [
      { key: 'id', label: 'Cancellation', render: (c) => `<span class="sd-order-id">${esc(c.id)}</span><br><small>Order ${esc(c.orderId)}</small>` },
      { key: 'customer', label: 'Customer', render: (c) => esc(c.customer) },
      { key: 'reason', label: 'Reason', render: (c) => `<div class="sd-order-items">${esc(c.reason)}</div>` },
      { key: 'status', label: 'Status', render: cancelStatusCell }
    ],
    onStatusChange: (c, val, refresh) => {
      c.status = val;
      if (val === 'approved') { const ord = findOrder(c.orderId); if (ord) { ord.status = 'cancelled'; ord.paymentStatus = 'refunded'; } }
      Store.toast(`Cancellation ${c.id} ${STATUS_LABEL[val].toLowerCase()}`, 'success');
      refresh(); renderRecentOrders();
    },
    emptyText: 'No cancellation requests.'
  });
}

// ── Delivery (All / Processing / Shipped / Out for Delivery / Delivered) ──
const DELIVERY_TRANSITIONS = { processing: ['processing', 'shipped'], shipped: ['shipped', 'out_for_delivery'], out_for_delivery: ['out_for_delivery', 'delivered'] };
function deliveryStatusCell(d) {
  if (d.status === 'delivered') return `<span class="sd-pill delivered">${esc(STATUS_LABEL.delivered)}</span>`;
  const next = DELIVERY_TRANSITIONS[d.status] || [d.status];
  const pillClass = d.status === 'processing' ? 'processing' : (d.status === 'shipped' ? 'shipped' : 'confirmed');
  return `<select class="sd-status-select sd-pill ${pillClass}" data-row-id="${esc(d.id)}">
    ${next.map((s) => `<option value="${s}" ${s === d.status ? 'selected' : ''}>${esc(STATUS_LABEL[s])}</option>`).join('')}
  </select>`;
}
function makeDeliveryPage(filterStatus) {
  return function (container) {
    renderListPage(container, {
      title: filterStatus ? `Deliveries — ${STATUS_LABEL[filterStatus]}` : 'All Deliveries',
      description: 'Track fulfilment from processing to the customer\u2019s door.',
      getRows: () => (filterStatus ? data.deliveries.filter((d) => d.status === filterStatus) : data.deliveries),
      searchFields: ['id', 'orderId', 'customer', 'tracking'],
      searchPlaceholder: 'Search delivery, order # or customer',
      statusFilter: filterStatus ? null : { field: 'status', options: [{ value: 'processing', label: 'Processing' }, { value: 'shipped', label: 'Shipped' }, { value: 'out_for_delivery', label: 'Out for delivery' }, { value: 'delivered', label: 'Delivered' }] },
      columns: [
        { key: 'id', label: 'Delivery', render: (d) => `<span class="sd-order-id">${esc(d.id)}</span><br><small>Order ${esc(d.orderId)}</small>` },
        { key: 'customer', label: 'Customer', render: (d) => esc(d.customer) },
        { key: 'address', label: 'Address', render: (d) => `<div class="sd-order-items">${esc(d.address)}</div>` },
        { key: 'tracking', label: 'Tracking', render: (d) => `${esc(d.carrier)}<br><small>${esc(d.tracking)}</small>` },
        { key: 'status', label: 'Status', render: deliveryStatusCell }
      ],
      onStatusChange: (d, val, refresh) => {
        d.status = val;
        d.updatedAt = new Date().toISOString();
        if (val === 'delivered') { const ord = findOrder(d.orderId); if (ord && ord.status !== 'cancelled') ord.status = 'delivered'; }
        Store.toast(`Delivery ${d.id} marked ${STATUS_LABEL[val]}`, 'success');
        refresh(); renderMetrics(); renderRecentOrders();
      },
      emptyText: 'No deliveries in this state.'
    });
  };
}

// ── Products > All Products ──────────────────────────
function renderProductsPage(container) {
  renderListPage(container, {
    title: 'All Products',
    description: 'Manage everything listed in your store.',
    getRows: () => data.products,
    searchFields: ['name', 'sku', 'category'],
    searchPlaceholder: 'Search products or SKU',
    statusFilter: { field: 'status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
    primaryAction: { label: '+ Add product', onClick: () => navigate('products-add') },
    columns: [
      { key: 'name', label: 'Product', render: (p) => `<span class="sd-cell-user"><img src="${IMG}${esc(p.img)}/64/64" style="width:34px;height:34px;border-radius:8px;object-fit:cover;flex-shrink:0" alt=""/><span>${esc(p.name)}<br><small>${esc(p.sku)}</small></span></span>` },
      { key: 'category', label: 'Category', render: (p) => esc(p.category) },
      { key: 'price', label: 'Price', num: true, render: (p) => money(p.price) },
      { key: 'stock', label: 'Stock', num: true, render: (p) => (p.stock === 0 ? '<span class="sd-stock-count out">Out</span>' : String(p.stock)) },
      { key: 'status', label: 'Active', render: (p) => toggleCell(p.id, p.status === 'active') }
    ],
    onToggle: (id, refresh) => {
      const p = data.products.find((x) => x.id === id);
      p.status = p.status === 'active' ? 'inactive' : 'active';
      Store.toast(`${p.name} marked ${p.status}`, 'success');
      refresh();
    },
    rowActions: (p) => [
      { id: 'edit', label: 'Edit', onClick: () => openProductForm(p) },
      { id: 'delete', label: 'Delete', variant: 'danger', onClick: () => confirmAction({
        title: `Delete "${p.name}"?`,
        message: 'This removes it from your storefront immediately.',
        onConfirm: () => { data.products = data.products.filter((x) => x.id !== p.id); data.productCount = data.products.length; Store.toast(`${p.name} deleted`, 'warning'); renderStats(); renderRoute(); }
      }) }
    ],
    emptyText: 'No products yet — add your first one to get started.'
  });
}
function openProductForm(p) {
  openFormModal({
    title: 'Edit product',
    fields: [
      { name: 'name', label: 'Product name', full: true, required: true },
      { name: 'category', label: 'Category' },
      { name: 'sku', label: 'SKU', required: true },
      { name: 'price', label: 'Price (USD)', type: 'number', step: '0.01', min: 0, required: true },
      { name: 'stock', label: 'Stock quantity', type: 'number', min: 0, required: true },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }
    ],
    initial: p,
    submitLabel: 'Save changes',
    onSubmit: (vals) => {
      Object.assign(p, vals, { price: Number(vals.price), stock: Number(vals.stock) });
      closeModal();
      Store.toast(`${p.name} updated`, 'success');
      renderRoute(); renderLowStock();
    }
  });
}

// ── Products > Add Product (standalone page) ─────────
function renderAddProductPage(container) {
  const categories = [...new Set(data.products.map((p) => p.category))];
  container.innerHTML = `
    <div class="sd-section-head"><h2>Add Product</h2><p>List a new item on your storefront.</p></div>
    <div class="sd-card glass">
      <form id="sd-add-product-form" class="sd-form">
        <div class="sd-form-grid">
          <label class="sd-field sd-field-full"><span>Product name</span><input type="text" name="name" required/></label>
          <label class="sd-field sd-field-full"><span>Description</span><textarea name="description" rows="3"></textarea></label>
          <label class="sd-field"><span>Category</span>
            <select name="category">${categories.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
          </label>
          <label class="sd-field"><span>SKU</span><input type="text" name="sku" required/></label>
          <label class="sd-field"><span>Price (USD)</span><input type="number" name="price" min="0" step="0.01" required/></label>
          <label class="sd-field"><span>Discount %</span><input type="number" name="discount" min="0" max="100" step="1" value="0"/></label>
          <label class="sd-field"><span>Stock quantity</span><input type="number" name="stock" min="0" step="1" required/></label>
          <label class="sd-field"><span>Status</span><select name="status"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        </div>
        <div class="sd-modal-actions" style="justify-content:flex-start;">
          <button type="submit" class="btn btn-primary btn-sm btn-liquid">Add product</button>
          <button type="button" class="btn btn-glass btn-sm" id="sd-cancel-add-product">Cancel</button>
          <span class="sd-hint" id="sd-add-product-hint"></span>
        </div>
      </form>
    </div>`;

  $('#sd-cancel-add-product').addEventListener('click', () => navigate('products-all'));
  $('#sd-add-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = (fd.get('name') || '').toString().trim();
    const sku = (fd.get('sku') || '').toString().trim();
    const price = Number(fd.get('price'));
    const stock = Number(fd.get('stock'));
    const hint = $('#sd-add-product-hint');
    if (!name || !sku || isNaN(price) || isNaN(stock)) {
      hint.textContent = 'Please fill in all required fields.';
      hint.classList.add('error');
      return;
    }
    data.products.unshift({
      id: 'PRD-' + Math.floor(2000 + Math.random() * 8000),
      sku, name,
      category: fd.get('category') || 'Uncategorized',
      price, discount: Number(fd.get('discount')) || 0,
      stock, status: fd.get('status'), img: 'watch', description: fd.get('description') || ''
    });
    data.productCount = data.products.length;
    Store.toast(`${name} added to your catalog`, 'success');
    renderStats();
    navigate('products-all');
  });
}

// ── Products > Categories ────────────────────────────
function renderCategoriesPage(container) {
  renderListPage(container, {
    title: 'Categories',
    description: 'Organize your catalog into categories.',
    getRows: () => data.productCategories,
    searchFields: ['name'],
    searchPlaceholder: 'Search categories',
    primaryAction: { label: '+ Add category', onClick: () => openCategoryForm() },
    columns: [
      { key: 'name', label: 'Category', render: (c) => esc(c.name) },
      { key: 'count', label: 'Products', num: true, render: (c) => String(data.products.filter((p) => p.category === c.name).length) },
      { key: 'status', label: 'Active', render: (c) => toggleCell(c.id, c.status === 'active') }
    ],
    onToggle: (id, refresh) => { const c = data.productCategories.find((x) => x.id === id); c.status = c.status === 'active' ? 'inactive' : 'active'; refresh(); },
    rowActions: (c) => [
      { id: 'edit', label: 'Edit', onClick: () => openCategoryForm(c) },
      { id: 'delete', label: 'Delete', variant: 'danger', onClick: () => {
        const inUse = data.products.some((p) => p.category === c.name);
        if (inUse) { Store.toast(`Can't delete "${c.name}" — products still use it`, 'warning'); return; }
        confirmAction({ title: `Delete "${c.name}"?`, message: 'This category has no products and can be safely removed.', onConfirm: () => { data.productCategories = data.productCategories.filter((x) => x.id !== c.id); renderRoute(); } });
      } }
    ],
    emptyText: 'No categories yet.'
  });
}
function openCategoryForm(c) {
  openFormModal({
    title: c ? 'Edit category' : 'Add category',
    fields: [{ name: 'name', label: 'Category name', full: true, required: true }],
    initial: c || {},
    submitLabel: c ? 'Save changes' : 'Add category',
    onSubmit: (vals) => {
      if (c) c.name = vals.name;
      else data.productCategories.push({ id: 'CAT-' + Date.now(), name: vals.name, status: 'active' });
      closeModal(); Store.toast('Category saved', 'success'); renderRoute();
    }
  });
}

// ── Products > Attributes ────────────────────────────
function renderAttributesPage(container) {
  renderListPage(container, {
    title: 'Attributes',
    description: 'Reusable variant options like color or size.',
    getRows: () => data.attributes,
    searchFields: ['name'],
    searchPlaceholder: 'Search attributes',
    primaryAction: { label: '+ Add attribute', onClick: () => openAttributeForm() },
    columns: [
      { key: 'name', label: 'Attribute', render: (a) => esc(a.name) },
      { key: 'values', label: 'Values', render: (a) => a.values.map((v) => `<span class="sd-pill confirmed">${esc(v)}</span>`).join(' ') }
    ],
    rowActions: (a) => [
      { id: 'edit', label: 'Edit', onClick: () => openAttributeForm(a) },
      { id: 'delete', label: 'Delete', variant: 'danger', onClick: () => confirmAction({ title: `Delete "${a.name}"?`, message: 'Products using this attribute keep their existing values.', onConfirm: () => { data.attributes = data.attributes.filter((x) => x.id !== a.id); renderRoute(); } }) }
    ],
    emptyText: 'No attributes yet.'
  });
}
function openAttributeForm(a) {
  openFormModal({
    title: a ? 'Edit attribute' : 'Add attribute',
    fields: [
      { name: 'name', label: 'Attribute name', full: true, required: true },
      { name: 'values', label: 'Values (comma separated)', full: true, required: true }
    ],
    initial: a ? { name: a.name, values: a.values.join(', ') } : {},
    submitLabel: a ? 'Save changes' : 'Add attribute',
    onSubmit: (vals) => {
      const values = vals.values.split(',').map((v) => v.trim()).filter(Boolean);
      if (a) { a.name = vals.name; a.values = values; }
      else data.attributes.push({ id: 'ATTR-' + Date.now(), name: vals.name, values });
      closeModal(); Store.toast('Attribute saved', 'success'); renderRoute();
    }
  });
}

// ── Products > Inventory ─────────────────────────────
function renderInventoryPage(container) {
  data.products.forEach((p) => { p.stockState = p.stock === 0 ? 'out' : (p.stock <= CONFIG.lowStockThreshold ? 'low' : 'in'); });

  const listApi = renderListPage(container, {
    title: 'Inventory',
    description: 'Track and adjust stock levels across your catalog.',
    getRows: () => data.products,
    searchFields: ['name', 'sku'],
    searchPlaceholder: 'Search products or SKU',
    statusFilter: { field: 'stockState', options: [{ value: 'in', label: 'In stock' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }] },
    columns: [
      { key: 'name', label: 'Product', render: (p) => `${esc(p.name)}<br><small>${esc(p.sku)}</small>` },
      { key: 'stock', label: 'Stock', num: true, render: (p) => String(p.stock) },
      { key: 'status', label: 'Status', render: (p) => {
        const label = p.stockState === 'out' ? 'Out of stock' : (p.stockState === 'low' ? 'Low stock' : 'In stock');
        const pill = p.stockState === 'out' ? 'cancelled' : (p.stockState === 'low' ? 'pending' : 'delivered');
        return `<span class="sd-pill ${pill}">${label}</span>`;
      } },
      { key: 'adjust', label: 'Adjust stock', render: (p) => `
        <div class="sd-inline-actions">
          <button type="button" class="btn btn-glass btn-sm" data-stock-adjust="${esc(p.id)}" data-delta="-1">−</button>
          <input type="number" class="sd-stock-input" data-stock-input="${esc(p.id)}" value="${p.stock}" min="0"/>
          <button type="button" class="btn btn-glass btn-sm" data-stock-adjust="${esc(p.id)}" data-delta="1">+</button>
        </div>` }
    ],
    emptyText: 'No products to track.'
  });

  function bumpStock(p, newStock) {
    p.stock = Math.max(0, newStock);
    p.stockState = p.stock === 0 ? 'out' : (p.stock <= CONFIG.lowStockThreshold ? 'low' : 'in');
    Store.toast(`${p.name} stock set to ${p.stock}`, 'success');
    listApi.refresh(); renderLowStock(); renderMetrics();
  }

  container.querySelector('.sd-lp-body').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-stock-adjust]');
    if (!btn) return;
    const p = data.products.find((x) => x.id === btn.dataset.stockAdjust);
    if (p) bumpStock(p, p.stock + Number(btn.dataset.delta));
  });
  container.querySelector('.sd-lp-body').addEventListener('change', (e) => {
    const input = e.target.closest('[data-stock-input]');
    if (!input) return;
    const p = data.products.find((x) => x.id === input.dataset.stockInput);
    if (p) bumpStock(p, Number(input.value) || 0);
  });
}

// ── Messages ──────────────────────────────────────────
let activeConversationId = null;
function renderMessagesPage(container) {
  const convos = data.conversations;
  if (!activeConversationId && convos.length) activeConversationId = convos[0].id;

  function draw() {
    const active = convos.find((c) => c.id === activeConversationId) || convos[0];
    container.innerHTML = `
      <div class="sd-section-head"><h2>Messages</h2><p>Conversations with your customers.</p></div>
      <div class="sd-card glass sd-messages-layout">
        <div class="sd-conv-list">
          <div class="sd-search sd-toolbar-search glass" style="margin-bottom:10px;">
            <span aria-hidden="true">🔍</span><input type="search" placeholder="Search conversations" id="sd-conv-search"/>
          </div>
          <div id="sd-conv-items"></div>
        </div>
        <div class="sd-thread">
          ${active ? `
            <div class="sd-thread-head">
              <span class="sd-avatar" aria-hidden="true">${esc(initials(active.customer))}</span>
              <strong>${esc(active.customer)}</strong>
            </div>
            <div class="sd-thread-body" id="sd-thread-body">
              ${active.messages.map((m) => `<div class="sd-thread-msg ${m.from === 'seller' ? 'me' : ''}"><p>${esc(m.text)}</p><span>${esc(timeAgo(m.at))}</span></div>`).join('')}
            </div>
            <form class="sd-thread-compose" id="sd-thread-compose">
              <input type="text" placeholder="Type a reply…" id="sd-thread-input" autocomplete="off"/>
              <button type="submit" class="btn btn-primary btn-sm btn-liquid">Send</button>
            </form>` : '<p class="sd-empty">No conversations yet.</p>'}
        </div>
      </div>`;

    renderConvList('');
    $('#sd-conv-search')?.addEventListener('input', (e) => renderConvList(e.target.value));

    const compose = $('#sd-thread-compose');
    if (compose) {
      compose.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = $('#sd-thread-input');
        const text = input.value.trim();
        if (!text) return;
        active.messages.push({ from: 'seller', text, at: new Date().toISOString() });
        active.unread = false;
        input.value = '';
        draw();
      });
    }
  }

  function renderConvList(q) {
    const list = q ? convos.filter((c) => c.customer.toLowerCase().includes(q.toLowerCase())) : convos;
    $('#sd-conv-items').innerHTML = list.map((c) => `
      <button type="button" class="sd-conv-item ${c.id === activeConversationId ? 'active' : ''} ${c.unread ? 'unread' : ''}" data-conv="${esc(c.id)}">
        <span class="sd-avatar" aria-hidden="true">${esc(initials(c.customer))}</span>
        <span class="sd-conv-item-body">
          <strong>${esc(c.customer)}</strong>
          <span>${esc(c.messages.at(-1)?.text || '')}</span>
        </span>
        ${c.unread ? '<span class="sd-unread"></span>' : ''}
      </button>`).join('') || '<p class="sd-empty">No matches.</p>';

    $('#sd-conv-items').querySelectorAll('[data-conv]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeConversationId = btn.dataset.conv;
        const c = convos.find((x) => x.id === activeConversationId);
        if (c) c.unread = false;
        draw();
        renderNav();
      });
    });
  }

  draw();
}

// ── Finance > Sales ───────────────────────────────────
function renderFinanceSalesPage(container) {
  renderListPage(container, {
    title: 'Sales',
    description: 'Every transaction recorded against your store.',
    getRows: () => data.orders,
    searchFields: ['id', 'customer'],
    searchPlaceholder: 'Search order # or customer',
    statusFilter: { field: 'status', options: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => ({ value: s, label: STATUS_LABEL[s] })) },
    columns: [
      { key: 'id', label: 'Order', render: (o) => `<span class="sd-order-id">${esc(o.id)}</span><br><small>${esc(o.time || fmtDate(o.createdAt))}</small>` },
      { key: 'customer', label: 'Customer', render: (o) => esc(o.customer) },
      { key: 'total', label: 'Amount', num: true, render: (o) => money(o.total) },
      { key: 'payment', label: 'Payment', render: (o) => `<span class="sd-pill ${o.paymentStatus === 'paid' ? 'delivered' : (o.paymentStatus === 'refunded' ? 'cancelled' : 'pending')}">${esc((o.paymentStatus || '—').toUpperCase())}</span>` },
      { key: 'status', label: 'Status', render: (o) => `<span class="sd-pill ${o.status}">${esc(STATUS_LABEL[o.status] || o.status)}</span>` }
    ],
    rowActions: (o) => [{ id: 'view', label: 'View', onClick: () => openOrderDetailModal(o.id) }],
    emptyText: 'No sales recorded yet.'
  });
}

// ── Finance > Earnings ────────────────────────────────
function renderEarningsPage(container) {
  const delivered = data.orders.filter((o) => o.status === 'delivered');
  const processingLike = data.orders.filter((o) => ['confirmed', 'processing', 'shipped'].includes(o.status));
  const lifetime = sum(delivered.map((o) => o.total)) * (1 - CONFIG.commissionRate);
  const pending = sum(processingLike.map((o) => o.total)) * (1 - CONFIG.commissionRate);
  const withdrawn = sum(data.withdrawals.filter((w) => w.status === 'paid').map((w) => w.amount));
  const available = Math.max(0, lifetime - withdrawn);

  container.innerHTML = `
    <div class="sd-section-head"><h2>Earnings</h2><p>Your balance after JustBuy's ${Math.round(CONFIG.commissionRate * 100)}% commission.</p></div>
    <div class="sd-stats">
      <article class="sd-stat glass"><p class="sd-stat-label">Available balance</p><p class="sd-stat-value">${money(available, 0)}</p></article>
      <article class="sd-stat glass"><p class="sd-stat-label">Pending balance</p><p class="sd-stat-value">${money(pending, 0)}</p></article>
      <article class="sd-stat glass"><p class="sd-stat-label">Lifetime earnings</p><p class="sd-stat-value">${money(lifetime, 0)}</p></article>
      <article class="sd-stat glass"><p class="sd-stat-label">Withdrawn to date</p><p class="sd-stat-value">${money(withdrawn, 0)}</p></article>
    </div>
    <div class="sd-card glass" style="margin-top:16px;">
      <div class="sd-card-head"><h3>Earnings history</h3><p>Delivered orders only</p></div>
      <div class="sd-table-wrap">
        <table class="sd-table">
          <thead><tr><th>Order</th><th>Date</th><th class="sd-num">Sale</th><th class="sd-num">Commission</th><th class="sd-num">Your earnings</th></tr></thead>
          <tbody>${delivered.length ? delivered.slice(0, 12).map((o) => `
            <tr><td class="sd-order-id">${esc(o.id)}</td><td>${esc(fmtDate(o.createdAt))}</td>
            <td class="sd-num">${money(o.total)}</td><td class="sd-num">${money(o.total * CONFIG.commissionRate)}</td>
            <td class="sd-num">${money(o.total * (1 - CONFIG.commissionRate))}</td></tr>`).join('') : '<tr><td colspan="5" class="sd-empty">No delivered orders yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

// ── Finance > Commissions ─────────────────────────────
function renderCommissionsPage(container) {
  renderListPage(container, {
    title: 'Commissions',
    description: 'Platform commission taken from each completed sale.',
    getRows: () => data.orders.filter((o) => ['processing', 'shipped', 'delivered'].includes(o.status)),
    searchFields: ['id', 'customer'],
    searchPlaceholder: 'Search order # or customer',
    columns: [
      { key: 'id', label: 'Order', render: (o) => esc(o.id) },
      { key: 'customer', label: 'Customer', render: (o) => esc(o.customer) },
      { key: 'total', label: 'Sale amount', num: true, render: (o) => money(o.total) },
      { key: 'commission', label: 'Commission', num: true, render: (o) => money(o.total * CONFIG.commissionRate) },
      { key: 'seller', label: 'Your amount', num: true, render: (o) => money(o.total * (1 - CONFIG.commissionRate)) },
      { key: 'status', label: 'Status', render: (o) => `<span class="sd-pill ${o.status}">${esc(STATUS_LABEL[o.status])}</span>` }
    ],
    emptyText: 'No commission records yet.'
  });
}

// ── Finance > Withdrawals ─────────────────────────────
function renderWithdrawalsPage(container) {
  const withdrawn = sum(data.withdrawals.filter((w) => w.status === 'paid').map((w) => w.amount));
  const pendingRequests = sum(data.withdrawals.filter((w) => w.status === 'pending').map((w) => w.amount));
  const delivered = data.orders.filter((o) => o.status === 'delivered');
  const lifetime = sum(delivered.map((o) => o.total)) * (1 - CONFIG.commissionRate);
  const available = Math.max(0, lifetime - withdrawn - pendingRequests);

  renderListPage(container, {
    title: 'Withdrawals',
    description: `Available to withdraw: ${money(available, 2)}`,
    getRows: () => data.withdrawals,
    searchFields: ['id', 'method'],
    searchPlaceholder: 'Search withdrawals',
    statusFilter: { field: 'status', options: [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'rejected', label: 'Rejected' }, { value: 'cancelled', label: 'Cancelled' }] },
    primaryAction: { label: 'Request withdrawal', onClick: () => openWithdrawalForm(available) },
    columns: [
      { key: 'id', label: 'Withdrawal', render: (w) => esc(w.id) },
      { key: 'amount', label: 'Amount', num: true, render: (w) => money(w.amount) },
      { key: 'method', label: 'Method', render: (w) => esc(w.method) },
      { key: 'requestedAt', label: 'Requested', render: (w) => esc(fmtDate(w.requestedAt)) },
      { key: 'status', label: 'Status', render: (w) => `<span class="sd-pill ${w.status === 'paid' ? 'delivered' : (w.status === 'pending' ? 'pending' : 'cancelled')}">${esc(STATUS_LABEL[w.status] || w.status)}</span>` }
    ],
    rowActions: (w) => (w.status === 'pending' ? [{ id: 'cancel', label: 'Cancel', variant: 'danger', onClick: () => { w.status = 'cancelled'; Store.toast(`Withdrawal ${w.id} cancelled`, 'warning'); renderRoute(); } }] : []),
    emptyText: 'No withdrawals yet.'
  });
}
function openWithdrawalForm(available) {
  openFormModal({
    title: 'Request withdrawal',
    description: `Available balance: ${money(available, 2)}`,
    fields: [
      { name: 'amount', label: 'Amount (USD)', type: 'number', step: '0.01', min: 0, required: true },
      { name: 'method', label: 'Payout method', type: 'select', options: data.paymentMethods.map((m) => ({ value: m.label, label: m.label })) }
    ],
    submitLabel: 'Request',
    onSubmit: (vals) => {
      const amount = Number(vals.amount);
      if (!amount || amount <= 0) { Store.toast('Enter a valid amount', 'warning'); return; }
      if (amount > available) { Store.toast('Amount exceeds available balance', 'warning'); return; }
      data.withdrawals.unshift({ id: 'WD-' + Date.now(), amount, method: vals.method, status: 'pending', requestedAt: new Date().toISOString() });
      closeModal(); Store.toast('Withdrawal requested', 'success'); renderRoute();
    }
  });
}

// ── Marketing > Discounts ─────────────────────────────
function renderDiscountsPage(container) {
  renderListPage(container, {
    title: 'Discounts',
    description: 'Percentage or fixed discounts applied automatically.',
    getRows: () => data.discounts,
    searchFields: ['name'],
    searchPlaceholder: 'Search discounts',
    primaryAction: { label: '+ Add discount', onClick: () => openDiscountForm() },
    columns: [
      { key: 'name', label: 'Discount', render: (d) => esc(d.name) },
      { key: 'value', label: 'Value', render: (d) => (d.type === 'percentage' ? `${d.value}%` : money(d.value)) },
      { key: 'scope', label: 'Applies to', render: (d) => esc(d.scope) },
      { key: 'window', label: 'Dates', render: (d) => `${esc(fmtDate(d.startDate))} – ${esc(fmtDate(d.endDate))}` },
      { key: 'status', label: 'Active', render: (d) => toggleCell(d.id, d.status === 'active') }
    ],
    onToggle: (id, refresh) => { const d = data.discounts.find((x) => x.id === id); d.status = d.status === 'active' ? 'inactive' : 'active'; refresh(); },
    rowActions: (d) => [
      { id: 'edit', label: 'Edit', onClick: () => openDiscountForm(d) },
      { id: 'delete', label: 'Delete', variant: 'danger', onClick: () => confirmAction({ title: `Delete "${d.name}"?`, message: 'This discount will stop applying immediately.', onConfirm: () => { data.discounts = data.discounts.filter((x) => x.id !== d.id); renderRoute(); } }) }
    ],
    emptyText: 'No discounts yet.'
  });
}
function openDiscountForm(d) {
  openFormModal({
    title: d ? 'Edit discount' : 'Add discount',
    fields: [
      { name: 'name', label: 'Discount name', full: true, required: true },
      { name: 'type', label: 'Type', type: 'select', options: [{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }] },
      { name: 'value', label: 'Value', type: 'number', step: '0.01', min: 0, required: true },
      { name: 'scope', label: 'Applies to', default: 'All products' },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' }
    ],
    initial: d || {},
    submitLabel: d ? 'Save changes' : 'Add discount',
    onSubmit: (vals) => {
      if (d) Object.assign(d, vals, { value: Number(vals.value) });
      else data.discounts.push({ id: 'DIS-' + Date.now(), ...vals, value: Number(vals.value), status: 'active' });
      closeModal(); Store.toast('Discount saved', 'success'); renderRoute();
    }
  });
}

// ── Marketing > Coupons ───────────────────────────────
function renderCouponsPage(container) {
  renderListPage(container, {
    title: 'Coupons',
    description: 'Code-based discounts customers apply at checkout.',
    getRows: () => data.coupons,
    searchFields: ['code'],
    searchPlaceholder: 'Search coupon codes',
    primaryAction: { label: '+ Add coupon', onClick: () => openCouponForm() },
    columns: [
      { key: 'code', label: 'Code', render: (c) => `<strong>${esc(c.code)}</strong>` },
      { key: 'value', label: 'Discount', render: (c) => (c.type === 'percentage' ? `${c.value}%` : money(c.value)) },
      { key: 'minOrder', label: 'Min order', num: true, render: (c) => (c.minOrder ? money(c.minOrder) : '—') },
      { key: 'used', label: 'Used', num: true, render: (c) => `${c.used} / ${c.usageLimit}` },
      { key: 'expiresAt', label: 'Expires', render: (c) => esc(fmtDate(c.expiresAt)) },
      { key: 'status', label: 'Active', render: (c) => toggleCell(c.id, c.status === 'active') }
    ],
    onToggle: (id, refresh) => { const c = data.coupons.find((x) => x.id === id); c.status = c.status === 'active' ? 'inactive' : 'active'; refresh(); },
    rowActions: (c) => [
      { id: 'edit', label: 'Edit', onClick: () => openCouponForm(c) },
      { id: 'delete', label: 'Delete', variant: 'danger', onClick: () => confirmAction({ title: `Delete "${c.code}"?`, message: 'Customers will no longer be able to redeem this code.', onConfirm: () => { data.coupons = data.coupons.filter((x) => x.id !== c.id); renderRoute(); } }) }
    ],
    emptyText: 'No coupons yet.'
  });
}
function openCouponForm(c) {
  openFormModal({
    title: c ? 'Edit coupon' : 'Add coupon',
    fields: [
      { name: 'code', label: 'Coupon code', full: true, required: true },
      { name: 'type', label: 'Type', type: 'select', options: [{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }] },
      { name: 'value', label: 'Value', type: 'number', step: '0.01', min: 0, required: true },
      { name: 'minOrder', label: 'Minimum order (USD)', type: 'number', step: '0.01', min: 0 },
      { name: 'usageLimit', label: 'Usage limit', type: 'number', min: 1 },
      { name: 'expiresAt', label: 'Expires on', type: 'date' }
    ],
    initial: c || { used: 0 },
    submitLabel: c ? 'Save changes' : 'Add coupon',
    onSubmit: (vals) => {
      if (c) Object.assign(c, vals, { value: Number(vals.value), minOrder: Number(vals.minOrder) || 0, usageLimit: Number(vals.usageLimit) || 0 });
      else data.coupons.push({ id: 'CPN-' + Date.now(), code: vals.code.toUpperCase(), type: vals.type, value: Number(vals.value), minOrder: Number(vals.minOrder) || 0, usageLimit: Number(vals.usageLimit) || 0, used: 0, expiresAt: vals.expiresAt, status: 'active' });
      closeModal(); Store.toast('Coupon saved', 'success'); renderRoute();
    }
  });
}

// ── Marketing > Vouchers ──────────────────────────────
function renderVouchersPage(container) {
  renderListPage(container, {
    title: 'Vouchers',
    description: 'Fixed-value gift vouchers.',
    getRows: () => data.vouchers,
    searchFields: ['code'],
    searchPlaceholder: 'Search voucher codes',
    primaryAction: { label: '+ Add voucher', onClick: () => openVoucherForm() },
    columns: [
      { key: 'code', label: 'Code', render: (v) => `<strong>${esc(v.code)}</strong>` },
      { key: 'value', label: 'Value', num: true, render: (v) => money(v.value) },
      { key: 'used', label: 'Used', num: true, render: (v) => `${v.used} / ${v.usageLimit}` },
      { key: 'validUntil', label: 'Valid until', render: (v) => esc(fmtDate(v.validUntil)) },
      { key: 'status', label: 'Active', render: (v) => toggleCell(v.id, v.status === 'active') }
    ],
    onToggle: (id, refresh) => { const v = data.vouchers.find((x) => x.id === id); v.status = v.status === 'active' ? 'inactive' : 'active'; refresh(); },
    rowActions: (v) => [
      { id: 'edit', label: 'Edit', onClick: () => openVoucherForm(v) },
      { id: 'delete', label: 'Delete', variant: 'danger', onClick: () => confirmAction({ title: `Delete "${v.code}"?`, message: 'Customers will no longer be able to redeem this voucher.', onConfirm: () => { data.vouchers = data.vouchers.filter((x) => x.id !== v.id); renderRoute(); } }) }
    ],
    emptyText: 'No vouchers yet.'
  });
}
function openVoucherForm(v) {
  openFormModal({
    title: v ? 'Edit voucher' : 'Add voucher',
    fields: [
      { name: 'code', label: 'Voucher code', full: true, required: true },
      { name: 'value', label: 'Value (USD)', type: 'number', step: '0.01', min: 0, required: true },
      { name: 'usageLimit', label: 'Usage limit', type: 'number', min: 1 },
      { name: 'validUntil', label: 'Valid until', type: 'date' }
    ],
    initial: v || { used: 0 },
    submitLabel: v ? 'Save changes' : 'Add voucher',
    onSubmit: (vals) => {
      if (v) Object.assign(v, vals, { value: Number(vals.value), usageLimit: Number(vals.usageLimit) || 0 });
      else data.vouchers.push({ id: 'VCH-' + Date.now(), code: vals.code.toUpperCase(), value: Number(vals.value), usageLimit: Number(vals.usageLimit) || 0, used: 0, validUntil: vals.validUntil, status: 'active' });
      closeModal(); Store.toast('Voucher saved', 'success'); renderRoute();
    }
  });
}

// ── Store > My Store ──────────────────────────────────
function renderMyStorePage(container) {
  const sp = data.storeProfile;
  container.innerHTML = `
    <div class="sd-section-head sd-section-head-row">
      <div><h2>My Store</h2><p>How your storefront appears to customers.</p></div>
      <a class="btn btn-glass btn-sm" href="index.html#/" target="_blank" rel="noopener">Preview store ↗</a>
    </div>
    <div class="sd-card glass">
      <form id="sd-store-form" class="sd-form">
        <div class="sd-form-grid">
          <label class="sd-field"><span>Store name</span><input type="text" name="name" value="${esc(sp.name)}" required/></label>
          <label class="sd-field"><span>Category</span><input type="text" name="category" value="${esc(sp.category)}"/></label>
          <label class="sd-field sd-field-full"><span>Store description</span><textarea name="description" rows="3">${esc(sp.description)}</textarea></label>
          <label class="sd-field"><span>Contact email</span><input type="email" name="contactEmail" value="${esc(sp.contactEmail)}"/></label>
          <label class="sd-field"><span>Contact phone</span><input type="tel" name="contactPhone" value="${esc(sp.contactPhone)}"/></label>
          <label class="sd-field sd-field-full"><span>Return policy</span><textarea name="returnPolicy" rows="2">${esc(sp.returnPolicy)}</textarea></label>
        </div>
        <div class="sd-modal-actions" style="justify-content:flex-start;">
          <button type="submit" class="btn btn-primary btn-sm btn-liquid">Save changes</button>
          <span class="sd-hint" id="sd-store-hint"></span>
        </div>
      </form>
    </div>`;

  $('#sd-store-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    Object.assign(sp, Object.fromEntries(fd.entries()));
    $('#sd-store-name').textContent = sp.name;
    $('#sd-store-hint').textContent = 'Saved.';
    Store.toast('Store profile updated', 'success');
  });
}

// ── Store > Reviews ───────────────────────────────────
function renderReviewsPage(container) {
  renderListPage(container, {
    title: 'Reviews',
    description: 'What customers are saying about your products.',
    getRows: () => data.productReviews,
    searchFields: ['product', 'who', 'text'],
    searchPlaceholder: 'Search reviews',
    statusFilter: { field: 'replied', options: [{ value: 'false', label: 'Needs reply' }, { value: 'true', label: 'Replied' }] },
    columns: [
      { key: 'product', label: 'Product', render: (r) => esc(r.product) },
      { key: 'rating', label: 'Rating', render: (r) => `<span class="sd-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>` },
      { key: 'text', label: 'Review', render: (r) => `<div class="sd-order-items" title="${esc(r.text)}">${esc(r.text)}</div>` },
      { key: 'who', label: 'Customer', render: (r) => `${esc(r.who)}<br><small>${esc(r.time)}</small>` },
      { key: 'reply', label: 'Your reply', render: (r) => (r.reply ? `<div class="sd-order-items">${esc(r.reply)}</div>` : '<span class="sd-stock-count low">Not replied</span>') }
    ],
    rowActions: (r) => [{ id: 'reply', label: r.reply ? 'Edit reply' : 'Reply', onClick: () => openReplyForm(r) }],
    emptyText: 'No reviews yet.'
  });
}
function openReplyForm(r) {
  openFormModal({
    title: `Reply to ${r.who}'s review`,
    description: r.text,
    fields: [{ name: 'reply', label: 'Your reply', type: 'textarea', full: true, default: r.reply || '' }],
    submitLabel: 'Post reply',
    onSubmit: (vals) => { r.reply = vals.reply; r.replied = true; closeModal(); Store.toast('Reply posted', 'success'); renderRoute(); }
  });
}

// ── Store > Analytics ─────────────────────────────────
function renderStoreAnalyticsPage(container) {
  container.innerHTML = `
    <div class="sd-section-head"><h2>Analytics</h2><p>Full performance breakdown for ${esc(CONFIG.storeName)}.</p></div>
    <div class="sd-stats" id="sa-stats"></div>
    <div class="sd-row sd-row-2-1" style="margin-top:20px;">
      <article class="sd-card glass"><div class="sd-card-head"><h3>Revenue</h3><p>Last 12 months</p></div><div class="sd-chart" id="sa-revenue"></div></article>
      <article class="sd-card glass"><div class="sd-card-head"><h3>Order status mix</h3></div><div id="sa-status-bars" class="sd-bar-list"></div></article>
    </div>
    <article class="sd-card glass" style="margin-top:20px;"><div class="sd-card-head"><h3>Best sellers</h3></div><div id="sa-best" class="sd-bar-list"></div></article>`;

  const t = totals();
  const deliveredCount = data.orders.filter((o) => o.status === 'delivered').length;
  const cards = [
    { label: 'Total sales', value: money(t.totalSales, 0) },
    { label: 'Total orders', value: t.totalOrders.toLocaleString('en-US') },
    { label: 'Completion rate', value: `${Math.round((deliveredCount / Math.max(1, data.orders.length)) * 100)}%` },
    { label: 'Units sold (top products)', value: sum(data.topProducts.map((p) => p.units)).toLocaleString('en-US') }
  ];
  $('#sa-stats').innerHTML = cards.map((c) => `<article class="sd-stat glass"><p class="sd-stat-label">${esc(c.label)}</p><p class="sd-stat-value">${esc(c.value)}</p></article>`).join('');

  lineChart($('#sa-revenue'), { labels: monthLabels(12), values: data.series.month.sales.map((v) => +(v * (1 - CONFIG.commissionRate)).toFixed(2)), color: '#6B7B5C', label: 'Revenue', fmt: (v) => money(v), axisFmt: moneyAxis });

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const counts = statuses.map((s) => data.orders.filter((o) => o.status === s).length);
  const maxCount = Math.max(1, ...counts);
  $('#sa-status-bars').innerHTML = statuses.map((s, i) => `
    <div class="sd-bar-row"><span>${esc(STATUS_LABEL[s])}</span>
    <span class="sd-bar-track"><span class="sd-bar-fill" style="width:${(counts[i] / maxCount) * 100}%"></span></span>
    <span>${counts[i]}</span></div>`).join('');

  const best = [...data.topProducts].sort((a, b) => b.units - a.units);
  const maxUnits = Math.max(1, ...best.map((p) => p.units));
  $('#sa-best').innerHTML = best.map((p) => `
    <div class="sd-bar-row"><span>${esc(p.name)}</span>
    <span class="sd-bar-track"><span class="sd-bar-fill" style="width:${(p.units / maxUnits) * 100}%"></span></span>
    <span>${p.units} sold</span></div>`).join('');
}

// ── Settings > Profile ────────────────────────────────
function renderProfilePage(container) {
  const sp = data.sellerProfile;
  container.innerHTML = `
    <div class="sd-section-head"><h2>Profile</h2><p>Your personal seller account details.</p></div>
    <div class="sd-card glass">
      <form id="sd-profile-form" class="sd-form">
        <div class="sd-form-grid">
          <label class="sd-field"><span>Full name</span><input type="text" name="name" value="${esc(sp.name)}" required/></label>
          <label class="sd-field"><span>Email</span><input type="email" name="email" value="${esc(sp.email)}" required/></label>
          <label class="sd-field"><span>Phone number</span><input type="tel" name="phone" value="${esc(sp.phone)}"/></label>
          <label class="sd-field"><span>Account status</span><span class="sd-pill delivered" style="align-self:center; width:fit-content;">Active</span></label>
        </div>
        <div class="sd-modal-actions" style="justify-content:flex-start;">
          <button type="submit" class="btn btn-primary btn-sm btn-liquid">Save profile</button>
          <span class="sd-hint" id="sd-profile-hint"></span>
        </div>
      </form>
    </div>
    <div class="sd-card glass" style="margin-top:16px;">
      <div class="sd-card-head"><h3>Selling summary</h3></div>
      <p class="sd-hint sd-hint-static">${esc(sp.bio)}</p>
    </div>`;

  $('#sd-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    Object.assign(sp, Object.fromEntries(fd.entries()));
    $('#sd-profile-hint').textContent = 'Saved.';
    Store.toast('Profile updated', 'success');
  });
}

// ── Settings > Store Settings ─────────────────────────
function renderStoreSettingsPage(container) {
  const ds = data.storeOpsSettings;
  container.innerHTML = `
    <div class="sd-section-head"><h2>Store Settings</h2><p>Operational preferences for your storefront.</p></div>
    <div class="sd-card glass">
      <form id="sd-ops-form" class="sd-form">
        <div class="sd-form-grid">
          <label class="sd-field sd-field-checkbox sd-field-full"><input type="checkbox" name="autoAcceptOrders" ${ds.autoAcceptOrders ? 'checked' : ''}/><span>Automatically confirm new orders</span></label>
          <label class="sd-field sd-field-checkbox sd-field-full"><input type="checkbox" name="orderNotifications" ${ds.orderNotifications ? 'checked' : ''}/><span>Email me for every new order</span></label>
          <label class="sd-field"><span>Display currency</span><select name="currency">
            <option ${ds.currency === 'USD' ? 'selected' : ''}>USD</option>
            <option ${ds.currency === 'LKR' ? 'selected' : ''}>LKR</option>
            <option ${ds.currency === 'EUR' ? 'selected' : ''}>EUR</option>
          </select></label>
        </div>
        <div class="sd-modal-actions" style="justify-content:flex-start;"><button type="submit" class="btn btn-primary btn-sm btn-liquid">Save settings</button><span class="sd-hint" id="sd-ops-hint"></span></div>
      </form>
    </div>`;
  $('#sd-ops-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    ds.autoAcceptOrders = fd.get('autoAcceptOrders') === 'on';
    ds.orderNotifications = fd.get('orderNotifications') === 'on';
    ds.currency = fd.get('currency');
    $('#sd-ops-hint').textContent = 'Saved.';
    Store.toast('Store settings saved', 'success');
  });
}

// ── Settings > Payment ────────────────────────────────
function renderPaymentPage(container) {
  renderListPage(container, {
    title: 'Payment',
    description: 'Where your earnings are paid out.',
    getRows: () => data.paymentMethods,
    searchFields: ['label'],
    searchPlaceholder: 'Search payment methods',
    primaryAction: { label: '+ Add method', onClick: () => openPaymentForm() },
    columns: [
      { key: 'label', label: 'Method', render: (m) => `${esc(m.label)}${m.isDefault ? ' <span class="sd-pill delivered">Default</span>' : ''}` },
      { key: 'type', label: 'Type', render: (m) => esc(m.type) }
    ],
    rowActions: (m) => [
      ...(m.isDefault ? [] : [{ id: 'default', label: 'Set default', onClick: () => { data.paymentMethods.forEach((x) => { x.isDefault = false; }); m.isDefault = true; renderRoute(); } }]),
      { id: 'delete', label: 'Remove', variant: 'danger', onClick: () => confirmAction({ title: `Remove "${m.label}"?`, message: 'You will no longer be paid out to this method.', onConfirm: () => { data.paymentMethods = data.paymentMethods.filter((x) => x.id !== m.id); renderRoute(); } }) }
    ],
    emptyText: 'No payment methods yet.'
  });
}
function openPaymentForm() {
  openFormModal({
    title: 'Add payment method',
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: [{ value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'JustBuy Wallet', label: 'JustBuy Wallet' }] },
      { name: 'label', label: 'Label (e.g. bank name + last 4 digits)', full: true, required: true }
    ],
    submitLabel: 'Add method',
    onSubmit: (vals) => { data.paymentMethods.push({ id: 'PM-' + Date.now(), type: vals.type, label: vals.label, isDefault: false }); closeModal(); Store.toast('Payment method added', 'success'); renderRoute(); }
  });
}

// ── Settings > Delivery ───────────────────────────────
function renderDeliverySettingsPage(container) {
  const ds = data.deliverySettings;
  container.innerHTML = `
    <div class="sd-section-head"><h2>Delivery</h2><p>Shipping options and charges customers see at checkout.</p></div>
    <div class="sd-card glass">
      <div class="sd-table-wrap">
        <table class="sd-table"><thead><tr><th>Option</th><th>Delivery time</th><th class="sd-num">Fee</th><th>Enabled</th></tr></thead>
        <tbody>${ds.options.map((o) => `<tr><td>${esc(o.name)}</td><td>${esc(o.days)}</td><td class="sd-num">${o.fee ? money(o.fee) : 'Free'}</td><td>${toggleCell(o.id, o.enabled)}</td></tr>`).join('')}</tbody></table>
      </div>
      <form id="sd-freeship-form" class="sd-form" style="margin-top:16px;">
        <label class="sd-field"><span>Free shipping over</span><input type="number" name="threshold" min="0" step="1" value="${ds.freeShippingThreshold}"/></label>
        <div class="sd-modal-actions" style="justify-content:flex-start;"><button type="submit" class="btn btn-primary btn-sm btn-liquid">Save</button><span class="sd-hint" id="sd-freeship-hint"></span></div>
      </form>
    </div>`;
  container.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const o = ds.options.find((x) => x.id === btn.dataset.toggle);
      o.enabled = !o.enabled;
      renderRoute();
    });
  });
  $('#sd-freeship-form').addEventListener('submit', (e) => {
    e.preventDefault();
    ds.freeShippingThreshold = Number(new FormData(e.target).get('threshold')) || 0;
    $('#sd-freeship-hint').textContent = 'Saved.';
    Store.toast('Delivery settings saved', 'success');
  });
}

// ── Settings > Shop Managers ──────────────────────────
function renderManagersPage(container) {
  renderListPage(container, {
    title: 'Shop Managers',
    description: 'Staff who can help run your store. Backend must still enforce each permission server-side.',
    getRows: () => data.managers,
    searchFields: ['name', 'email', 'role'],
    searchPlaceholder: 'Search managers',
    primaryAction: { label: '+ Add manager', onClick: () => openManagerForm() },
    columns: [
      { key: 'name', label: 'Name', render: (m) => `<span class="sd-cell-user"><span class="sd-avatar" aria-hidden="true">${esc(initials(m.name))}</span>${esc(m.name)}</span>` },
      { key: 'email', label: 'Email', render: (m) => esc(m.email) },
      { key: 'role', label: 'Role', render: (m) => esc(m.role) },
      { key: 'permissions', label: 'Permissions', render: (m) => m.permissions.map((p) => `<span class="sd-pill confirmed">${esc(p)}</span>`).join(' ') },
      { key: 'status', label: 'Active', render: (m) => toggleCell(m.id, m.status === 'active') }
    ],
    onToggle: (id, refresh) => { const m = data.managers.find((x) => x.id === id); m.status = m.status === 'active' ? 'inactive' : 'active'; refresh(); },
    rowActions: (m) => [
      { id: 'edit', label: 'Edit', onClick: () => openManagerForm(m) },
      { id: 'delete', label: 'Remove', variant: 'danger', onClick: () => confirmAction({ title: `Remove ${m.name}?`, message: 'They will lose access to your store immediately.', onConfirm: () => { data.managers = data.managers.filter((x) => x.id !== m.id); renderRoute(); } }) }
    ],
    emptyText: 'No shop managers yet.'
  });
}
function openManagerForm(m) {
  openFormModal({
    title: m ? 'Edit manager' : 'Add manager',
    fields: [
      { name: 'name', label: 'Full name', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'role', label: 'Role', type: 'select', options: [{ value: 'Manager', label: 'Manager' }, { value: 'Support', label: 'Support' }, { value: 'Inventory Clerk', label: 'Inventory Clerk' }] },
      { name: 'permissions', label: 'Permissions (comma separated: orders, products, deliveries, messages, finance, marketing)', full: true, default: m ? m.permissions.join(', ') : '' }
    ],
    initial: m || {},
    submitLabel: m ? 'Save changes' : 'Add manager',
    onSubmit: (vals) => {
      const permissions = vals.permissions.split(',').map((v) => v.trim()).filter(Boolean);
      if (m) Object.assign(m, vals, { permissions });
      else data.managers.push({ id: 'MGR-' + Date.now(), name: vals.name, email: vals.email, role: vals.role, permissions, status: 'active' });
      closeModal(); Store.toast('Manager saved', 'success'); renderRoute();
    }
  });
}

// ── Settings > Security ───────────────────────────────
function renderSecurityPage(container) {
  const si = data.securityInfo;
  container.innerHTML = `
    <div class="sd-section-head"><h2>Security</h2><p>Password, sessions and two-factor authentication.</p></div>
    <div class="sd-card glass">
      <h3 style="margin-bottom:12px;">Change password</h3>
      <form id="sd-password-form" class="sd-form">
        <div class="sd-form-grid">
          <label class="sd-field"><span>Current password</span><input type="password" name="current" autocomplete="current-password"/></label>
          <label class="sd-field"><span>New password</span><input type="password" name="next" autocomplete="new-password"/></label>
          <label class="sd-field"><span>Confirm new password</span><input type="password" name="confirm" autocomplete="new-password"/></label>
        </div>
        <div class="sd-modal-actions" style="justify-content:flex-start;">
          <button type="submit" class="btn btn-primary btn-sm btn-liquid">Update password</button>
          <span class="sd-hint" id="sd-password-hint"></span>
        </div>
      </form>
    </div>
    <div class="sd-card glass" style="margin-top:16px;">
      <div class="sd-card-head"><h3>Two-factor authentication</h3></div>
      <div class="sd-vacation-row">
        <span>${si.twoFactorEnabled ? 'Enabled — your account has an extra layer of protection.' : 'Add an extra layer of protection to your account.'}</span>
        <button type="button" class="sd-switch" id="sd-2fa-switch" aria-checked="${si.twoFactorEnabled}"><span class="sd-switch-knob"></span></button>
      </div>
    </div>
    <div class="sd-card glass" style="margin-top:16px;">
      <div class="sd-card-head"><h3>Active sessions</h3></div>
      <ul class="sd-feed">${si.sessions.map((s) => `<li><span class="sd-feed-icon" aria-hidden="true">💻</span><div class="sd-feed-body"><div class="sd-feed-title"><span>${esc(s.device)}${s.current ? ' (this device)' : ''}</span></div><p class="sd-feed-text">${esc(s.location)}</p><p class="sd-feed-time">${esc(s.lastActive)}</p></div></li>`).join('')}</ul>
    </div>`;

  $('#sd-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const next = fd.get('next'), confirmVal = fd.get('confirm');
    const hint = $('#sd-password-hint');
    hint.classList.remove('error');
    if (!next || next.length < 8) { hint.textContent = 'New password must be at least 8 characters.'; hint.classList.add('error'); return; }
    if (next !== confirmVal) { hint.textContent = "Passwords don't match."; hint.classList.add('error'); return; }
    e.target.reset();
    hint.textContent = 'Password updated.';
    si.lastPasswordChange = new Date().toISOString();
    Store.toast('Password updated', 'success');
  });

  $('#sd-2fa-switch').addEventListener('click', () => {
    si.twoFactorEnabled = !si.twoFactorEnabled;
    Store.toast(si.twoFactorEnabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled', si.twoFactorEnabled ? 'success' : 'warning');
    renderRoute();
  });
}

// ── Settings > Vacation Mode (shares state with the sidebar switch) ──
function setVacationMode(on, announce) {
  const sw = $('#sd-vacation-switch');
  const banner = $('#sd-vacation-banner');
  if (sw) sw.setAttribute('aria-checked', String(on));
  if (banner) banner.hidden = !on;
  localStorage.setItem('jb_vacation', on ? '1' : '0');
  if (announce) Store.toast(on ? 'Vacation mode is on' : 'Vacation mode is off', on ? 'warning' : 'success');
}
function renderVacationPage(container) {
  const vd = data.vacationDetails;
  const isOn = localStorage.getItem('jb_vacation') === '1';
  container.innerHTML = `
    <div class="sd-section-head"><h2>Vacation Mode</h2><p>Pause your storefront while you're away.</p></div>
    <div class="sd-card glass">
      <div class="sd-vacation-row" style="margin-bottom:16px;">
        <span>${isOn ? 'Vacation mode is currently ON.' : 'Vacation mode is currently OFF.'}</span>
        <button type="button" class="sd-switch" id="sd-vacation-page-switch" aria-checked="${isOn}"><span class="sd-switch-knob"></span></button>
      </div>
      <form id="sd-vacation-form" class="sd-form">
        <div class="sd-form-grid">
          <label class="sd-field"><span>Start date</span><input type="date" name="startDate" value="${esc(vd.startDate)}"/></label>
          <label class="sd-field"><span>End date</span><input type="date" name="endDate" value="${esc(vd.endDate)}"/></label>
          <label class="sd-field sd-field-full"><span>Message shown to customers</span><textarea name="message" rows="2">${esc(vd.message)}</textarea></label>
        </div>
        <div class="sd-modal-actions" style="justify-content:flex-start;"><button type="submit" class="btn btn-primary btn-sm btn-liquid">Save</button><span class="sd-hint" id="sd-vacation-hint"></span></div>
      </form>
    </div>`;

  $('#sd-vacation-page-switch').addEventListener('click', () => {
    const on = localStorage.getItem('jb_vacation') !== '1';
    setVacationMode(on, true);
    renderRoute();
  });
  $('#sd-vacation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    vd.startDate = fd.get('startDate'); vd.endDate = fd.get('endDate'); vd.message = fd.get('message');
    $('#sd-vacation-hint').textContent = 'Saved.';
    Store.toast('Vacation settings saved', 'success');
  });
}

// ── Route table ───────────────────────────────────────
const PAGE_RENDERERS = {
  'sales-orders': renderOrdersPage,
  'sales-returns': renderReturnsPage,
  'sales-cancellations': renderCancellationsPage,
  'products-all': renderProductsPage,
  'products-add': renderAddProductPage,
  'products-categories': renderCategoriesPage,
  'products-attributes': renderAttributesPage,
  'products-inventory': renderInventoryPage,
  'delivery-all': makeDeliveryPage(null),
  'delivery-processing': makeDeliveryPage('processing'),
  'delivery-shipped': makeDeliveryPage('shipped'),
  'delivery-out': makeDeliveryPage('out_for_delivery'),
  'delivery-delivered': makeDeliveryPage('delivered'),
  messages: renderMessagesPage,
  'finance-sales': renderFinanceSalesPage,
  'finance-earnings': renderEarningsPage,
  'finance-commissions': renderCommissionsPage,
  'finance-withdrawals': renderWithdrawalsPage,
  'marketing-discounts': renderDiscountsPage,
  'marketing-coupons': renderCouponsPage,
  'marketing-vouchers': renderVouchersPage,
  'store-mystore': renderMyStorePage,
  'store-reviews': renderReviewsPage,
  'store-analytics': renderStoreAnalyticsPage,
  'settings-profile': renderProfilePage,
  'settings-store': renderStoreSettingsPage,
  'settings-payment': renderPaymentPage,
  'settings-delivery': renderDeliverySettingsPage,
  'settings-managers': renderManagersPage,
  'settings-security': renderSecurityPage,
  'settings-vacation': renderVacationPage
};

// ── Router ────────────────────────────────────────────
function slugToRoute(hash) {
  const h = (hash || '').replace(/^#\/?/, '').trim();
  return h || 'dashboard';
}
function navigate(route) {
  location.hash = `#/${route}`;
}
function closeMobileMenu() {
  const sidebar = $('#sd-sidebar'), backdrop = $('#sd-backdrop'), menuBtn = $('#sd-menu-btn');
  if (!sidebar) return;
  sidebar.classList.remove('open');
  backdrop.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}
function renderRoute() {
  currentRoute = slugToRoute(location.hash);
  const meta = ROUTE_META[currentRoute];
  const dash = $('#sd-view-dashboard');
  const page = $('#sd-view-page');

  if (currentRoute === 'dashboard' || !meta) {
    currentRoute = 'dashboard';
    dash.hidden = false; page.hidden = true; page.innerHTML = '';
    $('#sd-greeting').textContent = ORIGINAL_GREETING;
    $('#sd-date').textContent = ORIGINAL_DATE;
  } else {
    dash.hidden = true; page.hidden = false;
    $('#sd-greeting').textContent = meta.label;
    $('#sd-date').textContent = meta.group || '';
    const renderFn = PAGE_RENDERERS[currentRoute];
    if (renderFn) renderFn(page);
    else page.innerHTML = '<div class="sd-card glass sd-empty">Page not found.</div>';
  }
  renderNav();
  closeMobileMenu();
  window.scrollTo(0, 0);
}

// ── Global search ─────────────────────────────────────
function performGlobalSearch(q) {
  const needle = q.toLowerCase();
  const target = (data.orders || []).some((o) => o.id.toLowerCase().includes(needle) || o.customer.toLowerCase().includes(needle))
    ? 'sales-orders' : 'products-all';
  navigate(target);
  const el = $('[data-lp-search]');
  if (el) { el.value = q; el.dispatchEvent(new Event('input')); }
}

// ── Extra chrome wiring (modal + capturing initial greeting) ──
function setupExtraChrome() {
  ORIGINAL_GREETING = $('#sd-greeting').textContent;
  ORIGINAL_DATE = $('#sd-date').textContent;

  $('#sd-modal-overlay').addEventListener('click', (e) => { if (e.target.id === 'sd-modal-overlay') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#sd-modal-overlay').hidden) closeModal(); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-modal-cancel]')) closeModal(); });
}
