import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for unsubscribe token generation");
  }
  return secret;
}

/**
 * Genera un token HMAC per unsubscribe sicuro (non indovinabile).
 * Usato nelle email marketing per creare link /api/unsubscribe?email=...&token=...
 */
export function generateUnsubscribeToken(email: string): string {
  return crypto.createHmac("sha256", getSecret()).update(email).digest("hex");
}

/**
 * GET /api/unsubscribe?email=...&token=...
 *
 * Disattiva il consenso marketing per l'utente.
 * Il token è un HMAC dell'email, non servono credenziali.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token) {
    return new NextResponse(errorPage("Parametri mancanti."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Verify HMAC token
  const expected = generateUnsubscribeToken(email);
  if (token !== expected) {
    return new NextResponse(errorPage("Link non valido."), {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Update user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return new NextResponse(errorPage("Utente non trovato."), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  await prisma.user.update({
    where: { email },
    data: { marketingConsent: false },
  });

  // Also disable all email alerts on saved searches
  await prisma.savedSearch.updateMany({
    where: { userId: user.id },
    data: { emailAlerts: false },
  });

  return new NextResponse(successPage(), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function successPage(): string {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Disiscrizione completata — Privatio</title>
<style>body{font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;}
.card{background:white;border-radius:16px;padding:48px;max-width:480px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.1);}
h1{color:#0f172a;font-size:24px;margin:0 0 12px;}p{color:#64748b;line-height:1.6;margin:0 0 24px;}
a{color:#2563eb;text-decoration:none;font-weight:500;}</style></head>
<body><div class="card">
<h1>Disiscrizione completata</h1>
<p>Non riceverai pi&ugrave; email promozionali o notifiche sulle ricerche salvate da Privatio.</p>
<p>Puoi riattivare le notifiche in qualsiasi momento dalla tua <a href="https://privatio.it/dashboard">dashboard</a>.</p>
</div></body></html>`;
}

function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Errore — Privatio</title>
<style>body{font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;}
.card{background:white;border-radius:16px;padding:48px;max-width:480px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.1);}
h1{color:#0f172a;font-size:24px;margin:0 0 12px;}p{color:#64748b;line-height:1.6;}</style></head>
<body><div class="card">
<h1>Errore</h1>
<p>${message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")}</p>
</div></body></html>`;
}
