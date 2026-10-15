"use strict";
const form = document.querySelector(".calculator");
const fields = [...form.querySelectorAll("input")];
const output = document.querySelector("#result");
const label = document.querySelector("#result-label");
const help = document.querySelector("#result-help");
const currency = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});
function updateAvailable() {
  const invalid = fields.some(
    (field) => !field.validity.valid || field.value === "",
  );
  if (invalid) {
    output.value = "—";
    label.textContent = "Controlla gli importi";
    help.textContent =
      "Usa importi da 0 a 100.000.000 €, con al massimo due decimali.";
    output.parentElement.classList.remove("negative");
    return;
  }
  const [income, expenses, margin, goals] = fields.map((field) =>
    Math.round(field.valueAsNumber * 100),
  );
  const available = income - expenses - margin - goals;
  output.value = currency.format(available / 100);
  label.textContent = available < 0 ? "Disponibile negativo" : "Disponibile";
  help.textContent =
    available < 0
      ? "Spese, margine e obiettivi superano le entrate. Rivedi le somme destinate."
      : "Dopo spese, margine e obiettivi.";
  output.parentElement.classList.toggle("negative", available < 0);
  fitResult();
}
// Mantiene leggibile anche il risultato di importi molto grandi, senza troncarlo.
function fitResult() {
  output.style.fontSize = "";
  const space = output.clientWidth;
  if (space > 0 && output.scrollWidth > space) {
    const size = parseFloat(getComputedStyle(output).fontSize);
    output.style.fontSize = `${Math.floor((size * space) / output.scrollWidth)}px`;
  }
}
form.addEventListener("input", updateAvailable);
form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("reset", () => requestAnimationFrame(updateAvailable));
window.addEventListener("resize", fitResult);
document.fonts.ready.then(fitResult);
updateAvailable();
document.querySelector("#year").textContent = new Date().getFullYear();

// Il collegamento all’originale funziona anche senza JavaScript.
const screenshotDialog = document.querySelector(".screenshot-dialog");
const screenshotTitle = document.querySelector("#screenshot-title");
const screenshotMedia = document.querySelector(".dialog-media");
if (typeof screenshotDialog.showModal === "function") {
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
    .addEventListener("click", () => screenshotDialog.close());
  screenshotDialog.addEventListener("click", (event) => {
    if (event.target === screenshotDialog) screenshotDialog.close();
  });
  screenshotDialog.addEventListener("close", () =>
    screenshotMedia.replaceChildren(),
  );
}
