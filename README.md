# HDYSPA - Howdy DIY Thrift Single Page App

A production-ready single page application built with Cloudflare Workers, designed for the Howdy DIY Thrift community space.

## Features

- 🏪 **Dynamic Content Management**: Posts, mission statement, hours, and featured content
- 🔐 **Secure Admin Panel**: JWT-based authentication with rich text editing
- 📱 **Responsive Design**: Works perfectly on mobile and desktop
- ⚡ **Fast & Reliable**: Powered by Cloudflare's global network
- 🎨 **Rich Text Editing**: Quill.js integration for beautiful content creation
- 📁 **Media Management**: R2 storage for images and files
- 🗄️ **Database**: D1 for structured data, KV for caching

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript, Quill.js
- **Backend**: Cloudflare Workers with Hono framework
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 for media files
- **Cache**: Cloudflare KV for fast content delivery
- **Authentication**: JWT with bcrypt password hashing

## Quick Start

### Prerequisites

1. Node.js (v18 or later)
2. Cloudflare account
3. Wrangler CLI installed globally: `npm install -g wrangler`

### Deployment

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd hdyspa
   npm install
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Deploy automatically:**
   ```bash
   ./deploy.sh
   ```

   Or deploy manually:
   ```bash
   # Initialize database
   wrangler d1 execute hdyspa-db --file=./sql/schema.sql
   
   # Set secrets
   wrangler secret put JWT_SECRET
   wrangler secret put ADMIN_PASSWORD_HASH
   
   # Deploy
   wrangler deploy
   ```

### Configuration

The app uses the following Cloudflare resources (configured in `wrangler.jsonc`):

- **KV Namespace**: `HDYSPA_CONTENT_KV` for content caching
- **R2 Bucket**: `hdyspa-media` for media storage
- **D1 Database**: `hdyspa-db` for structured data
- **Secrets**: `JWT_SECRET` and `ADMIN_PASSWORD_HASH`

## Usage

### Public Interface

The public-facing site displays:
- **Mission Statement**: Community values and purpose
- **Posts**: Blog-style announcements and updates
- **Featured Content**: Images, videos, and special announcements
- **Hours**: Current operating hours
- **Social Media**: Instagram QR code and links

### Admin Panel

Access the admin panel by clicking "Admin Login" and entering your password.

#### Content Management

1. **Mission Statement**: Edit the main community mission
2. **Hours**: Update operating hours and special notices
3. **Posts**: Create, edit, and delete blog posts
4. **Featured Content**: Add images, videos, or HTML content

#### Media Upload

- Upload images and files through the admin panel
- Files are stored in Cloudflare R2
- Automatic URL generation for easy linking

## API Endpoints

### Public Endpoints

- `GET /api/posts` - Get all published posts
- `GET /api/posts/:id` - Get single post
- `GET /api/content/:type` - Get content block (mission, hours)
- `GET /api/featured` - Get featured content
- `GET /media/*` - Serve media files from R2

### Admin Endpoints (Authentication Required)

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `PUT /api/content/:type` - Update content block
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/featured` - Add featured content
- `DELETE /api/featured/:id` - Delete featured content
- `POST /api/media/upload` - Upload media file

## Development

### Local Development

1. **Start development server:**
   ```bash
   wrangler dev
   ```

2. **View logs:**
   ```bash
   wrangler tail
   ```

### Database Management

1. **Run migrations:**
   ```bash
   wrangler d1 execute hdyspa-db --file=./sql/schema.sql
   ```

2. **Query database:**
   ```bash
   wrangler d1 execute hdyspa-db --command="SELECT * FROM posts;"
   ```

### Secret Management

```bash
# Set JWT secret (generate with: openssl rand -base64 64)
wrangler secret put JWT_SECRET

# Set admin password hash (generate with: echo -n "yourpassword" | openssl dgst -sha256)
wrangler secret put ADMIN_PASSWORD_HASH
```

## Security

- **Authentication**: JWT tokens with HTTP-only cookies
- **Password Hashing**: SHA-256 for admin passwords
- **Content Sanitization**: XSS prevention on all user inputs
- **CORS**: Configured for specific domains only
- **HTTPS Only**: All traffic encrypted

## Monitoring

- **Health Check**: `GET /api/health`
- **Logs**: Use `wrangler tail` for real-time monitoring
- **Analytics**: Available through Cloudflare dashboard

## Customization

### Styling

- Edit `ccssss.css` for visual customization
- CSS variables for colors: `--redd`, `--blew`
- Responsive design with mobile-first approach

### Content Types

Add new content types by:
1. Adding API endpoints in `src/index.js`
2. Creating database tables in `sql/schema.sql`
3. Adding admin UI in `admin.js`
4. Updating frontend display in `script.js`

## Troubleshooting

### Common Issues

1. **Login fails**: Check `ADMIN_PASSWORD_HASH` secret is set correctly
2. **Images don't load**: Verify R2 bucket permissions and CORS settings
3. **Database errors**: Run schema initialization: `wrangler d1 execute hdyspa-db --file=./sql/schema.sql`

### Debug Commands

```bash
# Check worker status
wrangler dev --local

# View real-time logs
wrangler tail

# Check secrets
wrangler secret list

# Test database connection
wrangler d1 execute hdyspa-db --command="SELECT 1;"
```

## Support

For issues and questions:
1. Check the logs with `wrangler tail`
2. Verify all secrets are set correctly
3. Ensure database is initialized
4. Check Cloudflare dashboard for resource status

## License

MIT License - See LICENSE file for details.

---

Built with ❤️ for the Howdy DIY Thrift community in Kansas City, Missouri.
