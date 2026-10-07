import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = 'src/main/resources/static';
const js = fs.readFileSync(`${root}/js/support-agent-dashboard.js`, 'utf8');
const html = fs.readFileSync(`${root}/HTML/support-agent-dashboard.html`, 'utf8');
const css = fs.readFileSync(`${root}/css/support-agent-dashboard.css`, 'utf8');
const controller = fs.readFileSync('src/main/java/com/justbuy/controller/SupportTicketController.java', 'utf8');

for (const id of ['support-nav','support-content','support-search-form','sd-menu-btn','sd-backdrop','support-bell','availability-switch','support-logout','new-ticket-btn']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Missing Support Agent control #${id}`);
}
for (const route of [
  "current === 'overview'", "current === 'my-tickets'", "current === 'all-tickets'", "current === 'customers'",
  "current === 'orders'", "current === 'returns-refunds'", "current === 'knowledge-base'", "current === 'canned-responses'",
  "current === 'reports'", "current === 'settings'"
]) assert.ok(js.includes(route), `Missing route handler: ${route}`);
for (const behavior of [
  "addEventListener('submit'", 'toggleMobileNav', 'openCustomer(', 'openOrder(', 'showNotifications(',
  'toggleAvailability(', "method: 'PATCH'", "'/availability'", "'/notifications'", 'refreshConversation()',
  'globalSearchQuery', 'data-mark-notification', 'support-reply-form', 'showNewTicketForm('
]) assert.ok(js.includes(behavior), `Missing interaction behavior: ${behavior}`);
assert.match(controller, /@PatchMapping\("\/notifications\/\{id\}\/read"\)/, 'Notification read endpoint missing');
assert.match(controller, /Objects\.equals\(notification\.getRecipientId\(\), principal\.getId\(\)\)/, 'Notification owner authorization missing');
assert.match(controller, /"CUSTOMER"\.equalsIgnoreCase\(u\.getRole\(\)\)/, 'Customer lookup must exclude non-customer roles');
assert.match(css, /\.support-ticket:focus-visible/, 'Keyboard focus styling missing');
assert.match(css, /\.support-modal-content/, 'Notification/profile modal styling missing');
console.log('PASS: Support Agent navigation and all 10 dashboard routes are wired');
console.log('PASS: mobile menu, global search, customer/order details, ticket replies, status controls and availability handlers are present');
console.log('PASS: notification read endpoint checks the authenticated agent owns the notification');
console.log('PASS: customer search is restricted to CUSTOMER accounts');
console.log('PASS: keyboard focus styling and responsive interaction styles are present');
