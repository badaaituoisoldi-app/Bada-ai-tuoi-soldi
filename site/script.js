"use strict";

document.querySelector("#year").textContent = new Date().getFullYear();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const wideLayout = window.matchMedia("(min-width: 901px)");
const story = document.querySelector(".story-layout");
const stage = document.querySelector(".story-stage");
const chapters = [...document.querySelectorAll(".story-chapter")];
const chapterImages = chapters.map((chapter) =>
  chapter.querySelector(".chapter-image"),
);
const progress = document.querySelector(".reading-progress");
const heroVisual = document.querySelector(".hero-visual");
let activeChapter = -1;
let frameRequested = false;
let revealObserver = null;

function activateChapter(index, force = false) {
  if (!wideLayout.matches || index === activeChapter) return;
  // Non spostare un collegamento mentre viene usato da tastiera.
  if (!force && stage.querySelector(".chapter-image:focus-within")) return;
  activeChapter = index;
  document
    .querySelectorAll("[data-story-step]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.storyStep) === index),
      ),
    );
  chapters.forEach((chapter, item) => {
    const current = item === index;
    chapter.classList.toggle("is-current", current);
    chapterImages[item].classList.toggle("is-current", current);
    chapterImages[item].setAttribute("aria-hidden", String(!current));
    chapterImages[item].querySelector("a").tabIndex = current ? 0 : -1;
  });
}

function arrangeStory() {
  activeChapter = -1;
  if (wideLayout.matches) {
    chapterImages.forEach((image) => stage.append(image));
    stage.hidden = false;
    story.classList.add("is-enhanced");
    activateChapter(0);
  } else {
    chapterImages.forEach((image, index) => {
      image.classList.remove("is-current");
      image.removeAttribute("aria-hidden");
      image.querySelector("a").removeAttribute("tabindex");
      chapters[index].append(image);
      chapters[index].classList.remove("is-current");
    });
    story.classList.remove("is-enhanced");
    stage.hidden = true;
  }
  requestFrame();
}

function updateScroll() {
  frameRequested = false;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount =
    scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  progress.style.transform = `scaleX(${amount})`;
  heroVisual.style.setProperty(
    "--hero-pan",
    reducedMotion.matches
      ? "0px"
      : `${-Math.min(window.scrollY, 750) * 0.055}px`,
  );
  if (wideLayout.matches) {
    const readingLine = window.innerHeight * 0.46;
    let closest = 0;
    let distance = Infinity;
    chapters.forEach((chapter, index) => {
      const box = chapter.getBoundingClientRect();
      const nextDistance = Math.abs(box.top + box.height / 2 - readingLine);
      if (nextDistance < distance) {
        closest = index;
        distance = nextDistance;
      }
    });
    activateChapter(closest);
  }
}

function requestFrame() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(updateScroll);
}

function configureMotion() {
  revealObserver?.disconnect();
  const elements = document.querySelectorAll("[data-reveal]");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) =>
      element.classList.remove("reveal", "in-view"),
    );
    requestFrame();
    return;
  }
  // L’ingresso si ripete quando si torna su una sezione. Il contenuto resta
  // disponibile senza script e il movimento è più ampio di una semplice dissolvenza.
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        entry.target.classList.toggle("in-view", entry.isIntersecting),
      );
    },
    { rootMargin: "70px 0px -24px 0px", threshold: 0 },
  );
  elements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
  requestFrame();
}

document.querySelectorAll("[data-story-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.storyStep);
    activateChapter(index, true);
    chapters[index].scrollIntoView({
      block: "center",
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  });
});

window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame, { passive: true });
wideLayout.addEventListener("change", arrangeStory);
reducedMotion.addEventListener("change", configureMotion);
document.fonts.ready.then(requestFrame);
arrangeStory();
configureMotion();
