import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body as { plan: "BASE" | "PRO" };

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Piano non valido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agency: true },
    });

    if (!user?.agency) {
      return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
    }

    let customerId = user.agency.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.agency.name,
        metadata: { agencyId: user.agency.id },
      });
      customerId = customer.id;

      await prisma.agency.update({
        where: { id: user.agency.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia?canceled=true`,
      metadata: {
        agencyId: user.agency.id,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del pagamento" },
      { status: 500 }
    );
  }
}
