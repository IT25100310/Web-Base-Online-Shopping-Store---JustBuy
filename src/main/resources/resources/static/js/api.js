// ============================================
// JustBuy — API Client (Spring Boot Integration)
// ============================================

const API_BASE = '/api';

export const API = {
  async sellerLogin(email, password) {
    const res = await fetch(`${API_BASE}/seller-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Seller login failed');
    }
    return res.json();
  },

  async getDeliveries(sellerId) {
    const res = await fetch(`${API_BASE}/deliveries?sellerId=${encodeURIComponent(sellerId)}`);
    if (!res.ok) throw new Error('Could not load deliveries');
    return res.json();
  },

  async createDelivery(delivery) {
    const res = await fetch(`${API_BASE}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delivery)
    });
    if (!res.ok) throw new Error('Could not create delivery');
    return res.json();
  },

  async updateDelivery(id, delivery) {
    const res = await fetch(`${API_BASE}/deliveries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delivery)
    });
    if (!res.ok) throw new Error('Could not update delivery');
    return res.json();
  },

  async deleteDelivery(id) {
    const res = await fetch(`${API_BASE}/deliveries/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Could not delete delivery');
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend API unavailable, using local mock for categories:', e);
    }
    return [
      { id: 1, name: 'Audio & Sound', slug: 'audio-sound', icon: '🎧', productCount: 1420 },
      { id: 2, name: 'Wearables & Tech', slug: 'wearables-tech', icon: '⌚', productCount: 980 },
      { id: 3, name: 'Smart Home & Living', slug: 'smart-home', icon: '💡', productCount: 750 },
      { id: 4, name: 'Photography & Gear', slug: 'photography-gear', icon: '📷', productCount: 630 },
      { id: 5, name: 'Work & Desk Setup', slug: 'work-desk-setup', icon: '⌨️', productCount: 890 }
    ];
  },

  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/products${query ? '?' + query : ''}`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data.products || []);
      }
    } catch (e) {
      console.warn('Backend API unavailable, using fallback mock for products:', e);
    }
    return this.getMockProducts(params);
  },

  async getFeaturedProducts() {
    try {
      const res = await fetch(`${API_BASE}/products/featured`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.products || []);
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Backend API unavailable, using fallback for featured:', e);
    }
    const all = this.getMockProducts();
    return all.filter(p => p.featured || p.badge === 'Hot');
  },

  async getFlashDeals() {
    try {
      const res = await fetch(`${API_BASE}/products/flash-deals`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.products || []);
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Backend API unavailable, using fallback for flash deals:', e);
    }
    const all = this.getMockProducts();
    return all.filter(p => p.flashDeal || (p.discountPercent && p.discountPercent > 25));
  },

  async getProductById(id) {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend API unavailable, using fallback product detail:', e);
    }
    const all = this.getMockProducts();
    return all.find(p => p.id === Number(id)) || all[0];
  },

  async searchProducts(query) {
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data.products || []);
      }
    } catch (e) {
      console.warn('Search API fallback:', e);
    }
    const all = this.getMockProducts();
    const q = (query || '').toLowerCase();
    return all.filter(p => p.name.toLowerCase().includes(q) || (p.tags && p.tags.toLowerCase().includes(q)));
  },

  async getSeller(id) {
    try {
      const res = await fetch(`${API_BASE}/sellers/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Seller API fallback:', e);
    }
    return {
      id: id || 1,
      name: 'Aether Acoustic Labs',
      badge: 'Top Rated Seller',
      rating: 4.96,
      salesCount: 14280,
      responseTime: '< 1 hour',
      followers: 89400,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      bio: 'Pioneering ergonomic soundscapes, precision acoustic engineering, and studio-grade audio hardware designed for audiophiles and creators.'
    };
  },

  async getReviews(productId) {
    try {
      const res = await fetch(`${API_BASE}/reviews/product/${productId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Review API fallback:', e);
    }
    return [
      {
        id: 1,
        author: 'Elena Rostova',
        verified: true,
        rating: 5,
        date: '2 days ago',
        title: 'Exceeded every single expectation!',
        comment: 'The build quality is breathtaking. The liquid-glass aesthetic in real life matches the photos perfectly. Sound stage is wide and crisp.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
        photos: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80'],
        helpfulCount: 42
      },
      {
        id: 2,
        author: 'Marcus Vance',
        verified: true,
        rating: 5,
        date: '1 week ago',
        title: 'Seamless connection and insane battery life',
        comment: 'Paired instantly with my Mac and phone. ANC blocks out office subway chatter with zero cabin pressure.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
        photos: [],
        helpfulCount: 19
      },
      {
        id: 3,
        author: 'Chloe Dupont',
        verified: true,
        rating: 4,
        date: '2 weeks ago',
        title: 'Gorgeous design, premium packaging',
        comment: 'Arrived in bespoke sustainable frosted packaging. Only wish the carrying case was slightly more compact, but the headphones themselves are 10/10.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80',
        photos: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80'],
        helpfulCount: 8
      }
    ];
  },

  async createOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Order API offline, simulating order completion:', e);
    }
    return {
      id: Math.floor(Math.random() * 90000) + 10000,
      orderNumber: 'JB' + Date.now().toString().slice(-8),
      status: 'CONFIRMED',
      total: orderData.total || 149.99,
      trackingNumber: 'TRK-JUSTBUY-' + Math.floor(10000000 + Math.random() * 90000000),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      }),
      createdAt: new Date().toISOString(),
      ...orderData
    };
  },

  getMockProducts(filter = {}) {
    const products = [
      {
        id: 1,
        name: 'Aether Aura Pro ANC Wireless Headphones',
        category: { id: 1, name: 'Audio & Sound' },
        price: 249.00,
        originalPrice: 329.00,
        discountPercent: 24,
        rating: 4.9,
        reviewCount: 1420,
        soldCount: 8940,
        stock: 35,
        badge: 'Best Seller',
        featured: true,
        flashDeal: true,
        freeShipping: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        imageUrls: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        colors: 'Matte Charcoal,Warm Terracotta,Frosted Cream',
        sizes: 'Standard',
        tags: 'anc,wireless,bluetooth,audiophile,hifi',
        description: 'Immerse in studio-grade fidelity with custom 40mm bio-cellulose drivers, hybrid active noise cancellation, and a liquid-smooth acoustic seal.'
      },
      {
        id: 2,
        name: 'Chronos Horizon OLED Titanium Smartwatch',
        category: { id: 2, name: 'Wearables & Tech' },
        price: 319.00,
        originalPrice: 399.00,
        discountPercent: 20,
        rating: 4.8,
        reviewCount: 890,
        soldCount: 5210,
        stock: 22,
        badge: 'Hot Deal',
        featured: true,
        flashDeal: true,
        freeShipping: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        imageUrls: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
        colors: 'Brushed Silver,Titanium Black,Amber Gold',
        sizes: '40mm,44mm',
        tags: 'smartwatch,fitness,oled,titanium,health',
        description: 'Forged from aerospace grade-5 titanium with a 1.4-inch micro-curved sapphire display, 14-day battery reserve, and biosensor suite.'
      },
      {
        id: 3,
        name: 'Lumina Sphere Ambient Sound & Light Sculpt',
        category: { id: 3, name: 'Smart Home & Living' },
        price: 189.00,
        originalPrice: 249.00,
        discountPercent: 24,
        rating: 4.95,
        reviewCount: 654,
        soldCount: 3180,
        stock: 18,
        badge: 'Staff Pick',
        featured: true,
        flashDeal: false,
        freeShipping: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
        imageUrls: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
        colors: 'Opaline White,Desert Clay,Smoked Obsidian',
        sizes: 'One Size',
        tags: 'lamp,speaker,ambient,smart-home,sculptural',
        description: 'An acoustic-illuminative centerpiece that harmonizes circadian rhythm lighting with 360-degree spatial acoustic waves.'
      },
      {
        id: 4,
        name: 'Optica Lumix 35mm f/1.4 Mirrorless Prime Lens',
        category: { id: 4, name: 'Photography & Gear' },
        price: 549.00,
        originalPrice: 699.00,
        discountPercent: 21,
        rating: 4.92,
        reviewCount: 312,
        soldCount: 1420,
        stock: 12,
        badge: 'Pro Grade',
        featured: true,
        flashDeal: false,
        freeShipping: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
        imageUrls: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        colors: 'Anodized Black',
        sizes: 'E-Mount,X-Mount,Z-Mount',
        tags: 'camera,lens,photography,prime,mirrorless',
        description: 'Breathtaking bokeh and clinical edge-to-edge resolution with dual linear autofocus motors and nano-antireflective coating.'
      },
      {
        id: 5,
        name: 'Keystroke Nuance Mechanical Keyboard 75%',
        category: { id: 5, name: 'Work & Desk Setup' },
        price: 159.00,
        originalPrice: 199.00,
        discountPercent: 20,
        rating: 4.88,
        reviewCount: 1120,
        soldCount: 6730,
        stock: 45,
        badge: 'Trending',
        featured: false,
        flashDeal: true,
        freeShipping: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
        imageUrls: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        colors: 'Retro Cream,Charcoal Slate,Sunset Terracotta',
        sizes: 'Linear Yellow,Tactile Brown',
        tags: 'keyboard,mechanical,desk,setup,typewriter',
        description: 'Precision CNC-milled aluminum chassis with gasket mounting, factory-lubed switches, and tri-mode wireless connectivity.'
      },
      {
        id: 6,
        name: 'Vessel Geometric Ceramic Pour-Over Carafe',
        category: { id: 3, name: 'Smart Home & Living' },
        price: 68.00,
        originalPrice: 85.00,
        discountPercent: 20,
        rating: 4.97,
        reviewCount: 420,
        soldCount: 2900,
        stock: 30,
        badge: 'Artisan',
        featured: false,
        flashDeal: false,
        freeShipping: false,
        thumbnailUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        imageUrls: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        colors: 'Terracotta Matte,Sand Glaze,Obsidian',
        sizes: '500ml,800ml',
        tags: 'coffee,ceramic,pour-over,kitchen,lifestyle',
        description: 'Hand-cast ceramic dripper engineered with 60-degree precision ribs for optimal thermal retention and extraction clarity.'
      },
      {
        id: 7,
        name: 'AeroGlide Ergonomic Magnetic MagSafe Stand',
        category: { id: 5, name: 'Work & Desk Setup' },
        price: 79.00,
        originalPrice: 99.00,
        discountPercent: 20,
        rating: 4.85,
        reviewCount: 380,
        soldCount: 2150,
        stock: 60,
        badge: 'New',
        featured: false,
        flashDeal: true,
        freeShipping: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80',
        imageUrls: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80',
        colors: 'Natural Sand,Graphite',
        sizes: 'Universal',
        tags: 'magsafe,desk,stand,phone,aluminum',
        description: 'Weighted solid aluminum base with buttery fluid-damped 360-degree ball joint and hidden cable pass-through.'
      },
      {
        id: 8,
        name: 'Sonic Studio Dynamic USB-C Microphone',
        category: { id: 1, name: 'Audio & Sound' },
        price: 139.00,
        originalPrice: 179.00,
        discountPercent: 22,
        rating: 4.91,
        reviewCount: 512,
        soldCount: 3450,
        stock: 25,
        badge: 'Best Seller',
        featured: true,
        flashDeal: false,
        freeShipping: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        imageUrls: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
        colors: 'Warm Cream,Deep Bronze',
        sizes: 'Standard',
        tags: 'mic,microphone,podcast,audio,streaming',
        description: 'Broadcast-quality cardioid capsule with internal pop filter, zero-latency monitoring, and built-in analog limiter.'
      }
    ];

    let filtered = [...products];
    if (filter.category) {
      filtered = filtered.filter(p => p.category && p.category.name.toLowerCase().includes(filter.category.toLowerCase()));
    }
    if (filter.minPrice) {
      filtered = filtered.filter(p => p.price >= Number(filter.minPrice));
    }
    if (filter.maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(filter.maxPrice));
    }
    if (filter.badge) {
      filtered = filtered.filter(p => p.badge === filter.badge);
    }
    if (filter.sort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filter.sort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filter.sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    return filtered;
  }
};
