# Recommended Fixes for script.js

This document outlines recommended code fixes for script.js. No actual changes have been made to your files - these are just suggestions for how you might fix the issues identified in the analysis.

## 1. Critical Syntax Error Fix

The most critical issue is the incomplete function declaration causing a syntax error. You can fix this by:

1. Removing the second incomplete `displayEventsPopup` function (lines 1068-1139)
2. Making sure all braces are properly matched throughout the file

## 2. Duplicate Code Block Fixes

You have several duplicate code blocks that should be removed:

1. Remove the duplicate `contentApi` object (second declaration around lines 181-229)
2. Remove the duplicate `loadContent` function (second declaration around lines 231-273)
3. Remove the duplicate event listeners and function call (lines 275-283)

## 3. Sample Implementation

Here's how a fixed version of the problematic sections might look:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // --------------------------
  // DOM Elements
  // --------------------------
  const howdySpan = document.querySelector('.header-title .sulk'); 
  const farewellSpan = document.querySelector('.header-title .span2'); 
  const body = document.querySelector('body');
  const title = document.querySelector('title');
  const address = document.getElementById('address');

  // Content containers
  const missionContainer = document.getElementById('mission-content');
  const postsContainer = document.getElementById('posts-container');
  const featuredContainer = document.getElementById('featured-content-container');
  const hoursContainer = document.getElementById('hours-content');

  const mailingListForm = document.getElementById('mailing-list-form');
  const nameField = mailingListForm?.querySelector('[name="name"]');
  const messageField = mailingListForm?.querySelector('[name="message"]');

  const uploadButton = document.querySelector('.admin-upload-link button');
  const archiveButton = document.querySelector('.view-archives-button'); // If i add back the "View Archives" button

  // Constants / Config
  // Determine the correct API base URL based on current domain
  const getCurrentDomain = () => window.location.hostname;
  const getApiBaseUrl = () => {
    const domain = getCurrentDomain();
    // Use the correct Cloudflare Worker URL for all API calls
    return 'https://howdythrift.farewellcafe.com';
  };
  
  const BASE_URL = getApiBaseUrl();
  const CACHE_EXPIRY_MS = 15 * 60 * 1000;    // 15 minutes
  const cache = new Map(); // Simple in-memory cache

  // --------------------------
  // Content Loading Functions
  // --------------------------

  // Production API functions for content
  const contentApi = {
    getMissionStatement: async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/content/mission`);
        if (!response.ok) throw new Error('Failed to fetch mission');
        const data = await response.json();
        return data.content;
      } catch (error) {
        console.error('Error fetching mission:', error);
        // Fallback to localStorage for offline capability
        const stored = localStorage.getItem('hdyspa_mission');
        if (stored) {
          return { content: stored };
        }
        return {
          content: "<h3>Our Mission</h3><p>To provide a space for creative reuse and community building through DIY projects and affordable second-hand goods. We believe in giving new life to pre-loved items while fostering creativity and sustainability in our community.</p>"
        };
      }
    },
    getPosts: async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/posts`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        return data.posts || [];
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Fallback to localStorage for offline capability
        const stored = localStorage.getItem('hdyspa_posts');
        if (stored) {
          return JSON.parse(stored);
        }
        return [
          {
            id: 1,
            title: 'Welcome to Howdy DIY Thrift!',
            content: '<p>We\'re excited to announce the opening of our community thrift space! Come explore our collection of unique second-hand treasures and join our DIY workshops.</p>',
            date: '2025-07-02',
            created_at: '2025-07-02T10:00:00Z'
          }
        ];
      }
    },
    getFeaturedContent: async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/featured`);
        if (!response.ok) throw new Error('Failed to fetch featured content');
        const data = await response.json();
        return data.featured || [];
      } catch (error) {
        console.error('Error fetching featured content:', error);
        // Fallback to localStorage for offline capability
        const stored = localStorage.getItem('hdyspa_featured');
        if (stored) {
          return JSON.parse(stored);
        }
        return [
          {
            id: 1,
            type: 'image',
            content: './hyqr.png',
            caption: 'Follow us on Instagram @howdydiythrift!'
          }
        ];
      }
    },
    getHours: async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/content/hours`);
        if (!response.ok) throw new Error('Failed to fetch hours');
        const data = await response.json();
        return data.content;
      } catch (error) {
        console.error('Error fetching hours:', error);
        // Fallback to localStorage for offline capability
        const stored = localStorage.getItem('hdyspa_hours');
        if (stored) {
          return { content: stored };
        }
        return {
          content: "<ul><li><strong>Monday - Friday:</strong> 10am - 6pm</li><li><strong>Saturday:</strong> 11am - 5pm</li><li><strong>Sunday:</strong> Closed</li></ul><p><em>Holiday hours may vary. Check our Instagram for updates!</em></p>"
        };
      }
    }
  };

  const loadContent = async () => {
    try {
      // Load Mission Statement
      if (missionContainer) {
        const mission = await contentApi.getMissionStatement();
        missionContainer.innerHTML = mission.content || mission;
        // Update the mission section title if available
        const missionTitle = document.querySelector('#mission-statement h2');
        if (missionTitle && mission.title) {
          missionTitle.textContent = mission.title;
        }
      }

      // Load Posts
      if (postsContainer) {
        const posts = await contentApi.getPosts();
        postsContainer.innerHTML = posts.map(post => `
          <article class="post" data-id="${post.id}">
            <h4>${post.title}</h4>
            <div class="post-content">${post.content}</div>
            <small class="post-date">${new Date(post.created_at || post.date).toLocaleDateString()}</small>
          </article>
        `).join('');
      }

      // Load Featured Content
      if (featuredContainer) {
        const featured = await contentApi.getFeaturedContent();
        featuredContainer.innerHTML = featured.map(item => {
          if (item.type === 'image') {
            return `
              <figure class="featured-item">
                <img src="${item.content}" alt="${item.caption}" loading="lazy">
                <figcaption>${item.caption}</figcaption>
              </figure>
            `;
          } else if (item.type === 'video') {
            return `
              <figure class="featured-item">
                <div class="video-container">
                  <iframe src="${item.content}" frameborder="0" allowfullscreen loading="lazy"></iframe>
                </div>
                <figcaption>${item.caption}</figcaption>
              </figure>
            `;
          }
          return '';
        }).join('');
      }

      // Load Hours
      if (hoursContainer) {
        const hours = await contentApi.getHours();
        hoursContainer.innerHTML = hours.content || hours;
        // Update the hours section title if available
        const hoursTitle = document.querySelector('#hours-section h2');
        if (hoursTitle && hours.title) {
          hoursTitle.textContent = hours.title;
        }
      }

    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  // Listen for content updates from admin panel
  window.addEventListener('contentUpdated', (event) => {
    const { type } = event.detail;
    console.log('Content updated:', type);
    loadContent(); // Reload all content
  });

  // Initial content load
  loadContent();

  // --------------------------
  // Events Popup Function (Keep the fully implemented version)
  // --------------------------

  /**
   * Generate and display events listing popup content with thumbnails
   * @param {string} venue - 'howdy' or 'farewell'
   */
  async function displayEventsPopup(venue) {
    console.log('displayEventsPopup called with venue:', venue);
    console.log('BASE_URL:', BASE_URL);
    try {
      // Use new unified API endpoint with thumbnails
      const endpoint = `${BASE_URL}/api/events/list?venue=${venue}&thumbnails=true&limit=50`;
      console.log('Calling unified API endpoint:', endpoint);
      
      let upcomingEvents = [];
      
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          console.log('Unified API success:', data);
          upcomingEvents = data.events || [];
        } else {
          throw new Error(`Unified API failed: ${response.status}`);
        }
      } catch (error) {
        console.warn('Unified API not available, falling back to legacy:', error);
        // Fallback to legacy endpoint
        const legacyEndpoint = `${BASE_URL}/list/${venue}`;
        console.log('Calling legacy endpoint:', legacyEndpoint);
        const legacyResponse = await fetch(legacyEndpoint);
        if (!legacyResponse.ok) {
          throw new Error(`Legacy endpoint failed: ${legacyResponse.status} ${legacyResponse.statusText}`);
        }
        const legacyData = await legacyResponse.json();
        upcomingEvents = Array.isArray(legacyData) ? legacyData : [];
      }
      
      console.log('Final events array:', upcomingEvents.length, 'events');

      // Create popup content with enhanced styling and thumbnails
      let popupContent = `
        <div style="padding: 20px; font-family: var(--font-hnm11); background: var(--card-bg-color); min-height: 100vh;">
          <h2 style="text-align: center; margin-bottom: 30px; color: var(--text-color); border-bottom: 2px solid var(--nav-border-color); padding-bottom: 10px;">
            ${venue.toUpperCase()} UPCOMING SHOWS
          </h2>
      `;

      if (upcomingEvents.length === 0) {
        popupContent += `
          <p style="text-align: center; color: var(--text-color); font-style: italic;">
            No upcoming shows found.
          </p>
        `;
      } else {
        upcomingEvents.forEach(event => {
          // Use date_formatted from unified API if available, fallback to formatting
          const formattedDate = event.date_formatted || (() => {
            const eventDate = new Date(event.date || event.eventDate);
            return eventDate.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          })();

          // Get thumbnail from unified API or fallback to legacy fields
          const thumbnailUrl = event.thumbnail_url || event.flyerThumbnail || event.flyer_url || event.imageUrl;
          const venueDisplay = event.venue_display || (event.venue || event.type || venue).toUpperCase();
          const eventTime = event.default_time || event.time || event.eventTime;
          const suggestedPrice = event.suggested_price || event.suggestedPrice;
          const ticketUrl = event.ticket_url || event.ticketLink;

          popupContent += `
            <div style="border: 1px solid var(--nav-border-color); margin: 15px 0; padding: 20px; 
                        background: rgba(255,255,255,0.95); border-radius: 8px; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s ease;">
              <div style="display: flex; gap: 20px; align-items: flex-start;">
                ${thumbnailUrl ? `
                  <img src="${thumbnailUrl}" alt="${event.title}" 
                       style="width: 100px; height: 100px; object-fit: cover; border-radius: 6px; 
                              flex-shrink: 0; border: 2px solid var(--nav-border-color);">
                ` : `
                  <div style="width: 100px; height: 100px; background: var(--nav-border-color); 
                              border-radius: 6px; display: flex; align-items: center; justify-content: center; 
                              color: white; font-size: 12px; text-align: center; flex-shrink: 0;">
                    No Image
                  </div>
                `}
                <div style="flex: 1;">
                  <h3 style="margin: 0 0 12px 0; color: var(--text-color); font-size: 1.2em; 
                             line-height: 1.3; font-weight: bold;">
                    ${event.title}
                  </h3>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                              gap: 8px; margin-bottom: 12px;">
                    <p style="margin: 0; color: var(--text-color); display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.1em;">📅</span>
                      <strong>${formattedDate}</strong>
                    </p>
                    ${eventTime ? `
                      <p style="margin: 0; color: var(--text-color); display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1em;">🕐</span>
                        ${eventTime}
                      </p>
                    ` : ''}
                    <p style="margin: 0; color: var(--text-color); display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.1em;">📍</span>
                      <strong>${venueDisplay}</strong>
                    </p>
                    ${event.age_restriction ? `
                      <p style="margin: 0; color: var(--text-color); display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1em;">🔞</span>
                        ${event.age_restriction}
                      </p>
                    ` : ''}
                    ${suggestedPrice ? `
                      <p style="margin: 0; color: var(--text-color); display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1em;">💰</span>
                        <strong>${suggestedPrice}</strong>
                      </p>
                    ` : ''}
                  </div>
                  ${event.description ? `
                    <p style="margin: 12px 0; color: var(--text-color); font-size: 0.95em; 
                              line-height: 1.5; padding: 10px; background: rgba(0,0,0,0.05); 
                              border-radius: 4px; border-left: 3px solid var(--nav-border-color);">
                      ${event.description.substring(0, 300)}${event.description.length > 300 ? '...' : ''}
                    </p>
                  ` : ''}
                  ${ticketUrl ? `
                    <a href="${ticketUrl}" target="_blank" rel="noopener" 
                       style="display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; 
                              padding: 10px 16px; background: var(--button-bg-color); 
                              color: var(--button-text-color); text-decoration: none; 
                              border-radius: 6px; font-size: 0.95em; font-weight: bold; 
                              transition: all 0.2s ease; border: 2px solid transparent;">
                      <span style="font-size: 1.1em;">🎫</span>
                      Get Tickets
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        });
      }

      popupContent += `
          <div style="text-align: center; margin-top: 20px;">
            <small style="color: var(--text-color); opacity: 0.7;">
              Switch between HOWDY and FAREWELL modes to see different venue listings
            </small>
          </div>
        </div>
      `;

      console.log('Popup content generated successfully');
      return popupContent;
    } catch (error) {
      console.error('Error fetching events for popup:', error);
      
      // Special handling for CORS errors
      if (error.message.includes('NetworkError') || error.message.includes('CORS')) {
        return `
          <div style="padding: 20px; text-align: center;">
            <h2 style="color: var(--text-color); margin-bottom: 20px;">
              ${venue.toUpperCase()} SHOWS
            </h2>
            <p style="color: #ea4110; margin-bottom: 15px;">
              Unable to load events due to CORS restrictions.
            </p>
            <p style="color: #666; font-size: 0.9em; margin-bottom: 15px;">
              This is a temporary issue with cross-origin requests from dev.farewellcafe.com to the API server.
            </p>
            <p style="color: #666; font-size: 0.9em;">
              <strong>To view events:</strong><br>
              • Visit <a href="https://fwhy.kcmo.xyz" target="_blank" style="color: #007bff;">fwhy.kcmo.xyz</a> directly<br>
              • Or contact the admin to update CORS settings for dev.farewellcafe.com
            </p>
          </div>
        `;
      }
      
      return `
        <div style="padding: 20px; text-align: center;">
          <p style="color: #ea4110;">Error loading events: ${error.message}</p>
          <p style="color: #666; font-size: 0.9em;">Please try again later or check console for details.</p>
        </div>
      `;
    }
  }

  // --------------------------
  // Popup System Integration
  // --------------------------

  // Listen for popup requests on show listings links
  document.addEventListener('click', async function(event) {
    const link = event.target.closest('a.cal-link-listing');
    
    if (link && (link.classList.contains('open-popup') || link.getAttribute('href') === '#shows')) {
      event.preventDefault();
      console.log('Show listings popup triggered');
      
      // Determine venue from current state
      const currentState = body?.dataset.state || 'farewell';
      console.log('Current venue state:', currentState);
      
      // Generate popup content
      console.log('Fetching events for popup...');
      const popupContent = await displayEventsPopup(currentState);
      
      // Create and show popup window
      const popupWindow = window.open('', 'eventsPopup', 
        'width=800,height=600,scrollbars=yes,resizable=yes');
      
      if (popupWindow) {
        popupWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${currentState.toUpperCase()} Shows - Farewell & Howdy</title>
            <link rel="stylesheet" href="${window.location.origin}/css/ccssss.css">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0;">
            ${popupContent}
          </body>
          </html>
        `);
        popupWindow.document.close();
        console.log('Popup window created successfully');
      } else {
        console.error('Failed to create popup window');
      }
    }
  });

  // --------------------------
  // Initial Setup
  // --------------------------

  // Initialize hidden fields on page load if needed
  // Check if these functions are used in your app
  if (typeof updateHiddenFields === 'function') {
    updateHiddenFields();
  }

  // You may need to uncomment/modify these based on your app's needs
  /*
  if (body) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-state") {
          updateHiddenFields();
        }
      }
    });
    observer.observe(document.body, { attributes: true });
  }
  */
});
```

## 4. Next Steps

1. Review the identified issues in script-review.md and syntax-errors.md
2. Use the sample implementation provided here as a guide for fixing the most critical issues
3. Test after each change to ensure nothing breaks
4. Consider removing unused code from the Farewell/Howdy switching functionality if it's not needed for your Thrift app

Remember that this sample implementation preserves all the core functionality while removing duplicate code and fixing syntax errors.
