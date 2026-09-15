// ============================================
// JustBuy — Screen: Product Catalog & Filters
// ============================================

import { API } from '../api.js';
import { Store } from '../store.js';

export const ProductsScreen = {
  currentFilters: {
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    sort: 'featured',
    freeShipping: false
  },

  async render() {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    this.currentFilters.category = params.get('category') || '';
    const searchQuery = params.get('search') || '';

    const categories = await API.getCategories();
    let products = searchQuery 
      ? await API.searchProducts(searchQuery)
      : await API.getProducts({ category: this.currentFilters.category });

    return `
      <div class="catalog-page">
        <!-- Page Header Banner -->
        <div class="catalog-header glass">
          <div class="catalog-breadcrumbs">
            <a href="#/">Home</a> / <span>Marketplace</span>
            ${this.currentFilters.category ? `/ <span class="active">${this.currentFilters.category}</span>` : ''}
            ${searchQuery ? `/ <span class="active">Search: "${searchQuery}"</span>` : ''}
          </div>
          <h1 class="catalog-title">
            ${searchQuery ? `Search Results for "${searchQuery}"` : this.currentFilters.category || 'All Hardware & Artifacts'}
          </h1>
          <p class="catalog-subtitle">
            Showing <strong id="product-count-display">${products.length}</strong> meticulously engineered items
          </p>
        </div>

        <div class="catalog-layout">
          <!-- ── FILTER SIDEBAR ── -->
          <aside class="catalog-sidebar glass">
            <div class="sidebar-header">
              <h3>Refine Results</h3>
              <button id="reset-filters-btn" class="reset-btn">Reset</button>
            </div>

            <!-- Category Filter -->
            <div class="filter-group">
              <h4 class="filter-title">Categories</h4>
              <ul class="filter-list">
                <li>
                  <a href="#/products" class="filter-link ${!this.currentFilters.category ? 'active' : ''}">
                    All Categories
                  </a>
                </li>
                ${categories.map(c => `
                  <li>
                    <a href="#/products?category=${encodeURIComponent(c.name)}" 
                       class="filter-link ${this.currentFilters.category === c.name ? 'active' : ''}">
                      ${c.icon} ${c.name}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <h4 class="filter-title">Price Range</h4>
              <div class="price-slider-wrap">
                <input type="range" id="price-range" min="0" max="800" step="20" value="800" class="range-slider" />
                <div class="price-range-labels">
                  <span>$0</span>
                  <span id="price-slider-val">$800</span>
                </div>
              </div>
            </div>

            <!-- Free Shipping Toggle -->
            <div class="filter-group">
              <label class="checkbox-label">
                <input type="checkbox" id="filter-freeship" />
                <span>🚚 Free Global Shipping</span>
              </label>
            </div>

            <!-- Verified Sellers Toggle -->
            <div class="filter-group">
              <label class="checkbox-label">
                <input type="checkbox" id="filter-verified" checked />
                <span>🛡️ JustBuy Verified Only</span>
              </label>
            </div>
          </aside>

          <!-- ── MAIN PRODUCTS FEED ── -->
          <main class="catalog-main">
            <!-- Top Controls Bar -->
            <div class="catalog-toolbar glass">
              <div class="toolbar-left">
                <span class="toolbar-label">Sort by:</span>
                <select id="sort-select" class="custom-select">
                  <option value="featured">Featured / Trending</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Customer Rating</option>
                </select>
              </div>

              <div class="view-toggles">
                <button class="view-btn active" data-view="grid" title="Grid View">⊞</button>
                <button class="view-btn" data-view="list" title="List View">☰</button>
              </div>
            </div>

            <!-- Product Grid -->
            <div class="product-grid" id="catalog-products-grid">
              ${products.map(p => this.renderProductCard(p)).join('')}
            </div>
          </main>
        </div>
      </div>
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
          ${product.freeShipping ? `<span class="shipping-tag">Free Shipping</span>` : ''}
        </div>

        <button class="wishlist-toggle-btn ${isWished ? 'active' : ''}" data-wishlist-id="${product.id}" title="Save to Wishlist">
          ${isWished ? '❤️' : '🤍'}
        </button>

        <a href="#/product/${product.id}" class="product-thumb-wrap">
          <img src="${product.thumbnailUrl}" alt="${product.name}" class="product-thumb" loading="lazy" />
          <div class="hover-overlay">
            <span class="quick-view-btn glass">Inspect Gear</span>
          </div>
        </a>

        <div class="product-details">
          <span class="product-category">${product.category ? product.category.name : 'Artifact'}</span>
          <h4 class="product-name">
            <a href="#/product/${product.id}">${product.name}</a>
          </h4>

          <div class="product-rating">
            <span class="stars">★★★★★</span>
            <span class="rating-val">${product.rating}</span>
            <span class="review-count">(${product.soldCount || 820} sold)</span>
          </div>

          <div class="product-price-row">
            <div class="price-box">
              <span class="current-price">${priceFormatted}</span>
              ${origFormatted ? `<span class="orig-price">${origFormatted}</span>` : ''}
            </div>
            <button class="add-to-cart-btn btn-liquid" data-add-id="${product.id}">
              + Cart
            </button>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    // 1. Sort listener
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', async (e) => {
        const sortVal = e.target.value;
        const products = await API.getProducts({
          category: this.currentFilters.category,
          sort: sortVal
        });
        const grid = document.getElementById('catalog-products-grid');
        if (grid) {
          grid.innerHTML = products.map(p => this.renderProductCard(p)).join('');
          this.bindCardEvents();
        }
      });
    }

    // 2. Price slider
    const slider = document.getElementById('price-range');
    const label = document.getElementById('price-slider-val');
    if (slider && label) {
      slider.addEventListener('input', async (e) => {
        const maxVal = e.target.value;
        label.textContent = `$${maxVal}`;
        const products = await API.getProducts({
          category: this.currentFilters.category,
          maxPrice: maxVal
        });
        const grid = document.getElementById('catalog-products-grid');
        if (grid) {
          grid.innerHTML = products.map(p => this.renderProductCard(p)).join('');
          this.bindCardEvents();
        }
      });
    }

    // 3. Card buttons
    this.bindCardEvents();
  },

  bindCardEvents() {
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
  }
};
