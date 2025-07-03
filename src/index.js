/**
 * HDYSPA (Howdy DIY Single Page App) - Production Cloudflare Worker
 * 
 * This worker handles:
 * - Static file serving for the SPA
 * - REST API for content management
 * - JWT authentication for admin panel
 * - Media uploads to R2
 * - Content storage in KV and D1
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign, verify } from 'hono/jwt';
import { getCookie, setCookie } from 'hono/cookie';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: ['https://hdyspa.jojo-829.workers.dev', 'https://howdythrift.farewellcafe.com', 'https://farewellcafe.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Utility functions for password hashing (using Web Crypto API)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

// Content sanitization
function sanitizeContent(content) {
  // Basic XSS prevention - in production, use a more robust library
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Database initialization
async function initializeDatabase(env) {
  const schema = `
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS content_blocks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  `;

  const statements = schema.split(';').filter(stmt => stmt.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await env.HDYSPA_DB.prepare(statement).run();
    }
  }
}

// Initialize default content
async function initializeDefaultContent(env) {
  // Check if mission statement exists
  const mission = await env.HDYSPA_DB.prepare(
    'SELECT * FROM content_blocks WHERE id = ?'
  ).bind('mission').first();

  if (!mission) {
    await env.HDYSPA_DB.prepare(
      'INSERT INTO content_blocks (id, type, title, content) VALUES (?, ?, ?, ?)'
    ).bind('mission', 'mission', 'Our Mission', '<p>Curated, pop-up thrift store for punks and queers</p>').run();
  }

  // Check if hours exist
  const hours = await env.HDYSPA_DB.prepare(
    'SELECT * FROM content_blocks WHERE id = ?'
  ).bind('hours').first();

  if (!hours) {
    await env.HDYSPA_DB.prepare(
      'INSERT INTO content_blocks (id, type, title, content, image_url) VALUES (?, ?, ?, ?, ?)'
    ).bind('hours', 'hours', 'Hours', '<ul><li>Monday - Friday: 10am - 6pm</li><li>Saturday: 11am - 5pm</li><li>Sunday: Closed</li></ul>', './mxdiyjuly.png').run();
  }
}

// API Routes

// Authentication endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const { password } = await c.req.json();
    const env = c.env;

    if (!password) {
      return c.json({ error: 'Password required' }, 400);
    }

    // Verify password against stored hash
    const isValid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
    
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Create JWT token
    const payload = {
      admin: true,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    };

    const token = await sign(payload, env.JWT_SECRET);

    // Set secure cookie
    setCookie(c, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return c.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (c) => {
  setCookie(c, 'auth-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 0,
    path: '/'
  });
  return c.json({ success: true });
});

// Middleware for protected routes
const requireAuth = async (c, next) => {
  const token = getCookie(c, 'auth-token') || c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    if (!payload.admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Content Management API

// Get all posts
app.get('/api/posts', async (c) => {
  try {
    const posts = await c.env.HDYSPA_DB.prepare(
      'SELECT * FROM posts WHERE published = TRUE ORDER BY created_at DESC'
    ).all();
    
    return c.json({ posts: posts.results || [] });
  } catch (error) {
    console.error('Get posts error:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// Get single post
app.get('/api/posts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const post = await c.env.HDYSPA_DB.prepare(
      'SELECT * FROM posts WHERE id = ? AND published = TRUE'
    ).bind(id).first();
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    return c.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    return c.json({ error: 'Failed to fetch post' }, 500);
  }
});

// Create post (protected)
app.post('/api/posts', requireAuth, async (c) => {
  try {
    const { title, content } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: 'Title and content required' }, 400);
    }

    const sanitizedContent = sanitizeContent(content);
    
    const result = await c.env.HDYSPA_DB.prepare(
      'INSERT INTO posts (title, content) VALUES (?, ?) RETURNING *'
    ).bind(title, sanitizedContent).first();
    
    return c.json({ post: result }, 201);
  } catch (error) {
    console.error('Create post error:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// Update post (protected)
app.put('/api/posts/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { title, content, published } = await c.req.json();
    
    const sanitizedContent = sanitizeContent(content);
    
    const result = await c.env.HDYSPA_DB.prepare(
      'UPDATE posts SET title = ?, content = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
    ).bind(title, sanitizedContent, published ?? true, id).first();
    
    if (!result) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    return c.json({ post: result });
  } catch (error) {
    console.error('Update post error:', error);
    return c.json({ error: 'Failed to update post' }, 500);
  }
});

// Delete post (protected)
app.delete('/api/posts/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    
    const result = await c.env.HDYSPA_DB.prepare(
      'DELETE FROM posts WHERE id = ?'
    ).bind(id).run();
    
    if (result.changes === 0) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});

// Get content blocks (mission, hours, etc.)
app.get('/api/content/:type', async (c) => {
  try {
    const type = c.req.param('type');
    const content = await c.env.HDYSPA_DB.prepare(
      'SELECT * FROM content_blocks WHERE id = ?'
    ).bind(type).first();
    
    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }
    
    // Include image_url in the response if available
    const imageUrl = content.image_url ? `https://howdythrift.farewellcafe.com/media/${content.image_url}` : null;
    
    return c.json({ content: { ...content, image_url: imageUrl } });
  } catch (error) {
    console.error('Get content error:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Update content blocks (protected)
app.put('/api/content/:type', requireAuth, async (c) => {
  try {
    const type = c.req.param('type');
    const { content, title, image_url } = await c.req.json();
    
    if (!content) {
      return c.json({ error: 'Content required' }, 400);
    }

    const sanitizedContent = sanitizeContent(content);
    
    const result = await c.env.HDYSPA_DB.prepare(
      'INSERT OR REPLACE INTO content_blocks (id, type, title, content, image_url, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING *'
    ).bind(type, type, title || null, sanitizedContent, image_url || null).first();
    
    return c.json({ content: result });
  } catch (error) {
    console.error('Update content error:', error);
    return c.json({ error: 'Failed to update content' }, 500);
  }
});

// Get featured content
app.get('/api/featured', async (c) => {
  try {
    const featured = await c.env.HDYSPA_DB.prepare(
      'SELECT * FROM featured_content WHERE active = TRUE ORDER BY order_index ASC, created_at DESC'
    ).all();
    
    return c.json({ featured: featured.results || [] });
  } catch (error) {
    console.error('Get featured error:', error);
    return c.json({ error: 'Failed to fetch featured content' }, 500);
  }
});

// Create featured content (protected)
app.post('/api/featured', requireAuth, async (c) => {
  try {
    const { type, content, caption, order_index } = await c.req.json();
    
    if (!type || !content) {
      return c.json({ error: 'Type and content required' }, 400);
    }
    
    const result = await c.env.HDYSPA_DB.prepare(
      'INSERT INTO featured_content (type, content, caption, order_index) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(type, content, caption || '', order_index || 0).first();
    
    return c.json({ featured: result }, 201);
  } catch (error) {
    console.error('Create featured error:', error);
    return c.json({ error: 'Failed to create featured content' }, 500);
  }
});

// Update featured content (protected)
app.put('/api/featured/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { type, content, caption, order_index, active } = await c.req.json();
    
    const result = await c.env.HDYSPA_DB.prepare(
      'UPDATE featured_content SET type = ?, content = ?, caption = ?, order_index = ?, active = ? WHERE id = ? RETURNING *'
    ).bind(type, content, caption, order_index, active ?? true, id).first();
    
    if (!result) {
      return c.json({ error: 'Featured content not found' }, 404);
    }
    
    return c.json({ featured: result });
  } catch (error) {
    console.error('Update featured error:', error);
    return c.json({ error: 'Failed to update featured content' }, 500);
  }
});

// Delete featured content (protected)
app.delete('/api/featured/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    
    const result = await c.env.HDYSPA_DB.prepare(
      'DELETE FROM featured_content WHERE id = ?'
    ).bind(id).run();
    
    if (result.changes === 0) {
      return c.json({ error: 'Featured content not found' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete featured error:', error);
    return c.json({ error: 'Failed to delete featured content' }, 500);
  }
});

// Media upload endpoint (protected)
app.post('/api/media/upload', requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload to R2
    await c.env.HDYSPA_MEDIA_BUCKET.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Make sure to return a fully qualified URL that will work from any domain
    const url = `https://howdythrift.farewellcafe.com/media/${filename}`;
    console.log('Media uploaded, URL:', url);
    
    return c.json({ url, filename }, 201);
  } catch (error) {
    console.error('Media upload error:', error);
    return c.json({ error: 'Failed to upload media' }, 500);
  }
});

// Serve media files from R2
app.get('/media/*', async (c) => {
  try {
    const key = c.req.param('*');
    const object = await c.env.HDYSPA_MEDIA_BUCKET.get(key);
    
    if (!object) {
      return c.notFound();
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000');

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error('Media serve error:', error);
    return c.notFound();
  }
});

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Static file serving (catch-all for SPA)
app.get('*', async (c) => {
  try {
    const url = new URL(c.req.url);
    let pathname = url.pathname;

    // Default to index.html for SPA routing
    if (pathname === '/' || !pathname.includes('.')) {
      pathname = '/index.html';
    }

    // Try to serve static files if ASSETS is available
    if (c.env.ASSETS) {
      const response = await c.env.ASSETS.fetch(c.req.url);
      
      if (response.status === 404 && !pathname.includes('.')) {
        // Fallback to index.html for client-side routing
        return await c.env.ASSETS.fetch(new URL('/index.html', c.req.url).toString());
      }

      return response;
    } else {
      // Fallback: return a basic HTML response for development
      if (pathname === '/index.html' || pathname === '/') {
        return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <title>HOWDY DIY THRIFT</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="utf-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      background: #000; 
      color: #fff; 
      text-align: center; 
      padding: 2rem; 
    }
    .error { color: #ff6b6b; }
    .success { color: #51cf66; }
  </style>
</head>
<body>
  <h1>HOWDY DIY THRIFT API</h1>
  <p class="success">✅ Worker is running successfully!</p>
  <p>API endpoints are available:</p>
  <ul style="text-align: left; display: inline-block;">
    <li>GET /api/health - Health check</li>
    <li>GET /api/posts - Get posts</li>
    <li>GET /api/content/mission - Get mission</li>
    <li>GET /api/content/hours - Get hours</li>
    <li>GET /api/featured - Get featured content</li>
  </ul>
  <p><strong>Note:</strong> For full SPA, use Cloudflare Pages or configure static assets.</p>
</body>
</html>
        `);
      }
      return c.notFound();
    }
  } catch (error) {
    console.error('Static serve error:', error);
    return c.text('Worker Error: ' + error.message, 500);
  }
});

// Export the worker
export default {
  async fetch(request, env, ctx) {
    // Initialize database on first request
    try {
      await initializeDatabase(env);
      await initializeDefaultContent(env);
    } catch (error) {
      console.error('Database initialization error:', error);
    }

    return app.fetch(request, env, ctx);
  },
};
