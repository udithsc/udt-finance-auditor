"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addAsset(formData: FormData) {
  console.log("Adding asset...");
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const value = Math.round(parseFloat(formData.get("value") as string) * 100) / 100;
  const quantity = formData.get("quantity") ? parseFloat(formData.get("quantity") as string) : null;
  const purchasedAtStr = formData.get("purchasedAt") as string;
  const purchasedValue = formData.get("purchasedValue") ? Math.round(parseFloat(formData.get("purchasedValue") as string) * 100) / 100 : null;
  const notes = formData.get("notes") as string;

  const user = await prisma.user.findFirst();
  if (!user) return { error: "No user found" };

  try {
    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        name,
        type,
        value,
        quantity,
        purchasedValue,
        purchasedAt: purchasedAtStr ? new Date(purchasedAtStr) : null,
        notes,
      },
    });
    console.log("Asset created:", asset.id);
    revalidatePath("/assets");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Add asset error:", error);
    return { error: "Failed to add asset" };
  }
}

export async function updateAsset(id: string, formData: FormData) {
  console.log("Updating asset:", id);
  const name = formData.get("name") as string;
  const value = Math.round(parseFloat(formData.get("value") as string) * 100) / 100;
  const quantity = formData.get("quantity") ? parseFloat(formData.get("quantity") as string) : null;
  const purchasedAtStr = formData.get("purchasedAt") as string;
  const purchasedValue = formData.get("purchasedValue") ? Math.round(parseFloat(formData.get("purchasedValue") as string) * 100) / 100 : null;
  const notes = formData.get("notes") as string;

  try {
    await prisma.asset.update({
      where: { id },
      data: {
        name,
        value,
        quantity,
        purchasedValue,
        purchasedAt: purchasedAtStr ? new Date(purchasedAtStr) : null,
        notes,
      },
    });
    console.log("Asset updated successfully");
    revalidatePath("/assets");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update asset error:", error);
    return { error: "Failed to update asset" };
  }
}

export async function deleteAsset(id: string) {
  console.log("Deleting asset:", id);
  try {
    await prisma.asset.delete({ where: { id } });
    console.log("Asset deleted successfully");
    revalidatePath("/assets");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete asset error:", error);
    return { error: "Failed to delete asset" };
  }
}
