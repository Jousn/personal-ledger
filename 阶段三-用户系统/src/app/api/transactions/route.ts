import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transactionCreateSchema, toRecord } from "@/lib/validation";
import { MONTH_PATTERN } from "@/lib/constants";
import { currentUser } from "@/lib/auth-guard";

// GET /api/transactions?month=2026-10&type=EXPENSE
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const type = searchParams.get("type");

  const where: {
    userId: number;
    date?: { gte: Date; lt: Date };
    type?: string;
  } = { userId: Number(user.id) };

  if (month) {
    if (!MONTH_PATTERN.test(month)) {
      return NextResponse.json(
        { error: "month 参数格式应为 YYYY-MM" },
        { status: 400 },
      );
    }
    const [y, m] = month.split("-").map(Number);
    where.date = {
      gte: new Date(Date.UTC(y, m - 1, 1)),
      lt: new Date(Date.UTC(y, m, 1)),
    };
  }
  if (type === "EXPENSE" || type === "INCOME") where.type = type;

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });

  return NextResponse.json({ transactions });
}

// POST /api/transactions
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const parsed = transactionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数不合法" },
      { status: 400 },
    );
  }

  const transaction = await prisma.transaction.create({
    data: { ...toRecord(parsed.data), userId: Number(user.id) },
  });
  return NextResponse.json({ transaction }, { status: 201 });
}
