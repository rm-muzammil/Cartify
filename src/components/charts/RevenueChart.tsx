"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  month: string;
  revenue: number;
}

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-lg border border-slate-200">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(val) => `$${val}`}
          />
          {/* Fixed the Tooltip Formatter below */}
<Tooltip 
  formatter={(value: number | string | undefined) => {
    // 1. Handle the undefined case immediately
    if (value === undefined) return ["$0.00", "Revenue"];

    // 2. Safely parse and format
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return [`$${numValue.toFixed(2)}`, "Revenue"];
  }}
/>
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#6366f1' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}