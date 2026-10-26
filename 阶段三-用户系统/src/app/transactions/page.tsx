import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import {
  MONTH_PATTERN,
  currentMonth,
  formatAmount,
  monthLabel,
  nextMonth,
  prevMonth,
} from "@/lib/constants";
import type { SerializedTransaction } from "@/lib/types";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";

export const metadata: Metadata = {
  title: "记账明细",
};

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  return {
    gte: new Date(Date.UTC(y, m - 1, 1)),
    lt: new Date(Date.UTC(y, m, 1)),
  };
}

export default function TransactionsPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-sm text-slate-400">
          加载中…
        </div>
      }
    >
      <TransactionsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TransactionsContent({ searchParams }: PageProps) {
  // 服务端精确鉴权：中间件只做粗筛，这里兜底（伪造 Cookie 也拿不到数据）
  const user = await currentUser();
  if (!user) redirect("/login?callbackUrl=/transactions");

  const { month: rawMonth } = await searchParams;
  const month =
    rawMonth && MONTH_PATTERN.test(rawMonth) ? rawMonth : currentMonth();
  const range = monthRange(month);

  const [rows, summary] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: Number(user.id), date: range },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { userId: Number(user.id), date: range },
    }),
  ]);

  const items: SerializedTransaction[] = rows.map((t) => ({
    id: t.id,
    type: t.type as SerializedTransaction["type"],
    amount: t.amount,
    category: t.category,
    note: t.note,
    date: t.date.toISOString().slice(0, 10),
  }));

  const expense = summary.find((s) => s.type === "EXPENSE")?._sum.amount ?? 0;
  const income = summary.find((s) => s.type === "INCOME")?._sum.amount ?? 0;
  const balance = income - expense;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 左列：汇总 + 录入表单 */}
      <div className="space-y-6 lg:col-span-1">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500">
              {monthLabel(month)} 结余
            </h2>
            <span className="text-xs text-slate-400">{items.length} 笔</span>
          </div>
          <p
            className={`mt-1 text-3xl font-bold tabular-nums ${
              balance >= 0 ? "text-slate-900" : "text-rose-600"
            }`}
          >
            {balance >= 0 ? "" : "-"}
            {formatAmount(Math.abs(balance))}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-emerald-50 px-3 py-2">
              <div className="text-xs text-emerald-600">收入</div>
              <div className="font-bold tabular-nums text-emerald-700">
                {formatAmount(income)}
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 px-3 py-2">
              <div className="text-xs text-rose-500">支出</div>
              <div className="font-bold tabular-nums text-rose-600">
                {formatAmount(expense)}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold">记一笔</h2>
          <TransactionForm />
        </section>
      </div>

      {/* 右列：月份切换 + 流水列表 */}
      <div className="space-y-4 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Link
              href={`/transactions?month=${prevMonth(month)}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              ← 上月
            </Link>
            <span className="px-2 text-sm font-bold">{monthLabel(month)}</span>
            <Link
              href={`/transactions?month=${nextMonth(month)}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              下月 →
            </Link>
          </div>
          <form
            method="GET"
            action="/transactions"
            className="flex items-center gap-2"
          >
            <input
              type="month"
              name="month"
              defaultValue={month}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              跳转
            </button>
          </form>
        </div>

        <TransactionList items={items} />
      </div>
    </div>
  );
}
