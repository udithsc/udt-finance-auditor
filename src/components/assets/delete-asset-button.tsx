"use client";

import { useState } from "react";
import { deleteAsset } from "@/app/actions/assets";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteAssetButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    console.log("Delete button clicked for ID:", id);
    if (!confirm("Are you sure you want to delete this asset?")) return;
    setIsPending(true);
    const result = await deleteAsset(id);
    setIsPending(false);
    if (!result.success) {
      alert("Failed to delete asset: " + result.error);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all disabled:opacity-50"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
