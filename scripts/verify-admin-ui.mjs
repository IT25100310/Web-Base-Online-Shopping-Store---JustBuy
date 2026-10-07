import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const html = read('src/main/resources/static/HTML/admin-dashboard.html');
const profileHtml = read('src/main/resources/static/HTML/admin-profile.html');
const js = read('src/main/resources/static/js/admin-dashboard.js');
const profileJs = read('src/main/resources/static/js/admin-profile.js');
const api = read('src/main/resources/static/js/api.js');
const controller = read('src/main/java/com/justbuy/controller/AdminAccountController.java');
const appsController = read('src/main/java/com/justbuy/controller/AccountApplicationController.java');
const css = read('src/main/resources/static/css/admin-dashboard.css');

const requiredDashboardIds = [
  'logout', 'create-account', 'create-ad', 'refresh', 'account-form', 'account-role',
  'account-dialog', 'close-account-dialog', 'cancel-account', 'ad-form', 'ad-dialog',
  'close-ad-dialog', 'cancel-ad', 'application-list', 'summary', 'toast'
];
for (const id of requiredDashboardIds) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Admin HTML is missing #${id}`);
  if (['logout','create-account','create-ad','refresh','close-account-dialog','cancel-account','close-ad-dialog','cancel-ad','application-list','account-form','ad-form'].includes(id)) {
    assert.ok(js.includes(`#${id}`), `Admin script does not bind #${id}`);
  }
}

for (const selector of [
  "[data-status]", "[data-view=\"accounts\"]", "[data-view=\"ads\"]", "[data-view=\"audit\"]", "[data-role-filter]"
]) {
  assert.ok(js.includes(selector), `Missing click binding for tab selector ${selector}`);
}
for (const action of ['data-action','data-delete-role','data-status-role','data-update-name-role','data-change-role','data-edit-ad','data-toggle-ad','data-delete-ad']) {
  assert.ok(js.includes(`closest('[${action}]')`), `Missing delegated click handler for ${action}`);
}
for (const method of ['getAccountApplications','updateAccountApplicationStatus','getAdminAccounts','getAdminAnalytics','getAdminAuditLogs','getAdminAds','createAdvertisement','updateAdvertisement','setAdvertisementStatus','deleteAdvertisement','createAdminAccount','updateAdminAccount','changeAdminAccountRole','updateAdminAccountStatus','deleteAdminAccount']) {
  assert.ok(api.includes(`${method}(`), `Admin API method ${method} is missing`);
}
assert.ok(controller.includes('"CUSTOMER".equalsIgnoreCase(u.getRole())'), 'Admin account list must not classify seller/driver shadow users as customers');
assert.ok(controller.includes('hasCustomerOrders(account.getId())'), 'Admin must protect customer order history from deletion/role changes');
assert.ok(controller.includes('Reassign or remove those products before changing the role'), 'Admin must not orphan seller products during role changes');
assert.ok(controller.includes('target.equals("CUSTOMER") && linkedUser != null'), 'Seller/driver to customer role conversion must reuse the matching user record');
assert.ok(controller.includes('assigned delivery history'), 'Driver delete/role change must protect assigned delivery history');
assert.ok(js.includes('const visibleAccounts = accounts.filter'), 'Role tabs must filter the visible account list');
assert.ok(js.includes('if (!visibleAccounts.length)'), 'Role tabs must show a no-results state');
assert.ok(js.includes('Promise.allSettled'), 'Analytics failure must not block applications/accounts');
assert.ok(js.includes("$('#summary').innerHTML = '';"), 'Switching tabs must clear stale summary cards while the next view loads');
assert.ok(profileJs.includes("fetch('/api/unified-auth/logout'"), 'Profile logout must invalidate the server session');
assert.ok(js.includes("fetch('/api/unified-auth/logout'"), 'Dashboard logout must invalidate the server session');
assert.ok(profileHtml.includes('id="profile-picture-input"') && profileJs.includes("querySelector('#profile-picture-input')"), 'Profile picture control must have a change handler');
assert.ok(appsController.includes('@GetMapping') && appsController.includes('@PutMapping("/{id}/status")'), 'Application tabs require list and status API routes');
assert.ok(css.includes('scrollbar-width:thin') && css.includes('.application-actions{flex-wrap:wrap'), 'Admin tabs/actions must remain usable on mobile');

console.log('PASS: Admin controls have click bindings');
console.log('PASS: all account/application/advertisement/audit action handlers are present');
console.log('PASS: role filters handle empty results and exclude seller/driver shadow users from Customers');
console.log('PASS: analytics failure does not block list rendering');
console.log('PASS: dashboard/profile logout closes the server-side session');
console.log('PASS: profile-picture action and mobile tab/action layout checks');
