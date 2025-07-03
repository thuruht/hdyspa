-- HDYSPA Database Migration
-- This file contains non-destructive migrations to update the database schema
-- without dropping existing tables or losing data

-- This is a safer approach than reset.sql for production environments

-- Add title column if it doesn't exist
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS title TEXT;

-- Add active column if it doesn't exist
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Update existing records with default titles if they don't have one
UPDATE content_blocks SET title = 'Our Mission' WHERE id = 'mission' AND (title IS NULL OR title = '');
UPDATE content_blocks SET title = 'Hours' WHERE id = 'hours' AND (title IS NULL OR title = '');

-- Ensure all records have active set
UPDATE content_blocks SET active = TRUE WHERE active IS NULL;

-- Make sure all expected tables exist
CREATE TABLE IF NOT EXISTS content_blocks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS featured_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'image', 'video', 'html'
    content TEXT NOT NULL, -- URL or HTML content
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

-- Ensure default content exists (will not overwrite existing records due to OR IGNORE)
INSERT OR IGNORE INTO content_blocks (id, type, title, content) VALUES 
    ('mission', 'mission', 'Our Mission', '<p>Curated, pop-up thrift store for punks and queers</p>'),
    ('hours', 'hours', 'Hours', '<ul><li><strong>Monday - Friday:</strong> 10am - 6pm</li><li><strong>Saturday:</strong> 11am - 5pm</li><li><strong>Sunday:</strong> Closed</li></ul><p><em>Holiday hours may vary. Check our Instagram for updates!</em></p>');

-- Only add welcome post if no posts exist
INSERT OR IGNORE INTO posts (id, title, content) VALUES 
    (1, 'Welcome to Howdy DIY Thrift!', '<p>We''re excited to announce the opening of our community thrift space! Come explore our collection of unique second-hand treasures and join our DIY workshops.</p><p>Located at <strong>6523 Stadium Drive, Kansas City, Missouri</strong>, we''re your neighborhood destination for creative reuse and sustainable living.</p>');
