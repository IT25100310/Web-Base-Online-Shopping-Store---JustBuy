/* ============================================================
   E-MARKETPLACE — Multi-Vendor Online Shopping Platform
   Database: Microsoft SQL Server (T-SQL)
   Normalized to 3NF
   ============================================================ */

CREATE DATABASE EMarketplace;
GO
USE EMarketplace;
GO

/* ============================================================
   1. USERS & AUTHENTICATION
   ============================================================ */

CREATE TABLE Roles (
    RoleID          INT IDENTITY(1,1) PRIMARY KEY,
    RoleName        VARCHAR(30) NOT NULL UNIQUE   -- Customer, Seller, Admin
);
GO

CREATE TABLE Users (
    UserID          INT IDENTITY(1,1) PRIMARY KEY,
    Email           VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash    VARCHAR(255) NOT NULL,
    PhoneNumber     VARCHAR(20),
    ProfileImageURL VARCHAR(500),
    AccountStatus   VARCHAR(20) NOT NULL DEFAULT 'Active'
                    CHECK (AccountStatus IN ('Active','Inactive','Suspended','PendingVerification')),
    RegistrationDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Users_Email ON Users(Email);
GO

CREATE TABLE UserRoles (
    UserID  INT NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    RoleID  INT NOT NULL REFERENCES Roles(RoleID),
    PRIMARY KEY (UserID, RoleID)
);
GO

/* ============================================================
   2. CUSTOMER
   ============================================================ */

CREATE TABLE Customers (
    CustomerID      INT PRIMARY KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    FullName        VARCHAR(150) NOT NULL
);
GO

CREATE TABLE CustomerAddresses (
    AddressID       INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID      INT NOT NULL REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    Country         VARCHAR(100) NOT NULL,
    ProvinceState   VARCHAR(100) NOT NULL,
    TownCity        VARCHAR(100) NOT NULL,
    Street          VARCHAR(200) NOT NULL,
    PostalCode      VARCHAR(20) NOT NULL,
    AptHouseNumber  VARCHAR(50),
    ContactPhone    VARCHAR(20) NOT NULL,
    IsDefault       BIT NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_CustomerAddresses_Customer ON CustomerAddresses(CustomerID);
GO

CREATE TABLE PaymentMethods (
    PaymentMethodID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID      INT NOT NULL REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    CardType        VARCHAR(30) NOT NULL,
    MaskedCardNumber VARCHAR(25) NOT NULL,     -- e.g. **** **** **** 4417
    CardholderName  VARCHAR(150) NOT NULL,
    ExpiryMonth     TINYINT CHECK (ExpiryMonth BETWEEN 1 AND 12),
    ExpiryYear      SMALLINT,
    ProviderToken   VARCHAR(255) NOT NULL,     -- token from payment gateway, never raw PAN/CVV
    IsDefault       BIT NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE Wishlists (
    WishlistID      INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID      INT NOT NULL UNIQUE REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ============================================================
   3. SELLER
   ============================================================ */

CREATE TABLE Sellers (
    SellerID          INT PRIMARY KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    StoreName         VARCHAR(150) NOT NULL,
    StoreDescription  VARCHAR(MAX),
    StoreLogoURL      VARCHAR(500),
    BusinessInfo      VARCHAR(MAX),
    Country           VARCHAR(100),
    ProvinceState     VARCHAR(100),
    TownCity          VARCHAR(100),
    Street            VARCHAR(200),
    PostalCode        VARCHAR(20),
    VerificationStatus VARCHAR(20) NOT NULL DEFAULT 'Pending'
                      CHECK (VerificationStatus IN ('Pending','Verified','Rejected')),
    AccountStatus     VARCHAR(20) NOT NULL DEFAULT 'Active'
                      CHECK (AccountStatus IN ('Active','Suspended','Rejected')),
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Sellers_StoreName ON Sellers(StoreName);
GO

CREATE TABLE SellerVerification (
    VerificationID    INT IDENTITY(1,1) PRIMARY KEY,
    SellerID          INT NOT NULL REFERENCES Sellers(SellerID) ON DELETE CASCADE,
    DocumentType      VARCHAR(50) NOT NULL,
    DocumentURL       VARCHAR(500) NOT NULL,
    Status            VARCHAR(20) NOT NULL DEFAULT 'Pending'
                      CHECK (Status IN ('Pending','Approved','Rejected')),
    ReviewedBy        INT REFERENCES Users(UserID),
    SubmittedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ReviewedAt        DATETIME2
);
GO

/* ============================================================
   4. PRODUCTS
   ============================================================ */

CREATE TABLE Categories (
    CategoryID        INT IDENTITY(1,1) PRIMARY KEY,
    ParentCategoryID  INT NULL REFERENCES Categories(CategoryID),
    Name              VARCHAR(100) NOT NULL,
    Description       VARCHAR(500),
    IsActive          BIT NOT NULL DEFAULT 1
);
GO
CREATE INDEX IX_Categories_Parent ON Categories(ParentCategoryID);
GO

CREATE TABLE Products (
    ProductID         INT IDENTITY(1,1) PRIMARY KEY,
    SellerID          INT NOT NULL REFERENCES Sellers(SellerID),
    CategoryID        INT NOT NULL REFERENCES Categories(CategoryID),
    Name              VARCHAR(200) NOT NULL,
    Description       VARCHAR(MAX),
    Price             DECIMAL(12,2) NOT NULL CHECK (Price >= 0),
    DiscountedPrice   DECIMAL(12,2) CHECK (DiscountedPrice >= 0),
    Brand             VARCHAR(100),
    ShippingInfo      VARCHAR(500),
    ApprovalStatus    VARCHAR(20) NOT NULL DEFAULT 'Pending'
                      CHECK (ApprovalStatus IN ('Pending','Approved','Rejected')),
    IsActive          BIT NOT NULL DEFAULT 1,
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Products_Name ON Products(Name);
CREATE INDEX IX_Products_Category ON Products(CategoryID);
CREATE INDEX IX_Products_Seller ON Products(SellerID);
GO

CREATE TABLE ProductImages (
    ImageID           INT IDENTITY(1,1) PRIMARY KEY,
    ProductID         INT NOT NULL REFERENCES Products(ProductID) ON DELETE CASCADE,
    ImageURL          VARCHAR(500) NOT NULL,
    DisplayOrder      INT NOT NULL DEFAULT 0,
    IsMain            BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE ProductVariants (
    VariantID         INT IDENTITY(1,1) PRIMARY KEY,
    ProductID         INT NOT NULL REFERENCES Products(ProductID) ON DELETE CASCADE,
    VariantType       VARCHAR(50) NOT NULL,     -- Size, Color, Model, Material, Storage
    VariantValue      VARCHAR(100) NOT NULL,
    SKU               VARCHAR(60) NOT NULL UNIQUE,
    AdditionalPrice   DECIMAL(12,2) NOT NULL DEFAULT 0
);
GO
CREATE INDEX IX_ProductVariants_SKU ON ProductVariants(SKU);
GO

CREATE TABLE Inventory (
    InventoryID       INT IDENTITY(1,1) PRIMARY KEY,
    ProductID         INT NOT NULL REFERENCES Products(ProductID) ON DELETE CASCADE,
    VariantID         INT NULL REFERENCES ProductVariants(VariantID),
    SKU               VARCHAR(60) NOT NULL UNIQUE,
    QuantityAvailable INT NOT NULL DEFAULT 0 CHECK (QuantityAvailable >= 0),
    QuantityReserved  INT NOT NULL DEFAULT 0 CHECK (QuantityReserved >= 0),
    ReorderLevel      INT NOT NULL DEFAULT 5,
    StockStatus       VARCHAR(20) NOT NULL DEFAULT 'In Stock'
                      CHECK (StockStatus IN ('In Stock','Low Stock','Out of Stock','Discontinued')),
    LastUpdated       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Inventory_SKU ON Inventory(SKU);
CREATE INDEX IX_Inventory_Product ON Inventory(ProductID);
GO

/* ============================================================
   5. SHOPPING CART / WISHLIST ITEMS
   ============================================================ */

CREATE TABLE Carts (
    CartID            INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID        INT NOT NULL UNIQUE REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE CartItems (
    CartItemID        INT IDENTITY(1,1) PRIMARY KEY,
    CartID            INT NOT NULL REFERENCES Carts(CartID) ON DELETE CASCADE,
    ProductID         INT NOT NULL REFERENCES Products(ProductID),
    VariantID         INT NULL REFERENCES ProductVariants(VariantID),
    SellerID          INT NOT NULL REFERENCES Sellers(SellerID),
    Quantity          INT NOT NULL CHECK (Quantity > 0),
    UnitPrice         DECIMAL(12,2) NOT NULL,
    AddedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE WishlistItems (
    WishlistItemID    INT IDENTITY(1,1) PRIMARY KEY,
    WishlistID        INT NOT NULL REFERENCES Wishlists(WishlistID) ON DELETE CASCADE,
    ProductID         INT NOT NULL REFERENCES Products(ProductID),
    AddedDate         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Wishlist_Product UNIQUE (WishlistID, ProductID)
);
GO

/* ============================================================
   6. ORDERS
   ============================================================ */

CREATE TABLE Orders (
    OrderID           INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber       VARCHAR(30) NOT NULL UNIQUE,
    CustomerID        INT NOT NULL REFERENCES Customers(CustomerID),
    OrderDate         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    DeliveryAddressID INT NOT NULL REFERENCES CustomerAddresses(AddressID),
    TotalAmount       DECIMAL(12,2) NOT NULL,
    ShippingFee       DECIMAL(12,2) NOT NULL DEFAULT 0,
    Discount          DECIMAL(12,2) NOT NULL DEFAULT 0,
    Tax               DECIMAL(12,2) NOT NULL DEFAULT 0,
    PaymentStatus     VARCHAR(20) NOT NULL DEFAULT 'Pending'
                      CHECK (PaymentStatus IN ('Pending','Processing','Paid','Failed','Refunded')),
    OrderStatus       VARCHAR(30) NOT NULL DEFAULT 'Pending Payment'
                      CHECK (OrderStatus IN (
                        'Pending Payment','Payment Processing','Paid','Processing','Ready to Ship',
                        'Shipped','In Transit','Out for Delivery','Delivered','Completed',
                        'Cancel Requested','Cancelled','Return Requested','Return Approved',
                        'Return Rejected','Returned','Refund Processing','Refunded')),
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Orders_Customer ON Orders(CustomerID);
CREATE INDEX IX_Orders_Status ON Orders(OrderStatus);
GO

CREATE TABLE OrderItems (
    OrderItemID       INT IDENTITY(1,1) PRIMARY KEY,
    OrderID           INT NOT NULL REFERENCES Orders(OrderID) ON DELETE CASCADE,
    ProductID         INT NOT NULL REFERENCES Products(ProductID),
    VariantID         INT NULL REFERENCES ProductVariants(VariantID),
    SellerID          INT NOT NULL REFERENCES Sellers(SellerID),
    Quantity          INT NOT NULL CHECK (Quantity > 0),
    UnitPrice         DECIMAL(12,2) NOT NULL,
    Discount          DECIMAL(12,2) NOT NULL DEFAULT 0,
    Subtotal          DECIMAL(12,2) NOT NULL,
    ItemStatus        VARCHAR(30) NOT NULL DEFAULT 'Pending Payment'
                      CHECK (ItemStatus IN (
                        'Pending Payment','Processing','Ready to Ship','Shipped','In Transit',
                        'Out for Delivery','Delivered','Completed','Cancelled',
                        'Return Requested','Return Approved','Return Rejected','Returned','Refunded'))
);
GO
CREATE INDEX IX_OrderItems_Order ON OrderItems(OrderID);
CREATE INDEX IX_OrderItems_Seller ON OrderItems(SellerID);
GO

CREATE TABLE OrderStatusHistory (
    HistoryID         INT IDENTITY(1,1) PRIMARY KEY,
    OrderID           INT NOT NULL REFERENCES Orders(OrderID) ON DELETE CASCADE,
    Status            VARCHAR(30) NOT NULL,
    ChangedBy         INT NULL REFERENCES Users(UserID),
    Notes             VARCHAR(500),
    ChangedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_OrderStatusHistory_Order ON OrderStatusHistory(OrderID);
GO

/* ============================================================
   7. PAYMENTS & REFUNDS
   ============================================================ */

CREATE TABLE Payments (
    PaymentID         INT IDENTITY(1,1) PRIMARY KEY,
    OrderID           INT NOT NULL REFERENCES Orders(OrderID),
    CustomerID        INT NOT NULL REFERENCES Customers(CustomerID),
    PaymentMethodID   INT NULL REFERENCES PaymentMethods(PaymentMethodID),
    Amount            DECIMAL(12,2) NOT NULL,
    PaymentStatus     VARCHAR(20) NOT NULL DEFAULT 'Pending'
                      CHECK (PaymentStatus IN ('Pending','Processing','Completed','Failed','Refunded')),
    GatewayReference  VARCHAR(255),
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Payments_Order ON Payments(OrderID);
CREATE INDEX IX_Payments_Status ON Payments(PaymentStatus);
GO

CREATE TABLE PaymentTransactions (
    TransactionID     INT IDENTITY(1,1) PRIMARY KEY,
    PaymentID         INT NOT NULL REFERENCES Payments(PaymentID) ON DELETE CASCADE,
    TransactionType   VARCHAR(20) NOT NULL CHECK (TransactionType IN ('Charge','Refund','Adjustment')),
    Amount            DECIMAL(12,2) NOT NULL,
    Status            VARCHAR(20) NOT NULL,
    GatewayReference  VARCHAR(255),
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE Refunds (
    RefundID          INT IDENTITY(1,1) PRIMARY KEY,
    OrderID           INT NOT NULL REFERENCES Orders(OrderID),
    OrderItemID       INT NULL REFERENCES OrderItems(OrderItemID),
    PaymentID         INT NOT NULL REFERENCES Payments(PaymentID),
    CustomerID        INT NOT NULL REFERENCES Customers(CustomerID),
    Amount            DECIMAL(12,2) NOT NULL,
    Reason            VARCHAR(300),
    RefundStatus      VARCHAR(20) NOT NULL DEFAULT 'Requested'
                      CHECK (RefundStatus IN ('Requested','Processing','Approved','Rejected','Completed','Failed')),
    RequestedDate     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ProcessedDate     DATETIME2
);
GO
CREATE INDEX IX_Refunds_Order ON Refunds(OrderID);
GO

/* ============================================================
   8. RETURNS
   ============================================================ */

CREATE TABLE ReturnRequests (
    ReturnID          INT IDENTITY(1,1) PRIMARY KEY,
    OrderItemID       INT NOT NULL REFERENCES OrderItems(OrderItemID),
    CustomerID        INT NOT NULL REFERENCES Customers(CustomerID),
    Reason            VARCHAR(200) NOT NULL,
    Description       VARCHAR(1000),
    ReturnStatus      VARCHAR(20) NOT NULL DEFAULT 'Requested'
                      CHECK (ReturnStatus IN
                        ('Requested','Under Review','Approved','Rejected','Return Shipped',
                         'Received','Refund Processing','Completed')),
    RequestDate       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE ReturnEvidence (
    EvidenceID        INT IDENTITY(1,1) PRIMARY KEY,
    ReturnID          INT NOT NULL REFERENCES ReturnRequests(ReturnID) ON DELETE CASCADE,
    ImageURL          VARCHAR(500) NOT NULL
);
GO

/* ============================================================
   9. SHIPPING & DELIVERY  (see spec section 49 — full CRUD module)
   ============================================================ */

CREATE TABLE Shipments (
    ShipmentID            INT IDENTITY(1,1) PRIMARY KEY,
    OrderID               INT NOT NULL REFERENCES Orders(OrderID),
    OrderItemID           INT NULL REFERENCES OrderItems(OrderItemID),
    CustomerID            INT NOT NULL REFERENCES Customers(CustomerID),
    SellerID              INT NOT NULL REFERENCES Sellers(SellerID),
    ShippingAddressID     INT NOT NULL REFERENCES CustomerAddresses(AddressID),
    ShippingMethod        VARCHAR(50) NOT NULL,
    Courier               VARCHAR(100),
    TrackingNumber        VARCHAR(100),
    ShippingFee           DECIMAL(12,2) NOT NULL DEFAULT 0,
    ShipmentDate          DATETIME2,
    EstimatedDeliveryDate DATE,
    ActualDeliveryDate    DATETIME2,
    DeliveryStatus        VARCHAR(30) NOT NULL DEFAULT 'Preparing'
                          CHECK (DeliveryStatus IN (
                            'Preparing','Shipped','In Transit','Arrived at Facility','Out for Delivery',
                            'Delivered','Delivery Failed','Lost','Damaged','Returned to Seller')),
    DeliveryNotes         VARCHAR(1000),
    FailureReason         VARCHAR(500),
    IsArchived            BIT NOT NULL DEFAULT 0,
    CreatedAt             DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt             DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Shipments_Order ON Shipments(OrderID);
CREATE INDEX IX_Shipments_Seller ON Shipments(SellerID);
CREATE INDEX IX_Shipments_Customer ON Shipments(CustomerID);
CREATE INDEX IX_Shipments_TrackingNumber ON Shipments(TrackingNumber);
CREATE INDEX IX_Shipments_Status ON Shipments(DeliveryStatus);
GO

CREATE TABLE ShipmentTracking (
    TrackingID        INT IDENTITY(1,1) PRIMARY KEY,
    ShipmentID        INT NOT NULL REFERENCES Shipments(ShipmentID) ON DELETE CASCADE,
    TrackingNumber    VARCHAR(100),
    Status            VARCHAR(30) NOT NULL,
    Location          VARCHAR(200),
    Description       VARCHAR(500),
    CourierReference  VARCHAR(255),
    EventTimestamp    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsArchived        BIT NOT NULL DEFAULT 0
);
GO
CREATE INDEX IX_ShipmentTracking_Shipment ON ShipmentTracking(ShipmentID);
GO

CREATE TABLE DeliveryIssues (
    DeliveryIssueID   INT IDENTITY(1,1) PRIMARY KEY,
    ShipmentID        INT NOT NULL REFERENCES Shipments(ShipmentID),
    OrderID           INT NOT NULL REFERENCES Orders(OrderID),
    OrderItemID       INT NULL REFERENCES OrderItems(OrderItemID),
    ReporterID        INT NOT NULL REFERENCES Users(UserID),
    ReporterRole      VARCHAR(20) NOT NULL CHECK (ReporterRole IN ('Customer','Seller')),
    IssueType         VARCHAR(50) NOT NULL,      -- Package not received, Wrong product, Damaged, etc.
    Description       VARCHAR(1000),
    Status            VARCHAR(20) NOT NULL DEFAULT 'Open'
                      CHECK (Status IN ('Open','Under Investigation','Resolved','Reopened','Closed')),
    AdminResponse     VARCHAR(1000),
    Resolution        VARCHAR(1000),
    IsArchived        BIT NOT NULL DEFAULT 0,
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ResolvedDate      DATETIME2
);
GO
CREATE INDEX IX_DeliveryIssues_Shipment ON DeliveryIssues(ShipmentID);
CREATE INDEX IX_DeliveryIssues_Status ON DeliveryIssues(Status);
GO

CREATE TABLE DeliveryIssueEvidence (
    EvidenceID        INT IDENTITY(1,1) PRIMARY KEY,
    DeliveryIssueID   INT NOT NULL REFERENCES DeliveryIssues(DeliveryIssueID) ON DELETE CASCADE,
    ImageURL          VARCHAR(500) NOT NULL
);
GO

/* ============================================================
   10. REVIEWS
   ============================================================ */

CREATE TABLE ProductReviews (
    ReviewID          INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID        INT NOT NULL REFERENCES Customers(CustomerID),
    ProductID         INT NOT NULL REFERENCES Products(ProductID),
    OrderItemID       INT NOT NULL REFERENCES OrderItems(OrderItemID),
    Rating            TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    ReviewText        VARCHAR(2000),
    ReviewStatus      VARCHAR(20) NOT NULL DEFAULT 'Published'
                      CHECK (ReviewStatus IN ('Published','Hidden','Reported')),
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Review_Per_OrderItem UNIQUE (OrderItemID)
);
GO
CREATE INDEX IX_ProductReviews_Product ON ProductReviews(ProductID);
GO

CREATE TABLE ProductReviewImages (
    ImageID           INT IDENTITY(1,1) PRIMARY KEY,
    ReviewID          INT NOT NULL REFERENCES ProductReviews(ReviewID) ON DELETE CASCADE,
    ImageURL          VARCHAR(500) NOT NULL
);
GO

CREATE TABLE SellerReviews (
    SellerReviewID    INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID        INT NOT NULL REFERENCES Customers(CustomerID),
    SellerID          INT NOT NULL REFERENCES Sellers(SellerID),
    OrderID           INT NOT NULL REFERENCES Orders(OrderID),
    ProductQualityRating  TINYINT CHECK (ProductQualityRating BETWEEN 1 AND 5),
    ShippingSpeedRating   TINYINT CHECK (ShippingSpeedRating BETWEEN 1 AND 5),
    CommunicationRating   TINYINT CHECK (CommunicationRating BETWEEN 1 AND 5),
    OverallRating         TINYINT NOT NULL CHECK (OverallRating BETWEEN 1 AND 5),
    ReviewText            VARCHAR(2000),
    CreatedAt             DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_SellerReviews_Seller ON SellerReviews(SellerID);
GO

/* ============================================================
   11. MARKETING
   ============================================================ */

CREATE TABLE Promotions (
    PromotionID       INT IDENTITY(1,1) PRIMARY KEY,
    Name              VARCHAR(150) NOT NULL,
    Description       VARCHAR(500),
    DiscountType      VARCHAR(20) NOT NULL CHECK (DiscountType IN ('Percentage','Fixed')),
    DiscountValue     DECIMAL(12,2) NOT NULL,
    SellerID          INT NULL REFERENCES Sellers(SellerID),
    CategoryID        INT NULL REFERENCES Categories(CategoryID),
    StartDate         DATETIME2 NOT NULL,
    EndDate           DATETIME2 NOT NULL,
    MinimumPurchase   DECIMAL(12,2) DEFAULT 0,
    MaximumDiscount   DECIMAL(12,2),
    UsageLimit        INT,
    Status            VARCHAR(20) NOT NULL DEFAULT 'Active'
                      CHECK (Status IN ('Active','Inactive','Expired')),
    CHECK (EndDate > StartDate)
);
GO

CREATE TABLE Coupons (
    CouponID          INT IDENTITY(1,1) PRIMARY KEY,
    CouponCode        VARCHAR(40) NOT NULL UNIQUE,
    DiscountType      VARCHAR(20) NOT NULL CHECK (DiscountType IN ('Percentage','Fixed')),
    DiscountAmount    DECIMAL(12,2) NOT NULL,
    MinOrderValue     DECIMAL(12,2) DEFAULT 0,
    MaximumDiscount   DECIMAL(12,2),
    SellerID          INT NULL REFERENCES Sellers(SellerID),
    CategoryID        INT NULL REFERENCES Categories(CategoryID),
    StartDate         DATETIME2 NOT NULL,
    ExpiryDate        DATETIME2 NOT NULL,
    UsageLimit        INT,
    CustomerUsageLimit INT NOT NULL DEFAULT 1,
    Status            VARCHAR(20) NOT NULL DEFAULT 'Active'
                      CHECK (Status IN ('Active','Inactive','Expired')),
    CHECK (ExpiryDate > StartDate)
);
GO

CREATE TABLE CouponUsage (
    UsageID           INT IDENTITY(1,1) PRIMARY KEY,
    CouponID          INT NOT NULL REFERENCES Coupons(CouponID),
    CustomerID        INT NOT NULL REFERENCES Customers(CustomerID),
    OrderID           INT NOT NULL REFERENCES Orders(OrderID),
    UsedAt            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE Advertisements (
    AdvertisementID   INT IDENTITY(1,1) PRIMARY KEY,
    SellerID          INT NOT NULL REFERENCES Sellers(SellerID),
    ProductID         INT NOT NULL REFERENCES Products(ProductID),
    Title             VARCHAR(150) NOT NULL,
    BannerImageURL    VARCHAR(500),
    Location          VARCHAR(30) NOT NULL
                      CHECK (Location IN ('Homepage','Search Results','Category Page','Product Recommendation')),
    StartDate         DATETIME2 NOT NULL,
    EndDate           DATETIME2 NOT NULL,
    Budget            DECIMAL(12,2) NOT NULL,
    Status            VARCHAR(20) NOT NULL DEFAULT 'Pending'
                      CHECK (Status IN ('Pending','Approved','Rejected','Active','Ended')),
    CHECK (EndDate > StartDate)
);
GO

CREATE TABLE FlashSales (
    FlashSaleID       INT IDENTITY(1,1) PRIMARY KEY,
    ProductID         INT NOT NULL REFERENCES Products(ProductID),
    OriginalPrice     DECIMAL(12,2) NOT NULL,
    SalePrice         DECIMAL(12,2) NOT NULL CHECK (SalePrice < OriginalPrice),
    StartTime         DATETIME2 NOT NULL,
    EndTime           DATETIME2 NOT NULL,
    StockQuantity     INT NOT NULL CHECK (StockQuantity >= 0),
    MaxQtyPerCustomer INT NOT NULL DEFAULT 1,
    CHECK (EndTime > StartTime)
);
GO

/* ============================================================
   12. COMMUNICATION
   ============================================================ */

CREATE TABLE Notifications (
    NotificationID    INT IDENTITY(1,1) PRIMARY KEY,
    UserID            INT NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    NotificationType  VARCHAR(50) NOT NULL,
    Title             VARCHAR(150) NOT NULL,
    Message           VARCHAR(1000) NOT NULL,
    IsRead            BIT NOT NULL DEFAULT 0,
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Notifications_User ON Notifications(UserID);
GO

CREATE TABLE Messages (
    MessageID         INT IDENTITY(1,1) PRIMARY KEY,
    SenderID          INT NOT NULL REFERENCES Users(UserID),
    ReceiverID        INT NOT NULL REFERENCES Users(UserID),
    ProductID         INT NULL REFERENCES Products(ProductID),
    MessageText       VARCHAR(2000) NOT NULL,
    IsRead            BIT NOT NULL DEFAULT 0,
    SentAt            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Messages_Sender ON Messages(SenderID);
CREATE INDEX IX_Messages_Receiver ON Messages(ReceiverID);
GO

CREATE TABLE SupportTickets (
    TicketID          INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID        INT NOT NULL REFERENCES Customers(CustomerID),
    Subject           VARCHAR(200) NOT NULL,
    Description       VARCHAR(2000) NOT NULL,
    Status            VARCHAR(20) NOT NULL DEFAULT 'Open'
                      CHECK (Status IN ('Open','In Progress','Waiting for Customer','Resolved','Closed')),
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE SupportTicketReplies (
    ReplyID           INT IDENTITY(1,1) PRIMARY KEY,
    TicketID          INT NOT NULL REFERENCES SupportTickets(TicketID) ON DELETE CASCADE,
    UserID            INT NOT NULL REFERENCES Users(UserID),
    Message           VARCHAR(2000) NOT NULL,
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ============================================================
   13. REPORTS
   ============================================================ */

CREATE TABLE Reports (
    ReportID          INT IDENTITY(1,1) PRIMARY KEY,
    ReporterID        INT NOT NULL REFERENCES Users(UserID),
    ReporterRole      VARCHAR(20) NOT NULL CHECK (ReporterRole IN ('Customer','Seller')),
    TargetType        VARCHAR(20) NOT NULL CHECK (TargetType IN ('User','Product','Order')),
    TargetID          INT NOT NULL,
    ReportType        VARCHAR(50) NOT NULL,
    Description       VARCHAR(2000),
    Status            VARCHAR(20) NOT NULL DEFAULT 'Open'
                      CHECK (Status IN ('Open','Under Review','Resolved','Dismissed')),
    AdminResponse     VARCHAR(1000),
    CreatedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE ReportEvidence (
    EvidenceID        INT IDENTITY(1,1) PRIMARY KEY,
    ReportID          INT NOT NULL REFERENCES Reports(ReportID) ON DELETE CASCADE,
    ImageURL          VARCHAR(500) NOT NULL
);
GO

/* ============================================================
   14. SECURITY / AUDIT
   ============================================================ */

CREATE TABLE AuditLogs (
    LogID             BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID            INT NULL REFERENCES Users(UserID),
    UserRole          VARCHAR(20),
    Action            VARCHAR(150) NOT NULL,
    EntityType        VARCHAR(50) NOT NULL,
    EntityID          INT NOT NULL,
    PreviousValue     VARCHAR(1000),
    NewValue          VARCHAR(1000),
    IPAddress         VARCHAR(45),
    DeviceInfo        VARCHAR(255),
    Timestamp         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_AuditLogs_Entity ON AuditLogs(EntityType, EntityID);
CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp);
GO

/* ============================================================
   END OF SCHEMA
   ============================================================ */
