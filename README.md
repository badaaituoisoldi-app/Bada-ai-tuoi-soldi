# Bada! — ai tuoi soldi · sito ufficiale

Landing page italiana per l’app Android Bada!. HTML, CSS e JavaScript statici, senza backend, dipendenze di produzione, tracker o richieste a font esterni. Le immagini dell’app sono esclusivamente quelle fornite dal titolare.

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
- `site/script.js`: capitoli e schermate durante lo scorrimento, transizioni, avanzamento della lettura e anno nel footer.
- `site/viewer.js`: visualizzatore degli originali con zoom, adattamento, vista 1:1 e trascinamento.
- `site/assets/`: screenshot e immagini originali forniti dal titolare, DM Sans locale con licenza OFL.
- `.github/workflows/pages.yml`: distribuzione con azioni ufficiali GitHub Pages.
- `tests/browser.cjs`: verifiche browser ripetibili, incluse accessibilità automatica.
- `docs/SOURCES.md`: fonti consultate, provenienza degli asset e limiti.
- `docs/VALIDATION.md`: controlli eseguiti e risultati.

## Immagini e transizioni

Il titolare ha fornito le immagini della scheda Play Store nell’archivio `Nuova cartella.zip`: sei schermate promozionali in tema chiaro (1080 × 1920), la feature graphic (1024 × 500) e una copertina. Gli originali dei sei `store-*.png` sono in `site/assets/screenshots/`; `site/assets/feature-graphic.png` è usata per Open Graph e `site/assets/copertina-onde.png` nella chiusura. I PNG sono copie integre dei file ricevuti: testi, importi e controlli non sono stati modificati.

L’apertura affianca le schermate originali Mese e Obiettivi. Tre capitoli presentano Mese, Entrate/uscite e Obiettivi: su desktop l’immagine resta accanto al testo e cambia con lo scorrimento o con i selettori Mese, Spese e Obiettivi; su mobile ogni capitolo contiene la propria schermata. Le schede Anno, CSV e Impostazioni completano il percorso e scorrono orizzontalmente su telefono. L’intestazione contiene marchio e navigazione; i collegamenti Google Play restano nell’apertura e nella chiusura. DM Sans è ospitato localmente, con dimensioni e pesi rivisti per una lettura più compatta.

Ogni schermata si apre in un visualizzatore a tutto schermo: l’immagine parte da 720 px di larghezza su telefono, fino a 1080 px su desktop, e si può scorrere per leggere i dettagli. I controlli permettono zoom, adattamento alla larghezza, vista 1:1 e apertura dell’originale. È disponibile anche il trascinamento con il mouse e lo scorrimento touch nativo. Senza JavaScript i collegamenti aprono direttamente i PNG.

Le transizioni di ingresso si ripetono tornando sulle sezioni; il cambio delle immagini segue i capitoli. Un lieve movimento dell’apertura e l’indicatore di lettura rispondono allo scorrimento. La preferenza di sistema per il movimento ridotto disattiva gli effetti decorativi. Non sono animate transazioni o cifre.

Il 15 ottobre 2026 sono stati rimossi il calcolatore illustrativo e gli asset provenienti dal repository dell’app; restano solo i file immagine forniti nello ZIP. Non sono presenti interfacce dell’app ricostruite. Nell’intestazione e nel footer il logo è inquadrato via CSS dalla feature graphic fornita, senza creare un nuovo file o ridisegnarlo: il sorriso resta il punto esclamativo di «Bada!».

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
5. Attendi l’esito del job `deploy` e verifica `https://badaaituoisoldi-app.github.io/Bada-ai-tuoi-soldi/`, inclusi immagini, font, navigazione e galleria.

Gli aggiornamenti successivi vengono distribuiti a ogni push su `main`. Tutti gli asset usano percorsi relativi; se cambia il nome del repository, aggiorna canonical e URL assoluti Open Graph. Non inserire credenziali o dati dell’app in questo repository.
