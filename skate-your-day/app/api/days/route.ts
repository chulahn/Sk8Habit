import { NextResponse } from "next/server";
import {
  findUserDays,
  getSessionDatabase,
  saveUserDays,
} from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import type { DayData, Habit } from "@/app/components/types";

type SessionUserWithId = {
  id?: string | number | null;
  email?: string | null;
};

type IncomingHabit = Partial<Habit>;
type IncomingDay = Partial<DayData> & {
  habits?: IncomingHabit[];
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return NextResponse.json([], { status: 401 });

  const userId = Number((session.user as SessionUserWithId).id);
  const database = await getSessionDatabase(session.authDatabase ?? "primary");
  const days = await findUserDays(database, userId);
  return NextResponse.json(days);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number((session.user as SessionUserWithId).id);
  const database = await getSessionDatabase(session.authDatabase ?? "primary");
  const body = (await req.json()) as IncomingDay | IncomingDay[];
  const incoming: IncomingDay[] = Array.isArray(body) ? body : [body];
  await saveUserDays(database, userId, incoming);
  return NextResponse.json({ ok: true });
}
