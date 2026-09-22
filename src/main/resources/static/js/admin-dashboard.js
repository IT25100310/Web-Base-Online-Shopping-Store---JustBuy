import { API } from './api.js';

let applications = [];
let accounts = [];
let adminAnalytics = null;
let selectedStatus = 'PENDING';
let currentView = 'applications';
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '—').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
const date = (value) => value ? new Date(value).toLocaleString() : '—';

function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); }
function detail(label, value) { return `<div class="detail"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`; }
function renderSummary() {
    const source = currentView === 'applications' ? applications : accounts;
    const roles = currentView === 'applications' ? ['SELLER', 'DELIVERY'] : ['CUSTOMER', 'SELLER', 'DELIVERY'];
    const live = adminAnalytics ? `<article class="summary"><span>Total orders</span><strong>${adminAnalytics.orders}</strong></article><article class="summary"><span>Completed orders</span><strong>${adminAnalytics.completedOrders}</strong></article><article class="summary"><span>Revenue</span><strong>$${Number(adminAnalytics.revenue || 0).toFixed(2)}</strong></article>` : '';
    $('#summary').innerHTML = roles.map(role => `<article class="summary"><span>${role === 'DELIVERY' ? 'Driver' : role[0] + role.slice(1).toLowerCase()} ${currentView}</span><strong>${source.filter(item => (item.requestedRole || item.role) === role).length}</strong></article>`).join('') + live;
}
function renderApplications() {
    renderSummary();
    if (!applications.length) { $('#application-list').innerHTML = '<div class="empty">No applications found for this filter.</div>'; return; }
    $('#application-list').innerHTML = applications.map(app => {
        const seller = app.requestedRole === 'SELLER';
        const actions = app.status === 'PENDING' ? `<div class="application-actions"><button class="button reject" data-action="REJECTED" data-id="${app.id}">Reject</button><button class="button approve" data-action="APPROVED" data-id="${app.id}">Approve</button></div>` : '';
        return `<article class="application"><div class="application-head"><div class="application-title"><span class="application-icon">${seller ? '🏪' : '🚚'}</span><div><h2>${escapeHtml(app.applicantName)}</h2><p class="application-sub">${escapeHtml(app.email)} · ${escapeHtml(app.requestedRole)}</p></div></div><span class="status ${app.status.toLowerCase()}">${escapeHtml(app.status)}</span></div><div class="details">${detail('Full name', app.applicantName)}${detail('Email', app.email)}${detail('Address', app.address)}${detail('Phone', app.phoneNumber)}${detail('ID number', app.idNumber)}${detail('Vehicle number', app.vehicleNumber)}${detail('Business details', app.businessDetails)}${detail('Payment method', app.paymentMethod)}${detail('Application date', date(app.submittedAt))}</div>${actions}</article>`;
    }).join('');
}
function renderAccounts() {
    renderSummary();
    if (!accounts.length) { $('#application-list').innerHTML = '<div class="empty">No accounts found.</div>'; return; }
    $('#application-list').innerHTML = accounts.map(account => {
        const role = account.role;
        const suspended = account.status === 'SUSPENDED';
        const fields = role === 'CUSTOMER'
            ? [detail('Full name', account.name), detail('Email', account.email), detail('Phone number', account.phoneNumber), detail('Address', account.address), detail('Account role', role), detail('Registration date', date(account.createdAt)), detail('Account status', account.status)]
            : role === 'SELLER'
                ? [detail('Seller/store name', account.storeName || account.name), detail('Email', account.email), detail('Address/location', account.address || account.location), detail('Phone number', account.phoneNumber), detail('ID number', account.idNumber), detail('Business details', account.businessDetails), detail('Verification status', account.verificationStatus), detail('Registration date', date(account.createdAt))]
                : [detail('Name', account.name), detail('Email', account.email), detail('Address', account.address), detail('Phone number', account.phoneNumber), detail('ID number', account.idNumber), detail('Vehicle number', account.vehicleNumber), detail('Approval status', account.approvalStatus || account.status), detail('Registration date', date(account.createdAt))];
        return `<article class="application"><div class="application-head"><div class="application-title"><span class="application-icon">${role === 'SELLER' ? '🏪' : role === 'DELIVERY' ? '🚚' : '🛍️'}</span><div><h2>${escapeHtml(account.name)}</h2><p class="application-sub">${escapeHtml(account.email)} · ${escapeHtml(role)}</p></div></div><span class="status ${suspended ? 'rejected' : 'approved'}">${escapeHtml(account.status)}</span></div><div class="details">${fields.join('')}</div><div class="application-actions"><button class="button secondary" data-status-role="${role}" data-status-id="${account.id}" data-status-value="${suspended ? 'ACTIVE' : 'SUSPENDED'}">${suspended ? 'Activate' : 'Suspend'}</button><button class="button reject" data-delete-role="${role}" data-delete-id="${account.id}">Delete account</button></div></article>`;
    }).join('');
}
async function loadApplications() { $('#application-list').innerHTML = '<div class="empty">Loading applications...</div>'; try { [applications, adminAnalytics] = await Promise.all([API.getAccountApplications(selectedStatus), API.getAdminAnalytics()]); renderApplications(); } catch (error) { $('#application-list').innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; } }
async function loadAccounts() { $('#application-list').innerHTML = '<div class="empty">Loading accounts...</div>'; try { [accounts, adminAnalytics] = await Promise.all([API.getAdminAccounts(), API.getAdminAnalytics()]); renderAccounts(); } catch (error) { $('#application-list').innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; } }
async function updateApplication(id, status) { try { await API.updateAccountApplicationStatus(id, status); toast(`Application ${status.toLowerCase()}.`); await loadApplications(); } catch (error) { toast(error.message); } }
async function updateAccount(role, id, status) { try { await API.updateAdminAccountStatus(role, id, status); toast(`Account ${status.toLowerCase()}.`); await loadAccounts(); } catch (error) { toast(error.message); } }

function init() {
    const user = JSON.parse(localStorage.getItem('jb_user') || 'null');
    if (!user || user.role !== 'admin') { window.location.replace('/HTML/login.html'); return; }
    document.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', () => { currentView = 'applications'; selectedStatus = button.dataset.status; document.querySelectorAll('[data-status]').forEach(item => item.classList.toggle('active', item === button)); loadApplications(); }));
    $('[data-view="accounts"]').addEventListener('click', () => { currentView = 'accounts'; document.querySelectorAll('[data-status]').forEach(item => item.classList.remove('active')); loadAccounts(); });
    $('#application-list').addEventListener('click', event => {
        const applicationButton = event.target.closest('[data-action]'); if (applicationButton) updateApplication(applicationButton.dataset.id, applicationButton.dataset.action);
        const statusButton = event.target.closest('[data-status-role]'); if (statusButton) updateAccount(statusButton.dataset.statusRole, statusButton.dataset.statusId, statusButton.dataset.statusValue);
        const deleteButton = event.target.closest('[data-delete-role]'); if (deleteButton && window.confirm('Delete this account permanently? This action will be recorded in the audit log.')) API.deleteAdminAccount(deleteButton.dataset.deleteRole, deleteButton.dataset.deleteId).then(() => { toast('Account deleted.'); loadAccounts(); }).catch(error => toast(error.message));
    });
    $('#refresh').addEventListener('click', () => currentView === 'accounts' ? loadAccounts() : loadApplications());
    $('#create-account').addEventListener('click', () => toast('Create accounts through seller/driver applications or customer registration.'));
    $('#logout').addEventListener('click', () => { localStorage.removeItem('jb_user'); localStorage.removeItem('jb_seller'); window.location.href = '/HTML/login.html'; });
    loadApplications();
}
document.addEventListener('DOMContentLoaded', init);
