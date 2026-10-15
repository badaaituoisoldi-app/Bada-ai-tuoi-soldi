# Verifica del sito

Revisione verificata il **15 ottobre 2026** su Chromium headless, con server
statico Python e percorso `/Bada-ai-tuoi-soldi/`.

L’apertura mostra solo Mese. Seguono due sezioni dedicate a Spese e
Obiettivi, una galleria compatta con Anno, CSV e Impostazioni, privacy,
otto FAQ native e l’invito finale al download. L’intestazione contiene solo
marchio e tre collegamenti. DM Sans locale è l’unica famiglia tipografica.

- Asset: i sette PNG del sito sono identici byte per byte agli originali forniti (SHA-256). I riferimenti raster in HTML, CSS, entrambi gli script e Open Graph usano solo questi file; la copertina non è inclusa nel sito. Nessuna interfaccia dell’app è ricostruita.
- Suite browser superata a 320, 360, 390, 430, 768, 1024 e 1440 px: immagini caricate e nessuno scorrimento orizzontale. Navigazione e otto FAQ native verificate.
- Visualizzatore a 320 e 1440 px: zoom effettivo, adattamento alla larghezza, vista 1:1, trascinamento e comandi da tastiera superati. Verificati anche chiusura, ritorno del focus e ripristino dello scorrimento della pagina.
- Movimento: ingresso delle sezioni una sola volta, disattivazione con `prefers-reduced-motion` e cambio di preferenza a pagina aperta verificati. Assenti schermate persistenti, selettori di capitolo, parallasse e indicatore di lettura.
- Senza JavaScript: contenuti e immagini visibili, collegamenti ai PNG originali e FAQ native funzionanti.
- Controlli axe-core WCAG 2 A/AA e 2.1 AA senza violazioni nei sette viewport e nel visualizzatore. Nessun errore HTTP o JavaScript e nessuna richiesta di asset esterni.
- Ispezione visiva di apertura desktop e mobile: composizione semplice, schermata originale e testo leggibile.

Test ripetibili in `tests/browser.cjs`, istruzioni nel README. I controlli
automatici di accessibilità non equivalgono a un audit completo con
tecnologie assistive. Le prove delle composizioni precedenti non descrivono
questa revisione.

La scheda Google Play e l’informativa privacy remote avevano restituito
HTTP 403 nell’ambiente: il loro contenuto e la versione corrente dello store
non sono stati verificati. La distribuzione GitHub Pages richiede una
verifica separata dopo la pubblicazione.
