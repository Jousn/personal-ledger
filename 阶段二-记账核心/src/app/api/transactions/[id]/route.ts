import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transactionUpdateSchema, toRecord } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/transactions/:id
export async function GET(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "id 不合法" }, { status: 400 });

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction)
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });

  return NextResponse.json({ transaction });
}

// PUT /api/transactions/:id
export async function PUT(request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "id 不合法" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const parsed = transactionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数不合法" },
      { status: 400 },
    );
  }

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });

  // 部分更新：把传入字段合并到现有记录后统一走 toRecord 规整
  const merged = toRecord({
    type: parsed.data.type ?? (existing.type as "EXPENSE" | "INCOME"),
    amount: parsed.data.amount ?? existing.amount,
    category: parsed.data.category ?? existing.category,
    note: parsed.data.note !== undefined ? parsed.data.note : existing.note,
    date:
      parsed.data.date ??
      existing.date.toISOString().slice(0, 10),
  });

  const transaction = await prisma.transaction.update({
    where: { id },
    data: merged,
  });
  return NextResponse.json({ transaction });
}

// DELETE /api/transactions/:id
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "id 不合法" }, { status: 400 });

  try {
    await prisma.transaction.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
