'use server';

import { currentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TransactionData {
  date: string;
  category: string;
  title: string;
  amount: string;
}

export async function addTransactionsFromCSV(transactions: TransactionData[]) {
  const user = await currentUser();
  if (!user) {
    throw new Error('Usuário não autenticado!');
  }

  for (const transaction of transactions) {
    try {
      await processTransaction(transaction, user.id);
    } catch (error) {
      console.error(`Erro ao processar transação: ${transaction.title}`, error);
    }
  }
}

async function processTransaction(
  transaction: TransactionData,
  userId: string
) {
  const { date, category, title, amount } = transaction;

  const amountFloat = parseAmount(amount);
  if (amountFloat === null) {
    throw new Error(`Valor de amount inválido: ${amount}`);
  }

  const parsedDate = parseDate(date);
  if (parsedDate === null) {
    throw new Error(`Data inválida: ${date}`);
  }

  if (!title) {
    throw new Error('Título da transação está indefinido ou vazio.');
  }

  const transactionType = amountFloat < 0 ? 'renda' : 'despesa';
  const absoluteAmount = Math.abs(amountFloat);

  const categoryRecord = await findOrCreateCategory(
    category,
    userId,
    transactionType
  );

  await prisma.transaction.create({
    data: {
      amount: absoluteAmount,
      description: title,
      date: parsedDate,
      userId,
      type: transactionType,
      category: categoryRecord.name,
      categoryIcon: categoryRecord.icon,
    },
  });

  await updateHistory(parsedDate, userId, absoluteAmount, transactionType);
}

function parseAmount(amount: string): number | null {
  const amountFloat = parseFloat(amount);
  return isNaN(amountFloat) ? null : parseFloat(amountFloat.toFixed(2));
}

function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

async function findOrCreateCategory(
  name: string,
  userId: string,
  type: string
) {
  let category = await prisma.category.findFirst({
    where: {
      name,
      userId,
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name,
        userId,
        icon: '', // Defina um ícone padrão ou permita que o usuário escolha
        type,
      },
    });
  }

  return category;
}

async function updateHistory(
  date: Date,
  userId: string,
  amount: number,
  transactionType: string
) {
  const incrementField = transactionType === 'despesa' ? 'expense' : 'income';

  await prisma.monthHistory.upsert({
    where: {
      day_month_year_userId: {
        userId,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
      },
    },
    update: {
      [incrementField]: {
        increment: amount,
      },
    },
    create: {
      userId,
      day: date.getUTCDate(),
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      income: transactionType === 'renda' ? amount : 0,
      expense: transactionType === 'despesa' ? amount : 0,
    },
  });

  await prisma.yearHistory.upsert({
    where: {
      month_year_userId: {
        userId,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
      },
    },
    update: {
      [incrementField]: {
        increment: amount,
      },
    },
    create: {
      userId,
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      income: transactionType === 'renda' ? amount : 0,
      expense: transactionType === 'despesa' ? amount : 0,
    },
  });
}
