import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8');
const [checkout, orderSuccess, orderService, lifecycle, orderController, orderModel,
  strategy, factory, observer, subject, notificationObserver, pricing, pricingConfig, docs] = await Promise.all([
  read('../src/main/resources/static/js/screens/checkout.js'),
  read('../src/main/resources/static/js/screens/order-success.js'),
  read('../src/main/java/com/justbuy/service/OrderService.java'),
  read('../src/main/java/com/justbuy/service/OrderLifecycleService.java'),
  read('../src/main/java/com/justbuy/controller/OrderController.java'),
  read('../src/main/java/com/justbuy/model/Order.java'),
  read('../src/main/java/com/justbuy/payment/PaymentStrategy.java'),
  read('../src/main/java/com/justbuy/payment/PaymentStrategyFactory.java'),
  read('../src/main/java/com/justbuy/observer/OrderStatusObserver.java'),
  read('../src/main/java/com/justbuy/observer/OrderStatusSubject.java'),
  read('../src/main/java/com/justbuy/observer/OrderNotificationObserver.java'),
  read('../src/main/java/com/justbuy/pricing/PromotionPricingDecorator.java'),
  read('../src/main/java/com/justbuy/pricing/OrderPricingConfiguration.java'),
  read('../DESIGN-PATTERNS-APPLIED.md')
]);

for (const method of ['CREDIT_CARD', 'CASH_ON_DELIVERY', 'BANK_TRANSFER']) {
  assert.match(checkout, new RegExp(`value="${method}"`), `Checkout option ${method} exists`);
}
assert.match(checkout, /selectedPaymentMethod === 'CREDIT_CARD'/, 'Card-only checks run only for card payments');
assert.match(checkout, /paymentMethod: selectedPaymentMethod/, 'Chosen method is sent to the API');
assert.doesNotMatch(checkout.slice(checkout.indexOf('const orderData = {'), checkout.indexOf('const result = await API.createOrder')),
  /cc-number|cc-exp|cc-cvv|cardNumber|\bcvv\b/i, 'Card data is excluded from the API order body');

assert.match(strategy, /interface PaymentStrategy/, 'Strategy interface exists');
assert.match(factory, /forMethod\(String requestedMethod\)/, 'Factory resolves selected methods');
assert.match(orderService, /PaymentStrategyFactory paymentStrategyFactory/, 'Order service depends on the factory');
assert.match(orderModel, /private String paymentStatus;/, 'Payment outcome is persisted on orders');
assert.match(orderController, /setPaymentStatus\(null\)/, 'Client-supplied payment status is discarded');
assert.match(orderSuccess, /PAYMENT STATUS/, 'Payment state is displayed to customers');

assert.match(observer, /interface OrderStatusObserver/, 'Observer contract exists');
assert.match(subject, /for \(OrderStatusObserver observer : observers\)/, 'Subject broadcasts events');
assert.match(lifecycle, /orderStatusSubject\.publish/, 'Lifecycle publishes created/status-changed events');
assert.match(notificationObserver, /notificationRepository\.save/, 'Concrete observer persists in-app notifications');

assert.match(pricing, /PromotionPricingDecorator/, 'Decorator adds promotion behavior');
assert.match(pricingConfig, /TaxPricingDecorator\(new PromotionPricingDecorator\(new BaseOrderPricing\(\)\)\)/,
  'Pricing decorators are composed in base -> promotions -> tax order');
assert.match(docs, /Singleton|Observer|Strategy|Factory|Decorator/, 'Pattern documentation covers lecture patterns');

console.log('PASS: checkout payment strategies and factory wiring');
console.log('PASS: card details stay out of the order API payload');
console.log('PASS: order observer and notification integration');
console.log('PASS: Decorator pricing chain and pattern documentation');
