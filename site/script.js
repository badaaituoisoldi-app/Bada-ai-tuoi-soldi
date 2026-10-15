"use strict";

document.querySelector("#year").textContent = new Date().getFullYear();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// I contenuti sono visibili senza JavaScript o con movimento ridotto.
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const targets = document.querySelectorAll(
    ".hero-intro, .hero-screen, .section-top, .steps article, .balance-note, " +
      ".feature-intro, .feature-card, .extras article, .gallery-heading, " +
      ".screenshots-grid figure, .privacy-heading, .privacy-content li, " +
      ".faq-section > div, .closing > div, .closing > img",
  );
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -32px 0px", threshold: 0 },
  );
  targets.forEach((target) => {
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
  reducedMotion.addEventListener("change", (event) => {
    if (!event.matches) return;
    revealObserver.disconnect();
    targets.forEach((target) => target.classList.add("is-visible"));
  });
}

// Ogni collegamento apre sempre il PNG originale fornito dall’utente.
const screenshotDialog = document.querySelector(".screenshot-dialog");
const screenshotTitle = document.querySelector("#screenshot-title");
const screenshotMedia = document.querySelector(".dialog-media");
if (typeof screenshotDialog.showModal === "function") {
  let closing = false;
  async function closeScreenshot() {
    if (!screenshotDialog.open || closing) return;
    closing = true;
    if (
      !reducedMotion.matches &&
      typeof screenshotDialog.animate === "function"
    ) {
      const exit = screenshotDialog.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(6px)" },
        ],
        { duration: 120, easing: "ease-in", fill: "forwards" },
      );
      await exit.finished.catch(() => {});
      screenshotDialog.close();
      exit.cancel();
    } else {
      screenshotDialog.close();
    }
    closing = false;
  }
  document.querySelectorAll(".screenshot-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      const image = document.createElement("img");
      image.src = link.href;
      image.alt = link.querySelector("img").alt;
      image.width = 1080;
      image.height = 1920;
      screenshotTitle.textContent = link.dataset.title;
      screenshotMedia.replaceChildren(image);
      screenshotDialog.showModal();
    });
  });
  document
    .querySelector(".dialog-close")
    .addEventListener("click", closeScreenshot);
  screenshotDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeScreenshot();
  });
  screenshotDialog.addEventListener("click", (event) => {
    if (event.target === screenshotDialog) closeScreenshot();
  });
  screenshotDialog.addEventListener("close", () => {
    if (!screenshotDialog.open) screenshotMedia.replaceChildren();
  });
}
