"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Province italiane                                                   */
/* ------------------------------------------------------------------ */

const provinceOptions: SelectOption[] = [
  { value: "AG", label: "Agrigento" },
  { value: "AL", label: "Alessandria" },
  { value: "AN", label: "Ancona" },
  { value: "AO", label: "Aosta" },
  { value: "AR", label: "Arezzo" },
  { value: "AP", label: "Ascoli Piceno" },
  { value: "AT", label: "Asti" },
  { value: "AV", label: "Avellino" },
  { value: "BA", label: "Bari" },
  { value: "BT", label: "Barletta-Andria-Trani" },
  { value: "BL", label: "Belluno" },
  { value: "BN", label: "Benevento" },
  { value: "BG", label: "Bergamo" },
  { value: "BI", label: "Biella" },
  { value: "BO", label: "Bologna" },
  { value: "BZ", label: "Bolzano" },
  { value: "BS", label: "Brescia" },
  { value: "BR", label: "Brindisi" },
  { value: "CA", label: "Cagliari" },
  { value: "CL", label: "Caltanissetta" },
  { value: "CB", label: "Campobasso" },
  { value: "CE", label: "Caserta" },
  { value: "CT", label: "Catania" },
  { value: "CZ", label: "Catanzaro" },
  { value: "CH", label: "Chieti" },
  { value: "CO", label: "Como" },
  { value: "CS", label: "Cosenza" },
  { value: "CR", label: "Cremona" },
  { value: "KR", label: "Crotone" },
  { value: "CN", label: "Cuneo" },
  { value: "EN", label: "Enna" },
  { value: "FM", label: "Fermo" },
  { value: "FE", label: "Ferrara" },
  { value: "FI", label: "Firenze" },
  { value: "FG", label: "Foggia" },
  { value: "FC", label: "Forli-Cesena" },
  { value: "FR", label: "Frosinone" },
  { value: "GE", label: "Genova" },
  { value: "GO", label: "Gorizia" },
  { value: "GR", label: "Grosseto" },
  { value: "IM", label: "Imperia" },
  { value: "IS", label: "Isernia" },
  { value: "AQ", label: "L'Aquila" },
  { value: "SP", label: "La Spezia" },
  { value: "LT", label: "Latina" },
  { value: "LE", label: "Lecce" },
  { value: "LC", label: "Lecco" },
  { value: "LI", label: "Livorno" },
  { value: "LO", label: "Lodi" },
  { value: "LU", label: "Lucca" },
  { value: "MC", label: "Macerata" },
  { value: "MN", label: "Mantova" },
  { value: "MS", label: "Massa-Carrara" },
  { value: "MT", label: "Matera" },
  { value: "ME", label: "Messina" },
  { value: "MI", label: "Milano" },
  { value: "MO", label: "Modena" },
  { value: "MB", label: "Monza e Brianza" },
  { value: "NA", label: "Napoli" },
  { value: "NO", label: "Novara" },
  { value: "NU", label: "Nuoro" },
  { value: "OR", label: "Oristano" },
  { value: "PD", label: "Padova" },
  { value: "PA", label: "Palermo" },
  { value: "PR", label: "Parma" },
  { value: "PV", label: "Pavia" },
  { value: "PG", label: "Perugia" },
  { value: "PU", label: "Pesaro e Urbino" },
  { value: "PE", label: "Pescara" },
  { value: "PC", label: "Piacenza" },
  { value: "PI", label: "Pisa" },
  { value: "PT", label: "Pistoia" },
  { value: "PN", label: "Pordenone" },
  { value: "PZ", label: "Potenza" },
  { value: "PO", label: "Prato" },
  { value: "RG", label: "Ragusa" },
  { value: "RA", label: "Ravenna" },
  { value: "RC", label: "Reggio Calabria" },
  { value: "RE", label: "Reggio Emilia" },
  { value: "RI", label: "Rieti" },
  { value: "RN", label: "Rimini" },
  { value: "RM", label: "Roma" },
  { value: "RO", label: "Rovigo" },
  { value: "SA", label: "Salerno" },
  { value: "SS", label: "Sassari" },
  { value: "SV", label: "Savona" },
  { value: "SI", label: "Siena" },
  { value: "SR", label: "Siracusa" },
  { value: "SO", label: "Sondrio" },
  { value: "SU", label: "Sud Sardegna" },
  { value: "TA", label: "Taranto" },
  { value: "TE", label: "Teramo" },
  { value: "TR", label: "Terni" },
  { value: "TO", label: "Torino" },
  { value: "TP", label: "Trapani" },
  { value: "TN", label: "Trento" },
  { value: "TV", label: "Treviso" },
  { value: "TS", label: "Trieste" },
  { value: "UD", label: "Udine" },
  { value: "VA", label: "Varese" },
  { value: "VE", label: "Venezia" },
  { value: "VB", label: "Verbano-Cusio-Ossola" },
  { value: "VC", label: "Vercelli" },
  { value: "VR", label: "Verona" },
  { value: "VV", label: "Vibo Valentia" },
  { value: "VI", label: "Vicenza" },
  { value: "VT", label: "Viterbo" },
];

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
          assegnarti un&apos;agenzia partner nella tua zona.
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
