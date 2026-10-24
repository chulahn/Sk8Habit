import { Prisma, PrismaClient } from "@prisma/client";
import {
  Prisma as LocalPrisma,
  PrismaClient as LocalPrismaClient,
} from "@/prisma/generated/local";

declare global {
  var prisma: PrismaClient | undefined;
  var localAuthPrisma: LocalPrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

const localAuthPrisma =
  global.localAuthPrisma ?? new LocalPrismaClient();
if (process.env.NODE_ENV !== "production") {
  global.localAuthPrisma = localAuthPrisma;
}

export type AuthDatabase = "primary" | "local";

export async function getAuthDatabase(): Promise<AuthDatabase> {
  if (process.env.NODE_ENV === "production") return "primary";

  try {
    await prisma.$connect();
    return "primary";
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    console.warn(
      "Primary database is unavailable; using the local authentication database.",
      error,
    );
    await localAuthPrisma.$connect();
    return "local";
  }
}

export async function getSessionDatabase(
  database: AuthDatabase,
): Promise<AuthDatabase> {
  if (database === "local") {
    await localAuthPrisma.$connect();
  } else {
    await prisma.$connect();
  }
  return database;
}

export function findAuthUser(database: AuthDatabase, email: string) {
  if (database === "local") {
    return localAuthPrisma.user.findUnique({ where: { email } });
  }
  return prisma.user.findUnique({ where: { email } });
}

export function createAuthUser(
  database: AuthDatabase,
  data: { name: string | null; email: string; password: string },
) {
  if (database === "local") {
    return localAuthPrisma.user.create({ data });
  }
  return prisma.user.create({ data });
}

export function recordFailedLoginAttempt(
  database: AuthDatabase,
  data: { email: string; userId: number },
) {
  if (database === "local") {
    return localAuthPrisma.failedLoginAttempt.create({ data });
  }
  return prisma.failedLoginAttempt.create({ data });
}

export function recordLogin(database: AuthDatabase, userId: number) {
  if (database === "local") {
    return localAuthPrisma.loginHistory.create({ data: { userId } });
  }
  return prisma.loginHistory.create({ data: { userId } });
}

export function findUserDays(database: AuthDatabase, userId: number) {
  if (database === "local") {
    return localAuthPrisma.day.findMany({
      where: { userId },
      include: { habits: true },
    });
  }
  return prisma.day.findMany({ where: { userId }, include: { habits: true } });
}

type DaySaveInput = {
  id?: string;
  habits?: {
    id?: number | string;
    name?: string;
    timeLabel?: string;
    timeMins?: number;
    y?: number;
    completed?: boolean;
  }[];
};

export async function saveUserDays(
  database: AuthDatabase,
  userId: number,
  incoming: DaySaveInput[],
) {
  if (database === "local") {
    const tx: LocalPrisma.PrismaPromise<unknown>[] = [];
    for (const day of incoming) {
      if (!day.id) continue;
      const dayId = day.id;
      tx.push(
        localAuthPrisma.day.upsert({
          where: { id: dayId },
          update: { userId },
          create: { id: dayId, userId },
        }),
        localAuthPrisma.habit.deleteMany({ where: { dayId } }),
      );
      if (Array.isArray(day.habits) && day.habits.length > 0) {
        const habitIds = new Set<number>();
        for (const habit of day.habits) {
          const id = Number(habit.id) || 0;
          if (habitIds.has(id)) continue;
          habitIds.add(id);
          tx.push(
            localAuthPrisma.habit.create({
              data: {
                id,
                dayId,
                name: habit.name || "",
                timeLabel: habit.timeLabel || "00:00",
                timeMins: Number(habit.timeMins) || 0,
                y: Number(habit.y) || 50,
                completed: Boolean(habit.completed),
              },
            }),
          );
        }
      }
    }
    await localAuthPrisma.$transaction(tx);
    return;
  }

  const tx: Prisma.PrismaPromise<unknown>[] = [];
  for (const day of incoming) {
    if (!day.id) continue;
    const dayId = day.id;
    tx.push(
      prisma.day.upsert({
        where: { id: dayId },
        update: { userId },
        create: { id: dayId, userId },
      }),
      prisma.habit.deleteMany({ where: { dayId } }),
    );
    if (Array.isArray(day.habits) && day.habits.length > 0) {
      const habits = day.habits.map((habit) => ({
        id: Number(habit.id) || 0,
        dayId,
        name: habit.name || "",
        timeLabel: habit.timeLabel || "00:00",
        timeMins: Number(habit.timeMins) || 0,
        y: Number(habit.y) || 50,
        completed: Boolean(habit.completed),
      }));
      tx.push(
        prisma.habit.createMany({
          data: habits,
          skipDuplicates: true,
        }),
      );
    }
  }
  await prisma.$transaction(tx);
}

function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  if (
    "errorCode" in error &&
    ["P1001", "P1002", "P1017", "P2024"].includes(String(error.errorCode))
  ) {
    return true;
  }

  return (
    error instanceof Error &&
    error.name === "PrismaClientInitializationError" &&
    /Can't reach database server|Timed out fetching a new connection|server has closed the connection/i.test(
      error.message,
    )
  );
}

export default prisma;
