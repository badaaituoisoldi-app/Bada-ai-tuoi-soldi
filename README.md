# Bada! — ai tuoi soldi · sito ufficiale

Landing page italiana per l’app Android Bada!. HTML, CSS e JavaScript statici, senza backend, dipendenze di produzione, tracker o richieste a font esterni. Le immagini dell’app sono esclusivamente quelle fornite dal titolare.

## Avvio locale

Per vedere l’anteprima senza installazioni, usa **`downloads/bada-anteprima.zip`**: estrai `Bada.html` e aprilo nel browser. È un file unico con stile, font, immagini e JavaScript incorporati; non richiede cartelle di supporto. Il visualizzatore mantiene lo zoom e il ritaglio degli screenshot. «File originale» salva il PNG originale incluso.

Per rigenerare questo pacchetto dopo una modifica al sito:

```sh
python3 scripts/build_preview.py
```

Il sorgente per la pubblicazione resta in `site/`. Se apri direttamente `site/index.html`, mantieni insieme tutti i file di quella cartella: il solo `index.html` non include gli stili e le immagini.

Per usare un server locale, sono sufficienti Python 3 e un browser:

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
- `site/script.js`: ingresso discreto delle sezioni, navigazione delle gallerie e anno nel footer.
- `site/theme.js`: tema del sito applicato prima degli stili, scelta di sistema e preferenza locale.
- `site/viewer.js`: visualizzatore degli originali con zoom, adattamento, vista 1:1 e trascinamento.
- `site/assets/`: screenshot e immagini originali forniti dal titolare, DM Sans locale con licenza OFL.
- `.github/workflows/pages.yml`: distribuzione con azioni ufficiali GitHub Pages.
- `tests/browser.cjs`: verifiche browser ripetibili, incluse accessibilità automatica.
- `scripts/build_preview.py`: genera lo ZIP con un unico HTML e include la licenza del font.
- `tests/preview.cjs`: verifica il file estratto dal pacchetto in isolamento, senza asset adiacenti.
- `docs/SOURCES.md`: fonti consultate, provenienza degli asset e limiti.
- `docs/VALIDATION.md`: controlli eseguiti e risultati.
- `docs/ROADMAP.md`: interventi di rifinitura concordati e criteri di consegna.

## Immagini e transizioni

Il titolare ha fornito `Nuova cartella.zip`: sei schermate promozionali in tema chiaro (1080 × 1920), una feature graphic (1024 × 500) e una copertina. Il sito usa solo i sei originali `store-*.png` in `site/assets/screenshots/` e `site/assets/feature-graphic.png` per marchio e Open Graph. La copertina non è usata. I sette PNG sono copie identiche dei file ricevuti. Fa eccezione `site/assets/icon.png`, favicon e icona per la schermata Home: è l’icona ufficiale dell’app (`assets/icon.png` nel repository dell’app) ridotta da 1024 a 192 px, senza altre modifiche. Il sito inquadra via CSS la sola interfaccia dell’app, escludendo titoli promozionali e margini viola del poster; nessun file immagine è modificato o rigenerato.

L’intestazione contiene il marchio, tre collegamenti — L’app, Privacy e FAQ — e il selettore del tema; su telefono resta su una riga. L’apertura centrale su fondo perla o grafite presenta insieme Mese, Spese e Obiettivi e il pulsante Google Play. Seguono una panoramica di tre benefici e la galleria Anno, CSV e Impostazioni. Su telefono le schermate scorrono orizzontalmente con contatore «1 di 3» e frecce; sono disponibili anche i tasti freccia, Home e Fine quando la galleria ha il focus. I controlli compaiono solo quando le immagini scorrono e restano nascosti senza JavaScript. Privacy e otto FAQ sono affiancate su desktop, con l’invito al download sotto la privacy; su telefono e nell’ordine di lettura il secondo pulsante segue le FAQ. DM Sans locale è l’unica famiglia tipografica. I titoli principali delle sezioni condividono dimensioni, interlinea e spaziatura; note e didascalie hanno una dimensione minima di 13 px.

Il tema chiaro usa sfondi grigio perla neutro; quello scuro usa grafite. Il viola resta nei pulsanti, nei link e negli accenti del titolo. Il selettore nell’intestazione cambia tra «Chiaro» e «Scuro» e funziona anche da tastiera. Alla prima visita segue la preferenza del sistema; una scelta manuale viene ricordata solo nel browser tramite `localStorage` (`bada-site-theme`), senza backend o invio di dati. Se l’archiviazione è bloccata, il cambio resta utilizzabile durante la visita. Senza JavaScript il sito segue comunque il tema del sistema e il selettore resta nascosto. Gli screenshot dell’app rimangono quelli chiari forniti, senza inversione dei colori o ricostruzioni in tema scuro.

Le miniature e il visualizzatore mostrano la stessa area dell’app di 792 × 1424 px: origine (144, 401) nei PNG, oppure (144, 315) per Entrate/uscite. Una maschera con angoli di 48 px nelle coordinate originali esclude i triangoli viola esterni all’interfaccia. I pixel dell’app restano quelli forniti.

Ogni schermata si apre in un visualizzatore a tutto schermo: l’area dell’app si apre adattata alla larghezza disponibile, fino a 792 px (1:1) su desktop, senza tagli orizzontali iniziali. I pulsanti +/− permettono di ingrandire e scorrere i dettagli. I controlli permettono zoom, adattamento alla larghezza, vista 1:1 e apertura del poster originale. A 1:1 l’area visibile dell’app misura 792 px e ogni pixel sorgente corrisponde a un pixel CSS. Sono disponibili trascinamento con il mouse e scorrimento touch nativo. Senza JavaScript i collegamenti aprono il PNG originale completo di titolo e margini promozionali.

Le sezioni compaiono una sola volta con una breve dissolvenza e uno spostamento di 18 px in 650 ms. La preferenza di sistema per il movimento ridotto disattiva l’effetto. Non sono presenti schermate persistenti durante lo scorrimento, schede a selezione, indicatori di lettura o parallasse.

Il calcolatore illustrativo e gli asset provenienti dal repository dell’app sono stati rimossi; restano solo i file immagine forniti nello ZIP. Nessuna interfaccia dell’app è ricostruita. Nell’intestazione e nel footer il logo è inquadrato via CSS dalla feature graphic fornita, senza creare un nuovo file o ridisegnarlo: il sorriso resta il punto esclamativo di «Bada!».

Prima della pubblicazione confronta le funzioni con lo store corrente: in questa attività Google Play non era raggiungibile. Le immagini fornite documentano l’interfaccia, ma non stabiliscono la versione attualmente distribuita o il prezzo dello store. I dettagli sulla provenienza sono in `docs/SOURCES.md`.

## Verifiche browser

Il sito non richiede Node. Per eseguire i soli test, installa gli strumenti fuori dal checkout:

```sh
npm install --prefix /tmp/bada-tools --cache /tmp/npm-cache playwright @axe-core/playwright
NODE_PATH=/tmp/bada-tools/node_modules node tests/browser.cjs
NODE_PATH=/tmp/bada-tools/node_modules node tests/preview.cjs
```

Per `browser.cjs` il server deve essere in esecuzione al percorso `/Bada-ai-tuoi-soldi/` sulla porta 8000. `preview.cjs` estrae il solo HTML dal pacchetto e avvia autonomamente un server temporaneo. È usato Chromium in `/usr/bin/chromium`; personalizza con `CHROMIUM_PATH`. Puoi cambiare l’indirizzo del primo test con `SITE_URL`. Le immagini dei test vengono salvate in `/tmp/bada-320.png`, `/tmp/bada-360.png`, `/tmp/bada-390.png`, `/tmp/bada-430.png`, `/tmp/bada-768.png`, `/tmp/bada-1024.png`, `/tmp/bada-1440.png`.

Controllare anche visivamente desktop e telefono, testi e asset dopo ogni modifica. Il controllo automatico di accessibilità non sostituisce una verifica manuale con tecnologie assistive.

## GitHub Pages: prima pubblicazione

1. Verifica il contenuto rispetto alla versione pubblicata e controlla le immagini fornite dal titolare.
2. Nel repository GitHub seleziona **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Rivedi e salva i file con un commit, quindi esegui il push su `main`. Il workflow pubblica esclusivamente `site/`.
4. In alternativa avvia **Actions → Deploy static site to GitHub Pages → Run workflow** su `main`.
5. Attendi l’esito del job `deploy` e verifica `https://badaaituoisoldi-app.github.io/Bada-ai-tuoi-soldi/`, inclusi immagini, font, navigazione e galleria.

Gli aggiornamenti successivi vengono distribuiti a ogni push su `main`. Tutti gli asset usano percorsi relativi; se cambia il nome del repository, aggiorna canonical e URL assoluti Open Graph. Non inserire credenziali o dati dell’app in questo repository.
