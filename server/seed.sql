-- Clear existing data
TRUNCATE TABLE inventory, variants, products, orders RESTART IDENTITY CASCADE;

-- --- KURTIS ---

-- 1. Silk Blend Cream Kurti
INSERT INTO products (title, price, description, category) 
VALUES ('Silk Blend Cream Kurti', 69.99, 'Elegant silk blend kurti in cream color, perfect for festive occasions.', 'Kurtis');

INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(1, 'Cream', 'S', 'images/hero-white-pants.jpg', '#FFFDD0'),
(1, 'Cream', 'M', 'images/hero-white-pants.jpg', '#FFFDD0'),
(1, 'Cream', 'L', 'images/hero-white-pants.jpg', '#FFFDD0'),
(1, 'Red', 'S', 'images/hero-white-pants.jpg', '#FF0000'),
(1, 'Red', 'M', 'images/hero-white-pants.jpg', '#FF0000');

-- 2. Casual White Tunic
INSERT INTO products (title, price, description, category) 
VALUES ('Casual White Tunic', 39.99, 'Lightweight and comfortable white tunic for daily wear.', 'Kurtis');

INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(2, 'White', 'S', 'images/hero-black-pants.jpg', '#FFFFFF'),
(2, 'White', 'M', 'images/hero-black-pants.jpg', '#FFFFFF'),
(2, 'White', 'L', 'images/hero-black-pants.jpg', '#FFFFFF');

-- 3. Embroidered Festive Kurti
INSERT INTO products (title, price, description, category) 
VALUES ('Embroidered Festive Kurti', 89.99, 'Intricate embroidery work on a premium fabric base.', 'Kurtis');

INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(3, 'Pink', 'S', 'images/hero-white-pants.jpg', '#FFC0CB'),
(3, 'Pink', 'M', 'images/hero-white-pants.jpg', '#FFC0CB'),
(3, 'Blue', 'M', 'images/hero-white-pants.jpg', '#0000FF');

-- 4. Modern Print Kurti
INSERT INTO products (title, price, description, category) 
VALUES ('Modern Print Kurti', 49.99, 'Contemporary prints for the modern woman.', 'Kurtis');

INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(4, 'Multi', 'S', 'images/hero-black-pants.jpg', '#808080'),
(4, 'Multi', 'M', 'images/hero-black-pants.jpg', '#808080'),
(4, 'Multi', 'L', 'images/hero-black-pants.jpg', '#808080');


-- --- PANTS ---

-- 5. Classic Black Trousers
INSERT INTO products (title, price, description, category) 
VALUES ('Classic Black Trousers', 49.99, 'Timeless black trousers that go with everything.', 'Pants');

INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(5, 'Black', 'S', 'images/product-black-pants.png', '#000000'),
(5, 'Black', 'M', 'images/product-black-pants.png', '#000000'),
(5, 'Black', 'L', 'images/product-black-pants.png', '#000000'),
(5, 'Black', 'XL', 'images/product-black-pants.png', '#000000');

-- 6. Elegant White Pants
INSERT INTO products (title, price, description, category) 
VALUES ('Elegant White Pants', 54.99, 'Sophisticated white pants for a polished look.', 'Pants');

INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(6, 'White', 'S', 'images/product-white-pants.png', '#FFFFFF'),
(6, 'White', 'M', 'images/product-white-pants.png', '#FFFFFF'),
(6, 'White', 'L', 'images/product-white-pants.png', '#FFFFFF');

-- 7. Maroon Comfort Pants
INSERT INTO products (title, price, description, category) 
VALUES ('Maroon Comfort Pants', 45.99, 'Soft and stretchy fabric for maximum comfort.', 'Pants');

INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(7, 'Maroon', 'S', 'images/product-maroon-pants.png', '#800000'),
(7, 'Maroon', 'M', 'images/product-maroon-pants.png', '#800000'),
(7, 'Maroon', 'L', 'images/product-maroon-pants.png', '#800000');

-- 8. Slim Fit Black Pants
INSERT INTO products (title, price, description, category) 
VALUES ('Slim Fit Black Pants', 59.99, 'Tailored slim fit pants for a sharp silhouette.', 'Pants');

INSERT INTO variants (product_id, color, size, image_url, hex_code) VALUES 
(8, 'Black', '28', 'images/product-black-pants.png', '#000000'),
(8, 'Black', '30', 'images/product-black-pants.png', '#000000'),
(8, 'Black', '32', 'images/product-black-pants.png', '#000000');


-- --- INVENTORY ---
-- Insert inventory for all variants (default 50 stock)
INSERT INTO inventory (variant_id, stock_quantity)
SELECT id, 50 FROM variants;
