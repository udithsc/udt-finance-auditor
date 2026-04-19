"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addDebt(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const totalAmount = Math.round(parseFloat(formData.get("totalAmount") as string) * 100) / 100;
  const remaining = Math.round(parseFloat(formData.get("remaining") as string) * 100) / 100;
  const monthly = formData.get("monthly") ? Math.round(parseFloat(formData.get("monthly") as string) * 100) / 100 : null;
  const notes = formData.get("notes") as string;

  const user = await prisma.user.findFirst();
  if (!user) return { error: "No user found" };

  try {
    await prisma.debt.create({
      data: {
        userId: user.id,
        name,
        type,
        totalAmount,
        remaining,
        monthly,
        notes,
      },
    });
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Add debt error:", error);
    return { error: "Failed to add debt" };
  }
}

export async function deleteDebt(id: string) {
  try {
    await prisma.debt.delete({ where: { id } });
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Delete debt error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDebt(id: string, data: any) {
  try {
    await prisma.debt.update({ where: { id }, data });
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Update debt error:", error);
    return { success: false, error: error.message };
  }
}
