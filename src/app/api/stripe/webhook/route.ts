import { NextRequest, NextResponse } from "next/server";
import { stripe, highestPlan } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail, BILLING_FROM, territoryActivatedEmail, subscriptionCanceledEmail, paymentFailedEmail, subscriptionRenewedEmail } from "@/lib/email";
import { notifyAgency } from "@/lib/notifications";
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

  /* ------------------------------------------------------------------ */
  /*  Idempotency guard — una riga per eventId, unique constraint.       */
  /*  Se l'evento è già stato elaborato, rispondiamo 200 senza effetti.  */
  /* ------------------------------------------------------------------ */
  try {
    await prisma.stripeEventLog.create({
      data: { eventId: event.id, type: event.type },
    });
  } catch {
    // Unique violation → già visto, ignora.
    return NextResponse.json({ received: true, duplicate: true });
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

        // In-app notification
        const zone = await prisma.zone.findUnique({ where: { id: zoneId }, select: { name: true } });
        await notifyAgency({
          agencyId,
          type: "TERRITORY_ACTIVATED",
          title: "Territorio attivato",
          body: `Il territorio "${zone?.name || zoneId}" è ora attivo.`,
          href: "/dashboard/agenzia/territori",
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
        const isActive =
          subscription.status === "active" || subscription.status === "trialing";

        // Map Stripe status → BillingStatus
        const billingStatus =
          subscription.status === "active" || subscription.status === "trialing"
            ? "ACTIVE"
            : subscription.status === "past_due"
              ? "PAST_DUE"
              : subscription.status === "unpaid"
                ? "UNPAID"
                : subscription.status === "canceled" ||
                    subscription.status === "incomplete_expired"
                  ? "CANCELED"
                  : "ACTIVE";

        await prisma.agency.update({
          where: { id: agency.id },
          data: {
            isActive,
            stripeSubId: subscription.id,
            billingStatus,
          },
        });

        // Sincronizza territori con stato subscription
        if (!isActive) {
          await prisma.territoryAssignment.updateMany({
            where: { agencyId: agency.id },
            data: { isActive: false },
          });
        }

        // Notifica PAST_DUE all'agenzia
        if (billingStatus === "PAST_DUE") {
          await notifyAgency({
            agencyId: agency.id,
            type: "PAYMENT_FAILED",
            title: "Pagamento in sospeso",
            body: "Il tuo abbonamento è in stato past due. Aggiorna il metodo di pagamento per evitare la sospensione.",
            href: "/dashboard/agenzia/fatturazione",
          });
        }

        if (isActive && event.type === "customer.subscription.created") {
          const template = territoryActivatedEmail();
          await sendEmail({ to: agency.email, from: BILLING_FROM, ...template });
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
          data: {
            isActive: false,
            stripeSubId: null,
            billingStatus: "CANCELED",
          },
        });

        const cancelTemplate = subscriptionCanceledEmail();
        await sendEmail({ to: agency.email, from: BILLING_FROM, ...cancelTemplate });
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
        await prisma.agency.update({
          where: { id: agency.id },
          data: { billingStatus: "PAST_DUE" },
        });

        // In-app notification
        await notifyAgency({
          agencyId: agency.id,
          type: "PAYMENT_FAILED",
          title: "Pagamento non riuscito",
          body: "Il pagamento del tuo abbonamento non è andato a buon fine. Aggiorna il metodo di pagamento.",
          href: "/dashboard/agenzia/fatturazione",
        });

        const failedTemplate = paymentFailedEmail();
        await sendEmail({ to: agency.email, from: BILLING_FROM, ...failedTemplate });
      }
      break;
    }

    /* -------------------------------------------------------------- */
    /*  Pagamento riuscito — reset eventuale PAST_DUE                   */
    /* -------------------------------------------------------------- */
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      if (!customerId) break;

      const agency = await prisma.agency.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (agency && agency.billingStatus !== "ACTIVE") {
        await prisma.agency.update({
          where: { id: agency.id },
          data: { billingStatus: "ACTIVE", isActive: true },
        });

        // Send renewal confirmation email (only when recovering from non-ACTIVE)
        const renewedTemplate = subscriptionRenewedEmail();
        await sendEmail({ to: agency.email, from: BILLING_FROM, ...renewedTemplate });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
