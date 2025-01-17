'use server';

import * as z from 'zod';
import { RegisterSchema } from '@/schemas';
import { getUserByEmail } from '@/data/user';
import { generateVerificationToken } from '@/lib/token';
import { sendVerificationEmail } from '@/lib/mail';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/hash';

const db = new PrismaClient();

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await hashPassword(password);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: 'Email já em uso!' };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const domain = process.env.NEXT_PUBLIC_APP_URL;

  const verificationToken = await generateVerificationToken(email);
  const confirmLink = `${domain}/auth/new-verification?token=${verificationToken.token}`;

  return { success: 'Usuário registrado com sucesso!', confirmLink };
};
