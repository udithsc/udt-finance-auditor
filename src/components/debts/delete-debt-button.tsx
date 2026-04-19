"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteDebt } from "@/app/actions/debts";
import { useRouter } from "next/navigation";

export function DeleteDebtButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this liability? It cannot be undone.")) return;
    setIsDeleting(true);
    const res = await deleteDebt(id);
    if (!res.success) {
      alert("Failed to delete: " + res.error);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
