import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: {
    default: "随手记 · 个人记账本",
    template: "%s | 随手记",
  },
  description: "一个基于 Next.js + TypeScript + Tailwind + Prisma 的全栈个人记账应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <NavBar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>
        </main>
        <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-400">
          随手记 · 个人记账本 — Next.js 全栈练手项目
        </footer>
      </body>
    </html>
  );
}
