from pathlib import Path
import re

ROOT = Path('.')
SRC = ROOT / 'src/main'
JAVA = list((SRC / 'java').rglob('*.java'))
CONTROLLERS = list((SRC / 'java/com/justbuy/controller').glob('*.java'))
FAILURES = []

def require(path, needle, label):
    text = path.read_text(encoding='utf-8', errors='ignore') if path.exists() else ''
    if needle not in text:
        FAILURES.append(f'{label}: missing {needle}')
    return text

pom = require(ROOT / 'pom.xml', 'spring-boot-starter-data-jpa', 'SQL Server persistence dependencies')
require(ROOT / 'pom.xml', 'spring-boot-starter-jdbc', 'JDBC/Hikari datasource dependency')
require(ROOT / 'pom.xml', 'jackson-databind', 'Jackson 2 ObjectMapper compatibility dependency')
require(ROOT / 'pom.xml', 'mssql-jdbc', 'Microsoft SQL Server driver')
require(ROOT / 'src/main/java/com/justbuy/JustBuyApplication.java', 'org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration', 'Spring Boot 4 datasource auto-configuration package')
require(ROOT / 'src/main/java/com/justbuy/config/SqlServerDataSourceConfiguration.java', 'org.springframework.boot.jdbc.autoconfigure.DataSourceProperties', 'Spring Boot 4 datasource properties package')
props = require(ROOT / 'src/main/resources/application.properties', 'spring.profiles.default=sqlserver', 'SQL Server default profile')
sql_props = require(ROOT / 'src/main/resources/application-sqlserver.properties', 'spring.jpa.hibernate.ddl-auto=update', 'SQL Server JPA schema setup')
require(ROOT / 'src/main/resources/application-sqlserver.properties', 'SQLServerDialect', 'SQL Server Hibernate dialect')
require(ROOT / 'src/main/java/com/justbuy/config/SqlServerDataSourceConfiguration.java', '@Profile("sqlserver")', 'SQL Server datasource profile')
repo_base = require(ROOT / 'src/main/java/com/justbuy/repository/memory/InMemoryRepositorySupport.java', 'EntityManagerFactory', 'JPA-capable repository base')
require(ROOT / 'src/main/java/com/justbuy/repository/memory/InMemoryRepositorySupport.java', 'em.persist(entity)', 'SQL Server insert path')
require(ROOT / 'src/main/java/com/justbuy/repository/memory/InMemoryRepositorySupport.java', 'em.merge(entity)', 'SQL Server update path')
require(ROOT / 'src/main/java/com/justbuy/security/SessionAuthenticationService.java', 'SPRING_SECURITY_CONTEXT_KEY', 'Server-side login session')
security = require(ROOT / 'src/main/java/com/justbuy/config/SecurityConfig.java', '.requestMatchers("/api/**").denyAll()', 'Fail-closed API authorization')
for needle, label in [
    ('.requestMatchers("/api/admin/accounts/**", "/api/admin/**", "/api/account-applications/*/status").hasRole("ADMIN")', 'Admin-only API routes'),
    ('.requestMatchers("/api/inventory/**").hasAnyRole("SELLER", "ADMIN")', 'Seller/admin inventory authorization'),
    ('.requestMatchers("/api/deliveries/**").hasAnyRole("SELLER", "ADMIN")', 'Seller-owned delivery authorization'),
    ('.requestMatchers("/api/driver/**").hasAnyRole("DRIVER", "ADMIN")', 'Driver/admin delivery authorization'),
    ('.requestMatchers("/api/customer-profile/**").hasRole("CUSTOMER")', 'Customer profile role policy'),
    ('.requestMatchers("/api/support/**").hasAnyRole("SUPPORT_AGENT", "ADMIN")', 'Support staff default policy'),
]:
    if needle not in security:
        FAILURES.append(f'SecurityConfig: missing policy for {label}')
if security.index('.requestMatchers("/api/**").denyAll()') < security.index('.anyRequest().permitAll()'):
    pass
else:
    FAILURES.append('SecurityConfig: catch-all API deny rule must precede the static-resource permit rule')
require(ROOT / 'src/main/java/com/justbuy/security/AuthenticatedIdentityGuardFilter.java', 'active session does not match', 'Legacy-header identity guard')
require(ROOT / 'src/main/java/com/justbuy/security/AuthenticatedIdentityGuardFilter.java', 'isAccountStillAuthorized(principal)', 'Current account/session status revalidation')
require(ROOT / 'src/main/java/com/justbuy/security/AuthenticatedIdentityGuardFilter.java', 'scalarAccount(', 'Scalar database session checks that avoid loading profile photo LOBs')
require(ROOT / 'src/main/java/com/justbuy/security/AuthenticatedIdentityGuardFilter.java', 'case "USER", "BUYER" -> "CUSTOMER"', 'Legacy customer role normalization')
product_controller = require(ROOT / 'src/main/java/com/justbuy/controller/ProductController.java', '@AuthenticationPrincipal JustBuyPrincipal principal', 'Server-authenticated product ownership')
require(ROOT / 'src/main/java/com/justbuy/controller/ProductController.java', 'bindAndValidateNewProductOwner(product, principal)', 'Seller product create ownership check')
require(ROOT / 'src/main/java/com/justbuy/controller/ProductController.java', 'requireProductOwner(existing, principal)', 'Seller product update/delete ownership check')
require(ROOT / 'src/main/java/com/justbuy/controller/ProductController.java', 'requireProductOwner(product, principal)', 'Seller product stock/status ownership check')
if 'X-Admin-Email"' in product_controller:
    FAILURES.append('ProductController still relies on client-supplied admin email for product CRUD')
support_controller = require(ROOT / 'src/main/java/com/justbuy/controller/SupportTicketController.java', 'canAccessTicket(ticket, principal)', 'Support ticket ownership guard')
require(ROOT / 'src/main/java/com/justbuy/controller/SupportTicketController.java', 'AGENT_NOTE', 'Support-agent internal note separation')
require(ROOT / 'src/main/java/com/justbuy/config/SecurityConfig.java', '"/api/support/tickets/**"', 'Customer-owned support ticket detail access')
require(ROOT / 'src/main/java/com/justbuy/service/OrderService.java', 'already in use by another customer', 'Order idempotency ownership guard')
require(ROOT / 'src/main/java/com/justbuy/controller/SupportTicketController.java', '@PatchMapping("/availability")', 'Persisted support-agent availability')
require(ROOT / 'src/main/resources/static/js/delivery-dashboard.js', 'exportEarningsCsv', 'Driver CSV export action')
require(ROOT / 'src/main/resources/static/js/support-agent-dashboard.js', "api('/availability'", 'Support-agent availability UI/API integration')
require(ROOT / 'src/main/resources/static/js/admin-dashboard.js', "classList.toggle('driver-mode', isDriver)", 'Driver account form visibility')
require(ROOT / 'src/main/java/com/justbuy/controller/AdminAccountController.java', 'password.length() < 6', 'Admin account password rule')
require(ROOT / 'src/main/java/com/justbuy/controller/AdminAccountController.java', 'cannot suspend the administrator account currently being used', 'Admin self-suspension guard')
require(ROOT / 'src/main/java/com/justbuy/controller/OrderController.java', 'order.setId(null)', 'Checkout must create a new order, not merge a client-supplied ID')
require(ROOT / 'src/main/java/com/justbuy/controller/OrderController.java', 'item.setId(null)', 'Checkout must not merge client-supplied order-item IDs')
require(ROOT / 'src/main/java/com/justbuy/controller/OrderController.java', 'scopeOrderForRole(order, principal)', 'Seller order responses are scoped to seller-owned line items')
require(ROOT / 'src/main/java/com/justbuy/controller/SupportTicketController.java', 'ticket.setId(null)', 'Customer ticket creation must not merge an existing ticket')
require(ROOT / 'src/main/java/com/justbuy/controller/SupportTicketController.java', 'message.setId(null)', 'Ticket replies must not merge an existing message')
require(ROOT / 'src/main/java/com/justbuy/controller/SupportTicketController.java', 'request.setStatus("REQUESTED")', 'Customer support requests must start in requested state')
require(ROOT / 'src/main/java/com/justbuy/controller/DriverAuthController.java', 'Boolean.TRUE.equals(driver.getVerified())', 'Driver login requires verified status')
require(ROOT / 'src/main/java/com/justbuy/repository/memory/InMemoryRepositorySupport.java', 'LockModeType.PESSIMISTIC_WRITE', 'Database stock row lock')
require(ROOT / 'src/main/java/com/justbuy/repository/memory/InMemoryRepositorySupport.java', 'Hibernate.getClass(related)', 'Detached Hibernate proxy-safe relationship persistence')
require(ROOT / 'src/main/java/com/justbuy/service/ProductService.java', '@Transactional\n    public Product updateStock', 'Transactional stock update')

# SQL Server setup must grant runtime CRUD plus the DDL ability needed by dev ddl-auto=update.
for script in [ROOT / 'database/sqlserver/01-create-justbuy-database.sql', ROOT / 'database/sqlserver/01-create-database-and-app-user.sql']:
    require(script, 'db_ddladmin', f'{script.name} permits local initial schema creation')
    require(script, 'db_datareader', f'{script.name} grants SQL Server read access')
    require(script, 'db_datawriter', f'{script.name} grants SQL Server write access')

# SQL Server-specific MySQL type leakage is a hard error.
models = '\n'.join(p.read_text(encoding='utf-8', errors='ignore') for p in (SRC / 'java/com/justbuy/model').glob('*.java'))
for stale in ('LONGBLOB', 'columnDefinition = "TEXT"'):
    if stale in models:
        FAILURES.append(f'Model SQL mapping still contains MySQL-specific type: {stale}')

# Verify all actual controller classes and count URL annotations.
for path in CONTROLLERS:
    text = path.read_text(encoding='utf-8', errors='ignore')
    if '@RestController' not in text and '@Controller' not in text:
        FAILURES.append(f'{path}: missing controller annotation')
endpoint_count = sum(len(re.findall(r'@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|RequestMapping)\b', p.read_text(encoding='utf-8', errors='ignore'))) for p in CONTROLLERS)
if endpoint_count < 50:
    FAILURES.append(f'Expected at least 50 concrete controller mappings, found {endpoint_count}')

initializer = require(ROOT / 'src/main/java/com/justbuy/config/DataInitializer.java', 'saveProduct(', 'Seed initializer')
category_count = len(re.findall(r'Category\s+\w+\s*=\s*getOrCreateCategory\(', initializer))
product_count = len(re.findall(r'\bsaveProduct\(', initializer)) - 1
if category_count < 5:
    FAILURES.append(f'Expected at least 5 product categories, found {category_count}')
if product_count < 15:
    FAILURES.append(f'Expected at least 15 products, found {product_count}')

# Ensure the SSMS bootstrap guide is present.
require(ROOT / 'database/sqlserver/01-create-justbuy-database.sql', 'CREATE DATABASE', 'SSMS database bootstrap script')

if FAILURES:
    print('FAIL: backend/static integration verification')
    print('\n'.join(FAILURES))
    raise SystemExit(1)

print(f'PASS: {len(JAVA)} Java sources structurally scanned')
print(f'PASS: {len(CONTROLLERS)} REST controllers scanned with {endpoint_count} concrete mapping annotations')
print(f'PASS: SQL Server/JPA profile and persistent repository paths are configured')
print(f'PASS: session authentication, API role guard, admin/driver/support UI integrations are present')
print(f'PASS: seeded catalogue has {category_count} categories and {product_count} products')
print('PASS: no remaining MySQL-specific LONGBLOB/TEXT model columns')
