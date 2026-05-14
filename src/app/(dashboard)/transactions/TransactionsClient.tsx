"use client";

import { useState, useMemo, useRef } from "react";
import { 
  Filter, ArrowUpDown, Edit2, Trash2, Banknote, Plus,
  UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle, PieChart as PieChartIcon, Camera
} from "lucide-react";
import clsx from "clsx";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { updateTransaction, deleteTransaction, createTransaction } from "@/app/actions/transaction";

type Transaction = {
  id: string;
  date: string | Date;
  description: string;
  amount: number;
  currency: string;
  type: string;
  category: string | null;
  status: string;
};

type EditingTransaction = Omit<Transaction, "amount"> & {
  amount: number | "";
};

type NewTransactionForm = {
  date: string;
  description: string;
  amount: string;
  category: string;
  currency: string;
  type: string;
};

type UploadResult = {
  transactions?: Transaction[];
  transactionsCount?: number;
  error?: string;
};

type SourceType = "auto" | "bank_statement" | "bill_receipt" | "sms_screenshot" | "payment_confirmation";

const SOURCE_TYPES: Array<{ id: SourceType; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "bank_statement", label: "Statement" },
  { id: "bill_receipt", label: "Bill/Receipt" },
  { id: "sms_screenshot", label: "SMS" },
  { id: "payment_confirmation", label: "Payment" },
];

export default function TransactionsClient({
  initialTransactions,
  dbError,
  rates,
  baseCurrency,
  currencies,
  categories,
}: {
  initialTransactions: Transaction[];
  dbError: boolean;
  rates: Record<string, number>;
  baseCurrency: string;
  currencies: string[];
  categories: string[];
}) {
  // Extract Upload State
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>("auto");
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Edit / Delete State
  const [editingTx, setEditingTx] = useState<EditingTransaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add State
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const defaultCategory = categories[0] || "Uncategorized";
  const [newTxData, setNewTxData] = useState<NewTransactionForm>({ description: "", amount: "", category: defaultCategory, currency: baseCurrency, type: "DEBIT", date: new Date().toISOString().slice(0, 10) });

  const transactionCategories = categories.length > 0 ? categories : ["Uncategorized"];

  // Transactions list state (to prepend new ones)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Filter State
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCurrency, setFilterCurrency] = useState<string>("all");

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    const res = await deleteTransaction(id);
    if (res.success) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } else {
      alert("Failed to delete: " + res.error);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTx) return;
    setIsSaving(true);
    
    // Convert dates properly if needed, but here we just update basic fields
    const res = await updateTransaction(editingTx.id, {
      date: new Date(editingTx.date).toISOString().slice(0, 10),
      description: editingTx.description,
      amount: Number(editingTx.amount),
      category: editingTx.category,
      currency: editingTx.currency,
      type: editingTx.type,
    });

    if (res.success && res.transaction) {
      setTransactions(prev => prev.map(tx => tx.id === editingTx.id ? { ...tx, ...res.transaction } as Transaction : tx));
      setEditingTx(null);
    } else {
      alert("Failed to update: " + res.error);
    }
    setIsSaving(false);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const res = await createTransaction({
      description: newTxData.description,
      amount: Number(newTxData.amount),
      category: newTxData.category,
      currency: newTxData.currency,
      type: newTxData.type,
      date: newTxData.date,
    });
    if (res.success && res.transaction) {
      setTransactions(prev => [res.transaction as unknown as Transaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsAddingTx(false);
      setNewTxData({ description: "", amount: "", category: defaultCategory, currency: baseCurrency, type: "DEBIT", date: new Date().toISOString().slice(0, 10) });
    } else {
      alert("Failed to add transaction: " + res.error);
    }
    setIsCreating(false);
  };

  // Upload Handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (selectedFile: File | undefined) => {
    setUploadError(null);
    setUploadResult(null);
    if (!selectedFile) return;
    const isSupportedFile = selectedFile.type === "application/pdf" || selectedFile.type.startsWith("image/");
    if (!isSupportedFile) {
      setUploadError("Please upload a PDF or image file.");
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setUploadError("Please upload a file smaller than 20MB.");
      return;
    }
    setFile(selectedFile);
  };
  const uploadAndExtract = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceType", sourceType);

    try {
      const response = await fetch("/api/documents/extract", { method: "POST", body: formData });
      const data = await response.json() as UploadResult;
      if (!response.ok) throw new Error(data.error || "Failed to process document");
      
      setUploadResult(data);
      if (data.transactions) {
        const extractedTransactions = data.transactions;
        setTransactions(prev => [...extractedTransactions, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to process document");
    } finally {
      setIsUploading(false);
    }
  };

  // Processing Data for filtered view
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const dateStr = new Date(tx.date).toISOString().slice(0, 7); // YYYY-MM
      const typeMatch = filterType === "all" || tx.type === filterType;
      const monthMatch = filterMonth === "all" || dateStr === filterMonth;
      const currencyMatch = filterCurrency === "all" || tx.currency === filterCurrency;
      return typeMatch && monthMatch && currencyMatch;
    });
  }, [transactions, filterType, filterMonth, filterCurrency]);

  const uniqueMonths = useMemo(() => {
    const months = new Set(transactions.map(tx => new Date(tx.date).toISOString().slice(0, 7)));
    return Array.from(months).sort((a,b) => b.localeCompare(a));
  }, [transactions]);

  const toBaseAmount = (amount: number, currency: string) => {
    const rate = rates[currency];
    if (!currency || currency === baseCurrency || !rate) return amount;
    return amount / rate;
  };

  // Chart Data Preparation
  const categoryExpenses = useMemo(() => {
    const expenses = filteredTransactions.filter(tx => tx.type === "DEBIT");
    const grouped = expenses.reduce((acc, tx) => {
      const cat = tx.category || "Uncategorized";
      acc[cat] = Math.round(((acc[cat] || 0) + toBaseAmount(tx.amount, tx.currency)) * 100) / 100;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [filteredTransactions, rates, baseCurrency]);

  const currencyStats = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const cur = tx.currency || baseCurrency;
      if (!acc[cur]) acc[cur] = { in: 0, out: 0, cur };
      if (tx.type === "CREDIT") acc[cur].in = Math.round((acc[cur].in + tx.amount) * 100) / 100;
      else acc[cur].out = Math.round((acc[cur].out + tx.amount) * 100) / 100;
      return acc;
    }, {} as Record<string, {in: number, out: number, cur: string}>);
  }, [filteredTransactions]);

  return (
    <div className="flex flex-col gap-5 pb-8 w-full mx-auto animate-fade-in sm:gap-8 sm:pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Transactions</h1>
          <p className="text-zinc-500 mt-1">Review, categorize, and track your cash flow.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <button 
            onClick={() => setIsAddingTx(true)}
            className="justify-center px-3 py-2 bg-primary text-primary-foreground rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 sm:px-4"
          >
            <Plus className="w-4 h-4" /> Add Manual
          </button>
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className={clsx(
              "justify-center px-3 py-2 border rounded-xl transition-all text-sm font-medium flex items-center gap-2 sm:px-4",
              showUpload ? "bg-primary/20 border-primary text-primary" : "border-white/10 hover:bg-white/5"
            )}
          >
            <UploadCloud className="w-4 h-4" /> Extract Data
          </button>
        </div>
      </div>

      {/* Upload Section (Collapsible) */}
      {showUpload && (
        <div className="glass rounded-3xl border border-white/5 animate-slide-up flex flex-col items-center p-4 sm:p-8">
          <div className="mb-5 grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-5">
            {SOURCE_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSourceType(item.id)}
                className={clsx(
                  "rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                  sourceType === item.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div 
            className={clsx(
              "relative border-2 w-full max-w-2xl border-dashed rounded-3xl p-5 sm:p-8 flex flex-col items-center justify-center transition-all",
              isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/20 hover:bg-white/5",
              isUploading && "pointer-events-none opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf,image/*,.pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            <input
              type="file"
              ref={cameraInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            <div className="bg-primary/20 p-4 rounded-full mb-4 text-primary">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-medium text-foreground mb-1">
              {isDragActive ? "Drop your file here" : "Upload financial evidence"}
            </h3>
            <p className="max-w-md text-center text-sm text-zinc-500 mb-6">
              Bank statements, bills, receipts, invoices, payment confirmations, and SMS screenshots.
            </p>
            <p className="mb-6 text-center text-xs font-medium text-zinc-600">PDF or image, up to 20MB</p>

            {file && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-full max-w-sm mb-6 animate-fade-in">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{file.name}</span>
                  <span className="text-[10px] text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setUploadResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    if (cameraInputRef.current) cameraInputRef.current.value = "";
                  }}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-zinc-500 hover:bg-white/10 hover:text-white"
                >
                  Clear
                </button>
              </div>
            )}

            {file ? (
              <button 
                onClick={uploadAndExtract}
                disabled={isUploading}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>) : "Extract Transactions"}
              </button>
            ) : (
              <div className="grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Take Photo
                </button>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2.5 border border-white/10 bg-white/[0.03] text-foreground rounded-xl font-medium hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" /> Choose File
                </button>
              </div>
            )}
          </div>

          {uploadError && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 mt-6 max-w-2xl w-full flex items-start gap-3">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
               <div>
                 <h4 className="font-medium text-sm">Failed to extract document</h4>
                 <p className="text-xs opacity-80 mt-1">{uploadError}</p>
               </div>
             </div>
          )}

          {uploadResult && uploadResult.transactions && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl p-4 mt-6 max-w-2xl w-full flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <div className="text-sm font-medium">
                Successfully extracted {uploadResult.transactionsCount} transaction{uploadResult.transactionsCount === 1 ? "" : "s"} for review.
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Stats by Currency */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {Object.values(currencyStats).map((stat) => (
          <div key={stat.cur} className="glass p-5 rounded-3xl border border-white/5 flex flex-col">
             <div className="text-xs text-zinc-500 font-semibold mb-2">{stat.cur} Overview</div>
             <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{stat.cur} {(stat.in - stat.out).toFixed(2)}</span>
             </div>
             <div className="mt-4 grid grid-cols-2 gap-2 text-sm border-t border-white/5 pt-3">
               <div>
                  <div className="text-zinc-500 text-xs">In</div>
                  <div className="text-emerald-400 font-medium">{stat.in.toFixed(2)}</div>
               </div>
               <div>
                  <div className="text-zinc-500 text-xs">Out</div>
                  <div className="text-red-400 font-medium">{stat.out.toFixed(2)}</div>
               </div>
             </div>
          </div>
        ))}
        {Object.keys(currencyStats).length === 0 && (
          <div className="glass p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-zinc-500 text-sm">
            No stats available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
        {/* Charts Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass p-6 rounded-3xl border border-white/5 h-[350px]">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" /> Expenses Breakdown
            </h3>
            {categoryExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: '#18181b', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-zinc-500 text-sm">
                No expense data
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
               {categoryExpenses.slice(0, 4).map((entry, idx) => (
                 <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {entry.name}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Filters and Table Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass p-4 rounded-2xl border border-white/5 flex flex-wrap gap-3 items-center">
            <div className="text-sm font-medium text-zinc-400 flex items-center gap-2">
               <Filter className="w-4 h-4" /> Filters:
            </div>
            
            <select 
              value={filterMonth} 
              onChange={e => setFilterMonth(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-foreground focus:ring-primary focus:border-primary"
            >
              <option value="all">All Months</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{new Date(m + "-01").toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</option>
              ))}
            </select>

            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-foreground"
            >
              <option value="all">All Types</option>
              <option value="CREDIT">Incomes (Credit)</option>
              <option value="DEBIT">Expenses (Debit)</option>
            </select>

            <select 
              value={filterCurrency} 
              onChange={e => setFilterCurrency(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-foreground"
            >
              <option value="all">All Currencies</option>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div className="glass rounded-3xl overflow-hidden border border-white/5">
            <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full min-w-[760px] text-sm text-left">
                <thead className="text-xs uppercase sticky top-0 bg-zinc-900/90 backdrop-blur-md text-zinc-400 border-b border-white/5 z-10">
                  <tr>
                    <th className="px-6 py-4 font-medium flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                      Date <ArrowUpDown className="w-3 h-3" />
                    </th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-white transition-colors">
                      Amount <ArrowUpDown className="w-3 h-3" />
                    </th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dbError ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
                           <Banknote className="w-12 h-12 text-red-500/50 mb-4" />
                           <p className="text-red-400 font-medium text-lg">Database Error</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                           <Banknote className="w-12 h-12 text-zinc-700 mb-4" />
                           <p className="text-zinc-400 text-base">No transactions found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] group">
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium max-w-[200px] truncate text-white" title={tx.description}>
                          {tx.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-zinc-300 border border-white/10">
                            {tx.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            "px-2.5 py-1 rounded-md text-xs font-bold",
                            tx.type === "CREDIT" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                          )}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-white">
                          <div className="flex flex-col items-end">
                            <div>
                              <span className={clsx(
                                "mr-2 text-xs",
                                tx.currency === baseCurrency ? "text-zinc-400" : "text-blue-400"
                              )}>{tx.currency}</span>
                              {tx.amount.toFixed(2)}
                            </div>
                            {tx.currency !== baseCurrency && rates[tx.currency] && (
                              <div className="text-[10px] text-zinc-500 font-medium tracking-wide">
                                ≈ {baseCurrency} {(tx.amount / rates[tx.currency]).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setEditingTx(tx)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                               <Edit2 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDelete(tx.id)} className="p-1.5 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold mb-4">Edit Transaction</h3>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Date</label>
                <input 
                  type="date" 
                  value={new Date(editingTx.date).toISOString().slice(0, 10)} 
                  onChange={e => setEditingTx({...editingTx, date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <input 
                  type="text" 
                  value={editingTx.description} 
                  onChange={e => setEditingTx({...editingTx, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Amount</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editingTx.amount} 
                    onChange={e => setEditingTx({...editingTx, amount: e.target.value === "" ? "" : Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Currency</label>
                  <select 
                    value={editingTx.currency} 
                    onChange={e => setEditingTx({...editingTx, currency: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none uppercase"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Type</label>
                  <select 
                    value={editingTx.type} 
                    onChange={e => setEditingTx({...editingTx, type: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                  >
                    <option value="DEBIT">Debit (Expense)</option>
                    <option value="CREDIT">Credit (Income)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Category</label>
                  <select 
                    value={editingTx.category || ""} 
                    onChange={e => setEditingTx({...editingTx, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                  >
                    <option value={editingTx.category || ""}>{editingTx.category || "Select Category"}</option>
                    {transactionCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary"/> Add Transaction</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Date</label>
                <input 
                  type="date" 
                  value={newTxData.date} 
                  onChange={e => setNewTxData({...newTxData, date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <input 
                  type="text" 
                  value={newTxData.description} 
                  onChange={e => setNewTxData({...newTxData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                  placeholder="e.g. Grocery Store"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Amount</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newTxData.amount} 
                    onChange={e => setNewTxData({...newTxData, amount: e.target.value === "" ? "" : e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Currency</label>
                  <select 
                    value={newTxData.currency} 
                    onChange={e => setNewTxData({...newTxData, currency: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none uppercase"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Type</label>
                  <select 
                    value={newTxData.type} 
                    onChange={e => setNewTxData({...newTxData, type: e.target.value, category: defaultCategory})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                  >
                    <option value="DEBIT">Debit (Expense)</option>
                    <option value="CREDIT">Credit (Income)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Category</label>
                  <select 
                    value={newTxData.category} 
                    onChange={e => setNewTxData({...newTxData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                  >
                    {transactionCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddingTx(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
// Force hot reload clear
