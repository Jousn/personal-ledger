import { auth } from "@/auth";

/** 返回当前登录用户（含 id），未登录返回 null */
export async function currentUser(): Promise<{
  id: string;
  name?: string | null;
  email?: string | null;
} | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return { id: user.id, name: user.name, email: user.email };
}
