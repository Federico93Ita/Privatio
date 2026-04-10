import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

const sendMessageSchema = z.object({
  propertyId: z.string().min(1),
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

// GET /api/messages?propertyId=xxx — fetch conversation for a property
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      // Return all conversations grouped by property
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Group by propertyId and get latest message per conversation
      const conversations: Record<string, any> = {};
      for (const msg of messages) {
        if (!conversations[msg.propertyId]) {
          conversations[msg.propertyId] = {
            propertyId: msg.propertyId,
            lastMessage: msg,
            unreadCount: 0,
          };
        }
        if (!msg.read && msg.receiverId === session.user.id) {
          conversations[msg.propertyId].unreadCount++;
        }
      }

      // Get property titles for each conversation
      const propertyIds = Object.keys(conversations);
      if (propertyIds.length > 0) {
        const properties = await prisma.property.findMany({
          where: { id: { in: propertyIds } },
          select: { id: true, title: true, city: true },
        });
        for (const p of properties) {
          if (conversations[p.id]) {
            conversations[p.id].property = p;
          }
        }
      }

      return NextResponse.json({
        conversations: Object.values(conversations),
      });
    }

    // Verify user has access to this property's messages
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        sellerId: true,
        assignment: { select: { agency: { select: { agents: { select: { id: true } } } } } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    const isSeller = property.sellerId === session.user.id;
    const agentIds = property.assignment?.agency?.agents?.map((a: any) => a.id) || [];
    const isAgent = agentIds.includes(session.user.id);

    if (!isSeller && !isAgent) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { propertyId },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        propertyId,
        receiverId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Messages error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.message, req);
    if (limited) return limited;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const { propertyId, receiverId, content } = parsed.data;

    // Verify access
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        sellerId: true,
        assignment: { select: { agency: { select: { agents: { select: { id: true } } } } } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    const isSeller = property.sellerId === session.user.id;
    const agentIds = property.assignment?.agency?.agents?.map((a: any) => a.id) || [];
    const isAgent = agentIds.includes(session.user.id);

    if (!isSeller && !isAgent) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        propertyId,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
