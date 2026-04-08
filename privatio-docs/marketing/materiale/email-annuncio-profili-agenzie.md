# Email annuncio: Nuovo profilo vetrina agenzia

**Target**: agenzie convenzionate Privatio (segmento `agency` su Resend)
**Obiettivo**: spingere ogni agenzia a completare il proprio profilo vetrina entro X giorni — senza profilo completo, l'agenzia non riceve nuovi clienti
**Tipo**: campagna one-shot (broadcast)

---

## Subject (A/B)

**A**: Da oggi i venditori scelgono — completa il tuo profilo vetrina
**B**: ⚠️ Senza profilo completo, non riceverai più clienti su Privatio

**Preheader**: I venditori vedono ora un profilo vetrina di ogni agenzia: chi sei, cosa sai fare, perché sceglierti.

---

## Corpo email (HTML-ready, tono Privatio)

```html
<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7f5ef;">

  <!-- Hero -->
  <div style="background: #0B1D3A; padding: 40px 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
    <p style="color: #C9A84C; margin-top: 8px; font-size: 16px;">Da oggi i venditori scelgono te</p>
  </div>

  <!-- Body -->
  <div style="padding: 32px 28px; background: white;">

    <p style="color: #0B1D3A; font-size: 16px;">Ciao {{nome_agenzia}},</p>

    <p style="color: #0B1D3A; line-height: 1.65; font-size: 15px;">
      Abbiamo appena rilasciato un cambiamento importante nel modo in cui i venditori scelgono l'agenzia partner su Privatio.
    </p>

    <h2 style="color: #0B1D3A; font-size: 20px; margin-top: 28px;">Cosa cambia</h2>

    <p style="color: #0B1D3A; line-height: 1.65; font-size: 15px;">
      Fino a ieri, ogni agenzia appariva al venditore con poche informazioni: nome, contatti, valutazione media. Tutte si assomigliavano. Da oggi ogni agenzia ha un <strong>profilo vetrina</strong> riservato — visibile <strong>solo</strong> ai venditori che hanno pubblicato un immobile nella tua zona — che mette in luce chi siete, cosa fate, e perché vi distinguete.
    </p>

    <div style="background: #f7f5ef; border-left: 4px solid #C9A84C; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
      <p style="color: #0B1D3A; margin: 0; font-size: 14px;">
        <strong>Importante:</strong> da {{data_attivazione}}, le agenzie con profilo incompleto <strong>non riceveranno nuove assegnazioni</strong> e <strong>non saranno incluse nel fallback 48h</strong> (la condivisione automatica dei contatti dei venditori che non scelgono entro 48 ore).
      </p>
    </div>

    <h2 style="color: #0B1D3A; font-size: 20px; margin-top: 28px;">Cosa devi fare</h2>

    <p style="color: #0B1D3A; line-height: 1.65; font-size: 15px;">
      Ti bastano 15 minuti. Vai nella tua dashboard, sezione <strong>Profilo Vetrina</strong>, e compila:
    </p>

    <ul style="color: #0B1D3A; line-height: 1.8; font-size: 15px;">
      <li><strong>Tagline</strong> — una frase che racconta chi siete (es. "Il tuo partner immobiliare a Torino dal 1995")</li>
      <li><strong>Descrizione</strong> — chi siete, da quanto siete sul mercato, cosa vi rende diversi</li>
      <li><strong>3 punti di forza</strong> — perché un venditore dovrebbe scegliere voi</li>
      <li><strong>Specializzazioni</strong> — ville, immobili commerciali, aste, ecc.</li>
      <li><strong>Foto</strong> — logo, immagine di copertina, gallery dell'ufficio o del team</li>
    </ul>

    <p style="color: #0B1D3A; line-height: 1.65; font-size: 15px;">
      Più il profilo è completo, più i venditori si fidano. Più si fidano, più ti scelgono.
    </p>

    <!-- CTA -->
    <p style="text-align: center; margin: 32px 0;">
      <a href="https://privatio.vercel.app/dashboard/agenzia/profilo"
         style="background: #C9A84C; color: #0B1D3A; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
        Completa il profilo ora →
      </a>
    </p>

    <h2 style="color: #0B1D3A; font-size: 20px; margin-top: 28px;">Il fallback 48h</h2>

    <p style="color: #0B1D3A; line-height: 1.65; font-size: 15px;">
      Se un venditore della tua zona non sceglie un'agenzia entro 48 ore dalla pubblicazione, riceverai automaticamente i suoi contatti via email — nome, telefono, indirizzo dell'immobile, descrizione — e potrai ricontattarlo direttamente. Il venditore acconsente esplicitamente a questa condivisione al momento della pubblicazione (GDPR-compliant).
    </p>

    <p style="color: #0B1D3A; line-height: 1.65; font-size: 15px;">
      <strong>Questa funzionalità è disponibile solo per le agenzie con profilo completo.</strong>
    </p>

    <!-- Sign-off -->
    <p style="color: #0B1D3A; line-height: 1.65; font-size: 15px; margin-top: 28px;">
      Se hai domande, scrivici a <a href="mailto:agenzie@privatio.it" style="color: #C9A84C;">agenzie@privatio.it</a>.
    </p>

    <p style="color: #0B1D3A; font-size: 15px;">
      A presto,<br>
      <strong>Federico — Privatio</strong>
    </p>

  </div>

  <!-- Footer -->
  <div style="padding: 20px; background: #0B1D3A; text-align: center;">
    <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">
      Privatio · Zero commissioni per il venditore · Solo agenzie convenzionate
    </p>
  </div>

</div>
```

---

## Variabili dinamiche

| Token | Esempio |
|---|---|
| `{{nome_agenzia}}` | "Immobiliare Rossi" |
| `{{data_attivazione}}` | "1 maggio 2026" |

---

## Note operative

- **Send window**: martedì o mercoledì 10:00–11:00 (massima open rate per B2B)
- **Reminder**: dopo 7 giorni, inviare un secondo email solo a chi non ha completato (segmento `profileCompletedAt = null`)
- **Tracking**: monitorare apertura, click sulla CTA, e conversione (% agenzie che completano il profilo entro 14 giorni)
- **Hard deadline**: dopo 30 giorni, le agenzie senza profilo completo vengono effettivamente escluse dal matchmaking (già implementato lato codice)
