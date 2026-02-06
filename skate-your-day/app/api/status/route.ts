import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? null;
  let dbType = "unknown";
  if (!dbUrl) dbType = "local_sqlite";
  else if (dbUrl.startsWith("file:") || dbUrl.includes("dev.db")) dbType = "local_sqlite";
  else if (dbUrl.startsWith("postgres") || dbUrl.includes("postgres")) dbType = "postgres";
  else if (dbUrl.startsWith("mysql") || dbUrl.includes("mysql")) dbType = "mysql";
  else dbType = "remote_other";

  const nextAuthSecretSet = Boolean(process.env.NEXTAUTH_SECRET);

  // Determine providers
  const providers = (authOptions?.providers || []).map((p: any) => p.name || p.id || "unknown");

  return NextResponse.json({ db: { url: dbUrl, type: dbType }, nextAuth: { secretSet: nextAuthSecretSet, providers } });
}
