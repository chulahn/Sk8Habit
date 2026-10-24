import { NextResponse } from "next/server";
import {
  createAuthUser,
  findAuthUser,
  getAuthDatabase,
} from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;
    if (!email || !password) return NextResponse.json({ error: "Missing" }, { status: 400 });

    const authDatabase = await getAuthDatabase();
    const existing = await findAuthUser(authDatabase, email);
    if (existing) return NextResponse.json({ error: "Email exists" }, { status: 409 });

    const passwordHash = await hash(password, 10);
    const user = await createAuthUser(authDatabase, {
      name: name || null,
      email,
      password: passwordHash,
    });
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
