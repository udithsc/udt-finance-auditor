"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { getAppSettings } from "@/lib/app-settings";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function addDebt(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const totalAmount = Math.round(parseFloat(formData.get("totalAmount") as string) * 100) / 100;
  const remaining = Math.round(parseFloat(formData.get("remaining") as string) * 100) / 100;
  const monthly = formData.get("monthly") ? Math.round(parseFloat(formData.get("monthly") as string) * 100) / 100 : null;
  const currency = (formData.get("currency") as string | null)?.toUpperCase();
  const notes = formData.get("notes") as string;

  const user = await getCurrentUser();
  const settings = await getAppSettings();

  try {
    await prisma.debt.create({
      data: {
        userId: user.id,
        name,
        type,
        totalAmount,
        remaining,
        monthly,
        currency: currency || settings.baseCurrency,
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
  } catch (error) {
    console.error("Delete debt error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateDebt(id: string, data: Prisma.DebtUpdateInput) {
  try {
    await prisma.debt.update({ where: { id }, data });
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update debt error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
