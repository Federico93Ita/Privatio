import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const deleteSchema = z.object({
  password: z.string().min(1, "Password richiesta"),
  confirmation: z.literal("ELIMINA IL MIO ACCOUNT"),
});

/**
 * DELETE /api/user/delete — Permanently delete user account (GDPR Art. 17)
 * Requires password confirmation and explicit text confirmation.
 */
export async function DELETE(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.auth, req);
    if (limited) return limited;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi. Inserisci la password e la conferma." },
        { status: 400 }
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, role: true },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    const passwordValid = await bcrypt.compare(parsed.data.password, user.password);
    if (!passwordValid) {
      return NextResponse.json({ error: "Password non corretta" }, { status: 403 });
    }

    // Prevent admin self-deletion
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Gli account admin non possono essere eliminati tramite questa API" },
        { status: 400 }
      );
    }

    // Delete all user-related data in order (cascade manually for safety)
    await prisma.$transaction(async (tx) => {
      // Delete messages
      await tx.message.deleteMany({ where: { senderId: user.id } });
      await tx.message.deleteMany({ where: { receiverId: user.id } });

      // Delete documents uploaded by user
      await tx.document.deleteMany({ where: { uploaderId: user.id } });

      // Delete favorites
      await tx.favorite.deleteMany({ where: { userId: user.id } });

      // Delete saved searches
      await tx.savedSearch.deleteMany({ where: { userId: user.id } });

      // Delete reviews
      await tx.review.deleteMany({ where: { userId: user.id } });

      // Delete notifications
      await tx.notification.deleteMany({ where: { userId: user.id } });

      // Delete verification tokens
      await tx.verificationToken.deleteMany({
        where: { identifier: { startsWith: `email-verify:` } },
      });

      // Delete sessions
      await tx.session.deleteMany({ where: { userId: user.id } });

      // Delete accounts (OAuth)
      await tx.account.deleteMany({ where: { userId: user.id } });

      // Finally delete the user (this will cascade to properties via Prisma relations)
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({
      message: "Account eliminato con successo. Tutti i dati personali sono stati rimossi.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione dell'account" },
      { status: 500 }
    );
  }
}
