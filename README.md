# Bada! — ai tuoi soldi · sito ufficiale

Landing page dell’app Android Bada!, in italiano e inglese. Due pagine HTML scritte a mano e un unico `styles.css` condiviso, entro 8.000 byte: nessuna build, JavaScript, dipendenza di produzione, richiesta a servizi di terzi o font esterno. Il tema segue il sistema tramite `prefers-color-scheme`.

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
- `site/styles.css`: layout, font locale, tema chiaro/scuro di sistema e focus visibile. Il `body` ha uno sfondo esplicito.
- `site/assets/screenshots/*.webp`: cinque ritagli lossless, collegati direttamente ai rispettivi file. L’ingrandimento è quello del browser.
- `site/assets/icon.png`: icona ufficiale per testata, favicon e Apple touch icon.
- `site/assets/feature-graphic.png`: immagine Open Graph/Twitter fornita dal titolare.
- `site/assets/fonts/`: DM Sans locale, precaricato con `font-display: swap`, e licenza OFL.
- `site/sitemap.xml`: le due pagine pubbliche. `.nojekyll` mantiene la pubblicazione statica.
- `originals/`: i sei poster PNG ricevuti, esclusi dalla cartella pubblicata, e il manifesto dei ritagli `crops.json`.
- `scripts/check_site.py`: guardia dei file da pubblicare.
- `scripts/play_links.py`: formato unico dei collegamenti a Google Play e verifica degli URL scritti nell’HTML.
- `tests/browser.cjs`: controlli Playwright e axe.
- `docs/SOURCES.md`, `docs/ROADMAP.md`, `docs/VALIDATION.md`: fonti, percorso della ricostruzione e verifiche effettivamente eseguite.

La pagina presenta il disponibile reale, le prove verificabili sulla privacy, quattro funzioni con immagini, backup, limiti dell’app, tre domande con risposte sempre aperte, Antonio e l’invito finale. Solo la spiegazione dei permessi usa un `<details>` nativo. Non ci sono gallerie, visualizzatore personalizzato, selettore del tema o JSON-LD. La rifinitura del 17 ottobre aggiunge transizioni solo CSS: ingresso dell’apertura in 650 ms, sollevamento di 3 px dei link a immagini/store al passaggio del mouse e un ingresso verticale delle funzioni legato allo scorrimento, nei browser che supportano `animation-timeline: view()`. Nessun elemento viene nascosto con opacità o visibilità: anche uno scorrimento rapido mantiene leggibili i contenuti. Tutti gli effetti e lo scorrimento morbido sono attivi soltanto con `prefers-reduced-motion: no-preference`; altrimenti il sito resta fermo.

## Immagini e riproduzione dei ritagli

I sei poster di `Nuova cartella.zip` sono conservati in `originals/` senza cambiare i byte. Il sito pubblica ritagli più stretti dell’interfaccia, salvati in WebP lossless senza ridimensionare, ricostruire o ritoccare i pixel. La nuova regola sostituisce la precedente richiesta di pubblicare i PNG interi e ritagliarli via CSS. Le coordinate assolute, le dimensioni e gli hash sono in `originals/crops.json`; il confronto dei pixel RGB decodificati conferma la corrispondenza dei cinque WebP con i ritagli sorgente.

Con Pillow disponibile, questo comando dalla radice rigenera tutti i ritagli:

```sh
python3 -c 'import json; from PIL import Image; [Image.open("originals/"+c["source"]).crop(c["box"]).save("site/assets/screenshots/"+c["file"], format="WEBP", lossless=True, quality=100, method=6, exact=True) for c in json.load(open("originals/crops.json"))]'
```

Dopo la sostituzione di un poster, rivedi le coordinate e aggiorna dimensioni, pesi e hash nel manifesto; controlla visivamente che testi e schede restino interi. Il ritaglio iniziale usa ancora lo screenshot del mese fornito in precedenza: resta da sostituire se Antonio consegna quello corretto prima del lancio.

`site/assets/icon.png` è il PNG 192 × 192 già presente su `main`, invariato in questa revisione. È stato verificato rispetto all’icona ufficiale 1024 × 1024 del repository dell’app ridimensionata con Pillow `Image.Resampling.LANCZOS`. Il marchio non viene ridisegnato: il sorriso è il punto esclamativo di «Bada!». La feature graphic resta l’originale fornito; la copertina decorativa non è usata.

## Collegamenti Google Play

Il formato UTM si mantiene in un solo punto, `scripts/play_links.py`; il sito continua a contenere quattro normali link HTML, senza script nel browser. `data-play` identifica pagina e posizione: `home-hero`, `home-fine`, `en-hero`, `en-fine`.

```sh
python3 scripts/play_links.py
python3 scripts/play_links.py --write
```

Il primo comando verifica gli URL, il secondo li aggiorna. `utm_source=sito` e `utm_campaign=<pagina>-<posizione>` distinguono i collegamenti; il riconoscimento di questa forma da parte di Play Console non è verificato. I badge ufficiali sono ancora da aggiungere: il download da Google è stato bloccato con HTTP 403. I segnaposto visibili sono link testuali funzionanti, non badge ricostruiti.

## Verifiche

Il sito non richiede Node. I soli strumenti di test si installano fuori dal repository, senza scaricare un browser:

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --prefix /tmp/bada-tools --cache /tmp/bada-npm-cache playwright@1.56.1 @axe-core/playwright@4.10.2
NODE_PATH=/tmp/bada-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/browser.cjs
python3 scripts/check_site.py site
python3 scripts/play_links.py
```

La suite richiede il server sulla porta 8000 al percorso `/Bada-ai-tuoi-soldi/`. `SITE_URL` consente di cambiarlo. In questo ambiente Chromium è `/usr/bin/chromium`; il percorso `/opt/pw-browsers/chromium` indicato nel brief non esiste. Non eseguire `playwright install`.

La suite verifica entrambe le lingue, a 320, 390 e 1440 px in chiaro e scuro: niente scorrimento orizzontale, tutte le immagini caricate anche dopo scorrimento, un solo H1, parametri UTM su ogni link Play, assenza di script e richieste script, axe WCAG 2 A/AA e 2.1 AA. Separatamente vanno guardate le pagine a 320, 390, 768 e 1440 px in entrambi i temi e misurati i byte realmente caricati alla prima schermata e a pagina intera. `docs/VALIDATION.md` registra risultati e limiti, senza dedurli dai soli sorgenti.

La guardia rifiuta file `.js` anche maiuscoli, `<script` nei contenuti testuali serviti e ogni file sopra 100.000 byte, con l’unica eccezione di `site/assets/feature-graphic.png`. Le immagini binarie non vengono interpretate come testo. La guardia è stata provata con fixture temporanee: JavaScript, script inline e SVG, file sovradimensionati e falsa eccezione fuori da `assets/` sono stati respinti; le fixture valide sono passate. Il limite più stretto di 8.000 byte del CSS va controllato anche prima della consegna.

## Pubblicazione e punti aperti

Il workflow `.github/workflows/pages.yml` pubblica esclusivamente `site/`, dopo la guardia, a ogni push su `main`; conserva anche l’avvio manuale. Le pagine di destinazione sono <https://badaaituoisoldi-app.github.io/Bada-ai-tuoi-soldi/> e `/en/`. `originals/`, test e documentazione non vengono caricati su Pages. Per questa revisione prepara una pull request e attendi il merge deciso dal titolare.

Restano espliciti la frase personale di Antonio, i badge ufficiali, la trascrizione esatta delle eventuali voci di rete nella scheda Play, il report Exodus non disponibile, la forma UTM non verificata e lo screenshot iniziale da aggiornare. Nessuna dichiarazione «zero tracciatori secondo Exodus» viene pubblicata. L’accesso a `github.io` e a Google Play è bloccato da questo ambiente: non sono verificati né il sito pubblico né la scheda corrente dello store. Le fonti, la distinzione tra app 1.2.1 e 1.2.2 e le cautele sul backup sono in `docs/SOURCES.md`.
