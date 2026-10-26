"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categoriesOf, type TxType } from "@/lib/constants";
import type { SerializedTransaction } from "@/lib/types";

interface Props {
  /** 传入则为编辑模式，否则为新增 */
  initial?: SerializedTransaction;
  onSaved?: () => void;
}

export default function TransactionForm({ initial, onSaved }: Props) {
  const router = useRouter();
  const [type, setType] = useState<TxType>(initial?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : "",
  );
  const [category, setCategory] = useState(initial?.category ?? "餐饮");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function switchType(next: TxType) {
    setType(next);
    // 分类跟随收支类型切换，避免出现「收入-餐饮」这类脏数据
    if (!categoriesOf(next).includes(category)) {
      setCategory(categoriesOf(next)[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("请输入大于 0 的金额");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        initial ? `/api/transactions/${initial.id}` : "/api/transactions",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            amount: value,
            category,
            note: note.trim() || null,
            date,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "保存失败，请稍后再试");
        return;
      }
      if (!initial) {
        setAmount("");
        setNote("");
      }
      router.refresh();
      onSaved?.();
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setSaving(false);
    }
  }

  const isIncome = type === "INCOME";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 收支切换 */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        {(["EXPENSE", "INCOME"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchType(t)}
            className={`rounded-md py-1.5 text-sm font-semibold transition ${
              type === t
                ? t === "INCOME"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "bg-white text-rose-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "INCOME" ? "收入" : "支出"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">
            金额（元）
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="99999999"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">
            日期
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-600">
          分类
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          {categoriesOf(type).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-600">
          备注（可选）
        </span>
        <input
          type="text"
          maxLength={100}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="比如：和同事的午餐"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 ${
          isIncome
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-rose-500 hover:bg-rose-600"
        }`}
      >
        {saving ? "保存中…" : initial ? "保存修改" : "记一笔"}
      </button>
    </form>
  );
}
