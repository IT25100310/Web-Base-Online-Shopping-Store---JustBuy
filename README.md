# SE2030 Web-based E-Shopping Store - Inventory Management

A Spring Boot inventory module built around the Inventory Management use cases in the project documents.

## Functions implemented

- Add new product stock
- View and search stock levels
- Update product information and quantity
- Set reorder thresholds
- Automatic low-stock alerts
- Restock / manual increase / manual decrease
- Automatic-style order stock deduction through REST API
- Restore stock for order cancellation and returned items
- Mark discontinued products and reactivate them
- Customer product availability check
- Warehouse / stock-location management
- Inventory audit trail
- Inventory summary and CSV report
- Input validation and insufficient-stock protection

## Technology

- Java 17
- Spring Boot 3.3.5
- Spring MVC + Thymeleaf
- Spring Data JPA / Hibernate
- H2 in-memory DB for a zero-setup demonstration
- Microsoft SQL Server driver and a separate `mssql` profile for group integration
- Maven

## Open and run in IntelliJ IDEA

1. Unzip the project.
2. Open IntelliJ IDEA -> **Open** -> select the folder that contains `pom.xml`.
3. Allow IntelliJ to import the Maven project and download dependencies.
4. Set Project SDK to **Java 17 or newer**.
5. Open `InventoryManagementApplication.java`.
6. Click the green Run button.
7. Open `http://localhost:8080`.

The default `demo` profile starts an in-memory H2 database and inserts sample data, so no SQL Server setup is required just to demonstrate the inventory module.

## Microsoft SQL Server profile

The assignment architecture specifies MS SQL Server. The module is already prepared for it.

1. Create a database named `eshopping` (sample script: `sql/create_database.sql`).
2. Edit the environment variables or use the defaults from `application-mssql.properties`.
3. Run with the VM option:

```text
-Dspring.profiles.active=mssql
```

Recommended environment variables:

```text
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=eshopping;encrypt=true;trustServerCertificate=true
DB_USERNAME=sa
DB_PASSWORD=your_password
```

Hibernate creates/updates the inventory tables automatically.

## Integration with Order & Cart module

The inventory module exposes simple REST endpoints:

- `GET /api/inventory/availability/{sku}?quantity=2`
- `POST /api/inventory/order` - deduct when an order is placed
- `POST /api/inventory/cancel` - restore when an order is cancelled
- `POST /api/inventory/return` - restore a returned item

Ready-to-run examples are in `docs/api-requests.http` and can be executed from IntelliJ's HTTP client.

## Important project note

This repository is intentionally understandable rather than hidden or obfuscated. Review the classes, rename sample vendors/products if needed, connect the module to your group's Product/Seller and Order entities, and make sure you can explain every part you submit or demonstrate.
