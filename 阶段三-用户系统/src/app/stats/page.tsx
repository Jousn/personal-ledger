import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数据统计",
};

export default function StatsPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
      <div className="text-4xl">📈</div>
      <h1 className="mt-4 text-xl font-bold">数据统计 · 建设中</h1>
      <p className="mt-2 text-sm text-slate-500">
        这里将在「阶段四」实现：月度收支趋势与分类占比图表。
      </p>
    </div>
  );
}
