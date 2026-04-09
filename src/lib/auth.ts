import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendEmail, welcomeEmail } from "./email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e password richiesti");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Credenziali non valide");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Credenziali non valide");
        }

        if (user.status && user.status !== "ACTIVE") {
          throw new Error(
            user.status === "BANNED"
              ? "Account bloccato. Contatta il supporto."
              : "Account sospeso. Contatta il supporto."
          );
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || "SELLER";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string;
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Send welcome email when a new user is created (Google OAuth)
      if (user.email && user.name) {
        try {
          const emailContent = welcomeEmail(user.name);
          await sendEmail({ to: user.email, ...emailContent });
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }

        // Notify admin of new Google OAuth registration
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.vercel.app";
          try {
            await sendEmail({
              to: adminEmail,
              subject: `Nuova registrazione Google: ${user.name}`,
              html: `
                <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: #0f172a; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Nuova Registrazione (Google)</h1>
                  </div>
                  <div style="padding: 30px; background: white;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr><td style="padding: 8px 0; color: #6b7280;">Nome</td><td style="padding: 8px 0; font-weight: 600;">${user.name}</td></tr>
                      <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; font-weight: 600;">${user.email}</td></tr>
                      <tr><td style="padding: 8px 0; color: #6b7280;">Provider</td><td style="padding: 8px 0; font-weight: 600;">Google OAuth</td></tr>
                      <tr><td style="padding: 8px 0; color: #6b7280;">Data</td><td style="padding: 8px 0; font-weight: 600;">${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}</td></tr>
                    </table>
                    <a href="${appUrl}/admin" style="display: inline-block; margin-top: 20px; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">Pannello Admin</a>
                  </div>
                </div>
              `,
            });
          } catch (err) {
            console.error("Failed to send admin notification for Google signup:", err);
          }
        }
      }
    },
  },
  pages: {
    signIn: "/accedi",
    error: "/accedi",
  },
};
