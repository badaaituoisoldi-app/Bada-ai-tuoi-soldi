(() => {
  "use strict";

  const storageKey = "bada-site-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  let manualTheme = null;
  let toggle = null;
  let label = null;

  function validTheme(value) {
    return value === "light" || value === "dark" ? value : null;
  }

  try {
    manualTheme = validTheme(window.localStorage.getItem(storageKey));
  } catch {
    // The theme still works when storage is unavailable, including local files.
  }

  function applyTheme() {
    const theme = manualTheme || (systemTheme.matches ? "dark" : "light");
    const isDark = theme === "dark";
    root.dataset.theme = theme;
    if (themeColor) {
      themeColor.content = isDark ? "#1b1b21" : "#f2efe8";
    }
    if (toggle) {
      toggle.setAttribute("aria-checked", String(isDark));
      toggle.title = isDark ? "Attiva il tema chiaro" : "Attiva il tema scuro";
    }
    if (label) label.textContent = isDark ? "Scuro" : "Chiaro";
  }

  // Run before styles load so a saved preference is visible from the first paint.
  applyTheme();

  systemTheme.addEventListener("change", () => {
    if (!manualTheme) applyTheme();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    manualTheme = validTheme(event.newValue);
    applyTheme();
  });

  function bindToggle() {
    toggle = document.querySelector("#theme-toggle");
    label = document.querySelector("#theme-label");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      manualTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme();
      try {
        window.localStorage.setItem(storageKey, manualTheme);
      } catch {
        // Keep the user's choice for this page even if it cannot be saved.
      }
    });
    applyTheme();
    toggle.hidden = false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggle, { once: true });
  } else {
    bindToggle();
  }
})();
