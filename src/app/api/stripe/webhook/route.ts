import { NextRequest, NextResponse } from "next/server";
import { stripe, highestPlan } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  switch (event.type) {
    /* -------------------------------------------------------------- */
    /*  Checkout completato — primo territorio acquistato               */
    /* -------------------------------------------------------------- */
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const plan = session.metadata?.plan as PlanKey | undefined;
      const zoneId = session.metadata?.zoneId;
      const monthlyPrice = parseInt(session.metadata?.monthlyPrice || "0", 10);
      const agencyId = session.metadata?.agencyId;
      const subscriptionId = session.subscription as string;

      if (customerId && plan && zoneId && agencyId && subscriptionId) {
        // Recupera subscription per ottenere lo subscription item ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const itemId = subscription.items.data[0]?.id;

        // Crea o riattiva TerritoryAssignment
        await prisma.territoryAssignment.upsert({
          where: { agencyId_zoneId: { agencyId, zoneId } },
          update: {
            plan,
            monthlyPrice,
            isActive: true,
            stripeItemId: itemId || null,
          },
          create: {
            agencyId,
            zoneId,
            plan,
            monthlyPrice,
            isActive: true,
            stripeItemId: itemId || null,
          },
        });

        // Aggiorna piano agenzia al piano massimo attivo
        const allTerritories = await prisma.territoryAssignment.findMany({
          where: { agencyId, isActive: true },
          select: { plan: true },
        });
        const topPlan = highestPlan(allTerritories.map((t) => t.plan as PlanKey));

        await prisma.agency.update({
          where: { id: agencyId },
          data: {
            plan: topPlan,
            isActive: true,
            stripeSubId: subscriptionId,
          },
        });
      }
      break;
    }

    /* -------------------------------------------------------------- */
    /*  Subscription creata/aggiornata                                  */
    /* -------------------------------------------------------------- */
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const agency = await prisma.agency.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (agency) {
        const isActive = subscription.status === "active";

        await prisma.agency.update({
          where: { id: agency.id },
          data: {
            isActive,
            stripeSubId: subscription.id,
          },
        });

        // Sincronizza territori con stato subscription
        if (!isActive) {
          await prisma.territoryAssignment.updateMany({
            where: { agencyId: agency.id },
            data: { isActive: false },
          });
        }

        if (isActive && event.type === "customer.subscription.created") {
          await sendEmail({
            to: agency.email,
            subject: "Territorio attivato — Privatio",
            html: `
              <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Privatio</h1>
                </div>
                <div style="padding: 30px; background: white;">
                  <h2 style="color: #059669;">Territorio attivato!</h2>
                  <p style="color: #6b7280; line-height: 1.6;">Il tuo territorio è ora attivo. Puoi iniziare a ricevere immobili nella tua zona.</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia/territori"
                     style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 16px;">
                    Vedi i tuoi territori
                  </a>
                </div>
              </div>
            `,
          });
        }
      }
      break;
    }

    /* -------------------------------------------------------------- */
    /*  Subscription cancellata                                        */
    /* -------------------------------------------------------------- */
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const agency = await prisma.agency.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (agency) {
        // Disattiva tutti i territori
        await prisma.territoryAssignment.updateMany({
          where: { agencyId: agency.id },
          data: { isActive: false },
        });

        await prisma.agency.update({
          where: { id: agency.id },
          data: { isActive: false, stripeSubId: null },
        });

        await sendEmail({
          to: agency.email,
          subject: "Abbonamento disattivato — Privatio",
          html: `
            <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Privatio</h1>
              </div>
              <div style="padding: 30px; background: white;">
                <h2 style="color: #0f172a;">Abbonamento disattivato</h2>
                <p style="color: #6b7280; line-height: 1.6;">Il tuo abbonamento Privatio è stato disattivato. I tuoi territori non sono più attivi.</p>
                <p style="color: #6b7280; line-height: 1.6;">Puoi riattivare i tuoi territori in qualsiasi momento dalla dashboard.</p>
              </div>
            </div>
          `,
        });
      }
      break;
    }

    /* -------------------------------------------------------------- */
    /*  Pagamento fallito                                               */
    /* -------------------------------------------------------------- */
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
            <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Privatio</h1>
              </div>
              <div style="padding: 30px; background: white;">
                <h2 style="color: #dc2626;">Pagamento non riuscito</h2>
                <p style="color: #6b7280; line-height: 1.6;">Il pagamento del tuo abbonamento Privatio non è andato a buon fine.</p>
                <p style="color: #6b7280; line-height: 1.6;">Aggiorna il tuo metodo di pagamento per continuare a utilizzare la piattaforma.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia/fatturazione"
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 16px;">
                  Aggiorna pagamento
                </a>
              </div>
            </div>
          `,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
