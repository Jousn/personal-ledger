import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "注册",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">注册 · 随手记</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          创建账号，开始记录你的每一笔收支
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
