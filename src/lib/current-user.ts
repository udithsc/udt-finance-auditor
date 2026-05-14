import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email;
  const defaultEmail = process.env.DEFAULT_USER_EMAIL;
  const email = sessionEmail || defaultEmail;

  if (email) {
    return prisma.user.upsert({
      where: { email },
      update: {
        name: session?.user?.name || process.env.DEFAULT_USER_NAME || undefined,
        image: session?.user?.image || undefined,
      },
      create: {
        email,
        name: session?.user?.name || process.env.DEFAULT_USER_NAME || "Local User",
        image: session?.user?.image || undefined,
      },
    });
  }

  const existingUser = await prisma.user.findFirst({
    orderBy: { id: "asc" },
  });

  if (existingUser) return existingUser;

  return prisma.user.create({
    data: {
      email: `local-${Date.now()}@auditor.local`,
      name: process.env.DEFAULT_USER_NAME || "Local User",
    },
  });
}
