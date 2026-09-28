// ============================================
// JustBuy — API Client (Spring Boot Integration)
// ============================================

const API_BASE = '/api';

function adminHeaders(extra = {}) {
    const admin = JSON.parse(localStorage.getItem('jb_user') || 'null');
    return { ...extra, 'X-Admin-Email': admin?.email || '' };
}

async function optimizeAdvertisementImage(formData) {
    const image = formData.get('image');
    if (!(image instanceof File) || !image.size || image.size <= 2.5 * 1024 * 1024) return formData;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('The selected image could not be read.'));
        reader.onload = () => {
            const source = new Image();
            source.onerror = () => reject(new Error('The selected file is not a valid image.'));
            source.onload = () => {
                const scale = Math.min(1, 1600 / Math.max(source.width, source.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(source.width * scale));
                canvas.height = Math.max(1, Math.round(source.height * scale));
                canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error('The selected image could not be compressed.'));
                    formData.set('image', new File([blob], 'advertisement.jpg', { type: 'image/jpeg' }));
                    resolve(formData);
                }, 'image/jpeg', 0.82);
            };
            source.src = reader.result;
        };
        reader.readAsDataURL(image);
    });
}

export const API = {
    // ============================================
    // CUSTOMER AUTHENTICATION
    // ============================================

    async customerRegister(fullName, email, password) {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Customer registration failed');
        return data;
    },

    async customerLogin(email, password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Customer login failed');
        return data;
    },

    async adminLogin(email, password) {
        const res = await fetch(`${API_BASE}/admin-auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Admin login failed');
        return data;
    },

    async unifiedLogin(email, password) {
        const res = await fetch(`${API_BASE}/unified-auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Sign in failed');
        return data;
    },

    async getAccountApplications(status = '') {
        const query = status ? `?status=${encodeURIComponent(status)}` : '';
        const res = await fetch(`${API_BASE}/account-applications${query}`, { headers: adminHeaders() });
        if (!res.ok) throw new Error('Could not load account applications');
        return res.json();
    },

    async updateAccountApplicationStatus(id, status) {
        const res = await fetch(`${API_BASE}/account-applications/${id}/status`, {
            method: 'PUT',
            headers: adminHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ status })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update application');
        return data;
    },

    async getAdminAccounts() {
        const res = await fetch(`${API_BASE}/admin/accounts`, { headers: adminHeaders() });
        if (!res.ok) throw new Error('Could not load accounts');
        return res.json();
    },

    async getAdminAnalytics() {
        const res = await fetch(`${API_BASE}/admin/accounts/analytics`, { headers: adminHeaders() });
        if (!res.ok) throw new Error('Could not load admin analytics');
        return res.json();
    },

    async getAdminAuditLogs() {
        const res = await fetch(`${API_BASE}/admin/accounts/audit-logs`, { headers: adminHeaders() });
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data.message || 'Could not load audit logs');
        return data;
    },

    async getActiveAds() {
        const res = await fetch(`${API_BASE}/ads/active`);
        if (!res.ok) throw new Error('Could not load advertisements');
        return res.json();
    },

    async getAdminAds() {
        const res = await fetch(`${API_BASE}/ads`, { headers: adminHeaders() });
        if (!res.ok) throw new Error('Could not load advertisements');
        return res.json();
    },

    async createAdvertisement(formData) {
        formData = await optimizeAdvertisementImage(formData);
        const res = await fetch(`${API_BASE}/ads`, { method: 'POST', headers: adminHeaders(), body: formData });
        const data = await res.json().catch(() => ({}));
        if (res.status === 413) throw new Error('The image is too large. Please choose an image under 25 MB.');
        if (!res.ok) throw new Error(data.message || 'Could not create advertisement');
        return data;
    },

    async updateAdvertisement(id, formData) {
        formData = await optimizeAdvertisementImage(formData);
        const res = await fetch(`${API_BASE}/ads/${id}`, { method: 'PUT', headers: adminHeaders(), body: formData });
        const data = await res.json().catch(() => ({}));
        if (res.status === 413) throw new Error('The image is too large. Please choose an image under 25 MB.');
        if (!res.ok) throw new Error(data.message || 'Could not update advertisement');
        return data;
    },

    async setAdvertisementStatus(id, active) {
        const res = await fetch(`${API_BASE}/ads/${id}/status`, { method: 'PUT', headers: adminHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ active }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update advertisement status');
        return data;
    },

    async deleteAdvertisement(id) {
        const res = await fetch(`${API_BASE}/ads/${id}`, { method: 'DELETE', headers: adminHeaders() });
        if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.message || 'Could not delete advertisement'); }
    },

    async getDriverAnalytics(driverId) {
        const res = await fetch(`${API_BASE}/driver/${encodeURIComponent(driverId)}/analytics`);
        if (!res.ok) throw new Error('Could not load driver analytics');
        return res.json();
    },

    async createAdminAccount(account) {
        const res = await fetch(`${API_BASE}/admin/accounts`, {
            method: 'POST',
            headers: adminHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(account)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not create account');
        return data;
    },

    async updateAdminAccount(role, id, account) {
        const res = await fetch(`${API_BASE}/admin/accounts/${encodeURIComponent(role)}/${id}`, {
            method: 'PUT',
            headers: adminHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(account)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update account');
        return data;
    },

    async changeAdminAccountRole(role, id, newRole) {
        const res = await fetch(`${API_BASE}/admin/accounts/${encodeURIComponent(role)}/${id}/role`, {
            method: 'PUT',
            headers: adminHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ role: newRole })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not change account role');
        return data;
    },

    async updateAdminAccountStatus(role, id, status) {
        const res = await fetch(`${API_BASE}/admin/accounts/${encodeURIComponent(role)}/${id}/status`, {
            method: 'PUT',
            headers: adminHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ status })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update account status');
        return data;
    },

    async deleteAdminAccount(role, id) {
        const res = await fetch(`${API_BASE}/admin/accounts/${encodeURIComponent(role)}/${id}`, { method: 'DELETE', headers: adminHeaders() });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'Could not delete account');
        }
        return true;
    },

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

    async driverLogin(email, password) {
        const res = await fetch(`${API_BASE}/driver-auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Driver login failed');
        }
        return res.json();
    },

    async uploadProfileImage(file) {
        const user = JSON.parse(localStorage.getItem('jb_user') || 'null') || {};
        if (!user.email || !user.role) throw new Error('Please sign in before uploading a profile picture.');
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_BASE}/profiles/picture`, { method: 'POST', headers: { 'X-User-Email': user.email, 'X-User-Role': user.role }, body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update profile picture');
        return data;
    },

    profileImageUrl(user = JSON.parse(localStorage.getItem('jb_user') || 'null')) {
        if (!user?.email || !user?.role) return '';
        return `${API_BASE}/profiles/picture?role=${encodeURIComponent(user.role)}&email=${encodeURIComponent(user.email)}`;
    },

    async getCustomerProfile(id) {
        const res = await fetch(`${API_BASE}/customer-profile?id=${encodeURIComponent(id)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not load your profile');
        return data;
    },

    async updateCustomerProfile(id, profile) {
        const res = await fetch(`${API_BASE}/customer-profile?id=${encodeURIComponent(id)}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update your profile');
        return data;
    },

    async createSupportTicket(ticket) {
        const res = await fetch(`${API_BASE}/support/tickets`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ticket)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not send your report');
        return data;
    },

    async getCustomerSupportTickets(customerId) {
        const res = await fetch(`${API_BASE}/support/tickets?customerId=${encodeURIComponent(customerId)}`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data.message || 'Could not load support reports');
        return data;
    },

    async submitAccountApplication(application) {
        const res = await fetch(`${API_BASE}/account-applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(application)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not submit application');
        return data;
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
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) throw new Error('Could not load categories');
        return res.json();
    },
    async createCategory(category) {
        const res = await fetch(`${API_BASE}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(category) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not create category');
        return data;
    },
    async updateCategory(id, category) {
        const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(category) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update category');
        return data;
    },
    async deleteCategory(id) {
        const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
        if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.message || 'Could not delete category'); }
    },
    async getProducts(params = {}) {
        const query = new URLSearchParams();
        if (params.categoryId) query.set('categoryId', params.categoryId);
        if (params.category) query.set('category', params.category);
        if (params.page !== undefined) query.set('page', params.page);
        if (params.size !== undefined) query.set('size', params.size);
        if (params.sort) query.set('sort', params.sort === 'price-low' ? 'price_asc' : params.sort === 'price-high' ? 'price_desc' : params.sort);
        const res = await fetch(`${API_BASE}/products${query.toString() ? '?' + query : ''}`);
        if (!res.ok) throw new Error('Could not load products');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.products || []);
    },
    async getFeaturedProducts() {
        const res = await fetch(`${API_BASE}/products/featured`);
        if (!res.ok) throw new Error('Could not load featured products');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.products || []);
    },
    async getFlashDeals() {
        const res = await fetch(`${API_BASE}/products/flash-deals`);
        if (!res.ok) throw new Error('Could not load flash deals');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.products || []);
    },
    async getProductById(id) {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) return null;
        return res.json();
    },
    async searchProducts(query) {
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Could not search products');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.products || []);
    },
    async getSeller(id) {
        const res = await fetch(`${API_BASE}/sellers/${id}`);
        return res.ok ? res.json() : null;
    },
    async getSellerProducts(id) {
        const res = await fetch(`${API_BASE}/products/seller/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Could not load seller products');
        const data = await res.json();
        return Array.isArray(data) ? data : (data.products || []);
    },
    async getReviews(productId) {
        const res = await fetch(`${API_BASE}/reviews/product/${productId}`);
        if (!res.ok) return [];
        const reviews = await res.json();
        return reviews.map((review) => ({ ...review, author: review.author || review.authorName || 'Customer', avatar: review.avatar || review.authorAvatar || '', date: review.date || review.createdAt || '', title: review.title || '', photos: review.photos || (review.imageUrl ? [review.imageUrl] : []) }));
    },
    async createReview(review) {
        const res = await fetch(`${API_BASE}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not submit review');
        return data;
    },
    async uploadProductImages(productId, files) {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        const res = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}/images`, { method: 'POST', body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not upload product images');
        return data;
    },
    async createProduct(product) {
        const res = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not create product');
        return data;
    },
    async updateProduct(id, product) {
        const res = await fetch(`${API_BASE}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update product');
        return data;
    },
    async deleteProduct(id) {
        const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'Could not delete product');
        }
    },
    async getChatConversations(params) {
        const query = new URLSearchParams(params);
        const res = await fetch(`${API_BASE}/chat/conversations?${query}`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data.message || 'Could not load conversations');
        return data;
    },
    async createChatConversation(customerId, sellerId) {
        const res = await fetch(`${API_BASE}/chat/conversations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId, sellerId }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not open conversation');
        return data;
    },
    async getChatMessages(conversationId) {
        const res = await fetch(`${API_BASE}/chat/conversations/${encodeURIComponent(conversationId)}/messages`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data.message || 'Could not load messages');
        return data;
    },
    async sendChatMessage(conversationId, message) {
        const res = await fetch(`${API_BASE}/chat/conversations/${encodeURIComponent(conversationId)}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not send message');
        return data;
    },
    async createOrder(orderData) {
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not place order');
        return data;
    },

    async getOrdersForRole(role, id) {
        const res = await fetch(`${API_BASE}/orders/for-role?role=${encodeURIComponent(role)}&id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Could not load orders');
        return res.json();
    },

    async updateOrderStatus(id, status, role) {
        const res = await fetch(`${API_BASE}/orders/${id}/status?status=${encodeURIComponent(status)}&role=${encodeURIComponent(role)}`, { method: 'PATCH' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update order status');
        return data;
    },

};
