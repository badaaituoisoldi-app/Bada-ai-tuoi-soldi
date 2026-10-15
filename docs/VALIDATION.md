# Verifica del sito

Eseguita il 14 ottobre 2026 su Chromium headless, con server statico Python e percorso reale `/Bada-ai-tuoi-soldi/`.

- Viewport 320, 360, 390, 430, 768, 1024 e 1440 px: asset caricati, nessuno scorrimento orizzontale, un solo H1.
- Ispezione visiva delle catture mobile e desktop: gerarchia, ordine dei contenuti e disposizione responsive verificati. Sei screenshot forniti dall’utente illustrano l’interfaccia reale; la vista mensile compare anche nell’apertura. La demo del sito è in una sezione distinta. Il logo e il punto esclamativo originali sono conservati.
- Demo: 450 € iniziali; −450 € con spese di 2.000 € e messaggio testuale di disponibile negativo; zero; precisione ai centesimi (449,99 €); campi vuoti e importi negativi non accettati. Calcoli in centesimi e nessuna persistenza. Verificati anche valori tutti a zero, massimo ammesso (100.000.000 €), risultato negativo estremo e reset dei campi. Nessuno scorrimento orizzontale negli stati estremi.
- Tutte le otto FAQ aperte e chiuse da tastiera, navigazione principale attivata da tastiera. FAQ e spiegazione iniziale disponibili anche senza JavaScript.
- Collegamenti interni risolti; URL Google Play, privacy e mail corrispondenti alla richiesta. Destinazioni remote Play e privacy non verificabili via rete (403 del proxy), quindi non dichiarate raggiungibili.
- Nessun errore JavaScript o asset HTTP fallito, nessuna richiesta esterna durante il caricamento e le interazioni testate.
- `prefers-reduced-motion` verificato; controllo axe-core WCAG 2 A/AA e WCAG 2.1 AA senza violazioni nei sette viewport. Non equivale a certificazione o audit manuale completo con screen reader.
- Font DM Sans ospitato localmente e licenza inclusa. Logo originale conservato.

Test ripetibili in `tests/browser.cjs`, istruzioni nel README. Workflow predisposto ma non eseguito su GitHub: permessi Pages e pubblicazione restano da verificare dall’utente. Nessun push o pubblicazione eseguito.

## Nuova realizzazione

La versione precedente è stata sostituita: nuova composizione tipografica, demo interattiva in una sezione dedicata, nuovo layout delle funzionalità e della privacy, nuova chiusura con asset originale. Rimossi telefono vuoto, orbite e segnaposto ripetuti. Le prove sopra si riferiscono alla nuova versione.

## Integrazione degli screenshot Google Play

Ricevuti dall’utente nell’archivio `Nuova cartella.zip`: sei screenshot promozionali, feature graphic e copertina. I sei PNG e la feature graphic utilizzati sono identici agli originali (confronto SHA-256/byte). Non sono stati ritoccati, ridisegnati o ritagliati. I sei file sono tutti in tema chiaro; tema scuro e vista dedicata delle spese fisse non sono inclusi.

- Vista mensile in apertura, sei immagini con didascalie e caricamento differito in galleria. Dimensioni intrinseche impostate per evitare salti di layout.
- Galleria: sette collegamenti agli originali (uno in apertura e sei in galleria); apertura con Invio, immagine e testo alternativo corretti, chiusura tramite Esc o pulsante, ritorno del focus al collegamento. Verificata a 320 e 1440 px, anche con axe-core.
- Tutta la suite precedente rieseguita e superata a sette larghezze, compresi asset caricati nel percorso `/Bada-ai-tuoi-soldi/`, demo spostata nella propria sezione e nessuna richiesta esterna.
- Ispezione visiva aggiornata su desktop e mobile. Informativa e scheda Play remote restano non verificabili dalla rete dell’ambiente; gli asset forniti non provano da soli la versione corrente dello store.

Il file autonomo `/workspace/anteprima-bada.html` è aggiornato con font, stili, script e immagini incorporati, per una revisione senza installazione. Nessun push o deploy eseguito.
