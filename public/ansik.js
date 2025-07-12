document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(MotionPathPlugin, CustomEase, ScrollTrigger);
  
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

  // Utility for random number generation
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

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
   * Gradually shifts the body's background
   * from #f0ffff to #ffffff over 2000px of scroll.
   */
  gsap.to("body", {
    scrollTrigger: {
      start: 0,
      end: 1200,    // Extend the distance to make the color shift extra subtle
      scrub: 1
    },
    backgroundColor: "#00ffcc",
    ease: "none"
  });

}); // Close DOMContentLoaded
