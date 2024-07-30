import { currentUser } from '@/lib/auth';
import { OverviewQuerySchema } from '@/schemas/overview';
import { PrismaClient } from '@prisma/client';

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return new Error(`Usuário não autenticado!`);
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const queryParams = OverviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const stats = await getBalanceStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(stats);
}
export type GetBalanceStatsResponseType = Awaited<
  ReturnType<typeof getBalanceStats>
>;
async function getBalanceStats(userId: string, from: Date, to: Date) {
  const prisma = new PrismaClient();

  const totals = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    expense: totals.find((t) => t.type === 'despesa')?._sum.amount || 0,
    income: totals.find((t) => t.type === 'renda')?._sum.amount || 0,
  };
}
