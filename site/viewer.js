"use strict";

// The source is always the user's original PNG. A cropped viewport hides the
// Play Store poster without editing its pixels. Links keep their native fallback.
(() => {
  const dialog = document.querySelector(".screenshot-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const title = dialog.querySelector("#screenshot-title");
  const stage = dialog.querySelector(".viewer-stage");
  const canvas = dialog.querySelector(".viewer-canvas");
  const closeButton = dialog.querySelector(".dialog-close");
  const zoomOut = dialog.querySelector("#viewer-zoom-out");
  const zoomIn = dialog.querySelector("#viewer-zoom-in");
  const zoomLabel = dialog.querySelector("#viewer-zoom");
  const fitButton = dialog.querySelector("#viewer-fit");
  const actualButton = dialog.querySelector("#viewer-actual");
  const originalLink = dialog.querySelector("#viewer-original");
  if (
    !title ||
    !stage ||
    !canvas ||
    !closeButton ||
    !zoomOut ||
    !zoomIn ||
    !zoomLabel ||
    !fitButton ||
    !actualButton ||
    !originalLink
  )
    return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const minScale = 0.25;
  const maxScale = 2;
  let source = null;
  let frame = null;
  let sourceWidth = 1080;
  let sourceHeight = 1920;
  let crop = { x: 0, y: 0, width: 1080, height: 1920 };
  let scale = 1;
  let returnFocus = null;
  let priorOverflow = "";
  let hadOpenClass = false;
  let openingAnimation = null;
  let closingAnimation = null;
  let closing = false;
  let openVersion = 0;
  let drag = null;
  let sizing = "initial";

  function readCrop(value, width, height) {
    const fullImage = { x: 0, y: 0, width, height };
    if (!value || !/^\d+(?:\s+\d+){3}$/.test(value.trim())) return fullImage;
    const [x, y, cropWidth, cropHeight] = value.trim().split(/\s+/).map(Number);
    if (
      ![x, y, cropWidth, cropHeight].every(Number.isSafeInteger) ||
      cropWidth <= 0 ||
      cropHeight <= 0 ||
      x + cropWidth > width ||
      y + cropHeight > height
    )
      return fullImage;
    return { x, y, width: cropWidth, height: cropHeight };
  }

  function availableWidth() {
    const styles = window.getComputedStyle(canvas);
    return Math.max(
      1,
      stage.clientWidth -
        (parseFloat(styles.paddingLeft) || 0) -
        (parseFloat(styles.paddingRight) || 0),
    );
  }

  function stopDragging() {
    if (drag && stage.hasPointerCapture(drag.id)) {
      stage.releasePointerCapture(drag.id);
    }
    drag = null;
    stage.classList.remove("is-dragging");
  }

  function setScale(nextScale, reset = false) {
    if (!source || !frame || !dialog.open) return;
    const stageBox = stage.getBoundingClientRect();
    const oldBox = frame.getBoundingClientRect();
    const centerX = stageBox.left + stage.clientLeft + stage.clientWidth / 2;
    const centerY = stageBox.top + stage.clientTop + stage.clientHeight / 2;
    const imageX = (centerX - oldBox.left) / scale;
    const imageY = (centerY - oldBox.top) / scale;

    scale = Math.min(maxScale, Math.max(minScale, nextScale));
    frame.style.width = `${crop.width * scale}px`;
    frame.style.height = `${crop.height * scale}px`;
    const cropped =
      crop.x > 0 ||
      crop.y > 0 ||
      crop.width < sourceWidth ||
      crop.height < sourceHeight;
    // The supplied app screen has a 48 px corner radius at its natural size.
    frame.style.borderRadius = cropped ? `${48 * scale}px` : "0";
    source.style.width = `${sourceWidth * scale}px`;
    source.style.height = `${sourceHeight * scale}px`;
    source.style.left = `${-crop.x * scale}px`;
    source.style.top = `${-crop.y * scale}px`;
    source.style.maxWidth = "none";
    zoomLabel.value = `${Math.round(scale * 100)}%`;
    zoomLabel.textContent = zoomLabel.value;
    zoomOut.disabled = scale <= minScale + 0.001;
    zoomIn.disabled = scale >= maxScale - 0.001;
    actualButton.setAttribute(
      "aria-pressed",
      String(Math.abs(scale - 1) < 0.001),
    );
    fitButton.setAttribute("aria-pressed", String(sizing === "fit"));

    if (reset) {
      stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      stage.scrollTop = 0;
    } else {
      // Keep the source pixel beneath the viewport centre in the same place.
      const nextBox = frame.getBoundingClientRect();
      stage.scrollLeft += nextBox.left + imageX * scale - centerX;
      stage.scrollTop += nextBox.top + imageY * scale - centerY;
    }
  }

  function fit() {
    sizing = "fit";
    setScale(availableWidth() / crop.width, true);
  }

  function updateInitialSize() {
    const initialScale = Math.min(1, availableWidth() / crop.width);
    sizing = initialScale < 1 ? "fit" : "actual";
    setScale(initialScale, true);
  }

  function resetDialog() {
    openVersion += 1;
    stopDragging();
    openingAnimation?.cancel();
    closingAnimation?.cancel();
    openingAnimation = null;
    closingAnimation = null;
    canvas.replaceChildren();
    source = null;
    frame = null;
    stage.removeAttribute("aria-busy");
    dialog.classList.remove("is-opening", "is-closing");
    document.body.style.overflow = priorOverflow;
    if (!hadOpenClass) document.body.classList.remove("screenshot-open");
    closing = false;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  async function close() {
    if (!dialog.open || closing) return;
    closing = true;
    stopDragging();
    openingAnimation?.cancel();
    dialog.classList.remove("is-opening");
    dialog.classList.add("is-closing");
    if (!motion.matches && typeof dialog.animate === "function") {
      closingAnimation = dialog.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(10px)" },
        ],
        { duration: 160, easing: "ease-in", fill: "forwards" },
      );
      await closingAnimation.finished.catch(() => {});
    }
    if (dialog.open) dialog.close();
  }

  document.querySelectorAll(".screenshot-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        dialog.open
      )
        return;

      try {
        dialog.showModal();
      } catch {
        // An unavailable dialog must never turn a working PNG link into a dead end.
        return;
      }
      event.preventDefault();
      const version = ++openVersion;
      returnFocus = link;
      priorOverflow = document.body.style.overflow;
      hadOpenClass = document.body.classList.contains("screenshot-open");
      document.body.style.overflow = "hidden";
      document.body.classList.add("screenshot-open");
      title.textContent = link.dataset.title || "Schermata dell’app";
      originalLink.href = link.href;
      stage.setAttribute("aria-busy", "true");

      const thumbnail = link.querySelector("img");
      const image = new Image();
      image.className = "viewer-image";
      image.alt = thumbnail?.alt || title.textContent;
      image.decoding = "async";
      image.draggable = false;
      image.style.position = "absolute";
      image.style.margin = "0";
      sourceWidth = thumbnail?.naturalWidth || 1080;
      sourceHeight = thumbnail?.naturalHeight || 1920;
      crop = readCrop(link.dataset.crop, sourceWidth, sourceHeight);
      image.width = sourceWidth;
      image.height = sourceHeight;
      frame = document.createElement("div");
      frame.className = "viewer-frame";
      frame.style.position = "relative";
      frame.style.overflow = "hidden";
      frame.append(image);
      source = image;
      sizing = "initial";
      scale = 1;
      canvas.replaceChildren(frame);
      updateInitialSize();

      image.addEventListener(
        "load",
        () => {
          if (version !== openVersion || source !== image || !dialog.open)
            return;
          sourceWidth = image.naturalWidth;
          sourceHeight = image.naturalHeight;
          crop = readCrop(link.dataset.crop, sourceWidth, sourceHeight);
          image.width = sourceWidth;
          image.height = sourceHeight;
          stage.removeAttribute("aria-busy");
          if (sizing === "initial") updateInitialSize();
          else if (sizing === "fit") fit();
          else setScale(scale);
        },
        { once: true },
      );
      image.addEventListener(
        "error",
        () => {
          if (version !== openVersion || source !== image || !dialog.open)
            return;
          stage.removeAttribute("aria-busy");
          const message = document.createElement("p");
          message.className = "viewer-error";
          message.textContent =
            "Impossibile caricare la schermata. Prova il collegamento «File originale».";
          canvas.replaceChildren(message);
          source = null;
          frame = null;
        },
        { once: true },
      );
      image.src = link.href;

      closeButton.focus({ preventScroll: true });
      if (!motion.matches && typeof dialog.animate === "function") {
        dialog.classList.add("is-opening");
        openingAnimation = dialog.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 240, easing: "cubic-bezier(.16,1,.3,1)" },
        );
        openingAnimation.finished
          .then(() => {
            if (version === openVersion) dialog.classList.remove("is-opening");
          })
          .catch(() => {});
      }
    });
  });

  zoomOut.addEventListener("click", () => {
    sizing = "manual";
    setScale(scale - 0.25);
  });
  zoomIn.addEventListener("click", () => {
    sizing = "manual";
    setScale(scale + 0.25);
  });
  fitButton.addEventListener("click", fit);
  actualButton.addEventListener("click", () => {
    sizing = "actual";
    setScale(1);
  });
  closeButton.addEventListener("click", close);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("close", resetDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      sizing = "manual";
      setScale(scale + 0.25);
    } else if (event.key === "-") {
      event.preventDefault();
      sizing = "manual";
      setScale(scale - 0.25);
    } else if (event.key === "0") {
      event.preventDefault();
      fit();
    } else if (event.key === "1") {
      event.preventDefault();
      sizing = "actual";
      setScale(1);
    }
  });

  // Mouse dragging complements scrollbars and trackpads; touch stays native so
  // the screenshot can be scrolled along both axes without custom gestures.
  stage.addEventListener("pointerdown", (event) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      !source ||
      !canvas.contains(event.target)
    )
      return;
    event.preventDefault();
    stage.focus({ preventScroll: true });
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: stage.scrollLeft,
      top: stage.scrollTop,
    };
    stage.setPointerCapture(event.pointerId);
    stage.classList.add("is-dragging");
  });
  stage.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    stage.scrollLeft = drag.left - (event.clientX - drag.x);
    stage.scrollTop = drag.top - (event.clientY - drag.y);
  });
  stage.addEventListener("pointerup", stopDragging);
  stage.addEventListener("pointercancel", stopDragging);
  stage.addEventListener("lostpointercapture", () => {
    drag = null;
    stage.classList.remove("is-dragging");
  });

  window.addEventListener("resize", () => {
    if (!dialog.open || !source || closing) return;
    if (sizing === "fit") fit();
    else if (sizing === "initial") updateInitialSize();
  });
  motion.addEventListener("change", () => {
    if (!motion.matches) return;
    openingAnimation?.finish();
    closingAnimation?.finish();
  });
})();
