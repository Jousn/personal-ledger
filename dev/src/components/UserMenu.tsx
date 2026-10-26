import Link from "next/link";
import { currentUser } from "@/lib/auth-guard";
import LogoutButton from "./LogoutButton";

/** 导航右侧用户区：未登录显示入口，已登录显示昵称与退出 */
export default async function UserMenu() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/login"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-28 truncate rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
        {user.name ?? "我"}
      </span>
      <LogoutButton />
    </div>
  );
}
