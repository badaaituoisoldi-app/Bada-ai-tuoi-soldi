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
- `site/script.js`: ingresso discreto delle sezioni e anno nel footer.
- `site/viewer.js`: visualizzatore degli originali con zoom, adattamento, vista 1:1 e trascinamento.
- `site/assets/`: screenshot e immagini originali forniti dal titolare, DM Sans locale con licenza OFL.
- `.github/workflows/pages.yml`: distribuzione con azioni ufficiali GitHub Pages.
- `tests/browser.cjs`: verifiche browser ripetibili, incluse accessibilità automatica.
- `docs/SOURCES.md`: fonti consultate, provenienza degli asset e limiti.
- `docs/VALIDATION.md`: controlli eseguiti e risultati.

## Immagini e transizioni

Il titolare ha fornito `Nuova cartella.zip`: sei schermate promozionali in tema chiaro (1080 × 1920), una feature graphic (1024 × 500) e una copertina. Il sito usa solo i sei originali `store-*.png` in `site/assets/screenshots/` e `site/assets/feature-graphic.png` per marchio e Open Graph. La copertina non è usata. I sette PNG sono copie integre dei file ricevuti: testi, importi e controlli restano invariati.

L’intestazione contiene il marchio e tre collegamenti: Funzionalità, Privacy e FAQ. L’apertura presenta la schermata Mese e il pulsante Google Play. Due sezioni illustrano Spese e Obiettivi, ciascuna con una sola schermata; una galleria compatta raccoglie Anno, CSV e Impostazioni. Seguono privacy, otto FAQ e un invito finale a scaricare l’app. DM Sans locale è l’unica famiglia tipografica, con una gerarchia semplice di dimensioni e pesi.

La rifinitura tipografica mantiene questa struttura: colonne delle funzioni più vicine, titoli con spaziatura meno serrata e a capo bilanciati, testi secondari da 15 px. Le distanze tra le sezioni sono state ridotte in modo contenuto; le schermate su telefono mantengono le dimensioni precedenti.

Ogni schermata si apre in un visualizzatore a tutto schermo: l’immagine parte da 720 px di larghezza su telefono, fino a 1080 px su desktop, e si può scorrere per leggere i dettagli. I controlli permettono zoom, adattamento alla larghezza, vista 1:1 e apertura dell’originale. È disponibile anche il trascinamento con il mouse e lo scorrimento touch nativo. Senza JavaScript i collegamenti aprono direttamente i PNG.

Le sezioni compaiono una sola volta con una breve dissolvenza e uno spostamento di 16 px in 600 ms. La preferenza di sistema per il movimento ridotto disattiva l’effetto. Non sono presenti schermate persistenti durante lo scorrimento, schede a selezione, indicatori di lettura o parallasse.

Il calcolatore illustrativo e gli asset provenienti dal repository dell’app sono stati rimossi; restano solo i file immagine forniti nello ZIP. Nessuna interfaccia dell’app è ricostruita. Nell’intestazione e nel footer il logo è inquadrato via CSS dalla feature graphic fornita, senza creare un nuovo file o ridisegnarlo: il sorriso resta il punto esclamativo di «Bada!».

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
