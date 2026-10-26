import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "登录",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">登录 · 随手记</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          登录后查看和管理你的账本
        </p>
        <Suspense fallback={<div className="py-12 text-center text-sm text-slate-400">加载中…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
