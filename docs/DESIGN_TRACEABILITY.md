# Inventory Design Traceability

The implementation follows the submitted inventory diagrams and project presentation.

| Design requirement | Implementation |
|---|---|
| Add New Product Stock | Inventory create form + `InventoryService.save()` |
| Update Stock Quantity | Edit form and stock adjustment flow |
| View Stock Levels | Inventory list and dashboard |
| Remove Discontinued Products | Soft-discontinue / reactivate actions |
| Audit Inventory | `InventoryTransaction` + Audit page |
| Set Reorder Threshold | Inventory form field |
| Generate Low Stock Alerts | `evaluateLowStock()` + `StockAlert` |
| Generate Inventory Report | Report page + CSV export |
| Manage Stock Locations / Warehouse | `StockLocation` CRUD |
| Restock Returned Items | `RETURN_RESTOCK` operation + API endpoint |
| Check Product Availability | Customer availability page + REST endpoint |
| Order Placed -> Deduct Stock | `/api/inventory/order` |
| Order Cancelled -> Restore Stock | `/api/inventory/cancel` |
