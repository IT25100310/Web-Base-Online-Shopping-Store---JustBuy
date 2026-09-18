/* ===== JustBuy Seller Dashboard — behavior ===== */

document.addEventListener('DOMContentLoaded', () => {
  animateStats();
  renderOrders();
  drawRevenueChart();
  wireRangeToggle();
  wireNav();
});

/* Count-up animation for the stat cards */
function animateStats(){
  const els = document.querySelectorAll('.stat-value[data-value]');
  els.forEach(el => {
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const isCurrency = target > 1000 && el.textContent.trim().startsWith('$') === false && el.parentElement.querySelector('.stat-label').textContent.toLowerCase().includes('revenue');
    const duration = 900;
    const start = performance.now();

    function frame(now){
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = formatStatValue(value, decimals, isCurrency);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = formatStatValue(target, decimals, isCurrency);
    }
    requestAnimationFrame(frame);
  });
}

function formatStatValue(value, decimals, isCurrency){
  if (isCurrency){
    return '$' + Math.round(value).toLocaleString('en-US');
  }
  if (decimals > 0){
    return value.toFixed(decimals);
  }
  return Math.round(value).toLocaleString('en-US');
}

/* Recent orders — sample data, swap for a real fetch() in production */
const ORDERS = [
  { id: '#JB-8841', buyer: 'Amara K.',   item: 'Spatial Audio Pro',      total: '$180.00', status: 'fulfilled' },
  { id: '#JB-8840', buyer: 'Devon R.',   item: 'Liquid Precision Mouse', total: '$96.00',  status: 'pending' },
  { id: '#JB-8839', buyer: 'Priya S.',   item: 'Orbit Desk Mat',         total: '$42.00',  status: 'fulfilled' },
  { id: '#JB-8838', buyer: 'Marcus L.',  item: 'Studio Stand Mk II',     total: '$68.00',  status: 'fulfilled' },
  { id: '#JB-8837', buyer: 'Elena V.',   item: 'Spatial Audio Pro',      total: '$180.00', status: 'refunded' },
  { id: '#JB-8836', buyer: 'Tomas B.',   item: 'Orbit Desk Mat',         total: '$42.00',  status: 'pending' },
];

const STATUS_LABEL = {
  fulfilled: 'Fulfilled',
  pending: 'Pending',
  refunded: 'Refunded',
};

function renderOrders(){
  const body = document.getElementById('ordersBody');
  if (!body) return;

  body.innerHTML = ORDERS.map(order => `
    <tr>
      <td class="order-id">${order.id}</td>
      <td>${order.buyer}</td>
      <td>${order.item}</td>
      <td>${order.total}</td>
      <td><span class="status-pill status-${order.status}">${STATUS_LABEL[order.status]}</span></td>
    </tr>
  `).join('');
}

/* Lightweight canvas revenue chart — no external chart library required */
function drawRevenueChart(){
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.parentElement.clientWidth - 40; // account for panel padding
  const cssHeight = 220;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const current  = [820, 940, 880, 1210, 1040, 1380, 1290, 1510, 1440, 1690, 1580, 1820];
  const previous = [640, 700, 690, 860, 800, 990, 940, 1080, 1030, 1180, 1120, 1240];
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const padding = { top: 12, right: 8, bottom: 24, left: 8 };
  const chartW = cssWidth - padding.left - padding.right;
  const chartH = cssHeight - padding.top - padding.bottom;
  const maxVal = Math.max(...current, ...previous) * 1.15;

  const orange = getComputedColor('--orange') || '#ff6a1f';
  const dim = getComputedColor('--text-faint') || '#6f6a63';

  const toXY = (arr, i) => {
    const x = padding.left + (i / (arr.length - 1)) * chartW;
    const y = padding.top + chartH - (arr[i] / maxVal) * chartH;
    return [x, y];
  };

  function drawLine(arr, color, fill){
    ctx.beginPath();
    arr.forEach((_, i) => {
      const [x, y] = toXY(arr, i);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    if (fill){
      const [lastX] = toXY(arr, arr.length - 1);
      const [firstX] = toXY(arr, 0);
      ctx.lineTo(lastX, padding.top + chartH);
      ctx.lineTo(firstX, padding.top + chartH);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, hexToRgba(color, 0.22));
      gradient.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  ctx.clearRect(0, 0, cssWidth, cssHeight);
  drawLine(previous, '#3a3a3a', false);
  drawLine(current, orange, true);

  // x-axis month labels (sparse, to avoid clutter)
  ctx.fillStyle = dim;
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((label, i) => {
    if (i % 2 !== 0) return;
    const [x] = toXY(current, i);
    ctx.fillText(label, x, cssHeight - 6);
  });
}

function getComputedColor(varName){
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function hexToRgba(hex, alpha){
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* 7d / 30d / 90d range toggle (visual state only — wire to real data as needed) */
function wireRangeToggle(){
  const buttons = document.querySelectorAll('[data-range-btn]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Redraw or refetch chart data for the selected range here.
      drawRevenueChart();
    });
  });
}

/* Sidebar nav active-state switching */
function wireNav(){
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* Redraw chart responsively */
window.addEventListener('resize', debounce(drawRevenueChart, 150));

function debounce(fn, wait){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
