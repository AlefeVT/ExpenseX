import { currentUser } from '@/lib/auth';
import { OverviewQuerySchema } from '@/schemas/overview';
import { PrismaClient } from '@prisma/client';

export async function GET(request: Request): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return new Response('Usuário não autenticado!', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const queryParams = OverviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return new Response(queryParams.error.message, { status: 400 });
  }

  const stats = await getBalanceStats(
    user.id,
    new Date(queryParams.data.from),
    new Date(queryParams.data.to)
  );

  return new Response(JSON.stringify(stats), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Define and export the type for the response of getBalanceStats
export type GetBalanceStatsResponseType = {
  expense: number;
  income: number;
};

async function getBalanceStats(
  userId: string,
  from: Date,
  to: Date
): Promise<GetBalanceStatsResponseType> {
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
