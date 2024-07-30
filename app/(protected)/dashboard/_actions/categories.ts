'use server';

import { currentUser } from '@/lib/auth';
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
  DeleteCategorySchema,
  DeleteCategorySchemaType,
} from '@/schemas/categories';
import { PrismaClient } from '@prisma/client';

export async function CreateCategory(form: CreateCategorySchemaType) {
  const parsedBody = CreateCategorySchema.safeParse(form);
  const prisma = new PrismaClient();

  if (!parsedBody.success) {
    throw new Error('bad request');
  }

  const user = await currentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { name, icon, type } = parsedBody.data;
  return await prisma.category.create({
    data: {
      userId: user.id,
      name,
      icon,
      type,
    },
  });
}

export async function DeleteCategory(form: DeleteCategorySchemaType) {
  const parsedBody = DeleteCategorySchema.safeParse(form);
  const prisma = new PrismaClient();

  if (!parsedBody.success) {
    throw new Error('bad request');
  }

  const user = await currentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await prisma.category.delete({
    where: {
      name_userId_type: {
        userId: user.id,
        name: parsedBody.data.name,
        type: parsedBody.data.type,
      },
    },
  });
}
