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
          if (isIntersecting) target.play().catch(() => {});
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
const tocLinks = document.querySelectorAll(".toc a[href^='#']");

if (tocLinks.length && "IntersectionObserver" in window) {
  const linkFor = new Map(
    [...tocLinks].map((link) => [link.getAttribute("href").slice(1), link]),
  );
  const visible = new Set();

  const setActive = (id) => {
    tocLinks.forEach((link) => link.removeAttribute("aria-current"));
    linkFor.get(id)?.setAttribute("aria-current", "true");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      // The first section (in page order) that is on screen wins.
      const current = [...linkFor.keys()].find((id) => visible.has(id));
      if (current) setActive(current);
    },
    { rootMargin: "0px 0px -60% 0px" },
  );

  linkFor.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  setActive([...linkFor.keys()][0]);
}
