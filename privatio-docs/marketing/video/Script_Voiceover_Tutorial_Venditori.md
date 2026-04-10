# Script Voiceover — Tutorial Venditori Privatio

**Durata:** 61 secondi · **Tono:** femminile, calma e chiara, stile guida assistita
**Voce ElevenLabs consigliata:** `Bella` IT · Stability 50 · Similarity 75 · Style 30

---

## Narrazione cronometrata

### 0:00 → 0:04 — Title card
> *"Ecco come vendere la tua casa su Privatio, in pochi semplici passi."*

### 0:04 → 0:13 — Homepage, cursore su "Inserisci il tuo immobile"
> *"Dalla homepage di privatio.it, clicca sul pulsante Inserisci il tuo immobile per iniziare."*

### 0:13 → 0:20 — /vendi, form vuoto
> *"Si apre il modulo di inserimento. Qui indichi il tipo di immobile, l'indirizzo e le caratteristiche principali."*

### 0:20 → 0:28 — /vendi, form compilato
> *"Metri quadrati, numero di locali, piano, foto e prezzo: tutto gratis, senza limiti e senza carta di credito."*

### 0:28 → 0:35 — /registrati, form vuoto
> *"Prima di pubblicare, crea il tuo account gratuito: servono solo nome, email e una password."*

### 0:35 → 0:41 — /registrati, form compilato, cursore su "Crea Account"
> *"Clicca su Crea Account e il tuo annuncio viene salvato."*

### 0:41 → 0:55 — Dashboard scelta agenzia
> *"A questo punto vedi le agenzie convenzionate della tua zona. Hai quarantotto ore per sceglierla tu, confrontando rating, recensioni ed esperienza. Quando l'hai scelta, clicca su Scegli questa agenzia."*

### 0:55 → 1:01 — Outro
> *"È fatto. Il tuo annuncio è online. Senza commissioni. Privatio punto it."*

---

## Istruzioni montaggio (10 min)

1. **Audio voice**
   - ElevenLabs → voce `Bella` → incolla solo le frasi (non i titoli di sezione)
   - Export MP3

2. **Musica di sottofondo**
   - Pixabay Music → cerca "Soft Corporate" o "Gentle Acoustic Tutorial" (60-90s)
   - Volume -20 dB (molto sotto la voce, tono rassicurante)
   - Link diretto consigliato: https://pixabay.com/music/search/tutorial/

3. **Sound effects opzionali** (CapCut → Effetti → UI)
   - Click leggero ogni volta che il cursore clicca un pulsante (scene 2, 6, 7)

4. **Montaggio finale**
   - CapCut / Descript / iMovie
   - Importa `Privatio_Tutorial_Venditori.mp4` come base
   - Traccia 2: voice MP3 (allinea al timecode sopra)
   - Traccia 3: musica a -20 dB
   - Export 1080p H.264

---

## Note

- Il video dura **61 secondi** a ritmo di lettura standard (~150 parole/min).
- Se ElevenLabs genera una narrazione più lunga del previsto, puoi rallentare le scene editando `scripts/build_tutorial_venditori.py` (parametro `duration_s` di ogni scena) e ri-generare.
- Gli screenshot sono presi dal sito live `privatio.vercel.app` quindi se aggiorni il design, basta rilanciare `capture_v2.py` e `build_tutorial_venditori.py` per avere un video aggiornato.
