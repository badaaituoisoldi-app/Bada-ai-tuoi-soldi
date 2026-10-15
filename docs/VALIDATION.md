# Verifica del sito

Revisione verificata il **15 ottobre 2026** su Chromium headless con server
statico Python e percorso `/Bada-ai-tuoi-soldi/`. Miniature e visualizzatore
inquadrano la sola interfaccia dell’app dai PNG originali.

L’apertura mostra solo Mese. Seguono due sezioni dedicate a Spese e
Obiettivi, una galleria compatta con Anno, CSV e Impostazioni, privacy,
otto FAQ native e l’invito finale al download. L’intestazione contiene solo
marchio, tre collegamenti e il selettore del tema. DM Sans locale è l’unica
famiglia tipografica.

L’inquadratura misura 792 × 1424 px, da (144, 401) nei file sorgente,
oppure (144, 315) per Entrate/uscite, con angoli mascherati di 48 px. A 1:1
il visualizzatore mostra l’area dell’app a 792 px di larghezza. I file non
sono stati modificati o rigenerati; il collegamento all’originale conserva
il poster completo, disponibile anche senza JavaScript.

Aggiornamento dei temi: superfici colorate in chiaro e in scuro, preferenza
del sistema fino alla scelta manuale, memoria locale della scelta e selettore
accessibile. Gli screenshot dell’app restano chiari e invariati. I controlli
browser di entrambi i temi sono superati sulla revisione corrente.

- Asset: i sette PNG del sito sono identici byte per byte agli originali forniti (SHA-256). I riferimenti alle immagini nei sorgenti HTML, CSS e JavaScript e nei metadati Open Graph usano solo questi file; la copertina non è inclusa nel sito. Nessuna interfaccia dell’app è ricostruita.
- Suite browser superata in chiaro e scuro a 320, 360, 390, 430, 768, 1024 e 1440 px: immagini caricate e nessuno scorrimento orizzontale. Verificate su tutte le sei schermate la geometria dell’inquadratura, le coordinate sorgente e la maschera degli angoli. Navigazione e otto FAQ native verificate.
- Selettore del tema: verificati comandi Spazio/Invio, stato accessibile e indicazioni Chiaro/Scuro, preferenza iniziale del sistema e aggiornamento automatico prima della scelta manuale. Entrambe le scelte persistono al ricaricamento e prevalgono sui cambi del sistema; il selettore funziona anche con localStorage bloccato.
- Visualizzatore a 320 e 1440 px, in entrambi i temi: larghezza iniziale dell’area app di 720 px su mobile e 792 px su desktop, zoom +/−, adattamento alla larghezza e vista 1:1 a 792 px verificati. La sorgente resta il PNG da 1080 × 1920, a scala 1 nella vista 1:1. Trascinamento al 200%, frecce e scorciatoie 0/1 superati. Verificate apertura e chiusura di Mese, Spese e CSV, collegamento al poster completo, ritorno del focus e ripristino dello scorrimento della pagina.
- Movimento: ingresso delle sezioni una sola volta, disattivazione con `prefers-reduced-motion` e cambio di preferenza a pagina aperta verificati. Assenti schermate persistenti, selettori di capitolo, parallasse e indicatore di lettura.
- Senza JavaScript: temi chiaro/scuro secondo il sistema, selettore nascosto, inquadratura dell’app e contenuti visibili, collegamenti ai PNG originali completi e FAQ native funzionanti.
- Controlli axe-core WCAG 2 A/AA e 2.1 AA senza violazioni nei sette viewport e nel visualizzatore, in entrambi i temi. Nessun errore HTTP o JavaScript e nessuna richiesta di asset esterni.
- Ispezione visiva dei temi chiaro e scuro su desktop e telefono, comprese intestazione a due righe a 320 px e pagina intera: campiture distinte, testi leggibili e selettore visibile. Le schermate mantengono i colori originali, senza slogan o margini viola del poster e senza filtri o pixel ricostruiti.

Test ripetibili in `tests/browser.cjs`, istruzioni nel README. I controlli
automatici di accessibilità non equivalgono a un audit completo con
tecnologie assistive. Le prove delle composizioni precedenti non descrivono
questa revisione.

La scheda Google Play e l’informativa privacy remote avevano restituito
HTTP 403 nell’ambiente: il loro contenuto e la versione corrente dello store
non sono stati verificati. La distribuzione GitHub Pages richiede una
verifica separata dopo la pubblicazione.
