# Sito Bada! · ricostruzione e rifinitura

Il brief `prompt-sito-da-zero-2026-10-16.md` sostituisce la precedente roadmap di rifinitura. L’obiettivo è aiutare chi cerca un budget personale offline per Android a valutare le prove, capire i limiti e arrivare a Google Play. La consegna prevista è una pull request da branch dedicato verso `main`, senza merge o pubblicazione in questa attività.

1. **Verificare le promesse.** Consultare il repository dell’app in sola lettura, usando la 1.2.1 come baseline delle funzioni e distinguendola da HEAD 1.2.2. Esplicitare le cautele su rete, CSV e backup. Fonti e limiti sono in `SOURCES.md`.
2. **Ridurre il materiale servito.** Conservare i sei poster PNG in `originals/` e pubblicare cinque ritagli WebP lossless riproducibili tramite `crops.json`. Mantenere icona ufficiale, feature graphic e DM Sans con licenza. Eliminare gli script del sito e il pacchetto HTML di anteprima.
3. **Costruire due pagine statiche.** HTML italiano e inglese, un CSS entro 8.000 byte, tema di sistema, intestazione essenziale, scheda Disponibile reale nell’apertura, prove, quattro funzioni, backup, limiti, tre domande aperte, autore e invito finale. Le immagini aprono il proprio file nel browser. Nessuna galleria, selettore di tema o visualizzatore JavaScript. La baseline del 16 ottobre era priva di animazioni.
4. **Preparare manutenzione e pubblicazione.** Percorsi relativi per GitHub Pages, canonical/hreflang, sitemap, link Play con UTM mantenuti da un unico script locale. Guardia prima dell’upload Pages contro JavaScript, tag script e file sopra 100.000 byte, eccetto la feature graphic. La guardia è stata rotta deliberatamente su fixture temporanee, confermando i rifiuti attesi.
5. **Verificare e consegnare.** Eseguire Playwright/axe su IT/EN a 320, 390 e 1440 px in entrambi i temi; guardare anche 768 px. Misurare il traffico iniziale e completo, controllare l’apertura a 390 × 844 e registrare gli esiti reali in `VALIDATION.md`. Preparare commit e pull request con «Prima», «Dopo», «Come» e punti aperti, senza modificare `main` o i repository dell’app e della privacy.

## Rifinitura del 17 ottobre 2026

La richiesta successiva del titolare di aggiungere carattere e transizioni aggiorna il vincolo iniziale sull’assenza di animazioni. Restano HTML statico, zero JavaScript, un CSS entro 8.000 byte e le stesse immagini autentiche.

La rifinitura rende più decisi i pesi di DM Sans, usa il corsivo per l’accento del titolo e un fondale lavanda inclinato dietro la scheda iniziale. Le funzioni alternano testo e immagine su desktop, mantenendo testo prima dell’immagine su telefono. Brevi segni viola accompagnano i sopratitoli e l’invito finale ha una superficie dedicata.

Il movimento usa sole trasformazioni: 650 ms nell’apertura, feedback di 220 ms sui link e ingresso delle funzioni sincronizzato con lo scorrimento quando supportato dal browser. I contenuti restano sempre visibili; la preferenza per il movimento ridotto elimina gli effetti. Verifiche e misure della revisione in `VALIDATION.md`. Anche questa rifinitura si consegna su branch per revisione, senza merge automatico.

## Punti aperti per la revisione

- Frase personale di Antonio: segnaposto visibile in entrambe le pagine.
- Badge ufficiali IT/EN: download Google bloccato con HTTP 403; segnaposto evidente da sostituire con gli SVG ufficiali non modificati.
- Elenco delle autorizzazioni Play: trascrizione di Antonio ancora necessaria; commento `DA COMPLETARE` nell’HTML.
- Exodus: nessun report disponibile, quindi nessuna affermazione «zero tracciatori».
- UTM: presenza verificabile nei link, interpretazione di Play Console non verificata.
- Hero: ritaglio dello screenshot attualmente fornito, in attesa dell’eventuale nuovo screenshot del mese.
- Accesso esterno: sito pubblico e Play bloccati dall’ambiente; i due report `/mnt/project-files/report/` citati nel brief non sono disponibili.

## Fuori da questa pull request

Le guide all’importazione CSV e alle singole banche verranno valutate separatamente, dopo importazioni reali e datate. La correzione delle frasi troppo assolute nell’informativa appartiene ai repository dell’app e della privacy: qui non vengono modificati. Non si anticipano come pubblicate le correzioni della 1.2.2.
