# Fonti e limiti della verifica

Consultazione delle fonti: **14 ottobre 2026**. Asset aggiornati il **15 ottobre 2026**.
Questo documento distingue le evidenze disponibili dai contenuti non verificati.

## App Bada!

Repository di riferimento, consultato senza modificarlo:
<https://github.com/badaaituoisoldi-app/Bada---ai-tuoi-soldi>.
Commit esaminato: `1a16a1a6d61b83b2aa37c3fc5e34ee341c90b7f5`.

Sono stati letti `AGENTS.md`, `CLAUDE.md`, `README.md`, `CHANGELOG.md`,
`package.json`, `app.json`, `src/constants.ts`, `src/ui/tokens.ts` e
`docs/privacy-policy.md`. Le informazioni su funzioni e privacy derivano
da questi documenti, non da una verifica dell'app installata.

Il changelog identifica **1.0.0, 1 settembre 2026**, come prima versione
pubblica e documenta **1.2.1, 27 settembre 2026**, come versione più recente.
La versione 1.2.1 coincide con i manifest del repository. Questo è un
riscontro documentale delle versioni: la versione attualmente distribuita
da Google Play non è stata verificata. Le voci sotto «Non rilasciato» non
sono usate come promessa di funzionalità già disponibili.

Le funzioni documentate comprendono budget mensile, entrate e uscite,
categorie, spese fisse, obiettivi, bilancio annuale, grafici, importazione ed
esportazione CSV e backup automatico in una cartella scelta dall'utente.
L'app è solo Android, con interfaccia italiana e inglese. Non sono promessi
collegamenti bancari, sincronizzazione tra dispositivi o app web/iOS.

L'informativa sorgente precisa che l'app non invia dati e funziona offline.
CSV condivisi dall'utente, cartelle di backup eventualmente sincronizzate
con servizi cloud e backup di sistema Android seguono invece le scelte
dell'utente e del sistema. «Offline» non significa che un file esportato
non possa mai uscire dal telefono.

## Accesso alle fonti pubbliche

I tentativi di consultare la scheda Google Play, il sito Actual Budget,
il sito Cashew e l'informativa privacy pubblicata hanno restituito **HTTP
403** nell'ambiente di lavoro. Non sono stati verificati contenuti, immagini,
prezzi, recensioni o versione corrente dello store attraverso tali pagine.
L'informativa sorgente del repository non prova automaticamente che la copia
pubblicata sia identica.

- Google Play: <https://play.google.com/store/apps/details?id=com.bada.aituoisoldi&hl=it>
- Privacy pubblicata: <https://badaaituoisoldi-app.github.io/bada-privacy/Privacy-it.html>
- Actual Budget: <https://actualbudget.org/>
- Cashew: <https://cashewapp.web.app/>

Il testo del repository <https://github.com/Ivy-Apps/ivy-wallet> è stato
accessibile. Le domande quotidiane sul budget, la semplicità e la chiarezza
sono riferimenti di comunicazione, senza riprenderne testi, immagini,
marchi o funzionalità. Il repository è archiviato; il README dichiara che
il progetto non è più mantenuto dal 5 novembre 2024.

## Riferimenti per il sito

Per la nuova composizione sono stati consultati i repository ufficiali:

- [Cashew Website](https://github.com/jameskokoska/Cashew-Website), commit `44c2ebb`: sorgenti HTML/CSS e pagina renderizzata localmente.
- [Fossify](https://github.com/FossifyOrg/FossifyOrg.github.io), commit `79ec981`: sorgente della pagina singola app `src/pages/apps/[slug].astro`; non è stata verificata la pagina pubblicata.

Il riferimento è la gerarchia semplice dei siti di app: prodotto visibile,
testo breve e invito al download. Non sono stati copiati testi, immagini
o marchi. I tentativi di aprire i siti pubblici Things, Structured,
Daylio, Streaks, Cashew e How We Feel hanno restituito HTTP 403 tramite il
proxy: tali pagine non sono state viste e non sono dichiarate esaminate.

## Provenienza degli asset e anteprime

Il materiale iniziale comprendeva il brief testuale. Il repository di
riferimento contiene logo e icone ufficiali; questi file non sono più usati
nella landing, che impiega soltanto immagini dell’archivio fornito dal titolare.
L’autorizzazione all’uso del materiale non costituisce una licenza generale
sugli altri contenuti del repository, il cui codice resta riservato.

Il 14 ottobre 2026 il titolare ha fornito `Nuova cartella.zip`, descritto
come immagini della scheda Play Store. Contiene sei schermate promozionali
1080 × 1920 (`store-1-mese.png`, `store-2-impostazioni.png`,
`store-3-uscite.png`, `store-4-obiettivi.png`, `store-5-anno.png`,
`store-6-import.png`), `feature-graphic.png` (1024 × 500) e
`copertina-onde.png` (1080 × 1920).

I sei originali `store-*.png` sono conservati in
`site/assets/screenshots/`, identici ai file ricevuti. L’apertura mostra Mese; le due
sezioni principali presentano Entrate/uscite e Obiettivi. La galleria
compatta contiene Anno, Importazione e Impostazioni. Miniature e
visualizzatore inquadrano via CSS la sola area dell’app,
escludendo titolo promozionale e margini viola: 792 × 1424 px da (144, 401),
oppure da (144, 315) per Entrate/uscite. Una maschera con angoli di 48 px
nelle coordinate sorgente esclude i triangoli viola agli angoli. I file PNG
restano invariati e non viene rigenerata alcuna parte dell’interfaccia.
Il visualizzatore offre zoom sulla stessa area; il collegamento al poster
originale e il comportamento senza JavaScript aprono il PNG completo.
La feature graphic originale è in `site/assets/feature-graphic.png` e serve
per Open Graph e per il logo inquadrato via CSS nell’intestazione e nel
footer. La copertina ricevuta non è usata nel sito e non è inclusa negli
asset del sito. Non sono usati altri file immagine.

Su richiesta del titolare sono stati rimossi il calcolatore illustrativo e
gli asset provenienti dal repository dell’app. Restano solo i file immagine
forniti nello ZIP; nessuna interfaccia dell’app è ricostruita. Le sezioni
hanno un ingresso discreto, una sola volta, con preferenza per il movimento
ridotto. DM Sans locale è l’unica famiglia tipografica, con una gerarchia semplificata. Non sono
state generate o ritoccate immagini.

Controllo indipendente del 15 ottobre 2026: tutti i sette PNG presenti nel sito
sono identici byte per byte agli originali forniti (SHA-256). I riferimenti alle immagini nei sorgenti HTML, CSS e JavaScript e nei
metadati Open Graph rimandano solo a questi file. La copertina è esclusa dagli asset del sito.

Le immagini mostrano bilancio mensile e annuale, categorie di spesa,
obiettivi, revisione dell’importazione e impostazioni per promemoria,
backup/ripristino e CSV. Tutte le schermate sono in tema chiaro; non è stata
fornita una schermata dedicata alle Spese fisse né una in tema scuro.
Questi eventuali asset aggiuntivi non impediscono l’uso delle immagini
autentiche già disponibili.

Il tema chiaro/scuro riguarda il sito e i suoi colori. In entrambi i temi
le immagini dell’app restano i PNG chiari forniti, senza filtri di inversione,
ritocchi o schermate scure generate.

Nell’ispezione visiva non compaiono nomi, contatti o identificativi bancari:
si vedono importi, categorie e obiettivi generici. L’immagine da sola non
prova che ogni dato sia dimostrativo. La fornitura del titolare documenta
la provenienza degli asset; non sostituisce la verifica diretta della
scheda pubblicata, della versione attualmente distribuita o del prezzo.

Precisazione del marchio fornita dall’autore: il segno disposto come un sorriso è il punto esclamativo di «Bada!». Il logo non è stato ridisegnato.
