import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type AdminSession = {
  userId: string;
  email: string;
  name: string | null;
};

export class AdminAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Server-side guard. Throws AdminAuthError(401|403) if not admin.
 * Use inside route handlers and server components.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new AdminAuthError(401, "Non autenticato");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") throw new AdminAuthError(403, "Accesso negato");
  return {
    userId: (session.user as { id: string }).id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
  };
}

/**
 * Wrap a route handler with admin auth. Returns 401/403 JSON on failure.
 */
export function withAdmin<T extends unknown[]>(
  handler: (admin: AdminSession, ...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      const admin = await requireAdmin();
      return await handler(admin, ...args);
    } catch (err) {
      if (err instanceof AdminAuthError) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: err.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      console.error("[admin] handler error", err);
      return new Response(JSON.stringify({ error: "Errore interno" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
