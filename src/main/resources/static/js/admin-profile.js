import { API } from './api.js';
const user = JSON.parse(localStorage.getItem('jb_user') || 'null');
if (!user || user.role !== 'admin') window.location.replace('/HTML/login.html');
else {
    const name = user.name || user.fullName || 'Administrator';
    const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const avatar = document.querySelector('#profile-avatar');
    const imageUrl = API.profileImageUrl(user);
    if (imageUrl) { const image = document.createElement('img'); image.src = imageUrl; image.alt = name; image.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit'; avatar.textContent = ''; avatar.appendChild(image); }
    document.querySelector('#profile-name').textContent = name;
    document.querySelector('#profile-picture-input')?.addEventListener('change', async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const saved = await API.uploadProfileImage(file); const image = avatar.querySelector('img') || document.createElement('img'); image.src = `${saved.imageUrl}&v=${Date.now()}`; image.alt = name; image.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit'; avatar.textContent = ''; avatar.appendChild(image); } catch (error) { alert(error.message); } event.target.value = ''; });
    const detail = (label, value) => `<div class="detail"><span>${label}</span><strong>${String(value || '—').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]))}</strong></div>`;
    document.querySelector('#profile-details').innerHTML = detail('Name', name) + detail('Email', user.email) + detail('Role', 'Administrator') + detail('Account status', 'ACTIVE');
    API.getAdminAnalytics().then(stats => { document.querySelector('#profile-details').insertAdjacentHTML('beforeend', detail('Managed accounts', Number(stats.admins || 0) + Number(stats.supportAgents || 0) + Number(stats.customers || 0) + Number(stats.sellers || 0) + Number(stats.drivers || 0))); }).catch(() => {});
}
document.querySelector('#logout')?.addEventListener('click', () => { localStorage.removeItem('jb_user'); localStorage.removeItem('jb_seller'); window.location.href = '/HTML/login.html'; });
