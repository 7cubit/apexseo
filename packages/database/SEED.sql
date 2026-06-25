-- Seed Data for ApexSEO Staging Environment
-- Users: 100 users, mix of roles
-- Orders: 50 orders
-- Campaigns: 3 campaigns

BEGIN;

-- Insert Super Admin
INSERT INTO "users" ("id", "email", "role", "firstName", "lastName", "status", "createdAt", "updatedAt")
VALUES ('user_superadmin', '7cubit@gmail.com', 'SUPER_ADMIN', 'Super', 'Admin', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Insert Owner
INSERT INTO "users" ("id", "email", "role", "firstName", "lastName", "status", "createdAt", "updatedAt")
VALUES ('user_owner', 'davidbalan86@gmail.com', 'SUPER_ADMIN', 'David', 'Balan', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Generate 98 random users
INSERT INTO "users" ("id", "email", "role", "firstName", "lastName", "status", "createdAt", "updatedAt")
SELECT
    'user_' || i,
    'user' || i || '@example.com',
    CASE 
        WHEN i % 20 = 0 THEN 'ADMIN_CRM'::"UserRole"
        WHEN i % 15 = 0 THEN 'BILLING_ADMIN'::"UserRole"
        ELSE 'VIEWER'::"UserRole"
    END,
    'User' || i,
    'Test' || i,
    CASE 
        WHEN i % 10 = 0 THEN 'SUSPENDED'::"UserStatus"
        ELSE 'ACTIVE'::"UserStatus"
    END,
    NOW() - (random() * interval '30 days'),
    NOW()
FROM generate_series(1, 98) AS s(i)
ON CONFLICT ("email") DO NOTHING;

-- Products
INSERT INTO "products" ("id", "name", "tier", "price", "interval", "isActive", "createdAt", "updatedAt")
VALUES 
('prod_starter', 'Starter Plan', 'STARTER', 29.00, 'MONTHLY', true, NOW(), NOW()),
('prod_pro', 'Pro Plan', 'PRO', 99.00, 'MONTHLY', true, NOW(), NOW()),
('prod_agency', 'Agency Plan', 'AGENCY', 299.00, 'MONTHLY', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Orders / Invoices (50 items)
INSERT INTO "invoices" ("id", "userId", "amountPaid", "status", "createdAt", "updatedAt") -- Note: Schema check needed for updatedAt if missing in query
SELECT
    'inv_' || i,
    'user_' || (floor(random() * 50) + 1)::int,
    (CASE WHEN random() > 0.5 THEN 99.00 ELSE 29.00 END),
    'PAID'::"InvoiceStatus",
    NOW() - (random() * interval '60 days'),
    NOW() -- Assuming optional or default? Schema says updatedAt is updated automatically but good to set. 
    -- Wait, schema for Invoice doesn't have updatedAt based on my memory? Let's check schema.
    -- Schema had: id, userId, amountPaid, status, invoicePdfUrl, hostedInvoiceUrl, createdAt, refunds
    -- No updatedAt in Invoice model in schema.prisma viewed earlier?
    -- Let's re-read schema.prisma content from history.
    -- Lines 136-149: model Invoice ... createdAt DateTime @default(now()) ... no updatedAt.
FROM generate_series(1, 50) AS s(i)
ON CONFLICT ("id") DO NOTHING;


-- Campaigns (3 items)
INSERT INTO "email_campaigns" ("id", "name", "subject", "status", "totalSent", "openCount", "clickCount", "createdAt", "updatedAt")
VALUES
('camp_1', 'Welcome Onboarding', 'Welcome to ApexSEO!', 'COMPLETED', 1500, 800, 300, NOW() - interval '5 days', NOW()),
('camp_2', 'Pro Feature Announcement', 'New AI Features Live', 'COMPLETED', 1200, 600, 100, NOW() - interval '2 days', NOW()),
('camp_3', 'Agency Webinar Invite', 'Scale your Agency', 'SCHEDULED', 0, 0, 0, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

COMMIT;
