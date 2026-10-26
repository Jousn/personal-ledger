import { z } from "zod";
import { TX_TYPES } from "./constants";

export const transactionCreateSchema = z.object({
  type: z.enum(TX_TYPES),
  amount: z
    .number({ message: "金额必须是数字" })
    .positive("金额必须大于 0")
    .max(99_999_999, "金额过大"),
  category: z.string().trim().min(1, "请选择分类").max(20, "分类过长"),
  note: z.string().trim().max(100, "备注最多 100 字").optional().nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD"),
});

export const transactionUpdateSchema = transactionCreateSchema.partial();

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;

/** 将请求体解析为可写库的记录（金额保留两位小数，日期转 UTC 零点） */
export function toRecord(input: TransactionCreateInput) {
  return {
    ...input,
    note: input.note || null,
    amount: Math.round(input.amount * 100) / 100,
    date: new Date(`${input.date}T00:00:00.000Z`),
  };
}
