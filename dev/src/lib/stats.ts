import { prisma } from "./prisma";
import { currentMonth, prevMonth } from "./constants";

export interface MonthPoint {
  month: string; // YYYY-MM
  label: string; // M月
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySlice {
  category: string;
  amount: number;
}

/** 近 N 个月的收支趋势（含当月）。个人账本量级小，直接拉记录在内存聚合 */
export async function monthlyTrend(
  userId: number,
  months = 6,
): Promise<MonthPoint[]> {
  const labels: string[] = [];
  let m = currentMonth();
  for (let i = 0; i < months; i++) {
    labels.unshift(m);
    m = prevMonth(m);
  }

  const first = labels[0];
  const [fy, fm] = first.split("-").map(Number);
  const since = new Date(Date.UTC(fy, fm - 1, 1));

  const rows = await prisma.transaction.findMany({
    where: { userId, date: { gte: since } },
    select: { type: true, amount: true, date: true },
  });

  const points: MonthPoint[] = labels.map((month) => ({
    month,
    label: `${Number(month.split("-")[1])}月`,
    income: 0,
    expense: 0,
    balance: 0,
  }));
  const index = new Map(points.map((p) => [p.month, p]));

  for (const row of rows) {
    const key = row.date.toISOString().slice(0, 7);
    const point = index.get(key);
    if (!point) continue;
    if (row.type === "INCOME") point.income += row.amount;
    else point.expense += row.amount;
  }
  for (const p of points) {
    p.income = Math.round(p.income * 100) / 100;
    p.expense = Math.round(p.expense * 100) / 100;
    p.balance = Math.round((p.income - p.expense) * 100) / 100;
  }
  return points;
}

/** 指定月份某类收支的分类构成，按金额降序 */
export async function categoryBreakdown(
  userId: number,
  month: string,
  type: "EXPENSE" | "INCOME" = "EXPENSE",
): Promise<CategorySlice[]> {
  const [y, m] = month.split("-").map(Number);
  const grouped = await prisma.transaction.groupBy({
    by: ["category"],
    _sum: { amount: true },
    where: {
      userId,
      type,
      date: {
        gte: new Date(Date.UTC(y, m - 1, 1)),
        lt: new Date(Date.UTC(y, m, 1)),
      },
    },
  });

  return grouped
    .map((g) => ({
      category: g.category,
      amount: Math.round((g._sum.amount ?? 0) * 100) / 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}
