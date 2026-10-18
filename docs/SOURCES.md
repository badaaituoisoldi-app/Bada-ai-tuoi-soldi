# Fonti e limiti della ricostruzione

Verifica documentale del **16 ottobre 2026**. Il brief di Antonio, `prompt-sito-da-zero-2026-10-16.md`, autorizza pagine IT/EN senza JavaScript, ritagli WebP lossless e consegna tramite pull request senza merge.

## Repository dell’app, consultato in sola lettura

Fonte: `badaaituoisoldi-app/Bada---ai-tuoi-soldi`, privato. Non è stato modificato né ripubblicato il codice dell’app.

- Baseline delle funzionalità: commit `fd0a2a4245043dbb06967dcb188fbaedc181e640`, release **1.2.1**, confermata da `app.json`, `src/constants.ts` e `CHANGELOG.md`.
- HEAD consultato: `9fb256c3b0aac37f614060133ce4da7295eb9e34`, versione **1.2.2**. Il brief la indica come non ancora pubblicata: le sue correzioni non sono presentate come già distribuite.
- `CLAUDE.md` è identico nelle due revisioni. La privacy sorgente aggiornata, `docs/privacy-policy.md`, è stata letta anche a HEAD per le precisazioni su diagnostica e backup.

È un audit dei documenti e dei sorgenti: l’app non è stata compilata o provata su telefono e il manifest del pacchetto 1.2.1 distribuito non è stato ispezionato. La gratuità corrente, la versione pubblicata e la presentazione personale di Antonio sono informazioni del brief; il repository non prova il prezzo o la distribuzione effettiva su Play.

| Contenuto della landing | Evidenze consultate nella 1.2.1, salvo indicazione |
| --- | --- |
| Android, offline, nessun account/server/pubblicità, IT/EN | `app.json`, `README.md`, `CLAUDE.md` |
| Rimozione del permesso Internet nella release | `plugins/withOfflineManifest.js`, attivato in `app.json`; il debug mantiene la rete per gli strumenti di sviluppo |
| Permessi ereditati, Firebase Messaging, launcher e attribuzione Play | `CLAUDE.md`, audit offline del 26 agosto e privacy sorgente a HEAD |
| Apertura di link tramite browser esterno | `src/constants.ts` |
| Entrate, uscite, categorie e spese fisse nei mesi selezionati | `README.md`, `src/domain/fixedExpenses/fixedExpense.actions.ts` |
| Disponibile reale e quote residue degli obiettivi | `src/domain/planning/planning.selectors.ts`, `src/hooks/useAppDerivedState.ts`, `src/domain/planning/goals.ts` |
| CSV, riconoscimento colonne, categorie per negozio e revisione | `src/services/csv/importTransactionsCsv.ts`, `src/features/csvImport/ColumnMapper.tsx`, `CsvImportReviewScreen.tsx`, `groupMovements.ts` |
| Bilancio annuale e mese migliore/peggiore | `src/screens/AnnualBalanceTab.tsx`, dizionario italiano |
| Esportazione dei movimenti CSV | `src/services/csv/buildTransactionsCsv.ts` |
| Promemoria locale alle 20:00, modificabile e facoltativo | `src/features/settings/reminderSettings.ts`, `src/services/notifications.ts`, `src/navigation/NotificationManager.tsx` |
| Tema, valuta senza conversioni, scorciatoia Aggiungi spesa | `README.md`, `src/shared/money/currencyFormat.ts`, `plugins/withAddExpenseShortcut.js` |
| Backup giornaliero all’apertura, cartella e file unico | `src/hooks/useDailyAutoBackup.ts`, `src/services/storage/autoBackup.ts`, `fileBackup.ts` |
| Ripristino selettivo e primo avvio facoltativo | `src/features/settings/backupSelection.ts`, `src/features/onboarding/useOnboardingRestore.ts`, `onboarding.steps.ts` |
| Esporta diagnostica disponibile se esistono errori | `src/features/settings/components/VersionSection.tsx`, `hooks/useDiagnosticsActions.ts`, `src/services/diagnostics/diagnosticsSharing.ts` |

Il backup avviene una volta al giorno **quando si apre l’app**, non autonomamente in background. Non c’è esportazione manuale del backup completo. Il CSV è un’importazione manuale con riconoscimento euristico: non implica collegamento bancario o compatibilità garantita. Le quote sottratte dal disponibile sono quelle ancora da versare; il margine è applicato solo nei mesi in cui è attivo. Non vengono pubblicati esempi numerici o formule semplificate.

## Rete e privacy

L’assenza di `INTERNET` impedisce all’app di aprire connessioni di rete da sola. Non impedisce di aprire un browser esterno o di condividere un file per scelta dell’utente. Un vecchio audit del manifest conferma l’assenza di Internet in una build precedente, ma non è una nuova verifica del pacchetto distribuito 1.2.1.

Firebase Messaging e altre voci possono essere ereditate dalle dipendenze. Non è disponibile la trascrizione corrente delle autorizzazioni della scheda Play: il commento `DA COMPLETARE` nell’HTML chiede ad Antonio le diciture esatte, incluse eventuali voci di rete come `ACCESS_NETWORK_STATE` o ricezione FCM. Non vengono inventate traduzioni dell’elenco Play. Non è disponibile un report Exodus: la relativa prova è omessa.

La privacy sorgente precisa che una cartella sincronizzata con un cloud e il backup di sistema Android possono portare dati fuori dal telefono; lo stesso vale per CSV e diagnostica condivisi volontariamente. Il file di backup nella cartella scelta resta dopo la disinstallazione. La landing riporta queste cautele e non promette che i dati non possano mai uscire dal telefono.

Gli URL delle informative IT/EN derivano da `src/constants.ts`:

- <https://badaaituoisoldi-app.github.io/bada-privacy/Privacy-it.html>
- <https://badaaituoisoldi-app.github.io/bada-privacy/Privacy-en.html>

Il repository `bada-privacy` non è stato toccato. La sorgente consultata non prova che le copie pubbliche siano identiche.

## Immagini, icona e font

I sei poster 1080 × 1920 forniti in `Nuova cartella.zip` sono conservati, byte per byte, in `originals/`. La feature graphic 1024 × 500 resta in `site/assets/feature-graphic.png`; la copertina decorativa non viene usata.

La decisione di Antonio del 16 ottobre sostituisce la vecchia regola dei PNG interi nel sito con ritagli WebP lossless. I quattro ritagli pubblicati mostrano la schermata intera del mese, le categorie dei movimenti, gli obiettivi e la revisione CSV. Sono porzioni dei poster senza ridimensionamento, ritocco o ricostruzione; `originals/crops.json` registra coordinate, dimensioni, byte e hash. Il confronto dei byte RGB decodificati conferma che ogni WebP coincide con il ritaglio del PNG sorgente. Il README contiene il comando Pillow per rigenerarli.

I cinque WebP pesano complessivamente **121.470 byte**. Le schermate sono italiane e chiare in entrambe le lingue e in entrambi i temi del sito; la pagina inglese lo dichiara. Le immagini restano quelle fornite: la nuova schermata del mese dopo la correzione dell’app non è stata ricevuta. Non è stata ricostruita un’interfaccia per anticiparla.

`site/assets/icon.png` è l’icona 192 × 192 già presente su `main`, invariata. È stato verificato che corrisponde all’icona ufficiale 1024 × 1024 del repository dell’app ridimensionata con Pillow LANCZOS. L’originale dell’app è identico tra 1.2.1 e HEAD. Il marchio non è ridisegnato: il segno che sembra un sorriso è il punto esclamativo di «Bada!».

DM Sans viene servito dal file WOFF2 locale già presente, con la relativa licenza OFL. La provenienza degli screenshot non dimostra la versione distribuita nello store o l’esistenza di recensioni; tali inferenze non sono usate nel sito.

## Accessi bloccati e contenuti da completare

Da questo ambiente `github.io` e `play.google.com` non sono raggiungibili. Non sono stati verificati la landing pubblica, la scheda Play o le informative pubblicate. Il recupero dei badge ufficiali Google è stato bloccato con HTTP 403: restano segnaposto testuali evidenti, non badge disegnati o modificati.

La frase personale sul perché Antonio ha creato l’app resta un segnaposto visibile. La forma UTM è centralizzata in `scripts/play_links.py`, ma la sua interpretazione in Play Console non è verificata. Il report Exodus, le diciture delle autorizzazioni Play e il nuovo screenshot del mese restano aperti.

I documenti esterni citati nel brief, `/mnt/project-files/report/bada-roadmap-2026-10-14.md` e `/mnt/project-files/report/bada-sito-da-zero-2026-10-15.md`, non sono disponibili in questo ambiente e non sono dichiarati consultati. La ricostruzione segue il brief allegato e le fonti effettivamente lette. Gli esiti browser e le misure della pagina sono registrati separatamente in `VALIDATION.md`.
