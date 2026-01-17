"use strict";

/* -----------------------------
   Helpers
----------------------------- */
function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

/* -----------------------------
   NAV: click + auto active on scroll
----------------------------- */
function setupNavScroll() {
  const chips = qsa(".nav-chip");
  if (!chips.length) return;

  function setActiveById(id) {
    chips.forEach(c => c.classList.toggle("is-active", c.getAttribute("data-target") === id));
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const id = chip.getAttribute("data-target");
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveById(id);
      }
    });
  });

  // Auto-highlight while scrolling (better UX)
  const sectionIds = chips.map(c => c.getAttribute("data-target")).filter(Boolean);
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    entries => {
      // pick the most visible section
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible && visible.target && visible.target.id) {
        setActiveById(visible.target.id);
      }
    },
    { threshold: [0.2, 0.35, 0.5, 0.65] }
  );

  sections.forEach(s => observer.observe(s));
}

/* -----------------------------
   Reveal sections
----------------------------- */
function setupSectionReveal() {
  const sections = qsa(".section");
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("section-in-view");
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach(section => observer.observe(section));
}

/* -----------------------------
   Parallax (lightweight + rAF)
----------------------------- */
function setupParallax() {
  const elements = qsa("[data-parallax]");
  if (!elements.length) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    elements.forEach(el => {
      const factor = parseFloat(el.getAttribute("data-parallax")) || 0;
      // NOTE: This overrides transform. Use only on elements that don't need other transforms.
      el.style.transform = `translateY(${scrollY * factor * -1}px)`;
    });
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* -----------------------------
   Banner Slider (safe + swipe)
----------------------------- */
function setupBannerSlider() {
  const shell = qs("[data-slider='banners']");
  if (!shell) return;

  const slides = qsa(".banner-slide", shell);
  const prevBtn = qs("[data-banner-prev]", shell);
  const nextBtn = qs("[data-banner-next]", shell);
  const dots = qsa("[data-banner-dot]", shell);

  if (slides.length <= 1) {
    // nothing to slide
    slides.forEach(s => s.classList.add("is-active"));
    return;
  }

  let index = 0;
  let autoplayId = null;

  function activateSlide(newIndex) {
    index = (newIndex + slides.length) % slides.length;
    slides.forEach(slide => slide.classList.remove("is-active"));
    dots.forEach(dot => dot.classList.remove("is-active"));

    const activeSlide = qs(`[data-banner-index='${index}']`, shell) || slides[index];
    const activeDot = qs(`[data-banner-dot='${index}']`, shell) || dots[index];

    if (activeSlide) activeSlide.classList.add("is-active");
    if (activeDot) activeDot.classList.add("is-active");
  }

  function next() { activateSlide(index + 1); }
  function prev() { activateSlide(index - 1); }

  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = null;
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(next, 3000);
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); startAutoplay(); });

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const dotIndex = parseInt(dot.getAttribute("data-banner-dot"), 10);
      if (!Number.isNaN(dotIndex)) {
        activateSlide(dotIndex);
        startAutoplay();
      }
    });
  });

  // Unified pointer swipe (touch + mouse)
  let startX = 0;
  let dragging = false;

  shell.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    stopAutoplay();
  });

  window.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    const endX = e.clientX;
    const diff = endX - startX;
    const threshold = 40;

    if (diff > threshold) prev();
    else if (diff < -threshold) next();

    dragging = false;
    startAutoplay();
  });

  // Pause autoplay when tab not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  activateSlide(0);
  startAutoplay();
}

/* -----------------------------
   FAQ (single open)
----------------------------- */
function setupFaq() {
  const items = qsa(".faq-item");
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      items.forEach(i => {
        i.classList.remove("is-open");
        const toggle = qs(".faq-toggle", i);
        if (toggle) toggle.textContent = "+";
      });
      if (!open) {
        item.classList.add("is-open");
        const toggle = qs(".faq-toggle", item);
        if (toggle) toggle.textContent = "−";
      }
    });
  });
}

/* -----------------------------
   Reviews: duplicate for seamless loop + auto speed
----------------------------- */
function setupReviewsInfinite() {
  const track = qs(".reviews-shell .reviews-track");
  if (!track) return;

  // prevent double cloning if called twice
  if (track.dataset.cloned === "1") return;

  const cards = qsa(".review-card", track);
  if (cards.length < 2) return;

  // Clone all cards once to make two identical halves (required for -50% loop)
  const frag = document.createDocumentFragment();
  cards.forEach(card => frag.appendChild(card.cloneNode(true)));
  track.appendChild(frag);

  track.dataset.cloned = "1";

  // Optional: set animation duration based on width (consistent speed)
  // speed ~ 60px/s
  requestAnimationFrame(() => {
    const halfWidth = track.scrollWidth / 2;
    const speed = 60; // px per second
    const duration = Math.max(12, Math.round(halfWidth / speed));
    track.style.animationDuration = `${duration}s`;
  });
}

/* -----------------------------
   Road timeline: play animation when visible
----------------------------- */
function setupRoadTimelineAnimation() {
  const steps = qsa(".road-step");
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.style.animationPlayState = "running";
      });
    },
    { threshold: 0.2 }
  );

  steps.forEach(step => {
    step.style.animationPlayState = "paused";
    observer.observe(step);
  });
}

/* -----------------------------
   Init
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupNavScroll();
  setupSectionReveal();
  setupParallax();
  setupBannerSlider();
  setupFaq();
  setupReviewsInfinite();
  setupRoadTimelineAnimation();
});
