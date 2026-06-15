# Rottavera

Materiale di studio per la **patente nautica entro le 12 miglia**, organizzato per argomenti con schede di studio, quiz interattivi e statistiche personali.

## Struttura del progetto

```
rottavera/
├── index.html              ← Home page con le 9 macro-aree
├── study.html              ← Template unico per le schede di studio
├── statistiche.html        ← Dashboard statistiche e allenamento mirato
├── pratica.html            ← Sessione di pratica guidata
├── quiz.js                 ← Logica quiz, caricamento contenuto, lightbox
├── style.css               ← Stili condivisi
├── questions_index.json    ← Indice flat di tutte le 1684 domande
│
├── content/                ← Schede di studio HTML per argomento
│   └── <argomento>.html
│
├── data/                   ← Dati quiz JSON per argomento
│   └── <argomento>.json
│
├── immagini/               ← Immagini dei quiz (103 PNG, numerati 1–103)
│   └── *.png
│
└── old/                    ← File legacy (sorgenti originali, script di build)
```

## Argomenti

| Topic | Titolo | Domande |
|-------|--------|---------|
| `navigazione` | Navigazione e Carteggio | 319 |
| `vela` | Vela | 249 |
| `fanali_e_colreg` | Fanali, COLREG e Segnalamento | 243 |
| `scafo_e_propulsione` | Scafo e Propulsione | 226 |
| `sicurezza` | Sicurezza a bordo | 198 |
| `porto_e_manovre` | Porto e Manovre | 139 |
| `normativa_e_patente` | Normativa e Patente | 124 |
| `meteorologia` | Meteorologia | 120 |
| `sport_e_pesca` | Sport nautici e Pesca | 66 |
| **Totale** | | **1684** |

## Come usare

Apri `index.html` in un browser. Non serve nessun server: l'app è interamente statica.

Ogni argomento apre `study.html?topic=<argomento>` che carica dinamicamente:
- `content/<argomento>.html` — schede di studio con immagini e spiegazioni
- `data/<argomento>.json` — domande del quiz per sezione

### Funzionalità

- **Schede di studio** con immagini dei quiz embedded, numerate e cliccabili (lightbox)
- **Quiz per sezione** nel pannello laterale, sincronizzato con lo scorrimento
- **Risposta interattiva** con feedback immediato (verde/rosso) e reset per domanda
- **Rating difficoltà** per domanda (🟢 facile / 🟡 media / 🔴 difficile)
- **Progressi persistenti** in `localStorage`; esportabili e importabili come file JSON dalla pagina Statistiche
- **Allenamento mirato** in `pratica.html` filtrabile per difficoltà, argomento, domande mai viste o sbagliate

## Dati

- `data/<argomento>.json` — struttura: `{ "<sezione-id>": [{ q, a[], c, id, img? }] }`
- `questions_index.json` — indice flat usato da `statistiche.html` e `pratica.html`
- `immagini/<n>.png` — immagini referenziate tramite il campo `img` nel JSON delle domande
