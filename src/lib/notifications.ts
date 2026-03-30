import { prisma } from "./prisma";
import type { NotificationType } from "@prisma/client";

/**
 * Creates an in-app notification for a user.
 * Safe to call from any API route or webhook handler.
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  href,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  try {
    return await prisma.notification.create({
      data: { userId, type, title, body, href },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Notify all agents of an agency about an event.
 */
export async function notifyAgency({
  agencyId,
  type,
  title,
  body,
  href,
}: {
  agencyId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  try {
    const agents = await prisma.user.findMany({
      where: { agencyId },
      select: { id: true },
    });
    if (agents.length === 0) return;

    await prisma.notification.createMany({
      data: agents.map((a) => ({
        userId: a.id,
        type,
        title,
        body,
        href,
      })),
    });
  } catch (error) {
    console.error("Failed to notify agency:", error);
  }
}
