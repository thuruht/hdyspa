-- HDYSPA Database Schema
-- Initialize the database tables for the Howdy DIY Thrift Single Page App

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT TRUE
);

-- Content blocks table (for mission, hours, etc.)
CREATE TABLE IF NOT EXISTS content_blocks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Featured content table
CREATE TABLE IF NOT EXISTS featured_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'image', 'video', 'html'
    content TEXT NOT NULL, -- URL or HTML content
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

-- Insert default content
INSERT OR IGNORE INTO content_blocks (id, type, content) VALUES 
    ('mission', 'mission', '<h3>Our Mission</h3><p>To provide a space for creative reuse and community building through DIY projects and affordable second-hand goods. We believe in giving new life to pre-loved items while fostering creativity and sustainability in our community.</p>'),
    ('hours', 'hours', '<ul><li><strong>Monday - Friday:</strong> 10am - 6pm</li><li><strong>Saturday:</strong> 11am - 5pm</li><li><strong>Sunday:</strong> Closed</li></ul><p><em>Holiday hours may vary. Check our Instagram for updates!</em></p>');

-- Insert a welcome post
INSERT OR IGNORE INTO posts (id, title, content, created_at) VALUES 
    (1, 'Welcome to Howdy DIY Thrift!', '<p>We''re excited to announce the opening of our community thrift space! Come explore our collection of unique second-hand treasures and join our DIY workshops.</p><p>Located at <strong>6523 Stadium Drive, Kansas City, Missouri</strong>, we''re your neighborhood destination for creative reuse and sustainable living.</p>', '2025-07-02 10:00:00');

-- Insert default featured content
INSERT OR IGNORE INTO featured_content (id, type, content, caption, order_index) VALUES 
    (1, 'image', './hyqr.png', 'Follow us on Instagram @howdydiythrift!', 1);
