/* ================================================================
   KIDDO CONFERENCE — script.js
   JavaScript: nav, scroll, animations, confetti, form
   ================================================================ */

/* ---------------------------------------------------------------
   1. NAVBAR — scroll effect & active link highlight
--------------------------------------------------------------- */
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-links');

/**
 * Update navbar appearance and active link based on scroll position.
 */
function onScroll() {
  // Scrolled class for background/shadow
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Determine which section is in view
  let currentSection = '';
  sections.forEach(section => {
    const sectionTop    = section.offsetTop - (window.innerHeight * 0.4);
    const sectionBottom = sectionTop + section.offsetHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
      currentSection = section.getAttribute('id');
    }
  });

  // Highlight matching nav link
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ---------------------------------------------------------------
   2. SMOOTH SCROLLING + CLOSE MOBILE MENU ON LINK CLICK
--------------------------------------------------------------- */
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Close mobile menu
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

/* ---------------------------------------------------------------
   3. HAMBURGER MENU TOGGLE
--------------------------------------------------------------- */
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});

/* ---------------------------------------------------------------
   4. SCROLL REVEAL ANIMATIONS
   Uses IntersectionObserver to add 'visible' class to .reveal elements.
--------------------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children within same parent slightly
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 80 * (Array.from(entry.target.parentElement.children).indexOf(entry.target)));
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Hero reveal on load
window.addEventListener('load', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(40px)';
    heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      });
    });
  }
});

/* ---------------------------------------------------------------
   5. CONTACT FORM — Formspree submission with loading state
   Formspree handles the actual email delivery via action="..."
   We intercept with fetch() so the page doesn't redirect.
--------------------------------------------------------------- */
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const toast       = document.getElementById('toast');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Stop default page redirect

  // Show loading state
  submitBtn.textContent = 'Sending... ⏳';
  submitBtn.disabled = true;

  try {
    const formData = new FormData(contactForm);

    const response = await fetch('https://formspree.io/f/xbdabvqk', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      // ✅ Success
      submitBtn.textContent = 'Sent! ✅';
      contactForm.reset();
      showToast('✅ Message sent! We\'ll be in touch soon.');
      setTimeout(() => {
        submitBtn.textContent = 'Send Message 🚀';
        submitBtn.disabled = false;
      }, 3000);
    } else {
      // ❌ Formspree returned an error
      throw new Error('Form submission failed');
    }

  } catch (error) {
    // ❌ Network or other error
    submitBtn.textContent = 'Send Message 🚀';
    submitBtn.disabled = false;
    showToast('❌ Oops! Something went wrong. Please try again.', true);
  }
});

/**
 * Show a toast notification.
 * @param {string} message - Text to display
 * @param {boolean} isError - Red style for errors
 */
function showToast(message = '✅ Message sent!', isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? '#DC2626' : 'var(--green)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ---------------------------------------------------------------
   6. CONFETTI ON PAGE LOAD 🎉
   Lightweight canvas-based confetti — no library needed.
--------------------------------------------------------------- */
(function initConfetti() {
  const canvas  = document.getElementById('confetti-canvas');
  const ctx     = canvas.getContext('2d');
  let pieces    = [];
  let animId;

  const COLORS  = ['#7C3AED','#2563EB','#F59E0B','#EC4899','#10B981','#FCD34D','#60A5FA'];
  const COUNT   = 120;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /**
   * Create a single confetti particle.
   */
  function createPiece() {
    return {
      x:     Math.random() * canvas.width,
      y:     -10 - Math.random() * 100,
      w:     8 + Math.random() * 8,
      h:     6 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx:    (Math.random() - 0.5) * 2,
      vy:    2 + Math.random() * 3,
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.15,
      opacity: 1,
    };
  }

  // Spawn confetti pieces
  for (let i = 0; i < COUNT; i++) {
    setTimeout(() => {
      pieces.push(createPiece());
    }, i * 30);
  }

  /**
   * Animation loop.
   */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.fill();
      ctx.restore();

      // Update physics
      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.spin;
      p.vy    += 0.04; // gentle gravity

      // Fade out near bottom
      if (p.y > canvas.height * 0.7) {
        p.opacity -= 0.012;
      }
    });

    // Remove invisible pieces
    pieces = pieces.filter(p => p.opacity > 0);

    if (pieces.length > 0) {
      animId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Start after a tiny delay so DOM is fully rendered
  setTimeout(() => {
    draw();
    // Auto-stop after 5 seconds max
    setTimeout(() => {
      cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 5000);
  }, 200);
})();

/* ---------------------------------------------------------------
   7. FLOATING SHAPES — subtle parallax on mouse move
--------------------------------------------------------------- */
(function initParallax() {
  const shapes = document.querySelectorAll('.shape');

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1 to 1
    const dy = (e.clientY - cy) / cy; // -1 to 1

    shapes.forEach((shape, i) => {
      const depth = (i % 3 + 1) * 8; // varies per shape
      const tx = dx * depth;
      const ty = dy * depth;
      shape.style.transform = `translate(${tx}px, ${ty}px)`;
    });
  });
})();
