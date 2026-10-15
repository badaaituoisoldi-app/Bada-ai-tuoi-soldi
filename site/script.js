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
