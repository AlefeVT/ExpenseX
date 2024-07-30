'use server';

import { currentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

export async function DeleteTransaction(id: string) {
  const prisma = new PrismaClient();
  const user = await currentUser();
  if (!user) {
    throw new Error(`Usuário não autenticado!`);
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });

  if (!transaction) {
    throw new Error(`Transação não encontrada!`);
  }

  await prisma.$transaction([
    prisma.transaction.delete({
      where: {
        id,
        userId: user.id,
      },
    }),
    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === 'despesa' && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === 'renda' && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
    prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === 'despesa' && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === 'renda' && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ]);
}
