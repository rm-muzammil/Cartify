"use client";

import { useEffect, useState } from "react";
import RevenueChart from "@/components/charts/RevenueChart";

export default function AnalyticsPage({ storeId }: { storeId: string }) {
  const [data, setData] = useState<any>(null);
  const [stats,setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/revenue?storeId=${storeId}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
      fetch(`/api/analytics/advanced?storeId=${storeId}`).then(res =>res.json()).then(d =>{
        setStats(d)
      })
  }, [storeId]);

  if (loading) return <p>Loading analytics...</p>;
  if (!data) return <p>No analytics data found</p>;

  const { totalRevenue, revenueByMonth, orderCounts } = data;


  const chartData = revenueByMonth.map((r: any) => ({
    month: new Date(r.createdAt).toLocaleString("default", { month: "short", year: "numeric" }),
    revenue: r._sum.total || 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">Revenue Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card text-center">
          <span className="text-gray-500 block mb-2">Total Revenue</span>
          <span className="text-2xl font-bold">${totalRevenue || 0}</span>
        </div>

        <div className="card text-center">
          <span className="text-gray-500 block mb-2">Orders Pending</span>
          <span className="text-2xl font-bold">{orderCounts.pending || 0}</span>
        </div>

        <div className="card text-center">
          <span className="text-gray-500 block mb-2">Orders Paid</span>
          <span className="text-2xl font-bold">{orderCounts.paid || 0}</span>
        </div>
      </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="card text-center">
    <span className="text-gray-500 block mb-2">Total Orders</span>
    <span className="text-2xl font-bold">{stats.totalOrders}</span>
  </div>

  <div className="card text-center">
    <span className="text-gray-500 block mb-2">Average Order Value (AOV)</span>
    <span className="text-2xl font-bold">${stats.aov}</span>
  </div>

  <div className="card text-center">
    <span className="text-gray-500 block mb-2">Churn Rate</span>
    <span className="text-2xl font-bold">{stats.churnRate}%</span>
  </div>

  <div className="card text-center">
    <span className="text-gray-500 block mb-2">Refunded Orders</span>
    <span className="text-2xl font-bold">{stats.refundedOrders}</span>
  </div>
</div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue Trend</h2>
        <RevenueChart data={chartData} />
      </div>


    </div>
  );
}
