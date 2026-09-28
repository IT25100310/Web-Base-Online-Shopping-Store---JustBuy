import { API } from '../api.js';
import { Store } from '../store.js';

const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));

export const MessagesScreen = {
    conversations: [],
    activeId: null,
    async render() {
        return `<div class="section-container"><div class="section-header"><div><span class="badge-pill">DIRECT MESSAGES</span><h1 class="section-title">Messages</h1><p class="section-subtitle">Chat directly with sellers and keep every conversation in your account.</p></div><a class="btn btn-glass" href="#/products">Continue shopping</a></div><div class="sd-card glass sd-messages-layout"><aside class="sd-conv-list" id="customer-conversation-list"><p class="sd-empty">Loading conversations…</p></aside><section class="sd-thread" id="customer-message-thread"><p class="sd-empty">Select a conversation to start chatting.</p></section></div></div>`;
    },
    async afterRender() {
        const user = JSON.parse(localStorage.getItem('jb_user') || 'null');
        if (!user?.id) { document.getElementById('customer-message-thread').innerHTML = '<p class="sd-empty">Please sign in to use messages.</p>'; return; }
        try {
            this.conversations = await API.getChatConversations({ customerId: user.id });
            const requested = new URLSearchParams(window.location.hash.split('?')[1] || '').get('conversation');
            this.activeId = requested && this.conversations.some((item) => String(item.id) === String(requested)) ? Number(requested) : this.conversations[0]?.id || null;
            this.drawList(); await this.drawThread(user);
        } catch (error) { document.getElementById('customer-message-thread').innerHTML = `<p class="sd-empty">${esc(error.message)}</p>`; }
    },
    drawList() {
        const list = document.getElementById('customer-conversation-list');
        list.innerHTML = this.conversations.length ? this.conversations.map((conversation) => `<button type="button" class="sd-conv-item ${conversation.id === this.activeId ? 'active' : ''}" data-conversation-id="${conversation.id}"><span class="sd-avatar">${esc((conversation.sellerName || 'S').slice(0, 1).toUpperCase())}</span><span class="sd-conv-item-body"><strong>${esc(conversation.sellerName)}</strong><span>Open conversation</span></span></button>`).join('') : '<p class="sd-empty">You have no seller conversations yet. Open a seller profile to start one.</p>';
        list.querySelectorAll('[data-conversation-id]').forEach((button) => button.addEventListener('click', async () => { this.activeId = Number(button.dataset.conversationId); this.drawList(); await this.drawThread(JSON.parse(localStorage.getItem('jb_user') || 'null')); }));
    },
    async drawThread(user) {
        const thread = document.getElementById('customer-message-thread');
        const conversation = this.conversations.find((item) => item.id === this.activeId);
        if (!conversation) { thread.innerHTML = '<p class="sd-empty">Select a conversation to start chatting.</p>'; return; }
        const messages = await API.getChatMessages(conversation.id);
        thread.innerHTML = `<div class="sd-thread-head"><span class="sd-avatar">${esc((conversation.sellerName || 'S').slice(0, 1).toUpperCase())}</span><strong>${esc(conversation.sellerName)}</strong></div><div class="sd-thread-body" id="customer-thread-body">${messages.length ? messages.map((message) => `<div class="sd-thread-msg ${Number(message.senderId) === Number(user.id) ? 'me' : ''}"><p>${esc(message.body)}</p><span>${esc(message.createdAt ? new Date(message.createdAt).toLocaleString() : '')}</span></div>`).join('') : '<p class="sd-empty">No messages yet. Say hello.</p>'}</div><form class="sd-thread-compose" id="customer-thread-compose"><input type="text" id="customer-thread-input" placeholder="Type a message…" autocomplete="off" required/><button type="submit" class="btn btn-primary btn-sm btn-liquid">Send</button></form>`;
        const body = document.getElementById('customer-thread-body'); if (body) body.scrollTop = body.scrollHeight;
        document.getElementById('customer-thread-compose').onsubmit = async (event) => { event.preventDefault(); const input = document.getElementById('customer-thread-input'); const text = input.value.trim(); if (!text) return; await API.sendChatMessage(conversation.id, { senderType: 'CUSTOMER', senderId: Number(user.id), senderName: user.fullName || user.name || 'Customer', body: text }); input.value = ''; await this.drawThread(user); };
    }
};
