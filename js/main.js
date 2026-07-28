document.addEventListener('DOMContentLoaded', () => {
  setupCustomCursor();
  setupCanvasBackground();
  setupScrollReveal();
  setupSkillHoverSpotlight();
  setupCertificatesLightbox();
  setupContactForm();
  setupNavbarScroll();
});

/* =========================================================================
   1. CUSTOM CURSOR & CURSOR RING
   ========================================================================= */
function setupCustomCursor() {
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');
  
  if (!cursor || !cursorRing) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position target dot instantly
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smoothly interpolate the cursor ring position (Lerp)
  function animateRing() {
    const ease = 0.15; // interpolation factor
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states
  const interactiveElements = document.querySelectorAll('a, button, input, textarea, .btn-primary, .btn-outline, .tech-item, .skill-card, .proj-card, .cert-card, .tl-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovered-link');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovered-link');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });
}

/* =========================================================================
   2. HIGH-PERFORMANCE INTERACTIVE CANVAS PARTICLES
   ========================================================================= */
function setupCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(60, Math.floor((width * height) / 25000)); // Adaptive particle count
  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.baseOpacity = Math.random() * 0.3 + 0.15;
      this.opacity = this.baseOpacity;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interactive push/pull
      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= dx * force * 0.02;
          this.y -= dy * force * 0.02;
          this.opacity = Math.min(0.8, this.baseOpacity + force * 0.5);
        } else {
          if (this.opacity > this.baseOpacity) {
            this.opacity -= 0.01;
          }
        }
      } else {
        if (this.opacity > this.baseOpacity) {
          this.opacity -= 0.01;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 179, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw mesh connections
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const alpha = (100 - dist) / 100 * 0.06;
          ctx.strokeStyle = `rgba(99, 179, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
}

/* =========================================================================
   3. SCROLL REVEAL & SKILLS PROGRESS ANIMATION
   ========================================================================= */
function setupScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const skillBars = document.querySelectorAll('.skill-bar');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(el => observer.observe(el));

  // Specialized observer for skill progress bars
  const skillObserver = new IntersectionObserver((entries, skillObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  skillBars.forEach(bar => skillObserver.observe(bar));
}

/* =========================================================================
   4. SPOTLIGHT HOVER EFFECT FOR SKILL CARDS
   ========================================================================= */
function setupSkillHoverSpotlight() {
  const cards = document.querySelectorAll('.skill-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
    });
  });
}

/* =========================================================================
   5. CREDENTIALS LIGHTBOX
   ========================================================================= */
function setupCertificatesLightbox() {
  const certCards = document.querySelectorAll('.cert-card');
  const lightbox = document.getElementById('cert-lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
  const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;

  if (!lightbox || !lightboxImg || !closeBtn) return;

  certCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const img = card.querySelector('.cert-thumb img');
      const title = card.querySelector('.cert-title').textContent;
      const issuer = card.querySelector('.cert-issuer').textContent;

      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || title;
        if (lightboxCaption) {
          lightboxCaption.textContent = `${issuer} | ${title}`;
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
      }
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  };

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Close lightbox on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* =========================================================================
   6. CONTACT FORM SUBMISSION HANDLER
   ========================================================================= */
function setupContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const message = form.querySelector('textarea').value.trim();

    if (!name || !email || !message) {
      alert('Please fill out all the fields in the contact form.');
      return;
    }

    // Modern simulation toast or prompt
    const button = form.querySelector('button');
    const originalText = button.innerHTML;
    
    button.innerHTML = 'Sending Message...';
    button.disabled = true;
    button.style.opacity = '0.7';

    setTimeout(() => {
      button.innerHTML = 'Message Sent Successfully ✓';
      button.style.background = 'linear-gradient(135deg, var(--accent2), #059669)';
      button.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
      
      form.reset();

      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        button.style.background = '';
        button.style.boxShadow = '';
        button.style.opacity = '1';
      }, 3000);
    }, 1500);
  });
}

/* =========================================================================
   7. NAVBAR SCROLL EFFECT
   ========================================================================= */
function setupNavbarScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}
