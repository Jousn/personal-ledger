"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthPoint, CategorySlice } from "@/lib/stats";

const PIE_COLORS = [
  "#059669",
  "#10b981",
  "#34d399",
  "#6ee7b7",
  "#f43f5e",
  "#fb7185",
  "#fda4af",
  "#94a3b8",
];

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 12,
};

export function MonthlyTrendChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => Number(value ?? 0).toLocaleString("zh-CN")}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="收入" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="支出" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({
  data,
  total,
}: {
  data: CategorySlice[];
  total: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          label={(entry) => String(entry.name ?? "")}
        >
          {data.map((slice, i) => (
            <Cell
              key={slice.category}
              fill={PIE_COLORS[i % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => {
            const num = Number(value ?? 0);
            const pct = total > 0 ? ((num / total) * 100).toFixed(1) : "0";
            return [
              `${num.toLocaleString("zh-CN")}（${pct}%）`,
              String(name ?? ""),
            ];
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
