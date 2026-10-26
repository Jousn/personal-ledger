"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
    >
      {loading ? "退出中…" : "退出"}
    </button>
  );
}
