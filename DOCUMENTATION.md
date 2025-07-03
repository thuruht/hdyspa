# HDYSPA (Howdy DIY Single Page App) - Comprehensive Documentation

## Project Overview

**HDYSPA** (Howdy DIY Single Page App) is a Cloudflare Worker-based single page application custom-built for Howdy DIY Thrift,
--schedule and hours (when/where to find the community)
- Mission statement area
- Blog-style posts area
- Bulletin board for media, pinned content etc
- Social media integration links/embeds area
\
### Core Requirements
- **Single Page App**: All content managed through one dynamic page
- **Admin Panel**: Integrated admin interface with JWT authentication
- **CRUD Operations**: Full content management for multiple content types
- **Media Management**: Upload/embed handling with R2 storage
- **Content Types**:
  - Posts
  - Hours
  - Mission statement
  - Featured content/bulletin board
- **Rich Text Editor**: Quill.js integration for all content types (posts, mission statement, announcements)
- **Media Embeds**: Support for diverse media in all content areas:
  - Images and graphics (stored in R2)
  - YouTube videos
  - Social media embeds
  - Custom HTML elements when needed
- **Security**: JWT hashed password login with cookies
- **Best Practices**: Following Cloudflare Worker security guidelines

### Technical Stack
- **Platform**: Cloudflare Workers
- **Storage**: 
  - KV (content storage)
  - D1 (structured data)
  - R2 (media files)
- **Frontend**: HTML5, CSS3, JavaScript, Quill.js
- **Backend**: Cloudflare Worker APIs, hono, typescript
- **Authentication**: JWT with bcrypt password hashing
- **Ani
- **Custom Domain**: `howdythrift.farewellcafe.com`
- **Routes**:
  - `farewellcafe.com/howdythrift`
  - `*.farewellcafe.com/howdy`

### Naming Convention

All resources use the `hdyspa` prefix for consistency:

### KV Namespace

- **Binding**: `HDYSPA_CONTENT_KV`
- **ID**: `736487e1516c4f8d8d7f68cb33c449ed`
- **Purpose**: Store dynamic content (posts, hours, mission, etc.)

### R2 Bucket

- **Binding**: `HDYSPA_MEDIA_BUCKET`
- **Name**: `hdyspa-media`
- **Purpose**: Store uploaded images and media files

### D1 Database

- **Binding**: `HDYSPA_DB`
- **Name**: `hdyspa-db`
- **ID**: `c8a6f566-db8a-4d01-99cd-7c9bf4dc09dd`
- **Purpose**: Structured data storage and admin sessions

### Secrets (Secure)

- **JWT_SECRET**: 64-byte base64 encoded secret for JWT signing
- **ADMIN_PASSWORD_HASH**: bcrypt hash of admin password

### Phase 1: Core Backend Functionality (API)

*Objective: Establish a fully functional and secure API for the core content types needed by the community space.*

- [ ] **API Routing**: Finalize the API handler

- [ ] **CRUD for `content_blocks`**:

  - **Implementation Notes**:
    - Cache frequently accessed content (hours, mission) in KV for performance

    - Add sanitization for all rich text input to prevent XSS attacks
    - Use D1 transactions for any multi-step updates
- [ ] **CRUD for `featured_content`**:
  -
  -
- [ ] **CRUD for `posts`**:
=
- [ ] **Media Management**:

### Phase 2: Admin Panel UI

*Objective: Build a straightforward, no-frills interface that volunteers can use without training.*

- [ ] **Admin Shell**:
  - **LOGIN modal**
  -
- [ ] **Content Management UI**:

    - Use a calendar-style interface for hours updates allow media or text too
  - [ ] Integrate Quill.js across all content creation forms (posts, mission, featured content).
  - [ ] Enable consistent media embedding across all content types:
    - [ ] YouTube videos
    - [ ] Image uploads with simple positioning options
    - [ ] Social media embeds when relevant
  - [
  - **Implementation Notes**:
    - Configure Quill.js with a simplified toolbar

    - Implement content validation to prevent common formatting issues

- [ ] **Image Upload UI**: Create a very simple, fool-proof method for adding images to any content type.
  - **Implementation Notes**:
  oftware
    - Create a media library browser for reusing previously uploaded images
    - Provide progress indicators for uploads to prevent confusion

### Phase 3: Public-Facing SPA

- [ ] **Dynamic HTML Generation**:
  - Current store hours
  - Mission statement and community values
  - Upcoming events and announcements
  - Social media connections
 - blog posts


1. **Remaining API Endpoints**:
   - Complete the media upload handler for R2 storage
   - Finalize the GET handler for content blocks

   - Implement search functionality for posts

## Database Schema

### D1 Tables

#### content_blocks
```sql
CREATE TABLE IF NOT EXISTS content_blocks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### posts
```sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published BOOLEAN DEFAULT TRUE
);
```

#### featured_content
```sql
CREATE TABLE IF NOT EXISTS featured_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'image', 'video', 'html'
  content TEXT NOT NULL, -- URL or HTML content
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);
```

#### admin_sessions
```sql
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);
```

### Default Content
The schema includes default content for mission, hours, a welcome post, and a featured item to ensure the app has content on first load.

### Editable Card Titles
Content blocks now include a `title` field, allowing customization of section headings via the admin panel. For example, the "Hours" section can be renamed to "Store Hours" or "July Schedule" as needed.
