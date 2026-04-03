"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Province italiane                                                   */
/* ------------------------------------------------------------------ */

/* Province italiane organizzate per regione */
const PROVINCE_BY_REGION: Record<string, { value: string; label: string }[]> = {
  "Piemonte": [
    { value: "AL", label: "Alessandria" }, { value: "AT", label: "Asti" }, { value: "BI", label: "Biella" },
    { value: "CN", label: "Cuneo" }, { value: "NO", label: "Novara" }, { value: "TO", label: "Torino" },
    { value: "VB", label: "Verbano-Cusio-Ossola" }, { value: "VC", label: "Vercelli" },
  ],
  "Valle d'Aosta": [{ value: "AO", label: "Aosta" }],
  "Lombardia": [
    { value: "BG", label: "Bergamo" }, { value: "BS", label: "Brescia" }, { value: "CO", label: "Como" },
    { value: "CR", label: "Cremona" }, { value: "LC", label: "Lecco" }, { value: "LO", label: "Lodi" },
    { value: "MN", label: "Mantova" }, { value: "MI", label: "Milano" }, { value: "MB", label: "Monza e Brianza" },
    { value: "PV", label: "Pavia" }, { value: "SO", label: "Sondrio" }, { value: "VA", label: "Varese" },
  ],
  "Trentino-Alto Adige": [{ value: "BZ", label: "Bolzano" }, { value: "TN", label: "Trento" }],
  "Veneto": [
    { value: "BL", label: "Belluno" }, { value: "PD", label: "Padova" }, { value: "RO", label: "Rovigo" },
    { value: "TV", label: "Treviso" }, { value: "VE", label: "Venezia" }, { value: "VR", label: "Verona" }, { value: "VI", label: "Vicenza" },
  ],
  "Friuli Venezia Giulia": [
    { value: "GO", label: "Gorizia" }, { value: "PN", label: "Pordenone" }, { value: "TS", label: "Trieste" }, { value: "UD", label: "Udine" },
  ],
  "Liguria": [
    { value: "GE", label: "Genova" }, { value: "IM", label: "Imperia" }, { value: "SP", label: "La Spezia" }, { value: "SV", label: "Savona" },
  ],
  "Emilia-Romagna": [
    { value: "BO", label: "Bologna" }, { value: "FE", label: "Ferrara" }, { value: "FC", label: "Forlì-Cesena" },
    { value: "MO", label: "Modena" }, { value: "PR", label: "Parma" }, { value: "PC", label: "Piacenza" },
    { value: "RA", label: "Ravenna" }, { value: "RE", label: "Reggio Emilia" }, { value: "RN", label: "Rimini" },
  ],
  "Toscana": [
    { value: "AR", label: "Arezzo" }, { value: "FI", label: "Firenze" }, { value: "GR", label: "Grosseto" },
    { value: "LI", label: "Livorno" }, { value: "LU", label: "Lucca" }, { value: "MS", label: "Massa-Carrara" },
    { value: "PI", label: "Pisa" }, { value: "PT", label: "Pistoia" }, { value: "PO", label: "Prato" }, { value: "SI", label: "Siena" },
  ],
  "Umbria": [{ value: "PG", label: "Perugia" }, { value: "TR", label: "Terni" }],
  "Marche": [
    { value: "AN", label: "Ancona" }, { value: "AP", label: "Ascoli Piceno" }, { value: "FM", label: "Fermo" },
    { value: "MC", label: "Macerata" }, { value: "PU", label: "Pesaro e Urbino" },
  ],
  "Lazio": [
    { value: "FR", label: "Frosinone" }, { value: "LT", label: "Latina" }, { value: "RI", label: "Rieti" },
    { value: "RM", label: "Roma" }, { value: "VT", label: "Viterbo" },
  ],
  "Abruzzo": [
    { value: "AQ", label: "L'Aquila" }, { value: "CH", label: "Chieti" }, { value: "PE", label: "Pescara" }, { value: "TE", label: "Teramo" },
  ],
  "Molise": [{ value: "CB", label: "Campobasso" }, { value: "IS", label: "Isernia" }],
  "Campania": [
    { value: "AV", label: "Avellino" }, { value: "BN", label: "Benevento" }, { value: "CE", label: "Caserta" },
    { value: "NA", label: "Napoli" }, { value: "SA", label: "Salerno" },
  ],
  "Puglia": [
    { value: "BA", label: "Bari" }, { value: "BT", label: "Barletta-Andria-Trani" }, { value: "BR", label: "Brindisi" },
    { value: "FG", label: "Foggia" }, { value: "LE", label: "Lecce" }, { value: "TA", label: "Taranto" },
  ],
  "Basilicata": [{ value: "MT", label: "Matera" }, { value: "PZ", label: "Potenza" }],
  "Calabria": [
    { value: "CZ", label: "Catanzaro" }, { value: "CS", label: "Cosenza" }, { value: "KR", label: "Crotone" },
    { value: "RC", label: "Reggio Calabria" }, { value: "VV", label: "Vibo Valentia" },
  ],
  "Sicilia": [
    { value: "AG", label: "Agrigento" }, { value: "CL", label: "Caltanissetta" }, { value: "CT", label: "Catania" },
    { value: "EN", label: "Enna" }, { value: "ME", label: "Messina" }, { value: "PA", label: "Palermo" },
    { value: "RG", label: "Ragusa" }, { value: "SR", label: "Siracusa" }, { value: "TP", label: "Trapani" },
  ],
  "Sardegna": [
    { value: "CA", label: "Cagliari" }, { value: "NU", label: "Nuoro" }, { value: "OR", label: "Oristano" },
    { value: "SS", label: "Sassari" }, { value: "SU", label: "Sud Sardegna" },
  ],
};

// Flat list for Select component (with region prefix for clarity)
const provinceOptions: SelectOption[] = Object.entries(PROVINCE_BY_REGION).flatMap(
  ([region, provinces]) => [
    { value: `__region_${region}`, label: `── ${region} ──`, disabled: true },
    ...provinces,
  ]
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type FormStatus = "idle" | "loading" | "success" | "error";

export default function LeadForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [privacy, setPrivacy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/leads/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          city,
          province,
          source: "landing_page",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || "Si è verificato un errore. Riprova più tardi."
        );
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Si è verificato un errore. Riprova più tardi."
      );
    }
  }

  /* ---- Success state ---- */
  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#C9A84C]/20 bg-[#C9A84C]/[0.04] p-8 text-center md:p-12">
        {/* Animated check circle */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C]/20 to-[#D4B65E]/10 ring-4 ring-[#C9A84C]/10">
          <svg
            className="h-10 w-10 text-[#C9A84C]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h3 className="font-heading text-2xl font-normal tracking-[-0.02em] text-[#0B1D3A] md:text-3xl">
          Richiesta inviata!
        </h3>

        {/* Mini timeline */}
        <div className="mt-8 text-left max-w-sm mx-auto space-y-4">
          <p className="text-sm font-medium text-[#0B1D3A]/70 mb-3">Ecco cosa succede ora:</p>
          {[
            { step: "1", text: "Riceviamo la tua richiesta", done: true },
            { step: "2", text: "Ti guidiamo nella registrazione del tuo immobile", done: false },
            { step: "3", text: "Scegli l'agenzia della tua zona dalla dashboard", done: false },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                item.done
                  ? "bg-[#C9A84C] text-white"
                  : "border-2 border-[#C9A84C]/20 text-[#C9A84C]/50"
              }`}>
                {item.done ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  item.step
                )}
              </div>
              <p className={`text-sm ${item.done ? "text-[#0B1D3A] font-medium" : "text-[#0B1D3A]/50"}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary CTA */}
        <div className="mt-8 pt-6 border-t border-[#C9A84C]/10">
          <a
            href="#risparmio"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#C9A84C] hover:text-[#B8943B] transition-colors"
          >
            Nel frattempo, scopri quanto risparmi
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  /* ---- Form ---- */
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-[#C9A84C]/[0.08] bg-white p-6 shadow-sm md:p-10"
    >
      {/* Error banner */}
      {status === "error" && errorMessage && (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Row: Nome + Email */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Nome e cognome"
          name="name"
          type="text"
          placeholder="Mario Rossi"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="mario@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-[#0B1D3A]/30 flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Non condividiamo la tua email con terzi
          </p>
        </div>
      </div>

      {/* Row: Telefono + Città */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Input
            label="Telefono"
            name="phone"
            type="tel"
            placeholder="+39 333 1234567"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-[#0B1D3A]/30">
            Ti contatteremo solo per la tua richiesta
          </p>
        </div>
        <Input
          label="Città dell'immobile"
          name="city"
          type="text"
          placeholder="Milano"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {/* Provincia */}
      <Select
        label="Provincia"
        name="province"
        placeholder="Seleziona provincia"
        options={provinceOptions}
        required
        value={province}
        onChange={(e) => setProvince(e.target.value)}
      />

      {/* Privacy */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          required
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-[#0B1D3A]/20 text-[#C9A84C] accent-[#C9A84C] focus:ring-[#C9A84C]/40"
        />
        <span className="text-sm text-[#0B1D3A]/50 leading-relaxed">
          Acconsento al trattamento dei miei dati personali ai sensi della{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-[#C9A84C] underline hover:text-[#B8943B]"
            target="_blank"
          >
            Privacy Policy
          </Link>
          . *
        </span>
      </label>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={status === "loading"}
        disabled={!privacy}
      >
        Invia la tua richiesta
      </Button>

      {/* Trust micro-copy */}
      <p className="text-center text-xs text-[#0B1D3A]/30 flex items-center justify-center gap-1.5">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        Nessun costo, nessun impegno. Dati crittografati e protetti.
      </p>
    </form>
  );
}
