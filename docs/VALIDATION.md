# Verifica del sito

Revisione verificata il **15 ottobre 2026** su Chromium headless, con server
statico Python e percorso `/Bada-ai-tuoi-soldi/`.

Su richiesta del titolare sono stati rimossi il calcolatore illustrativo
e gli asset provenienti dal repository dell’app. Non sono presenti
interfacce dell’app ricostruite. Le immagini provengono esclusivamente da
`Nuova cartella.zip`: sei screenshot promozionali, feature graphic e copertina.
Il logo nell’intestazione e nel footer è inquadrato via CSS dalla feature
graphic originale; i file immagine restano integri.

- Controllo indipendente degli asset: gli otto PNG sono identici byte per byte agli originali forniti (SHA-256). Tutti i riferimenti raster in HTML, CSS, JavaScript e Open Graph appartengono a questo insieme; nessuna immagine incorporata nei sorgenti.
- Suite browser superata a 320, 360, 390, 430, 768, 1024 e 1440 px: asset caricati, nessuno scorrimento orizzontale, calcolatore assente, nessun errore JavaScript o richiesta esterna.
- Otto FAQ e navigazione principale verificate da tastiera. I sette collegamenti alle schermate aprono gli originali nella galleria: verificati immagine corretta, chiusura con Esc o pulsante e ritorno del focus al collegamento.
- Transizioni: comparsa delle sezioni durante lo scorrimento, apertura della galleria di 180 ms e chiusura di 120 ms; nessun ciclo o animazione di dati finanziari. Con `prefers-reduced-motion` le transizioni sono azzerate e il contenuto in attesa diventa subito visibile, anche cambiando preferenza a pagina aperta.
- Senza JavaScript: tutti i contenuti e le immagini restano visibili, i collegamenti agli originali funzionano e le FAQ native si aprono.
- Controlli axe-core WCAG 2 A/AA e 2.1 AA senza violazioni nei sette viewport e nella galleria. Non equivalgono a un audit completo con tecnologie assistive.
- Ispezione visiva a 390 e 1440 px: apertura, logo e chiusura con la copertina fornita. Font DM Sans locale con licenza inclusa.

Test ripetibili in `tests/browser.cjs`, istruzioni nel README. Le prove delle
versioni precedenti del calcolatore non si applicano a questa revisione.

La scheda Google Play e l’informativa privacy remote avevano restituito
HTTP 403 nell’ambiente: il loro contenuto e la versione corrente dello store
non sono stati verificati. La distribuzione GitHub Pages richiede una
verifica separata dopo la pubblicazione.
