// ============================================
// JustBuy — Screen: Home View
// ============================================

import { API } from '../api.js';
import { Store } from '../store.js';
import { ThreeHeroScene } from '../three-scene.js';

export const HomeScreen = {
  async render() {
    const categories = await API.getCategories();
    const featured = await API.getFeaturedProducts();
    const flashDeals = await API.getFlashDeals();

    return `
      <!-- ── HERO SECTION WITH 3D CANVAS & LIQUID GLASS ── -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <div class="hero-pill-badge glass">
              <span class="badge-sparkle">✨</span>
              <span class="badge-text">Next-Gen Marketplace 2026</span>
              <span class="badge-tag">Spring Drop</span>
            </div>

            <h1 class="hero-title">
              Curated Hardware.<br>
              <span class="gradient-text">Liquid Precision.</span>
            </h1>

            <p class="hero-description">
              Experience the evolution of digital retail. Hand-selected aesthetic electronics, 
              ergonomic studio gear, and artisan designs with instant buyer protection and global express delivery.
            </p>

            <div class="hero-actions">
              <a href="#/products" class="btn btn-primary btn-liquid">
                Explore Marketplace
                <span class="btn-arrow">→</span>
              </a>
              <a href="#/deals" class="btn btn-glass">
                <span class="pulse-dot"></span> Flash Deals (-40%)
              </a>
            </div>

            <!-- Stats Bar -->
            <div class="hero-stats glass">
              <div class="stat-item">
                <span class="stat-number">120K+</span>
                <span class="stat-label">Verified Products</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">99.4%</span>
                <span class="stat-label">Buyer Satisfaction</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">2-Day</span>
                <span class="stat-label">Express Delivery</span>
              </div>
            </div>
          </div>

          <!-- Interactive 3D Canvas Container -->
          <div class="hero-visual">
            <div class="canvas-3d-wrapper glass-lg">
              <canvas id="hero-3d-canvas" class="three-canvas"></canvas>
              
              <!-- Floating Micro-Badges -->
              <div class="floating-badge badge-top-right glass">
                <span class="badge-icon">🎧</span>
                <div class="badge-info">
                  <span class="badge-title">Spatial Audio Pro</span>
                  <span class="badge-sub">40mm Bio-Cellulose</span>
                </div>
              </div>

              <div class="floating-badge badge-bottom-left glass">
                <span class="badge-icon">🛡️</span>
                <div class="badge-info">
                  <span class="badge-title">JustBuy Verified</span>
                  <span class="badge-sub">Authenticity Guaranteed</span>
                </div>
              </div>

              <div class="canvas-hint">
                <span>✦ Move cursor to inspect 3D geometry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── FLASH SALE LIVE TICKER ── -->
      <section class="flash-ticker-section">
        <div class="flash-ticker glass">
          <div class="flash-header">
            <div class="flash-title-group">
              <span class="flash-icon">⚡</span>
              <span class="flash-heading">LIMITED FLASH DEALS</span>
            </div>
            <div class="flash-timer" id="flash-countdown">
              <span class="timer-box" id="timer-hours">04</span>:
              <span class="timer-box" id="timer-minutes">28</span>:
              <span class="timer-box" id="timer-seconds">51</span>
            </div>
          </div>
          <div class="flash-notice">
            <span>🔥 High Demand: 84 items claimed in last 10 minutes</span>
          </div>
          <a href="#/deals" class="flash-link">View All Deals →</a>
        </div>
      </section>

      <!-- ── EXPLORE BY CATEGORY (3D TILT CARDS) ── -->
      <section class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Explore Curated Disciplines</h2>
            <p class="section-subtitle">Thoughtfully cataloged gear crafted for modern life and creative flow.</p>
          </div>
          <a href="#/products" class="view-all-link">Browse All →</a>
        </div>

        <div class="category-grid">
          ${categories.map(cat => `
            <a href="#/products?category=${encodeURIComponent(cat.name)}" class="category-card glass tilt-3d">
              <div class="cat-icon-wrap">${cat.icon}</div>
              <h3 class="cat-name">${cat.name}</h3>
              <span class="cat-count">${cat.productCount}+ Artifacts</span>
              <span class="cat-arrow">→</span>
            </a>
          `).join('')}
        </div>
      </section>

      <!-- ── FEATURED DROPS (PRODUCT GRID) ── -->
      <section class="section-container">
        <div class="section-header">
          <div>
            <span class="badge-pill">Selected Highlights</span>
            <h2 class="section-title">Featured Creations</h2>
            <p class="section-subtitle">Top tier performance blended with modern organic industrial design.</p>
          </div>
          <div class="tab-pills glass">
            <button class="tab-btn active" data-filter="all">All Featured</button>
            <button class="tab-btn" data-filter="deals">Flash Sale</button>
            <button class="tab-btn" data-filter="top">Best Rated</button>
          </div>
        </div>

        <div class="product-grid" id="featured-grid">
          ${featured.map(p => this.renderProductCard(p)).join('')}
        </div>
      </section>

      <!-- ── LIQUID GLASS PROMO SPOTLIGHT ── -->
      <section class="section-container">
        <div class="spotlight-banner glass-lg">
          <div class="spotlight-content">
            <span class="badge-pill-orange">Signature Architecture</span>
            <h2 class="spotlight-title">Precision Acoustic Engineering Meets Tactile Glass.</h2>
            <p class="spotlight-desc">
              Get an exclusive 20% launch voucher on all Aether Labs acoustic creations. 
              Use code <strong class="promo-pill">JUST20</strong> at checkout.
            </p>
            <div class="spotlight-actions">
              <a href="#/products?category=Audio+%26+Sound" class="btn btn-primary btn-liquid">
                Shop Audio Series
              </a>
              <a href="#/seller/1" class="btn btn-glass">
                Visit Aether Labs
              </a>
            </div>
          </div>
          <div class="spotlight-image">
            <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80" alt="Spotlight" />
          </div>
        </div>
      </section>

      <!-- ── FLASH DEALS SECTION ── -->
      <section class="section-container">
        <div class="section-header">
          <div>
            <span class="badge-pill-orange">⚡ Time-Limited</span>
            <h2 class="section-title">Lightning Bargains</h2>
            <p class="section-subtitle">Exclusive savings up to 40% off. Stock resets daily.</p>
          </div>
          <a href="#/deals" class="view-all-link">See All Deals →</a>
        </div>

        <div class="product-grid">
          ${flashDeals.map(p => this.renderProductCard(p)).join('')}
        </div>
      </section>

      <!-- ── TRUST & BUYER PROTECTION GUARANTEE ── -->
      <section class="section-container">
        <div class="trust-grid">
          <div class="trust-card glass">
            <div class="trust-icon">🛡️</div>
            <h3>JustBuy Assurance</h3>
            <p>100% genuine product guarantee with 30-day no-questions-asked refund policy.</p>
          </div>
          <div class="trust-card glass">
            <div class="trust-icon">⚡</div>
            <h3>Express Worldwide</h3>
            <p>Carbon-neutral priority tracking dispatched within 24 hours from local hubs.</p>
          </div>
          <div class="trust-card glass">
            <div class="trust-icon">🔒</div>
            <h3>Escrow Payments</h3>
            <p>Funds remain held safely until you receive, inspect, and approve your items.</p>
          </div>
          <div class="trust-card glass">
            <div class="trust-icon">💬</div>
            <h3>Direct Artisan Chat</h3>
            <p>Connect straight with designers and sellers in real time before purchasing.</p>
          </div>
        </div>
      </section>
    `;
  },

  renderProductCard(product) {
    const isWished = Store.isInWishlist(product.id);
    const priceFormatted = Store.formatPrice(product.price);
    const origFormatted = product.originalPrice ? Store.formatPrice(product.originalPrice) : null;

    return `
      <div class="product-card glass" data-id="${product.id}">
        <div class="product-badge-stack">
          ${product.badge ? `<span class="product-tag">${product.badge}</span>` : ''}
          ${product.discountPercent ? `<span class="discount-tag">-${product.discountPercent}%</span>` : ''}
        </div>

        <button class="wishlist-toggle-btn ${isWished ? 'active' : ''}" data-wishlist-id="${product.id}" title="Save to Wishlist">
          ${isWished ? '❤️' : '🤍'}
        </button>

        <a href="#/product/${product.id}" class="product-thumb-wrap">
          <img src="${product.thumbnailUrl}" alt="${product.name}" class="product-thumb" loading="lazy" />
          <div class="hover-overlay">
            <span class="quick-view-btn glass">Quick View</span>
          </div>
        </a>

        <div class="product-details">
          <span class="product-category">${product.category ? product.category.name : 'Hardware'}</span>
          <h4 class="product-name">
            <a href="#/product/${product.id}">${product.name}</a>
          </h4>

          <div class="product-rating">
            <span class="stars">★★★★★</span>
            <span class="rating-val">${product.rating}</span>
            <span class="review-count">(${product.reviewCount || 120})</span>
          </div>

          <div class="product-price-row">
            <div class="price-box">
              <span class="current-price">${priceFormatted}</span>
              ${origFormatted ? `<span class="orig-price">${origFormatted}</span>` : ''}
            </div>
            <button class="add-to-cart-btn btn-liquid" data-add-id="${product.id}" title="Add to Cart">
              + Cart
            </button>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    // 1. Initialize Three.js 3D Hero Scene
    try {
      if (this.heroScene) this.heroScene.destroy();
      this.heroScene = new ThreeHeroScene('hero-3d-canvas');
    } catch (e) {
      console.error('Three.js hero initialization failed:', e);
    }

    // 2. Countdown Timer Loop
    this.startCountdown();

    // 3. Bind Wishlist & Add to Cart events
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.wishlistId;
        const p = await API.getProductById(id);
        if (p) {
          Store.toggleWishlist(p);
          btn.classList.toggle('active', Store.isInWishlist(id));
          btn.innerHTML = Store.isInWishlist(id) ? '❤️' : '🤍';
        }
      });
    });

    document.querySelectorAll('[data-add-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.addId;
        const p = await API.getProductById(id);
        if (p) {
          Store.addToCart(p, { quantity: 1 });
        }
      });
    });
  },

  startCountdown() {
    let seconds = 4 * 3600 + 28 * 60 + 51;
    const hEl = document.getElementById('timer-hours');
    const mEl = document.getElementById('timer-minutes');
    const sEl = document.getElementById('timer-seconds');

    if (!hEl || !mEl || !sEl) return;

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(this.timerInterval);
        return;
      }
      seconds--;
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      hEl.textContent = String(hrs).padStart(2, '0');
      mEl.textContent = String(mins).padStart(2, '0');
      sEl.textContent = String(secs).padStart(2, '0');
    }, 1000);
  }
};
