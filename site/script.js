"use strict";

document.querySelector("#year").textContent = new Date().getFullYear();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealElements = document.querySelectorAll("[data-reveal]");
let observer = null;

function configureMotion() {
  observer?.disconnect();
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) =>
      element.classList.remove("reveal", "is-visible"),
    );
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -24px 0px" },
  );
  revealElements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
}
reducedMotion.addEventListener("change", configureMotion);
configureMotion();

document.querySelectorAll("[data-gallery]").forEach((rail) => {
  const controls = document.querySelector(
    `[data-gallery-controls="${rail.id}"]`,
  );
  if (!controls) return;
  const items = [...rail.querySelectorAll("figure")];
  const previous = controls.querySelector("[data-gallery-prev]");
  const next = controls.querySelector("[data-gallery-next]");
  const position = controls.querySelector("[data-gallery-position]");
  let selected = 0;
  let destination = null;
  let scrollTimer;
  let scrollFrame = 0;

  function nearestItem() {
    const box = rail.getBoundingClientRect();
    const center = box.left + rail.clientLeft + rail.clientWidth / 2;
    return items.reduce((nearest, item, index) => {
      const distance = (element) => {
        const rect = element.getBoundingClientRect();
        return Math.abs(rect.left + rect.width / 2 - center);
      };
      return distance(item) < distance(items[nearest]) ? index : nearest;
    }, 0);
  }

  function update(index) {
    selected = index;
    const text = `${index + 1} di ${items.length}`;
    if (position.textContent !== text) position.textContent = text;
    previous.disabled = index === 0;
    next.disabled = index === items.length - 1;
  }

  function refresh() {
    controls.hidden = rail.scrollWidth <= rail.clientWidth + 1;
    destination = null;
    update(nearestItem());
  }

  function moveTo(index) {
    index = Math.max(0, Math.min(items.length - 1, index));
    destination = index;
    const item = items[index].getBoundingClientRect();
    const box = rail.getBoundingClientRect();
    update(index);
    // Scroll only the gallery, keeping the reader's vertical position.
    rail.scrollTo({
      left:
        rail.scrollLeft +
        item.left -
        box.left -
        rail.clientLeft -
        (rail.clientWidth - item.width) / 2,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  }

  previous.addEventListener("click", () =>
    moveTo((destination ?? selected) - 1),
  );
  next.addEventListener("click", () => moveTo((destination ?? selected) + 1));
  rail.addEventListener("keydown", (event) => {
    if (event.target !== rail || event.ctrlKey || event.metaKey || event.altKey)
      return;
    const destinations = {
      ArrowLeft: (destination ?? selected) - 1,
      ArrowRight: (destination ?? selected) + 1,
      Home: 0,
      End: items.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    moveTo(destinations[event.key]);
  });
  rail.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          update(nearestItem());
        });
      }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        destination = null;
        update(nearestItem());
      }, 120);
    },
    { passive: true },
  );
  if ("ResizeObserver" in window) new ResizeObserver(refresh).observe(rail);
  else window.addEventListener("resize", refresh);
  refresh();
});
