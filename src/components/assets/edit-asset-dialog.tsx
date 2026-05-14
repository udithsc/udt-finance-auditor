"use client";

import { useState } from "react";
import { updateAsset } from "@/app/actions/assets";
import { Dialog } from "@/components/ui/dialog";
import { Edit2, Save } from "lucide-react";
import type { Asset } from "@prisma/client";

export function EditAssetButton({ asset, baseCurrency }: { asset: Asset; baseCurrency: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    console.log("Submitting edit form...");
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateAsset(asset.id, formData);
    setIsPending(false);
    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-primary/10 text-zinc-500 hover:text-primary transition-all"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Edit ${asset.name}`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset Name</label>
            <input required name="name" defaultValue={asset.name} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Current Value ({baseCurrency})</label>
              <input required name="value" type="number" defaultValue={asset.value} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quantity</label>
              <input name="quantity" type="number" defaultValue={asset.quantity || ""} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Purchase Price</label>
              <input name="purchasedValue" type="number" defaultValue={asset.purchasedValue || ""} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Purchase Date</label>
              <input name="purchasedAt" type="date" defaultValue={asset.purchasedAt ? new Date(asset.purchasedAt).toISOString().split('T')[0] : ""} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="mt-2 w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            {isPending ? "Saving..." : <><Save size={18} /> Update Asset</>}
          </button>
        </form>
      </Dialog>
    </>
  );
}
