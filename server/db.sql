-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100)
);

-- Create Variants Table (Colors and Sizes)
CREATE TABLE IF NOT EXISTS variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    color VARCHAR(50),
    size VARCHAR(20),
    image_url TEXT,
    additional_images TEXT[],
    hex_code VARCHAR(20)
);

-- Create Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    variant_id INTEGER REFERENCES variants(id),
    stock_quantity INTEGER DEFAULT 0
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA --

-- Clear existing data (optional, be careful in production)
TRUNCATE TABLE inventory, variants, products, orders RESTART IDENTITY CASCADE;

-- 1. Relaxed Fit Pant
INSERT INTO products (title, price, description, category) VALUES 
('Relaxed pants', 999.00, 'Comfortable relaxed fit pants available in multiple colors.', 'Pants');

-- Variants for Relaxed Fit Pant
-- Black
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(1, 'Black', 'M', 'images/product-black-pants.png', '#000000'),
(1, 'Black', 'L', 'images/product-black-pants.png', '#000000'),
(1, 'Black', 'XL', 'images/product-black-pants.png', '#000000');
-- Inventory for Black
INSERT INTO inventory (variant_id, stock_quantity) VALUES 
(1, 5), (2, 5), (3, 4);

-- Dark Blue
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(1, 'Dark Blue', 'M', 'images/product-black-pants.png', '#00008B'),
(1, 'Dark Blue', 'L', 'images/product-black-pants.png', '#00008B');
-- Inventory for Dark Blue
INSERT INTO inventory (variant_id, stock_quantity) VALUES 
(4, 5), (5, 2);

-- Beige
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(1, 'Beige', 'M', 'images/product-white-pants.png', '#F5F5DC'),
(1, 'Beige', 'L', 'images/product-white-pants.png', '#F5F5DC');
-- Inventory for Beige
INSERT INTO inventory (variant_id, stock_quantity) VALUES 
(6, 1), (7, 1);

-- Cheeku (Assuming similar to Beige/Brown)
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(1, 'Cheeku', 'M', 'images/product-maroon-pants.png', '#D2B48C'),
(1, 'Cheeku', 'L', 'images/product-maroon-pants.png', '#D2B48C'),
(1, 'Cheeku', 'XL', 'images/product-maroon-pants.png', '#D2B48C');
-- Inventory for Cheeku
INSERT INTO inventory (variant_id, stock_quantity) VALUES 
(8, 2), (9, 1), (10, 2);

-- Red
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(1, 'Red', 'M', 'images/product-maroon-pants.png', '#FF0000'),
(1, 'Red', 'L', 'images/product-maroon-pants.png', '#FF0000'),
(1, 'Red', 'XL', 'images/product-maroon-pants.png', '#FF0000'),
(1, 'Red', 'XXL', 'images/product-maroon-pants.png', '#FF0000');
-- Inventory for Red
INSERT INTO inventory (variant_id, stock_quantity) VALUES 
(11, 4), (12, 1), (13, 1), (14, 1);

-- Maroon
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(1, 'Maroon', 'M', 'images/product-maroon-pants.png', '#800000'),
(1, 'Maroon', 'L', 'images/product-maroon-pants.png', '#800000');
-- Inventory for Maroon
INSERT INTO inventory (variant_id, stock_quantity) VALUES 
(15, 4), (16, 2);


-- 2. Straight Pant
INSERT INTO products (title, price, description, category) VALUES 
('straight fit pant', 899.00, 'Classic straight cut pants for a professional look.', 'Pants');

-- Variants for Straight Pant (Product ID 2)
-- Black
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(2, 'Black', 'L', 'images/product-black-pants.png', '#000000'),
(2, 'Black', 'XL', 'images/product-black-pants.png', '#000000'),
(2, 'Black', 'XXL', 'images/product-black-pants.png', '#000000');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (17, 5), (18, 6), (19, 2);

-- Dark Blue
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(2, 'Dark Blue', 'L', 'images/product-black-pants.png', '#00008B'),
(2, 'Dark Blue', 'XL', 'images/product-black-pants.png', '#00008B'),
(2, 'Dark Blue', 'XXL', 'images/product-black-pants.png', '#00008B');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (20, 3), (21, 2), (22, 1);

-- Beige
INSERT INTO variants (product_id, color, size, image_url, additional_images, hex_code) VALUES 
(2, 'Beige', 'L', 'images/product-white-pants.png', ARRAY['images/straight-pant-beige-2.jpg', 'images/straight-pant-beige-3.jpg'], '#F5F5DC'),
(2, 'Beige', 'XL', 'images/product-white-pants.png', ARRAY['images/straight-pant-beige-2.jpg', 'images/straight-pant-beige-3.jpg'], '#F5F5DC'),
(2, 'Beige', 'XXL', 'images/product-white-pants.png', ARRAY['images/straight-pant-beige-2.jpg', 'images/straight-pant-beige-3.jpg'], '#F5F5DC');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (23, 2), (24, 2), (25, 2);

-- Red
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(2, 'Red', 'L', 'images/product-maroon-pants.png', '#FF0000'),
(2, 'Red', 'XL', 'images/product-maroon-pants.png', '#FF0000'),
(2, 'Red', 'XXL', 'images/product-maroon-pants.png', '#FF0000');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (26, 3), (27, 3), (28, 5);

-- White
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(2, 'White', 'L', 'images/product-white-pants.png', '#FFFFFF'),
(2, 'White', 'XL', 'images/product-white-pants.png', '#FFFFFF'),
(2, 'White', 'XXL', 'images/product-white-pants.png', '#FFFFFF');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (29, 3), (30, 2), (31, 2);

-- Turquoise
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(2, 'Turquoise', 'S', 'images/product-white-pants.png', '#40E0D0'),
(2, 'Turquoise', 'L', 'images/product-white-pants.png', '#40E0D0'),
(2, 'Turquoise', 'XL', 'images/product-white-pants.png', '#40E0D0'),
(2, 'Turquoise', 'XXL', 'images/product-white-pants.png', '#40E0D0');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (32, 1), (33, 3), (34, 1), (35, 2);


-- 3. Premium Kurti pants
INSERT INTO products (title, price, description, category) VALUES 
('kurti legging', 599.00, 'High-quality pants designed to pair perfectly with Kurtis.', 'Pants');

-- Variants for Premium Kurti Pants (Product ID 3)
-- Black
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(3, 'Black', 'M', 'images/product-black-pants.png', '#000000'),
(3, 'Black', 'L', 'images/product-black-pants.png', '#000000');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (36, 3), (37, 3);

-- Dark Blue
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(3, 'Dark Blue', 'S', 'images/product-black-pants.png', '#00008B'),
(3, 'Dark Blue', 'M', 'images/product-black-pants.png', '#00008B'),
(3, 'Dark Blue', 'L', 'images/product-black-pants.png', '#00008B');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (38, 2), (39, 1), (40, 3);

-- Beige
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(3, 'Beige', 'M', 'images/product-white-pants.png', '#F5F5DC'),
(3, 'Beige', 'L', 'images/product-white-pants.png', '#F5F5DC');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (41, 4), (42, 2);

-- Red
INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(3, 'Red', 'S', 'images/product-maroon-pants.png', '#FF0000'),
(3, 'Red', 'M', 'images/product-maroon-pants.png', '#FF0000'),
(3, 'Red', 'L', 'images/product-maroon-pants.png', '#FF0000');
INSERT INTO inventory (variant_id, stock_quantity) VALUES (43, 4), (44, 8), (45, 3);
