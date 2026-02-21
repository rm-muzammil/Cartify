"use client";

import { useEffect, useState, use } from "react"; // Added 'use'
import UserGrowthChart from "@/components/charts/UserGrowthChart";

interface ChartData {
  date: string;
  count: number;
}

// 1. REMOVED 'async'. In Client Components, params is unwrapped using 'use()'
export default function AnalyticsPage({ params }: { params: Promise<{ storeId: string }> }) {
  // 2. Unwrap the params promise using React.use()
  const { storeId } = use(params);

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [advancedData, setAdvancedData] = useState<any>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [revRes, advRes] = await Promise.all([
          fetch(`/api/analytics/revenue?storeId=${storeId}`),
          fetch(`/api/analytics/advanced?storeId=${storeId}`),
        ]);
        const revenue = await revRes.json();
        const advanced = await advRes.json();

        setRevenueData(revenue);
        setAdvancedData(advanced);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAnalytics();
  }, [storeId]);

  if (loading || !advancedData || !revenueData) return <p className="p-6 text-center">Loading analytics...</p>;

  // 3. Transformation logic remains the same
const chartData: ChartData[] = advancedData?.usersByDay?.map((u: any) => ({
  date: new Date(u.createdAt).toLocaleDateString(),
  count: u._count?.id ?? 0, // fallback in case _count.id is undefined
})) || [];

  const totalDays = chartData.length;
  const growthRate =
    totalDays > 1 && chartData[0].count !== 0
      ? (((chartData[totalDays - 1].count - chartData[0].count) /
          chartData[0].count) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-xl shadow-sm text-center">
          <span className="text-gray-500 block mb-2">Total Users</span>
          <span className="text-2xl font-bold">{advancedData.totalUsers}</span>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm text-center">
          <span className="text-gray-500 block mb-2">Total Orders</span>
          <span className="text-2xl font-bold">{revenueData.totalOrders}</span>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm text-center">
          <span className="text-gray-500 block mb-2">Growth Rate</span>
          <span className="text-2xl font-bold text-green-600">{growthRate}% 📈</span>
        </div>
      </div>

      <div className="p-6 bg-white border rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">User Growth Over Time</h2>
        {chartData.length > 0 ? (
  <UserGrowthChart data={chartData} />
) : (
  <p>No user growth data available</p>
)}
      </div>
    </div>
  );
}