document.addEventListener('DOMContentLoaded', () => {
  // Centralized image error fallback handler used by image onerror attributes
  window.handleImageError = function(imgEl) {
    try {
      console.warn('Image failed to load, applying fallback for', imgEl && imgEl.src);
      const fallback = './hyph.png';
      imgEl.onerror = null;
      imgEl.src = fallback;
      imgEl.alt = 'Image unavailable - fallback applied';
      // Apply a utility class for fallback sizing instead of inline styles
      imgEl.classList.add('image-fallback');
    } catch (e) {
      console.error('handleImageError failed', e);
    }
  };
  // Aggressive HOWDY hover debug: attach forced inline handlers to every .howdy-letter
  try {
    const debugLetters = document.querySelectorAll('.howdy-letter');
    debugLetters.forEach((el) => {
      // mark for debugging
      el.dataset.hoverDebug = 'true';
      // ensure interactive via CSS class (centralized)
      el.classList.add('howdy-debug');

      const id = el.id || '(no-id)';
      el.addEventListener('mouseenter', (ev) => {
        console.log('DEBUG HOVER ENTER:', id, el.textContent, ev.target);
        // toggle a centralized class to handle hover transform in CSS
        el.classList.add('howdy-hovered');
      });

      el.addEventListener('mouseleave', (ev) => {
        console.log('DEBUG HOVER LEAVE:', id, el.textContent, ev.target);
        el.classList.remove('howdy-hovered');
      });
    });
    console.log('Attached debug hover handlers to howdy letters:', debugLetters.length);
  } catch (e) {
    console.error('Failed to attach debug howdy handlers:', e);
  }
  // --------------------------
  // DOM Elements
  // --------------------------
  const farewellSpan = document.querySelector('.header-title .span2'); 
  const body = document.querySelector('body');
  const title = document.querySelector('title');
  const address = document.getElementById('address');

  // Content containers
  const missionContainer = document.getElementById('mission-content');
  const postsContainer = document.getElementById('posts-container');
  const featuredContainer = document.getElementById('featured-content-container');
  const hoursContainer = document.getElementById('hours-content');
  
  // DOM elements for buttons/controls with null checks
  const uploadButton = document.querySelector('.admin-upload-link button');
  // Note: Archive button is removed as it's not currently used
  // const archiveButton = document.querySelector('.view-archives-button');
  
  // Sort select - may not be present in current HTML
  const sortSelect = document.getElementById('sort-select');
  
  // Add event listeners only if elements exist
  if (uploadButton) {
    uploadButton.addEventListener('click', () => {
      console.log('Upload button clicked');
      // Any upload functionality would go here
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const selectedValue = e.target.value;
      console.log('Sort changed to:', selectedValue);
      // Sort functionality would go here
    });
  }
  
  // --------------------------
  // GSAP Animations
  // --------------------------
  function initAnimations() {
    // If ansik.js already consolidated animations, skip to avoid double-init
    if (window.ANSIK_ANIMATIONS_INITIALIZED) {
      console.log('Skipping initAnimations because ansik.js already initialized animations');
      return;
    }

    console.log('Initializing GSAP animations (script.js fallback)');

    // First, ensure the header container is visible but letters will be animated
    if (window.gsap && gsap.set) gsap.set('.header-title', { opacity: 1 });
    
    // Register CustomEase if available
    if (window.gsap && gsap.registerPlugin) gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, CustomEase);
    
    // Custom eases - simplified to use standard eases instead of custom paths that might be invalid
    try {
      // Use standard eases instead of CustomEase to avoid syntax errors
      // We'll set these as variables to reference in animations
      const bounceEase = "elastic.out(1, 0.3)";
      const slowBounceEase = "elastic.out(1, 0.2)";
    } catch (error) {
      console.warn('CustomEase setup failed, falling back to standard eases:', error);
      // If custom eases fail, we'll use standard eases instead in our animations
    }
    
    // Initial page load sequence
    const tl = gsap.timeline();
    
    // Header animation with sequential parts
    // Animate the header that's now a direct child of #content-container
    tl.from("#content-container > header.header-card", {
      y: -50,
      opacity: 0.9,
      duration: 0.9,
      ease: "power3.out"
    });
    
    // Split the HOWDY text into individual letters for more control
    const howdyText = document.querySelector(".span2.flip");
    const howdyLetters = document.querySelectorAll(".howdy-letter");
    
    // Debug - log all letters to ensure we're capturing them
    console.log("HOWDY Letters found:", howdyLetters.length);
    console.log("Letters:", Array.from(howdyLetters).map(el => el.textContent));
    
    // Set initial state for HOWDY letters with clamped offsets to avoid flying off-screen
    howdyLetters.forEach((letter, index) => {
      const startY = -Math.min(70, 20 + Math.random() * 50); // -20..-70
      const startX = (Math.random() * 24) - 12;
      gsap.set(letter, { 
        opacity: 0, 
        y: startY,
        x: startX,
        rotationX: (Math.random() * 40) - 20,
        rotationY: (Math.random() * 40) - 20
      });
      // Keep gradient class applied for fallback animations
      letter.classList.add('howdy-gradient');
    });
    
    // Create a staggered drop-in animation for each letter of HOWDY
    tl.to(".howdy-letter", {
      opacity: 1,
      y: 0,
      x: 0,
      rotationX: 0,
      rotationY: 0,
      duration: 1.2,
      stagger: 0.15, // Stagger each letter by 0.15 seconds
      ease: "elastic.out(1, 0.3)",
      onComplete: () => {
        // Create a subtle continuous animation after all letters have dropped in
        gsap.to(".span2.flip", {
          scale: 1.02,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        
        // Add hover effects with GSAP for each letter - using IDs for better targeting
        const letterIds = ['howdy-h', 'howdy-o', 'howdy-w', 'howdy-d', 'howdy-y'];
        
        letterIds.forEach((id, index) => {
          const letter = document.getElementById(id);
          if (!letter) {
            console.error(`Letter with ID ${id} not found`);
            return;
          }
          
          console.log(`Setting up hover for letter ${index}: ${letter.textContent} (ID: ${id})`);
          
          // Store original rotation based on class
          const originalRotation = letter.classList.contains("flip") ? -352 : 345;
          
          // Direct DOM event handlers for maximum browser compatibility
          letter.onmouseenter = function() {
            console.log(`Letter ${letter.textContent} (${id}) mouse enter`);
            // Transform-only hover in fallback to preserve gradient color
            gsap.to(`#${id}`, {
              scale: 1.18,
              rotation: originalRotation + ((Math.random() * 8) - 4),
              duration: 0.28,
              ease: "back.out(1.4)",
              overwrite: "auto"
            });
          };
          
          letter.onmouseleave = function() {
            console.log(`Letter ${letter.textContent} (${id}) mouse leave`);
            gsap.to(`#${id}`, {
              scale: 1,
              rotation: originalRotation,
              duration: 0.28,
              ease: "back.out(1.4)",
              overwrite: "auto"
            });
          };
          
          // Add a data attribute to visually confirm event binding
          letter.setAttribute('data-has-hover', 'true');
          letter.classList.add('howdy-interactive');
        });
      }
    }, "-=0.3");
    
    // Letters flip animation
    gsap.to(".flip", {
      rotateY: 5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Staggered entrance for cards
    gsap.from(".card", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.2)"
    });
    
    // Add hover effects for all cards
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -5,
          scale: 1.01,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.in"
        });
      });
    });
    
    // Animate the footer mascot with a slight bounce
    const footerImg = document.querySelector('.squi-rmbreth');
    if (footerImg) {
      gsap.to(footerImg, {
        y: -10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "elastic.out(1, 0.2)"
      });
    }
    
    // Hover animations for admin button with improved effect
    const adminBtn = document.getElementById('admin-login-button');
    if (adminBtn) {
      adminBtn.addEventListener('mouseenter', () => {
        gsap.to(adminBtn, {
          scale: 1.05,
          backgroundColor: '#ff4500',
          duration: 0.2,
          ease: "power1.out"
        });
      });
      
      adminBtn.addEventListener('mouseleave', () => {
        gsap.to(adminBtn, {
          scale: 1,
          backgroundColor: '',
          duration: 0.2,
          ease: "power1.in"
        });
      });
    }
    
    // Scroll trigger animations with improved visual effect
    ScrollTrigger.batch(".card", {
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        overwrite: true
      }),
      once: true
    });
    
    // Animate posts when they load with more engaging animations
    window.addEventListener('contentUpdated', (event) => {
      if (event.detail.type === 'posts') {
        gsap.from("#posts-container .post", {
          y: 20,
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)"
        });
      }
    });
    
    // Stagger in the cards
    gsap.from('.card', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: 'main',
        start: 'top 80%',
      }
    });
    

    
    // Animate the mission content
    gsap.from('#mission-content', {
      y: -20,
      opacity: 0,
      duration: 0.7,
      delay: 0.3,
      ease: 'back.out(1.7)',
    });
    
    // Hours image animation will be triggered dynamically when the image is created
    
    // Animate the footer mascot
    gsap.from('.squi-rmbreth', {
      rotation: -5,
      y: 30,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: 'footer',
        start: 'top 90%',
      }
    });
    
    // Add hover animations to buttons
    gsap.utils.toArray('.admin-btn, #logout-button, form button').forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power1.out'
        });
      });
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power1.in'
        });
      });
    });
    
    // Animate the logos
    gsap.from("#mission-statement img", {
      scale: 0.5,
      opacity: 0,
      rotation: -5,
      duration: 1.2,
      delay: 0.5,
      ease: "elastic.out(1, 0.3)",
      scrollTrigger: {
        trigger: "#mission-statement",
        start: "top 80%",
      }
    });
    
    gsap.from(".footer-logo img", {
      scale: 0.5,
      opacity: 0,
      rotation: 5,
      duration: 1.2,
      ease: "elastic.out(1, 0.3)",
      scrollTrigger: {
        trigger: "footer",
        start: "top 90%",
      }
    });
    
    // Enhanced logo animations with idle effects for upper logo and hover for both
    // Function to create random subtle animations for the mission logo
    const createMissionLogoIdleAnimation = () => {
      const missionLogo = document.querySelector("#mission-statement img");
      if (!missionLogo) return;
      
      // Set transform origin for all animations
      gsap.set(missionLogo, { transformOrigin: "center center" });
      
      // Array of possible subtle animations
      const idleAnimations = [
        // Subtle vibrate
        () => {
          gsap.to(missionLogo, {
            x: "random(-3, 3)", 
            y: "random(-2, 2)", 
            rotation: "random(-1, 1)",
            duration: 0.3, 
            ease: "power1.inOut",
            onComplete: () => {
              gsap.to(missionLogo, {
                x: 0, 
                y: 0, 
                rotation: 0,
                duration: 0.5, 
                ease: "elastic.out(1, 0.3)"
              });
            }
          });
        },
        // Subtle inhale/exhale
        () => {
          gsap.to(missionLogo, {
            scale: 1.03, 
            duration: 1.5, 
            ease: "sine.inOut",
            onComplete: () => {
              gsap.to(missionLogo, {
                scale: 1, 
                duration: 1.5, 
                ease: "sine.inOut"
              });
            }
          });
        },
        // Subtle bounce
        () => {
          gsap.to(missionLogo, {
            y: -5, 
            duration: 0.4, 
            ease: "power2.out",
            onComplete: () => {
              gsap.to(missionLogo, {
                y: 0, 
                duration: 0.6, 
                ease: "bounce" // This is a standard GSAP ease, not a CustomEase
              });
            }
          });
        },
        // Subtle tilt
        () => {
          gsap.to(missionLogo, {
            rotation: "random(-3, 3)", 
            duration: 0.8, 
            ease: "power1.inOut",
            onComplete: () => {
              gsap.to(missionLogo, {
                rotation: 0, 
                duration: 0.8, 
                ease: "power1.inOut"
              });
            }
          });
        }
      ];
      
      // Randomly select an animation to play
      const playRandomAnimation = () => {
        // Only animate if user isn't hovering over the logo
        if (!missionLogo.isHovered) {
          const randomAnimation = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
          randomAnimation();
        }
        
        // Set next animation after a random delay
        gsap.delayedCall(gsap.utils.random(5, 15), playRandomAnimation);
      };
      
      // Start the idle animation cycle
      playRandomAnimation();
    };
    
    // Enhanced hover effect for mission logo
    const enhancedMissionLogoHover = () => {
      const logo = document.querySelector("#mission-statement img");
      if (!logo) return;
      
      logo.isHovered = false;
      
      logo.addEventListener("mouseenter", () => {
        logo.isHovered = true;
        
        // Stop any current animations
        gsap.killTweensOf(logo);
        
        // Create a more engaging hover animation
        gsap.to(logo, {
          scale: 1.15, 
          rotation: gsap.utils.random(-3, 3),
          filter: "brightness(1.1) saturate(1.1)",
          boxShadow: "0 0 15px rgba(255,255,255,0.3)",
          duration: 0.4, 
          ease: "back.out(1.7)"
        });
      });
      
      logo.addEventListener("mouseleave", () => {
        logo.isHovered = false;
        
        // Return to normal state with a slight bounce
        gsap.to(logo, {
          scale: 1, 
          rotation: 0,
          filter: "brightness(1) saturate(1)",
          boxShadow: "none",
          duration: 0.5, 
          ease: "elastic.out(1, 0.3)"
        });
      });
    };
    
    // Simple hover effect for footer logo
    const footerLogoHover = () => {
      const logo = document.querySelector(".footer-logo img");
      if (!logo) return;
      
      gsap.set(logo, { transformOrigin: "center center" });
      
      logo.addEventListener("mouseenter", () => {
        gsap.to(logo, { 
          scale: 1.1, 
          rotation: 2,
          duration: 0.3, 
          ease: "power2.out" 
        });
      });
      
      logo.addEventListener("mouseleave", () => {
        gsap.to(logo, { 
          scale: 1, 
          rotation: 0,
          duration: 0.3, 
          ease: "power2.out" 
        });
      });
    };
    
    // Initialize all logo animations
    enhancedMissionLogoHover();
    footerLogoHover();
    createMissionLogoIdleAnimation();
  }

    // Apply gradient class for HOWDY letters so color is controlled via CSS
    try {
      const howdyLettersForce = document.querySelectorAll('.howdy-letter');
      howdyLettersForce.forEach(el => el.classList.add('howdy-gradient'));
    } catch (e) { console.warn('Could not ensure howdy-gradient on letters', e); }

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
          // Try to parse as JSON first in case it's a full object with image_url
          try {
            return JSON.parse(stored);
          } catch (parseError) {
            // If not JSON, assume it's just the content string
            return { content: stored, image_url: './mxdiyjuly.png' };
          }
        }
        return {
          content: "<ul><li><strong>Monday - Friday:</strong> 10am - 6pm</li><li><strong>Saturday:</strong> 11am - 5pm</li><li><strong>Sunday:</strong> Closed</li></ul><p><em>Holiday hours may vary. Check our Instagram for updates!</em></p>",
          image_url: './mxdiyjuly.png'
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
        // Update the mission section title only if explicitly set in admin panel
        const missionTitle = document.querySelector('#mission-statement h2');
        // Only update title if it's explicitly set and not the default "Our Mission"
        if (missionTitle && mission.title && mission.title !== 'Our Mission') {
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
        
        // Update the posts section title if set in localStorage
        const postsTitle = document.querySelector('#posts-section h2');
        const savedPostsTitle = localStorage.getItem('hdyspa_posts_title');
        if (postsTitle && savedPostsTitle) {
          postsTitle.textContent = savedPostsTitle;
        }
      }

      // Load Featured Content
      if (featuredContainer) {
        console.log('Loading featured content...');
        try {
          const featured = await contentApi.getFeaturedContent();
          console.log('Featured content received:', featured);
          
          if (featured && featured.length > 0) {
            featuredContainer.innerHTML = featured.map(item => {
              if (item.type === 'image') {
                // Handle both relative and absolute URLs
                let imageUrl = item.content;
                
                // Improved URL handling for images
                if (imageUrl) {
                  // Check if it's already a complete URL
                  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                    // Ensure we have a proper URL by checking different formats
                    if (imageUrl.startsWith('./')) {
                      // Local relative path, keep as is
                    } else if (imageUrl.startsWith('/')) {
                      // Root-relative path, add domain
                      imageUrl = `${window.location.origin}${imageUrl}`;
                    } else if (imageUrl.includes('/media/')) {
                      // Contains media path but not properly formatted
                      const mediaPath = imageUrl.substring(imageUrl.indexOf('/media/'));
                      imageUrl = `${window.location.origin}${mediaPath}`;
                    } else {
                      // Assume it's a media filename
                      imageUrl = `${window.location.origin}/media/${imageUrl}`;
                    }
                  }
                  
                  // Add cachebusting parameter to prevent browser cache issues
                  if (imageUrl.includes('?')) {
                    imageUrl += `&_t=${Date.now()}`;
                  } else {
                    imageUrl += `?_t=${Date.now()}`;
                  }
                }
                
                // Verify image URL
                console.log('Rendering image with source:', imageUrl);
                
                return `
                  <figure class="featured-item">
        <img src="${imageUrl}" alt="${item.caption || 'Featured image'}" loading="lazy" 
          onerror="window.handleImageError && window.handleImageError(this)">
                    <figcaption>${item.caption || ''}</figcaption>
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
              } else if (item.type === 'html') {
                return `
                  <div class="featured-item featured-html">
                    <div class="html-content">${item.content}</div>
                    ${item.caption ? `<figcaption class="figcaption">${item.caption}</figcaption>` : ''}
                  </div>
                `;
              }
              return '';
            }).join('');
            
            // Make the container visible in case it was hidden
            featuredContainer.classList.add('is-flex');
            const featuredSection = document.getElementById('featured-content-section');
            if (featuredSection) featuredSection.classList.add('is-block');
            
            // Update the featured section title if set in localStorage
            const featuredTitle = document.querySelector('#featured-content-section h2');
            const savedFeaturedTitle = localStorage.getItem('hdyspa_featured_title');
            if (featuredTitle && savedFeaturedTitle) {
              featuredTitle.textContent = savedFeaturedTitle;
            }
          } else {
            console.log('No featured content available');
          }
        } catch (err) {
          console.error('Error displaying featured content:', err);
        }
      }

      // Load Hours
      if (hoursContainer) {
        console.log('Loading hours content...');
        const hours = await contentApi.getHours();
        console.log('Hours data received:', hours);
        console.log('Hours image URL:', hours.image_url);
        
        hoursContainer.innerHTML = hours.content || hours;
        // Update the hours section title only if explicitly set in admin panel
        const hoursTitle = document.querySelector('#hours-section h2');
        // Only update title if it's explicitly set and not the default "Hours"
        if (hoursTitle && hours.title && hours.title !== 'Hours') {
          hoursTitle.textContent = hours.title;
        }
        
        // Update hours image if available
        if (hours.image_url) {
          console.log('Processing hours image URL:', hours.image_url);
          // Process the image URL to ensure it's properly formatted
          let imageUrl = hours.image_url;
          
          // Improved URL handling for hours image
          if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            // Ensure we have a proper URL by checking different formats
            if (imageUrl.startsWith('./')) {
              // Local relative path, keep as is
            } else if (imageUrl.startsWith('/')) {
              // Root-relative path, add domain
              imageUrl = `${window.location.origin}${imageUrl}`;
            } else if (imageUrl.includes('/media/')) {
              // Contains media path but not properly formatted
              const mediaPath = imageUrl.substring(imageUrl.indexOf('/media/'));
              imageUrl = `${window.location.origin}${mediaPath}`;
            } else {
              // Assume it's a media filename
              imageUrl = `${window.location.origin}/media/${imageUrl}`;
            }
          }
          
          // Add cachebusting parameter to prevent browser cache issues
          if (imageUrl.includes('?')) {
            imageUrl += `&_t=${Date.now()}`;
          } else {
            imageUrl += `?_t=${Date.now()}`;
          }
          
          // Check if hours image container already exists
          let hoursImageContainer = document.querySelector('.hours-image-container');
          if (!hoursImageContainer) {
            // Create hours image container if it doesn't exist
            hoursImageContainer = document.createElement('div');
            hoursImageContainer.className = 'hours-image-container';
            hoursContainer.appendChild(hoursImageContainer);
          }
          
          const currentImg = hoursImageContainer.querySelector('img');
          if (currentImg) {
            currentImg.src = imageUrl;
            currentImg.alt = `${hours.title || 'Howdy DIY Thrift Hours'} - Updated Schedule`;
            // Add error handling
            currentImg.onerror = function() {
              this.onerror = null;
              console.log('Hours image failed to load, using fallback');
              this.src = './hyqr.png';
              this.classList.add('image-fallback');
              this.alt = 'Image unavailable - please check media path';
            };
            
            // Animate the updated image
            gsap.from(currentImg, {
              scale: 0.9,
              opacity: 0.5,
              duration: 0.6,
              ease: 'power2.out'
            });
          } else {
            // Create image if it doesn't exist
            const newImg = document.createElement('img');
            newImg.src = imageUrl;
            newImg.alt = `${hours.title || 'Howdy DIY Thrift Hours'} - Updated Schedule`;
            newImg.className = 'featured-img admin-image';
            // Add error handling
            newImg.onerror = function() {
              this.onerror = null;
              console.log('Hours image failed to load:', imageUrl);
              console.log('Using fallback image');
              this.src = './hyph.png';
              this.classList.add('image-fallback');
              this.alt = 'Image unavailable - please check media path';
            };
            console.log('Created new hours image element with src:', imageUrl);
            hoursImageContainer.appendChild(newImg);
            
            // Animate the newly created hours image
            gsap.from(newImg, {
              scale: 0.8,
              opacity: 0,
              duration: 1,
              delay: 0.2,
              ease: 'elastic.out(1, 0.3)',
              scrollTrigger: {
                trigger: '#hours-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            });
          }
        } else {
          // Remove hours image container if no image URL
          const existingContainer = document.querySelector('.hours-image-container');
          if (existingContainer) {
            existingContainer.remove();
          }
        }
      }

      // Update the social section title if set in localStorage
      const socialTitle = document.querySelector('#social-section h2');
      const savedSocialTitle = localStorage.getItem('hdyspa_social_title');
      if (socialTitle && savedSocialTitle) {
        socialTitle.textContent = savedSocialTitle;
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
  // Load Instagram feed (non-blocking)
  loadInstagramFeed();
  
  // Initialize GSAP animations after DOM content loaded
  // This will be a no-op if ansik.js has already run and set the global flag
  initAnimations();
  // Safety: ensure mission logo remains visible after intro animations
  try {
    const missionLogoEl = document.querySelector('#mission-statement img');
    if (missionLogoEl) {
      // kill any lingering GSAP tweens that might hide it
      if (window.gsap) gsap.killTweensOf(missionLogoEl);
      // force visible final state using a CSS helper class
      missionLogoEl.classList.add('force-visible');
    }
  } catch (e) {
    console.warn('Could not enforce mission logo visible state:', e);
  }
});

// --- Fallback: ensure HOWDY D and Y get hover handlers and pointer events ---
document.addEventListener('DOMContentLoaded', () => {
  try {
    const ensureIds = ['howdy-d', 'howdy-y'];
    ensureIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) {
        console.warn('HOWDY fallback: element not found:', id);
        return;
      }
      // Force pointer events and stacking so the element is interactive
  el.classList.add('howdy-interactive');
      el.setAttribute('data-hover-fallback', 'true');

      // If GSAP is available, use it for consistent animations; otherwise use tiny CSS tweak
      const onEnter = () => {
        try {
          if (window.gsap) {
            gsap.to(el, { scale: 1.2, color: '#ff6347', duration: 0.22, overwrite: 'auto' });
          } else {
            el.classList.add('howdy-hovered');
            el.style.color = '#ff6347';
          }
        } catch (e) { console.warn('GSAP hover fallback failed', e); }
      };

      const onLeave = () => {
        try {
          if (window.gsap) {
            gsap.to(el, { scale: 1, color: getComputedStyle(document.documentElement).getPropertyValue('--blew') || 'var(--blew)', duration: 0.22, overwrite: 'auto' });
          } else {
            el.classList.remove('howdy-hovered');
            el.style.color = '';
          }
        } catch (e) { console.warn('GSAP hover fallback failed', e); }
      };

      // Attach only if not already attached
      if (!el.dataset.hoverAttached) {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        el.dataset.hoverAttached = 'true';
      }
    });
  } catch (err) {
    console.error('Error in HOWDY fallback setup:', err);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  /* 
   * NOTE: Removed duplicate content API and loadContent function (Issues 1.1-1.4)
   * The first implementation at the beginning of the file is used instead.
   */

  // --------------------------
  // NOTE: Slideshow-related variables and functions were removed
  // as they are not needed for the Thrift app (Issue 3.1)
  // --------------------------

  // --------------------------
  // Helper Functions
  // --------------------------

  /**
   * Toggles images based on the current state.
   * e.g., sets "farewell" images vs. "howdy" images
   */
  function toggleImages(state) {
    const imageMappings = {
      farewell: {
        conic: './img/fm.png',
        conica: './img/fm2.png',
        nicic: './img/fwm.png',
        nicica: './img/fm2.png',
        calendar: './img/fwcal.png',
      },
      howdy: {
        conic: './img/hym.png',
        conica: './img/hm.png',
        nicic: './img/hm2.png',
        nicica: './img/hm.png',
        calendar: './img/hycal.png',
      },
    };

    const target = imageMappings[state];
    if (!target) {
      console.error(`No image mappings for state: ${state}`);
      return;
    }

    // Replace images
    document.querySelectorAll('.conic').forEach(img => img.src = target.conic);
    document.querySelectorAll('.conica').forEach(img => img.src = target.conica);
    document.querySelectorAll('.nicic').forEach(img => img.src = target.nicic);
    document.querySelectorAll('.nicica').forEach(img => img.src = target.nicica);

    const calendarContainer = document.getElementById('calendar');
    if (calendarContainer) {
      calendarContainer.querySelectorAll('img').forEach(img => {
        img.src = target.calendar;
      });
    }
  }

  /**
   * Updates social media links based on the current state.
   */
  function updateSocialLinks(state) {
    const socialLinks = {
      howdy: {
        facebook: 'https://www.facebook.com/howdykcmo',
        instagram: 'https://instagram.com/howdykcmo',
        twitter: 'https://x.com/HowdyKCMO',
        spotify: 'https://open.spotify.com/playlist/44StXfAJQiPoDQYegr4kec?si=8f07faf57647401f',
        secret: 'https://linktr.ee/farewellhowdy',
      },
      farewell: {
        facebook: 'https://www.facebook.com/farewelltransmission',
        instagram: 'https://instagram.com/farewellkcmo',
        twitter: 'https://x.com/farewellcafe',
        spotify: 'https://open.spotify.com/playlist/1eXsLdNQe319cAbnsmpi06?si=333d96c262f5424d',
        secret: 'https://linktr.ee/farewellhowdy',
      },
    };

    const links = socialLinks[state];
    if (!links) {
      console.error(`No social links for state: ${state}`);
      return;
    }

    // Update each social link
    const socialAnchors = document.querySelectorAll('.social-icons a');
    const platforms = ['facebook', 'instagram', 'twitter', 'spotify', 'secret'];

    socialAnchors.forEach((anchor, index) => {
      const platform = platforms[index];
      if (links[platform]) {
        anchor.href = links[platform];
      }
    });
  }

  /**
   * Fetch upcoming or past flyers from the unified events Worker.
   * This function has been kept for compatibility but is no longer used for slideshow.
   * (Issue 3.1: Removed slideshow functionality as it's not needed for Thrift app)
   */
  async function fetchFlyers(state, showPast = false) {
    try {
      // Use a simple cache key
      const cacheKey = `${state}-${showPast ? 'past' : 'upcoming'}`;
      const now = Date.now();

      // Check cache
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (now - cached.timestamp < CACHE_EXPIRY_MS) {
          // Return cached data
          return cached.data;
        } else {
          // Expired
          cache.delete(cacheKey);
        }
      }

      // Use new unified events API endpoint with venue filtering
      let url, response, data;
      
      if (showPast) {
        // For archives, use the unified events endpoint with date filtering
        url = `${BASE_URL}/api/events/list?venue=${state}&past=true&thumbnails=true`;
        try {
          response = await fetch(url);
          if (!response.ok) {
            // Fallback to legacy archives endpoint
            url = `${BASE_URL}/archives?type=${state}`;
            response = await fetch(url);
          }
          data = await response.json();
        } catch (error) {
          console.warn('Unified API not available, trying legacy endpoint:', error);
          // Fallback to legacy
          url = `${BASE_URL}/archives?type=${state}`;
          response = await fetch(url);
          data = await response.json();
        }
      } else {
        // For upcoming events, use the new unified events endpoint
        url = `${BASE_URL}/api/events/list?venue=${state}&thumbnails=true&limit=20`;
        try {
          response = await fetch(url);
          if (!response.ok) {
            // Fallback to legacy list endpoint
            url = `${BASE_URL}/list/${state}`;
            response = await fetch(url);
          }
          data = await response.json();
        } catch (error) {
          console.warn('Unified API not available, trying legacy endpoint:', error);
          // Fallback to legacy
          url = `${BASE_URL}/list/${state}`;
          response = await fetch(url);
          data = await response.json();
        }
      }
      
      // Transform data to match expected flyer format
      // New unified API returns {events: [...], total: number, venue: string}
      // Legacy endpoint returns array directly
      let events;
      if (data.events) {
        // New unified API format
        events = data.events;
      } else if (Array.isArray(data)) {
        // Legacy API format
        events = data;
      } else {
        events = [];
      }

      const transformedData = events.map(event => ({
        id: event.id,
        title: event.title,
        // New API provides thumbnail_url, fallback to legacy fields
        imageUrl: event.thumbnail_url || event.flyerThumbnail || event.flyer_url || event.imageUrl,
        date: event.date || event.eventDate,
        time: event.default_time || event.time || event.eventTime,
        venue: event.venue_display || event.venue || event.type || state,
        description: event.description,
        suggestedPrice: event.suggested_price || event.suggestedPrice,
        ticketLink: event.ticket_url || event.ticketLink,
        ageRestriction: event.age_restriction,
        // New fields from unified API
        dateFormatted: event.date_formatted,
        thumbnailUrl: event.thumbnail_url
      }));

      // Store in cache
      cache.set(cacheKey, { data: transformedData, timestamp: now });
      return transformedData;
    } catch (error) {
      console.error('Error fetching flyers:', error);
      return [];
    }
  }

  /**
   * NOTE: Slideshow-related functions removed (Issue 3.1)
   * The following functions were removed as they're not needed for the Thrift app:
   * - displaySlide()
   * - initSlideshow()
   * - startAutoplay()
   * - stopAutoplay()
   */

  /**
   * Toggles the body state between 'howdy' and 'farewell', then updates UI elements.
   */
  function toggleState() {
    console.log('toggleState called');
    const bodyElement = document.querySelector('body');
    if (!bodyElement) {
      console.error('Body element not found!');
      return;
    }
    
    const currentState = bodyElement.dataset.state;
    const newState = currentState === 'farewell' ? 'howdy' : 'farewell';
    console.log(`Switching from ${currentState} to ${newState}`);
    
    bodyElement.dataset.state = newState;
    
    // Properly manage the howdy-active class for theming
    if (newState === 'howdy') {
      bodyElement.classList.add('howdy-active');
      console.log('Added howdy-active class');
    } else {
      bodyElement.classList.remove('howdy-active');
      console.log('Removed howdy-active class');
    }

    // Update dynamic text
    if (farewellSpan) {
      farewellSpan.textContent = (newState === 'howdy') ? 'HOWDY' : 'FAREWELL';
    }
    // This is for the venue site, not needed for Thrift app
    const howdyElement = document.querySelector('.header-title .sulk');
    if (howdyElement) {
      howdyElement.textContent = (newState === 'howdy') ? '& FAREWELL' : '& HOWDY';
    } else {
      console.log('howdySpan not found - this is expected for the Thrift app');
    }
    if (address) {
      address.textContent = (newState === 'howdy')
        ? '6523 STADIUM DRIVE, KANSAS CITY, MISSOURI'
        : '6515 STADIUM DRIVE, KANSAS CITY, MISSOURI';
    }

    if (title) {
      title.textContent = (newState === 'farewell')
        ? 'FAREWELL | HOWDY | KCMO - Howdy and Farewell - Kansas City'
        : 'HOWDY | FAREWELL | KCMO - Farewell and Howdy - Kansas City';
    }

    toggleImages(newState);
    updateSocialLinks(newState);

    // NOTE: Removed slideshow re-initialization (Issue 3.1)
    // The following line was removed:
    // initSlideshow();
  }

  /**
   * Start autoplay interval.
   */
  function startAutoplay() {
    // Clear existing interval before starting a new one
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      currentSlideIndex++;
      displaySlide(currentSlideIndex);
    }, SLIDE_INTERVAL);
  }

  /**
   * Stop any existing autoplay interval.
   */
  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  // NOTE: Removed slideshow-related event listeners (Issue 3.3)
  // The following event listeners were removed as they're not needed for the Thrift app:
  // - prevButton click event
  // - nextButton click event
  // - slideImage mouseenter/mouseleave events

  // --------------------------
  // Upload & Archives (Modals)
  // --------------------------

  /**
   * Creates and displays a basic modal.
   */
  function createModal(titleText, contentHTML) {
    const existingModal = document.querySelector('.modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>${titleText}</h2>
        ${contentHTML}
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-button');
    closeBtn?.addEventListener('click', () => modal.remove());

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * If need separate Archives modal, can keep this.
   */
  function openArchiveModal(state) {
    const archiveContentHTML = `<div id="archiveContent">Loading...</div>`;
    createModal('Archived Events', archiveContentHTML);
    fetchAndDisplayArchives(state);
  }

  /**
   * Fetch and display archives in the modal.
   */
  async function fetchAndDisplayArchives(state) {
    const archiveContent = document.getElementById('archiveContent');
    if (!archiveContent) return;

    try {
      const response = await fetch(`${BASE_URL}/archives?type=${state}`);
      if (!response.ok) throw new Error(`Failed to fetch archives: ${response.statusText}`);
      const flyers = await response.json();

      archiveContent.innerHTML = ''; // Clear "Loading..."

      if (!flyers.length) {
        archiveContent.innerHTML = '<p>No past events found.</p>';
        return;
      }

      flyers.forEach((flyer) => {
        const flyerItem = document.createElement('div');
        flyerItem.className = 'flyer-item';
        flyerItem.innerHTML = `
          <h3>${flyer.title}</h3>
          <p>${flyer.description}</p>
          <p><strong>Date:</strong> ${flyer.date}</p>
          <p><strong>Time:</strong> ${flyer.time}</p>
        `;
        archiveContent.appendChild(flyerItem);
      });
    } catch (error) {
      console.error('Error fetching archives:', error);
      archiveContent.innerHTML = `<p>Error fetching archives: ${error.message}</p>`;
    }
  }

  // --------------------------
  // Mailing List + Hidden Fields
  // --------------------------

  // NOTE: Removed updateHiddenFields function (not needed for Thrift app)
  // This was leftover code from the shared codebase related to the mailing list form

  // --------------------------
  // Event Listeners
  // --------------------------

  // Toggle state when user clicks the "sulk" span (HOWDY / FAREWELL)
  // This is for the venue site, not needed for Thrift app
  try {
    const howdyClickElement = document.querySelector('.header-title .sulk');
    if (howdyClickElement && howdyClickElement instanceof Element) {
      console.log('Adding click listener to howdy element:', howdyClickElement);
      howdyClickElement.addEventListener('click', (e) => {
        console.log('State toggle clicked!');
        e.preventDefault();
        toggleState();
      });
      // Also make it visually clear it's clickable
      howdyClickElement.style.cursor = 'pointer';
    } else {
      console.log('howdyClickElement not found - skipping event listener (expected for Thrift app)');
    }
  } catch (error) {
    console.error('Error handling howdyClickElement:', error);
  }

  // Archives button - check if it exists before adding event listener
  try {
    const archiveButton = document.querySelector('.view-archives-button');
    if (archiveButton) {
      archiveButton.addEventListener('click', () => {
        // Use document.body instead of undefined 'body' variable
        openArchiveModal(document.body.dataset.state);
      });
    }
  } catch (error) {
    console.error('Error setting up archive button:', error);
  }

  // NOTE: Removed mailing list form submission code (not needed for Thrift app)
  // This was leftover code from the shared codebase

  // NOTE: Removed sortSelect event listener (Issue 3.3)
  // The following event listener was removed as it's not needed for the Thrift app:
  // - sortSelect change event that called initSlideshow()

  // --------------------------
  // Events Listing Popup Functions
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
        <div class="event-popup-content">
          <h2 class="event-popup-title">${venue.toUpperCase()} UPCOMING SHOWS</h2>
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
            <div class="event-card">
              <div class="event-card-row">
                ${thumbnailUrl ? `
                  <img src="${thumbnailUrl}" alt="${event.title}" class="event-thumb">
                ` : `
                  <div class="event-noimage">No Image</div>
                `}
                <div class="event-card-body">
                  <h3 class="event-title">${event.title}</h3>
                  <div class="event-meta-grid">
                    <p class="event-meta"><span class="meta-emoji">📅</span><strong>${formattedDate}</strong></p>
                    ${eventTime ? `<p class="event-meta"><span class="meta-emoji">🕐</span>${eventTime}</p>` : ''}
                    <p class="event-meta"><span class="meta-emoji">📍</span><strong>${venueDisplay}</strong></p>
                    ${event.age_restriction ? `<p class="event-meta"><span class="meta-emoji">🔞</span>${event.age_restriction}</p>` : ''}
                    ${suggestedPrice ? `<p class="event-meta"><span class="meta-emoji">💰</span><strong>${suggestedPrice}</strong></p>` : ''}
                  </div>
                  ${event.description ? `<p class="event-desc">${event.description.substring(0, 300)}${event.description.length > 300 ? '...' : ''}</p>` : ''}
                  ${ticketUrl ? `<a href="${ticketUrl}" target="_blank" rel="noopener" class="ticket-link"><span class="meta-emoji">🎫</span>Get Tickets</a>` : ''}
                </div>
              </div>
            </div>
          `;
        });
      }

      popupContent += `
          <div class="popup-footer">
            <small class="popup-footer-note">Switch between HOWDY and FAREWELL modes to see different venue listings</small>
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

  /**
   * Load Instagram feed into #insta-feed. Tries an /api/instagram JSON endpoint first,
   * falls back to a small set of local images shipped with the site.
   */
  async function loadInstagramFeed() {
    const container = document.getElementById('insta-feed');
    if (!container) return;
    try {
      // Attempt to fetch a JSON feed from a backend worker (optional)
      const resp = await fetch('/api/instagram');
      if (resp.ok) {
        const data = await resp.json();
        // Expect data.posts = [{image_url, caption, link}, ...]
        const posts = data.posts || data.items || [];
        if (posts.length) {
          container.innerHTML = posts.slice(0, 6).map(p => `
            <a class="insta-item" href="${p.link || '#'}" target="_blank" rel="noopener">
              <img src="${p.image_url}" alt="${(p.caption||'Instagram image').replace(/"/g,'')}">
            </a>
          `).join('');
          return;
        }
      }
    } catch (err) {
      console.warn('Instagram API fetch failed (this is optional):', err);
    }

    // Fallback: local sample images bundled in public/
    const fallback = ['./hyph.png','./hyqr.png','./1.png','./z1.png','./mxdiyjuly.png','./hyu.png'];
    container.innerHTML = fallback.slice(0,6).map(src => `
      <div class="insta-item"><img src="${src}" alt="Instagram fallback image"></div>
    `).join('');
  }

  /* 
   * NOTE: The incomplete duplicate displayEventsPopup function has been removed.
   * This was causing a syntax error that prevented script execution.
   * The complete implementation of this function is above.
   */

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

  // Set an initial state - ensure body is properly defined
  const bodyElement = document.querySelector('body');
  if (bodyElement) {
    const initialState = bodyElement.dataset.state || 'farewell';
    bodyElement.dataset.state = initialState;
    
    // Initialize CSS class based on initial state
    if (initialState === 'howdy') {
      bodyElement.classList.add('howdy-active');
    } else {
      bodyElement.classList.remove('howdy-active');
    }
    
    toggleImages(initialState); 
    updateSocialLinks(initialState); 
  }
  // Auto-detect anchors that are styled with our marigold / team-gold-2 color
  // and add the `.yellow-link` utility class so they get the accessible stroke.
  // This targets anchors that have an inline color or whose computed color matches
  // the CSS variables used for the yellow/gold tones.
  (function applyYellowLinkClass() {
    try {
      const rootStyles = getComputedStyle(document.documentElement);
      const marigoldVar = rootStyles.getPropertyValue('--marigold').trim();
      const teamGoldVar = rootStyles.getPropertyValue('--team-gold-2').trim();

      // Helper to convert a CSS color token (hex, 8-digit hex, var(...) etc)
      // into a computed rgb(...) string for reliable comparison.
      const colorToComputed = (token) => {
        if (!token) return null;
        const tmp = document.createElement('div');
        tmp.style.position = 'absolute';
        tmp.style.left = '-9999px';
        // If token is a CSS var reference, set directly; otherwise set raw token
        tmp.style.color = token;
        document.body.appendChild(tmp);
        const c = getComputedStyle(tmp).color;
        document.body.removeChild(tmp);
        return c;
      };

      const marigoldComputed = colorToComputed(marigoldVar);
      const teamGoldComputed = colorToComputed(teamGoldVar);

      document.querySelectorAll('a').forEach(a => {
        try {
          const inlineStyle = a.getAttribute('style') || '';
          const inlineColor = (a.style && a.style.color) ? a.style.color.trim() : '';
          const computed = getComputedStyle(a).color;

          const matchesInlineToken = inlineStyle.includes('--marigold') || inlineStyle.includes('--team-gold-2') ||
            (marigoldVar && inlineStyle.includes(marigoldVar)) ||
            (teamGoldVar && inlineStyle.includes(teamGoldVar));

          const matchesComputed = (marigoldComputed && computed === marigoldComputed) ||
                                  (teamGoldComputed && computed === teamGoldComputed);

          if (matchesInlineToken || (inlineColor && (matchesComputed || inlineColor === marigoldVar || inlineColor === teamGoldVar))) {
            a.classList.add('yellow-link');
            // ensure the link is visible to assistive tech
            a.setAttribute('data-yellow-contrast', 'applied');
          }
        } catch (innerErr) {
          // don't let one bad link break the whole loop
          console.warn('applyYellowLinkClass: link check failed', innerErr, a);
        }
      });

      // Re-run after dynamic content updates (simple debounced observer)
      let timeout = null;
      const mo = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => applyYellowLinkClass(), 250);
      });
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    } catch (err) {
      console.warn('applyYellowLinkClass failed', err);
    }
  })();

  // NOTE: Removed initSlideshow call (Issue 3.1)
  // Slideshow-related code has been removed as it's not needed for the Thrift app

  // NOTE: Removed hidden fields updates and observer (not needed for Thrift app)
  // This was leftover code from the shared codebase related to the mailing list form
});

