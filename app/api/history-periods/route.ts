import { currentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    throw new Error(`Usuário não autenticado!`);
  }

  const periods = await getHistoryPeriods(user.id);
  return Response.json(periods);
}

export type getHistoryPeriodsResponseType = Awaited<
  ReturnType<typeof getHistoryPeriods>
>;

async function getHistoryPeriods(userId: string) {
  const prisma = new PrismaClient();

  const result = await prisma.monthHistory.findMany({
    where: {
      userId,
    },
    select: {
      year: true,
    },
    distinct: ['year'],
    orderBy: [
      {
        year: 'asc',
      },
    ],
  });

  const years = result.map((el) => el.year);
  if (years.length == 0) {
    return [new Date().getFullYear()];
  }

  return years;
}
