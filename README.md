# Rottavera

Raccolta di materiale di studio per la **patente nautica entro le 12 miglia**, organizzata per argomenti con sommari interattivi, quiz embedded e statistiche personali.

## Struttura del progetto

```
rottavera/
├── index.html                      ← Home page con le 9 macro-aree
├── statistiche.html                ← Dashboard statistiche e allenamento mirato
│
├── summary_<argomento>.html        ← Sommari con quiz interattivi (pagine principali)
├── <argomento>.html                ← Quiz puri per area (usati da statistiche)
├── pratica.html                    ← Sessione di pratica guidata
│
├── _src_<argomento>.html           ← Sorgenti HTML per i sommari (usati da build)
├── _imgdata_<argomento>.json       ← Dati delle domande con immagini per area
│
├── base.json                       ← Database domande patente base (1472 domande)
├── vela.json                       ← Database domande vela (250 domande)
├── all.json                        ← Tutte le domande aggregate con metadati
├── questions_index.json            ← Indice flat di tutte le domande (generato)
│
├── images/
│   ├── base/                       ← Immagini delle domande base (105 file)
│   └── vela/                       ← Immagini delle domande vela (2 file)
│
├── notebooklm/                     ← Testi esportati per NotebookLM / podcast audio
│   ├── <argomento>.txt
│   └── episodi/                    ← Trascrizioni episodi audio per argomento
│
├── build_interactive_summaries.py  ← Script per rigenerare i summary_*.html
└── build_notebooklm.py             ← Script per rigenerare i testi NotebookLM
```

## Argomenti

| Pagina | Contenuto | Domande |
|--------|-----------|---------|
| `summary_scafo_e_propulsione.html` | Struttura scafo, elica, motori, avarie | 226 |
| `summary_sicurezza.html` | Incendi, estintori, dotazioni, emergenze, VHF | 198 |
| `summary_porto_e_manovre.html` | Porto, ancoraggio, ormeggio, segnali | 139 |
| `summary_fanali_e_colreg.html` | Fanali, COLREG, segnalamento marittimo | 329 |
| `summary_navigazione.html` | Carteggio, carte nautiche, strumenti | 263 |
| `summary_meteorologia.html` | Vento, fronti, previsioni, manovra col mal tempo | 100 |
| `summary_normativa_e_patente.html` | Codice della navigazione, documenti, patente | 221 |
| `summary_sport_e_pesca.html` | Sport nautici, immersioni, pesca | 47 |
| `summary_vela.html` | Attrezzatura, manovre, regole vela | 250 |

## Come usare

Apri `index.html` in un browser. Non serve nessun server: l'app è interamente statica.

Ogni pagina sommario (`summary_*.html`) ha:
- **Sommario dell'argomento** con figure e spiegazioni
- **Quiz interattivi** embedded per sezione
- **Navigazione** tra sezioni tramite indice

La pagina `statistiche.html` traccia le tue risposte in `localStorage` e mostra:
- Domande mai viste, sbagliate, difficili
- Rating di difficoltà per domanda
- Filtri per categoria e argomento

## Rigenerare i sommari

I file `summary_*.html` sono generati combinando i sorgenti `_src_*.html` con le domande dei file `<argomento>.html`:

```bash
pip install beautifulsoup4
python build_interactive_summaries.py
# oppure per rigenerare solo un file:
python build_interactive_summaries.py summary_fanali_e_colreg.html
```

Il build aggiorna anche `questions_index.json` con tutte le domande aggregate.

## Dati delle domande

- `base.json` / `vela.json`: database sorgente con testo domanda, risposte, immagine associata (campo `immagine[].rid`), spiegazione.
- `_imgdata_<argomento>.json`: sottoinsieme delle domande con immagini, usato dai sommari per mostrare le figure.
- `questions_index.json`: indice flat generato dal build con tutte le domande indicizzate per topic e sezione.

Le immagini sono riferite tramite percorsi relativi `images/base/<file>` e `images/vela/<file>`.
