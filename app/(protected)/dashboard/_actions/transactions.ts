'use server';

import { currentUser } from '@/lib/auth';
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from '@/schemas/transaction';
import { PrismaClient } from '@prisma/client';

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);
  const prisma = new PrismaClient();

  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  const { amount, category, date, description, type } = parsedBody.data;
  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error('Categoria não encontrada.');
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
        description: description || '',
        type,
        date,
      },
    }),
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === 'despesa' ? amount : 0,
        income: type === 'renda' ? amount : 0,
      },
      update: {
        expense: {
          increment: type === 'despesa' ? amount : 0,
        },
        income: {
          increment: type === 'renda' ? amount : 0,
        },
      },
    }),
    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === 'despesa' ? amount : 0,
        income: type === 'renda' ? amount : 0,
      },
      update: {
        expense: {
          increment: type === 'despesa' ? amount : 0,
        },
        income: {
          increment: type === 'renda' ? amount : 0,
        },
      },
    }),
  ]);
}
