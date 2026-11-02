'use client';

import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

// データの型定義
interface RevenueItem {
  category: string;
  revenue: number;
  expenses: number;
}

interface ChartState {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

export default function RevenueChart() {
  const [period, setPeriod] = useState<string>("1Y");
  const [chartState, setChartState] = useState<ChartState>({
    categories: [],
    series: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/revenue?period=${period}`)
      .then((res) => res.json())
      .then((data: RevenueItem[]) => {
        console.log("★APIデータ取得成功:", data); //[cite: 4] コンソール確認用

        if (Array.isArray(data) && data.length > 0) {
          const categories = data.map((item) => item.category);
          const revenue = data.map((item) => item.revenue);
          const expenses = data.map((item) => item.expenses);
          const profit = data.map((item) => item.revenue - item.expenses);

          setChartState({
            categories,
            series: [
              { name: "Revenue", data: revenue },
              { name: "Expenses", data: expenses },
              { name: "Profit", data: profit }
            ]
          });
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("★APIエラー:", err); //[cite: 4]
        setLoading(false);
      });
  }, [period]);

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      background: "transparent",
    },
    xaxis: {
      categories: chartState.categories, // 動的な配列[cite: 4]
    },
    theme: { mode: "dark" },
    colors: ["#38bdf8", "#f59e0b", "#10b981"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
  };

  return (
    <div className="card revenue-chart-card">
      <div className="card-header">
        <h2>Revenue Overview</h2>
        <div className="chart-period-selector">
          {(["7D", "30D", "90D", "1Y"] as const).map((item) => (
            <button
              key={item}
              id={`period-btn-${item}`}
              name="period-selector"
              className={period === item ? "period-btn active" : "period-btn"}
              onClick={() => setPeriod(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
          データを読み込み中...
        </div>
      ) : chartState.series.length > 0 ? (
        <Chart
          options={options}
          series={chartState.series}
          type="area"
          height={350}
        />
      ) : (
        <div style={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b" }}>
          データが存在しません
        </div>
      )}
    </div>
  );
}
