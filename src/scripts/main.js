// Mobile nav: the menu button shows/hides the links under 768px.
document.querySelectorAll(".site-nav").forEach((nav) => {
  const toggle = nav.querySelector(".site-nav__toggle");
  if (!toggle) return;
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.toggleAttribute("data-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.hasAttribute("data-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (nav.hasAttribute("data-open") && !nav.contains(event.target)) setOpen(false);
  });
});

// Play looping demo videos only while they're on screen. With reduced motion,
// leave them on their poster frame and offer controls instead.
const demoVideos = document.querySelectorAll("video[data-autoplay]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (demoVideos.length) {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    demoVideos.forEach((video) => {
      video.controls = true;
    });
  } else {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          // If the browser blocks autoplay (e.g. Low Power Mode), show controls
          // so the video can still be started by hand.
          if (isIntersecting) target.play().catch(() => { target.controls = true; });
          else target.pause();
        });
      },
      { rootMargin: "200px 0px" },
    );
    demoVideos.forEach((video) => videoObserver.observe(video));
  }
}

// Custom horizontal scrollbars: the thumb mirrors the viewport's scroll
// position, can be dragged, and clicking the track jumps to that spot.
document.querySelectorAll("[data-scroller]").forEach((scroller) => {
  const viewport = scroller.querySelector(".scroller__viewport");
  const track = scroller.querySelector(".scroller__track");
  const thumb = scroller.querySelector(".scroller__thumb");
  const MIN_THUMB = 40;

  const metrics = () => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const trackWidth = track.clientWidth;
    const thumbWidth = Math.max(MIN_THUMB, (viewport.clientWidth / viewport.scrollWidth) * trackWidth);
    return { maxScroll, maxThumb: trackWidth - thumbWidth, thumbWidth };
  };

  const update = () => {
    const { maxScroll, maxThumb, thumbWidth } = metrics();
    scroller.classList.toggle("scroller--static", maxScroll <= 1);
    thumb.style.width = `${thumbWidth}px`;
    const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
    thumb.style.transform = `translateX(${progress * maxThumb}px)`;
  };

  // Scroll so the thumb's left edge sits at `thumbX` pixels along the track.
  const scrollToThumbX = (thumbX, behavior = "auto") => {
    const { maxScroll, maxThumb } = metrics();
    const progress = maxThumb > 0 ? Math.min(Math.max(thumbX / maxThumb, 0), 1) : 0;
    viewport.scrollTo({ left: progress * maxScroll, behavior });
  };

  let dragOffset = null;

  thumb.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragOffset = event.clientX - thumb.getBoundingClientRect().left;
    thumb.setPointerCapture(event.pointerId);
    scroller.classList.add("scroller--dragging");
  });

  thumb.addEventListener("pointermove", (event) => {
    if (dragOffset === null) return;
    scrollToThumbX(event.clientX - track.getBoundingClientRect().left - dragOffset);
  });

  const endDrag = () => {
    dragOffset = null;
    scroller.classList.remove("scroller--dragging");
  };
  thumb.addEventListener("pointerup", endDrag);
  thumb.addEventListener("pointercancel", endDrag);

  track.addEventListener("pointerdown", (event) => {
    if (event.target === thumb) return;
    const { thumbWidth } = metrics();
    const x = event.clientX - track.getBoundingClientRect().left - thumbWidth / 2;
    scrollToThumbX(x, "smooth");
  });

  viewport.addEventListener("scroll", update, { passive: true });
  new ResizeObserver(update).observe(viewport);
  viewport.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", update, { once: true });
  });
  update();
});

// Highlight the case study's "On this page" link for the section in view.
const tocLinks = document.querySelectorAll(".toc a[href^='#'], .case-toc-mobile a[href^='#']");

if (tocLinks.length && "IntersectionObserver" in window) {
  const ids = [...new Set([...tocLinks].map((link) => link.getAttribute("href").slice(1)))];
  const visible = new Set();

  const setActive = (id) => {
    tocLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      // The first section (in page order) that is on screen wins.
      const current = ids.find((id) => visible.has(id));
      if (current) setActive(current);
    },
    { rootMargin: "0px 0px -60% 0px" },
  );

  ids.forEach((id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  setActive(ids[0]);
}

// Close the mobile "On this page" menu after picking a section.
document.querySelectorAll(".case-toc-mobile").forEach((details) => {
  details.addEventListener("click", (event) => {
    if (event.target.closest("a")) details.open = false;
  });
});

// Tap-to-enlarge: wide images (img[data-zoom]) open full size in a dialog
// you can pan around. The image's alt text names the button.
const zoomImages = document.querySelectorAll("img[data-zoom]");

if (zoomImages.length && "HTMLDialogElement" in window) {
  const dialog = document.createElement("dialog");
  dialog.className = "zoom-dialog";
  dialog.innerHTML =
    '<div class="zoom-dialog__scroll"><img alt="" /></div>' +
    '<button class="zoom-dialog__close" type="button">Close</button>';
  document.body.append(dialog);
  const big = dialog.querySelector("img");
  dialog.querySelector(".zoom-dialog__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    big.removeAttribute("src");
    dialog.returnFocus?.focus();
  });

  zoomImages.forEach((img) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zoom-btn";
    button.setAttribute("aria-label", `Enlarge image: ${img.alt}`);
    img.replaceWith(button);
    button.append(img);

    button.addEventListener("click", () => {
      big.src = img.dataset.zoom || img.currentSrc || img.src;
      big.alt = img.alt;
      dialog.returnFocus = button;
      dialog.showModal();
    });
  });
}
