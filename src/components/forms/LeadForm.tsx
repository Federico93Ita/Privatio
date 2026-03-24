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

const propertyTypeOptions: SelectOption[] = [
  { value: "APPARTAMENTO", label: "Appartamento" },
  { value: "VILLA", label: "Villa" },
  { value: "CASA_INDIPENDENTE", label: "Casa Indipendente" },
  { value: "ATTICO", label: "Attico" },
  { value: "MANSARDA", label: "Mansarda" },
  { value: "LOFT", label: "Loft" },
  { value: "TERRENO", label: "Terreno" },
  { value: "NEGOZIO", label: "Negozio" },
  { value: "UFFICIO", label: "Ufficio" },
];

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
  const [propertyType, setPropertyType] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
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
          propertyType: propertyType || undefined,
          estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
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
      <div className="mx-auto max-w-2xl rounded-2xl border border-success/30 bg-success/5 p-8 text-center md:p-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-light text-2xl tracking-[-0.03em] text-text md:text-3xl">
          Richiesta inviata!
        </h3>
        <p className="mt-3 text-text-muted">
          Grazie per averci contattato. Ti ricontatteremo entro 24 ore per
          metterti in contatto con un&apos;agenzia partner nella tua zona.
        </p>
      </div>
    );
  }

  /* ---- Form ---- */
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-10"
    >
      {/* Error banner */}
      {status === "error" && errorMessage && (
        <div
          className="flex items-start gap-3 rounded-lg border border-error/30 bg-error/5 p-4"
          role="alert"
        >
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-error"
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
          <p className="text-sm text-error">{errorMessage}</p>
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
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="mario@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Row: Telefono + Città */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Telefono"
          name="phone"
          type="tel"
          placeholder="+39 333 1234567"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
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

      {/* Row: Provincia + Tipo */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select
          label="Provincia"
          name="province"
          placeholder="Seleziona provincia"
          options={provinceOptions}
          required
          value={province}
          onChange={(e) => setProvince(e.target.value)}
        />
        <Select
          label="Tipo di immobile"
          name="propertyType"
          placeholder="Seleziona tipo"
          options={propertyTypeOptions}
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        />
      </div>

      {/* Valore stimato */}
      <Input
        label="Valore stimato dell'immobile"
        name="estimatedValue"
        type="number"
        placeholder="250000"
        min={0}
        step={1000}
        helperText="Inserisci una stima approssimativa in euro"
        value={estimatedValue}
        onChange={(e) => setEstimatedValue(e.target.value)}
      />

      {/* Privacy */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          required
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-border text-primary accent-primary focus:ring-primary/40"
        />
        <span className="text-sm text-text-muted leading-relaxed">
          Acconsento al trattamento dei miei dati personali ai sensi della{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-primary underline hover:text-primary-dark"
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

      <p className="text-center text-xs text-text-muted">
        Nessun costo, nessun impegno. Ti ricontattiamo entro 24 ore.
      </p>
    </form>
  );
}
