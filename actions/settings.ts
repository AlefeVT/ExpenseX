'use server';

import * as z from 'zod';

import { update } from '@/auth';
import { SettingsSchema } from '@/schemas';
import { getUserByEmail, getUserById } from '@/data/user';
import { currentUser } from '@/lib/auth';
import { generateVerificationToken } from '@/lib/token';
import { sendVerificationEmail } from '@/lib/mail';
import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '@/utils/hash';

const db = new PrismaClient();

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: 'Não autorizado' };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: 'Não autorizado' };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: 'Email já em uso!' };
    }

    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: 'E-mail de verificação enviado!' };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await comparePassword(
      values.password,
      dbUser.password
    );

    if (!passwordsMatch) {
      return { error: 'Senha incorreta!' };
    }

    const hashedPassword = await hashPassword(values.newPassword);
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...values,
    },
  });

  update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      role: updatedUser.role,
    },
  });

  return { success: 'Configurações atualizadas!' };
};
