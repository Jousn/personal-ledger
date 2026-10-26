export const TX_TYPES = ["EXPENSE", "INCOME"] as const;
export type TxType = (typeof TX_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  "餐饮",
  "交通",
  "购物",
  "居住",
  "娱乐",
  "医疗",
  "学习",
  "其他支出",
] as const;

export const INCOME_CATEGORIES = [
  "工资",
  "奖金",
  "理财",
  "兼职",
  "红包",
  "其他收入",
] as const;

export function categoriesOf(type: TxType): readonly string[] {
  return type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** ISO 日期串（YYYY-MM-DD）—— 全项目统一用它展示 date 字段，避免时区偏移 */
export function formatDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

/** 当前月份（YYYY-MM） */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function prevMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return d.toISOString().slice(0, 7);
}

export function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  return d.toISOString().slice(0, 7);
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${y}年${m}月`;
}

export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
