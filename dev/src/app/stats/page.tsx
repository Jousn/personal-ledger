import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth-guard";
import { categoryBreakdown, monthlyTrend } from "@/lib/stats";
import {
  MONTH_PATTERN,
  currentMonth,
  formatAmount,
  monthLabel,
} from "@/lib/constants";
import { CategoryPieChart, MonthlyTrendChart } from "@/components/Charts";

export const metadata: Metadata = {
  title: "数据统计",
};

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default function StatsPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-sm text-slate-400">加载中…</div>
      }
    >
      <StatsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function StatsContent({ searchParams }: PageProps) {
  const user = await currentUser();
  if (!user) redirect("/login?callbackUrl=/stats");

  const { month: rawMonth } = await searchParams;
  const month =
    rawMonth && MONTH_PATTERN.test(rawMonth) ? rawMonth : currentMonth();
  const [y, m] = month.split("-").map(Number);
  const range = {
    gte: new Date(Date.UTC(y, m - 1, 1)),
    lt: new Date(Date.UTC(y, m, 1)),
  };
  const uid = Number(user.id);

  const [trend, expenseByCategory, incomeByCategory, summary] =
    await Promise.all([
      monthlyTrend(uid, 6),
      categoryBreakdown(uid, month, "EXPENSE"),
      categoryBreakdown(uid, month, "INCOME"),
      prisma.transaction.groupBy({
        by: ["type"],
        _sum: { amount: true },
        where: { userId: uid, date: range },
      }),
    ]);

  const expense =
    summary.find((s) => s.type === "EXPENSE")?._sum.amount ?? 0;
  const income = summary.find((s) => s.type === "INCOME")?._sum.amount ?? 0;
  const balance = income - expense;

  const hasAnyData = trend.some((p) => p.income > 0 || p.expense > 0);
  const topCategory = expenseByCategory[0];

  return (
    <div className="space-y-6">
      {/* 月度汇总卡片 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">{monthLabel(month)} 收入</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-600">
            {formatAmount(income)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">{monthLabel(month)} 支出</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-rose-600">
            {formatAmount(expense)}
          </div>
          {topCategory && (
            <div className="mt-1 text-xs text-slate-400">
              最大开销：{topCategory.category}（{formatAmount(topCategory.amount)}）
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">{monthLabel(month)} 结余</div>
          <div
            className={`mt-1 text-2xl font-bold tabular-nums ${
              balance >= 0 ? "text-slate-900" : "text-rose-600"
            }`}
          >
            {balance >= 0 ? "" : "-"}
            {formatAmount(Math.abs(balance))}
          </div>
        </div>
      </section>

      {!hasAnyData ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <div className="text-4xl">📭</div>
          <p className="mt-4 text-sm text-slate-500">
            还没有任何账目数据，先去记几笔再看统计吧
          </p>
          <Link
            href="/transactions"
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            去记账
          </Link>
        </div>
      ) : (
        <>
          {/* 近6个月趋势 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold">近 6 个月收支趋势</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              绿色为收入、红色为支出
            </p>
            <div className="mt-4">
              <MonthlyTrendChart data={trend} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 支出分类占比 */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold">
                {monthLabel(month)} 支出分类
              </h2>
              {expenseByCategory.length === 0 ? (
                <p className="py-16 text-center text-sm text-slate-400">
                  本月暂无支出
                </p>
              ) : (
                <div className="mt-4">
                  <CategoryPieChart
                    data={expenseByCategory}
                    total={expense}
                  />
                </div>
              )}
            </section>

            {/* 分类明细排行 */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold">
                {monthLabel(month)} 分类排行
              </h2>
              {(expenseByCategory.length === 0 && incomeByCategory.length === 0) ? (
                <p className="py-16 text-center text-sm text-slate-400">
                  本月暂无记录
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {[
                    ...expenseByCategory.map((c) => ({ ...c, kind: "支出" })),
                    ...incomeByCategory.map((c) => ({ ...c, kind: "收入" })),
                  ].map((c) => {
                    const base = c.kind === "支出" ? expense : income;
                    const pct = base > 0 ? (c.amount / base) * 100 : 0;
                    return (
                      <li key={`${c.kind}-${c.category}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            <span
                              className={`mr-2 rounded px-1.5 py-0.5 text-xs ${
                                c.kind === "支出"
                                  ? "bg-rose-50 text-rose-500"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {c.kind}
                            </span>
                            {c.category}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatAmount(c.amount)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              c.kind === "支出" ? "bg-rose-400" : "bg-emerald-400"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
