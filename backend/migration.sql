-- 1. Add constraints to order_items
ALTER TABLE order_items
ADD CONSTRAINT positive_quantity CHECK (quantity > 0);

-- 2. Add constraints to orders
ALTER TABLE orders
ADD CONSTRAINT positive_amount CHECK (total_amount > 0);

-- 3. Add UUID to users (backward compatible)
ALTER TABLE users
ADD COLUMN uuid UUID DEFAULT gen_random_uuid();

-- 4. Fill UUID for existing users
UPDATE users SET uuid = gen_random_uuid() WHERE uuid IS NULL;

-- 5. Add unique index for user uuid
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
