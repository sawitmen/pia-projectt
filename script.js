/* ===================================================
   NUSANTARA CITY — Landing Page Script
   =================================================== */

/* ---------- NAVBAR: transparent → solid on scroll ---------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ---------- HERO VIDEO AUTOPLAY FALLBACK ---------- */
const heroVideo = document.querySelector('.hero-video');

if (heroVideo) {
  const tryPlayHeroVideo = () => {
    if (heroVideo.readyState === 0) heroVideo.load();
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Some browsers require a user interaction before media can autoplay.
      });
    }
  };

  heroVideo.muted = true;
  heroVideo.playsInline = true;
  heroVideo.setAttribute('muted', '');
  heroVideo.setAttribute('playsinline', '');
  heroVideo.setAttribute('webkit-playsinline', '');

  if (document.readyState === 'complete') {
    tryPlayHeroVideo();
  } else {
    window.addEventListener('load', tryPlayHeroVideo, { once: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlayHeroVideo();
  });
  window.addEventListener('pageshow', tryPlayHeroVideo);

  ['click', 'touchstart', 'touchend', 'keydown'].forEach((evtName) => {
    window.addEventListener(evtName, tryPlayHeroVideo, { once: true, passive: true });
  });
}

/* ---------- HAMBURGER / MOBILE MENU ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

// Close menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---------- SCROLL REVEAL ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- COUNTER ANIMATION ---------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out curve
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ---------- CTA FORM SUBMIT ---------- */
function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const toast = document.getElementById('toast');

  // Disable while processing
  btn.disabled = true;
  btn.textContent = 'Memproses...';

  // Simulate async (replace with real fetch if needed)
  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    btn.textContent = 'Daftar Sekarang';

    // Show toast
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }, 900);
}

/* ---------- SMOOTH ACTIVE NAV LINK ON SCROLL ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));

/* ---------- GALLERY CAROUSEL ---------- */
(function () {
  const slides = document.querySelectorAll('.gallery-slide');
  const dotsContainer = document.getElementById('galleryDots');
  const galleryCarousel = document.querySelector('.gallery-carousel');
  if (!slides.length || !dotsContainer || !galleryCarousel) return;

  let current = 0;
  let timer;
  let dragStartX = 0;
  let dragDeltaX = 0;
  let isDragging = false;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  function getPointerX(event) {
    if (event.touches && event.touches.length) return event.touches[0].clientX;
    if (event.changedTouches && event.changedTouches.length) return event.changedTouches[0].clientX;
    return event.clientX;
  }

  function handleDragStart(event) {
    isDragging = true;
    dragStartX = getPointerX(event);
    dragDeltaX = 0;
    galleryCarousel.classList.add('dragging');
    clearInterval(timer);
  }

  function handleDragMove(event) {
    if (!isDragging) return;
    dragDeltaX = getPointerX(event) - dragStartX;
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    galleryCarousel.classList.remove('dragging');

    if (Math.abs(dragDeltaX) > 60) {
      goTo(current + (dragDeltaX < 0 ? 1 : -1));
    } else {
      resetTimer();
    }

    dragDeltaX = 0;
  }

  window.galleryMove = (dir) => goTo(current + dir);

  galleryCarousel.addEventListener('mousedown', handleDragStart);
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('mouseup', handleDragEnd);

  galleryCarousel.addEventListener('touchstart', handleDragStart, { passive: true });
  galleryCarousel.addEventListener('touchmove', handleDragMove, { passive: true });
  galleryCarousel.addEventListener('touchend', handleDragEnd);
  galleryCarousel.addEventListener('touchcancel', handleDragEnd);

  resetTimer();
})();

window.openGallery = function (e) {
  e.preventDefault();
  const modal = document.getElementById('galleryModal');
  modal.classList.remove('closing');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeGallery = function () {
  const modal = document.getElementById('galleryModal');
  modal.classList.add('closing');
  setTimeout(() => {
    modal.classList.remove('open', 'closing');
    document.body.style.overflow = '';
  }, 350);
};

window.closeGalleryOnBackdrop = function (e) {
  if (e.target === document.getElementById('galleryModal')) closeGallery();
};

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeGallery();
});

// ---------- CONTACT FAB ----------
const contactFabBtn = document.getElementById('contactFabBtn');
const contactPopup = document.getElementById('contactPopup');

contactFabBtn.addEventListener('click', () => {
  contactPopup.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!document.getElementById('contactFab').contains(e.target)) {
    contactPopup.classList.remove('open');
  }
});

document.getElementById('contactPopupClose').addEventListener('click', (e) => {
  e.stopPropagation();
  contactPopup.classList.remove('open');
});
