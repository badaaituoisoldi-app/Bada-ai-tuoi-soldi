# Verifica del sito

Revisione verificata il **15 ottobre 2026** su Chromium headless, con server
statico Python e percorso `/Bada-ai-tuoi-soldi/`.

La composizione presenta due schermate nell’apertura, tre capitoli con
immagine affiancata su desktop e interna al testo su mobile, tre schede
aggiuntive e un visualizzatore con zoom effettivo. L’intestazione contiene
solo marchio e navigazione; DM Sans locale ha una scala più compatta.

- Asset: tutti gli otto PNG sono identici byte per byte agli originali forniti (SHA-256). I riferimenti raster in HTML, CSS, entrambi gli script e Open Graph rimandano solo a questi file. Nessun calcolatore illustrativo o interfaccia dell’app ricostruita.
- Suite browser superata a 320, 360, 390, 430, 768, 1024 e 1440 px: immagini caricate, nessuno scorrimento orizzontale, errore JavaScript o richiesta esterna. Navigazione, FAQ e collegamenti agli originali verificati.
- Visualizzatore: a 320 e 1440 px l’immagine iniziale è realmente più grande della miniatura; zoom +/−, adattamento alla larghezza, vista 1:1 a 1080 px, trascinamento su entrambi gli assi, comandi da tastiera e frecce verificati. Chiusura con Esc o pulsante, ritorno del focus e ripristino dello scorrimento della pagina superati.
- Movimento: verificati cambio della schermata dei capitoli, avanzamento della lettura e lieve spostamento dell’apertura anche con scorrimento rapido; gli ingressi si ripetono tornando sulle sezioni. Con `prefers-reduced-motion` gli effetti decorativi sono disattivati.
- Senza JavaScript: contenuti e immagini visibili, collegamenti agli originali funzionanti e FAQ native utilizzabili.
- Controlli axe-core WCAG 2 A/AA e 2.1 AA senza violazioni nei sette viewport e nel visualizzatore. Non equivalgono a un audit completo con tecnologie assistive.

I selettori desktop Mese, Spese e Obiettivi sono stati verificati da tastiera
a 1024 e 1440 px: un solo pulsante attivo, immagine originale corrispondente,
focus conservato e capitolo centrato. Sono nascosti alle cinque larghezze
inferiori. La suite completa è stata rieseguita e superata dopo l’aggiunta.
L’ispezione visiva ha confermato apertura, capitolo Spese e visualizzatore
con originale a 1080 px.

Test ripetibili in `tests/browser.cjs`, istruzioni nel README. Le prove delle
composizioni precedenti non descrivono questa revisione.

La scheda Google Play e l’informativa privacy remote avevano restituito
HTTP 403 nell’ambiente: il loro contenuto e la versione corrente dello store
non sono stati verificati. La distribuzione GitHub Pages richiede una
verifica separata dopo la pubblicazione.
