-- Reset database
DROP TABLE IF EXISTS content_blocks;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS featured_content;
DROP TABLE IF EXISTS admin_sessions;

-- Create tables with correct schema
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
  type TEXT NOT NULL,
  content TEXT NOT NULL,
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

-- Insert default content
INSERT INTO content_blocks (id, type, title, content) VALUES 
  ('mission', 'mission', 'Our Mission', '<p>Curated, pop-up thrift store for punks and queers</p>'),
  ('hours', 'hours', 'Hours', '<ul><li><strong>Monday - Friday:</strong> 10am - 6pm</li><li><strong>Saturday:</strong> 11am - 5pm</li><li><strong>Sunday:</strong> Closed</li></ul><p><em>Holiday hours may vary. Check our Instagram for updates!</em></p>');

-- Insert a welcome post
INSERT INTO posts (title, content) VALUES 
  ('Welcome to Howdy DIY Thrift!', '<p>We''re excited to announce the opening of our community thrift space! Come explore our collection of unique second-hand treasures and join our DIY workshops.</p><p>Located at <strong>6523 Stadium Drive, Kansas City, Missouri</strong>, we''re your neighborhood destination for creative reuse and sustainable living.</p>');

-- Insert default featured content
INSERT INTO featured_content (type, content, caption, order_index) VALUES 
  ('image', './hyqr.png', 'Follow us on Instagram @howdydiythrift!', 1);
