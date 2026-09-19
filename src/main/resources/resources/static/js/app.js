// ============================================
// JustBuy — Master Frontend Application Entry
// ============================================

import { Router } from './router.js';
import { Store } from './store.js';
import { ShaderGradient } from './shader-gradient.js';
import { LiquidGlass } from './liquid-glass.js';
import { API } from './api.js';

class JustBuyApp {
  static init() {
    // 1. Initialize Theme from localStorage
    Store.initTheme();

    // 2. Initialize Background WebGL Shader Gradient
    try {
      new ShaderGradient('bg-shader-canvas');
    } catch (e) {
      console.warn('Shader gradient background init:', e);
    }

    // 3. Initialize Liquid Glass UI interactions
    LiquidGlass.init();

    // 4. Initialize Hash Router
    Router.init();

    // 5. Setup Global Navigation & Interactivity
    this.setupNavbar();
    this.setupSearch();
    this.setupQuickCartDrawer();
    this.setupChatWidget();
    this.setupCurrencySelector();

    // 6. Bind Reactive Badges
    this.updateBadges();
    Store.on('cart-updated', () => this.updateBadges());
    Store.on('wishlist-updated', () => this.updateBadges());
    Store.on('currency-changed', () => Router.handleRoute());
  }

  static setupNavbar() {
    const role = Store.state.user?.role || 'customer';
    const sellerDashboardLink = document.querySelector('.seller-dashboard-link');
    if (sellerDashboardLink) {
      sellerDashboardLink.hidden = role !== 'seller';
    }
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    });

    // Dark Mode Switch
    const themeBtn = document.getElementById('theme-toggle-btn');
    themeBtn?.addEventListener('click', () => {
      Store.toggleTheme();
      themeBtn.innerHTML = Store.state.darkMode ? '☀️' : '🌙';
    });
    if (themeBtn) {
      themeBtn.innerHTML = Store.state.darkMode ? '☀️' : '🌙';
    }
  }

  static setupSearch() {
    const input = document.getElementById('global-search-input');
    const form = document.getElementById('global-search-form');
    const suggestionsBox = document.getElementById('search-suggestions');

    if (!input || !suggestionsBox) return;

    let debounceTimer;
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const val = e.target.value.trim();
      if (val.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
      }

      debounceTimer = setTimeout(async () => {
        const results = await API.searchProducts(val);
        if (results.length > 0) {
          suggestionsBox.innerHTML = results.slice(0, 5).map(p => `
            <a href="#/product/${p.id}" class="suggestion-item">
              <img src="${p.thumbnailUrl}" alt="${p.name}" class="sug-thumb" />
              <div class="sug-info">
                <span class="sug-title">${p.name}</span>
                <span class="sug-price">${Store.formatPrice(p.price)}</span>
              </div>
            </a>
          `).join('');
          suggestionsBox.style.display = 'block';
        } else {
          suggestionsBox.style.display = 'none';
        }
      }, 250);
    });

    document.addEventListener('click', (e) => {
      if (!form?.contains(e.target)) {
        suggestionsBox.style.display = 'none';
      }
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      suggestionsBox.style.display = 'none';
      if (val) {
        window.location.hash = `#/products?search=${encodeURIComponent(val)}`;
      }
    });
  }

  static setupQuickCartDrawer() {
    const trigger = document.getElementById('nav-cart-btn');
    const drawer = document.getElementById('quick-cart-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const closeBtn = document.getElementById('close-drawer-btn');

    const openDrawer = () => {
      this.renderDrawerItems();
      drawer?.classList.add('open');
      backdrop?.classList.add('open');
    };

    const closeDrawer = () => {
      drawer?.classList.remove('open');
      backdrop?.classList.remove('open');
    };

    trigger?.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });

    closeBtn?.addEventListener('click', closeDrawer);
    backdrop?.addEventListener('click', closeDrawer);

    Store.on('cart-updated', () => {
      if (drawer?.classList.contains('open')) {
        this.renderDrawerItems();
      }
    });
  }

  static renderDrawerItems() {
    const container = document.getElementById('drawer-items-container');
    const subtotalEl = document.getElementById('drawer-subtotal');
    if (!container) return;

    const items = Store.state.cart;
    const totals = Store.getCartTotals();

    if (!items.length) {
      container.innerHTML = `
        <div class="drawer-empty">
          <span>🛒</span>
          <p>Your bag is empty.</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = Store.formatPrice(0);
      return;
    }

    container.innerHTML = items.map((item, idx) => `
      <div class="drawer-item glass">
        <img src="${item.thumbnailUrl}" alt="${item.name}" class="drawer-item-img" />
        <div class="drawer-item-info">
          <span class="drawer-item-name">${item.name}</span>
          <span class="drawer-item-meta">${item.color} | Qty: ${item.quantity}</span>
          <span class="drawer-item-price">${Store.formatPrice(item.price * item.quantity)}</span>
        </div>
        <button class="drawer-remove-btn" onclick="window.JustBuyApp.removeDrawerItem(${idx})">✕</button>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = Store.formatPrice(totals.subtotal);
  }

  static removeDrawerItem(idx) {
    Store.removeFromCart(idx);
    this.renderDrawerItems();
  }

  static setupChatWidget() {
    const fab = document.getElementById('chat-fab');
    const widget = document.getElementById('chat-widget');
    const close = document.getElementById('chat-close-btn');
    const send = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    fab?.addEventListener('click', () => {
      widget?.classList.toggle('open');
    });

    close?.addEventListener('click', () => {
      widget?.classList.remove('open');
    });

    const postMsg = (text, isUser = true) => {
      const el = document.createElement('div');
      el.className = `chat-bubble ${isUser ? 'user glass' : 'bot glass'}`;
      el.textContent = text;
      messages?.appendChild(el);
      messages?.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
    };

    const handleSend = () => {
      const txt = input?.value.trim();
      if (!txt) return;
      postMsg(txt, true);
      if (input) input.value = '';

      setTimeout(() => {
        postMsg("Hello! I'm JustBuy's 2026 AI concierge. I can check global stock, calculate express delivery times, or connect you directly with artisan sellers.", false);
      }, 600);
    };

    send?.addEventListener('click', handleSend);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  static setupCurrencySelector() {
    const select = document.getElementById('currency-selector');
    if (select) {
      select.value = Store.state.currency;
      select.addEventListener('change', (e) => {
        Store.setCurrency(e.target.value);
      });
    }
  }

  static updateBadges() {
    const cartCount = Store.getCartCount();
    const wishCount = Store.state.wishlist.length;

    const cartBadge = document.getElementById('nav-cart-count');
    const wishBadge = document.getElementById('nav-wish-count');

    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.style.display = cartCount > 0 ? 'inline-flex' : 'none';
    }

    if (wishBadge) {
      wishBadge.textContent = wishCount;
      wishBadge.style.display = wishCount > 0 ? 'inline-flex' : 'none';
    }
  }
}

window.JustBuyApp = JustBuyApp;
document.addEventListener('DOMContentLoaded', () => JustBuyApp.init());
