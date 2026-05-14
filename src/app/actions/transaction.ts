"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { getAppSettings } from "@/lib/app-settings";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function deleteTransaction(id: string) {
  try {
    await prisma.transaction.delete({
      where: { id },
    });
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateTransaction(id: string, data: { date?: string; description?: string; amount?: number; category?: string | null; currency?: string; type?: string }) {
  try {
    const updateData: Prisma.TransactionUpdateInput = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = Math.round(Number(data.amount) * 100) / 100;
    }
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/transactions");
    return { success: true, transaction: updated };
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createTransaction(data: { date: string; description: string; amount: number; category?: string | null; currency?: string; type?: string; documentId?: string | null }) {
  try {
    const user = await getCurrentUser();
    const settings = await getAppSettings();
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date(data.date),
        description: data.description,
        amount: Math.round(Number(data.amount) * 100) / 100,
        type: data.type || "DEBIT",
        currency: data.currency || settings.baseCurrency,
        baseCurrency: settings.baseCurrency,
        category: data.category || "Uncategorized",
        status: "verified", // manual is always verified
        documentId: data.documentId || null,
        isInternal: false,
      },
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true, transaction };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
