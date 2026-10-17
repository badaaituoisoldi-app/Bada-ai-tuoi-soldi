# Verifica del sito

## Rifinitura del 17 ottobre 2026

La richiesta successiva del titolare aggiunge carattere e transizioni alla
base statica del 16 ottobre. Cambia solo il CSS del sito; HTML, testi,
immagini e font restano gli stessi. DM Sans ha pesi più decisi e un accento
in corsivo; fondale lavanda inclinato, feature alternate su desktop e
invito finale su una superficie dedicata danno ritmo alla pagina.

La suite `tests/browser.cjs` è stata eseguita sulla revisione: **12
combinazioni superate**, IT/EN a 320, 390 e 1440 px in chiaro/scuro,
zero violazioni axe WCAG 2 A/AA e 2.1 AA, nessun overflow o immagine
mancante, link Play corretti e nessuno script della pagina.

Un controllo browser separato ha esercitato IT/EN a 390 e 1440 px, con
movimento normale e ridotto, per **8 combinazioni**. Con movimento
normale, ingresso dell'apertura da 650 ms e transizioni hover da 220 ms.
Le funzioni seguono una timeline di scorrimento: misurati circa 13 px
all'ingresso e 0 px quando entrano completamente nella vista. Un salto
istantaneo alla terza funzione mantiene opacità 1 e visibilità normale
su tutte le funzioni. Nessuna dissolvenza nasconde testi o schermate.
Con movimento ridotto: zero animazioni, durata delle transizioni 0 s,
scorrimento automatico ordinario e nessuna trasformazione delle funzioni.
Il supporto alle timeline è stato rilevato in Chromium; nei browser che
non le supportano la regola `@supports` lascia le funzioni statiche.
Non è stata dichiarata una prova in altri motori browser.

Ispezionate aperture e funzioni desktop nei due temi, feature a 768 px,
telefono italiano e inglese, con attesa del caricamento lazy delle immagini.
Rilevati e ricontrollati i rettangoli a 320, 390, 768 e 1440 px in entrambe
le lingue e i temi: nessun overflow o target sotto 44 × 44 px. L'apertura
italiana termina ancora a 703 px e quella inglese a 745 px nel viewport
390 × 844. Il titolo desktop italiano resta su due righe a 62 px.
Le anteprime statiche finali sono in `anteprime-20261017/` e non vengono
pubblicate nella cartella `site/`.

Misura finale a 390 × 844 con cache iniziale vuota, server Python senza
compressione e `transferSize`, con lo stesso metodo descritto sotto:

| Pagina | Prima schermata | Pagina intera |
| --- | ---: | ---: |
| Italiano | 106.349 byte | 208.161 byte |
| Inglese | 106.727 byte | 208.539 byte |

CSS: **7.997 byte**, entro 8.000. Nessuna richiesta esterna. Guardia di
pubblicazione, verifica dei link Play e `git diff --check` superati.
Nessun file immagine dell'app modificato. Restano i segnaposto documentati
per frase personale, badge e autorizzazioni Play; questa rifinitura non
li sostituisce con contenuti inventati.

## Baseline verificata il 16 ottobre 2026

Controlli eseguiti il **16 ottobre 2026**, sul branch dedicato alla pagina
IT/EN. Server Python sulla porta 8000 al percorso `/Bada-ai-tuoi-soldi/`.
Non è una verifica della pagina pubblicata: questa revisione non viene
unita a `main` né pubblicata durante la consegna.

## Browser e accessibilità

Suite `tests/browser.cjs` eseguita con Playwright 1.56.1,
`@axe-core/playwright` 4.10.2 e Chromium `/usr/bin/chromium`:

```sh
NODE_PATH=/tmp/bada-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/browser.cjs
```

**12 combinazioni superate:** italiano e inglese, larghezze 320, 390 e
1440 px, tema chiaro e scuro. Per ogni combinazione: nessuno scorrimento
orizzontale, immagini caricate anche dopo lo scorrimento, un solo H1,
parametri UTM presenti su tutti i link Play, nessun elemento o richiesta
script della pagina, zero violazioni axe WCAG 2 A/AA e 2.1 AA.

Il percorso `/opt/pw-browsers/chromium` indicato nel brief non esiste in
questa macchina. È stato usato il browser già installato, senza eseguire
`playwright install`. Un primo avvio del test aveva incontrato un server
con processo vivo ma risposta vuota: il server avviato durante questa
attività è stato riavviato con log su file, quindi controllato con HTTP.
Il test axe usa contesti browser espliciti, necessari al suo audit.

Il controllo automatico non sostituisce una verifica con lettore di
schermo. Le FAQ sono tre articoli sempre leggibili; il solo `details`
espandibile è la spiegazione dei permessi.

## Ispezione visiva e apertura

Guardate le pagine italiane complete a **320, 390, 768 e 1440 px in
entrambi i temi**, oltre alle aperture a 390 e 768 px in chiaro.
Guardate anche le aperture inglesi a 390 px in chiaro e 1440 px in scuro.

- A 320 px la testata resta su una riga; titolo, collegamenti e testo
  rientrano nel contenitore. Le funzioni si susseguono verticalmente,
  senza caroselli; le immagini mantengono la scheda intera del ritaglio.
- A 390 px titolo e descrizione precedono un solo ritaglio del disponibile.
  L'ultimo elemento dell'apertura, la didascalia, termina a **703 px in
  italiano** e **745 px in inglese**, entro gli 844 px richiesti.
- A 768 px testo e scheda iniziale sono affiancati, con titolo italiano su
  tre righe; le quattro funzioni restano blocchi distinti uno sotto l'altro.
- A 1440 px i titoli e le prove hanno colonne distinte; i ritagli delle
  funzioni arrivano a 400 px di larghezza, senza telefoni decorativi.
  In scuro le superfici sono grafite e i link lavanda; le schermate
  conservano il tema chiaro fornito, senza filtri.
- I segnaposto dei badge e della frase personale sono riconoscibili:
  non sono contenuti finali approvati dall'autore.

La misurazione dei rettangoli di tutti i link e del `summary` a queste
quattro larghezze, in entrambi i temi e in entrambe le lingue, non ha
trovato target sotto 44 × 44 px. Lo zoom delle immagini è affidato al
browser tramite collegamenti al file WebP, senza visualizzatore personalizzato.

## Contrasto misurato

Rapporti calcolati con luminanza relativa sRGB:

| Testo | Sfondo | Contrasto |
| --- | --- | ---: |
| `#5b3fd6` | `#ffffff` | 6,716:1 |
| `#5b3fd6` | `#f5f5f7` | 6,168:1 |
| `#b8a6ff` | `#16151b` | 8,587:1 |
| `#b8a6ff` | `#1e1c25` | 7,962:1 |
| `#595563` | `#edecf2` | 6,157:1 |
| `#bdb8cb` | `#25222f` | 8,070:1 |

Tutti superano AA per testo normale. `#9071f4` è usato soltanto per il
bordo decorativo nell'apertura, non per testo o link.

## Peso reale nel browser

Misura a **390 × 844**, nuovo contesto browser per ogni lingua, cache
iniziale vuota, server Python senza compressione. Alla prima schermata
si attende il caricamento e l'inattività della rete; poi si scorrono tutte
le immagini lazy e si misura di nuovo. Valori ottenuti sommando
`transferSize` di Navigation Timing e Resource Timing, quindi comprensivi
dell'overhead HTTP riportato dal browser. La seconda consultazione
dell'icona come favicon è servita dalla memoria, con trasferimento zero,
e non viene contata due volte. KB decimali.

| Pagina | Prima schermata | Pagina intera |
| --- | ---: | ---: |
| Italiano | 106.339 byte (106,3 KB) | 208.151 byte (208,2 KB) |
| Inglese | 106.717 byte (106,7 KB) | 208.529 byte (208,5 KB) |

Nessuna richiesta a servizi esterni in queste visite. La feature graphic
è referenziata nei metadati social e non è scaricata dalla normale visita
del browser: un crawler social può richiederla separatamente. I badge
ufficiali non sono ancora inclusi; dopo averli aggiunti va ripetuta la
misura. Il CSS pesa **7.987 byte**, sotto il limite di 8.000.

## Asset, collegamenti e guardia

- Sei poster spostati in `originals/` senza modificare i byte. Cinque
  WebP lossless: **121.470 byte complessivi**, con pixel RGB decodificati
  identici ai rispettivi ritagli dei PNG. Coordinate e hash nel manifesto
  `originals/crops.json`; nessun ridimensionamento delle schermate.
- L'icona 192 × 192, invariata da `main`, coincide con l'icona ufficiale
  1024 × 1024 ridimensionata LANCZOS. Feature graphic e licenza del font
  conservate. Nessuna immagine dell'app ricostruita.
- `python3 scripts/play_links.py` superato: quattro link corrispondenti
  all'unico formato UTM di manutenzione.
- `python3 scripts/check_site.py site` superato. La guardia è eseguita
  anche dal workflow Pages prima della configurazione e dell'upload.
- Guardia rotta deliberatamente su fixture temporanee: file `.JS`,
  `<ScRiPt` nell'HTML, script in SVG, file di 100.001 byte e falsa
  eccezione `feature-graphic.png` fuori da `assets/` respinti. Fixture
  valida e immagine binaria contenente la sequenza `<script` accettate:
  la guardia non interpreta i PNG come testo. Il sito effettivo non è
  stato pubblicato con questi difetti.
- Formattazione HTML/JS/workflow e `git diff --check` superati. I due
  HTML condividono un solo CSS; sitemap contiene le due pagine.

## Limiti e punti aperti

Google Play, `github.io` e le pagine ufficiali dei badge Google sono
bloccati dalla rete dell'ambiente con HTTP 403. Non sono dichiarati
verificati sito pubblico, scheda store, informative pubbliche o pacchetto
Android distribuito. La verifica delle funzioni usa i sorgenti 1.2.1,
distinti da HEAD 1.2.2, come documentato in `SOURCES.md`.

Restano la frase personale di Antonio, gli SVG ufficiali dei badge,
la trascrizione delle voci di rete della scheda Play e il controllo della
forma UTM in Play Console. Nessun report Exodus disponibile: la relativa
affermazione è omessa. L'apertura usa ancora lo screenshot del mese
fornito: il nuovo screenshot dopo la correzione dell'app non è arrivato.
L'API GitHub è anch'essa bloccata; l'esito della creazione della pull
request va riportato separatamente dal salvataggio del branch.
