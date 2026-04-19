"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTransaction(id: string) {
  try {
    await prisma.transaction.delete({
      where: { id },
    });
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTransaction(id: string, data: { date?: string; description?: string; amount?: number; category?: string | null; currency?: string; type?: string }) {
  try {
    const updateData: any = { ...data };
    if (updateData.amount !== undefined) {
      updateData.amount = Math.round(Number(updateData.amount) * 100) / 100;
    }
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/transactions");
    return { success: true, transaction: updated };
  } catch (error: any) {
    console.error("Failed to update transaction:", error);
    return { success: false, error: error.message };
  }
}

export async function createTransaction(data: { date: string; description: string; amount: number; category?: string | null; currency?: string; type?: string; documentId?: string | null }) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return { success: false, error: "No user found" };
    
    // Check if category is known or use standard fallback for manual txs
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date(data.date),
        description: data.description,
        amount: Math.round(Number(data.amount) * 100) / 100,
        type: data.type || "DEBIT",
        currency: data.currency || "MYR",
        category: data.category || "Uncategorized",
        status: "verified", // manual is always verified
        documentId: data.documentId || null,
        isInternal: false,
      },
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true, transaction };
  } catch (error: any) {
    console.error("Failed to create transaction:", error);
    return { success: false, error: error.message };
  }
}
