import { PrismaClient } from "@prisma/client";

// 开发环境热重载会重复创建连接，用全局单例避免耗尽数据库句柄
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
