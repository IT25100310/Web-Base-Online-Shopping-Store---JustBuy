import { API } from './api.js';

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
let selectedStatus = 'PENDING';
let applications = [];
let currentView = 'applications';
let accounts = [];

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  window.setTimeout(() => node.classList.remove('show'), 2600);
}

function renderSummary() {
  const pending = applications.filter((item) => item.status === 'PENDING').length;
  const sellers = applications.filter((item) => item.requestedRole === 'SELLER').length;
  const delivery = applications.filter((item) => item.requestedRole === 'DELIVERY').length;
  $('#summary').innerHTML = `<article class="summary"><span>Applications shown</span><strong>${applications.length}</strong></article><article class="summary"><span>Seller applications</span><strong>${sellers}</strong></article><article class="summary"><span>Pending review</span><strong>${pending}</strong></article><article class="summary"><span>Delivery applications</span><strong>${delivery}</strong></article>`;
}

function renderApplications() {
  renderSummary();
  if (!applications.length) {
    $('#application-list').innerHTML = '<div class="empty">No applications found for this filter.</div>';
    return;
  }
  $('#application-list').innerHTML = applications.map((application) => {
    const seller = application.requestedRole === 'SELLER';
    const extra = seller ? `Payment: ${escapeHtml(application.paymentMethod)}<br>Seller ID: ${escapeHtml(application.generatedSellerId || 'Generated on submission')}` : `Vehicle: ${escapeHtml(application.vehicleNumber)}`;
    return `<article class="application"><div class="application-head"><div class="application-title"><span class="application-icon">${seller ? '🏪' : '🚚'}</span><div><h2>${escapeHtml(application.applicantName)}</h2><p class="application-sub">${escapeHtml(application.email)} · ${application.requestedRole}</p></div></div><span class="status ${application.status.toLowerCase()}">${application.status}</span></div><div class="details"><div class="detail"><span>Address</span><strong>${escapeHtml(application.address)}</strong></div><div class="detail"><span>Phone</span><strong>${escapeHtml(application.phoneNumber)}</strong></div><div class="detail"><span>ID number</span><strong>${escapeHtml(application.idNumber)}</strong></div><div class="detail"><span>${seller ? 'Seller details' : 'Vehicle number'}</span><strong>${seller ? escapeHtml(application.businessDetails) : escapeHtml(application.vehicleNumber)}</strong></div><div class="detail"><span>Submitted</span><strong>${new Date(application.submittedAt).toLocaleDateString()}</strong></div><div class="detail"><span>Additional</span><strong>${extra}</strong></div></div>${application.status === 'PENDING' ? `<div class="application-actions"><button class="button reject" data-action="REJECTED" data-id="${application.id}">Reject</button><button class="button approve" data-action="APPROVED" data-id="${application.id}">Approve</button></div>` : ''}</article>`;
  }).join('');
}

function renderAccounts() {
  $('#summary').innerHTML = ['CUSTOMER', 'SELLER', 'DELIVERY'].map((role) => `<article class="summary"><span>${role[0] + role.slice(1).toLowerCase()} accounts</span><strong>${accounts.filter((account) => account.role === role).length}</strong></article>`).join('');
  if (!accounts.length) {
    $('#application-list').innerHTML = '<div class="empty">No managed accounts yet.</div>';
    return;
  }
  $('#application-list').innerHTML = accounts.map((account) => `<article class="application"><div class="application-head"><div class="application-title"><span class="application-icon">${account.role === 'SELLER' ? '🏪' : account.role === 'DELIVERY' ? '🚚' : '🛍️'}</span><div><h2>${escapeHtml(account.name)}</h2><p class="application-sub">${escapeHtml(account.email)} · ${account.role}</p></div></div><span class="status approved">${account.status}</span></div><div class="details"><div class="detail"><span>Account ID</span><strong>${account.id}</strong></div><div class="detail"><span>Role</span><strong>${account.role}</strong></div><div class="detail"><span>Created</span><strong>${new Date(account.createdAt).toLocaleDateString()}</strong></div></div><div class="application-actions"><button class="button secondary" data-view-account="${account.id}">View</button><button class="button reject" data-delete-account="${account.id}">Delete</button></div></article>`).join('');
}

async function loadApplications() {
  $('#application-list').innerHTML = '<div class="empty">Loading applications...</div>';
  try {
    applications = await API.getAccountApplications(selectedStatus);
    renderApplications();
  } catch (error) {
    $('#application-list').innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}

async function loadAccounts() {
  $('#application-list').innerHTML = '<div class="empty">Loading accounts...</div>';
  try {
    accounts = await API.getAdminAccounts();
    renderAccounts();
  } catch (error) {
    $('#application-list').innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}

function openCreateAccount() {
  const name = window.prompt('Account holder name:');
  if (!name) return;
  const email = window.prompt('Account email:');
  if (!email) return;
  const role = window.prompt('Account role: CUSTOMER, SELLER, or DELIVERY', 'CUSTOMER');
  if (!role) return;
  API.createAdminAccount({ name, email, role }).then(() => {
    toast('Account created.');
    currentView = 'accounts';
    loadAccounts();
  }).catch((error) => toast(error.message));
}

async function updateStatus(id, status) {
  try {
    await API.updateAccountApplicationStatus(id, status);
    toast(`Application ${status.toLowerCase()}.`);
    await loadApplications();
  } catch (error) {
    toast(error.message);
  }
}

function init() {
  const user = JSON.parse(localStorage.getItem('jb_user') || 'null');
  if (!user || user.role !== 'admin') {
    window.location.replace('/HTML/login.html');
    return;
  }
  document.querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', () => {
    currentView = 'applications';
    selectedStatus = button.dataset.status;
    document.querySelectorAll('[data-status]').forEach((item) => item.classList.toggle('active', item === button));
    loadApplications();
  }));
  document.querySelector('[data-view="accounts"]').addEventListener('click', () => {
    currentView = 'accounts';
    document.querySelectorAll('[data-status]').forEach((item) => item.classList.remove('active'));
    loadAccounts();
  });
  $('#application-list').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (button) updateStatus(button.dataset.id, button.dataset.action);
    const deleteButton = event.target.closest('[data-delete-account]');
    if (deleteButton && window.confirm('Delete this account?')) {
      API.deleteAdminAccount(deleteButton.dataset.deleteAccount).then(() => { toast('Account deleted.'); loadAccounts(); }).catch((error) => toast(error.message));
    }
    const viewButton = event.target.closest('[data-view-account]');
    if (viewButton) {
      const account = accounts.find((item) => String(item.id) === viewButton.dataset.viewAccount);
      if (account) window.alert(`${account.name}\n${account.email}\nRole: ${account.role}\nStatus: ${account.status}`);
    }
  });
  $('#refresh').addEventListener('click', () => currentView === 'accounts' ? loadAccounts() : loadApplications());
  $('#create-account').addEventListener('click', openCreateAccount);
  $('#logout').addEventListener('click', () => {
    localStorage.removeItem('jb_user');
    localStorage.removeItem('jb_seller');
    window.location.href = '/HTML/login.html';
  });
  loadApplications();
}

document.addEventListener('DOMContentLoaded', init);
