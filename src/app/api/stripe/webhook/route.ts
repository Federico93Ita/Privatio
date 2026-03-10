import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const agency = await prisma.agency.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (agency) {
        await prisma.agency.update({
          where: { id: agency.id },
          data: {
            isActive: subscription.status === "active",
            stripeSubId: subscription.id,
          },
        });

        if (subscription.status === "active") {
          await sendEmail({
            to: agency.email,
            subject: "Abbonamento attivato — Privatio",
            html: `
              <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Privatio</h1>
                </div>
                <div style="padding: 30px;">
                  <h2 style="color: #10b981;">Abbonamento attivato!</h2>
                  <p>Il tuo abbonamento è ora attivo. Puoi iniziare a ricevere immobili nella tua zona.</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia"
                     style="display: inline-block; background: #0e8ff1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">
                    Vai alla Dashboard
                  </a>
                </div>
              </div>
            `,
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const agency = await prisma.agency.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (agency) {
        await prisma.agency.update({
          where: { id: agency.id },
          data: { isActive: false, stripeSubId: null },
        });

        await sendEmail({
          to: agency.email,
          subject: "Abbonamento disattivato — Privatio",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Abbonamento disattivato</h2>
              <p>Il tuo abbonamento Privatio è stato disattivato. Non riceverai nuovi immobili.</p>
              <p>Puoi riattivare il tuo piano in qualsiasi momento dalla dashboard.</p>
            </div>
          `,
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const agency = await prisma.agency.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (agency) {
        await sendEmail({
          to: agency.email,
          subject: "Pagamento fallito — Privatio",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Pagamento non riuscito</h2>
              <p>Il pagamento del tuo abbonamento Privatio non è andato a buon fine.</p>
              <p>Aggiorna il tuo metodo di pagamento per continuare a utilizzare la piattaforma.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia/fatturazione">
                Aggiorna pagamento
              </a>
            </div>
          `,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
