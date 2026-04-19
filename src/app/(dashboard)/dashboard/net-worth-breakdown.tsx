"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function NetWorthBreakdown({ assets, debts }: { assets: number, debts: number }) {
  const data = [
    { name: "Assets", value: assets },
    { name: "Debts", value: debts }
  ];

  const total = assets + debts;
  if (total === 0) return <div className="text-sm text-zinc-500">No data</div>;

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={40}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              <Cell fill="#3b82f6" /> {/* Assets */}
              <Cell fill="#ef4444" /> {/* Debts */}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', background: '#18181b', border: '1px solid rgba(255,255,255,0.1)' }}
              itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
              formatter={(value: any) => `RM ${(value).toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2 flex-1">
         <div className="flex items-center justify-between text-xs">
           <div className="flex items-center gap-1.5 text-zinc-300">
             <div className="w-2 h-2 rounded-full bg-blue-500" /> Assets
           </div>
           <span className="font-medium text-white">{((assets / total) * 100).toFixed(1)}%</span>
         </div>
         <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500" style={{ width: `${(assets / total) * 100}%` }} />
         </div>
         
         <div className="flex items-center justify-between text-xs mt-1">
           <div className="flex items-center gap-1.5 text-zinc-300">
             <div className="w-2 h-2 rounded-full bg-red-500" /> Debts
           </div>
           <span className="font-medium text-white">{((debts / total) * 100).toFixed(1)}%</span>
         </div>
         <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-red-500" style={{ width: `${(debts / total) * 100}%` }} />
         </div>
      </div>
    </div>
  );
}
