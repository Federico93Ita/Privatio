import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import Stripe from "stripe";

/** Determine plan (BASE | PRO) from subscription price ID */
function planFromSubscription(subscription: Stripe.Subscription): "BASE" | "PRO" | null {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (!priceId) return null;
  if (priceId === PLANS.PRO.priceId) return "PRO";
  if (priceId === PLANS.BASE.priceId) return "BASE";
  return null;
}

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
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const plan = (session.metadata?.plan as "BASE" | "PRO") || null;

      if (customerId && plan) {
        const agency = await prisma.agency.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (agency) {
          await prisma.agency.update({
            where: { id: agency.id },
            data: { plan },
          });
        }
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const agency = await prisma.agency.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (agency) {
        const detectedPlan = planFromSubscription(subscription);

        await prisma.agency.update({
          where: { id: agency.id },
          data: {
            isActive: subscription.status === "active",
            stripeSubId: subscription.id,
            ...(detectedPlan ? { plan: detectedPlan } : {}),
          },
        });

        if (subscription.status === "active") {
          await sendEmail({
            to: agency.email,
            subject: "Abbonamento attivato — Privatio",
            html: `
              <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Privatio</h1>
                </div>
                <div style="padding: 30px; background: white;">
                  <h2 style="color: #059669;">Abbonamento attivato!</h2>
                  <p style="color: #6b7280; line-height: 1.6;">Il tuo abbonamento è ora attivo. Puoi iniziare a ricevere immobili nella tua zona.</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia"
                     style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 16px;">
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
            <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Privatio</h1>
              </div>
              <div style="padding: 30px; background: white;">
                <h2 style="color: #0f172a;">Abbonamento disattivato</h2>
                <p style="color: #6b7280; line-height: 1.6;">Il tuo abbonamento Privatio è stato disattivato. Non riceverai nuovi immobili.</p>
                <p style="color: #6b7280; line-height: 1.6;">Puoi riattivare il tuo piano in qualsiasi momento dalla dashboard.</p>
              </div>
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
