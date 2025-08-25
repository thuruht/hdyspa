document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(MotionPathPlugin, CustomEase, ScrollTrigger);
  
  // Utility for random number generation
  const randomBetween = (min, max) => Math.random() * (max - min) + min;
  
  // Header background animation
  gsap.to('.feader', {
    backgroundPosition: "100% 100%", //scrollimg
    rotation: randomBetween(-2.2, 2.2),
    scale: 1.024,
    duration: 22, // Smooth, slow motion
    repeat: -1, // Infinite loop
    yoyo: true,
    ease: "none" // Seamless motion without easing bumps
  });

  // Natural drop/bounce easing
  CustomEase.create("customBounce", "M0,0 C0.25,0.1 0.25,1 1,1");

  // ===========================================
  // MAIN PAGE GSAP ANIMATIONS (moved from script.js)
  // ===========================================
  
  function initMainPageAnimations() {
    console.log('Initializing main page GSAP animations from ansik.js');
    
    // Staggered entrance for cards
    gsap.from(".card", {
      y: 30,
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
    
    // Hover animations for admin button
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
    
    // Scroll trigger animations
    ScrollTrigger.batch(".card", {
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        overwrite: true
      }),
      once: true
    });
    
    // Animate posts when they load
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

    // ------------------------------------------------------------------
    // Page background overlay tween (animates CSS variables so the bg image stays)
    // ------------------------------------------------------------------
    (function setupBackgroundOverlayTween(){
      try {
        const root = document.documentElement;
        // sensible defaults if CSS vars are missing
        if (!getComputedStyle(root).getPropertyValue('--page-bg-start')) {
          root.style.setProperty('--page-bg-start', 'rgba(255,248,243,0.00)');
        }
        if (!getComputedStyle(root).getPropertyValue('--page-bg-end')) {
          root.style.setProperty('--page-bg-end', 'rgba(0,255,204,0.12)');
        }

        // Helper to parse color strings if needed (we pass strings directly to GSAP)
        const setVars = (startColor, endColor) => {
          root.style.setProperty('--page-bg-start', startColor);
          root.style.setProperty('--page-bg-end', endColor);
        };

        // Create a ScrollTrigger-driven tween that interpolates the overlay colors
        // NOTE: GSAP cannot interpolate arbitrary CSS color strings on element.style
        // reliably without a tiny object shim, so we animate custom properties on
        // a proxy object then write them out as rgba/hex strings.
        const proxy = { t: 0 };
        const start = getComputedStyle(root).getPropertyValue('--page-bg-start').trim() || 'rgba(255,248,243,0.00)';
        const end = getComputedStyle(root).getPropertyValue('--page-bg-end').trim() || 'rgba(0,255,204,0.12)';

        // We will lerp between two pre-defined colors by animating proxy.t from 0..1
        gsap.to(proxy, {
          t: 1,
          ease: 'none',
          scrollTrigger: {
            start: 'top ' + (window.innerHeight * 0.10) + 'px', // start at ~10% of viewport
            end: 'bottom bottom',
            scrub: 0.6,
          },
          onUpdate: () => {
            // simple cross-fade using CSS gradients by updating opacity-like alpha
            // For a smoother, multi-stop ramp you'd set CSS variables for each stop.
            const a = proxy.t;
            // interpolate alpha of start (fade out) and end (fade in)
            // keep colors constant but blend opacity; this keeps the image visible beneath
            const startColor = start.includes('rgba') ? start.replace(/rgba\(([^)]+)\)/, (m, g1) => {
              const parts = g1.split(',').map(s => s.trim());
              return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${Math.max(0, 0.25 * (1 - a)).toFixed(3)})`;
            }) : start;
            const endColor = end.includes('rgba') ? end.replace(/rgba\(([^)]+)\)/, (m, g1) => {
              const parts = g1.split(',').map(s => s.trim());
              return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${Math.max(0, 0.16 * a).toFixed(3)})`;
            }) : end;

            // apply to root
            try { root.style.setProperty('--page-bg-start', startColor); } catch (e) {}
            try { root.style.setProperty('--page-bg-end', endColor); } catch (e) {}
          }
        });
      } catch (err) {
        console.warn('Background overlay tween failed to initialize', err);
      }
    })();

    // Randomize per-card overlay alpha so each card's gradient shows through differently
    (function randomizeCardOverlayAlpha(){
      try {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card) => {
          // base around 0.02, subtract a random amount up to 0.015 so some cards are more vivid
          const base = 0.02;
          const delta = Math.random() * 0.015; // 0 .. 0.015
          const alpha = Math.max(0, base - delta).toFixed(3);
          card.style.setProperty('--card-overlay-alpha', alpha);
        });
      } catch (e) { console.warn('randomizeCardOverlayAlpha failed', e); }
    })();
    
    // Animate the mission content
    gsap.from('#mission-content', {
      y: -20,
      opacity: 0,
      duration: 0.7,
      delay: 0.3,
      ease: 'back.out(1.7)',
    });
    
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
      ease: 'elastic.out(1, 0.3)',
      scrollTrigger: {
        trigger: '#mission-statement',
        start: 'top 80%',
      }
    });
  }
  
  // Function to animate hours image when dynamically created
  window.animateHoursImage = function(imageElement) {
    gsap.from(imageElement, {
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
  };
  
  // Initialize main page animations after a short delay to ensure DOM is ready
  setTimeout(() => {
    initMainPageAnimations();
    // Also initialize header (HOWDY) and logo animations consolidated from script.js
    try {
      if (typeof initHeaderAndLogoAnimations === 'function') {
        initHeaderAndLogoAnimations();
      } else {
        // Define and call the header & logo animations if not already defined
        initHeaderAndLogoAnimations = function() {
          try {
            // Ensure header is visible
            if (window.gsap && gsap.set) gsap.set('.header-title', { opacity: 1 });

            // Header entrance timeline
            const tlHeader = gsap.timeline();
            // Use a smaller header entrance offset to avoid pushing content off-screen
            tlHeader.from('header .header-container', {
              y: -20,
              opacity: 0.92,
              duration: 0.9,
              ease: 'power3.out'
            });

            // HOWDY letters setup - clamp offsets so letters never fly off-screen
            const howdyLetters = document.querySelectorAll('.howdy-letter');
            howdyLetters.forEach((letter) => {
              // Reduced and clamped starting offset
              const startY = -Math.min(60, 20 + Math.random() * 50); // -20..-60 clamp
              const startX = (Math.random() * 18) - 9; // smaller horizontal jitter
              gsap.set(letter, {
                opacity: 0,
                y: startY,
                x: startX,
                rotationX: (Math.random() * 30) - 15,
                rotationY: (Math.random() * 30) - 15
              });
              // Add gradient class so each letter inherits the gradient fill (text-clip)
              letter.classList.add('howdy-gradient');
            });

            // Staggered drop-in for HOWDY
            tlHeader.to('.howdy-letter', {
              opacity: 1,
              y: 0,
              x: 0,
              rotationX: 0,
              rotationY: 0,
              duration: 1.2,
              stagger: 0.15,
              ease: 'elastic.out(1, 0.3)',
              onComplete: () => {
                // Subtle continuous animation after drop-in
                gsap.to('.span2.flip', {
                  scale: 1.02,
                  duration: 2.5,
                  repeat: -1,
                  yoyo: true,
                  ease: 'sine.inOut'
                });

                // Hover setup for letters (transform only — keep gradient color intact)
                const letterIds = ['howdy-h', 'howdy-o', 'howdy-w', 'howdy-d', 'howdy-y'];
                letterIds.forEach((id) => {
                  const letter = document.getElementById(id);
                  if (!letter) return;

                  const originalRotation = letter.classList.contains('flip') ? -352 : 345;

                  const onEnter = () => {
                    try {
                      // Only animate transforms so gradient color remains visible
                      gsap.to(`#${id}`, {
                        scale: 1.18,
                        transformOrigin: 'center center',
                        rotation: originalRotation + ((Math.random() * 8) - 4),
                        duration: 0.28,
                        ease: 'back.out(1.4)',
                        overwrite: 'auto'
                      });
                    } catch (e) { console.warn('GSAP letter hover failed', e); }
                  };

                  const onLeave = () => {
                    try {
                      gsap.to(`#${id}`, {
                        scale: 1,
                        rotation: originalRotation,
                        duration: 0.28,
                        ease: 'back.out(1.4)',
                        overwrite: 'auto'
                      });
                    } catch (e) { console.warn('GSAP letter hover failed', e); }
                  };

                  // Attach events idempotently
                  if (!letter.dataset.hoverAttached) {
                    letter.addEventListener('mouseenter', onEnter);
                    letter.addEventListener('mouseleave', onLeave);
                    letter.dataset.hoverAttached = 'true';
                    letter.style.pointerEvents = 'auto';
                    letter.setAttribute('data-has-hover', 'true');
                  }
                });
              }
            }, '-=0.3');

            // Flip subtle animation
            gsap.to('.flip', {
              rotateY: 5,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut'
            });

            // Logo idle and hover functions (moved from script.js)
            function createMissionLogoIdleAnimation() {
              const missionLogo = document.querySelector('#mission-statement img');
              if (!missionLogo) return;
              gsap.set(missionLogo, { transformOrigin: 'center center' });

              const idleAnimations = [
                // vibrate
                () => {
                  gsap.to(missionLogo, {
                    x: 'random(-3, 3)', y: 'random(-2, 2)', rotation: 'random(-1, 1)',
                    duration: 0.3, ease: 'power1.inOut',
                    onComplete: () => gsap.to(missionLogo, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' })
                  });
                },
                // inhale/exhale
                () => {
                  gsap.to(missionLogo, {
                    scale: 1.03, duration: 1.5, ease: 'sine.inOut',
                    onComplete: () => gsap.to(missionLogo, { scale: 1, duration: 1.5, ease: 'sine.inOut' })
                  });
                },
                // subtle bounce
                () => {
                  gsap.to(missionLogo, { y: -5, duration: 0.4, ease: 'power2.out', onComplete: () => gsap.to(missionLogo, { y: 0, duration: 0.6, ease: 'bounce' }) });
                },
                // tilt
                () => {
                  gsap.to(missionLogo, { rotation: 'random(-3, 3)', duration: 0.8, ease: 'power1.inOut', onComplete: () => gsap.to(missionLogo, { rotation: 0, duration: 0.8, ease: 'power1.inOut' }) });
                }
              ];

              function playRandomAnimation() {
                if (!missionLogo.isHovered) {
                  const anim = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
                  anim();
                }
                gsap.delayedCall(gsap.utils.random(5, 15), playRandomAnimation);
              }

              playRandomAnimation();
            }

            function enhancedMissionLogoHover() {
              const logo = document.querySelector('#mission-statement img');
              if (!logo) return;
              logo.isHovered = false;
              logo.addEventListener('mouseenter', () => {
                logo.isHovered = true;
                gsap.killTweensOf(logo);
                gsap.to(logo, { scale: 1.15, rotation: gsap.utils.random(-3,3), filter: 'brightness(1.1) saturate(1.1)', boxShadow: '0 0 15px rgba(255,255,255,0.3)', duration: 0.4, ease: 'back.out(1.7)' });
              });
              logo.addEventListener('mouseleave', () => {
                logo.isHovered = false;
                gsap.to(logo, { scale: 1, rotation: 0, filter: 'brightness(1) saturate(1)', boxShadow: 'none', duration: 0.5, ease: 'elastic.out(1,0.3)' });
              });
            }

            function footerLogoHover() {
              const logo = document.querySelector('.footer-logo img');
              if (!logo) return;
              gsap.set(logo, { transformOrigin: 'center center' });
              logo.addEventListener('mouseenter', () => gsap.to(logo, { scale: 1.1, rotation: 2, duration: 0.3, ease: 'power2.out' }));
              logo.addEventListener('mouseleave', () => gsap.to(logo, { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' }));
            }

            // Initialize logo behaviors
            enhancedMissionLogoHover();
            footerLogoHover();
            createMissionLogoIdleAnimation();

                // Apply gradient to the main HOWDY span as well
                try {
                  const span2 = document.querySelector('.header-title .span2');
                  if (span2) span2.classList.add('howdy-gradient');
                } catch (e) { console.warn('Could not add howdy gradient class:', e); }

            // Mark that ansik has initialized animations
            window.ANSIK_ANIMATIONS_INITIALIZED = true;
          } catch (err) {
            console.warn('initHeaderAndLogoAnimations failed:', err);
          }
        };
        // Call it immediately
        initHeaderAndLogoAnimations();
      }
    } catch (e) {
      console.warn('Failed to initialize header & logo animations from ansik.js:', e);
    }
  }, 100);
  
  // ===========================================
  // EXISTING ANSIK.JS ANIMATIONS
  // ===========================================

  /* 
   * .drop-crawl 
   * Drops in, then crawls along a random path continuously
   */
  gsap.utils.toArray(".drop-crawl").forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: -300, rotation: randomBetween(-12, 13), scale: 0.5 },
      {
        opacity: 1, y: 0, rotation: 0, scale: 1,
        duration: 2, ease: "customBounce",
        onComplete: () => startCrawlAnimation(el)
      }
    );
  });

  function startCrawlAnimation(el) {
    gsap.to(el, {
      duration: randomBetween(3, 5),
      ease: "sine.inOut",
      motionPath: {
        path: generateRandomPath(),
        autoRotate: true,
        align: "self",
        alignOrigin: [0.5, 0.5]
      },
      repeat: -1,
      yoyo: true
    });
  }

  function generateRandomPath() {
    const [startX, startY] = [0, 0];
    const cp1X = randomBetween(-30, 20), cp1Y = randomBetween(-23, 28);
    const cp2X = randomBetween(-20, 30), cp2Y = randomBetween(-32, 42);
    const endX = randomBetween(-24, 18), endY = randomBetween(-30, 26);
    return `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
  }

  /* 
   * .drop-wiggle 
   * Drops in, then wiggles/throbs continuously
   */
  gsap.utils.toArray(".drop-wiggle").forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: -300, rotation: randomBetween(-20, 20), scale: 0.5 },
      {
        opacity: 1, y: 0, rotation: 0, scale: 1,
        duration: 2, ease: "customBounce",
        onComplete: () => {
          gsap.to(el, {
            duration: randomBetween(1, 2),
            rotation: randomBetween(-10, 10),
            scale: randomBetween(1.03, 1.10),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          });
        }
      }
    );
  });

  /* 
   * .squi-rmbreth 
   * Subtle scale, rotation, and vertical “breathing”
   */
  gsap.utils.toArray(".squi-rmbreth").forEach(el => {
    // Throb (scaling up and down)
    gsap.to(el, {
      duration: 6.5,
      scale: 1.1,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });
    // Subtle wiggle (rotation)
    gsap.to(el, {
      duration: 9,
      rotation: 5,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true
    });
    // Slight vertical breathing
    gsap.to(el, {
      duration: 7,
      y: 6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
  });

  /*
   * SUPER-SUBTLE SCROLLTRIGGER COLOR TWEEN
   * Gradually shifts the body's background from a warm ivory/pink
   * to the brand/green at the bottom of the page while scrolling.
   * Use fromTo so we explicitly set a less-white starting color.
   */
  // Build a ScrollTrigger tween that starts at 10% down the page and ends at bottom
  let scrollBgTween = null;

  function buildScrollBgTween() {
    // Kill previous tween if it exists
    try { if (scrollBgTween) { scrollBgTween.scrollTrigger.kill(); scrollBgTween.kill(); } } catch (e) {}

    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const viewH = window.innerHeight || document.documentElement.clientHeight;
    const maxScroll = docHeight - viewH;
    // Start at 10% of total scroll, end at bottom
    const startPx = Math.max(0, Math.round(maxScroll * 0.10));
    const endPx = Math.max(startPx + 400, maxScroll); // ensure some distance, fallback to maxScroll

    scrollBgTween = gsap.fromTo("body",
      { backgroundColor: "#FFF8F399" }, // warm ivory / lightly pink (start)
      {
        backgroundColor: "#00FFCC99",
        ease: "none",
        scrollTrigger: {
          start: startPx,
          end: endPx,
          scrub: 1
        }
      }
    );
  }

  // Build initially and rebuild on resize (throttle)
  buildScrollBgTween();
  let resizeTO = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => buildScrollBgTween(), 250);
  });

}); // Close DOMContentLoaded
