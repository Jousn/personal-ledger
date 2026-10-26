"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatAmount, formatDate } from "@/lib/constants";
import type { SerializedTransaction } from "@/lib/types";
import TransactionForm from "./TransactionForm";

export default function TransactionList({
  items,
}: {
  items: SerializedTransaction[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<SerializedTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!window.confirm("确定删除这条记录吗？")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
        本月还没有记录，从上方记第一笔吧
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {items.map((t) => {
          const isIncome = t.type === "INCOME";
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isIncome
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-500"
                }`}
              >
                {isIncome ? "收" : "支"}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t.category}</span>
                  {t.note && (
                    <span className="truncate text-sm text-slate-400">
                      {t.note}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {formatDate(t.date)}
                </div>
              </div>

              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${
                  isIncome ? "text-emerald-600" : "text-slate-800"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatAmount(t.amount)}
              </span>

              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setEditing(t)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="rounded-md px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                >
                  {deletingId === t.id ? "删除中" : "删除"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 编辑弹层 */}
      {editing && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold">编辑记录</h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>
            <TransactionForm initial={editing} onSaved={() => setEditing(null)} />
          </div>
        </div>
      )}
    </>
  );
}
