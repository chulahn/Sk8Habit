import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user?.email) return NextResponse.json([], { status: 401 });

  const userId = Number((session.user as any).id);
  const days = await prisma.day.findMany({ where: { userId }, include: { habits: true } });
  return NextResponse.json(days);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const body = await req.json();
  const incoming: any[] = Array.isArray(body) ? body : [body];

  // Upsert each day and replace habits
  const tx: any[] = [];
  for (const d of incoming) {
    const dayId = d.id;
    // upsert day
    tx.push(prisma.day.upsert({ where: { id: dayId }, update: { userId }, create: { id: dayId, userId } }));
    // delete existing habits for day
    tx.push(prisma.habit.deleteMany({ where: { dayId } }));
    // create new habits
    if (Array.isArray(d.habits) && d.habits.length > 0) {
      const toCreate = d.habits.map((h: any) => ({ id: Number(h.id) || 0, dayId, name: h.name || "", timeLabel: h.timeLabel || "00:00", timeMins: Number(h.timeMins) || 0, y: Number(h.y) || 50, completed: Boolean(h.completed) }));
      tx.push(prisma.habit.createMany({ data: toCreate, skipDuplicates: true }));
    }
  }

  await prisma.$transaction(tx);
  return NextResponse.json({ ok: true });
}
