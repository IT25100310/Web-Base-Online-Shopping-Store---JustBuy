// ==========================================================
// JustBuy — Screen: Product Detail with 3D Inspector & Reviews
// ==========================================================

import { API } from '../api.js';
import { Store } from '../store.js';
import { ThreeProductViewer } from '../three-scene.js';

export const ProductDetailScreen = {
    activeColor: null,
    activeSize: null,
    quantity: 1,
    viewer3D: null,
    is3DMode: false,

    async render() {
        const id = window.location.hash.split('/')[2]?.split('?')[0] || 1;
        const product = await API.getProductById(id);
        const seller = await API.getSeller(product.seller?.id || 1);
        const reviews = await API.getReviews(product.id);

        const images = product.imageUrls ? product.imageUrls.split(',') : [product.thumbnailUrl];
        const colors = product.colors ? product.colors.split(',') : ['Matte Black', 'Terracotta', 'Frosted White'];
        const sizes = product.sizes ? product.sizes.split(',') : ['Standard'];

        this.activeColor = colors[0].trim();
        this.activeSize = sizes[0].trim();
        this.quantity = 1;

        const priceFormatted = Store.formatPrice(product.price);
        const origFormatted = product.originalPrice ? Store.formatPrice(product.originalPrice) : null;
        const isWished = Store.isInWishlist(product.id);

        return `
      <div class="product-detail-page">
        <!-- Breadcrumbs -->
        <div class="breadcrumbs-bar glass">
          <a href="#/">Home</a> / 
          <a href="#/products?category=${encodeURIComponent(product.category?.name || '')}">${product.category?.name || 'Catalog'}</a> / 
          <span class="active">${product.name}</span>
        </div>

        <div class="detail-grid">
          <!-- ── LEFT: MEDIA GALLERY & 3D INSPECTOR ── -->
          <div class="gallery-column">
            <!-- View Mode Switcher: 2D Photos vs 3D Realtime Model -->
            <div class="media-mode-switch glass">
              <button id="view-2d-btn" class="mode-btn active">📷 Photo Gallery</button>
              <button id="view-3d-btn" class="mode-btn">🪐 Interactive 3D Model</button>
            </div>

            <!-- 2D Photo Container -->
            <div id="gallery-2d-view" class="gallery-main-wrap glass">
              <img id="main-product-img" src="${images[0]}" alt="${product.name}" class="gallery-main-img" />
              <div class="badge-overlay">
                ${product.badge ? `<span class="product-tag">${product.badge}</span>` : ''}
              </div>
            </div>

            <!-- 3D Canvas Container (Hidden by default) -->
            <div id="gallery-3d-view" class="gallery-3d-wrap glass" style="display: none;">
              <canvas id="product-3d-canvas" class="three-detail-canvas"></canvas>
              <div class="viewer-hint">
                <span>✦ Drag to rotate 360° | Scroll to inspect</span>
              </div>
            </div>

            <!-- Thumbnails strip -->
            <div class="thumbnails-strip" id="thumbnails-container">
              ${images.map((img, i) => `
                <button class="thumb-btn glass ${i === 0 ? 'active' : ''}" data-img="${img}">
                  <img src="${img}" alt="Thumbnail ${i + 1}" />
                </button>
              `).join('')}
            </div>

            <!-- Buyer Protection Assurance Banner -->
            <div class="protection-banner glass">
              <div class="protect-icon">🛡️</div>
              <div class="protect-text">
                <strong>JustBuy Certified Purchase Guarantee</strong>
                <p>Full refund if item is not as described. 30-day effortless returns with prepaid carbon-neutral labels.</p>
              </div>
            </div>
          </div>

          <!-- ── RIGHT: PRODUCT SPECS & PURCHASE CARD ── -->
          <div class="info-column">
            <div class="product-summary glass-lg">
              <div class="summary-top">
                <span class="product-sku">SKU: JB-2026-${product.id}09</span>
                <button class="wishlist-detail-btn ${isWished ? 'active' : ''}" id="detail-wishlist-btn">
                  ${isWished ? '❤️ Saved' : '🤍 Save for later'}
                </button>
              </div>

              <h1 class="detail-title">${product.name}</h1>

              <!-- Rating & Sold Summary -->
              <div class="detail-rating-row">
                <div class="stars">★★★★★</div>
                <span class="rating-val">${product.rating}</span>
                <span class="dot-sep">•</span>
                <a href="#reviews-anchor" class="review-link">${product.reviewCount || 142} verified reviews</a>
                <span class="dot-sep">•</span>
                <span class="sold-stat">🔥 ${product.soldCount || 850}+ orders shipped</span>
              </div>

              <!-- Price Row & Tiered Pricing -->
              <div class="detail-pricing-box glass">
                <div class="main-price-row">
                  <span class="detail-price">${priceFormatted}</span>
                  ${origFormatted ? `<span class="detail-orig-price">${origFormatted}</span>` : ''}
                  ${product.discountPercent ? `<span class="discount-pill">SAVE ${product.discountPercent}%</span>` : ''}
                </div>
                <p class="vat-note">Inclusive of all local import tariffs and duties.</p>

                <!-- Bulk Tier Table -->
                <div class="tier-pricing-table">
                  <div class="tier-cell active">
                    <span class="tier-qty">1 Unit</span>
                    <span class="tier-price">${priceFormatted}</span>
                  </div>
                  <div class="tier-cell">
                    <span class="tier-qty">2 - 4 Units</span>
                    <span class="tier-price">${Store.formatPrice(product.price * 0.92)} /ea</span>
                    <span class="tier-badge">Save 8%</span>
                  </div>
                  <div class="tier-cell">
                    <span class="tier-qty">5+ Units</span>
                    <span class="tier-price">${Store.formatPrice(product.price * 0.85)} /ea</span>
                    <span class="tier-badge">Save 15%</span>
                  </div>
                </div>
              </div>

              <!-- Options: Color Selection -->
              <div class="selector-group">
                <div class="selector-label">
                  <span>Color Option:</span>
                  <strong id="selected-color-label">${colors[0]}</strong>
                </div>
                <div class="color-options-row">
                  ${colors.map((c, i) => `
                    <button class="color-chip ${i === 0 ? 'active' : ''}" data-color="${c.trim()}">
                      ${c.trim()}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Options: Size / Spec Selection -->
              <div class="selector-group">
                <div class="selector-label">
                  <span>Specification / Size:</span>
                  <strong id="selected-size-label">${sizes[0]}</strong>
                </div>
                <div class="size-options-row">
                  ${sizes.map((s, i) => `
                    <button class="size-chip ${i === 0 ? 'active' : ''}" data-size="${s.trim()}">
                      ${s.trim()}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Quantity & Stock Status -->
              <div class="quantity-row">
                <div class="qty-stepper glass">
                  <button id="qty-minus" class="stepper-btn">−</button>
                  <span id="qty-value" class="stepper-val">1</span>
                  <button id="qty-plus" class="stepper-btn">+</button>
                </div>
                <div class="stock-status">
                  <span class="pulse-indicator green"></span>
                  <span class="stock-text">In Stock: <strong>${product.stock || 25} units</strong> available</span>
                </div>
              </div>

              <!-- Action CTAs -->
              <div class="action-buttons-group">
                <button id="detail-add-cart-btn" class="btn btn-primary btn-liquid btn-large">
                  <span>🛒 Add to Cart</span>
                </button>
                <button id="detail-buy-now-btn" class="btn btn-accent btn-large">
                  <span>⚡ Instant Buy Now</span>
                </button>
              </div>

              <!-- Delivery Promise -->
              <div class="delivery-meta glass">
                <div class="delivery-item">
                  <span class="del-icon">🚚</span>
                  <div>
                    <strong>Free Priority Shipping</strong>
                    <p>Estimated arrival in 2-3 business days with real-time GPS tracking.</p>
                  </div>
                </div>
                <div class="delivery-item">
                  <span class="del-icon">🔄</span>
                  <div>
                    <strong>Zero-Hassle 30-Day Returns</strong>
                    <p>Hassle-free return collection directly from your doorstep.</p>
                  </div>
                </div>
              </div>

              <!-- Seller Micro-Card -->
              <div class="seller-card glass">
                <img src="${seller.avatar}" alt="${seller.name}" class="seller-avatar" />
                <div class="seller-info">
                  <div class="seller-name-row">
                    <a href="#/seller/${seller.id}" class="seller-name">${seller.name}</a>
                    <span class="seller-badge">★ ${seller.badge}</span>
                  </div>
                  <div class="seller-stats">
                    <span>${seller.rating} Rating</span> • 
                    <span>${seller.salesCount.toLocaleString()} sales</span> • 
                    <span>Responds in ${seller.responseTime}</span>
                  </div>
                </div>
                <a href="#/seller/${seller.id}" class="btn btn-glass btn-sm">Storefront</a>
              </div>
            </div>
          </div>
        </div>

        <!-- ── REVIEWS & SPECS SECTION ── -->
        <section class="reviews-section glass-lg" id="reviews-anchor">
          <div class="reviews-header">
            <div>
              <h2 class="section-title">Customer Feedback & Verifications</h2>
              <p class="section-subtitle">Real experiences shared by verified community members.</p>
            </div>
            <button class="btn btn-glass" id="write-review-btn">Write a Review</button>
          </div>

          <!-- Review Summary Breakdown -->
          <div class="review-breakdown-card glass">
            <div class="score-box">
              <span class="score-big">${product.rating}</span>
              <div class="stars">★★★★★</div>
              <span class="score-sub">Based on ${product.reviewCount || 142} ratings</span>
            </div>
            <div class="distribution-bars">
              <div class="dist-row">
                <span>5 Stars</span>
                <div class="dist-track"><div class="dist-fill" style="width: 86%;"></div></div>
                <span>86%</span>
              </div>
              <div class="dist-row">
                <span>4 Stars</span>
                <div class="dist-track"><div class="dist-fill" style="width: 11%;"></div></div>
                <span>11%</span>
              </div>
              <div class="dist-row">
                <span>3 Stars</span>
                <div class="dist-track"><div class="dist-fill" style="width: 3%;"></div></div>
                <span>3%</span>
              </div>
            </div>
          </div>

          <!-- Reviews Feed -->
          <div class="reviews-feed">
            ${reviews.map(r => `
              <div class="review-card glass">
                <div class="review-top">
                  <div class="reviewer-meta">
                    <img src="${r.avatar}" alt="${r.author}" class="reviewer-img" />
                    <div>
                      <span class="reviewer-name">${r.author}</span>
                      ${r.verified ? `<span class="verified-pill">✓ Verified Buyer</span>` : ''}
                    </div>
                  </div>
                  <div class="review-date-rating">
                    <div class="stars">★★★★★</div>
                    <span class="review-date">${r.date}</span>
                  </div>
                </div>

                <h4 class="review-title">${r.title}</h4>
                <p class="review-body">${r.comment}</p>

                ${r.photos && r.photos.length ? `
                  <div class="review-photos-strip">
                    ${r.photos.map(p => `
                      <img src="${p}" alt="Buyer photo" class="review-photo-thumb" />
                    `).join('')}
                  </div>
                ` : ''}

                <div class="review-footer">
                  <button class="helpful-btn glass">👍 Helpful (${r.helpfulCount})</button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
    },

    afterRender() {
        const id = window.location.hash.split('/')[2]?.split('?')[0] || 1;

        // 1. Thumbnail click handler
        const mainImg = document.getElementById('main-product-img');
        document.querySelectorAll('.thumb-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (mainImg) mainImg.src = btn.dataset.img;
            });
        });

        // 2. 2D vs 3D Mode Toggle
        const btn2D = document.getElementById('view-2d-btn');
        const btn3D = document.getElementById('view-3d-btn');
        const view2D = document.getElementById('gallery-2d-view');
        const view3D = document.getElementById('gallery-3d-view');

        if (btn2D && btn3D && view2D && view3D) {
            btn2D.addEventListener('click', () => {
                btn2D.classList.add('active');
                btn3D.classList.remove('active');
                view2D.style.display = 'block';
                view3D.style.display = 'none';
                this.is3DMode = false;
            });

            btn3D.addEventListener('click', () => {
                btn3D.classList.add('active');
                btn2D.classList.remove('active');
                view2D.style.display = 'none';
                view3D.style.display = 'block';
                this.is3DMode = true;

                if (!this.viewer3D) {
                    this.viewer3D = new ThreeProductViewer('product-3d-canvas');
                }
            });
        }

        // 3. Color chips selection
        document.querySelectorAll('.color-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.activeColor = chip.dataset.color;
                const lbl = document.getElementById('selected-color-label');
                if (lbl) lbl.textContent = this.activeColor;

                // If in 3D mode, update material color
                if (this.viewer3D) {
                    const colorMap = {
                        'Matte Black': 0x1a1a1a,
                        'Terracotta': 0xC2532D,
                        'Frosted White': 0xf4efe8,
                        'Warm Terracotta': 0xF26B1D,
                        'Matte Charcoal': 0x222222
                    };
                    this.viewer3D.setColor(colorMap[this.activeColor] || 0xF26B1D);
                }
            });
        });

        // 4. Size chips selection
        document.querySelectorAll('.size-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.activeSize = chip.dataset.size;
                const lbl = document.getElementById('selected-size-label');
                if (lbl) lbl.textContent = this.activeSize;
            });
        });

        // 5. Quantity stepper
        const valEl = document.getElementById('qty-value');
        document.getElementById('qty-minus')?.addEventListener('click', () => {
            if (this.quantity > 1) {
                this.quantity--;
                if (valEl) valEl.textContent = this.quantity;
            }
        });
        document.getElementById('qty-plus')?.addEventListener('click', () => {
            this.quantity++;
            if (valEl) valEl.textContent = this.quantity;
        });

        // 6. Add to Cart button
        document.getElementById('detail-add-cart-btn')?.addEventListener('click', async () => {
            const p = await API.getProductById(id);
            if (p) {
                Store.addToCart(p, {
                    quantity: this.quantity,
                    color: this.activeColor,
                    size: this.activeSize
                });
            }
        });

        // 7. Buy Now button
        document.getElementById('detail-buy-now-btn')?.addEventListener('click', async () => {
            const p = await API.getProductById(id);
            if (p) {
                Store.addToCart(p, {
                    quantity: this.quantity,
                    color: this.activeColor,
                    size: this.activeSize
                });
                window.location.hash = '#/cart';
            }
        });

        // 8. Wishlist toggle
        const wishBtn = document.getElementById('detail-wishlist-btn');
        wishBtn?.addEventListener('click', async () => {
            const p = await API.getProductById(id);
            if (p) {
                Store.toggleWishlist(p);
                const active = Store.isInWishlist(p.id);
                wishBtn.classList.toggle('active', active);
                wishBtn.innerHTML = active ? '❤️ Saved' : '🤍 Save for later';
            }
        });
    }
};
