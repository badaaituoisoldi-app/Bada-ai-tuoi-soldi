# Bada! — ai tuoi soldi · sito ufficiale

Landing page italiana per l’app Android Bada!. HTML, CSS e JavaScript statici, senza backend, dipendenze di produzione, tracker o richieste a font esterni. La demo esegue i calcoli nella pagina e non salva i valori.

## Avvio locale

Servono solo Python 3 e un browser:

```sh
cd /workspace/Bada-ai-tuoi-soldi
python3 -m http.server 8000 --directory site
```

Apri `http://localhost:8000`. Per verificare anche il percorso GitHub Pages su Linux/macOS:

```sh
mkdir -p /tmp/bada-preview
ln -s "$(pwd)/site" /tmp/bada-preview/Bada-ai-tuoi-soldi
python3 -m http.server 8000 --directory /tmp/bada-preview
```

Se il link esiste già, riusalo verificando la destinazione. Apri `http://localhost:8000/Bada-ai-tuoi-soldi/`. Non è necessaria una compilazione.

## File

- `site/index.html`: sezioni, contenuti, metadati SEO/Open Graph, FAQ native.
- `site/styles.css`: layout responsive, temi delle sezioni, focus e movimento ridotto.
- `site/script.js`: demo del disponibile, validazione degli importi e anno nel footer.
- `site/assets/`: logo originale, feature graphic dello store per Open Graph, screenshot e DM Sans locale con licenza OFL.
- `.github/workflows/pages.yml`: distribuzione con azioni ufficiali GitHub Pages.
- `tests/browser.cjs`: verifiche browser ripetibili, incluse accessibilità automatica.
- `docs/SOURCES.md`: fonti consultate, provenienza degli asset e limiti.
- `docs/VALIDATION.md`: controlli eseguiti e risultati.

## Logo e screenshot

Il logo originale proviene da `assets/logo.png` del repository dell’app: la “b” e il punto esclamativo disposto come un sorriso. Non è stato ridisegnato. Per sostituirlo, conserva proporzioni e trasparenza; aggiorna anche favicon e immagine Open Graph, se necessario.

Il titolare ha fornito le immagini della scheda Play Store nell’archivio `Nuova cartella.zip`: sei schermate promozionali in tema chiaro (1080 × 1920), la feature graphic (1024 × 500) e una copertina. Gli originali dei sei `store-*.png` sono in `site/assets/screenshots/`; `site/assets/feature-graphic.png` è usata per Open Graph. Sono immagini integre: testi, importi e controlli non sono stati modificati.

L’apertura mostra `store-1-mese.png`. La galleria responsive presenta Mese, Entrate/uscite, Obiettivi, Anno, Importazione e Impostazioni; la demo interattiva occupa una sezione dedicata prima delle funzioni. Non sono presenti schermate dedicate alle Spese fisse o al tema scuro: si possono aggiungere in futuro, ma le immagini fornite coprono già la galleria attuale. Per nuove immagini conserva proporzioni, testi e dati originali, specifica dimensioni e testo alternativo e usa il caricamento differito sotto il primo schermo.

Prima della pubblicazione confronta le funzioni con lo store corrente: in questa attività Google Play non era raggiungibile. Le immagini fornite documentano l’interfaccia, ma non stabiliscono la versione attualmente distribuita o il prezzo dello store. I dettagli sulla provenienza sono in `docs/SOURCES.md`.

## Verifiche browser

Il sito non richiede Node. Per eseguire i soli test, installa gli strumenti fuori dal checkout:

```sh
npm install --prefix /tmp/bada-tools --cache /tmp/npm-cache playwright @axe-core/playwright
NODE_PATH=/tmp/bada-tools/node_modules node tests/browser.cjs
```

Il server deve essere in esecuzione al percorso `/Bada-ai-tuoi-soldi/` sulla porta 8000. È usato Chromium in `/usr/bin/chromium`; personalizza con `CHROMIUM_PATH`. Puoi cambiare l’indirizzo con `SITE_URL`. Le immagini dei test vengono salvate in `/tmp/bada-320.png`, `/tmp/bada-360.png`, `/tmp/bada-390.png`, `/tmp/bada-430.png`, `/tmp/bada-768.png`, `/tmp/bada-1024.png`, `/tmp/bada-1440.png`.

Controllare anche visivamente desktop e telefono, testi e asset dopo ogni modifica. Il controllo automatico di accessibilità non sostituisce una verifica manuale con tecnologie assistive.

## GitHub Pages: prima pubblicazione

1. Verifica il contenuto rispetto alla versione pubblicata e controlla le immagini fornite dal titolare.
2. Nel repository GitHub seleziona **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Rivedi e salva i file con un commit, quindi esegui il push su `main`. Il workflow pubblica esclusivamente `site/`.
4. In alternativa avvia **Actions → Deploy static site to GitHub Pages → Run workflow** su `main`.
5. Attendi l’esito del job `deploy` e verifica `https://badaaituoisoldi-app.github.io/Bada-ai-tuoi-soldi/`, inclusi immagini, font, navigazione e demo.

Gli aggiornamenti successivi vengono distribuiti a ogni push su `main`. Tutti gli asset usano percorsi relativi; se cambia il nome del repository, aggiorna canonical e URL assoluti Open Graph. Non inserire credenziali o dati dell’app in questo repository. Nessun push o deploy è stato effettuato durante la realizzazione.
