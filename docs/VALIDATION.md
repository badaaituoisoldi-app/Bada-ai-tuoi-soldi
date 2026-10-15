# Verifica del sito

Revisione verificata il **15 ottobre 2026** su Chromium headless con server
statico Python e percorso `/Bada-ai-tuoi-soldi/`. Miniature e visualizzatore
inquadrano la sola interfaccia dell’app dai PNG originali.

L’apertura su fondo perla o grafite presenta il titolo centrale e le tre schermate
Mese, Spese e Obiettivi insieme. Seguono tre benefici sintetici e una sola
galleria con Anno, CSV e Impostazioni. Privacy e otto FAQ native sono
affiancate su desktop; l’invito finale al download è sotto la privacy su
desktop e dopo le FAQ su telefono e nell’ordine di lettura.
Su telefono entrambe le raccolte di schermate scorrono orizzontalmente,
con contatore, frecce e comandi da tastiera. L’intestazione resta su una riga. DM Sans locale è l’unica famiglia tipografica.

L’inquadratura misura 792 × 1424 px, da (144, 401) nei file sorgente,
oppure (144, 315) per Entrate/uscite, con angoli mascherati di 48 px. A 1:1
il visualizzatore mostra l’area dell’app a 792 px di larghezza. I file non
sono stati modificati o rigenerati; il collegamento all’originale conserva
il poster completo, disponibile anche senza JavaScript.

I temi usano grigio perla in chiaro e grafite in scuro, con accenti viola.
La preferenza del sistema resta attiva fino alla scelta manuale, con memoria
locale della scelta e selettore accessibile. Gli screenshot dell’app restano chiari e invariati. I controlli
browser di entrambi i temi sono superati sulla revisione corrente.

- Asset: i sette PNG del sito sono identici byte per byte agli originali forniti (SHA-256). I riferimenti alle immagini nei sorgenti HTML, CSS e JavaScript e nei metadati Open Graph usano solo questi file; la copertina non è inclusa nel sito. L’unica immagine in più è `assets/icon.png`, l’icona dell’app ridotta a 192 px per favicon e schermata Home. Nessuna interfaccia dell’app è ricostruita.
- Suite browser superata in chiaro e scuro a 320, 360, 390, 430, 768, 1024 e 1440 px: immagini caricate e nessuno scorrimento orizzontale. Verificate su tutte le sei schermate la geometria dell’inquadratura, le coordinate sorgente e la maschera degli angoli. Navigazione e otto FAQ native verificate.
- Selettore del tema: verificati comandi Spazio/Invio, stato accessibile e indicazioni Chiaro/Scuro, preferenza iniziale del sistema e aggiornamento automatico prima della scelta manuale. Entrambe le scelte persistono al ricaricamento e prevalgono sui cambi del sistema; il selettore funziona anche con localStorage bloccato.
- Visualizzatore a 320 e 1440 px, in entrambi i temi: larghezza iniziale dell’area app adattata allo spazio disponibile, fino a 792 px su desktop e senza tagli orizzontali, zoom +/−, adattamento alla larghezza e vista 1:1 a 792 px verificati. La sorgente resta il PNG da 1080 × 1920, a scala 1 nella vista 1:1. Trascinamento al 200%, frecce e scorciatoie 0/1 superati. Verificate apertura e chiusura di Mese, Spese e CSV, collegamento al poster completo, ritorno del focus e ripristino dello scorrimento della pagina.
- Movimento: ingresso delle sezioni una sola volta, disattivazione con `prefers-reduced-motion` e cambio di preferenza a pagina aperta verificati. Assenti schermate persistenti, selettori di capitolo, parallasse e indicatore di lettura.
- Senza JavaScript: temi chiaro/scuro secondo il sistema, selettore nascosto, inquadratura dell’app e contenuti visibili, collegamenti ai PNG originali completi e FAQ native funzionanti.
- Controlli axe-core WCAG 2 A/AA e 2.1 AA senza violazioni nei sette viewport e nel visualizzatore, in entrambi i temi. Nessun errore HTTP o JavaScript e nessuna richiesta di asset esterni.
- Rifinitura: perla più neutro, accento viola coerente, titoli uniformi e note/didascalie da 13 px. Apertura desktop ridotta di circa 37 px a 1440 px tramite margini, preservando la dimensione delle schermate e le distanze delle sezioni successive.
- Gallerie: contatori e frecce sincronizzati con lo scorrimento manuale; tastiera Home/Fine e frecce, estremi disabilitati e posizione verticale stabile verificati. I controlli compaiono solo con overflow, si aggiornano al ridimensionamento e restano nascosti senza JavaScript.
- Download: ordine delle sezioni e posizione del pulsante finale dopo le FAQ su telefono verificati.
- Ispezione visiva dei temi chiaro e scuro su desktop e telefono, comprese intestazione su una riga a 320 px, gallerie a scorrimento e pagina intera: campiture distinte, testi leggibili e selettore visibile. Verificata la separazione delle parole nei titoli anche quando gli a capo desktop sono rimossi. Le schermate mantengono i colori originali, senza slogan o margini viola del poster e senza filtri o pixel ricostruiti.

Test ripetibili in `tests/browser.cjs`, istruzioni nel README. I controlli
automatici di accessibilità non equivalgono a un audit completo con
tecnologie assistive. Le prove delle composizioni precedenti non descrivono
questa revisione.

L’apertura diretta tramite `file://` non è stata verificata: il Chromium
dell’ambiente blocca tale protocollo con `ERR_BLOCKED_BY_ADMINISTRATOR`.
I controlli sopra usano il server statico; tutti gli asset necessari
sono locali e inclusi nell’archivio.

## Anteprima in un unico file

Lo screenshot inviato dal titolare mostrava HTML privo di CSS: font del
browser, collegamenti senza formattazione e icona SVG fuori scala. Il
pacchetto `downloads/bada-anteprima.zip` elimina la dipendenza da file
adiacenti: contiene soltanto `Bada.html`, con CSS, JavaScript, font, licenza
del font e PNG incorporati. Le sei schermate incorporate conservano gli
stessi byte dei PNG sorgente. I collegamenti ai poster originali usano
`download`, evitando la navigazione verso un indirizzo `data:`.

`tests/preview.cjs` estrae il solo HTML in una cartella temporanea e lo
serve senza altri file. Verifica superata a 320 e 1440 px in entrambi i
temi: CSS attivo, DM Sans caricato, sei PNG a risoluzione originale,
assenza di overflow e di richieste HTTP aggiuntive. Superati cambio tema,
zoom, adattamento, vista 1:1, chiusura e focus, download del PNG originale
con verifica SHA-256, gallerie autonome con contatori/frecce e otto FAQ da tastiera. Anche senza JavaScript stile,
immagini, tema di sistema e FAQ restano disponibili. Questa prova isola
la completezza del file; non modifica il limite `file://` sopra indicato.

La scheda Google Play e l’informativa privacy remote avevano restituito
HTTP 403 nell’ambiente: il loro contenuto e la versione corrente dello store
non sono stati verificati. Il dominio pubblico `github.io` è bloccato dall’ambiente: la verifica
della pubblicazione si basa sull’esito del workflow GitHub Pages e sul
collegamento restituito dal deploy, senza dichiarare una visita diretta
alla pagina pubblica.
