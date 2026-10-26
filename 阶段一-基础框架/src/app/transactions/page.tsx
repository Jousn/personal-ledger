import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "记账明细",
};

export default function TransactionsPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
      <div className="text-4xl">🚧</div>
      <h1 className="mt-4 text-xl font-bold">记账明细 · 建设中</h1>
      <p className="mt-2 text-sm text-slate-500">
        这里将在「阶段二」实现：收支流水的录入、列表与增删改查。
      </p>
    </div>
  );
}
