// ============================================
// JustBuy — Client-Side Hash Router
// ============================================

import { HomeScreen } from './screens/home.js';
import { ProductsScreen } from './screens/products.js';
import { ProductDetailScreen } from './screens/product-detail.js';
import { CartScreen } from './screens/cart.js';
import { CheckoutScreen } from './screens/checkout.js';
import { OrderSuccessScreen } from './screens/order-success.js';
import { DealsScreen } from './screens/deals.js';
import { WishlistScreen } from './screens/wishlist.js';
import { SellerScreen } from './screens/seller.js';
import { AccountScreen } from './screens/account.js';
import { SellerDashboardScreen } from './screens/seller-dashboard.js';

export const Router = {
  routes: [
    { pattern: /^#\/?$/, screen: HomeScreen },
    { pattern: /^#\/products/, screen: ProductsScreen },
    { pattern: /^#\/product\/\w+/, screen: ProductDetailScreen },
    { pattern: /^#\/cart/, screen: CartScreen },
    { pattern: /^#\/checkout/, screen: CheckoutScreen },
    { pattern: /^#\/order-success\/\w+/, screen: OrderSuccessScreen },
    { pattern: /^#\/deals/, screen: DealsScreen },
    { pattern: /^#\/wishlist/, screen: WishlistScreen },
    { pattern: /^#\/seller\/\w+/, screen: SellerScreen },
    { pattern: /^#\/account/, screen: AccountScreen },
    { pattern: /^#\/seller-dashboard/, screen: SellerDashboardScreen }
  ],

  async handleRoute() {
    const hash = window.location.hash || '#/';
    const app = document.getElementById('app');
    if (!app) return;

    // Highlight active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === hash || (href !== '#/' && hash.startsWith(href))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Find matching route
    const match = this.routes.find(r => r.pattern.test(hash));
    const targetScreen = match ? match.screen : HomeScreen;

    // Show smooth loading transition
    app.classList.add('page-transitioning');
    
    try {
      const html = await targetScreen.render();
      app.innerHTML = html;
      window.scrollTo({ top: 0, behavior: 'instant' });

      if (typeof targetScreen.afterRender === 'function') {
        targetScreen.afterRender();
      }
    } catch (e) {
      console.error('Screen render error:', e);
      app.innerHTML = `<div class="error-view glass"><h2>Something went wrong</h2><p>${e.message}</p></div>`;
    } finally {
      app.classList.remove('page-transitioning');
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }
};
