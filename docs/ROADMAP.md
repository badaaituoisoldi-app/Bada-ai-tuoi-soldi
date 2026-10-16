# Ricostruzione del sito Bada! · 16 ottobre 2026

Il brief `prompt-sito-da-zero-2026-10-16.md` sostituisce la precedente roadmap di rifinitura. L’obiettivo è aiutare chi cerca un budget personale offline per Android a valutare le prove, capire i limiti e arrivare a Google Play. La consegna prevista è una pull request da branch dedicato verso `main`, senza merge o pubblicazione in questa attività.

1. **Verificare le promesse.** Consultare il repository dell’app in sola lettura, usando la 1.2.1 come baseline delle funzioni e distinguendola da HEAD 1.2.2. Esplicitare le cautele su rete, CSV e backup. Fonti e limiti sono in `SOURCES.md`.
2. **Ridurre il materiale servito.** Conservare i sei poster PNG in `originals/` e pubblicare cinque ritagli WebP lossless riproducibili tramite `crops.json`. Mantenere icona ufficiale, feature graphic e DM Sans con licenza. Eliminare gli script del sito e il pacchetto HTML di anteprima.
3. **Costruire due pagine statiche.** HTML italiano e inglese, un CSS entro 8.000 byte, tema di sistema, intestazione essenziale, scheda Disponibile reale nell’apertura, prove, quattro funzioni, backup, limiti, tre domande aperte, autore e invito finale. Le immagini aprono il proprio file nel browser. Nessuna galleria, animazione, selettore di tema o visualizzatore JavaScript.
4. **Preparare manutenzione e pubblicazione.** Percorsi relativi per GitHub Pages, canonical/hreflang, sitemap, link Play con UTM mantenuti da un unico script locale. Guardia prima dell’upload Pages contro JavaScript, tag script e file sopra 100.000 byte, eccetto la feature graphic. La guardia è stata rotta deliberatamente su fixture temporanee, confermando i rifiuti attesi.
5. **Verificare e consegnare.** Eseguire Playwright/axe su IT/EN a 320, 390 e 1440 px in entrambi i temi; guardare anche 768 px. Misurare il traffico iniziale e completo, controllare l’apertura a 390 × 844 e registrare gli esiti reali in `VALIDATION.md`. Preparare commit e pull request con «Prima», «Dopo», «Come» e punti aperti, senza modificare `main` o i repository dell’app e della privacy.

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
