# Bada! — ai tuoi soldi · sito ufficiale

Landing page dell’app Android Bada!, in italiano e inglese. Due pagine HTML scritte a mano e un unico `styles.css` condiviso, entro 12.000 byte: nessuna build, JavaScript, dipendenza di produzione, richiesta a servizi di terzi o font esterno. Il tema segue il sistema tramite `prefers-color-scheme`.

La nuova versione è preparata su un branch dedicato per una pull request verso `main`. Il merge pubblica il sito: la consegna di questa revisione non comprende il merge né la pubblicazione.

## Avvio locale

Dalla radice del repository, servi anche il percorso di progetto usato da GitHub Pages:

```sh
mkdir -p /tmp/bada-preview
ln -s "$(pwd)/site" /tmp/bada-preview/Bada-ai-tuoi-soldi
python3 -m http.server 8000 --directory /tmp/bada-preview
```

Se il collegamento esiste già, verifica che punti alla cartella `site/` di questo checkout e riusalo. Apri <http://127.0.0.1:8000/Bada-ai-tuoi-soldi/> oppure <http://127.0.0.1:8000/Bada-ai-tuoi-soldi/en/>. Gli asset hanno percorsi relativi; non aprire l’HTML separandolo dalla cartella `site/`.

## Struttura

- `site/index.html` e `site/en/index.html`: pagine italiana e inglese, metadati e contenuti equivalenti. Le schermate restano italiane, con una nota nella pagina inglese.
- `site/styles.css`: layout, font locale, tema chiaro/scuro di sistema e focus visibile. Il `body` ha uno sfondo esplicito. Tutte le misure sono in `rem` (i punti di rottura in `em`), così seguono la dimensione del testo scelta nel browser; sopra 1600 e 2200 px di larghezza la radice cresce a 18 e 20 px e tutto scala con lei. Spaziature, dimensioni del testo e raggi usano i token su `:root`: `--s1`…`--s8` (0,25…4 rem, cioè 4…64 px a 16 px), `--f1`…`--f5` (13, 16, 21, 27, 32 px), `--fh1` e `--fh2` per i titoli, `--r1`…`--r4` (3, 10, 14, 24 px). I punti di rottura sono due: 900 px (apertura e prove su una colonna) e 700 px (telefono: i telefoni dell’apertura escono dal bordo della sezione e le tre schermate scorrono di lato con aggancio).
- `site/assets/screenshots/*.webp`: otto schermate intere dell’app (Mese, Entrate/uscite, Obiettivi, Importazione, ciascuna in tema chiaro e scuro), WebP lossless a 780 × 1688 px. L’apertura mostra Mese chiara e scura sovrapposte; le tre funzioni usano `<picture>` e seguono il tema del visitatore. L’ingrandimento è quello del browser.
- `site/assets/icon.png`: icona ufficiale per testata, favicon e Apple touch icon.
- `site/assets/feature-graphic.png`: immagine Open Graph/Twitter fornita dal titolare.
- `site/assets/fonts/`: DM Sans locale, precaricato con `font-display: swap`, e licenza OFL.
- `site/sitemap.xml`: le due pagine pubbliche. `.nojekyll` mantiene la pubblicazione statica.
- `originals/`: i sei poster PNG ricevuti, i PNG sorgente delle schermate (`app-2026-10-19/`), esclusi dalla cartella pubblicata, con i dati di prova e lo script che le ha prodotte.
- `scripts/check_site.py`: guardia dei file da pubblicare.
- `scripts/play_links.py`: formato unico dei collegamenti a Google Play e verifica degli URL scritti nell’HTML.
- `tests/browser.cjs`: controlli Playwright e axe.
- `docs/SOURCES.md`, `docs/ROADMAP.md`, `docs/VALIDATION.md`: fonti, percorso della ricostruzione e verifiche effettivamente eseguite.

La pagina presenta il disponibile reale con due telefoni (chiaro e scuro), le prove verificabili sulla privacy, tre funzioni con una schermata intera ciascuna (spese, obiettivi, importazione CSV) e una riga per le altre, backup, limiti dell’app, tre domande con risposte sempre aperte, Antonio e l’invito finale. Solo la spiegazione dei permessi usa un `<details>` nativo. Non ci sono gallerie, visualizzatore personalizzato, selettore del tema o JSON-LD. La rifinitura del 17 ottobre aggiunge transizioni solo CSS: ingresso dell’apertura in 650 ms, sollevamento di 3 px dei link a immagini/store al passaggio del mouse e un ingresso verticale delle funzioni legato allo scorrimento, nei browser che supportano `animation-timeline: view()`. Nessun elemento viene nascosto con opacità o visibilità: anche uno scorrimento rapido mantiene leggibili i contenuti. Tutti gli effetti e lo scorrimento morbido sono attivi soltanto con `prefers-reduced-motion: no-preference`; altrimenti il sito resta fermo.

## Immagini e come rifarle

Le schermate sono screenshot veri dell'app, non ritagli dei poster (che restano in `originals/` e non sono più usati nella pagina). Si fanno dalla versione web di Expo servita da Metro, in una **copia di lavoro** dell'app: il repository dell'app non cambia. Nella copia servono `react-native-web`, `react-dom` e `@expo/metro-runtime` alle versioni di `expo/bundledNativeModules.json`, la piattaforma `web` in `app.json`, un `try/catch` attorno a `Notifications.getLastNotificationResponse()` (sul web lancia) e, solo per la schermata di importazione, un file di prova al posto di `File.pickFileAsync` (sul web il selettore non esiste).

`originals/app-2026-10-19/seed.cjs` contiene i dati inventati (stipendio 1.850 €, margine 8%, quattro spese fisse, due obiettivi, ottobre 2026), `final.cjs` guida Playwright a 390 × 844 px con densità 2 e orologio fissato al 19 ottobre 2026, `estratto.csv` è l'estratto di prova. Le cifre tornano: 1.850 − 1.355,57 − margine 148 = 346,43 €. I PNG sono salvati in WebP lossless senza altro ritocco:

```sh
python3 -c 'from PIL import Image; import glob,os; [Image.open(f).convert("RGB").save("site/assets/screenshots/"+n+".webp", format="WEBP", lossless=True, quality=100, method=6, exact=True) for f,n in [("originals/app-2026-10-19/%s-%s.png"%(t,i), "%s-%s"%(e,t)) for t in ("light","dark") for i,e in (("mese","month"),("spese","movements"),("obiettivi","goals"),("importazione","import"))]]'
```

Limiti: sono schermate del rendering web, non di un telefono (i font possono differire di poco); le immagini vanno rifatte a ogni cambio grafico dell'app. Ogni file resta sotto i 100.000 byte (la guardia lo impone). Il collegamento «ingrandisci» punta sempre alla versione chiara.

`site/assets/icon.png` è il PNG 192 × 192 già presente su `main`, invariato in questa revisione, verificato rispetto all'icona ufficiale 1024 × 1024 dell'app ridimensionata con Pillow `Image.Resampling.LANCZOS`. Il marchio non viene ridisegnato: il sorriso è il punto esclamativo di «Bada!». La feature graphic resta l'originale fornito.

## Collegamenti Google Play

Il formato UTM si mantiene in un solo punto, `scripts/play_links.py`; il sito continua a contenere quattro normali link HTML, senza script nel browser. `data-play` identifica pagina e posizione: `home-hero`, `home-fine`, `en-hero`, `en-fine`.

```sh
python3 scripts/play_links.py
python3 scripts/play_links.py --write
```

Il primo comando verifica gli URL, il secondo li aggiorna. `utm_source=sito` e `utm_campaign=<pagina>-<posizione>` distinguono i collegamenti; il riconoscimento di questa forma da parte di Play Console non è verificato. I badge ufficiali sono ancora da aggiungere: il download da Google è stato bloccato con HTTP 403. Al loro posto ci sono link testuali funzionanti, non badge ricostruiti.

## Verifiche

Il sito non richiede Node. I soli strumenti di test si installano fuori dal repository, senza scaricare un browser:

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --prefix /tmp/bada-tools --cache /tmp/bada-npm-cache playwright@1.56.1 @axe-core/playwright@4.10.2
NODE_PATH=/tmp/bada-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/browser.cjs
python3 scripts/check_site.py site
python3 scripts/play_links.py
```

La suite richiede il server sulla porta 8000 al percorso `/Bada-ai-tuoi-soldi/`. `SITE_URL` consente di cambiarlo. `CHROMIUM_PATH` punta al Chromium dell’ambiente: `/usr/bin/chromium` o `/opt/pw-browsers/chromium`, secondo dove è installato. Non eseguire `playwright install`.

La suite verifica entrambe le lingue, a 320, 390 e 1440 px in chiaro e scuro: niente scorrimento orizzontale, tutte le immagini caricate anche dopo scorrimento, un solo H1, parametri UTM su ogni link Play, assenza di script e richieste script, axe WCAG 2 A/AA e 2.1 AA. Separatamente vanno guardate le pagine a 320, 390, 768 e 1440 px in entrambi i temi e misurati i byte realmente caricati alla prima schermata e a pagina intera. `docs/VALIDATION.md` registra risultati e limiti, senza dedurli dai soli sorgenti.

La guardia rifiuta file `.js` anche maiuscoli, `<script` nei contenuti testuali serviti e ogni file sopra 100.000 byte, con l’unica eccezione di `site/assets/feature-graphic.png`, e i segnaposto visibili negli HTML: «da aggiungere», «da completare», «to be added», «to be completed», «TODO», «lorem» o una parentesi quadra seguita da maiuscole, ammessi solo dentro i commenti HTML. Le immagini binarie non vengono interpretate come testo. La guardia è stata provata con fixture temporanee: JavaScript, script inline e SVG, file sovradimensionati e falsa eccezione fuori da `assets/` sono stati respinti; le fixture valide sono passate. Il limite di 12.000 byte del CSS non lo controlla nessuno script: misuralo con `wc -c site/styles.css` prima della consegna.

## Pubblicazione e punti aperti

Il workflow `.github/workflows/pages.yml` pubblica esclusivamente `site/`, dopo la guardia, a ogni push su `main`; conserva anche l’avvio manuale. Le pagine di destinazione sono <https://badaaituoisoldi-app.github.io/Bada-ai-tuoi-soldi/> e `/en/`. `originals/`, test e documentazione non vengono caricati su Pages. Per questa revisione prepara una pull request e attendi il merge deciso dal titolare.

Restano espliciti la frase personale di Antonio, i badge ufficiali, la trascrizione esatta delle eventuali voci di rete nella scheda Play, il report Exodus non disponibile, la forma UTM non verificata e lo screenshot iniziale da aggiornare. Nessuna dichiarazione «zero tracciatori secondo Exodus» viene pubblicata. L’accesso a `github.io` e a Google Play è bloccato da questo ambiente: non sono verificati né il sito pubblico né la scheda corrente dello store. Le fonti, la distinzione tra app 1.2.1 e 1.2.2 e le cautele sul backup sono in `docs/SOURCES.md`.
