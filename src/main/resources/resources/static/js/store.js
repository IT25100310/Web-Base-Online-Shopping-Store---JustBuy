// ============================================
// JustBuy — Reactive Global State Store
// ============================================

const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
  JPY: { symbol: '¥', rate: 155.0, label: 'JPY (¥)' }
};

export const Store = {
  state: {
    cart: JSON.parse(localStorage.getItem('jb_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('jb_wishlist') || '[]'),
    seller: JSON.parse(localStorage.getItem('jb_seller') || 'null'),
    currency: localStorage.getItem('jb_currency') || 'USD',
    darkMode: localStorage.getItem('jb_theme') === 'dark',
    user: JSON.parse(localStorage.getItem('jb_user') || 'null') || {
      name: 'Alexander Wright',
      email: 'alex.wright@justbuy.design',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      address: '742 Evergreen Terrace, Brooklyn, NY 11201'
    },
    activePromo: null,
    discountAmount: 0
  },

  setSeller(seller) {
    this.state.seller = seller;
    localStorage.setItem('jb_seller', JSON.stringify(seller));
    this.dispatch('seller-changed', seller);
  },

  logout() {
    this.state.user = null;
    this.state.seller = null;
    localStorage.removeItem('jb_user');
    localStorage.removeItem('jb_seller');
    this.dispatch('auth-changed');
  },

  // ── Cart Operations ──
  addToCart(product, options = {}) {
    const qty = options.quantity || 1;
    const color = options.color || (product.colors ? product.colors.split(',')[0].trim() : 'Default');
    const size = options.size || (product.sizes ? product.sizes.split(',')[0].trim() : 'Standard');
    
    const existingIndex = this.state.cart.findIndex(
      item => item.id === product.id && item.color === color && item.size === size
    );

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += qty;
    } else {
      this.state.cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        thumbnailUrl: product.thumbnailUrl,
        freeShipping: product.freeShipping,
        color,
        size,
        quantity: qty
      });
    }

    this._saveCart();
    this.dispatch('cart-updated', this.state.cart);
    this.toast(`Added "${product.name.slice(0, 24)}..." to cart!`, 'success');
  },

  updateQuantity(index, qty) {
    if (qty <= 0) {
      this.state.cart.splice(index, 1);
    } else {
      this.state.cart[index].quantity = qty;
    }
    this._saveCart();
    this.dispatch('cart-updated', this.state.cart);
  },

  removeFromCart(index) {
    const item = this.state.cart[index];
    this.state.cart.splice(index, 1);
    this._saveCart();
    this.dispatch('cart-updated', this.state.cart);
    if (item) this.toast(`Removed ${item.name.slice(0, 20)}... from cart`, 'info');
  },

  clearCart() {
    this.state.cart = [];
    this.state.activePromo = null;
    this.state.discountAmount = 0;
    this._saveCart();
    this.dispatch('cart-updated', this.state.cart);
  },

  applyCoupon(code) {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'JUST20' || clean === 'GLASS2026') {
      this.state.activePromo = clean;
      this.state.discountAmount = 0.20; // 20% off
      this.dispatch('cart-updated', this.state.cart);
      this.toast('🎉 Promo applied! 20% discount added.', 'success');
      return { success: true, discount: 0.20 };
    } else if (clean === 'FREESHIP') {
      this.state.activePromo = clean;
      this.state.discountAmount = 0.05;
      this.dispatch('cart-updated', this.state.cart);
      this.toast('🚚 Promo applied! Free express shipping.', 'success');
      return { success: true, discount: 0.05 };
    } else {
      this.toast('Invalid promo code. Try "JUST20"', 'warning');
      return { success: false };
    }
  },

  getCartCount() {
    return this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartSubtotal() {
    return this.state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCartTotals() {
    const subtotal = this.getCartSubtotal();
    const discount = this.state.discountAmount ? subtotal * this.state.discountAmount : 0;
    const shipping = subtotal >= 75 || subtotal === 0 || this.state.activePromo === 'FREESHIP' ? 0 : 9.99;
    const estimatedTax = (subtotal - discount) * 0.0825;
    const total = Math.max(0, subtotal - discount + shipping + estimatedTax);

    return {
      subtotal,
      discount,
      shipping,
      estimatedTax,
      total,
      freeShippingThreshold: 75,
      freeShippingProgress: Math.min(100, (subtotal / 75) * 100),
      freeShippingRemaining: Math.max(0, 75 - subtotal)
    };
  },

  _saveCart() {
    localStorage.setItem('jb_cart', JSON.stringify(this.state.cart));
  },

  // ── Wishlist Operations ──
  toggleWishlist(product) {
    const idx = this.state.wishlist.findIndex(item => item.id === product.id);
    if (idx > -1) {
      this.state.wishlist.splice(idx, 1);
      this.toast(`Removed from wishlist`, 'info');
    } else {
      this.state.wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnailUrl: product.thumbnailUrl,
        rating: product.rating,
        category: product.category ? product.category.name : ''
      });
      this.toast(`Saved to your wishlist!`, 'success');
    }
    localStorage.setItem('jb_wishlist', JSON.stringify(this.state.wishlist));
    this.dispatch('wishlist-updated', this.state.wishlist);
  },

  isInWishlist(productId) {
    return this.state.wishlist.some(item => item.id === Number(productId));
  },

  // ── Currency & Formatting ──
  setCurrency(curr) {
    if (CURRENCIES[curr]) {
      this.state.currency = curr;
      localStorage.setItem('jb_currency', curr);
      this.dispatch('currency-changed', curr);
    }
  },

  getCurrencyInfo() {
    return CURRENCIES[this.state.currency] || CURRENCIES.USD;
  },

  formatPrice(usdAmount) {
    const info = this.getCurrencyInfo();
    const converted = Number(usdAmount) * info.rate;
    if (this.state.currency === 'JPY') {
      return `${info.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${info.symbol}${converted.toFixed(2)}`;
  },

  // ── Theme (Dark / Light) ──
  toggleTheme() {
    this.state.darkMode = !this.state.darkMode;
    localStorage.setItem('jb_theme', this.state.darkMode ? 'dark' : 'light');
    if (this.state.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.dispatch('theme-changed', this.state.darkMode);
  },

  initTheme() {
    if (this.state.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  },

  // ── Events & Toasts ──
  listeners: {},

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  dispatch(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch(e) { console.error(e); }
      });
    }
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass`;
    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};
